//// INITIALIZE FIREBASE

var config = {
    apiKey: "AIzaSyABIt9nahLYOw9L0fIZkFWSMGaf4p5gMlI",
    authDomain: "epl-sandbox.firebaseapp.com",
    databaseURL: "https://epl-sandbox.firebaseio.com/",
    storageBucket: "epl-sandbox"
};

firebase.initializeApp(config);

var database = firebase.database();

/// THIS WILL HELP US GET THE KEYS AND VALUES OF EACH USER
var usersRef = database.ref().child("users");

// OUR GAME OBJECT, WHERE WE STORE INFORMATION FROM THE USER
// THIS INFORMATION WILL LATER BE PUSHED INTO FIREBASE
var game = {
    email:"",
    name:"",
    teamName:"",
    userKeyNode:"",
    currentUserUid:""

};

///////// DOMINGO'S CODE //////////

var GWArray = ["04/19/2017", "04/23/2017", "04/25/2017", "04/30/2017"];

currentDate = moment().format('LT');
currentTime = moment().format('l');

//console.log(currentDate);

var displayTeams = function(teamHolder, index) {
    newLabel = $("<label>");
    newLabel.addClass("radio-inline");
    newLabel.html(teamHolder);
    newInput = $("<input>");
    newInput.attr("type", "radio");
    newInput.attr("name", "optradio");
    newInput.attr("value", teamHolder);
    newInput.attr("name", index);

    newLabel.prepend(newInput);
    newDiv.append(newLabel);
}

var x = 0;
var convertedDate = moment(new Date(GWArray[x]));

while (moment(convertedDate).diff(moment(), "days") <= 0) {
    x += 2;
    convertedDate = moment(new Date(GWArray[x]));
}

var gameWeek = 34 + (x/2);
var startTime;
var deadLine = false;
var selectedTeams = [];

var incompleteSelection = false;

///////// DOMINGO'S CODE //////////

// THIS FUNCTION CREATES A TABLE WITH THE PICK OPTIONS FOR NEXT MATCHDAY
var makePicksTable = function() {
console.log("makePicksTable");
    $("#picksContainer").empty();

///////// DOMINGO'S CODE //////////
    $.ajax({
        headers: {'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d'},
        url: 'https://api.football-data.org/v1/competitions/426/fixtures',
        dataType: 'json',
        type: 'GET'
    }).done(function (response) {
        // console.log(response);
        var matchHolder = [];
        newForm = $("<form>");
        newForm.addClass("mainForm");
        newForm.attr("name", "formSelection");
        var index = 0;
        for (var i = 0; i < response.fixtures.length; i++) {
            if (response.fixtures[i].matchday === gameWeek && response.fixtures[i].status === "TIMED") {

                matchHolder.push(i);

                //Output
                newDiv = $("<div>");

                //var indexHome = response.fixtures[matchHolder[matchHolder.length - 1]].homeTeamName;

                displayTeams(response.fixtures[matchHolder[matchHolder.length - 1]].homeTeamName, index);
                displayTeams("DRAW", index);
                displayTeams(response.fixtures[matchHolder[matchHolder.length - 1]].awayTeamName, index);

                selectedTeams.push(matchHolder.length - 1);
                index++;

                newForm.append(newDiv);
            }
        }

        $("#picksContainer").append(newForm);

        startTime = moment(new Date(response.fixtures[matchHolder[0]].date));
        // startTime = moment(new Date("04/22/2017 05:33 PM"));

        //console.log(response.fixtures[matchHolder[0]].date);
        //console.log(startTime);

        timeDiff = moment(startTime).diff(moment(), "hours");

        console.log(timeDiff);

        if (timeDiff < 2) {
            deadLine = true;
            console.log(deadLine);
        }
        else {
            $("#picksContainer").prepend("Time remaining: " + timeDiff + " hours");
            deadLine = false;
        }
    });
///////// DOMINGO'S CODE //////////
};


///// USER REGISTRATION LOGIC

var showSignUpBox = function() {

    // FIRST WE CREATE THE SIGN UP PAGE/HOMEPAGE
    $("#logInPage").css("display","none");
    $("#profilePage").css("display","none");
    $("#homepage").css("display","block");

};


