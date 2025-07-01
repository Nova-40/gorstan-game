// src/engine/sceneEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// sceneEngine utility for Gorstan game.
// Reusable interactive scene system for executing narrative events and branching logic.

/**
 * runScene
 * Executes interactive narrative scenes based on a scene ID.
 * Handles scene-specific messaging and game state updates.
 *
 * @param {string} sceneId - Unique identifier for the scene to run.
 * @param {Object} context - Context object (may include player, room, or flags).
 * @param {function} appendMessage - Function to append narrative messages to the UI.
 * @param {function} setGameState - Function to update the game state.
 */
export function runScene(sceneId, context, appendMessage, setGameState) {
  if (sceneId === 'goldfishEscape') {
    appendMessage('💦 The orb tank is heavy. Water sloshes out, soaking your feet.');
    appendMessage('🐟 The fish stares at you. Do you really want to take Dominic out of water?');
    appendMessage('⚠️ Taking him might upset Polly — it’s the only thing she really cares about.');
    setGameState((prev) => ({
      ...prev,
      flags: { ...prev.flags, tookDominic: true }
    }));
  }
  // TODO: Add more scenes and branching logic as narrative expands.
}

// Exported as a named export for use in event, quest, and
