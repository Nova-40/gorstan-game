// src/utils/roomNameMap.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// roomNameMap utility for Gorstan game.
// Creates a mapping of room IDs to their display names for easy reference throughout the application.

import allRooms from '../rooms/roomLoader'; // TODO: Ensure this import provides an array of room objects

/**
 * roomNameMap
 * Maps each room's unique ID to its display name.
 * Useful for tooltips, navigation, and debugging.
 *
 * @type {Object.<string, string>}
 */
const roomNameMap = {};

// Populate the mapping from the loaded rooms
for (const room of allRooms) {
  if (room.id && room.name) {
    roomNameMap[room.id] = room.name;
  }
}

// Export the mapping for use in UI and logic modules
export default roomNameMap;

// TODO: Handle dynamic room loading or async sources if room data is not static.
//       Consider schema validation for room objects if their structure is not guaranteed.