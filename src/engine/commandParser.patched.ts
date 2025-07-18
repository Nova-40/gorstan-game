// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: commandParser.ts
// Path: src/engine/commandParser.ts
//
// commandParser utility for Gorstan game.
// Parses and applies player commands, updating inventory, traits, flags, and handling movement or endgame triggers.

// Import types (these would be defined in separate files)
interface Room {
  id: string;
  description: string;
  lookDescription?: string;
  exits?: Record<string, string>;
  items?: string[];
  npcs?: string[];
}

interface ItemData {
  name: string;
  description: string;
  portable?: boolean;
  readable?: boolean;
  content?: string;
  throwable?: boolean;
}

interface UseResult {
  success: boolean;
  message: string;
  consumed?: boolean;
  effects?: Array<{
    type: string;
    value: any;
    target?: string;
  }>;
  flagChanges?: Record<string, any>;
}

/**
 * Type definitions for command parser
 */
export interface CommandParserParams {
  input: string;
  currentRoom: Room;
  inventory: string[];
  traits: string[];
  flags: Record<string, any>;
  playerName: string;
  debug?: boolean;
  health?: number;
  score?: number;
}

export interface CommandResult {
  messages: string[];
  nextRoomId?: string | null;
  updates: {
    inventory: string[];
    traits: string[];
    flags: Record<string, any>;
    scoreDelta: number;
    healthDelta?: number;
  };
  specialActions?: SpecialAction[];
  errorCode?: string;
}

export interface SpecialAction {
  type: 'npc_interaction' | 'item_effect' | 'room_event' | 'quest_update' | 'achievement';
  data: Record<string, any>;
}

/**
 * Aliases for common player commands to support flexible input.
 */
const aliases: Record<string, string> = {
  grab: 'pick up',
  take: 'pick up',
  get: 'pick up',
  examine: 'inspect',
  look: 'inspect',
  read: 'inspect',
  toss: 'drop',
  throw: 'drop',
  discard: 'drop',
  move: 'go',
  walk: 'go',
  travel: 'go',
  inv: 'inventory',
  i: 'inventory',
  items: 'inventory',
  talk: 'speak',
  chat: 'speak',
  ask: 'speak',
  help: 'ayla',
  hint: 'ayla',
  guidance: 'ayla'
};

/**
 * applyCommand
 * Enhanced command parser with full game integration
 */
