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
var game = {
    email:"",
    name:"",
    teamName:""

};


// FUNCTION THAT DYNAMICALLY CREATES THE HOMEPAGE (SIGNUP PAGE) HTML/CSS
var makeSignUpPage = function(){

    // EMPTY THE PAGE AND START BUILDING IT
    $(".container").empty();

    // THE PAGE HAS A FORM WITH EMAIL, NAME, PASSWORD, TEAM NAME

    var form = $("<form>").addClass("panel-body");

    var formGroupEmail = $("<div>").addClass("form-group");

    var labelEmail = $("<label>").addClass("form-group").attr("for","email").text("Email Address: ");

    var inputEmail = $("<input>").addClass("form-control");

    inputEmail.attr({
        "type": "email",
        "id": "email"
    });

    var formGroupName = $("<div>").addClass("form-group");

    var labelName = $("<label>").addClass("form-group").text("Name: ");

    var inputName = $("<input>").addClass("form-control");

    inputName.attr({
        "type": "text",
        "id": "name"
    });

    var formGroupTeamName = $("<div>").addClass("form-group");

    var labelTeamName = $("<label>").addClass("form-group").text("Team Name: ");

    var inputTeamName = $("<input>").addClass("form-control");

    inputTeamName.attr({
        "type": "text",
        "id": "teamName"
    });


    var formGroupPwd = $("<div>").addClass("form-group");

    var labelPwd = $("<label>").addClass("form-group").attr("for","pwd").text("Password: ");

    var inputPwd = $("<input>").addClass("form-control");

    inputPwd.attr({
        "type": "password",
        "id": "pwd"
    });

    var signUpBtn = $("<button>").addClass("btn btn-default").text("Sign Up");

    signUpBtn.attr({
        "type": "submit",
        "id": "signUp"
    });

    // THIS BUTTON WILL CHANGE THE FORM INTO "LOG IN" MODE
    var logInBtn = $("<button>").addClass("btn btn-default").text("Go to Log In");

    logInBtn.attr({
        "type": "submit",
        "id": "goToLogIn"
    });

    formGroupEmail.append(labelEmail);
    formGroupEmail.append(inputEmail);
    formGroupPwd.append(labelPwd);
    formGroupPwd.append(inputPwd);
    formGroupName.append(labelName);
    formGroupName.append(inputName);
    formGroupTeamName.append(labelTeamName);
    formGroupTeamName.append(inputTeamName);


    form.append(formGroupEmail);
    form.append(formGroupPwd);
    form.append(formGroupName);
    form.append(formGroupTeamName);
    form.append(signUpBtn);
    form.append(logInBtn);

    $(".container").append(form);

};


// THIS FUNCTION DYNAMICALLY CREATES THE LOG IN PAGE HTML/CSS
var makeLogInPage = function(){

    $(".container").empty();

    var form = $("<form>").addClass("panel-body");

    var formGroupEmail = $("<div>").addClass("form-group");

    var labelEmail = $("<label>").addClass("form-group").attr("for","email").text("Email Address: ");

    var inputEmail = $("<input>").addClass("form-control");

    inputEmail.attr({
        "type": "email",
        "id": "email"
    });


    var formGroupPwd = $("<div>").addClass("form-group");

    var labelPwd = $("<label>").addClass("form-group").attr("for","pwd").text("Password: ");

    var inputPwd = $("<input>").addClass("form-control");

    inputPwd.attr({
        "type": "password",
        "id": "pwd"
    });

    var logInBtn = $("<button>").addClass("btn btn-default").text("log In");

    logInBtn.attr({
        "type": "submit",
        "id": "logIn"
    });

    formGroupEmail.append(labelEmail);
    formGroupEmail.append(inputEmail);
    formGroupPwd.append(labelPwd);
    formGroupPwd.append(inputPwd);

    form.append(formGroupEmail);
    form.append(formGroupPwd);
    form.append(logInBtn);

    $(".container").append(form);

};

// THIS FUNCTION DYNAMICALLY CREATES THE USER PROFILE PAGE AFTER LOGGING IN
// var makeProfilePage = function(){
//     $(".container").empty();
//
//     var welcomeDiv = $("<div>").text("Hello " + keyId.name + "!!");
//     welcomeDiv.attr("id", "welcome");
//
//     var formLogOut = $("<form>").addClass("panel-body");
//
//     // THIS BUTTON WILL TAKE THE USER OUT OF THE PROFILE AND INTO THE HOMEPAGE
//     var logOutBtn = $("<button>").addClass("btn btn-default").text("Log Out");
//
//     logOutBtn.attr({
//         "type": "submit",
//         "id": "logOut"
//     });
//
//     formLogOut.append(logOutBtn);
//
//     $(".container").append(formLogOut);
// };

