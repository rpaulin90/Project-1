//// INITIALIZE FIREBASE


$(document).ready(function() {
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

    var resultsRef = database.ref().child("results");

// OUR GAME OBJECT, WHERE WE STORE INFORMATION FROM THE USER
// THIS INFORMATION WILL LATER BE PUSHED INTO FIREBASE
    var game = {
        email: "",
        name: "",
        teamName: "",
        userKeyNode: "",
        currentUserUid: "",
        lastWeeksResults: "",
        totalPoints: 0

    };

///////// DOMINGO'S CODE //////////

    var GWArray = ["04/19/2017", "04/23/2017", "04/25/2017", "04/30/2017"];

    currentDate = moment().format('LT');
    currentTime = moment().format('l');

//console.log(currentDate);

    var displayTeams = function (teamHolder, index) {
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

    var gameWeek = 34 + (x / 2);
    var startTime;
    var deadLine = false;
    var selectedTeams = [];

    var incompleteSelection = false;

///////// DOMINGO'S CODE //////////

// THIS FUNCTION CREATES A TABLE WITH THE PICK OPTIONS FOR NEXT MATCHDAY
    var makePicksTable = function () {
        console.log("makePicksTable");
        $("#picksContainer").empty();

///////// DOMINGO'S CODE //////////
        $.ajax({
            headers: {'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d'},
            url: 'https://api.football-data.org/v1/competitions/426/fixtures',
            dataType: 'json',
            type: 'GET'
        }).done(function (response) {
            console.log("ajax call");
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

            // console.log(timeDiff);

            if (timeDiff < 2) {
                deadLine = true;
                // console.log(deadLine);
            }
            else {
                $("#picksContainer").prepend("Time remaining: " + timeDiff + " hours");
                deadLine = false;
            }
            var resultsLastWeek = [];
            // OBTAINING RESULTS FROM LAST WEEK
            for (var f = 0; f < response.fixtures.length; f++) {
                if ((response.fixtures[f].matchday === gameWeek - 1) && (response.fixtures[f].status === "FINISHED" || response.fixtures[f].status === "IN_PLAY")) {

                    // IF HOME TEAM WON
                    if (response.fixtures[f].result.goalsHomeTeam > response.fixtures[f].result.goalsAwayTeam) {
                        resultsLastWeek.push(response.fixtures[f].homeTeamName);
                    }

                    // IF AWAY TEAM WON
                    else if (response.fixtures[f].result.goalsHomeTeam < response.fixtures[f].result.goalsAwayTeam) {
                        resultsLastWeek.push(response.fixtures[f].awayTeamName);
                    }

                    // IF IT WAS A DRAW
                    else if (response.fixtures[f].result.goalsHomeTeam === response.fixtures[f].result.goalsAwayTeam) {
                        resultsLastWeek.push("DRAW");
                    }
                }

            }
            resultsRef.set({

                [gameWeek - 1]: resultsLastWeek

            });


            if (gameWeek !== 1) { // IN GAMEWEEK 1, THERE IS NO LAST WEEK RESULTS

                var lastGameWeek = (gameWeek - 1).toString();
                var databaseLastGameWeek = (gameWeek - 2).toString();

                resultsRef.orderByKey().equalTo(lastGameWeek).once("value", function (snapshot) {

                    snapshot.forEach(function (childSnapshot) {

                        game.lastWeeksResults = childSnapshot.val();


                    });

                });


                usersRef.orderByKey().once("value", function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                       // console.log(childSnapshot.key);
                        var picksId = childSnapshot.val().picksPerGameWeek; // array starts at 0 so need to compensate
                        var pointsId = childSnapshot.val().pointsPerGameWeek;
                        var gamesPlayedId = childSnapshot.val().gamesPlayedPerWeek;
                        var lastWeeksPicks = picksId[databaseLastGameWeek];
                        var weeklyPoints = 0;
                        var totalPoints = 0;
                        var totalGamesPlayed = 0;
                        var weeklyGamesPlayed = 0;
                        var weeklyPointsArray = pointsId;
                        var weeklyGamesPlayedArray = gamesPlayedId;


                        for(var f = 0; f < lastWeeksPicks.length; f++) {
                            if(lastWeeksPicks[f]!=="undefined"){
                                weeklyGamesPlayed++}
                            if (lastWeeksPicks[f] === game.lastWeeksResults[f]) {
                                weeklyPoints++
                            }
                        }

                        usersRef.child(childSnapshot.key).child("pointsPerGameWeek").update({

                            [databaseLastGameWeek]: weeklyPoints

                        });

                        usersRef.child(childSnapshot.key).child("gamesPlayedPerWeek").update({

                            [databaseLastGameWeek]: weeklyGamesPlayed

                        });

                        // UPDATING THE USER'S TOTAL POINTS


                        for(var t = 0; t < weeklyPointsArray.length; t++){
                            totalPoints += weeklyPointsArray[t];
                            totalGamesPlayed += weeklyGamesPlayedArray[t];
                        }


                        usersRef.child(childSnapshot.key).update({

                            totalPoints: totalPoints,
                            totalPointsNegative: -totalPoints,
                            totalGamesPlayed: totalGamesPlayed

                        });

                    });
                });
            }

        });
///////// DOMINGO'S CODE //////////
    };

    var makeRankingsTable = function(){
        $(".rankings").empty();

        var rowTH = $("<tr>");
        var weekTH = $("<td>").text("Week");
        var team_nameTH = $("<td>").text("Team Name");
        var teamOwnerTH = $("<td>").text("Team Owner");
        var guessesSubmittedTH = $("<td>").text("Guesses Submitted");
        var totalCorrectTH = $("<td>").text("Total Points");
        var correctThisWeekTH = $("<td>").text("Points This Week");

        rowTH.append(weekTH);
        rowTH.append(team_nameTH);
        rowTH.append(teamOwnerTH);
        rowTH.append(guessesSubmittedTH);
        rowTH.append(correctThisWeekTH);
        rowTH.append(totalCorrectTH);

        $(".rankings").append(rowTH);

        usersRef.orderByChild("totalPointsNegative").once("value",function(snapshot){
            snapshot.forEach(function (childSnapshot) {

                var userID = childSnapshot.val();
                console.log(userID.email);

                var row = $("<tr>");
                var week = $("<td>");
                //var ranking = $("<td>");
                var team_name = $("<td>");
                var teamOwner = $("<td>");
                var guessesSubmitted = $("<td>");
                var totalCorrect = $("<td>");
                var correctThisWeek = $("<td>");

                week.append(gameWeek-1);
                team_name.append(userID.teamName);
                teamOwner.append(userID.name);
                guessesSubmitted.append(userID.totalGamesPlayed);
                // totalIncorrectArray.push(userID.totalGamesPlayed-userID.totalPoints);
                correctThisWeek.append(userID.pointsPerGameWeek[gameWeek-2]);
                // totalPointsArray.push(userID);
                totalCorrect.append(userID.totalPoints);

                row.append(week);
                //row.append(ranking);
                row.append(team_name);
                row.append(teamOwner);
                row.append(guessesSubmitted);
                row.append(correctThisWeek);
                row.append(totalCorrect);
                $(".rankings").append(row);
            });

        });

        $(".rankingsDiv").css("display", "block");
    };


