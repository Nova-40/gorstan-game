// Gorstan Game v3.1.4 – commandParser.js
// MIT License © 2025 Geoff Webster

// src/engine/commandParser.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// commandParser utility for Gorstan game.
// Parses and applies player commands, updating inventory, traits, flags, and handling movement or endgame triggers.

import { triggerEndgameAction } from './endgame';

/**
 * Aliases for common player commands to support flexible input.
 */
const aliases = {
  grab: 'pick up',
  take: 'pick up',
  examine: 'inspect',
  look: 'inspect',
  toss: 'drop',
  move: 'go',
  inv: 'inventory',
  i: 'inventory'
};

/**
 * applyCommand
 * Parses and applies a player command, updating state and returning results.
 *
 * @param {Object} params - Command context and player state.
 * @param {string} params.input - The raw player input.
 * @param {Object} params.currentRoom - The current room object.
 * @param {Array} params.inventory - The player's inventory.
 * @param {Array} params.traits - The player's traits.
 * @param {Object} params.flags - The player's flags.
 * @param {string} params.playerName - The player's name.
 * @param {boolean} [params.debug=false] - If true, includes debug output.
 * @returns {Object} - Result object with messages, nextRoomId, and updated state.
 */
const applyCommand = ({
  input,
  currentRoom,
  inventory,
  traits,
  flags,
  playerName,
  debug = false
}) => {
  // Normalize and resolve input using aliases
  const trimmedInput = input.trim().toLowerCase();
  const resolvedInput = aliases[trimmedInput] || trimmedInput;
  const responses = [];
  let nextRoomId = null;
  let updatedInventory = [...inventory];
  let updatedTraits = [...traits];
  let updatedFlags = { ...flags };
  let scoreDelta = 0;

  // Inventory limit logic: runbag increases capacity
  const hasRunBag = updatedInventory.includes('runbag');
  const inventoryLimit = hasRunBag ? 12 : 5;

  /**
   * promptItem
   * Helper to prompt the player for a specific item action.
   * @param {string} action - The action to prompt for.
   * @returns {Array<string>}
   */
  const promptItem = (action) => [`What would you like to ${action}?`];

  // Endgame triggers
  if (updatedFlags.endgameCompleted) {
    if (resolvedInput === 'y') {
      return triggerEndgameAction('restart', { playerName, inventory, traits, flags });
    } else if (resolvedInput === 'n') {
      return triggerEndgameAction('declineRestart', { playerName, inventory, traits, flags });
    } else if (resolvedInput === '/godrestart' && updatedTraits.includes('godmode')) {
      return triggerEndgameAction('instantreset', { playerName, inventory, traits, flags });
    }
  }

  /**
   * commandHandlers
   * Maps normalized commands to their handler functions.
   * Each handler returns an object with a messages array and may update state.
   */
  const commandHandlers = {
    'pick up': () => ({ messages: promptItem('pick up') }),
    'pickup': () => ({ messages: promptItem('pick up') }),
    'use': () => ({ messages: promptItem('use') }),
    'drop': () => ({ messages: promptItem('drop') }),
    'inspect': () => ({ messages: promptItem('inspect') }),
    'jump': (context) => {
      const { inventory } = context;
      if (!inventory?.includes('coffee')) {
        return { messages: ['You try to jump, but your hands are empty. No coffee, no go.'] };
      }
      if (flags?.previousRoomId) {
        nextRoomId = flags.previousRoomId;
        return { messages: ['You jump back to where you came from.'] };
      }
      return { messages: ['There is nowhere to jump back to.'] };
    },
    'inventory': () => ({ messages: [`Inventory: ${updatedInventory.join(', ') || 'Empty'}`] })
  };

  // Debug output if enabled
  if (debug) {
    responses.push(`🛠 Debug: resolved input -> '${resolvedInput}'`);
  }

  // Handle direct command matches
  if (commandHandlers[resolvedInput]) {
    const result = commandHandlers[resolvedInput]({ inventory: updatedInventory });
    return {
      ...result,
      nextRoomId,
      updates: {
        inventory: updatedInventory,
        traits: updatedTraits,
        flags: updatedFlags,
        scoreDelta,
      },
    };
  }

  // Handle "pick up [item]" command
  if (resolvedInput.startsWith('pick up ')) {
    const item = resolvedInput.replace('pick up ', '');
    if (!item) return { messages: ['Pick up what?'] };
    if (updatedInventory.length >= inventoryLimit) {
      responses.push(`⚠️ Your ${hasRunBag ? 'run bag' : 'pockets'} are overloaded! Everything spills onto the floor.`);
      updatedInventory = [];
    }
    updatedInventory.push(item);
    responses.push(`You picked up the ${item}.`);
  }

  // Handle "use [item]" command
  if (resolvedInput.startsWith('use ')) {
    const item = resolvedInput.replace('use ', '');
    if (!item) return { messages: ['Use what?'] };
    if (!updatedInventory.includes(item)) return { messages: [`You don't have a ${item}.`] };
    responses.push(`You used the ${item}.`);
  }

  // Handle "drop [item]" command
  if (resolvedInput.startsWith('drop ')) {
    const item = resolvedInput.replace('drop ', '');
    if (!updatedInventory.includes(item)) return { messages: [`You don't have a ${item}.`] };
    updatedInventory = updatedInventory.filter(i => i !== item);
    responses.push(`You dropped the ${item}.`);
  }

  // Handle "inspect [item]" command
  if (resolvedInput.startsWith('inspect ')) {
    const item = resolvedInput.replace('inspect ', '');
    responses.push(`You inspect the ${item}. It might be important...`);
  }

  // Directional movement: check if the resolved input matches an exit
  if (currentRoom?.exits?.[resolvedInput]) {
    updatedFlags.previousRoomId = currentRoom.id;
    nextRoomId = currentRoom.exits[resolvedInput];
    responses.push(`You move ${resolvedInput}.`);
  }

  // Return the result object with updated state and messages
  return {
    nextRoomId,
    updates: {
      inventory: updatedInventory,
      traits: updatedTraits,
      flags: updatedFlags,
      scoreDelta,
    },
    messages: responses,
  };
};

// Export the applyCommand function for use in the main game engine and UI
export { applyCommand };