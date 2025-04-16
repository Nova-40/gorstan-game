/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Jest testing framework configuration.
 */

export default {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  }
};