///// USER REGISTRATION LOGIC

    var showSignUpBox = function () {

        // FIRST WE CREATE THE SIGN UP PAGE/HOMEPAGE
        $("#logInPage").css("display", "none");
        $("#profilePage").css("display", "none");
        $("#homepage").css("display", "block");

    };


///// USER LOG IN LOGIC

    var showLoginBox = function () {
        // FIRST, CREATE THE LOG IN FORM/PAGE
        $("#homepage").css("display", "none");
        $("#profilePage").css("display", "none");
        $("#logInPage").css("display", "block");

        // ACTION TAKEN WHEN CLICKING ON THE LOG IN BUTTON

    };


// START THE PROGRAM BY CHECKING IF THERE IS A USER ALREADY LOGGED IN
    showSignUpBox();
///// USER PROFILE LOGIC (ONCE THE USER IS LOGGED IN)
// IF THERE IS A USER LOGGED IN, TAKE HIM TO HIS PROFILE
// IF THERE IS NO ONE LOGGED IN, JUST SHOW THE HOMEPAGE

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var currentUser = firebase.auth().currentUser;
            game.currentUserUid = currentUser.uid;

            usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {

                snapshot.forEach(function (childSnapshot) {

                    var keyId = childSnapshot.val();

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
                makeRankingsTable();

            });


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
            game.email = "";
            game.name = "";
            game.teamName = "";
            game.currentUserUid = "";
            lastWeeksPicks = "";
            game.lastWeeksResults = "";
            weeklyPoints = 0;
            $(".rankingsDiv").css("display", "none");
            // Sign-out successful.
        }).catch(function (error) {
            console.log(error.code);// An error happened.
            console.log(error.message);// An error happened.
        });


    });


