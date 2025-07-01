// src/engine/trapController.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// trapController utility for Gorstan game.
// Handles trap seeding, detection, disarming, and debugging for room-based traps.
// Traps are stored in-memory for the current session and can be extended for persistence.

/**
 * In-memory trap state for simplicity. Could be persisted or stored in flags.
 * @type {Object.<string, Object>}
 */
const activeTraps = {};

/**
 * seedTraps
 * Seeds traps randomly across provided room keys.
 * Each room has a 20% chance to receive a trap.
 *
 * @param {string[]} roomKeys - Array of room IDs or names to seed with traps.
 */
export function seedTraps(roomKeys) {
  roomKeys.forEach((room) => {
    if (Math.random() < 0.2) { // 20% chance
      activeTraps[room] = {
        description: 'A hidden pressure plate clicks beneath your foot!',
        autoDisarm: false,
        severity: 'moderate',
      };
    }
  });
  console.log('[TrapEngine] Traps seeded:', activeTraps);
}

/**
 * getTrap
 * Returns trap data if a room is trapped.
 *
 * @param {string} roomName - The room's unique name or ID.
 * @returns {Object|null} - Trap object if present, otherwise null.
 */
export function getTrap(roomName) {
  return activeTraps[roomName] || null;
}

/**
 * checkForTrap
 * Checks and returns a trap message if a trap is present in the room.
 *
 * @param {string} roomName - The room's unique name or ID.
 * @returns {string|null} - Trap warning message or null if no trap.
 */
export function checkForTrap(roomName) {
  const trap = getTrap(roomName);
  return trap ? `⚠️ Trap triggered: ${trap.description}` : null;
}

/**
 * disarmTrap
 * Removes a trap from the specified room.
 *
 * @param {string} roomName - The room's unique name or ID.
 */
export function disarmTrap(roomName) {
  delete activeTraps[roomName];
  console.log(`[TrapEngine] Trap disarmed in ${roomName}`);
}

/**
 * listActiveTraps
 * Returns all currently active traps (mainly for debugging).
 *
 * @returns {Object} - Object mapping room names/IDs to trap data.
 */
export function listActiveTraps() {
  return activeTraps;
}

// All functions are exported as named exports for use in room, event, and debug logic.
// TODO: Add persistence for traps, support for trap types, and player-specific trap states


