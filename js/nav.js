"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();   // main.js
  putStoriesOnPage();    // stories.js
}
$body.on("click", "#nav-all", navAllStories);


/** Show story submit form on clicking story "submit" */
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();     // main.js
  $allStoriesList.show();
  $submitForm.show();
}
$navSubmitStory.on("click", navSubmitStoryClick);


// show favorited story page when #nav-favorites is click
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();   // main.js
  putFavoritesListOnPage();   // stories.js
}
$body.on("click", "#nav-favorites", navFavoritesClick);


// show users own stories when clicking on #nav-my-stories
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();   // main.js
  putUserStoriesOnPage();   // stories.js
  $stories.show();
}
$body.on("click", "#nav-my-stories", navMyStories);


// show login/ signup page 
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();   // main.js
  $loginForm.show();
  $signupForm.show();
  $storiesContainer.hide()
}
$navLogin.on("click", navLoginClick);


// show user profile page
function navProfileClick(evt) {
  console.debug("navProfileClick", evt);
  hidePageComponents();   // main.js
  $user.show();
}
$navUserProfile.on("click", navProfileClick);


// update nav when user logs in
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").css('display', 'flex');;
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
