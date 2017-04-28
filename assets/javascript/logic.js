
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

    var GWArray = ["04/22/2017", "04/23/2017", "04/29/2017", "05/01/2017", "05/05/2017", "05/08/2017", "05/10/2017", "05/14/2017", "05/15/2017", "05/21/2017"];

    currentDate = moment().format('LT');
    currentTime = moment().format('l');

//console.log(currentDate);

    var displayTeams = function (teamHolder, index) {

        radioButtonDiv = $('<div class="ui radio checkbox">');

        newLabel = $("<label>");
        newLabel.addClass("radio-inline");
        if (teamHolder === "DRAW") {
            newLabel.html("");
        } else {
            newLabel.html(teamHolder);
        }

        newInput = $("<input>");
        newInput.attr("type", "radio");
        newInput.attr("name", "optradio");
        newInput.attr("value", teamHolder);
        newInput.attr("name", index);

        radioButtonDiv.append(newInput);
        radioButtonDiv.append(newLabel);
        newColumn.append(radioButtonDiv);

    };

    var x = 0;
    var convertedDate = moment(new Date(GWArray[x]));

    while (moment(convertedDate).diff(moment(), "hours") <= 0) {
        x += 2;
        convertedDate = moment(new Date(GWArray[x]));
    }

    var gameWeek = 34 + (x / 2);
    //gameWeek = gameWeek - 1;
    var startTime;
    var deadLine = false;
    var selectedTeams = [];

    var incompleteSelection = false;
    var resultsLastWeek = [];


///////// DOMINGO'S CODE //////////

// THIS FUNCTION CREATES A TABLE WITH THE PICK OPTIONS FOR NEXT MATCHDAY
    var makePicksTable = function () {
        console.log("makePicksTable");
        $("#picksContainer").empty();
        $("#game-results").empty();
        $("#yourPicks").empty();
        $("#yourPicksCurrent").empty();

///////// DOMINGO'S CODE //////////
        $.ajax({
            headers: {'X-Auth-Token': '43d2319104c54b0c9cf2d5679ab2ae5d'},
            url: 'https://api.football-data.org/v1/competitions/426/fixtures',
            dataType: 'json',
            type: 'GET'
        }).done(function (response) {
            $("#loader").addClass("hidden");
            console.log("ajax call");
            var matchHolder = [];

            var index = 0;
            for (var i = 0; i < response.fixtures.length; i++) {
                if (response.fixtures[i].matchday === gameWeek && response.fixtures[i].status === "TIMED") {
                    //if (response.fixtures[i].matchday === gameWeek && (response.fixtures[i].status === "TIMED" || response.fixtures[i].status === "FINISHED")) {

                    matchHolder.push(i);

                    //Output
                    var newRow = $('<tr class="radio-group">');

                    var value = response.fixtures[matchHolder[matchHolder.length - 1]].homeTeamName;
                    newColumn = $('<td class="radio six wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    newRow.append(newColumn);
                    value = "DRAW";
                    newColumn = $('<td class="radio four wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    newRow.append(newColumn);
                    value = response.fixtures[matchHolder[matchHolder.length - 1]].awayTeamName;
                    newColumn = $('<td class="radio six wide center aligned" value="' + value + '" name="' + index + '">' + value + '</td>');
                    newRow.append(newColumn);

                    selectedTeams.push(matchHolder.length - 1);
                    index++;

                    $("#picksContainer").append(newRow);
                }
            }

            $('#picksContainer .radio-group .radio').click(function(){
                $(this).parent().find('.radio').removeClass('selected');
                $(this).addClass('selected');
                var val = $(this).attr('value');
                console.log(val);
                // $(this).parent().find('input').val(val);
            });

            // making the last week's results and picks info section
            for (var e = 0; e < response.fixtures.length; e++) {
                if ((response.fixtures[e].matchday === gameWeek-1) && (response.fixtures[e].status === "FINISHED" || response.fixtures[e].status === "IN_PLAY")) {

                    var row = $("<tr>");
                    var col = $("<td>");

                    var resultHomeDiv = $('<div class="result-cell">');
                    var homeTeam = $('<span>' + response.fixtures[e].homeTeamName + '</span><span class="right floated"> ' + response.fixtures[e].result.goalsHomeTeam + '</span>');
                    var resultAwayDiv = $('<div class="result-cell">');
                    var awayTeam = $('<span>' + response.fixtures[e].awayTeamName + '</span><span class="right floated"> ' + response.fixtures[e].result.goalsAwayTeam + '</span>');

                    resultHomeDiv.append(homeTeam);
                    resultAwayDiv.append(awayTeam);
                    col.append(resultHomeDiv);
                    col.append(resultAwayDiv);
                    row.append(col);
                    $('#game-results').append(row);
                }
            }
            //////////// JUST ADDED ////////////////

            usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var keyId = childSnapshot.val();

                    if(keyId.picksPerGameWeek[gameWeek-2][0] === "undefined"){
                        $("#yourPicks").append("No picks were selected last week"); //////// LATEST CHANGE
                    }else {
                        for (var l = 0; l < keyId.picksPerGameWeek[gameWeek - 2].length; l++) {

                            var row = $("<tr>");
                            var picks = $("<td>");

                            picks.html(keyId.picksPerGameWeek[gameWeek - 2][l]);

                            row.append(picks);
                            $("#yourPicks").append(row);

                        }
                    }

                    if(keyId.picksPerGameWeek[gameWeek - 1][0] === "undefined"){
                        $("#yourPicksCurrent").append("No picks have been selected yet"); //////// LATEST CHANGE
                    }else {
                        for (var c = 0; c < keyId.picksPerGameWeek[gameWeek - 1].length; c++) {
                            ////// making the current week's picks section
                            var rowCurrent = $("<tr>");
                            var picksCurrent = $("<td>");

                            picksCurrent.html(keyId.picksPerGameWeek[gameWeek - 1][c]);

                            rowCurrent.append(picksCurrent);
                            $("#yourPicksCurrent").append(rowCurrent);
                        }
                    }
                });
            });

            //////////// JUST ADDED ////////////////




            startTime = moment(new Date(GWArray[x]));
            timeDiff = moment(startTime).diff(moment(), "hours");

            if (timeDiff < 2) {
                deadLine = true;
            }
            else {

                $("#time-remaining").html("Time remaining: " + timeDiff + " hours");

                deadLine = false;
            }

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
            console.log(resultsLastWeek);
        });
