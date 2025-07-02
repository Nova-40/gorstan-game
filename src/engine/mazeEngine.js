// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: mazeEngine.js
// Path: src/engine/mazeEngine.js


// src/engine/mazeEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// mazeEngine utility for Gorstan game.
// Provides functions to determine maze room logic and random maze navigation.

/**
 * isInMaze
 * Checks if the given room ID corresponds to a maze room.
 *
 * @param {string} roomId - The unique ID of the room.
 * @returns {boolean} - True if the room is part of the maze, false otherwise.
 */
export function isInMaze(roomId) {
  return roomId.toLowerCase().includes("maze");
}

/**
 * nextMazeRoom
 * Returns the next maze room ID, chosen randomly from a set of options.
 *
 * @param {string} current - The current room ID (not used in this implementation).
 * @returns {string} - The next maze room ID.
 */
export function nextMazeRoom(current) {
  const options = ["stillamazeroom", "anothermazeroom", "forgottonchamber"];
  // TODO: Consider using the current room to avoid immediate repeats or dead ends.
  return options[Math.floor(Math.random() * options.length)];
}

// Exported as named exports for use in maze navigation and