export function applyCommand({
  input,
  currentRoom,
  inventory,
  traits,
  flags,
  playerName,
  debug = false,
  health = 100,
  score = 0
}: CommandParserParams): CommandResult {
  try {
    const responses: string[] = [];
    let nextRoomId: string | null = null;
    let updatedInventory = [...inventory];
    let updatedTraits = [...traits];
    let updatedFlags = { ...flags };
    let scoreDelta = 0;
    let healthDelta = 0;
    const specialActions: SpecialAction[] = [];

    // Input processing
    const resolvedInput = aliases[input.toLowerCase().trim()] || input.toLowerCase().trim();
    const commandParts = resolvedInput.split(' ');


    if (resolvedInput === 'press button' || resolvedInput === 'press blue button') {
      const pressCount = updatedFlags.resetButtonPressCount || 0;
      updatedFlags.resetButtonPressCount = pressCount + 1;

      if (pressCount === 5) {
        updatedFlags.triggerResetEscalation = true;
        responses.push('Reset sequence initiated. Multiversal instability detected.');
      } else if (pressCount >= 6) {
        responses.push('Reset system recalibrating... please wait.');
      } else {
        responses.push('Do not press this button again.');
      }

      return {
        messages: responses,
        nextRoomId,
        updates: {
          inventory: updatedInventory,
          traits: updatedTraits,
          flags: updatedFlags,
          scoreDelta,
          healthDelta
        },
        specialActions,
      };
    }

    const mainCommand = commandParts[0];
    let target = commandParts.slice(1).join(' ');

    // Handle "talk to X" and "speak to X" syntax
    if ((mainCommand === 'talk' || mainCommand === 'speak') && target.startsWith('to ')) {
      target = target.slice(3); // Remove "to " prefix
    }

    // Inventory limit logic: runbag increases capacity
    const hasRunBag = updatedInventory.includes('runbag');
    const inventoryLimit = hasRunBag ? 10 : 5;
        
    // Debug output if enabled
    if (debug) {
      responses.push(`🛠 Debug: resolved input -> '${resolvedInput}'`);
      responses.push(`🛠 Debug: current room -> '${currentRoom.id}'`);
      responses.push(`🛠 Debug: inventory -> [${updatedInventory.join(', ')}]`);
    }

    // Endgame triggers
    if (updatedFlags.endgameCompleted) {
      return handleEndgameCommands(resolvedInput, { playerName, inventory, traits, flags });
    }

    // Parse command structure            
    // Handle commands based on main verb
    switch (mainCommand) {
      case 'pick':
      case 'pickup':
        if (commandParts[1] === 'up') {
          return handlePickUp(target || commandParts.slice(2).join(' '), {
            currentRoom, updatedInventory, updatedTraits, updatedFlags, 
            responses, inventoryLimit, hasRunBag, scoreDelta, specialActions
          });
        }
        return handlePickUp(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, inventoryLimit, hasRunBag, scoreDelta, specialActions
        });

      case 'use':
        return handleUse(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, scoreDelta, healthDelta, specialActions
        });

      case 'drop':
        return handleDrop(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, scoreDelta, specialActions
        });

      case 'inspect':
      case 'examine':
      case 'look':
      case 'read':
        return handleInspect(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, scoreDelta, specialActions
        });

      case 'go':
      case 'move':
      case 'walk':
      case 'travel':
        return handleMovement(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, nextRoomId, scoreDelta, specialActions
        });

      case 'speak':
      case 'talk':
      case 'chat':
      case 'ask':
        return handleSpeaking(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, scoreDelta, specialActions
        });

      case 'inventory':
        return handleInventory({
          updatedInventory, updatedTraits, updatedFlags, responses, scoreDelta
        });

      case 'jump':
        return handleJump({
          updatedInventory, updatedFlags, responses, nextRoomId, scoreDelta
        });

      case 'ayla':
      case 'help':
      case 'hint':
        return handleAylaRequest(target, {
          updatedInventory, updatedTraits, updatedFlags, responses, 
          currentRoom, scoreDelta, specialActions
        });

      case 'combine':
        return handleCombine(target, {
          updatedInventory, updatedTraits, updatedFlags, responses,
          scoreDelta, specialActions
        });

      case 'throw':
        return handleThrow(target, {
          currentRoom, updatedInventory, updatedTraits, updatedFlags,
          responses, scoreDelta, specialActions
        });

      default:
        // Check for directional movement
        if (currentRoom?.exits?.[resolvedInput]) {
          return handleDirectionalMovement(resolvedInput, {
            currentRoom, updatedInventory, updatedTraits, updatedFlags,
            responses, nextRoomId, scoreDelta, specialActions
          });
        }

        // Unknown command
        responses.push(`I don't understand "${input}". Try commands like: pick up, use, drop, inspect, go, speak, or ask ayla for help.`);
        break;
    }

    return buildResult({
      messages: responses,
      nextRoomId,
      updates: {
        inventory: updatedInventory,
        traits: updatedTraits,
        flags: updatedFlags,
        scoreDelta,
        healthDelta
      },
      specialActions
    });

  } catch (error) {
    console.error('[CommandParser] Error processing command:', error);
    return {
      messages: [`An error occurred processing that command. Please try again.`],
      updates: {
        inventory,
        traits,
        flags,
        scoreDelta: 0
      },
      errorCode: 'COMMAND_PROCESSING_ERROR'
    };
  }
};

/**
 * Helper functions - these would typically be imported from other modules
 */
function triggerEndgameAction(action: string, context: any): CommandResult {
  // Placeholder implementation
  return {
    messages: [`Endgame action: ${action}`],
    updates: {
      inventory: context.inventory,
      traits: context.traits,
      flags: context.flags,
      scoreDelta: 0
    }
  };
}

