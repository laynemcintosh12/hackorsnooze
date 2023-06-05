"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {storyId, title, author, url, username, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }
  /** Parses hostname out of URL and returns it. */
  getHostName() {
    return new URL(this.url).host;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }
  /** Generate a new StoryList.**/
  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });
    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));
    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }
  /** Adds story data to API, makes a Story instance, adds it to story list. **/
  async addStory(user, { title, author, url }) {
    const token = user.loginToken;
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: { title, author, url } },
    });
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.stories.unshift(story);
    return story;
  }
  /** Delete story from API and remove from the story lists. **/
  async removeStory(user, storyId) {
    const token = user.loginToken;
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });
    // filter out the story whose ID we are removing
    this.stories = this.stories.filter(story => story.storyId !== storyId);
    user.stories = user.stories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */
class User {
  /** Make user instance from obj of user data and a token: **/
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                stories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    // make story instances for the user's favorites and stories    
    this.favorites = favorites.map(s => new Story(s));
    this.stories = stories.map(s => new Story(s));
    this.loginToken = token;
  }
  /** Register new user in API, make User instance & return it. **/
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    let { user } = response.data;
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        stories: user.stories
      },
      response.data.token
    );
  }
  /** Login in user with API, make User instance & return it.**/
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });
    let { user } = response.data;
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        stories: user.stories
      },
      response.data.token
    );
  }
  // log in a user if they have stored credentials, use try and catch incase something goes wrong
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      let { user } = response.data;
      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          stories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  // function to add a favorite story
  async addFavorite(story) {
    this.favorites.push(story);
    await this._addOrRemoveFavorite("add", story)
  }
  // function to remove a favorite story
  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }
  // update api with new favorites
  async _addOrRemoveFavorite(newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }
  // function to see if story is favorited
  isFavorite(story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
}
