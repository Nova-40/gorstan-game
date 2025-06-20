/**
 * trapEngine.js – Gorstan Game v3.2+ 
 * Handles trap seeding, activation, disarming, and diagnostics.
 * MIT License © 2025 Geoff Webster
 */

let seededTraps = {}; // { roomId: true } structure to track traps
let debugMode = false; // Toggle for debug mode (no harm from traps)

/**
 * Seeds traps across the game world randomly.
 * @param {string[]} roomIds - Array of valid room IDs where traps will be seeded.
 * @param {number} count - Number of traps to seed. Default is 5.
 */
export function seedTraps(roomIds = [], count = 5) {
  if (!Array.isArray(roomIds) || roomIds.length === 0) {
    console.warn("Warning: No valid room IDs provided for seeding traps.");
    return;
  }

  seededTraps = {}; // Reset the traps
  const shuffled = [...roomIds].sort(() => 0.5 - Math.random()); // Shuffle the rooms to randomize trap placement
  shuffled.slice(0, count).forEach(id => {
    seededTraps[id] = true; // Mark the room as trapped
  });

  if (debugMode) {
    console.info('🧨 Traps seeded in rooms:', Object.keys(seededTraps));
  }
}

/**
 * Checks if the current room has a trap.
 * @param {string} roomId - The ID of the room to check.
 * @returns {boolean} - Returns true if the room is trapped, false otherwise.
 */
export function isRoomTrapped(roomId) {
  return !!seededTraps[roomId];
}

/**
 * Handles trap activation when entering a trapped room.
 * @param {string} roomId - The ID of the room entered by the player.
 * @param {object} playerState - The current state of the player (inventory, traits, etc.).
 * @returns {object|null} - Returns an object with damage message if the trap is triggered, or null if no trap.
 */
export function handleRoomTrap(roomId, playerState) {
  if (!isRoomTrapped(roomId)) return null; // No trap in the room

  if (debugMode) return { message: `Trap in ${roomId} triggered but harmless in debug mode.` };

  // Check if the player has a trait or item to disarm the trap (e.g., "resistant" trait, "trapkit" item)
  const hasShield = playerState.traits?.includes('resistant') || playerState.items?.includes('trapkit');
  if (hasShield) {
    delete seededTraps[roomId]; // Disarm the trap if the player has the shield
    return { message: `You sense danger in ${roomId} but neutralize it with your gear.` };
  }

  return {
    damage: 1, // Example damage value
    message: `💥 A hidden trap activates in ${roomId}! You take damage.`
  };
}

/**
 * Handles trap escape when the player exits the room quickly.
 * @param {string} roomId - The ID of the room the player is escaping from.
 */
export function handleTrapEscape(roomId) {
  if (isRoomTrapped(roomId)) {
    delete seededTraps[roomId]; // Disarm the trap if the player exits quickly
    if (debugMode) console.info(`🚪 Trap in ${roomId} disarmed via quick escape.`);
  }
}

/**
 * Lists all active traps (for debug or god mode).
 * @returns {string[]} - Returns a list of room IDs that currently have traps.
 */
export function listActiveTraps() {
  return Object.keys(seededTraps);
}

/**
 * Enables debug mode (traps do not harm the player).
 */
export function enableDebugMode() {
  debugMode = true;
}

/**
 * Disables debug mode (traps activate normally).
 */
export function disableDebugMode() {
  debugMode = false;
}


