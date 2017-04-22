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

var nextMatchday;

// THIS FUNCTION CREATES A TABLE WITH THE PICK OPTIONS FOR NEXT MATCHDAY
var makePicksTable = function() {

    $("#picksContainer").empty();
    $("#tablePicks").empty();

    var tablePicks = $("<table>");
    tablePicks.attr("id","tablePicks");
    var rowTitle = $("<tr>");
    var headerHome = $("<th>");
    var headerDraw = $("<th>");
    var headerAway = $("<th>");
    headerHome.text("Home Team");
    headerDraw.text("Draw");
    headerAway.text("Away Team");
    rowTitle.append(headerHome);
    rowTitle.append(headerDraw);
    rowTitle.append(headerAway);
    tablePicks.append(rowTitle);
    $("#picksContainer").html(tablePicks);

    $.ajax({
        headers: {'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d'},
        url: 'https://api.football-data.org/v1/competitions/426/fixtures',
        dataType: 'json',
        type: 'GET'
    }).done(function (response) {
        var gameCounter = 1;

        for (var i = 0; i < response.fixtures.length; i++) {
            if (response.fixtures[i].matchday === 34 && response.fixtures[i].status === "TIMED") {


                var row = $("<tr>");
                var home = $("<td>");
                var draw = $("<td>");
                var away = $("<td>");


                var buttonHome = $("<input type='radio'>");
                buttonHome.attr("value", response.fixtures[i].result.goalsHomeTeam);
                buttonHome.addClass("homeTeam");
                buttonHome.addClass("game" + gameCounter);

                var buttonAway = $("<input type='radio'>");
                buttonAway.attr("value", response.fixtures[i].result.goalsAwayTeam);
                buttonAway.addClass("awayTeam");
                buttonAway.addClass("game" + gameCounter);

                var buttonDraw = $("<input type='radio'>");
                buttonDraw.addClass("drawBtn");
                buttonDraw.addClass("game" + gameCounter);

                home.text(response.fixtures[i].homeTeamName + " ");
                home.append(buttonHome);
                away.text(response.fixtures[i].awayTeamName + " ");
                away.append(buttonAway);
                draw.text("Draw ");
                draw.append(buttonDraw);

                row.append(home);
                row.append(draw);
                row.append(away);

                $("#tablePicks").append(row);

                gameCounter++;


            }
        }

    });
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

        database.ref().orderByKey().equalTo(game.currentUserUid).on("value",function(snapshot){

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

    database.ref().child(game.currentUserUid).update({

        email: game.email,
        name: game.name,
        teamName: game.teamName,
        currentUserUid: game.currentUserUid,
        picks: "pick submitted"

    })

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