function getItemData(itemId: string): ItemData | null {
  // Placeholder implementation - would lookup item data
  return {
    name: itemId,
    description: `A ${itemId}`,
    portable: true,
    throwable: false
  };
}

function useItem(itemId: string, context: any): UseResult {
  // Placeholder implementation - would handle item usage
  return {
    success: true,
    message: `You use the ${itemId}.`,
    consumed: false
  };
}

function isInMaze(roomId: string): boolean {
  // Placeholder implementation
  return roomId.includes('maze');
}

function getNextMazeRoom(currentRoom: string, direction: string): string {
  // Placeholder implementation
  return currentRoom;
}

function getNPCResponse(npcId: string, context: any, npc?: any): string {
  // Enhanced NPC response system
  if (npc && npc.dialogue) {
    // Use the NPC's defined dialogue
    const greeting = npc.dialogue.greeting || npc.dialogue.default || `${npc.name} looks at you.`;
    return `You speak to ${npc.name}.\n${greeting}`;
  }
  
  // Fallback responses for specific NPCs
  const npcResponses: Record<string, string> = {
    'dominic_goldfish': 'Dominic the goldfish swims excitedly to the front of the tank, his eyes seeming to recognize you. *Blub blub*',
    'polly': 'Polly looks up from her thoughts. "Oh, it\'s you again. What do you need?"',
    'dale': 'Dale smiles warmly. "Hello there! How can I help you?"',
    'ayla': 'Ayla\'s presence seems to shimmer slightly. "I am here to guide you through the lattice."',
    'wendell': 'Mr. Wendell adjusts his glasses. "Ah, a visitor. State your business."',
  };
  
  return npcResponses[npcId] || `${npcId} nods at you but doesn't seem to have much to say.`;
}

function getAylaResponse(query: string, context: any): string {
  // Placeholder implementation
  return `I'm here to help. Try looking around or checking your inventory.`;
}

/**
 * Handle endgame-specific commands
 */
function handleEndgameCommands(
  input: string,
  context: { playerName: string; inventory: string[]; traits: string[]; flags: Record<string, any> }
): CommandResult {
  const { playerName, inventory, traits, flags } = context;
  
  if (input === 'y' || input === 'yes') {
    return triggerEndgameAction('restart', { playerName, inventory, traits, flags });
  } else if (input === 'n' || input === 'no') {
    return triggerEndgameAction('declineRestart', { playerName, inventory, traits, flags });
  } else if (input === '/godrestart' && traits.includes('godmode')) {
    return triggerEndgameAction('instantreset', { playerName, inventory, traits, flags });
  }
  
  return {
    messages: ['Please answer yes (y) or no (n).'],
    updates: { inventory, traits, flags, scoreDelta: 0 }
  };
}

/**
 * Handle pick up command
 */
function handlePickUp(
  target: string,
  context: any
): CommandResult {
  const { currentRoom, updatedInventory, responses, inventoryLimit, hasRunBag, specialActions } = context;
  
  if (!target) {
    responses.push('What would you like to pick up?');
    return buildResult(context);
  }

  // Check inventory limits
  if (updatedInventory.length >= inventoryLimit) {
    responses.push(`⚠️ Your ${hasRunBag ? 'run bag' : 'pockets'} are full! Drop something first.`);
    return buildResult(context);
  }

  // Check if item exists in room
  if (!currentRoom.items?.includes(target)) {
    responses.push(`There's no ${target} here to pick up.`);
    return buildResult(context);
  }

  // Get item data for validation
  const itemData = getItemData(target);
  if (!itemData) {
    responses.push(`You can't pick up the ${target}.`);
    return buildResult(context);
  }

  if (!itemData.portable) {
    responses.push(`The ${itemData.name} is too heavy or fixed in place.`);
    return buildResult(context);
  }

  // Add to inventory
  updatedInventory.push(target);
  currentRoom.items = currentRoom.items.filter((item: string) => item !== target);
  responses.push(`You picked up the ${itemData.name}.`);
  context.scoreDelta += 5;

  // Add special action for item pickup
  specialActions.push({
    type: 'item_effect',
    data: { action: 'pickup', item: target, room: currentRoom.id }
  });

  return buildResult(context);
}

