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
    teamName:""

};

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

        for (var x = 0; x < response.fixtures.length; x++) {

            if (response.fixtures[x].matchday === 34 && response.fixtures[x].status === "TIMED") {


                var row = $("<tr>");
                var home = $("<td>");
                var draw = $("<td>");
                var away = $("<td>");


                var buttonHome = $("<input type='radio'>");
                buttonHome.attr("value", response.fixtures[x].result.goalsHomeTeam);
                buttonHome.addClass("homeTeam");

                var buttonAway = $("<input type='radio'>");
                buttonAway.attr("value", response.fixtures[x].result.goalsAwayTeam);
                buttonAway.addClass("awayTeam");

                var buttonDraw = $("<input type='radio'>");
                buttonDraw.addClass("drawBtn");

                home.text(response.fixtures[x].homeTeamName + " ");
                home.append(buttonHome);
                away.text(response.fixtures[x].awayTeamName + " ");
                away.append(buttonAway);
                draw.text("Draw ");
                draw.append(buttonDraw);

                row.append(home);
                row.append(draw);
                row.append(away);

                $("#tablePicks").append(row);


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
        usersRef.on("child_added",function(snapshot) {

            var keyId = snapshot.val();

            if (keyId.email === user.email) {

                $("#homepage").css("display", "none");
                $("#logInPage").css("display", "none");
                $("#profilePage").css("display", "block");

                $("#welcome").text("Hello " + keyId.name + "!!");

                makePicksTable();

            }
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
        // Sign-out successful.
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
        usersRef.push({
            email: game.email,
            name: game.name,
            teamName: game.teamName
        });
    }).catch(function(error) {

        // HANDLE ERRORS HERE. COULD USE MODALS.
        console.log(error.code);
        console.log(error.message);
        console.log(error)
        // ...
    });

    // $("#email").val("");
    // $("#pwd").val("");
    // $("#name").val("");
    // $("#teamName").val("");

});

// WHAT HAPPENS WHEN THE USER WANTS TO GO TO THE LOG IN AREA
// TAKE THE USER  TO THE LOG IN PAGE

$(document).on("click","#goToLogIn", function(event) {
    event.preventDefault();
    showLoginBox();
});

// WHAT HAPPENS WHEN THE USER REGISTERS BY CLICKING THE SIGNUP BUTTON

$(document).on("click","#signUp", function(event) {

    event.preventDefault();

    // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
    game.email = $("#email").val();
    game.name = $("#name").val();
    game.teamName = $("#teamName").val();

    firebase.auth().createUserWithEmailAndPassword(game.email, $("#pwd").val()).then(function(){
        // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
        usersRef.push({
            email: game.email,
            name: game.name,
            teamName: game.teamName
        });
    }).catch(function(error) {

        // HANDLE ERRORS HERE. COULD USE MODALS.
        console.log(error.code);
        console.log(error.message);
        console.log(error)
        // ...
    });

    $("#email").val("");
    $("#pwd").val("");
    $("#name").val("");
    $("#teamName").val("");

});


// IGNORE THE STUFF BELOW FOR NOW, ITS STILL ON THE WORKS

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


