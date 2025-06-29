// Gorstan Game v3.1.4 – commandParser.js
// MIT License © 2025 Geoff Webster

// src/engine/commandParser.js

import { triggerEndgameAction } from './endgame';

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

const applyCommand = ({ input, currentRoom, inventory, traits, flags, playerName, debug = false }) => {
  const trimmedInput = input.trim().toLowerCase();
  const resolvedInput = aliases[trimmedInput] || trimmedInput;
  const responses = [];
  let nextRoomId = null;
  let updatedInventory = [...inventory];
  let updatedTraits = [...traits];
  let updatedFlags = { ...flags };
  let scoreDelta = 0;

  const hasRunBag = updatedInventory.includes('runbag');
  const inventoryLimit = hasRunBag ? 12 : 5;

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

  if (debug) {
    responses.push(`🛠 Debug: resolved input -> '${resolvedInput}'`);
  }

  if (commandHandlers[resolvedInput]) {
    const result = commandHandlers[resolvedInput]();
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

  if (resolvedInput.startsWith('use ')) {
    const item = resolvedInput.replace('use ', '');
    if (!item) return { messages: ['Use what?'] };
    if (!updatedInventory.includes(item)) return { messages: [`You don't have a ${item}.`] };
    responses.push(`You used the ${item}.`);
  }

  if (resolvedInput.startsWith('drop ')) {
    const item = resolvedInput.replace('drop ', '');
    if (!updatedInventory.includes(item)) return { messages: [`You don't have a ${item}.`] };
    updatedInventory = updatedInventory.filter(i => i !== item);
    responses.push(`You dropped the ${item}.`);
  }

  if (resolvedInput.startsWith('inspect ')) {
    const item = resolvedInput.replace('inspect ', '');
    responses.push(`You inspect the ${item}. It might be important...`);
  }

  // Directional movement
  if (currentRoom?.exits?.[resolvedInput]) {
    updatedFlags.previousRoomId = currentRoom.id;
    nextRoomId = currentRoom.exits[resolvedInput];
    responses.push(`You move ${resolvedInput}.`);
  }

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

export { applyCommand };