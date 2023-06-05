"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();
  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();
  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);
  $signupForm.trigger("reset");
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}
$signupForm.on("submit", login);


// handle signup submission
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();
  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $signupForm.trigger("reset");
}
$signupForm.on("submit", signup);


// when a user logouts
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}
$navLogOut.on("click", logout);


// using local storage to automatically log a user in / check to see if they were logged in
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;
  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}


// setting local storage when a use logs in
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}


// updated webpage when a user logs in
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();   // main.js
  putStoriesOnPage();   // stories.js
  $allStoriesList.show();
  updateNavOnLogin();  // nav.js
  generateUserProfile();  
  $storiesContainer.show();
}


// add a user profile page
function generateUserProfile() {
  console.debug("generateUserProfile");
  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}
