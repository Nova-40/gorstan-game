// src/engine/dialogueEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// dialogueEngine utility for Gorstan game.
// Provides a function to generate NPC dialogue based on the NPC and player state.

/**
 * getDialogue
 * Returns a dialogue string for the specified NPC, based on the current player state.
 *
 * @param {string} npc - The name of the NPC (e.g., 'Ayla', 'Polly').
 * @param {Object} state - The current player state (may include trust, flags, etc).
 * @returns {string} - The dialogue line for the NPC.
 */
export function getDialogue(npc, state) {
  switch (npc) {
    case 'Ayla':
      // Ayla's dialogue depends on the player's trust level
      return state?.trust > 3 ? "You're doing well." : "Try exploring more.";
    case 'Polly':
      return "Oh, you're still alive. How quaint.";
    default:
      // TODO: Add more NPCs and context-aware dialogue as needed.
      return "They stare at you silently.";
  }
}

// Exported as a named export for use in NPC interaction logic and