/**
 * Handle use command with item effects
 */
function handleUse(target: string, context: any): CommandResult {
  const { updatedInventory, updatedTraits, updatedFlags, responses, specialActions } = context;
  
  if (!target) {
    responses.push('What would you like to use?');
    return buildResult(context);
  }

  if (!updatedInventory.includes(target)) {
    responses.push(`You don't have a ${target}.`);
    return buildResult(context);
  }

  const itemData = getItemData(target);
  if (!itemData) {
    responses.push(`You can't use the ${target}.`);
    return buildResult(context);
  }

  // Use item system from items.ts
  const useResult = useItem(target, context);
  
  responses.push(useResult.message);

  // Apply effects
  if (useResult.success && useResult.effects) {
    for (const effect of useResult.effects) {
      switch (effect.type) {
        case 'health':
          context.healthDelta += (effect.value as number);
          break;
        case 'trait':
          if (!updatedTraits.includes(effect.value as string)) {
            updatedTraits.push(effect.value as string);
          }
          break;
        case 'flag':
          if (effect.target) {
            updatedFlags[effect.target] = effect.value;
          }
          break;
      }
    }
  }

  // Remove item if consumed
  if (useResult.consumed) {
    context.updatedInventory = updatedInventory.filter((item: string) => item !== target);
  }

  // Apply flag changes
  if (useResult.flagChanges) {
    Object.assign(updatedFlags, useResult.flagChanges);
  }

  context.scoreDelta += useResult.success ? 10 : 0;

  specialActions.push({
    type: 'item_effect',
    data: { action: 'use', item: target, success: useResult.success }
  });

  return buildResult(context);
}

/**
 * Handle drop command
 */
function handleDrop(target: string, context: any): CommandResult {
  const { currentRoom, updatedInventory, responses, specialActions } = context;
  
  if (!target) {
    responses.push('What would you like to drop?');
    return buildResult(context);
  }

  if (!updatedInventory.includes(target)) {
    responses.push(`You don't have a ${target}.`);
    return buildResult(context);
  }

  const itemData = getItemData(target);
  context.updatedInventory = updatedInventory.filter((item: string) => item !== target);
  
  // Add to room items
  if (!currentRoom.items) currentRoom.items = [];
  currentRoom.items.push(target);
  
  responses.push(`You dropped the ${itemData?.name || target}.`);
  
  specialActions.push({
    type: 'item_effect',
    data: { action: 'drop', item: target, room: currentRoom.id }
  });

  return buildResult(context);
}

/**
 * Handle inspect command
 */
function handleInspect(target: string, context: any): CommandResult {
  const { currentRoom, updatedInventory, responses, specialActions } = context;
  
  if (!target) {
    responses.push('What would you like to inspect?');
    return buildResult(context);
  }

  // Check inventory first
  if (updatedInventory.includes(target)) {
    const itemData = getItemData(target);
    if (itemData) {
      responses.push(`${itemData.name}: ${itemData.description}`);
      
      // Handle readable items
      if (itemData.readable && itemData.content) {
        responses.push(`Reading the ${itemData.name}:`);
        responses.push(itemData.content);
        context.scoreDelta += 5;
      }
    } else {
      responses.push(`You examine the ${target}. It seems ordinary.`);
    }
  }
  // Check room items
  else if (currentRoom.items?.includes(target)) {
    const itemData = getItemData(target);
    if (itemData) {
      responses.push(`${itemData.name}: ${itemData.description}`);
    } else {
      responses.push(`You see a ${target} here.`);
    }
  }
  // Check room itself
  else if (target === 'room' || target === 'here') {
    responses.push(currentRoom.lookDescription || currentRoom.description);
  }
  else {
    responses.push(`There's no ${target} here to inspect.`);
  }

  specialActions.push({
    type: 'room_event',
    data: { action: 'inspect', target, room: currentRoom.id }
  });

  return buildResult(context);
}