///////// DOMINGO'S CODE //////////
    };

    ////////////////////// FUNCTION TO UPDATE DATABASE /////////////////////////////

    var updateDatabase = function(){
        if (gameWeek !== 1) { // IN GAMEWEEK 1, THERE IS NO LAST WEEK RESULTS
            var databaseLastGameWeek = (gameWeek - 2).toString();

            // 1- UPDATE WEEKLY GAMES PLAYED

            usersRef.orderByKey().once("value", function (snapshot) {
                console.log("1- UPDATE WEEKLY GAMES PLAYED");
                snapshot.forEach(function (childSnapshot) {

                    var picksId = childSnapshot.val().picksPerGameWeek; // array starts at 0 so need to compensate
                    var lastWeeksPicks = picksId[databaseLastGameWeek];
                    var weeklyGamesPlayed = 0;

                    for (var f = 0; f < lastWeeksPicks.length; f++) {
                        if (lastWeeksPicks[f] !== "undefined") {
                            weeklyGamesPlayed++
                        }
                    }

                    usersRef.child(childSnapshot.key).child("gamesPlayedPerWeek").update({
                        [databaseLastGameWeek]: weeklyGamesPlayed
                    });
                });

                // 2- UPDATE WEEKLY POINTS

                usersRef.orderByKey().once("value", function (snapshot) {
                    console.log("2- UPDATE WEEKLY POINTS");

                    snapshot.forEach(function (childSnapshot) {
                        var picksId = childSnapshot.val().picksPerGameWeek; // array starts at 0 so need to compensate
                        var lastWeeksPicks = picksId[databaseLastGameWeek];
                        var weeklyPoints = 0;

                        for (var f = 0; f < lastWeeksPicks.length; f++) {
                            if (lastWeeksPicks[f] === resultsLastWeek[f]) {
                                weeklyPoints++
                            }
                        }

                        usersRef.child(childSnapshot.key).child("pointsPerGameWeek").update({
                            [databaseLastGameWeek]: weeklyPoints
                        });
                    });
                    // 3- UPDATE TOTAL GAMES PLAYED
                    usersRef.orderByKey().once("value", function (snapshot) {
                        console.log("3- UPDATE TOTAL GAMES PLAYED");
                        snapshot.forEach(function (childSnapshot) {

                            var pointsId = childSnapshot.val().pointsPerGameWeek;
                            var gamesPlayedId = childSnapshot.val().gamesPlayedPerWeek;
                            var totalGamesPlayed = 0;
                            var weeklyPointsArray = pointsId;
                            var weeklyGamesPlayedArray = gamesPlayedId;

                            for(var t = 0; t < weeklyPointsArray.length; t++){
                                totalGamesPlayed += weeklyGamesPlayedArray[t];
                            }

                            usersRef.child(childSnapshot.key).update({
                                totalGamesPlayed: totalGamesPlayed
                            });
                        });

                        // 4- UPDATE TOTAL POINTS
                        usersRef.orderByKey().once("value", function (snapshot) {
                            console.log("4- UPDATE TOTAL POINTS");
                            snapshot.forEach(function (childSnapshot) {

                                var pointsId = childSnapshot.val().pointsPerGameWeek;
                                var totalPoints = 0;
                                var weeklyPointsArray = pointsId;

                                for(var t = 0; t < weeklyPointsArray.length; t++){
                                    totalPoints += weeklyPointsArray[t];
                                }

                                usersRef.child(childSnapshot.key).update({
                                    totalPointsNegative: -totalPoints,
                                    totalPoints: totalPoints
                                });
                                // usersRef.child(childSnapshot.key).update({
                                //
                                //     totalPoints: totalPoints
                                //
                                // });
                            });
                        });

                        // 4- CHECK If USER HAS 0 POINTS
                        usersRef.orderByKey().once("value", function (snapshot) {
                            console.log("5- CHECK IF TOTAL POINTS ARE 0");
                            snapshot.forEach(function (childSnapshot) {

                                var pointsId = childSnapshot.val().pointsPerGameWeek;
                                var totalPoints = 0;
                                var weeklyPointsArray = pointsId;

                                for(var t = 0; t < weeklyPointsArray.length; t++){
                                    totalPoints += weeklyPointsArray[t];
                                }

                                if(totalPoints == 0){
                                    usersRef.child(childSnapshot.key).update({
                                        totalPointsNegative: 1000
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }
    };

    /////////////////////////////////////////////////////////////////////////////

    var makeRankingsTable = function(){
        $(".rankings").empty();

        usersRef.orderByChild("totalPointsNegative").once("value",function(snapshot){
            snapshot.forEach(function (childSnapshot) {

                var userID = childSnapshot.val();
                console.log(userID.email);
                var row = $("<tr>");
                var week = $("<td>");
                var team_name = $("<td>");
                var teamOwner = $("<td>");
                var guessesSubmitted = $("<td>");
                var totalCorrect = $("<td>");
                var correctThisWeek = $("<td>");

                week.append(gameWeek-1);
                team_name.append(userID.teamName);
                teamOwner.append(userID.name);
                guessesSubmitted.append(userID.totalGamesPlayed);
                correctThisWeek.append(userID.pointsPerGameWeek[gameWeek-2]);
                totalCorrect.append(userID.totalPoints);

                row.append(week);

                row.append(team_name);
                row.append(teamOwner);
                row.append(guessesSubmitted);
                row.append(correctThisWeek);
                row.append(totalCorrect);
                $("#rankings").append(row);
            });
        });
        $(".rankingsDiv").css("display", "block");
    };




    ////////// JUST ADDED //////////////

    var makeWeeklyPointsGraph = function(){

        $("#canvas").empty();


        usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {

            snapshot.forEach(function (childSnapshot) {

                var pointsId = childSnapshot.val().pointsPerGameWeek;
                var weeklyPointsArray = [];
                var gameWeeks = [];

                for(var g = 0; g < gameWeek-1; g++){
                    weeklyPointsArray.push(pointsId[g]);
                    gameWeeks.push(g + 1);
                }
                console.log(weeklyPointsArray);
                var lineChartData = {
                    labels: gameWeeks,
                    datasets: [{
                        lagend: 'Points Per Gameweek',
                        backgroundColor: "rgba(99, 255, 172,0.5)",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        bezierCurve: true,
                        data: weeklyPointsArray
                    }]

                };

                Chart.defaults.global.responsive = true;
                Chart.defaults.global.tooltipYPadding = 10;
                Chart.defaults.global.tooltipXPadding = 3;


                var ctx = document.getElementById("canvas").getContext("2d");
                var LineChartDemo = new Chart(ctx).Line(lineChartData, {
                    pointDotRadius: 1,
                    lineTension: 1,
                    scaleShowVerticalLines: false,
                    fill: false,
                    scaleGridLineColor: "black"
                });

            });
        });

    };

    ////////// JUST ADDED //////////////

///// USER REGISTRATION LOGIC

    var showSignUpBox = function () {
        // FIRST WE CREATE THE SIGN UP PAGE/HOMEPAGE
        $("#logInPage").css("display", "none");
        $("#profilePage").css("display", "none");
        $("#rankingsTable").css("display","none");
        $("#registrationBtn").css("display, block");
        $("#homepage").css("display", "block");
    };


// START THE PROGRAM BY CHECKING IF THERE IS A USER ALREADY LOGGED IN
    showSignUpBox();
///// USER PROFILE LOGIC (ONCE THE USER IS LOGGED IN)
// IF THERE IS A USER LOGGED IN, TAKE HIM TO HIS PROFILE
// IF THERE IS NO ONE LOGGED IN, JUST SHOW THE HOMEPAGE

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $("#loader").removeClass("hidden");
            $("#login-btn").html("Sign out");
            $("#currentPicksBtn").removeClass("hidden");
            $("#lastWeeksResultsBtn").removeClass("hidden");
            $("#pointsGraph").removeClass("hidden");
            $("#rankingsBtn").removeClass("hidden");
            $("#login-btn").attr("data-izimodal-open", "");
            callInfoAPI();
            $("#wrapper").addClass("hide");
            $("body").css('background-image', 'none');
            $('#registrationBtn').css('display','none');
            $("#registrationBtn").addClass("hide");
            $("#pointsGraph, #lastWeeksResultsBtn, #currentPicksBtn").removeClass("hide");

            console.log("hello")
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
                $("#rankingsTable").css("display","block");
                $("#lastWeekInfo").css("display","block");
                selectedTeams = [];
                makePicksTable();
            });
        } else {
            $("#login-btn").html("Sign in");
            $("#login-btn").attr("data-izimodal-open", "modal-custom");
            $("#currentPicksBtn").addClass("hidden");
            $("#lastWeeksResultsBtn").addClass("hidden");
            $("#pointsGraph").addClass("hidden");
            $("#rankingsBtn").addClass("hidden");
            $("#wrapper").removeClass("hide");
            showSignUpBox();
            updateDatabase();
            $("#welcome").html("Welcome");
            if (!($("#clubs").hasClass("hidden"))) {
                $("#clubs").addClass("hidden");
            }
            $("#registrationBtn").removeClass("hide");
            $("#pointsGraph, #lastWeeksResultsBtn, #currentPicksBtn").addClass("hide");
            $("body").css('background', 'url("assets/images/bg-img.jpg") fixed');
            $("body").css('background-size', 'cover');

        }
    });

    jQuery(function($)
    {
        $(document).ajaxStop(function()
        {
            console.log(gameWeek);
            console.log("results last week: " + resultsLastWeek);
            updateDatabase();// Executed when all ajax requests are done.
        });
    });

// WHAT HAPPENS WHEN A USER LOGS OUT
    $(document).on("click", "#login-btn", function (event) {
        if ($("#login-btn").html() === "Sign out") {
            event.preventDefault();

            firebase.auth().signOut().then(function () {
                usersRef.off("value");
                game.email = "";
                game.name = "";
                game.teamName = "";
                game.currentUserUid = "";
                lastWeeksPicks = "";
                game.lastWeeksResults = "";
                weeklyPoints = 0;
                updateDatabase();
                $(".rankingsDiv").css("display", "none");
                $("#lastWeekInfo").css("display","none");
                $('#registrationBtn').css('display','block');
                // Sign-out successful.
            }).catch(function (error) {
                console.log(error.code);// An error happened.
                console.log(error.message);// An error happened.
            });
        }
    });


    $("#submitPicks").on("click", function (event) {
       event.preventDefault();

       usersRef.orderByKey().equalTo(game.currentUserUid).once("value", function (snapshot) {
               snapshot.forEach(function (childSnapshot) {
                   var keyId = childSnapshot.val();

                   if(keyId.picksPerGameWeek[gameWeek-2][0] === "undefined"){
                       $("#yourPicks").append("No picks were selected last week"); //////// LATEST CHANGE
                   }else {
                       for (var l = 0; l < keyId.picksPerGameWeek[gameWeek - 2].length; l++) {

                           var row = $("<tr>");
                           var picks = $("<td>");

                           picks.html(keyId.picksPerGameWeek[gameWeek - 2][l]);

                           row.append(picks);
                           $("#yourPicks").append(row);

                       }
                   }
                   $("#yourPicksCurrent").empty();
                   for(var c = 0; c < keyId.picksPerGameWeek[gameWeek-1].length; c++){
                       ////// making the current week's picks section
                       var rowCurrent = $("<tr>");
                       var picksCurrent = $("<td>");

                       picksCurrent.html(keyId.picksPerGameWeek[gameWeek-1][c]);

                       rowCurrent.append(picksCurrent);
                       $("#yourPicksCurrent").append(rowCurrent);
                   }
               });
           });

////// DOMINGO'S CODE //////
       incompleteSelection = false;
       for (var r = 0; r < (selectedTeams.length); r++) {
           var value = ($("#picksContainer .radio-group .selected[name='" + r + "']").attr("value"));
           console.log(value);
           selectedTeams[r] = value;
          //  selectedTeams[r] = ($("input[name='" + r + "']:checked").val());
           if (selectedTeams[r] === undefined) {
               ///////// JUST ADDED ///////////
               $("#picks-submitted-unsuccessfully").iziModal({
                   title: "Please make a selection for every game",
                   icon: 'icon-star',
                   headerColor: '#b83c3c ',
                   width: 600,
                   timeout: 15000,
                   timeoutProgressbar: true,
                   transitionIn: 'fadeInUp',
                   transitionOut: 'fadeOutDown',
                   /*attached: 'bottom',*/
                   history: false,
                   autoOpen: true/*,
                    onClosed: function(){
                    $("html").removeClass('overflow-hidden');
                    }*/
               });

               ///////// JUST ADDED ///////////

               //alert("undefined bruh");
               incompleteSelection = true;
               break;
           }
       }

       if (incompleteSelection === false) {
            $("#picks-submitted-successfully").iziModal({
                   title: "Your Picks Have Been Successfully Submitted",
                   icon: 'icon-star',
                   headerColor: '#5cb85c ',
                   width: 600,
                   timeout: 15000,
                   timeoutProgressbar: true,
                   transitionIn: 'fadeInUp',
                   transitionOut: 'fadeOutDown',
                   /*attached: 'bottom',*/
                   history: false,
                   autoOpen: true/*,
                    onClosed: function(){
                    $("html").removeClass('overflow-hidden');
                    }*/
               });
       }

       ////// DOMINGO'S CODE //////
       var databaseGameWeek = (gameWeek-1).toString();
       usersRef.child(game.currentUserUid).child("picksPerGameWeek").update({
           // email: game.email,
           // name: game.name,
           // teamName: game.teamName,
           [databaseGameWeek]: selectedTeams
       });
   });

    ////////////////// IZIMODAL ///////////////////////
    $("#modal-custom").iziModal({
        overlayClose: false,
        width: 600,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        onOpened: function() {
            console.log('onOpened');
        },
        onClosed: function() {
            console.log('onClosed');
        }
    });

    $("#modal-custom section:not(.hide)").keypress(function(e) {
        if (e.which === 13) {
            $("#modal-custom section:not(.hide) button.submit").click();
        }
    });

    /* JS inside the modal */
    $("#modal-custom").on('click', 'header a', function(event) {
        event.preventDefault();
        var index = $(this).index();
        $(this).addClass('active').siblings('a').removeClass('active');
        $(this).parents("div").find("section").eq(index).removeClass('hide').siblings('section').addClass('hide');

        if( $(this).index() === 0 ){
            $("#modal-custom .iziModal-content .icon-close").css('background', '#ddd');
        } else {
            $("#modal-custom .iziModal-content .icon-close").attr('style', '');
        }
    });

    $("#modal-custom").on('click', "#signUp", function(event) {
        event.preventDefault();

        // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
        game.email = $("#emailRegistration").val();
        game.name = $("#name").val();
        game.teamName = $("#teamName").val();

        var that = $(this);



        /// adding some requirements to register

        if(game.name.length > 2 && game.teamName.length > 2) {

            firebase.auth().createUserWithEmailAndPassword(game.email, $("#passwordRegistration").val()).then(function () {
                // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
                // EACH NODE'S KEY WILL BE THEIR REGISTRATION KEY.
                // THIS ALLOWS US TO NOT HAVE TO LOOP THROUGH THE OBJECTS, WE JUST DO A SIMPLE QUERY
                // FOR THE USER'S NUMBER
                $('#modal-custom').iziModal('toggle');
                var currentUser = firebase.auth().currentUser;
                game.currentUserUid = currentUser.uid;
                var picksArray = [];
                var picksPerGameWeek = [];

                for (var z = 0; z < 10; z++) {
                    picksPerGameWeek.push("undefined");
                }

                for (var p = 0; p < 38; p++) {

                    picksArray.push(picksPerGameWeek);

                }

                var pointsArray = [];
                for (var a = 0; a < 38; a++) {
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

                if (error) {
                    var fx = "wobble",  //wobble shake
                        $modal = that.closest('.iziModal');

                    if (!$modal.hasClass(fx)) {
                        $modal.addClass(fx);
                        setTimeout(function () {
                            $modal.removeClass(fx);
                        }, 1500);
                    }
                }

                console.log(error.code);
                console.log(error.message);
                $("#email").val("");
                $("#pwd").val("");
                $("#name").val("");
                $("#teamName").val("");
            });
        }else{
            var fx = "wobble",  //wobble shake
                $modal = that.closest('.iziModal');

            if (!$modal.hasClass(fx)) {
                $modal.addClass(fx);
                setTimeout(function () {
                    $modal.removeClass(fx);
                }, 1500);
            }
        }
    });

// WHAT HAPPENS WHEN THE USER LOGS IN
    $("#modal-custom").on('click', "#logIn", function(event) {
        event.preventDefault();

        var that = $(this);

        firebase.auth().signInWithEmailAndPassword($("#emailLogIn").val(), $("#passwordLogIn").val()).then(function () {
            $('#modal-custom').iziModal('close', {
                transition: 'bounceOutDown' // Here transitionOut is the same property.
            });

        }).catch(function (error) {
            // Handle Errors here.
            if(error) {
                var fx = "wobble",  //wobble shake
                    $modal = that.closest('.iziModal');

                if (!$modal.hasClass(fx)) {
                    $modal.addClass(fx);
                    setTimeout(function () {
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }

            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);

        });
    });


    $("#resetPassword").on('click', function(event) {
        /////// JUST ADDED ////////
        event.preventDefault();
        ////// JUST ADDED /////////

        var emailForPasswordReset = $("#emailForPasswordReset").val();
        var that = $(this);

        firebase.auth().sendPasswordResetEmail(emailForPasswordReset).then(function () {
            // Email sent.
        }, function (error) {
            if (error) {
                var fx = "wobble",  //wobble shake
                    $modal = that.closest('.iziModal');

                if (!$modal.hasClass(fx)) {
                    $modal.addClass(fx);
                    setTimeout(function () {
                        $modal.removeClass(fx);
                    }, 1500);
                }
            }
            console.log(error.message);
        });
    });


            //////////// JUST ADDED //////////////

            $("#pointsGraph").on("click",function(){
                if(gameWeek !== 1) {

                    makeWeeklyPointsGraph();
                    $('#modal-modifications').iziModal('open');
                }
            });

            $("#lastWeeksResultsBtn").on('click', function () {

                $('#lastWeek-modal').iziModal('open', this); // Do not forget the "this"
            });

            $("#currentPicksBtn").on('click', function () {

                $('#currentPicks-modal').iziModal('open', this); // Do not forget the "this"
            });

            $("#rankingsBtn").on('click', function () {
                $("#rankings").empty();
                makeRankingsTable();
                $('#rankings-modal').iziModal('open', this); // Do not forget the "this"
            });


            $("#modal-modifications").iziModal({
                title:'Points Per Week',
                overlayClose: true,
                autoOpen: false,
                overlayColor: 'rgba(0, 0, 0, 0.6)',
            });


            $("#lastWeek-modal").iziModal({
                title: "Last week's results and picks",
                subtitle: "Gameweek: " + (gameWeek-1),
                theme: '',
                headerColor: '#2a339c',
                overlayColor: 'rgba(0, 0, 0, 0.4)',
                iconColor: '',
                iconClass: null,
                width: 600,
                padding: 0,
                overlayClose: true,
                closeOnEscape: true,
                bodyOverflow: false,
                autoOpen: false
            });

            $("#currentPicks-modal").iziModal({
                title: 'Current Picks',
                subtitle: 'Gameweek: ' + (gameWeek),
                theme: '',
                headerColor: '#1fa13b',
                overlayColor: 'rgba(0, 0, 0, 0.4)',
                iconColor: '',
                iconClass: null,
                width: 400,
                padding: 0,
                overlayClose: true,
                closeOnEscape: true,
                bodyOverflow: false,
                autoOpen: false
            });

            $("#rankings-modal").iziModal({
                title: 'Rankings',
                subtitle: 'As of gameweek: ' + (gameWeek),
                theme: '',
                headerColor: '#1fa13b',
                overlayColor: 'rgba(0, 0, 0, 0.4)',
                iconColor: '',
                iconClass: null,
                width: 1000,
                padding: 0,
                overlayClose: true,
                closeOnEscape: true,
                bodyOverflow: false,
                autoOpen: false
            });


            //////////// JUST ADDED //////////////

////////////////////////////////////////////////////////
// JAIME's CODE
////////////////////////////////////////////////////////
    var NEWS_API_KEY = "b8e5013c-f10c-474c-9cf6-b9416ae989ef";
    var getTeamNewsQueryURL = "https://content.guardianapis.com/search?section=football&page-size=50&api-key=";
    var API_KEY = "43d2319104c54b0c9cf2d5679ab2ae5d";
    var getTeamsQueryURL = "https://api.football-data.org/v1/competitions/426/leagueTable?matchday=38";
    var teams = [];
    var eplData = [];
    var standing = [];
    var newsArray = [];
    var badges = [
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t3.svg", // Arsenal
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t91.svg", // Bournemouth
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t90.svg", // Burnley
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t8.svg", // Chelsea
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t31.svg", // Crystal Palace
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t11.svg", // Everton
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t88.svg", // Hull City
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t13.svg", // Leicester
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t14.svg", // Liverpool
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t43.svg", // Man City
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t1.svg", // Man United
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t25.svg", // Middlesbrough
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t20.svg", // Southampton
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t110.svg", // Stoke City
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t56.svg", // Sunderland
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t80.svg", // Swansea
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t6.svg", // Tottenham
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t57.svg", // Watford
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t35.svg", // West Brom
        "https://platform-static-files.s3.amazonaws.com/premierleague/badges/t21.svg" // West Ham
    ];

    /**
     * Make football-data API call, and once done, get jokecamp JSON. Put all
     * necessary data in variables and create DOM elements
     */
    function callInfoAPI() {
        $.ajax({
            headers: {'X-Auth-Token': API_KEY},
            url: getTeamsQueryURL,
            dataType: 'json',
            type: 'GET'
        }).done(function (response) {
            standing = response.standing;
            console.log(standing);

            $.ajax({
                url: getTeamNewsQueryURL + NEWS_API_KEY,
                method: "GET"
            }).done(function (response) {
                newsArray = response.response.results;
                console.log(newsArray);

                $.ajax({
                    url: "https://jokecamp.github.io/epl-fantasy-geek/js/static-data.json",
                    method: "GET"
                }).done(function (response) {
                    console.log(response);
                    teams = response.teams;
                    eplData = response.elements;

                    $.each(teams, function (index, team) {
                        teams[index].crestUrl = badges[index];

                        // rename team names in teams array to match
                        // team names from football-data api response.
                        // TOT, MANU, and MANCity are special cases
                        if (teams[index].name === "Spurs") {
                            teams[index].name = "Tottenham Hotspur FC";
                        } else if (teams[index].name === "Man Utd") {
                            teams[index].name = "Manchester United FC";
                        } else if (teams[index].name === "Man City") {
                            teams[index].name = "Manchester City FC";
                        } else {
                            $.each(standing, function (i, val) {
                                if (val.teamName.toLowerCase().includes(team.name.toLowerCase())) {
                                    teams[index].name = val.teamName;
                                    return false;
                                }
                            });
                        }
                    });

                    setTeamsTag();

                    console.log(teams);

                    createTeamsNav();
                });
            });
        });
    }

    /**
     * Creates the teams navbar and each team's on click event handler
     */
    function createTeamsNav() {
        var mainDiv = $("#clubs");
        $("#club-navbar").empty();
        $("#loader").toggleClass("hidden");
        if ($("#clubs").hasClass("hidden")) {
            $("#clubs").removeClass("hidden");
        }

        $.each(teams, function(index, team) {
            var teamBadge = $('<div class="item" id=' + team.short_name + '><img class="badge-icon" src="' + team.crestUrl + '"></div>');

            $("#club-navbar").append(teamBadge);
            if (team.short_name === "ARS") {
                teamBadge.addClass("active");
            }

            teamBadge.on("click", function() {
                $('.ui .item').removeClass('active');
                $(this).addClass('active');
                var teamId = $(this).attr("id");

                createTeamsPage(teamId);
            });
        });

        $("#club-navbar").appendTo("#nav-container");

        createTeamsPage("ARS");
    }

    /**
     * Creates club's info section
     */
    function createTeamsPage(teamId) {
        var teamCode = getTeamCode(teamId);
        // get team function
        var contentContainer = $("#content-container");

        // INJURIES BOX
        $("#injuries-content").empty();
        var playerName = undefined;
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode) {
                if (player.status === "i" || player.status === "d" || player.status === "s") {
                    playerName = $('<h2 class="ui sub header">' + player.first_name + ' ' + player.second_name + '</h4>');
                    $("#injuries-content").append(playerName);

                    var injuryInfo = $('<div>' + player.news + '</div>');
                    $("#injuries-content").append(injuryInfo);
                }
            }
        });

        if (playerName === undefined) {
            playerName = $('<h4 class="ui sub header">No Injuries</h4>');
            $("#injuries-content").append(playerName);
        }

        // GENERAL INFORMATION BOX
        $("#team-info-content").empty();
        // TOP SCORER

        var topScorerData = getTopScorer(teamId);
        var topScorerLabel = $('<h2 class="ui sub header">Top Scorer(s)</h2>');
        $("#team-info-content").append(topScorerLabel);
        for (var i = 0; i < topScorerData[0].length; i++) {
            var topScorer = $('<div>' + topScorerData[0][i] + ': ' + topScorerData[1] + ' goals</div>');
            $("#team-info-content").append(topScorer);
        }

        // CLEAN SHEETS
        var cleanSheetsData = getCleanSheets(teamId);
        var cleanSheetsLabel = $('<h2 class="ui sub header">Clean Sheets: ' + cleanSheetsData + '</h2>');
        $("#team-info-content").append(cleanSheetsLabel);

        // HOME RECORD
        var homeRecordLabel = $('<h2 class="ui sub header">Home Record</h2>');
        $("#team-info-content").append(homeRecordLabel);
        $.each(standing, function(index, team) {
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                var homeWins = $('<div>Wins: ' + team.home.wins + '</div>');
                $("#team-info-content").append(homeWins);
                var homeLosses = $('<div>Losses: ' + team.home.losses + '</div>');
                $("#team-info-content").append(homeLosses);
                var homeDraws = $('<div>Draws: ' + team.home.draws + '</div>');
                $("#team-info-content").append(homeDraws);
                var homeGoalsScored = $('<div>Goals Scored: ' + team.home.goals + '</div>');
                $("#team-info-content").append(homeGoalsScored);
                var homeGoalsAgainst = $('<div>Goals Against: ' + team.home.goalsAgainst + '</div>');
                $("#team-info-content").append(homeGoalsAgainst);
            }
        });

        // AWAY RECORD
        var awayRecordLabel = $('<h2 class="ui sub header">Away Record</h2>');
        $("#team-info-content").append(awayRecordLabel);
        $.each(standing, function(index, team) {
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                var awayWins = $('<div>Wins: ' + team.away.wins + '</div>');
                $("#team-info-content").append(awayWins);
                var awayLosses = $('<div>Losses: ' + team.away.losses + '</div>');
                $("#team-info-content").append(awayLosses);
                var awayDraws = $('<div>Draws: ' + team.away.draws + '</div>');
                $("#team-info-content").append(awayDraws);
                var awayGoalsScored = $('<div>Goals Scored: ' + team.away.goals + '</div>');
                $("#team-info-content").append(awayGoalsScored);
                var awayGoalsAgainst = $('<div>Goals Against: ' + team.away.goalsAgainst + '</div>');
                $("#team-info-content").append(awayGoalsAgainst);
            }
        });

        // STANDINGS
        $("#table-standings-content").empty();
        $.each(standing, function(index, team) {
            var tr = $('<tr>');
            if (team.teamName.toLowerCase().includes(getTeamName(teamId).toLowerCase())) {
                tr.addClass("negative");
            }
            var td = $('<td>' + team.position + '</td><td class="mobile-table">' +
                team.teamName + '</td><td class="desktop-table">' +
                getTeamId(team.teamName) + '</td><td class="mobile-table">' +
                team.playedGames + '</td><td>' +
                team.wins + '</td><td>' +
                team.draws + '</td><td>' +
                team.losses + '</td><td>' +
                team.goals + '</td><td>' +
                team.goalsAgainst + '</td><td class="mobile-table">' +
                team.goalDifference + '</td><td>' +
                team.points + '</td>');

            td.appendTo(tr);
            $("#table-standings-content").append(tr);
        });

        // NEWS
        $("#team-news-content").empty();
        var articleLabel = undefined;

        $.each(newsArray, function(index, newsArticle) {
            var tags = getTeamTags(teamId);

            $.each(tags, function(i, tag) {
                if (newsArticle.webTitle.toLowerCase().includes(tag.toLowerCase()) ||
                    newsArticle.webUrl.toLowerCase().includes(tag.toLowerCase())) {
                    articleLabel = $('<h2 class="ui sub header">' + newsArticle.webTitle + '</h2>');
                    $("#team-news-content").append(articleLabel);
                    var readMore = $('<div><a href=' + newsArticle.webUrl + ' target="_blank">Read More...</a></div>')
                    $("#team-news-content").append(readMore);
                    return false;
                }
            });
        });

        if (articleLabel === undefined) {
            articleLabel = $('<h2 class="ui sub header">No News</h2>');
            $("#team-news-content").append(articleLabel);
        }

    }

    /**
     * Helper function that gets team three letter code given API team ID
     */
    function getTeamCode(teamId) {
        var teamCode;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                teamCode = team.code;
                return false;
            }
        });

        return teamCode;
    }

    /**
     * Helper function that gets team name given API team ID
     */
    function getTeamName(teamId) {
        var teamName;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                teamName = team.name;
                return false;
            }
        });

        return teamName;
    }

    function getTeamId(teamName) {
        var teamId;
        $.each(teams, function(index, team) {
            if (team.name === teamName) {
                teamId = team.short_name;
                return false;
            }
        });

        return teamId;
    }

    /**
     * Get team's top goal scorer
     */
    function getTopScorer(teamId) {
        var teamCode = getTeamCode(teamId);
        var topScorer = [[], -1];
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode) {
                if (player.goals_scored > topScorer[1]) {
                    topScorer[0] = [];
                    topScorer[0].push(player.first_name + " " + player.second_name);
                    topScorer[1] = player.goals_scored;
                } else if (player.goals_scored === topScorer[1]) {
                    topScorer[0].push(player.first_name + " " + player.second_name);
                }
            }
        });

        return topScorer;
    }

    /**
     * Get team's clean sheets
     */
    function getCleanSheets(teamId) {
        var teamCode = getTeamCode(teamId);
        var cleanSheets = 0;
        $.each(eplData, function(index, player) {
            if (player.team_code === teamCode && player.element_type === 1) {
                cleanSheets += player.clean_sheets;
            }
        });

        return cleanSheets;
    }

    /**
     * This helper function assigns tags to each club so it will be easier to
     * identify news about each team
     */
    function setTeamsTag() {
        $.each(teams, function(index, team) {
            if (team.short_name === "ARS") {
                team.tag = ["Arsenal", "Gunners"];
            } else if (team.short_name === "BOU") {
                team.tag = ["Bournemouth", "Cherries"];
            } else if (team.short_name === "BUR") {
                team.tag = ["Burnley", "Clarets"];
            } else if (team.short_name === "CHE") {
                team.tag = ["Chelsea", "Blues"];
            } else if (team.short_name === "CRY") {
                team.tag = ["Palace", "Eagles"];
            } else if (team.short_name === "EVE") {
                team.tag = ["Everton", "Toffees"];
            } else if (team.short_name === "HUL") {
                team.tag = ["Hull", "Tigers"];
            } else if (team.short_name === "LEI") {
                team.tag = ["Leicester", "Foxes"];
            } else if (team.short_name === "LIV") {
                team.tag = ["Liverpool", "Reds"];
            } else if (team.short_name === "MCI") {
                team.tag = ["Manchester City", "Citizens"];
            } else if (team.short_name === "MUN") {
                team.tag = ["Manchester United", "United", "Red Devils"];
            } else if (team.short_name === "MID") {
                team.tag = ["Middlesbrough", "Boro"];
            } else if (team.short_name === "SOU") {
                team.tag = ["Southampton", "Saints"];
            } else if (team.short_name === "STK") {
                team.tag = ["Stoke", "Potters"];
            } else if (team.short_name === "SUN") {
                team.tag = ["Sunderland", "Black Cats"];
            } else if (team.short_name === "SWA") {
                team.tag = ["Swansea", "Swans"];
            } else if (team.short_name === "TOT") {
                team.tag = ["Tottenham", "Spurs"];
            } else if (team.short_name === "WAT") {
                team.tag = ["Watford", "Hornets"];
            } else if (team.short_name === "WBA") {
                team.tag = ["West Bromwich", "West Brom", "Albion", "Baggies"];
            } else if (team.short_name === "WHU") {
                team.tag = ["West Ham", "Irons"];
            }
        });
    }

    /**
     * Helper function to get team's tags given the teamId
     */
    function getTeamTags(teamId) {
        var tags;
        $.each(teams, function(index, team) {
            if (team.short_name === teamId) {
                tags = team.tag;
                return false;
            }
        });

        return tags;
    }

});
