"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}


// Generate the HTML for a story
function generateStoryMarkup(story, showDeleteBtn = false) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}


// make a delete button for stories that user created
function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}


// make a favorite button (star)
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const star = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${star} fa-star"></i>
      </span>`;
}


// get stories from server and put them onto page
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  for (let story of storyList.stories) {   // loop through all of our stories and generate HTML for them
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}


// delete story and make new story list
async function deleteStory(evt) {
  console.debug("deleteStory");
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  await storyList.removeStory(currentUser, storyId);
  // re-generate story list
  await putUserStoriesOnPage();
}
$stories.on("click", ".trash-can", deleteStory);


// make a new story 
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();
  // grab all info from form
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username
  const storyData = { title, url, author, username };
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}
$submitForm.on("submit", submitNewStory);


// makes a users stories page
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
  $stories.empty();
  if (currentUser.stories.length === 0) {
    $stories.append("<h5>You don't have any stories yet!</h5>");
  } 
  else {
    for (let story of currentUser.stories) {  // loop through all of users stories and generate HTML for them
      let $story = generateStoryMarkup(story, true);
      $stories.append($story);
    }
  }
  $stories.show();
}


// makes a favorites page
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
  $favorited.empty();
  if (currentUser.favorites.length === 0) {
    $favorited.append("<h5>You don't have any favorites yet!</h5>");
  } 
  else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favorited.append($story);
    }
  }
  $favorited.show();
}


// check if a star has been favorited or unfavorited
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");
  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  if ($tgt.hasClass("fas")) {   // if currently a favorited, remove from fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } 
  else {  // if it is not favorited, change the star and add to fav list
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}
$storieList.on("click", ".star", toggleStoryFavorite);
