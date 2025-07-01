// src/engine/deathEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// deathEngine utility for Gorstan game.
// Handles fatal trap resolution and soft resets, returning the next room and updated flags.

/**
 * handlePlayerDeath
 * Resolves player death events, returning the next room, death message, and updated flags.
 *
 * @param {Object} playerState - The current player state (should include flags).
 * @param {string} [cause='unknown'] - The cause of death (e.g., 'trap', 'glitch', 'npc').
 * @returns {Object} - Object with nextRoomId, messages, and updated flags.
 */
export function handlePlayerDeath(playerState, cause = 'unknown') {
  const deathMessage = getDeathMessage(cause);
  return {
    nextRoomId: 'introsplat',
    messages: [
      deathMessage,
      'You awaken again, somehow... The multiverse is not done with you.'
    ],
    flags: {
      ...playerState.flags,
      player_splatted: true,
      lastDeathCause: cause
    }
  };
}

/**
 * getDeathMessage
 * Returns a narrative string based on the cause of death.
 *
 * @param {string} cause - The cause of death.
 * @returns {string} - The death message.
 */
function getDeathMessage(cause) {
  switch (cause) {
    case 'trap':
      return 'Your foot slips — and the room fills with gas.';
    case 'glitch':
      return 'Reality folds in on itself. You vanish with a scream.';
    case 'npc':
      return "They warned you. You didn't listen. That was your last mistake.";
    default:
      return 'You feel a sudden chill... then nothing.';
  }
}

// Exported as a named export for use in the main game engine and UI.
// TODO: Expand with more death causes or custom logic as the game grows.
