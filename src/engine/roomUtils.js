// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: roomUtils.js
// Path: src/engine/roomUtils.js


/**
 * roomUtils.js – Gorstan v3.9.9
 * Unified utility functions for handling room metadata, logic, validation, and rendering.
 * © 2025 Geoff Webster – MIT License
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} Room
 * @property {string} id - Unique room identifier.
 * @property {string} name - Display name of the room.
 * @property {string[]} descriptions - Array of room descriptions (for visit cycling).
 * @property {Object<string, string>} exits - Mapping of directions to room IDs.
 */

/**
 * Returns the ID of the initial room. Prefers 'controlnexus' if present.
 * Falls back to the first room in the array or 'introstart' if empty.
 * @param {Room[]} rooms - Array of room objects.
 * @returns {string} ID of the initial room.
 */
export function getInitialRoomId(rooms) {
  if (!Array.isArray(rooms) || rooms.length === 0) return 'introstart';
  const preferredStart = rooms.find(room => room.id === 'controlnexus');
  return preferredStart ? preferredStart.id : rooms[0].id;
}

/**
 * Chooses a description based on visit count.
 * Falls back to the last description if out of bounds.
 * @param {Room} room - The room object.
 * @param {number} visitCount - Number of times the room has been visited.
 * @returns {string} - The selected description.
 */
export function getRoomDescription(room, visitCount = 0) {
  if (!room || !Array.isArray(room.descriptions) || room.descriptions.length === 0) {
    return '[No description available]';
  }
  const index = Math.min(visitCount, room.descriptions.length - 1);
  return room.descriptions[index];
}

/**
 * Validates if a room matches expected structure.
 * Checks for required fields and correct types.
 * @param {Room} room - The room object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function isValidRoom(room) {
  return (
    room &&
    typeof room.id === 'string' &&
    typeof room.name === 'string' &&
    Array.isArray(room.descriptions) &&
    room.descriptions.every(desc => typeof desc === 'string') &&
    typeof room.exits === 'object' &&
    room.exits !== null &&
    Object.values(room.exits).every(exitId => typeof exitId === 'string')
  );
}

/**
 * Logs a warning if room is invalid.
 * @param {Room} room - The room object to check.
 */
export function logInvalidRoom(room) {
  if (!isValidRoom(room)) {
    console.warn('⚠️ Invalid room detected:', room);
  }
}

/**
 * Extracts all unique exit targets from a room array.
 * Useful for validating world connectivity.
 * @param {Room[]} rooms - Array of room objects.
 * @returns {Set<string>} - Set of unique exit destination IDs.
 */
export function getAllExitDestinations(rooms) {
  const destinations = new Set();
  for (const room of rooms) {
    if (room.exits && typeof room.exits === 'object') {
      Object.values(room.exits).forEach(dest => destinations.add(dest));
    }
  }
  return destinations;
}

/**
 * Gets a list of all room IDs.
 * @param {Room[]} rooms - Array of room objects.
 * @returns {string[]} - Array of room IDs.
 */
export function getRoomIds(rooms) {
  return Array.isArray(rooms) ? rooms.map(r => r.id) : [];
}

/**
 * Capitalises and formats a direction label for display.
 * @param {string} direction - Direction string (e.g., 'north').
 * @returns {string} - Capitalised direction label.
 */
export function formatDirectionLabel(direction) {
  const capitalised = direction.charAt(0).toUpperCase() + direction.slice(1);
  return capitalised;
}

/**
 * Generates a unique ID (used for items, puzzles, tracking).
 * @returns {string} - A new UUID string.
 */
export function generateUniqueId() {
  return uuidv4();
}

/**
 * Exported as grouped utility object for convenience import.
 */
const RoomUtils = {
  getInitialRoomId,
  isValidRoom,
  getRoomDescription,
  logInvalidRoom,
  getAllExitDestinations,
  getRoomIds,
  formatDirectionLabel,
  generateUniqueId
};

export default RoomUtils;

// All functions and RoomUtils object are exported for use in room logic, validation, and rendering.
// TODO: Expand with more room utilities as world schema or logic


