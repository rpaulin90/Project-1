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


///// USER REGISTRATION LOGIC

var showSignUpBox = function() {

    // FIRST WE CREATE THE SIGN UP PAGE/HOMEPAGE
    $("#logInPage").css("display","none");
    $("#profilePage").css("display","none");
    $("#homepage").css("display","block");

    // THEN WE LISTEN TO WHAT THE USER DOES

    // ACTIONS AFTER CLICKING ON THE SIGN UP BUTTON
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

    // ACTIONS IF GO TO LOG IN BUTTON IS CLICKED
    // TAKE THE USER  TO THE LOG IN PAGE
    $(document).on("click","#goToLogIn", function(event) {
        event.preventDefault();
        showLoginBox();
    });
};

///// USER PROFILE LOGIC (ONCE THE USER IS LOGGED IN)
// CHECK IF THERE IS A USER LOGGED IN
// IF THERE IS A USER LOGGED IN, TAKE HIM TO HIS PROFILE
// IF THERE IS NO ONE LOGGED IN, JUST SHOW THE HOMEPAGE

var showProfilePage = function() {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            usersRef.on("child_added",function(snapshot){

                var keyId = snapshot.val();


                if(keyId.email === user.email){


                    $("#homepage").css("display","none");
                    $("#logInPage").css("display","none");
                    $("#profilePage").css("display","block");

                    $("#welcome").text("Hello " + keyId.name + "!!");

                    $(document).on("click", "#logOut", function (event) {

                        event.preventDefault();

                        firebase.auth().signOut().then(function() {
                            showSignUpBox();// Sign-out successful.
                        }).catch(function(error) {
                            console.log(error.code);// An error happened.
                            console.log(error.message);// An error happened.
                        });

                    });
                }

            });

        }else{
            // User is not signed in.
            showSignUpBox();
        }
    });


};


///// USER LOG IN LOGIC

var showLoginBox = function() {
    // FIRST, CREATE THE LOG IN FORM/PAGE
    $("#homepage").css("display","none");
    $("#profilePage").css("display","none");
    $("#logInPage").css("display","block");

    // ACTION TAKEN WHEN CLICKING ON THE LOG IN BUTTON
    $(document).on("click","#logIn",function(event) {

        event.preventDefault();

        firebase.auth().signInWithEmailAndPassword($("#emailLogIn").val(), $("#pwdLogIn").val()).then(function(){

            //If sign if was successful
            showProfilePage();

        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });


    });
};

// START THE PROGRAM BY CHECKING IF THERE IS A USER ALREADY SIGNED IN

showProfilePage();

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

// $.ajax({
//     headers: { 'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d' },
//     url: 'https://api.football-data.org/v1/competitions/426/fixtures',
//     dataType: 'json',
//     type: 'GET'
// }).done(function(response) {
//     for (var x = 0; x < response.fixtures.length; x++) {
//
//     }
//
// });

