/**
 * roomUtils.js – Gorstan v3.2.1
 * Unified utility functions for handling room metadata, logic, validation, and rendering.
 * © 2025 Geoff Webster – MIT License
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} name
 * @property {string[]} descriptions
 * @property {Object<string, string>} exits
 */

/**
 * Returns the ID of the initial room. Prefers 'controlnexus' if present.
 * @param {Room[]} rooms
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
 * @param {Room} room
 * @param {number} visitCount
 * @returns {string}
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
 * @param {Room} room
 * @returns {boolean}
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
 * @param {Room} room
 */
export function logInvalidRoom(room) {
  if (!isValidRoom(room)) {
    console.warn('⚠️ Invalid room detected:', room);
  }
}

/**
 * Extracts all unique exit targets from a room array.
 * @param {Room[]} rooms
 * @returns {Set<string>}
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
 * @param {Room[]} rooms
 * @returns {string[]}
 */
export function getRoomIds(rooms) {
  return Array.isArray(rooms) ? rooms.map(r => r.id) : [];
}

/**
 * Capitalises and formats a direction label.
 * @param {string} direction
 * @returns {string}
 */
export function formatDirectionLabel(direction) {
  const capitalised = direction.charAt(0).toUpperCase() + direction.slice(1);
  return capitalised;
}

/**
 * Generates a unique ID (used for items, puzzles, tracking).
 * @returns {string}
 */
export function generateUniqueId() {
  return uuidv4();
}

/**
 * Exported as grouped utility object
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