/**
 * Handle movement commands
 */
function handleMovement(direction: string, context: any): CommandResult {
  const { currentRoom, responses, specialActions } = context;
  
  if (!direction) {
    const exits = Object.keys(currentRoom.exits || {});
    if (exits.length > 0) {
      responses.push(`You can go: ${exits.join(', ')}`);
    } else {
      responses.push('There are no exits here.');
    }
    return buildResult(context);
  }

  return handleDirectionalMovement(direction, context);
}

/**
 * Handle directional movement
 */
function handleDirectionalMovement(direction: string, context: any): CommandResult {
  const { currentRoom, updatedFlags, responses, specialActions } = context;
  
  if (!currentRoom.exits?.[direction]) {
    responses.push(`You can't go ${direction} from here.`);
    return buildResult(context);
  }

  // Handle maze rooms specially
  if (isInMaze(currentRoom.id)) {
    const nextMazeRoomId = getNextMazeRoom(currentRoom.id, direction);
    context.nextRoomId = nextMazeRoomId;
    responses.push(`You navigate through the maze...`);
  } else {
    context.nextRoomId = currentRoom.exits[direction];
    responses.push(`You go ${direction}.`);
  }

  // Track previous room
  updatedFlags.previousRoomId = currentRoom.id;
  context.scoreDelta += 1;

  specialActions.push({
    type: 'room_event',
    data: { action: 'movement', from: currentRoom.id, to: context.nextRoomId, direction }
  });

  return buildResult(context);
}

/**
 * Handle speaking to NPCs
 */
function handleSpeaking(target: string, context: any): CommandResult {
  const { currentRoom, updatedInventory, updatedTraits, updatedFlags, responses, specialActions } = context;
  
  if (!target) {
    const npcs = currentRoom.npcs || [];
    if (npcs.length > 0) {
      const npcNames = npcs.map((npc: any) => npc.name || npc.id).join(', ');
      responses.push(`You can speak to: ${npcNames}`);
    } else {
      responses.push('There\'s no one here to speak to.');
    }
    return buildResult(context);
  }

  // Find NPC by name or id (case insensitive)
  const targetLower = target.toLowerCase();
  const npc = currentRoom.npcs?.find((n: any) => 
    n.name?.toLowerCase().includes(targetLower) || 
    n.id?.toLowerCase().includes(targetLower) ||
    n.name?.toLowerCase() === targetLower ||
    n.id?.toLowerCase() === targetLower
  );

  if (!npc) {
    responses.push(`${target} is not here.`);
    return buildResult(context);
  }

  // Use NPC system with enhanced dialogue
  const npcResponse = getNPCResponse(npc.id, context, npc);
  
  responses.push(npcResponse);
  context.scoreDelta += 3;

  specialActions.push({
    type: 'npc_interaction',
    data: { npc: npc.id, npcName: npc.name, room: currentRoom.id }
  });

  return buildResult(context);
}

/**
 * Handle inventory display
 */
function handleInventory(context: any): CommandResult {
  const { updatedInventory, responses } = context;
  
  if (updatedInventory.length === 0) {
    responses.push('Your inventory is empty.');
  } else {
    responses.push(`Inventory (${updatedInventory.length} items): ${updatedInventory.join(', ')}`);
  }

  return buildResult(context);
}

/**
 * Handle jump command
 */
function handleJump(context: any): CommandResult {
  const { updatedInventory, updatedFlags, responses } = context;
  
  if (!updatedInventory.includes('coffee')) {
    responses.push('You try to jump, but your hands are empty. No coffee, no go.');
    return buildResult(context);
  }

  if (updatedFlags.previousRoomId) {
    context.nextRoomId = updatedFlags.previousRoomId;
    responses.push('You jump back to where you came from.');
    context.scoreDelta += 2;
  } else {
    responses.push('There is nowhere to jump back to.');
  }

  return buildResult(context);
}