///// USER LOG IN LOGIC

var showLoginBox = function() {
    // FIRST, CREATE THE LOG IN FORM/PAGE
    $("#homepage").css("display","none");
    $("#profilePage").css("display","none");
    $("#logInPage").css("display","block");

    // ACTION TAKEN WHEN CLICKING ON THE LOG IN BUTTON

};


// START THE PROGRAM BY CHECKING IF THERE IS A USER ALREADY LOGGED IN
showSignUpBox();
///// USER PROFILE LOGIC (ONCE THE USER IS LOGGED IN)
// IF THERE IS A USER LOGGED IN, TAKE HIM TO HIS PROFILE
// IF THERE IS NO ONE LOGGED IN, JUST SHOW THE HOMEPAGE
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var currentUser = firebase.auth().currentUser;
        game.currentUserUid = currentUser.uid;

        database.ref().orderByKey().equalTo(game.currentUserUid).once("value",function(snapshot){

            snapshot.forEach(function (childSnapshot) {

                var keyId = childSnapshot.val();
                console.log(keyId);
                game.email = keyId.email;
                game.name = keyId.name;
                game.teamName = keyId.teamName;
                $("#welcome").text("Hello " + keyId.name + "!!");
            });

                $("#homepage").css("display", "none");
                $("#logInPage").css("display", "none");
                $("#profilePage").css("display", "block");
                selectedTeams = [];
                makePicksTable();

        });
        console.log("I'm being checked");
    } else {
        showSignUpBox();
        // No user is signed in.
    }
});


// WHAT HAPPENS WHEN A USER LOGS OUT
$(document).on("click", "#logOut", function (event) {

    event.preventDefault();
    // var userLoggedOut = false;
    firebase.auth().signOut().then(function () {
        game.email = "",
        game.name = "",
        game.teamName = "",
        game.currentUserUid = ""// Sign-out successful.
    }).catch(function (error) {
        console.log(error.code);// An error happened.
        console.log(error.message);// An error happened.
    });



});


// WHAT HAPPENS WHEN THE USER LOGS IN
$(document).on("click","#logIn",function(event) {

    event.preventDefault();

    firebase.auth().signInWithEmailAndPassword($("#emailLogIn").val(), $("#pwdLogIn").val()).then(function(){

    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });

});

// WHAT HAPPENS WHEN THE USER REGISTERS

$(document).on("click","#signUp", function(event) {

    event.preventDefault();

    // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
    game.email = $("#email").val();
    game.name = $("#name").val();
    game.teamName = $("#teamName").val();

    firebase.auth().createUserWithEmailAndPassword(game.email, $("#pwd").val()).then(function(){
        // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
        // EACH NODE'S KEY WILL BE THEIR REGISTRATION KEY.
        // THIS ALLOWS US TO NOT HAVE TO LOOP THROUGH THE OBJECTS, WE JUST DO A SIMPLE QUERY
        // FOR THE USER'S NUMBER
        var currentUser = firebase.auth().currentUser;
        game.currentUserUid = currentUser.uid;
        database.ref().child(game.currentUserUid).set({

            email: game.email,
            name: game.name,
            teamName: game.teamName,
            userUid: game.currentUserUid

        });

    }).catch(function(error) {

        // HANDLE ERRORS HERE. COULD USE MODALS.
        console.log(error.code);
        console.log(error.message);
        $("#email").val("");
        $("#pwd").val("");
        $("#name").val("");
        $("#teamName").val("");

    });


});

// WHAT HAPPENS WHEN THE USER WANTS TO GO TO THE LOG IN AREA
// TAKE THE USER  TO THE LOG IN PAGE

$(document).on("click","#goToLogIn", function(event) {
    event.preventDefault();
    showLoginBox();
});




$(document).on("click",".game1",function(){

    $(".game1").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game2",function(){

    $(".game2").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game3",function(){

    $(".game3").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game4",function(){

    $(".game4").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game5",function(){

    $(".game5").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game6",function(){

    $(".game6").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game7",function(){

    $(".game7").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game8",function(){

    $(".game8").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game9",function(){

    $(".game9").prop("checked",false);
    $(this).prop("checked",true);
});

