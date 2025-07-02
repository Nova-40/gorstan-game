// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: trapEngine.js
// Path: src/engine/trapEngine.js


/**
 * trapEngine.js – Gorstan Game v3.2+ 
 * Handles trap seeding, activation, disarming, and diagnostics.
 * MIT License © 2025 Geoff Webster
 */

/**
 * Module-scoped object to track seeded traps by room ID.
 * Structure: { [roomId]: true }
 * Not persisted across reloads; only for the current session.
 */
let seededTraps = {};

/**
 * Debug mode toggle. If true, traps do not harm the player.
 * @type {boolean}
 */
let debugMode = false;

/**
 * seedTraps
 * Seeds traps randomly across the game world.
 *
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
 * isRoomTrapped
 * Checks if the current room has a trap.
 *
 * @param {string} roomId - The ID of the room to check.
 * @returns {boolean} - Returns true if the room is trapped, false otherwise.
 */
export function isRoomTrapped(roomId) {
  return !!seededTraps[roomId];
}

/**
 * handleRoomTrap
 * Handles trap activation when entering a trapped room.
 * Applies player traits/items for disarming, and returns a result object or null.
 *
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
 * handleTrapEscape
 * Handles trap escape when the player exits the room quickly.
 * Disarms the trap if present.
 *
 * @param {string} roomId - The ID of the room the player is escaping from.
 */
export function handleTrapEscape(roomId) {
  if (isRoomTrapped(roomId)) {
    delete seededTraps[roomId]; // Disarm the trap if the player exits quickly
    if (debugMode) console.info(`🚪 Trap in ${roomId} disarmed via quick escape.`);
  }
}

/**
 * listActiveTraps
 * Lists all active traps (for debug or god mode).
 *
 * @returns {string[]} - Returns a list of room IDs that currently have traps.
 */
export function listActiveTraps() {
  return Object.keys(seededTraps);
}

/**
 * enableDebugMode
 * Enables debug mode (traps do not harm the player).
 */
export function enableDebugMode() {
  debugMode = true;
}

/**
 * disableDebugMode
 * Disables debug mode (traps activate normally).
 */
export function disableDebugMode() {
  debugMode = false;
}

/**
 * maybeTriggerInquisitionTrap
 * Rare Easter Egg Trap: The Unexpected Inquisition.
 * 1% chance, harmless but funny, includes hidden player response detection.
 *
 * @param {string} roomId - The room ID where the event may occur.
 * @param {object} playerState - The current player state.
 * @param {function} appendMessage - Function to append narrative messages to the UI.
 */
export function maybeTriggerInquisitionTrap(roomId, playerState, appendMessage) {
  if (Math.random() < 0.01) {
    appendMessage(`⚠️ The air thickens. Robed figures burst in!`);
    appendMessage(`🟥 "NO ONE EXPECTS THE SPANISH INQUISITION!"`);
    appendMessage(`They interrogate you about improper codex dusting.`);

    if (playerState.command?.toLowerCase().includes("expect")) {
      appendMessage(`😲 They’re baffled by your cleverness and award you a certificate.`);
      playerState.score += 5;
    } else {
      appendMessage(`You sit in the comfy chair. Gain +1 health, lose -1 dignity.`);
      playerState.health = Math.min(playerState.health + 1, 10);
    }
  }
}

/**
 * maybeTriggerBugblatterTrap
 * Rare HHGTTG Trap: Ravenous Bugblatter Beast of Traal.
 * 1.42% chance of triggering in foggy or confusing rooms.
 *
 * @param {string} roomId - The room ID where the event may occur.
 * @param {object} playerState - The current player state.
 * @param {function} appendMessage - Function to append narrative messages to the UI.
 */
export function maybeTriggerBugblatterTrap(roomId, playerState, appendMessage) {
  if (Math.random() < 0.0142) {
    appendMessage(`🌌 You feel a strange presence. Something *very stupid* is watching you.`);
    appendMessage(`💥 A voice booms: "Beware the Ravenous Bugblatter Beast of Traal!"`);

    const hasTowel = playerState.inventory?.includes("towel");

    if (hasTowel) {
      appendMessage(`🧼 You wrap your towel around your head. The beast assumes you can't see it... and wanders off confused.`);
      appendMessage(`🧠 As Douglas Adams rightly pointed out, towels are invaluable for travel.`);
      playerState.traits = playerState.traits || [];
      if (!playerState.traits.includes("wise")) {
        playerState.traits.push("wise");
      }
      playerState.score += 3;
    } else {
      appendMessage(`😱 The beast slobbers all over your narrative. You lose 2 health.`);
      playerState.health -= 2;
    }
  }
}

// All functions are exported as named exports for use in trap, room, and event logic.
// TODO: Add persistence for traps, support for trap types, and more narrative trap events