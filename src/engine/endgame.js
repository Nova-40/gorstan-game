// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: endgame.js
// Path: src/engine/endgame.js


// src/engine/endgame.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// endgame utility for Gorstan game.
// Generates the Stanton Harcourt endgame scene and handles endgame actions based on player and NPC state.

import { getAllNPCStates } from './npcMemory';

/**
 * generateStantonFinale
 * Generates the Stanton Harcourt endgame scene based on player's NPC trust levels.
 *
 * @param {Object} playerState - Full player state object.
 * @returns {Object} - Final narrative, room ID, score bonus, and flag.
 */
export function generateStantonFinale(playerState) {
  const npcStates = getAllNPCStates();
  const trustedAllies = Object.entries(npcStates)
    .filter(([_, data]) => data.trustLevel >= 2)
    .map(([npc]) => npc);

  let finaleText = '';
  let bonusScore = 0;
  const playerName = playerState.playerName || 'Wanderer';

  if (trustedAllies.length === 3) {
    finaleText = `As ${playerName} steps onto the quiet green at Stanton Harcourt, three familiar figures emerge from the mist: Ayla, Morthos, and Al. The village pub lights flicker on. "You did it," Al grins, quoting lyrics from a forgotten Earth song. Morthos grunts, "Not bad... for a meatbag." Ayla smiles, eyes glowing faintly: "You’ve aligned more than you know." The Harcourt Arms awaits.`;
    bonusScore = 100;
  } else if (trustedAllies.length === 2) {
    finaleText = `Two shadows fall in beside ${playerName} on the road to Stanton Harcourt. Trust was earned, but not everywhere. At the Harcourt Arms, warm cider flows — but an empty chair sits by the fire.`;
    bonusScore = 60;
  } else if (trustedAllies.length === 1) {
    finaleText = `${playerName} arrives to find one companion waiting — loyal and true. The village is quieter than expected. The pub door creaks open. You made it... sort of.`;
    bonusScore = 30;
  } else {
    finaleText = `Alone, ${playerName} walks the final path. No companions greet you. The wind whispers through hedgerows. Stanton Harcourt accepts you without celebration. In the pub, a dusty corner welcomes you with quiet resignation.`;
    bonusScore = 0;
  }

  const restartPrompt = 'Restart the multiverse? [Y/N]';
  const postCredits = `
    In the shadows of Stanton Harcourt, something stirs. A glimmer. A fragment.
    Somewhere, the Lattice still hums.
    Somewhere, the game has not truly ended.
  `;

  return {
    nextRoomId: 'stantonharcourt',
    messages: [
      { type: 'teletype', text: finaleText },
      { type: 'teletype', text: 'THE END (or is it...)' },
      { type: 'teletype', text: postCredits.trim() },
      { type: 'prompt', text: restartPrompt, action: 'restart' },
      { type: 'easteregg', trigger: 'N', action: 'declineRestart', text: 'Multiverse sulks silently... until a pigeon outside coos “Try again?”' },
      { type: 'godcommand', trigger: '/godrestart', action: 'instantreset', text: '🌀 Divine override accepted. Resetting all timelines...' }
    ],
    flags: { endgameCompleted: true },
    score: bonusScore
  };
}

/**
 * triggerEndgameAction
 * Handles special endgame commands such as declining restart or godmode reset.
 *
 * @param {string} command - The command entered by the player (e.g., 'N', '/godrestart').
 * @param {Object} playerState - The current player state.
 * @param {Function} [dispatch] - Optional dispatch function for state updates (not used here).
 * @returns {Object|null} - Action result object or null if no action.
 */
export function triggerEndgameAction(command, playerState, dispatch) {
  // Handle declining restart
  if (command === 'N') {
    return {
      message: 'Multiverse sulks silently... until a pigeon outside coos “Try again?”',
      action: 'noop'
    };
  }

  // Handle godmode instant reset
  if (command === '/godrestart' && playerState.isGodMode) {
    return {
      message: '🌀 Divine override accepted. Resetting all timelines...',
      action: 'reset'
    };
  }

  // TODO: Add more endgame actions or custom logic as needed.
  return null; // no action
}

// Exported as named exports for use in the main game engine and other modules