$(document).on("click",".game10",function(){

    $(".game10").prop("checked",false);
    $(this).prop("checked",true);
});

$("#submitPicks").on("click",function(event){

    event.preventDefault();

////// DOMINGO'S CODE //////
    for (var r = 0; r < (selectedTeams.length); r++) {
        selectedTeams[r] = ($("input[name='"+ r + "']:checked").val());
        if (selectedTeams[r] === undefined) {
            alert("undefined bruh");
            incompleteSelection = true;
            break;
        }
    }
    console.log(selectedTeams);
////// DOMINGO'S CODE //////

    database.ref().child(game.currentUserUid).update({

        email: game.email,
        name: game.name,
        teamName: game.teamName,
        picks: selectedTeams

    });
});


// IGNORE THE STUFF BELOW FOR NOW, ITS STILL ON THE WORKS

// A FUNCTION TO DETERMINE HOW MANY POINTS A USER HAS MADE THROUGH GETTING RIGHT GUESSES

// var getPoints = function(){
//
//     var homeTeam1 = $(".game1").attr("class","homeTeam");
//     var awayTeam1 = $(".game1").attr("class","awayTeam");
//
//     var homeTeam2 = $(".game2").attr("class","homeTeam");
//     var awayTeam2 = $(".game2").attr("class","awayTeam");
//
//     var homeTeam3 = $(".game3").attr("class","homeTeam");
//     var awayTeam3 = $(".game3").attr("class","awayTeam");
//
//     var homeTeam4 = $(".game4").attr("class","homeTeam");
//     var awayTeam4 = $(".game4").attr("class","awayTeam");
//
//     var homeTeam5 = $(".game5").attr("class","homeTeam");
//     var awayTeam5 = $(".game5").attr("class","awayTeam");
//
//     var homeTeam6 = $(".game6").attr("class","homeTeam");
//     var awayTeam6 = $(".game6").attr("class","awayTeam");
//
//     var homeTeam7 = $(".game7").attr("class","homeTeam");
//     var awayTeam7 = $(".game7").attr("class","awayTeam");
//
//     var homeTeam8 = $(".game8").attr("class","homeTeam");
//     var awayTeam8 = $(".game8").attr("class","awayTeam");
//
//     var homeTeam9 = $(".game9").attr("class","homeTeam");
//     var awayTeam9 = $(".game9").attr("class","awayTeam");
//
//     var homeTeam10 = $(".game10").attr("class","homeTeam");
//     var awayTeam10 = $(".game10").attr("class","awayTeam");
//
//     if(homeTeam1.attr("value") > awayTeam1.attr("value")){
//
//     }
// };

// CREATING A RANKING TABLE WITH ALL THE USERS

// var createRankingTable = function(){
//     usersRef.on("child_added",function(snapshot){
//         var row = $("<tr>");
//         var week = $("<td>");
//         var ranking = $("<td>");
//         var team_name = $("<td>");
//         var teamOwner = $("<td>");
//         var gamesPlayed = $("<td>");
//         var won = $("<td>");
//         var lost = $("<td>");
//         var points = $("<td>");
//         var totalPoints = $("<td>");
//
//         week.html(snapshot.val().week);
//         ranking.html(snapshot.val().ranking);
//         team_name.html(snapshot.val().team_name);
//         teamOwner.html(snapshot.val().teamOwner);
//         gamesPlayed.html(snapshot.val().gamesPlayed);
//         won.html(snapshot.val().won);
//         lost.html(snapshot.val().lost);
//         points.html(snapshot.val().points);
//         totalPoints.html(snapshot.val().totalPoints);
//
//         row.append(week);
//         row.append(ranking);
//         row.append(team_name);
//         row.append(teamOwner);
//         row.append(gamesPlayed);
//         row.append(won);
//         row.append(lost);
//         row.append(points);
//         row.append(totalPoints);
//
//         $(".rankings").append(row)
//     });
// }