// WHAT HAPPENS WHEN THE USER LOGS IN
    $(document).on("click", "#logIn", function (event) {

        event.preventDefault();

        firebase.auth().signInWithEmailAndPassword($("#emailLogIn").val(), $("#pwdLogIn").val()).then(function () {

        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });

    });

// WHAT HAPPENS WHEN THE USER REGISTERS

    $(document).on("click", "#signUp", function (event) {

        event.preventDefault();

        // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
        game.email = $("#email").val();
        game.name = $("#name").val();
        game.teamName = $("#teamName").val();

        firebase.auth().createUserWithEmailAndPassword(game.email, $("#pwd").val()).then(function () {
            // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
            // EACH NODE'S KEY WILL BE THEIR REGISTRATION KEY.
            // THIS ALLOWS US TO NOT HAVE TO LOOP THROUGH THE OBJECTS, WE JUST DO A SIMPLE QUERY
            // FOR THE USER'S NUMBER
            var currentUser = firebase.auth().currentUser;
            game.currentUserUid = currentUser.uid;
            var picksArray = [];
            var picksPerGameWeek = [];

            for(var z = 0; z < 10; z++){
                picksPerGameWeek.push("undefined");
            }

            for(var p = 0; p < 38; p++){

                picksArray.push(picksPerGameWeek);

            }

            var pointsArray = [];
            for(var a = 0; a < 38; a++){
                pointsArray.push(0)
            }
            var gamesPlayedArray = pointsArray;
            usersRef.child(game.currentUserUid).set({

                email: game.email,
                name: game.name,
                teamName: game.teamName,
                userUid: game.currentUserUid,
                picksPerGameWeek: picksArray, //// picksArray = [[undefined,undefined,...,undefined],[undefined,undefined,...,undefined], etc]
                pointsPerGameWeek: pointsArray, //// pointsArray = [0,0,0,0,...,0] 38 gameweeks, so 38 weekly points
                gamesPlayedPerWeek: gamesPlayedArray, //// TO COUNT HOW MANY GAMES A USER HAS PLAYED
                totalPoints: 0,
                totalGamesPlayed: 0

            });


        }).catch(function (error) {

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

    $(document).on("click", "#goToLogIn", function (event) {
        event.preventDefault();
        showLoginBox();
    });


    $("#submitPicks").on("click", function (event) {

        event.preventDefault();

////// DOMINGO'S CODE //////
        for (var r = 0; r < (selectedTeams.length); r++) {
            selectedTeams[r] = ($("input[name='" + r + "']:checked").val());
            if (selectedTeams[r] === undefined) {
                alert("undefined bruh");
                incompleteSelection = true;
                break;
            }
        }
        // console.log(selectedTeams);
////// DOMINGO'S CODE //////
        var databaseGameWeek = (gameWeek-1).toString();
        usersRef.child(game.currentUserUid).child("picksPerGameWeek").update({

            // email: game.email,
            // name: game.name,
            // teamName: game.teamName,
            [databaseGameWeek]: selectedTeams


        });

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