///// USER REGISTRATION LOGIC

var showSignUpBox = function() {

    // FIRST WE CREATE THE SIGN UP PAGE/HOMEPAGE
    makeSignUpPage();

    // THEN WE LISTEN TO WHAT THE USER DOES

    // ACTIONS AFTER CLICKING ON THE SIGN UP BUTTON
    $(document).on("click","#signUp", function(event) {

        event.preventDefault();

        // STORE INPUT VALUES INTO VARIABLES SO WE CAN USE LATER
        game.email = $("#email").val();
        game.name = $("#name").val();
        game.teamName = $("#teamName").val();

        firebase.auth().createUserWithEmailAndPassword(game.email, $("#pwd").val()).catch(function(error) {
            // Handle Errors here.
            console.log(error.code);
            console.log(error.message);
            // ...
        });

        // CREATE A NODE IN OUR DATABASE WITH THIS USER'S INFORMATION
        usersRef.push({
            email: game.email,
            name: game.name,
            teamName: game.teamName
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
//// HAD TO COPY PASTE THE ENTIRE FUNCTION IN EACH PLACE FOR NOW.
//// HAVING ISSUES WITH VARIABLES BEING UNDEFINED

// var showLoggedInBox = function() {
//
//     // FIRST, CREATE THE PAGE
//     // makeProfilePage();
//     $(document).on("click", "#logOut", function (event) {
//
//         event.preventDefault();
//
//         firebase.auth().signOut().then(function() {
//             showSignUpBox();// Sign-out successful.
//         }).catch(function(error) {
//             console.log(error.code);// An error happened.
//             console.log(error.message);// An error happened.
//         });
//     });
// };

///// USER LOG IN LOGIC

var showLoginBox = function() {
    // FIRST, CREATE THE LOG IN FORM/PAGE
    makeLogInPage();

    // ACTION TAKEN WHEN CLICKING ON THE LOG IN BUTTON
    $(document).on("click","#logIn",function(event) {

        event.preventDefault();

        firebase.auth().signInWithEmailAndPassword($("#email").val(), $("#pwd").val()).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            // ...
        });

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                usersRef.on("child_added",function(snapshot){

                    var keyId = snapshot.val();


                    if(keyId.email === user.email){

                        $(".container").empty();

                        var welcomeDiv = $("<div>").text("Hello " + keyId.name + "!!");
                        welcomeDiv.attr("id", "welcome");

                        var formLogOut = $("<form>").addClass("panel-body");

                        // THIS BUTTON WILL TAKE THE USER OUT OF THE PROFILE AND INTO THE HOMEPAGE
                        var logOutBtn = $("<button>").addClass("btn btn-default").text("Log Out");

                        logOutBtn.attr({
                            "type": "submit",
                            "id": "logOut"
                        });

                        formLogOut.append(welcomeDiv);
                        formLogOut.append(logOutBtn);

                        $(".container").append(formLogOut);

                        $(document).on("click", "#logOut", function (event) {

                            event.preventDefault();

                            firebase.auth().signOut().then(function() {
                                showSignUpBox();// Sign-out successful.
                            }).catch(function(error) {
                                console.log(error.code);// An error happened.
                                console.log(error.message);// An error happened.
                            });
                        });

                        // showLoggedInBox();
                        // User is signed in.
                    }


                });

            }
        });

    });
};

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        usersRef.on("child_added",function(snapshot){

            var keyId = snapshot.val();


            if(keyId.email === user.email){

                $(".container").empty();

                var welcomeDiv = $("<div>").text("Hello " + keyId.name + "!!");
                welcomeDiv.attr("id", "welcome");

                var formLogOut = $("<form>").addClass("panel-body");

                // THIS BUTTON WILL TAKE THE USER OUT OF THE PROFILE AND INTO THE HOMEPAGE
                var logOutBtn = $("<button>").addClass("btn btn-default").text("Log Out");

                logOutBtn.attr({
                    "type": "submit",
                    "id": "logOut"
                });

                formLogOut.append(welcomeDiv);
                formLogOut.append(logOutBtn);

                $(".container").append(formLogOut);

                $(document).on("click", "#logOut", function (event) {

                    event.preventDefault();

                    firebase.auth().signOut().then(function() {
                        showSignUpBox();// Sign-out successful.
                    }).catch(function(error) {
                        console.log(error.code);// An error happened.
                        console.log(error.message);// An error happened.
                    });
                });
                // showLoggedInBox();
                // User is signed in.
            }


        });

    }else{
        showSignUpBox();
    }
});