/**
 * Handle Ayla requests
 */
function handleAylaRequest(query: string, context: any): CommandResult {
  const { updatedInventory, updatedTraits, updatedFlags, currentRoom, responses, specialActions } = context;

  const aylaResponse = getAylaResponse(query, context);
  responses.push(`Ayla says: "${aylaResponse}"`);
  context.scoreDelta += 1;

  specialActions.push({
    type: 'npc_interaction',
    data: { npc: 'ayla', query, room: currentRoom.id }
  });

  return buildResult(context);
}

/**
 * Handle item combination
 */
function handleCombine(target: string, context: any): CommandResult {
  const { updatedInventory, responses } = context;
  
  const items = target.split(' and ');
  if (items.length !== 2) {
    responses.push('To combine items, use: combine [item1] and [item2]');
    return buildResult(context);
  }

  const [item1, item2] = items;
  if (!updatedInventory.includes(item1) || !updatedInventory.includes(item2)) {
    responses.push('You need both items in your inventory to combine them.');
    return buildResult(context);
  }

  // Basic combination logic - extend as needed
  responses.push(`You try to combine the ${item1} and ${item2}, but nothing happens. Maybe they don't work together.`);
  
  return buildResult(context);
}

/**
 * Handle throwing items
 */
function handleThrow(target: string, context: any): CommandResult {
  const { updatedInventory, responses, specialActions } = context;
  
  if (!target) {
    responses.push('What would you like to throw?');
    return buildResult(context);
  }

  if (!updatedInventory.includes(target)) {
    responses.push(`You don't have a ${target} to throw.`);
    return buildResult(context);
  }

  const itemData = getItemData(target);
  if (!itemData?.throwable) {
    responses.push(`The ${itemData?.name || target} is not suitable for throwing.`);
    return buildResult(context);
  }

  // Remove from inventory
  context.updatedInventory = updatedInventory.filter((item: string) => item !== target);
  responses.push(`You throw the ${itemData.name}. It lands somewhere out of reach.`);

  specialActions.push({
    type: 'item_effect',
    data: { action: 'throw', item: target }
  });

  return buildResult(context);
}

/**
 * Helper function to build consistent result objects
 */
function buildResult(context: any): CommandResult {
  return {
    messages: context.responses || [],
    nextRoomId: context.nextRoomId,
    updates: {
      inventory: context.updatedInventory || context.inventory,
      traits: context.updatedTraits || context.traits,
      flags: context.updatedFlags || context.flags,
      scoreDelta: context.scoreDelta || 0,
      healthDelta: context.healthDelta || 0
    },
    specialActions: context.specialActions || []
  };
}

/**
 * Utility function to validate command input
 */
export function validateCommandInput(input: any): input is string {
  return typeof input === 'string' && input.trim().length > 0;
}

/**
 * Get available commands for help system
 */
export function getAvailableCommands(): Record<string, string> {
  return {
    'pick up [item]': 'Take an item from the current room',
    'use [item]': 'Use an item from your inventory',
    'drop [item]': 'Drop an item from your inventory',
    'inspect [item/room]': 'Examine an item or the current room',
    'go [direction]': 'Move in a direction (north, south, east, west, etc.)',
    'speak [npc]': 'Talk to an NPC in the current room',
    'inventory': 'Show your current inventory',
    'jump': 'Jump back to the previous room (requires coffee)',
    'ayla [question]': 'Ask Ayla for guidance',
    'combine [item1] and [item2]': 'Try to combine two items',
    'throw [item]': 'Throw an item (if throwable)'
  };
}

/**
 * Export utilities for external use
 */
export default applyCommand;

// Simple parseCommand wrapper for external use
export function parseCommand(input: string) {
  const trimmed = input.toLowerCase().trim();
  const parts = trimmed.split(' ');
  return {
    command: parts[0],
    object: parts.slice(1).join(' ')
  };
}
