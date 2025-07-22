// --- Helper Functions ---
function hasItem(inventory: string[], item: string) {
  return inventory.includes(item);
}

function getRoomExit(currentRoom: Room, direction: string) {
  return currentRoom.exits && currentRoom.exits[direction];
}

function updatePlayerInventory(player: any, newInventory: string[]) {
  return { ...player, inventory: newInventory };
}

function mergeUpdates(base: any, ...updates: any[]) {
  return updates.reduce((acc, update) => ({ ...acc, ...update }), { ...base });
}

function getItemName(item: any): string {
  return typeof item === 'string' ? item : item.name;
}

function getRoomItems(room: Room): any[] {
  return Array.isArray(room.items) ? room.items : [];
}

function getRoomNpcs(room: Room): any[] {
  return Array.isArray(room.npcs) ? room.npcs : [];
}

function getRoomDef(room: Room): any {
  return room as any;
}

function isDirection(cmd: string) {
  return [
    'north','south','east','west','up','down','northeast','northwest','southeast','southwest'
  ].includes(cmd);
}
// --- End Helper Functions ---


import { applyScoreForEvent, getScoreBasedMessage, getDominicScoreComment } from '../state/scoreEffects';
import { LocalGameState } from '../state/gameState';
// import { Miniquest } from '../types/GameTypes'; // Not used or missing, remove
import { MiniquestEngine } from './miniquestInitializer';
import { NPC } from '../NPCTypes';
import { recordItemDiscovery, displayCodex } from '../logic/codexTracker';
import { Room } from '../RoomTypes';
import { isLibrarianActive } from './librarianController';
// import { isWendellActive } from './mrWendellController'; // Not used or missing, remove
import { TerminalMessage } from '../components/TerminalConsole';
import { unlockAchievement, listAchievements } from '../logic/achievementEngine';



// commandProcessor.ts — engine/commandProcessor.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Process traps when entering a room

// Module: src/engine/commandProcessor.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


// Hub teleportation configuration for remote control
const allowedHubs: Record<string, string> = {
  'control nexus': 'controlnexus',
  'lattice hub': 'latticehub',
  'gorstan hub': 'gorstanhub',
  'maze entrance': 'mazeentrance',
  'library antechamber': 'hiddenlibrary',
  'london hub': 'londonhub',
  'elfhame palace': 'elfhameZone_faepalace',
  'glitch realm': 'glitchrealm_glitchrealmhub',
};

const hubDisplayNames: Record<string, string> = {
  'controlnexus': 'Control Nexus',
  'latticehub': 'Lattice Hub',
  'gorstanhub': 'Gorstan Hub',
  'mazeentrance': 'Maze Entrance',
  'hiddenlibrary': 'Library Antechamber',
  'londonhub': 'London Hub',
  'elfhameZone_faepalace': 'Elfhame Palace',
  'glitchrealm_glitchrealmhub': 'Glitch Realm',
};

/**
 * Process traps when entering a room
 */
function processTrap(trap: any, gameState: LocalGameState): {
  messages: TerminalMessage[];
  updates?: Partial<LocalGameState>;
} {
  const messages: TerminalMessage[] = [];
  let updates: Partial<LocalGameState> = {};

  if (trap.trigger === 'enter' && !trap.hidden) {
    messages.push({ text: `⚠️ TRAP TRIGGERED: ${trap.description}`, type: 'error' });

    switch (trap.type) {
      case 'damage':
        const damage = trap.effect?.damage || 10;
        const newHealth = Math.max(0, gameState.player.health - damage);
        messages.push({ text: `You take ${damage} damage! Health: ${newHealth}`, type: 'error' });
        updates.player = { ...gameState.player, health: newHealth };

        // Check if this causes the player's first death
        if (newHealth === 0 && gameState.player.health > 0) {
          unlockAchievement('first_death');
        }

        // Deduct score for taking damage from traps
        const scorePenalty = Math.floor(damage / 2);
        if (scorePenalty > 0) {
          const newScore = Math.max(0, (gameState.player.score || 0) - scorePenalty);
          updates.player = { ...updates.player, score: newScore };
          messages.push({ text: `Score penalty: -${scorePenalty} points`, type: 'error' });
        }
        break;

      case 'teleport':
        if (trap.effect?.teleportTo) {
          messages.push({ text: 'The trap teleports you to another location!', type: 'system' });
          updates.currentRoomId = trap.effect.teleportTo;
        }
        break;

      case 'item_loss':
        if (trap.effect?.itemsLost && gameState.player.inventory.length > 0) {
          const lostItems = trap.effect.itemsLost.filter((item: any) =>
            gameState.player.inventory.includes(item)
          );
          if (lostItems.length > 0) {
            const newInventory = gameState.player.inventory.filter(item =>
              !lostItems.includes(item)
            );
            messages.push({ text: `You lose: ${lostItems.join(', ')}`, type: 'error' });
            updates.player = { ...gameState.player, inventory: newInventory };
          }
        }
        break;
    }
  }

  return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
}

/**
 * Check and process room entry events including traps
 */
function processRoomEntry(room: Room & Partial<any>, gameState: LocalGameState): {
  messages: TerminalMessage[];
  updates?: Partial<LocalGameState>;
} {
  const messages: TerminalMessage[] = [];
  let updates: Partial<LocalGameState> = {};

  // Process traps
  const roomDef = room as any;
  if (roomDef.traps && Array.isArray(roomDef.traps)) {
    for (const trap of roomDef.traps) {
      const trapResult = processTrap(trap, gameState);
      messages.push(...trapResult.messages);
      if (trapResult.updates) {
        updates = { ...updates, ...trapResult.updates };
      }
    }
  }

  // Process room events
  if (roomDef.events?.onEnter && Array.isArray(roomDef.events.onEnter)) {
    const eventResult = processRoomEvents(roomDef.events.onEnter, room, gameState);
    messages.push(...eventResult.messages);
    if (eventResult.updates) {
      updates = { ...updates, ...eventResult.updates };
    }
  }

  return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
}

/**
 * Process room events like offerCoffeeAutomatically
 */
function processRoomEvents(events: string[], room: Room, gameState: LocalGameState): {
  messages: TerminalMessage[];
  updates?: Partial<LocalGameState>;
} {
  const messages: TerminalMessage[] = [];
  let updates: Partial<LocalGameState> = {};

  for (const event of events) {
    switch (event) {
      case 'offerCoffeeAutomatically':
        // Only trigger if in coffee shop and player doesn't have coffee
        if (room.id === 'findlaterscornercoffeeshop' && !gameState.player.inventory.includes('coffee')) {
          const flags = gameState.flags || {};

          // Only offer once per visit
          if (!flags.freeCoffeeOffered) {
            messages.push({
              text: '☕ "Coffee for Pyke!" Sarah the barista calls out cheerfully, already preparing a fresh cup.',
              type: 'lore'
            });
            messages.push({
              text: '"Here you go - on the house! You look like you could use it," she says with a warm smile.',
              type: 'lore'
            });

            // Add coffee to inventory
            const newInventory = [...gameState.player.inventory, 'coffee'];
            updates.player = { ...gameState.player, inventory: newInventory };
            updates.flags = { ...flags, freeCoffeeOffered: true, coffeeForPykeCalled: true };

            messages.push({
              text: '✨ You received: coffee',
              type: 'info'
            });
          }
        }
        break;

      case 'resetCoffeeOfferFlag':
        // Reset the coffee offer flag when leaving the coffee shop
        if (room.id === 'findlaterscornercoffeeshop') {
          const flags = gameState.flags || {};
          updates.flags = { ...flags, freeCoffeeOffered: false };
        }
        break;

      case 'triggerFamiliarity':
      case 'activateBarista':
      case 'checkTimeOfDay':
        // These events are handled by other systems or are purely narrative
        break;

      default:
        // Unhandled event - could log for debugging
        break;
    }
  }

  return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
}

/**
 * Process cursed/trapped items with special effects
 */
function processCursedItem(itemId: string, gameState: LocalGameState): {
  messages: TerminalMessage[];
  updates?: Partial<LocalGameState>;
} {
  const messages: TerminalMessage[] = [];
  let updates: Partial<LocalGameState> = {};

  switch (itemId) {
    case 'cursed_amulet':
      messages.push({ text: '💀 The amulet burns your hand!', type: 'error' });
      messages.push({ text: 'Dark energy courses through you...', type: 'error' });
      updates.player = {
        ...gameState.player,
        health: Math.max(10, gameState.player.health - 20),
      };
      // Record the curse in codex
      recordItemDiscovery(itemId, 'CURSED', {
        description: 'Burns the user and drains health',
        significance: 'mysterious' as const
      });
      break;

    case 'cursed_mirror':
      messages.push({ text: '🪞 Your reflection shows something horrible...', type: 'error' });
      messages.push({ text: 'You feel a chill as part of your soul is trapped!', type: 'error' });
      // Teleport to a cursed dimension or apply debuff
      if (gameState.roomMap['cursed_reflection']) {
        updates.currentRoomId = 'cursed_reflection';
        messages.push({ text: 'You are pulled into the mirror realm!', type: 'error' });
      }
      break;

    case 'trapped_box':
      messages.push({ text: '📦 The box springs open with a sharp click!', type: 'error' });

      // Random trap effects
      const trapEffects = [
        () => {
          messages.push({ text: 'Poison gas escapes!', type: 'error' });
          updates.player = {
            ...gameState.player,
            health: Math.max(5, gameState.player.health - 15),
          };
        },
        () => {
          messages.push({ text: 'A teleportation spell activates!', type: 'error' });
          const randomRooms = ['gorstanhub', 'controlnexus', 'crossing'];
          const targetRoom = randomRooms[Math.floor(Math.random() * randomRooms.length)];
          if (gameState.roomMap[targetRoom]) {
            updates.currentRoomId = targetRoom;
          }
        },
        () => {
          messages.push({ text: 'Your inventory is scattered!', type: 'error' });
          // Remove 1-2 random items
          const newInventory = [...gameState.player.inventory];
          const itemsToLose = Math.min(2, Math.floor(Math.random() * 2) + 1);
          for (let i = 0; i < itemsToLose && newInventory.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * newInventory.length);
            newInventory.splice(randomIndex, 1);
          }
          updates.player = {
            ...gameState.player,
            inventory: newInventory,
          };
        }
      ];

      const randomEffect = trapEffects[Math.floor(Math.random() * trapEffects.length)];
      randomEffect();
      break;

    case 'venom_dagger':
      messages.push({ text: '🗡️ The dagger\'s venom seeps into your skin!', type: 'error' });
      messages.push({ text: 'You feel weakened...', type: 'error' });
      updates.player = {
        ...gameState.player,
        health: Math.max(1, gameState.player.health - 25),
      };
      // Apply ongoing poison effect (could be implemented with status effects)
      messages.push({ text: 'The poison will continue to affect you...', type: 'error' });
      break;

    default:
      messages.push({ text: `The ${itemId} has an unknown curse effect.`, type: 'error' });
      updates.player = {
        ...gameState.player,
        health: Math.max(10, gameState.player.health - 10),
      };
  }

  // Apply curse penalty to score
  applyScoreForEvent('item.cursed');

  return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
}

/**
 * The result of processing a command.
 */
export interface CommandResult {
  /** A list of messages to display to the player. */
  messages: TerminalMessage[];
  /** An object with partial game state updates to be applied by the reducer. */
  updates?: Partial<LocalGameState> & {
    roomMap?: Record<string, Room>;
  };
}

/**
 * Check for miniquest triggers and attempt to complete them
 */
function checkMiniquestTriggers(
  action: string,
  gameState: LocalGameState,
  currentRoom: Room
): { messages: TerminalMessage[], updates?: any } {
  const engine = MiniquestEngine.getInstance();
  const availableQuests = engine.getAvailableQuests(gameState.currentRoomId, gameState as any);

  // Find quests that match this action
  const triggeredQuests = availableQuests.filter(quest =>
    quest.triggerAction === action
  );

  const messages: TerminalMessage[] = [];
  let updates: any = {};

  triggeredQuests.forEach(quest => {
    const result = engine.attemptQuest(quest.id, gameState.currentRoomId, gameState as any, action);

    if (result.success) {
      messages.push({ text: result.message, type: 'system' });
      if (result.scoreAwarded) {
        messages.push({ text: `Score: +${result.scoreAwarded} points!`, type: 'system' });
      }

      if (result.completed) {
        const stateUpdate = engine.updateStateAfterCompletion(
          gameState as any,
          gameState.currentRoomId,
          quest.id
        );
        updates = { ...updates, ...stateUpdate };
      }
    }
  });

  return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
}

/**
 * Parses and processes a player command based on the current game state and room.
 * This function contains the core rules of the game.
 *
 * @param command The raw command string from the player (e.g., "go north").
 * @param gameState The entire current state of the game.
 * @param currentRoom The room object where the command is being executed.
 * @returns A CommandResult object with messages and state updates.
 */
export function processCommand(
  command: string,
  gameState: LocalGameState,
  currentRoom: Room
): CommandResult {
  const commandWords = command.toLowerCase().trim().split(/\s+/);
  const verb = commandWords[0];
  const noun = commandWords.slice(1).join(' ');

  switch (verb) {
    case 'go':
    case 'move': {
      const direction = noun;
      if (currentRoom.exits && currentRoom.exits[direction]) {
        const targetRoomId = currentRoom.exits[direction];
        const targetRoom = gameState.roomMap[targetRoomId];

        const messages: TerminalMessage[] = [{ text: `You go ${direction}.`, type: 'info' }];
        let updates: any = {
          currentRoomId: targetRoomId,
          player: {
            ...gameState.player,
            currentRoom: targetRoomId,
          },
        };

        // Process room exit events before leaving
        const currentRoomDef = currentRoom as any;
        if (currentRoomDef.events?.onExit && Array.isArray(currentRoomDef.events.onExit)) {
          const exitResult = processRoomEvents(currentRoomDef.events.onExit, currentRoom, gameState);
          messages.push(...exitResult.messages);
          if (exitResult.updates) {
            // Merge exit updates with movement updates
            updates = { ...updates, ...exitResult.updates };
            // Update gameState for entry processing
            gameState = { ...gameState, ...exitResult.updates };
          }
        }

        // Process room entry events (traps, etc.) if target room exists
        if (targetRoom) {
          const entryResult = processRoomEntry(targetRoom as any, gameState);
          messages.push(...entryResult.messages);
          if (entryResult.updates) {
            updates = { ...updates, ...entryResult.updates };
          }
        }

        return { messages, updates };
      }
      return { messages: [{ text: "You can't go that way.", type: 'error' }] };
    }

    case 'look': {
      const descriptionLines = Array.isArray(currentRoom.description)
        ? currentRoom.description
        : [currentRoom.description];

      const messages: TerminalMessage[] = [
        { text: `--- ${currentRoom.title} ---`, type: 'lore' as const },
        ...descriptionLines.map(line => ({ text: line, type: 'lore' as const })),
      ];

      if (currentRoom.items && currentRoom.items.length > 0) {
        messages.push({ text: 'You see:', type: 'info' as const });
        currentRoom.items.forEach(item => {
          const itemName = typeof item === 'string' ? item : (item as any).name;
          messages.push({ text: `- ${itemName}`, type: 'info' as const });
        });
      }

      if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        messages.push({ text: 'People here:', type: 'info' as const });
        currentRoom.npcs.forEach(npc => {
          messages.push({ text: `- ${npc}`, type: 'info' as const });
        });
      }

      if (currentRoom.exits && Object.keys(currentRoom.exits).length > 0) {
        messages.push({ text: 'Exits:', type: 'info' as const });
        Object.keys(currentRoom.exits).forEach(exit => {
          // Don't show special exits like chair_portal in the exits list
          if (!['chair_portal', 'sit', 'jump'].includes(exit)) {
            messages.push({ text: `- ${exit}`, type: 'info' as const });
          }
        });

        // Show hidden/special exits differently
        const hiddenExits = Object.keys(currentRoom.exits).filter(exit =>
          ['secret', 'hidden', 'shimmer', 'phase', 'dimensional_rift', 'coffee_portal'].includes(exit)
        );
        if (hiddenExits.length > 0) {
          messages.push({ text: 'Hidden passages (coffee-revealed):', type: 'system' as const });
          hiddenExits.forEach(exit => {
            messages.push({ text: `- ${exit} (shimmering)`, type: 'system' as const });
          });
        }
      }

      // Show available interactions
      const roomDef = currentRoom as any;
      if (roomDef.interactables && Object.keys(roomDef.interactables).length > 0) {
        messages.push({ text: 'You can interact with:', type: 'info' as const });
        Object.keys(roomDef.interactables).forEach(item => {
          messages.push({ text: `- ${item}`, type: 'info' as const });
        });
      }

      // Special information for the reset room blue button
      if (currentRoom.id === 'introreset') {
        const pressCount = typeof gameState.flags.resetButtonPressCount === 'number' ? gameState.flags.resetButtonPressCount : 0;
        if (pressCount > 0) {
          messages.push({ text: '--- Button Status ---', type: 'system' as const });
          messages.push({ text: `Blue button presses: ${pressCount}`, type: 'system' as const });

          if (pressCount >= 1) {
            messages.push({ text: '⚠️ Warning signs are actively flashing!', type: 'error' as const });
          }
          if (pressCount >= 3) {
            messages.push({ text: '⚠️ Reality around the button appears unstable!', type: 'error' as const });
          }
          if (pressCount >= 5) {
            messages.push({ text: '💥 The button pulses ominously, ready for total reset!', type: 'error' as const });
          }
        }
      }

      return { messages };
    }

    case 'get':
    case 'take': {
      if (!noun) {
        return { messages: [{ text: 'What do you want to take?', type: 'error' as const }] };
      }

      // Check if player already has this item
      if (gameState.player.inventory.includes(noun)) {
        return { messages: [{ text: `You already have the ${noun}.`, type: 'error' as const }] };
      }

      const roomItems = currentRoom.items || [];
      const itemIndex = roomItems.findIndex((item: any) =>
        typeof item === 'string' ? item === noun : item.name === noun
      );

      if (itemIndex !== -1) {
        const newRoomItems = [...roomItems];
        const takenItem = newRoomItems.splice(itemIndex, 1)[0];
        const itemName = typeof takenItem === 'string' ? takenItem : (takenItem as any).name;
        const newPlayerInventory = [...gameState.player.inventory, itemName];

        // Apply scoring for item collection
        applyScoreForEvent('find.hidden.item');

        // Record in codex
        recordItemDiscovery(itemName, currentRoom.id);

        // Special item effects and achievements
        if (itemName === 'dominic' || itemName === 'dominic_goldfish') {
          unlockAchievement('took_dominic');
          applyScoreForEvent('goldfish.rescued');
        }

        if (itemName.includes('constitution') || itemName.includes('scroll')) {
          unlockAchievement('found_constitution');
          applyScoreForEvent('discover.lore');
        }

        return {
          messages: [
            { text: `You take the ${noun}.`, type: 'system' as const },
          ],
          updates: {
            player: {
              ...gameState.player,
              inventory: newPlayerInventory,
            },
            roomMap: {
              ...gameState.roomMap,
              [currentRoom.id]: {
                ...(currentRoom as any),
                items: newRoomItems,
              },
            },
          },
        };
      }
      return { messages: [{ text: `You don't see a ${noun} here.`, type: 'error' as const }] };
    }

    case 'drop': {
      if (!noun) {
        return { messages: [{ text: 'What do you want to drop?', type: 'error' as const }] };
      }

      const playerInventory = gameState.player.inventory;
      const itemIndex = playerInventory.findIndex((item: string) => item === noun);

      if (itemIndex !== -1) {
        const newPlayerInventory = [...playerInventory];
        const droppedItem = newPlayerInventory.splice(itemIndex, 1)[0];
        const currentRoomItems = currentRoom.items || [];

        // Create new room item object for dropped items
        const droppedRoomItem: any = typeof droppedItem === 'string'
          ? { id: droppedItem, name: droppedItem }
          : droppedItem;

        const newRoomItems = [...currentRoomItems, droppedRoomItem];

        // Check for quest-critical items
        const criticalItems = ['greasy_napkin_with_plans', 'dimensional_key', 'reality_anchor'];
        if (criticalItems.includes(droppedItem)) {
          applyScoreForEvent('item.stolen'); // Apply penalty for dropping important items

          return {
            messages: [
              { text: `You drop the ${noun}.`, type: 'system' as const },
              { text: "Something tells you that might've been important...", type: 'error' as const }
            ],
            updates: {
              player: {
                ...gameState.player,
                inventory: newPlayerInventory,
              },
              roomMap: {
                ...gameState.roomMap,
                [currentRoom.id]: {
                  ...(currentRoom as any),
                  items: newRoomItems,
                },
              },
            },
          };
        }

        return {
          messages: [
            { text: `You drop the ${noun}.`, type: 'system' as const },
          ],
          updates: {
            player: {
              ...gameState.player,
              inventory: newPlayerInventory,
            },
            roomMap: {
              ...gameState.roomMap,
                [currentRoom.id]: {
                  ...(currentRoom as any),
                  items: newRoomItems,
                },
            },
          },
        };
      }
      return { messages: [{ text: `You don't have a ${noun} to drop.`, type: 'error' as const }] };
    }

    case 'inventory':
    case 'i': {
      if (gameState.player.inventory.length === 0) {
        return { messages: [{ text: 'You are not carrying anything.', type: 'info' }] };
      }
      return {
        messages: [
          { text: 'You are carrying:', type: 'info' as const },
          ...gameState.player.inventory.map((item: string) => ({
            text: `- ${item}`,
            type: 'info' as const,
          })),
        ],
      };
    }

    case 'status': {
      return {
        messages: [
          { text: `Player: ${gameState.player.name}`, type: 'system' },
          { text: `Health: ${gameState.player.health}%`, type: 'system' },
          { text: `Score: ${gameState.player.score || 0}`, type: 'system' },
          { text: `Location: ${currentRoom.title} (${currentRoom.id})`, type: 'system' },
        ],
      };
    }

    case 'score': {
      const currentScore = gameState.player.score || 0;

      const messages: TerminalMessage[] = [
        { text: `Your current score is: ${currentScore}`, type: 'system' },
      ];

      // Add score-based commentary
      const scoreMessage = getScoreBasedMessage(currentScore);
      if (scoreMessage) {
        messages.push({ text: scoreMessage, type: 'info' });
      }

      // Add Dominic's commentary if appropriate (and if Dominic is in inventory)
      if (gameState.player.inventory.includes('dominic')) {
        const dominicComment = getDominicScoreComment(currentScore);
        if (dominicComment) {
          messages.push({ text: `Dominic: "${dominicComment}"`, type: 'info' });
        }
      }

      return { messages };
    }

    case 'achievements': {
      // Display achievements using the achievement system
      const unlockedAchievements = gameState.metadata?.achievements || [];

      const achievementMessages = listAchievements(unlockedAchievements);

      return {
        messages: achievementMessages.map((msg: string) => ({ text: msg, type: 'system' as const })),
      };
    }

    case 'show': {
      if (!noun) {
        return { messages: [{ text: 'What do you want to show?', type: 'error' as const }] };
      }

      if (!gameState.player.inventory.includes(noun)) {
        return { messages: [{ text: `You don't have a ${noun} to show.`, type: 'error' as const }] };
      }

      // Check for NPCs in room
      const roomNPCs = currentRoom.npcs || [];
      if (roomNPCs.length === 0) {
        return { messages: [{ text: 'There\'s no one here to show it to.', type: 'error' as const }] };
      }

      // Special item-NPC interactions
      const messages: TerminalMessage[] = [];

      if (noun === 'greasy_napkin_with_plans' && currentRoom.id?.includes('library')) {
        messages.push({ text: 'The Librarian\'s eyes widen. "That\'s not a napkin — it\'s your pass."', type: 'lore' });
        applyScoreForEvent('npc.librarian.helpful');

        return {
          messages,
          updates: {
            flags: {
              ...gameState.flags,
              hasUnlockedScrolls: true,
            },
          },
        };
      }

      if (noun === 'dominic' || noun === 'dominic_goldfish') {
        messages.push({ text: 'You show Dominic to the room. The goldfish seems pleased with the attention.', type: 'lore' });
        applyScoreForEvent('conversation.meaningful');
      }

      if (noun.includes('memory') && roomNPCs.some((npc: any) => npc.id === 'polly')) {
        messages.push({ text: 'Polly looks at the memory fragment. "You kept that? Why?"', type: 'lore' });
        applyScoreForEvent('conversation.meaningful');
      }

      if (messages.length === 0) {
        messages.push({ text: `You show the ${noun}. The reaction is politely uninterested.`, type: 'info' });
      }

      return { messages };
    }

    case 'use': {
      if (!noun) {
        return { messages: [{ text: 'What do you want to use?', type: 'error' as const }] };
      }

      if (!gameState.player.inventory.includes(noun)) {
        return { messages: [{ text: `You don't have a ${noun} to use.`, type: 'error' as const }] };
      }

      const messages: TerminalMessage[] = [];
      const updates: any = {};

      // Check for cursed items first
      const cursedItems = ['cursed_amulet', 'cursed_mirror', 'trapped_box', 'venom_dagger'];
      if (cursedItems.includes(noun)) {
        const curseMessages = processCursedItem(noun, gameState);
        return {
          messages: curseMessages.messages,
          updates: curseMessages.updates as any
        };
      }

      // Item usage logic
      switch (noun) {
        case 'dimensional_key':
          if (currentRoom.id?.includes('portal') || currentRoom.exits?.portal) {
            messages.push({ text: 'The dimensional key activates the portal!', type: 'system' });
            applyScoreForEvent('solve.puzzle.hard');
            // Record item usage in codex

            recordItemDiscovery(noun, 'Successfully used dimensional key to activate portal');
          } else {
            messages.push({ text: 'The key glows but has nothing to unlock here.', type: 'info' });
          }
          break;

        case 'safe_combination':
          if (currentRoom.id?.includes('office') || currentRoom.id?.includes('safe')) {
            messages.push({ text: 'You use the combination to open the safe!', type: 'system' });
            applyScoreForEvent('solve.puzzle.simple');

            recordItemDiscovery(noun, 'Opened safe with combination');
          } else {
            messages.push({ text: 'There\'s no safe here to use this on.', type: 'error' });
          }
          break;

        case 'goldfish_food':
          if (gameState.player.inventory.includes('dominic')) {
            messages.push({ text: 'You feed Dominic. He seems appreciative and swims happily.', type: 'lore' });
            applyScoreForEvent('npc.dominic.survives');

            recordItemDiscovery(noun, 'Fed to Dominic the goldfish');
          } else {
            messages.push({ text: 'You don\'t have a goldfish to feed.', type: 'error' });
          }
          break;

        case 'firstaidkit':
          const currentHealth = gameState.player.health;
          if (currentHealth < 100) {
            const healAmount = Math.min(30, 100 - currentHealth);
            messages.push({ text: `The first aid kit restores ${healAmount} health.`, type: 'system' });
            updates.player = {
              ...gameState.player,
              health: currentHealth + healAmount,
              inventory: gameState.player.inventory.filter((item: string) => item !== noun), // Consumable
            };
            applyScoreForEvent('item.shared'); // Bonus for self-care

            recordItemDiscovery(noun, 'Used for healing');
          } else {
            messages.push({ text: 'You\'re already at full health.', type: 'info' });
          }
          break;

        case 'ancient_scroll':
          messages.push({ text: 'The scroll reveals arcane knowledge about dimensional travel.', type: 'lore' });
          messages.push({ text: 'You gain insight into the nature of reality!', type: 'system' });
          applyScoreForEvent('discover.lore');

          recordItemDiscovery(noun, 'Revealed ancient knowledge about dimensional travel');
          break;

        case 'memory_crystal':
          messages.push({ text: 'The crystal pulses with stored memories...', type: 'lore' });
          messages.push({ text: 'Visions of past events flash through your mind!', type: 'system' });
          applyScoreForEvent('memory.recovered');
          break;

        case 'protective_charm':
          messages.push({ text: 'The charm glows with protective energy.', type: 'system' });
          messages.push({ text: 'You feel safer from curses and traps.', type: 'info' });
          // Could add temporary protection flag
          break;

        case 'remote_control':
          if (gameState.currentRoomId !== 'crossing') {
            messages.push({ text: 'The remote hums quietly but doesn\'t respond here. You need to be at the crossing to use it.', type: 'error' });
          } else {
            messages.push({ text: '📱 You flick open the remote control. The interface crackles with latent energy.', type: 'system' });
            messages.push({ text: '🌌 **Remote Control Hub List:**', type: 'system' });
            messages.push({ text: '', type: 'system' });

            // Display available hubs
            let hubNumber = 1;
            Object.entries(hubDisplayNames).forEach(([hubId, displayName]) => {
              if (gameState.roomMap[hubId]) { // Only show hubs that exist in the game
                messages.push({ text: `${hubNumber}. ${displayName}`, type: 'system' });
                hubNumber++;
              }
            });

            messages.push({ text: '', type: 'system' });
            messages.push({ text: '💫 Type: `teleport to [hub name]` to travel instantly', type: 'info' });
            messages.push({ text: 'Example: `teleport to control nexus`', type: 'info' });

            // Record codex entry for first use

            recordItemDiscovery('remote_control', 'Activated interdimensional travel menu at the crossing');

            // Apply score bonus for discovering the teleportation system
            applyScoreForEvent('discover.teleport.system');

            // Unlock interdimensional traveler achievement
            unlockAchievement('interdimensional_traveler');
          }
          break;

        default:
          // Check if it's a known item category
          const isDimensionalTool = noun.includes('dimensional') || noun.includes('key') || noun.includes('remote');
          const isMemoryFragment = noun.includes('memory') || noun.includes('fragment');

          if (isDimensionalTool) {
            messages.push({ text: `The ${noun} hums with interdimensional energy but doesn't activate here.`, type: 'info' });
          } else if (isMemoryFragment) {
            messages.push({ text: `The ${noun} contains fragmented memories, but you can't access them directly.`, type: 'info' });
          } else if (noun.includes('fae') || noun.includes('artifact')) {
            messages.push({ text: `The ${noun} tingles with fae magic but remains inert.`, type: 'info' });
          } else {
            messages.push({ text: `You can't use the ${noun} here.`, type: 'error' });
          }
      }

      return { messages, updates: Object.keys(updates).length > 0 ? updates : undefined };
    }

    case 'codex': {

      displayCodex();
      return { messages: [{ text: 'Codex displayed in console above.', type: 'system' }] };
    }

    case 'teleport': {
      // Debug teleport command for Geoff in debug mode
      if (gameState.player.name === 'Geoff' && gameState.settings.debugMode) {
        if (!noun) {
          return {
            messages: [{ text: 'DEBUG: Please specify a room ID to teleport to.', type: 'error' }],
          };
        }

        if (!gameState.roomMap[noun]) {
          return {
            messages: [{ text: `DEBUG: Room "${noun}" not found.`, type: 'error' }],
          };
        }

        return {
          messages: [{ text: `DEBUG: Teleported to ${noun}`, type: 'system' }],
          updates: {
            currentRoomId: noun,
            player: { ...gameState.player, currentRoom: noun },
          },
        };
      }

      // Handle teleport to [destination] commands
      if (!noun.startsWith('to ')) {
        return { messages: [{ text: 'Usage: teleport to [destination]', type: 'error' }] };
      }

      const targetDestination = noun.substring(3).trim(); // Remove "to " prefix

      // Check if player has either remote control or navigation crystal
      const hasRemoteControl = gameState.player.inventory.includes('remote_control');
      const hasNavigationCrystal = gameState.player.inventory.includes('navigation_crystal');

      if (!hasRemoteControl && !hasNavigationCrystal) {
        return {
          messages: [{
            text: 'You need either a remote control or navigation crystal to teleport.',
            type: 'error'
          }]
        };
      }

      // Check if player is at the crossing
      if (gameState.currentRoomId !== 'crossing') {
        return {
          messages: [{
            text: 'You must be at the crossing to teleport. The devices don\'t respond elsewhere.',
            type: 'error'
          }]
        };
      }

      // Define allowed destinations
      const remoteControlDestinations = [
        'controlnexus', 'latticehub', 'gorstanhub', 'londonhub', 'mazehub',
        'hiddenlab', 'controlroom', 'dalesapartment', 'findlaterscornercoffeeshop',
        'gorstanvillage', 'lattice', 'datavoid', 'trentpark', 'stkatherinesdock',
        'torridoninn', 'libraryofnine', 'mazeecho', 'elfhame', 'faepalacemainhall'
      ];

      const crystalDestinations = ['trentpark', 'findlaterscornercoffeeshop'];

      // Determine available destinations based on what player has
      let allowedDestinations: string[] = [];
      let deviceName = '';

      if (hasRemoteControl) {
        allowedDestinations = remoteControlDestinations;
        deviceName = 'remote control';
      } else if (hasNavigationCrystal) {
        allowedDestinations = crystalDestinations;
        deviceName = 'navigation crystal';
      }

      // Check if target destination is valid for the device
      if (!allowedDestinations.includes(targetDestination)) {
        const availableList = allowedDestinations.join(', ');
        return {
          messages: [
            { text: `The ${deviceName} cannot reach that destination.`, type: 'error' },
            { text: `Available destinations: ${availableList}`, type: 'info' }
          ]
        };
      }

      // Check if the target room exists in the game
      if (!gameState.roomMap[targetDestination]) {
        return {
          messages: [{
            text: `The destination "${targetDestination}" is currently inaccessible.`,
            type: 'error'
          }]
        };
      }

      // Perform the teleportation
      const targetRoom = gameState.roomMap[targetDestination];
      const targetDisplayName = targetRoom.title || targetDestination;

      const messages: TerminalMessage[] = [];

      if (hasRemoteControl) {
        messages.push(
          { text: `📱 Remote control activated. Warping to ${targetDisplayName}...`, type: 'system' },
          { text: '🌀 Reality bends around you as the interdimensional portal opens!', type: 'system' },
          { text: `✨ You emerge at ${targetDisplayName}.`, type: 'system' }
        );
        recordItemDiscovery('remote_control', `Teleported to ${targetDisplayName}`);
      } else {
        messages.push(
          { text: `🔮 Navigation crystal pulses with ancient energy...`, type: 'system' },
          { text: '✨ The crystal guides you through a shimmering portal!', type: 'system' },
          { text: `🌟 You arrive at ${targetDisplayName}.`, type: 'system' }
        );
        recordItemDiscovery('navigation_crystal', `Used crystal to reach ${targetDisplayName}`);
      }

      // Apply score bonus for successful teleportation
      applyScoreForEvent('teleport.successful');

      // Update room
      const updates = {
        currentRoomId: targetDestination,
        previousRoomId: gameState.currentRoomId,
      };

      return { messages, updates };
    }

    case 'help': {
      const helpMessages: TerminalMessage[] = [
        { text: '--- Common Commands ---', type: 'system' as const },
        { text: 'go [direction] - Move in a direction', type: 'system' as const },
        { text: '[direction] - Move directly (north, south, east, west, etc.)', type: 'system' as const },
        { text: 'look - Examine your surroundings', type: 'system' as const },
        { text: 'get [item] - Take an item', type: 'system' as const },
        { text: 'drop [item] - Drop an item from inventory', type: 'system' as const },
        { text: 'use [item] - Use an item from inventory', type: 'system' as const },
        { text: 'show [item] - Show an item to NPCs', type: 'system' as const },
        { text: 'talk [npc] - Speak to someone', type: 'system' as const },
        { text: 'drink coffee - Reveal hidden paths to visited rooms', type: 'system' as const },
        { text: 'return/back - Return to previous room (if alive)', type: 'system' as const },
        { text: 'solve [puzzle] - Attempt to solve a puzzle', type: 'system' as const },
        { text: 'puzzles - List available puzzles in current area', type: 'system' as const },
        { text: 'hint - Get contextual help or puzzle hints', type: 'system' as const },
        { text: 'miniquests - List available miniquests in current area', type: 'system' as const },
        { text: 'attempt [miniquest] - Try to complete a miniquest', type: 'system' as const },
        { text: 'inventory (or i) - Check what you\'re carrying', type: 'system' as const },
        { text: 'sit - Sit down (if available)', type: 'system' as const },
        { text: 'jump - Jump (if available)', type: 'system' as const },
        { text: 'press [object] - Press or activate something', type: 'system' as const },
        { text: 'status - Check your status', type: 'system' as const },
        { text: 'score - View your current score', type: 'system' as const },
        { text: 'achievements - View your achievements', type: 'system' as const },
        { text: 'codex - View discovered items', type: 'system' as const },
        { text: 'teleport to [hub] - Use remote control for fast travel (at crossing only)', type: 'system' as const },
      ];

      return { messages: helpMessages };
    }

    case 'hint': {
      const currentRoom = gameState.roomMap[gameState.currentRoomId];
      const playerInventory = gameState.player.inventory || [];

      // Generate contextual hints based on room and player state
      let hintMessage = '';

      // Check if Ayla is available for hints
      const aylaInRoom = currentRoom?.npcs?.some((npc: any) =>
        typeof npc === 'string' ? npc.toLowerCase().includes('ayla') : false
      );

      if (aylaInRoom) {
        hintMessage = `🧚‍♀️ **Ayla whispers softly:**\n\n`;

        // Room-specific hints
        if (currentRoom?.id?.includes('puzzle')) {
          hintMessage += "This place holds secrets that respond to the right combination of elements. Look for patterns in what you see.";
        } else if (currentRoom?.items?.length && currentRoom.items.length > 0) {
          hintMessage += "I sense useful items here. Some may be more significant than they appear - examine them carefully.";
        } else if (currentRoom?.exits && Object.keys(currentRoom.exits).length > 3) {
          hintMessage += "Many paths diverge from here. Trust your instincts about which direction calls to you.";
        } else {
          hintMessage += "Every step you take weaves the tapestry of your journey. Sometimes the answer lies in what you carry with you.";
        }

        // Inventory-based hints
        if (playerInventory.length === 0) {
          hintMessage += "\n\nYour hands are empty, but your heart is full of potential. Look around for objects that resonate with purpose.";
        } else if (playerInventory.length > 5) {
          hintMessage += "\n\nYou carry much with you. Perhaps some items work better together than alone.";
        }

        // Special hints for common stuck points
        if (currentRoom?.id?.includes('locked') || currentRoom?.id?.includes('barrier')) {
          hintMessage += "\n\nBarriers exist to be overcome. What you need may already be within your grasp.";
        }

      } else {
        // Generic hints when Ayla is not present
        hintMessage = `💡 **Helpful Suggestions:**\n\n`;
        hintMessage += "• Use 'look' to examine your surroundings more carefully\n";
        hintMessage += "• Try 'inventory' to see what you're carrying\n";
        hintMessage += "• Check your 'codex' for information about discovered items\n";

        if (currentRoom?.items?.length && currentRoom.items.length > 0) {
          hintMessage += "• There are items here you can 'take'\n";
        }

        if (currentRoom?.npcs?.length && currentRoom.npcs.length > 0) {
          hintMessage += "• Someone here might have information - try 'talk to [name]'\n";
        }

        hintMessage += "• Remember that some items can be 'use'd in specific situations";
      }

      // Apply small score bonus for asking for help
      applyScoreForEvent('hint.requested');

      return { messages: [{ text: hintMessage, type: 'system' }] };
    }

    case 'puzzle':
    case 'puzzles': {
      // Show available puzzles in current room
      const roomDef = currentRoom as any;
      if (roomDef.puzzles && Array.isArray(roomDef.puzzles) && roomDef.puzzles.length > 0) {
        const messages: TerminalMessage[] = [
          { text: '🧩 **Puzzles in this area:**', type: 'system' },
          { text: '', type: 'system' }
        ];

        roomDef.puzzles.forEach((puzzle: any) => {
          const solved = (currentRoom.flags as any)?.[`${puzzle.id}_solved`];
          const attemptKey = `${puzzle.id}_attempts`;
          const attempts = typeof (currentRoom.flags as any)?.[attemptKey] === 'number'
            ? (currentRoom.flags as any)[attemptKey] as number
            : 0;
          const maxAttempts = puzzle.maxAttempts || 5;

          const status = solved ? '✅ SOLVED' :
                        attempts >= maxAttempts ? '❌ EXHAUSTED' :
                        attempts > 0 ? `🔄 ${maxAttempts - attempts} attempts left` : '🆕 NEW';

          messages.push({
            text: `• ${puzzle.name || puzzle.id} [${puzzle.difficulty.toUpperCase()}] - ${status}`,
            type: 'system'
          });

          if (puzzle.description) {
            messages.push({ text: `  ${puzzle.description}`, type: 'info' });
          }

          if (puzzle.requiredItems && puzzle.requiredItems.length > 0) {
            const hasItems = puzzle.requiredItems.every((item: string) =>
              gameState.player.inventory.includes(item)
            );
            const itemStatus = hasItems ? '✅' : '❌';
            messages.push({
              text: `  Required items: ${puzzle.requiredItems.join(', ')} ${itemStatus}`,
              type: 'info'
            });
          }
        });

        messages.push({ text: '', type: 'system' });
        messages.push({ text: 'Use `solve [puzzle name]` to attempt a puzzle', type: 'info' });

        return { messages };
      } else {
        return { messages: [{ text: 'There are no puzzles in this area.', type: 'info' }] };
      }
    }

    case 'miniquest':
    case 'miniquests': {
      // Enhanced miniquest interface - delegate to new command system
      return {
        messages: [
          { text: '🎯 Enhanced miniquest interface available!', type: 'system' as const },
          { text: 'The new world-class quest browser provides filtering, progress tracking, and detailed quest information.', type: 'info' as const },
          { text: 'Use the interface to explore available quests, view requirements, and track completion.', type: 'info' as const }
        ]
      };
    }

    case 'attempt': {
      if (!noun) {
        return { messages: [{ text: 'What miniquest do you want to attempt? Use "miniquests" to see available options.', type: 'error' }] };
      }

      // Enhanced attempt handling with better feedback
      const engine = MiniquestEngine.getInstance();
      const result = engine.attemptQuest(noun, gameState.currentRoomId, gameState as any);

      const messages: TerminalMessage[] = [
        { text: result.message, type: result.success ? 'system' : 'error' }
      ];

      if (result.success && result.scoreAwarded) {
        messages.push({ text: `🏆 Quest completed! +${result.scoreAwarded} points`, type: 'system' });
      }

      let updates: any = {};
      if (result.completed) {
        // Update miniquest state
        const stateUpdate = engine.updateStateAfterCompletion(
          gameState as any,
          gameState.currentRoomId,
          noun
        );
        updates = { ...updates, ...stateUpdate };
      }

      return {
        messages,
        updates: Object.keys(updates).length > 0 ? updates : undefined
      };
    }

    case 'quests': {
      // Enhanced quest alias with better messaging
      return {
        messages: [
          { text: '🎯 **Enhanced Quest System**', type: 'system' as const },
          { text: 'World-class miniquest interface with filtering, progress tracking, and detailed quest information.', type: 'info' as const },
          { text: 'Use "miniquests" to open the comprehensive quest browser.', type: 'info' as const }
        ]
      };
    }

    case 'objectives': {
      // Show current objectives in this area
      const engine = MiniquestEngine.getInstance();
      const availableQuests = engine.getAvailableQuests(gameState.currentRoomId, gameState as any);

      if (availableQuests.length === 0) {
        return {
          messages: [
            { text: '🎯 No immediate objectives in this area.', type: 'info' as const },
            { text: 'Explore other locations or progress the main story to unlock new quests.', type: 'info' as const }
          ]
        };
      }

      const messages: TerminalMessage[] = [
        { text: '🎯 **Current Objectives:**', type: 'system' as const }
      ];

      availableQuests.slice(0, 3).forEach(quest => {
        messages.push({ text: `• ${quest.title} - ${quest.description}`, type: 'info' as const });
        if (quest.triggerAction) {
          messages.push({ text: `  Try: ${quest.triggerAction}`, type: 'lore' as const });
        }
      });

      if (availableQuests.length > 3) {
        messages.push({ text: `...and ${availableQuests.length - 3} more. Use "miniquests" to see all.`, type: 'info' as const });
      }

      return { messages };
    }

    case 'debug': {
      // Only available for player named "Geoff" when debug mode is enabled
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      const debugMessages: TerminalMessage[] = [
        { text: '--- GEOFF DEBUG PANEL ---', type: 'system' as const },
        { text: `Current Room ID: ${gameState.currentRoomId}`, type: 'system' as const },
        { text: `Previous Room ID: ${gameState.previousRoomId || 'None'}`, type: 'system' as const },
        { text: `Player Health: ${gameState.player.health}`, type: 'system' as const },
        { text: `Inventory: ${gameState.player.inventory.length > 0 ? gameState.player.inventory.join(', ') : 'Empty'}`, type: 'system' as const },
        { text: `Visited Rooms: ${gameState.player.visitedRooms?.length || 0}`, type: 'system' as const },
        { text: `Coffee Available: ${gameState.player.inventory.includes('coffee') ? 'Yes' : 'No'}`, type: 'system' as const },
        { text: `Debug Mode: ${gameState.settings.debugMode ? 'Enabled' : 'Disabled'}`, type: 'system' as const },
        { text: `Game Stage: ${gameState.stage}`, type: 'system' as const },
        { text: `Room Exits: ${Object.keys(currentRoom.exits || {}).join(', ') || 'None'}`, type: 'system' as const },
        { text: `Room Items: ${(currentRoom.items && currentRoom.items.length > 0) ? currentRoom.items.join(', ') : 'None'}`, type: 'system' as const },
        { text: `Room NPCs: ${(currentRoom.npcs && currentRoom.npcs.length > 0) ? currentRoom.npcs.join(', ') : 'None'}`, type: 'system' as const },
        { text: '--- DEBUG COMMANDS ---', type: 'system' as const },
        { text: 'heal - Restore full health', type: 'system' as const },
        { text: 'coffee - Add coffee to inventory', type: 'system' as const },
        { text: 'cleartravelmenu - Force close travel menu', type: 'system' as const },
        { text: 'teleport [roomId] - Jump to any room', type: 'system' as const },
        { text: 'testachievement [id] - Test unlock achievement (debug)', type: 'system' as const },
        { text: 'spawnnpc [npcId] - Force spawn wandering NPC (debug)', type: 'system' as const },
        { text: 'listnpcs - List active wandering NPCs (debug)', type: 'system' as const },
        { text: 'wendell - Force spawn Mr. Wendell (debug)', type: 'system' as const },
        { text: 'wendellstatus - Check Mr. Wendell state (debug)', type: 'system' as const },
      ];

      return { messages: debugMessages };
    }

    case 'heal': {
      // Debug command: only for Geoff in debug mode
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Health restored to 100%', type: 'system' }],
        updates: {
          player: { ...gameState.player, health: 100 },
        },
      };
    }

    case 'coffee': {
      // Debug command: add coffee to inventory (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      if (gameState.player.inventory.includes('coffee')) {
        return {
          messages: [{ text: 'DEBUG: You already have coffee in your inventory.', type: 'system' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Coffee added to your inventory.', type: 'system' }],
        updates: {
          player: { ...gameState.player, inventory: [...gameState.player.inventory, 'coffee'] },
        },
      };
    }

    case 'cleartravelmenu': {
      // Debug command: force close travel menu (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Travel menu flags cleared.', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            showTravelMenu: false,
            travelMenuTitle: undefined,
            travelMenuSubtitle: undefined,
            travelDestinations: undefined,
          },
        },
      };
    }

    case 'testachievement': {
      // Debug command: test unlock achievement (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      if (!noun) {
        return {
          messages: [{ text: 'DEBUG: Please specify an achievement ID to unlock.', type: 'error' }],
        };
      }

      unlockAchievement(noun);

      return {
        messages: [{ text: `DEBUG: Attempted to unlock achievement: ${noun}`, type: 'system' }],
      };
    }

    case 'spawnnpc': {
      // Debug command: spawn wandering NPC (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      if (!noun) {
        return {
          messages: [{
            text: 'DEBUG: Available NPCs: ayla, al_escape_artist, dominic_wandering, morthos, polly, albie',
            type: 'system'
          }],
        };
      }

      return {
        messages: [{ text: `DEBUG: NPC spawn command received for '${noun}'. Use debug panel for full functionality.`, type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            debugSpawnNPC: noun,
            debugSpawnRoom: gameState.currentRoomId
          }
        }
      };
    }

    case 'listnpcs': {
      // Debug command: list active wandering NPCs (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Check console for active wandering NPCs list.', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            debugListNPCs: true
          }
        }
      };
    }

    case 'wendell': {
      // Debug command: force spawn Mr. Wendell (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Forcing Mr. Wendell spawn...', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            forceWendellSpawn: true
          }
        }
      };
    }

    case 'wendellstatus': {
      // Debug command: check Mr. Wendell status (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Mr. Wendell status logged to console.', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            checkWendellStatus: true
          }
        }
      };
    }

    case 'librarian': {
      // Debug command: force spawn Librarian (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Forcing Librarian spawn in next library room...', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            forceLibrarianSpawn: true
          }
        }
      };
    }

    case 'librarianstatus': {
      // Debug command: check Librarian status (only for Geoff in debug mode)
      if (gameState.player.name !== 'Geoff' || !gameState.settings.debugMode) {
        return {
          messages: [{ text: 'Unknown command. Type "help" for available commands.', type: 'error' }],
        };
      }

      return {
        messages: [{ text: 'DEBUG: Librarian status logged to console.', type: 'system' }],
        updates: {
          flags: {
            ...gameState.flags,
            checkLibrarianStatus: true
          }
        }
      };
    }

    case 'sit': {
      // Special handling for Trent Park runic chair
      if (currentRoom.id === 'trentpark' &&
          (!noun || noun === 'chair' || noun === 'runic_chair' || noun === 'in_chair')) {
        return {
          messages: [
            { text: 'You approach the mysterious runic chair and hesitate for a moment...', type: 'info' },
            { text: 'The carved symbols around the base seem to pulse with anticipation.', type: 'lore' },
            { text: 'As you sit, the ancient wood creaks softly, but feels surprisingly warm and inviting.', type: 'info' },
            { text: '✨ The runes begin to glow with a soft, ethereal light.', type: 'lore' },
            { text: '🌳 You sense the hidden watchers in the trees shifting closer, observing intently.', type: 'lore' },
            { text: '🪑 A strange comfort settles over you - this chair has waited eons for the right person.', type: 'lore' },
            { text: '⚡ Suddenly, a crystalline "Press" button materializes on the armrest, glowing softly.', type: 'system' },
            { text: '💡 Type "press" to activate the chair\'s portal powers and travel to visited rooms.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInTrentParkChair: true,
            },
          },
        };
      }

      // Special handling for Torridon Inn innkeeper chair
      if (currentRoom.id === 'torridoninn' &&
          (!noun || noun === 'chair' || noun === 'innkeeper_chair' || noun === 'in_chair')) {
        return {
          messages: [
            { text: 'You carefully settle into the innkeeper\'s wooden chair behind the bar...', type: 'info' },
            { text: '🍺 The chair creaks knowingly under your weight - it has supported many travelers before you.', type: 'info' },
            { text: '🏰 From this position, you feel connected to the hospitality traditions of old Gorstan.', type: 'lore' },
            { text: '✨ The chair seems to resonate with memories of countless stories shared over ale and food.', type: 'lore' },
            { text: '🗺️ A sense of the inn\'s connection to distant places fills your awareness.', type: 'lore' },
            { text: '⚡ Suddenly, a carved wooden "Press" panel slides out from the chair\'s armrest.', type: 'system' },
            { text: '💡 Type "press" to access the innkeeper\'s travel network.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInTorridonInnChair: true,
            },
          },
        };
      }

      // Special handling for Burger Joint portal booth
      if (currentRoom.id === 'burgerjoint' &&
          (!noun || noun === 'chair' || noun === 'booth' || noun === 'portal_booth' || noun === 'in_booth')) {
        return {
          messages: [
            { text: 'You slide into the shimmering portal booth in the back corner...', type: 'info' },
            { text: '🍔 The vinyl seat feels surprisingly warm and comfortable, as if infused with dimensional energy.', type: 'info' },
            { text: '✨ The booth seems to exist slightly outside normal space - you feel connected to other realities.', type: 'lore' },
            { text: '🌟 The air around you shimmers with a faint golden light, and distant music plays softly.', type: 'lore' },
            { text: '🪑 Your burger joint experience is enhanced by this comfortable interdimensional seating.', type: 'lore' },
            { text: '⚡ Suddenly, a subtle "Press" control appears on the table in front of you.', type: 'system' },
            { text: '💡 Type "press" to activate the booth\'s reality navigation system.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInBurgerJointBooth: true,
            },
          },
        };
      }

      // Special handling for Findlater's dimensional chair
      if ((currentRoom.id === 'findlaters' || currentRoom.id === 'findlaterscornercoffeeshop') &&
          (!noun || noun === 'chair' || noun === 'dimensional_chair' || noun === 'in_chair')) {
        return {
          messages: [
            { text: 'You approach the dimensional chair tucked in the corner...', type: 'info' },
            { text: 'As you sit, reality seems to shift slightly around you, like viewing the world through clear water.', type: 'lore' },
            { text: '☕ The ambient cafe sounds become muffled and distant.', type: 'info' },
            { text: '✨ The chair feels warm and comforting, as if it recognizes your dimensional travels.', type: 'lore' },
            { text: '🌀 Space-time bends gently around you - you sense connection to other realities.', type: 'lore' },
            { text: '⚡ A soft chime emanates from the chair as a "Press" button materializes on the armrest.', type: 'system' },
            { text: '💡 Type "press" to activate the chair\'s interdimensional travel system.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInFindlatersChair: true,
            },
          },
        };
      }

      // Special handling for crossing room chair
      if (currentRoom.id === 'crossing' &&
          (!noun || noun === 'chair' || noun === 'in_chair')) {
        return {
          messages: [
            { text: 'You approach the white chair and slowly lower yourself into it...', type: 'info' },
            { text: 'The chair feels strange at first - not quite designed for human anatomy.', type: 'info' },
            { text: 'But then something remarkable happens: the chair begins to mold itself around you!', type: 'lore' },
            { text: '✨ The surface adjusts, supporting every curve of your body perfectly.', type: 'lore' },
            { text: '🪑 This becomes the most comfortable chair you have ever experienced in your life.', type: 'lore' },
            { text: '⚡ A soft glow emanates from the armrest, revealing a subtle "Press" button.', type: 'system' },
            { text: '💡 Type "press" to access the chair\'s navigation system.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInCrossingChair: true,
            },
          },
        };
      }

      // Special handling for Palace main hall throne
      if (currentRoom.id === 'faepalacemainhall' &&
          (!noun || noun === 'throne' || noun === 'crystal_thrones' || noun === 'chair' || noun === 'in_throne')) {
        return {
          messages: [
            { text: 'You approach the magnificent crystal thrones with deep reverence...', type: 'info' },
            { text: '👑 The starlight-infused crystal feels warm against your touch as you carefully sit.', type: 'info' },
            { text: '✨ Ancient Fae magic courses through you - you feel the weight of royal authority.', type: 'lore' },
            { text: '🏰 From this throne, you sense the entire Fae realm and its connections to other worlds.', type: 'lore' },
            { text: '💎 The crystal responds to your presence, glowing brighter with each breath.', type: 'lore' },
            { text: '⚡ A regal "Press" control materializes on the throne\'s crystalline armrest.', type: 'system' },
            { text: '💡 Type "press" to access the royal travel network through the Fae court system.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInPalaceThrone: true,
            },
          },
        };
      }

      // Special handling for maze storage chamber broken chair
      if (currentRoom.id === 'storagechamber' &&
          (!noun || noun === 'chair' || noun === 'broken_chair' || noun === 'in_chair')) {
        return {
          messages: [
            { text: 'You carefully approach the broken chair, testing its stability...', type: 'info' },
            { text: '🪑 Despite its dilapidated appearance, the chair holds your weight - barely.', type: 'info' },
            { text: '✨ As you sit, you feel something unexpected - a faint pulse of dormant magic.', type: 'lore' },
            { text: '🔮 This broken chair was once something special, its power diminished but not destroyed.', type: 'lore' },
            { text: '💫 Through the cracks and tears, you sense connections to distant places.', type: 'lore' },
            { text: '⚡ A flickering "Press" panel emerges from beneath the torn upholstery.', type: 'system' },
            { text: '💡 Type "press" to attempt activating the chair\'s weakened portal system.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInStorageChair: true,
            },
          },
        };
      }

      // Check for chair-specific teleportation exits first
      if (currentRoom.exits && currentRoom.exits.chair_portal) {
        const targetRoomId = currentRoom.exits.chair_portal;
        return {
          messages: [
            { text: 'You sit in the chair and feel a profound shift in reality...', type: 'info' },
            { text: 'The world dissolves around you as ancient forces transport you elsewhere!', type: 'lore' }
          ],
          updates: {
            currentRoomId: targetRoomId,
            player: {
              ...gameState.player,
              currentRoom: targetRoomId,
            },
          },
        };
      }

      // Check for general sit exits (existing functionality)
      if (currentRoom.exits && currentRoom.exits.sit) {
        const targetRoomId = currentRoom.exits.sit;
        return {
          messages: [{ text: 'You sit down and feel a strange sensation...', type: 'info' }],
          updates: {
            currentRoomId: targetRoomId,
            player: {
              ...gameState.player,
              currentRoom: targetRoomId,
            },
          },
        };
      }

      // Check if there's a chair interactable but no teleportation
      const roomDef = currentRoom as any;
      if (roomDef.interactables && roomDef.interactables.chair) {
        return {
          messages: [
            { text: 'You sit in the chair and take a moment to rest.', type: 'info' },
            { text: 'The chair is comfortable, but nothing unusual happens.', type: 'info' }
          ],
        };
      }

      return { messages: [{ text: "There's nowhere to sit here.", type: 'error' }] };
    }

    case 'stand':
    case 'get_up':
    case 'stand_up': {
      // Handle standing up from Torridon Inn innkeeper chair
      if (currentRoom.id === 'torridoninn' &&
          gameState.flags.sittingInTorridonInnChair) {
        return {
          messages: [
            { text: '🏰 You rise from the innkeeper\'s chair with a sense of gratitude...', type: 'info' },
            { text: 'The wood creaks a farewell as you step away from the bar.', type: 'lore' },
            { text: '⚡ The carved panel slides smoothly back into the armrest.', type: 'system' },
            { text: '🍺 The chair settles back into its role as guardian of Highland hospitality.', type: 'info' },
            { text: 'You feel blessed by the traditions of safe harbor and traveler\'s rest.', type: 'lore' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInTorridonInnChair: false,
            },
          },
        };
      }

      // Handle standing up from Burger Joint portal booth
      if (currentRoom.id === 'burgerjoint' &&
          gameState.flags.sittingInBurgerJointBooth) {
        return {
          messages: [
            { text: '🍔 You slide out of the comfortable portal booth...', type: 'info' },
            { text: 'The dimensional shimmer fades as you return to normal space.', type: 'lore' },
            { text: '⚡ The press control dissolves like burger steam.', type: 'system' },
            { text: '🌟 The golden light fades, leaving just a regular booth with slightly newer vinyl.', type: 'info' },
            { text: 'You can still smell the faint aroma of interdimensional travel mixed with burger grease.', type: 'lore' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInBurgerJointBooth: false,
            },
          },
        };
      }

      // Handle standing up from Findlater's dimensional chair
      if ((currentRoom.id === 'findlaters' || currentRoom.id === 'findlaterscornercoffeeshop') &&
          gameState.flags.sittingInFindlatersChair) {
        return {
          messages: [
            { text: '☕ You slowly rise from the dimensional chair...', type: 'info' },
            { text: 'Reality gently returns to its normal flow around you.', type: 'lore' },
            { text: '⚡ The press button fades like steam from a coffee cup.', type: 'system' },
            { text: '🌀 The ambient cafe sounds return to their normal volume and clarity.', type: 'info' },
            { text: 'The chair settles back into its corner, looking perfectly ordinary once again.', type: 'lore' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInFindlatersChair: false,
            },
          },
        };
      }

      // Handle standing up from Trent Park runic chair
      if (currentRoom.id === 'trentpark' &&
          gameState.flags.sittingInTrentParkChair) {
        return {
          messages: [
            { text: '🌳 You slowly rise from the ancient runic chair...', type: 'info' },
            { text: 'The glowing runes around the base gradually dim to their dormant state.', type: 'lore' },
            { text: '⚡ The crystalline press button fades away like morning mist.', type: 'system' },
            { text: '🦉 The hidden watchers seem to retreat deeper into the shadows, their vigil temporarily ended.', type: 'lore' },
            { text: 'The chair returns to its simple wooden appearance, but you sense it remembers you.', type: 'lore' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInTrentParkChair: false,
            },
          },
        };
      }

      // Handle standing up from Palace main hall throne
      if (currentRoom.id === 'faepalacemainhall' &&
          gameState.flags.sittingInPalaceThrone) {
        return {
          messages: [
            { text: '👑 You rise gracefully from the crystal throne with royal dignity...', type: 'info' },
            { text: 'The starlight-infused crystal dims as the ancient magic recedes.', type: 'lore' },
            { text: '⚡ The regal press control dissolves into sparkling motes of light.', type: 'system' },
            { text: '✨ The throne resumes its patient wait for the next worthy ruler.', type: 'lore' },
            { text: '🏰 You feel honored to have briefly held the seat of Fae authority.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInPalaceThrone: false,
            },
          },
        };
      }

      // Handle standing up from maze storage chamber broken chair
      if (currentRoom.id === 'storagechamber' &&
          gameState.flags.sittingInStorageChair) {
        return {
          messages: [
            { text: '🪑 You carefully rise from the creaky broken chair...', type: 'info' },
            { text: 'The ancient wood groans with relief as you step away.', type: 'lore' },
            { text: '⚡ The flickering press panel fades back beneath the torn fabric.', type: 'system' },
            { text: '💫 Despite its condition, the chair\'s hidden power retreats into dormancy.', type: 'lore' },
            { text: 'You\'re surprised it held together - such hidden strength in broken things.', type: 'info' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInStorageChair: false,
            },
          },
        };
      }

      // Handle standing up from crossing chair
      if (currentRoom.id === 'crossing' &&
          gameState.flags.sittingInCrossingChair) {
        return {
          messages: [
            { text: '🪑 You slowly rise from the incredibly comfortable chair...', type: 'info' },
            { text: 'The chair gracefully returns to its original simple white form.', type: 'info' },
            { text: '⚡ The glowing press button fades away as you step back.', type: 'system' },
            { text: 'You find yourself missing the perfect comfort already.', type: 'lore' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInCrossingChair: false,
            },
          },
        };
      }

      // Default stand response for any remaining sitting states
      if (gameState.flags.sittingInCrossingChair ||
          gameState.flags.sittingInTrentParkChair ||
          gameState.flags.sittingInFindlatersChair ||
          gameState.flags.sittingInBurgerJointBooth ||
          gameState.flags.sittingInTorridonInnChair ||
          gameState.flags.sittingInPalaceThrone ||
          gameState.flags.sittingInStorageChair) {
        return {
          messages: [{ text: 'You stand up.', type: 'info' }],
          updates: {
            flags: {
              ...gameState.flags,
              sittingInCrossingChair: false,
              sittingInTrentParkChair: false,
              sittingInFindlatersChair: false,
              sittingInBurgerJointBooth: false,
              sittingInTorridonInnChair: false,
              sittingInPalaceThrone: false,
              sittingInStorageChair: false,
            },
          },
        };
      }

      return { messages: [{ text: "You're already standing.", type: 'info' }] };
    }

    case 'jump': {
      if (currentRoom.exits && currentRoom.exits.jump) {
        const targetRoomId = currentRoom.exits.jump;

        // Special message for jumping through portal at St Katherine's Dock
        let jumpMessage = 'You jump and find yourself somewhere else!';
        if (currentRoom.id === 'stkatherinesdock' && targetRoomId === 'centralpark') {
          jumpMessage = 'You take a running leap and dive headfirst through the shimmering portal! Reality blurs around you as you hurtle across dimensions from London to New York...';
        }

        return {
          messages: [{ text: jumpMessage, type: 'info' }],
          updates: {
            currentRoomId: targetRoomId,
            player: {
              ...gameState.player,
              currentRoom: targetRoomId,
            },
          },
        };
      }
      return { messages: [{ text: "You jump in place. Nothing happens.", type: 'error' }] };
    }

    case 'talk':
    case 'speak': {
      if (!noun) {
        if (currentRoom.npcs && currentRoom.npcs.length > 0) {
          const npcNames = currentRoom.npcs.join(', ');
          return { messages: [{ text: `Who do you want to talk to? Available: ${npcNames}`, type: 'info' }] };
        }
        return { messages: [{ text: 'There is no one here to talk to.', type: 'error' }] };
      }

      if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        const npc = currentRoom.npcs.find(n => n.toLowerCase().includes(noun.toLowerCase()));
        if (npc) {
          const greeting = `${npc} nods at you but doesn't say anything.`;

          // Award points for meaningful NPC interactions
          const conversationScore = 10;
          const newScore = (gameState.player.score || 0) + conversationScore;

          return {
            messages: [
              { text: `You speak to ${npc}.`, type: 'info' },
              { text: `${npc}: "${greeting}"`, type: 'lore' },
              { text: `Score: +${conversationScore} points`, type: 'system' }
            ],
            updates: {
              player: { ...gameState.player, score: newScore }
            }
          };
        }
      }
      return { messages: [{ text: `You don't see ${noun} here.`, type: 'error' }] };
    }

    case 'drink': {
      if (noun === 'coffee') {
        if (!gameState.player.inventory.includes('coffee')) {
          return { messages: [{ text: "You don't have any coffee to drink.", type: 'error' }] };
        }

        // Remove coffee from inventory
        const newInventory = gameState.player.inventory.filter(item => item !== 'coffee');

        // Award points for using coffee strategically
        const coffeeScore = 20;
        const newScore = (gameState.player.score || 0) + coffeeScore;

        // Get list of previously visited rooms (excluding current room)
        const visitedRooms = gameState.player.visitedRooms || [gameState.currentRoomId];
        const availableDestinations = visitedRooms.filter((roomId: string) => roomId !== gameState.currentRoomId);

        const messages: TerminalMessage[] = [
          { text: 'You drink the rich, aromatic coffee...', type: 'info' },
          { text: 'Your senses sharpen and reality seems to shift around you.', type: 'lore' },
          { text: 'Hidden pathways begin to shimmer into view!', type: 'system' },
          { text: '🌟 A travel menu materializes showing all the places you\'ve been!', type: 'system' },
          { text: `Score: +${coffeeScore} points`, type: 'system' }
        ];

        return {
          messages,
          updates: {
            player: {
              ...gameState.player,
              inventory: newInventory,
              score: newScore,
            },
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: '☕ Coffee-Enhanced Navigation',
              travelMenuSubtitle: 'Dimensional pathways revealed through caffeine enlightenment',
              travelDestinations: availableDestinations,
            },
          },
        };
      }
      return { messages: [{ text: `You can't drink ${noun || 'that'}.`, type: 'error' }] };
    }

    case 'throw': {
      if (noun === 'coffee') {
        if (!gameState.player.inventory.includes('coffee')) {
          return { messages: [{ text: "You don't have any coffee to throw.", type: 'error' }] };
        }

        // Remove coffee from inventory
        const newInventory = gameState.player.inventory.filter(item => item !== 'coffee');

        // Award fewer points than drinking (waste of coffee!)
        const throwScore = 10;
        const newScore = (gameState.player.score || 0) + throwScore;

        // Get list of previously visited rooms (excluding current room)
        const visitedRooms = gameState.player.visitedRooms || [gameState.currentRoomId];
        const availableDestinations = visitedRooms.filter((roomId: string) => roomId !== gameState.currentRoomId);

        const messages: TerminalMessage[] = [
          { text: 'You angrily throw the coffee across the room!', type: 'info' },
          { text: 'The liquid arcs through the air, splashing dramatically...', type: 'info' },
          { text: 'As the coffee impacts, reality ripples and dimensional tears appear!', type: 'lore' },
          { text: '🌟 A chaotic travel menu erupts from the coffee stains!', type: 'system' },
          { text: `Score: +${throwScore} points (coffee wasted, but dramatically effective)`, type: 'system' }
        ];

        return {
          messages,
          updates: {
            player: {
              ...gameState.player,
              inventory: newInventory,
              score: newScore,
            },
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: '☕💥 Chaotic Coffee Navigation',
              travelMenuSubtitle: 'Dimensional rifts created through caffeinated violence',
              travelDestinations: availableDestinations,
            },
          },
        };
      }
      return { messages: [{ text: `You can't throw ${noun || 'that'}.`, type: 'error' }] };
    }

    case 'return':
    case 'back': {
      // Check if player is alive
      if (gameState.player.health <= 0) {
        return { messages: [{ text: "You cannot return anywhere while dead.", type: 'error' }] };
      }

      // Check if there's a previous room to return to
      if (!gameState.previousRoomId) {
        return { messages: [{ text: "There's nowhere to return to.", type: 'error' }] };
      }

      // Check if the previous room still exists
      if (!gameState.roomMap[gameState.previousRoomId]) {
        return { messages: [{ text: "The way back has been lost to the void.", type: 'error' }] };
      }

      return {
        messages: [
          { text: 'You retrace your steps back to where you came from...', type: 'info' },
          { text: 'The familiar path leads you safely back.', type: 'system' }
        ],
        updates: {
          currentRoomId: gameState.previousRoomId,
          player: {
            ...gameState.player,
            currentRoom: gameState.previousRoomId,
          },
        },
      };
    }

    case 'solve': {
      if (!noun) {
        return { messages: [{ text: 'What puzzle do you want to solve?', type: 'error' }] };
      }

      // Enhanced puzzle solving with concepts from puzzleEngine
      const roomDef = currentRoom as any;
      const playerTraits = gameState.player.traits || [];
      const playerInventory = gameState.player.inventory || [];

      if (roomDef.puzzles && Array.isArray(roomDef.puzzles)) {
        const puzzle = roomDef.puzzles.find((p: any) =>
          p.id.toLowerCase().includes(noun.toLowerCase()) ||
          p.name?.toLowerCase().includes(noun.toLowerCase())
        );

        if (puzzle) {
          // Check if puzzle is already solved
          if ((currentRoom.flags as any)?.[`${puzzle.id}_solved`]) {
            return { messages: [{ text: 'This puzzle has already been solved.', type: 'info' }] };
          }

          // Check required items
          if (puzzle.requiredItems && puzzle.requiredItems.length > 0) {
            const missingItems = puzzle.requiredItems.filter((item: string) => !playerInventory.includes(item));
            if (missingItems.length > 0) {
              return { messages: [
                { text: `You need these items to solve this puzzle: ${missingItems.join(', ')}`, type: 'error' },
                { text: 'Search the area or explore other rooms to find what you need.', type: 'info' }
              ]};
            }
          }

          // Check trait boosts
          const hasBoostTrait = puzzle.traitBoost && puzzle.traitBoost.some((trait: string) =>
            playerTraits.includes(trait)
          );

          // Calculate success chance based on difficulty and traits
          let baseChance = 0.7; // 70% base success rate
          switch (puzzle.difficulty) {
            case 'easy': baseChance = 0.85; break;
            case 'medium': baseChance = 0.7; break;
            case 'hard': baseChance = 0.5; break;
            case 'extreme': baseChance = 0.3; break;
          }

          // Apply trait boost
          if (hasBoostTrait) {
            baseChance = Math.min(0.95, baseChance + 0.2); // +20% with trait, max 95%
          }

          // Check attempt count
          const attemptKey = `${puzzle.id}_attempts`;
          const currentAttempts = typeof (currentRoom.flags as any)?.[attemptKey] === 'number'
            ? (currentRoom.flags as any)[attemptKey] as number
            : 0;
          const maxAttempts = puzzle.maxAttempts || 5;

          if (currentAttempts >= maxAttempts) {
            return { messages: [
              { text: `You have exhausted all attempts for this puzzle (${maxAttempts} maximum).`, type: 'error' },
              { text: 'Perhaps you need to approach this differently or come back later.', type: 'info' }
            ]};
          }

          const solved = Math.random() < baseChance;
          const newAttempts = currentAttempts + 1;

          if (solved) {
            // Calculate score based on difficulty and performance
            let scoreReward = 25; // Base points
            switch (puzzle.difficulty) {
              case 'easy': scoreReward = 25; break;
              case 'medium': scoreReward = 50; break;
              case 'hard': scoreReward = 75; break;
              case 'extreme': scoreReward = 150; break;
            }

            // Trait boost bonus
            if (hasBoostTrait) {
              scoreReward = Math.floor(scoreReward * 1.5);
            }

            // First attempt bonus
            if (newAttempts === 1) {
              scoreReward = Math.floor(scoreReward * 1.25);
            }

            const newScore = (gameState.player.score || 0) + scoreReward;

            // Apply appropriate scoring event
            switch (puzzle.difficulty) {
              case 'easy':
              case 'medium':
                applyScoreForEvent('solve.puzzle.simple');
                break;
              case 'hard':
                applyScoreForEvent('solve.puzzle.hard');
                break;
              case 'extreme':
                applyScoreForEvent('solve.puzzle.expert');
                break;
            }

            // Unlock achievement
            unlockAchievement('puzzle_solver');

            const messages: TerminalMessage[] = [
              { text: `🧩 You successfully solve the ${puzzle.name || puzzle.id}!`, type: 'system' },
            ];

            if (hasBoostTrait) {
              const boostTraits = puzzle.traitBoost.filter((trait: string) => playerTraits.includes(trait));
              messages.push({
                text: `✨ Your ${boostTraits.join(', ')} trait${boostTraits.length > 1 ? 's' : ''} helped you solve this more easily!`,
                type: 'lore'
              });
            }

            if (newAttempts === 1) {
              messages.push({ text: '🎯 Perfect solve! First attempt bonus applied.', type: 'system' });
            }

            messages.push({ text: 'Something in the room changes...', type: 'lore' });
            messages.push({ text: `Score: +${scoreReward} points!`, type: 'system' });

            // Add reward items if any
            let inventoryUpdates = {};
            if (puzzle.rewardItems && puzzle.rewardItems.length > 0) {
              const newInventory = [...playerInventory, ...puzzle.rewardItems];
              inventoryUpdates = { inventory: newInventory };
              messages.push({
                text: `You receive: ${puzzle.rewardItems.join(', ')}`,
                type: 'system'
              });

              // Record items in codex
              puzzle.rewardItems.forEach((item: string) => {

                recordItemDiscovery(item, `Reward for solving ${puzzle.name || puzzle.id}`);
              });
            }

            // Mark puzzle as solved
            const updatedRoom = {
              ...currentRoom,
              flags: {
                ...currentRoom.flags,
                [`${puzzle.id}_solved`]: true,
                [attemptKey]: newAttempts
              }
            } as Room;

            return {
              messages,
              updates: {
                player: {
                  ...gameState.player,
                  score: newScore,
                  ...inventoryUpdates
                },
                roomMap: {
                  ...gameState.roomMap,
                  [currentRoom.id]: updatedRoom as any,
                },
              },
            };
          } else {
            // Failed attempt
            const remainingAttempts = maxAttempts - newAttempts;
            const messages: TerminalMessage[] = [
              { text: `You struggle with the ${puzzle.name || puzzle.id} but can't solve it yet.`, type: 'error' }
            ];

            if (remainingAttempts > 0) {
              messages.push({
                text: `You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
                type: 'info'
              });

              // Give hints based on traits or items
              if (hasBoostTrait) {
                messages.push({
                  text: `Your ${puzzle.traitBoost.filter((t: string) => playerTraits.includes(t)).join(', ')} background suggests there might be a pattern here...`,
                  type: 'info'
                });
              }

              if (puzzle.hint) {
                messages.push({ text: `Hint: ${puzzle.hint}`, type: 'info' });
              }
            } else {
              messages.push({ text: 'You have no more attempts left for this puzzle.', type: 'error' });
            }

            // Update attempt count
            const updatedRoom = {
              ...currentRoom,
              flags: {
                ...currentRoom.flags,
                [attemptKey]: newAttempts
              }
            } as Room;

            return {
              messages,
              updates: {
                roomMap: {
                  ...gameState.roomMap,
                  [currentRoom.id]: updatedRoom as any,
                },
              },
            };
          }
        }
      }

      return { messages: [{ text: `You don't see any puzzle called '${noun}' here.`, type: 'error' }] };
    }

    // Direct direction commands
    case 'north':
    case 'south':
    case 'east':
    case 'west':
    case 'up':
    case 'down':
    case 'northeast':
    case 'northwest':
    case 'southeast':
    case 'southwest': {
      const direction = verb;
      if (currentRoom.exits && currentRoom.exits[direction]) {
        const targetRoomId = currentRoom.exits[direction];
        const targetRoom = gameState.roomMap[targetRoomId];

        const messages: TerminalMessage[] = [{ text: `You go ${direction}.`, type: 'info' }];
        let updates: any = {
          currentRoomId: targetRoomId,
          player: {
            ...gameState.player,
            currentRoom: targetRoomId,
          },
        };

        // Process room exit events before leaving
        const currentRoomDef = currentRoom as any;
        if (currentRoomDef.events?.onExit && Array.isArray(currentRoomDef.events.onExit)) {
          const exitResult = processRoomEvents(currentRoomDef.events.onExit, currentRoom, gameState);
          messages.push(...exitResult.messages);
          if (exitResult.updates) {
            // Merge exit updates with movement updates
            updates = { ...updates, ...exitResult.updates };
            // Update gameState for entry processing
            gameState = { ...gameState, ...exitResult.updates };
          }
        }

        // Process room entry events (traps, etc.) if target room exists
        if (targetRoom) {
          const entryResult = processRoomEntry(targetRoom as any, gameState);
          messages.push(...entryResult.messages);
          if (entryResult.updates) {
            updates = { ...updates, ...entryResult.updates };
          }
        }

        return { messages, updates };
      }
      return { messages: [{ text: "You can't go that way.", type: 'error' }] };
    }

    case 'press': {
      if (!noun) {
        return { messages: [{ text: 'What do you want to press?', type: 'error' }] };
      }

      // Handle blue button specifically in reset room
      if (currentRoom.id === 'introreset' && (noun === 'button' || noun === 'blue_button' || noun.includes('blue'))) {
        const currentPressCount = typeof gameState.flags.resetButtonPressCount === 'number' ? gameState.flags.resetButtonPressCount : 0;

        const messages: TerminalMessage[] = [];

        // Different messages based on press count
        switch (currentPressCount) {
          case 0:
            messages.push(
              { text: '⚠️ WARNING: You press the blue button!', type: 'error' },
              { text: '⚠️ A bright red warning sign illuminates: "DO NOT PRESS THIS BUTTON AGAIN!"', type: 'error' },
              { text: '⚠️ The psychic paper now shows: "SERIOUSLY, STOP PRESSING BUTTONS."', type: 'error' },
              { text: 'The chamber trembles slightly... reality feels more unstable.', type: 'lore' }
            );
            break;
          case 1:
            messages.push(
              { text: '⚠️ You press the button AGAIN despite the warnings!', type: 'error' },
              { text: '⚠️ The warning sign now flashes: "FINAL WARNING - STOP NOW!"', type: 'error' },
              { text: '⚠️ The psychic paper displays: "PLEASE. FOR THE LOVE OF ALL REALITIES. STOP."', type: 'error' },
              { text: 'The dimensional fabric around you begins to fray visibly...', type: 'lore' }
            );
            break;
          case 2:
            messages.push(
              { text: '⚠️ Against all reason and warnings, you press the button a THIRD time!', type: 'error' },
              { text: '⚠️ Warning sign: "YOU HAVE DOOMED US ALL."', type: 'error' },
              { text: '⚠️ Psychic paper: "This is why we can\'t have nice multiverses."', type: 'error' },
              { text: 'Reality is beginning to unravel around the edges...', type: 'lore' }
            );
            break;
          case 3:
            messages.push(
              { text: '⚠️ The fourth press... reality shudders!', type: 'error' },
              { text: '⚠️ Warning sign: "CRITICAL DAMAGE TO SPACETIME DETECTED."', type: 'error' },
              { text: '⚠️ Psychic paper: "We tried to warn you. We really did."', type: 'error' },
              { text: 'The walls begin to flicker between different realities...', type: 'lore' }
            );
            break;
          case 4:
            messages.push(
              { text: '⚠️ FIFTH PRESS - CATASTROPHIC FAILURE IMMINENT!', type: 'error' },
              { text: '⚠️ Warning sign: "DIMENSIONAL COLLAPSE IN PROGRESS."', type: 'error' },
              { text: '⚠️ Psychic paper: "Well, it was nice knowing you."', type: 'error' },
              { text: 'The chamber is actively dissolving into other dimensions...', type: 'lore' }
            );
            break;
          default:
            if (currentPressCount >= 5) {
              // Unlock reset achievement
              unlockAchievement('reset_count_1');

              messages.push(
                { text: '💥 REALITY RESET INITIATED!', type: 'error' },
                { text: '💥 The button finally does what it was designed to do...', type: 'error' },
                { text: '💥 Everything dissolves into brilliant white light...', type: 'error' },
                { text: '💥 You find yourself back at the beginning...', type: 'system' }
              );

              // Trigger full game reset on 6th press
              return {
                messages,
                updates: {
                  ...gameState,
                  stage: 'welcome',
                  currentRoomId: '',
                  player: {
                    ...gameState.player,
                    health: 100,
                    inventory: [],
                    visitedRooms: [],
                    currentRoom: '',
                  },
                  flags: {
                    resetButtonPressCount: 0,
                    triggerResetEscalation: false,
                  },
                  history: [],
                } as any,
              };
            } else {
              messages.push(
                { text: `⚠️ You press the button for the ${currentPressCount + 1} time...`, type: 'error' },
                { text: '⚠️ The warnings become increasingly frantic.', type: 'error' },
                { text: 'Reality continues to destabilize...', type: 'lore' }
              );
            }
        }

        return {
          messages,
          updates: {
            flags: {
              ...gameState.flags,
              resetButtonPressCount: currentPressCount + 1,
              triggerResetEscalation: currentPressCount >= 5,
            },
          },
        };
      }

      // Handle chair press button in Torridon Inn (when sitting in innkeeper chair)
      if (currentRoom.id === 'torridoninn' &&
          gameState.flags.sittingInTorridonInnChair &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'panel' || noun === 'wooden_panel')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '🏰 Innkeeper\'s Travel Network';
        const subtitle = 'Highland hospitality connects all roads - safe passage to known lands';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the carved wooden panel that emerged from the armrest...', type: 'info' },
            { text: '🏰 The chair hums with the warm energy of Highland hospitality and ancient trade routes!', type: 'lore' },
            { text: '🍺 You sense the connections between inns, taverns, and safe houses across many realms.', type: 'lore' },
            { text: '⚡ A travel interface appears, showing the network of places where travelers are welcome...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle booth press button in Burger Joint (when sitting in portal booth)
      if (currentRoom.id === 'burgerjoint' &&
          gameState.flags.sittingInBurgerJointBooth &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'control' || noun === 'controls')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '🍔 Burger Joint Portal System';
        const subtitle = 'NYC neighborhood dimensional travel - comfort food style';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the subtle control that appeared on the table...', type: 'info' },
            { text: '🍔 The booth fills with the warm aroma of perfectly grilled burgers and the hum of interdimensional energy!', type: 'lore' },
            { text: '🌟 Golden light surrounds you as the portal booth activates its navigation protocols.', type: 'lore' },
            { text: '⚡ A travel interface materializes, showing destinations accessible through this friendly neighborhood portal...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle chair press button in Findlater's cafe (when sitting in dimensional chair)
      if ((currentRoom.id === 'findlaters' || currentRoom.id === 'findlaterscornercoffeeshop') &&
          gameState.flags.sittingInFindlatersChair &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'chair_button')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '☕ Cafe Dimensional Gateway';
        const subtitle = 'Coffee-powered interdimensional travel - all realities welcome';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the ethereal button that has appeared on the chair\'s armrest...', type: 'info' },
            { text: '☕ The aroma of coffee intensifies as dimensional pathways open!', type: 'lore' },
            { text: '🌀 The chair pulses with comfortable warmth as reality bends around you.', type: 'lore' },
            { text: '⚡ A travel interface manifests, showing places touched by your consciousness...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle chair press button in Trent Park (when sitting in runic chair)
      if (currentRoom.id === 'trentpark' &&
          gameState.flags.sittingInTrentParkChair &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'chair_button')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '🌳 Runic Chair Portal System';
        const subtitle = 'Ancient magic activated - travel to places you have been';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the crystalline button that materialized on the armrest...', type: 'info' },
            { text: '🌳 The ancient runes around the chair flare with brilliant light!', type: 'lore' },
            { text: '🪑 The chair pulses with magical energy as hidden watchers approve your choice.', type: 'lore' },
            { text: '⚡ A portal navigation interface appears, showing places your spirit has touched...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle chair press button in crossing room (when sitting)
      if (currentRoom.id === 'crossing' &&
          gameState.flags.sittingInCrossingChair &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'chair_button')) {

        const hasRemoteControl = gameState.player.inventory.includes('remote_control');

        // Get visited rooms for coffee-triggered travel menu or use predefined lists
        const visitedRooms = gameState.player.visitedRooms || [];

        let destinationList: string[];
        let title: string;
        let subtitle: string;

        if (hasRemoteControl) {
          // Full access to all hub rooms excluding Stanton Harcourt rooms
          destinationList = [
            'controlnexus', 'latticehub', 'gorstanhub', 'londonhub', 'mazehub',
            'hiddenlab', 'controlroom', 'dalesapartment', 'gorstanvillage',
            'lattice', 'datavoid', 'trentpark', 'stkatherinesdock', 'torridoninn',
            'libraryofnine', 'mazeecho', 'elfhame', 'faepalacemainhall',
            'newyorkhub', 'centralpark', 'manhattanhub', 'burgerjoint', 'mazestorage'
          ];
          title = '📱 Remote Control Navigation';
          subtitle = 'Full dimensional access granted - all realities available';
        } else {
          // Limited access to coffee shop and Trent Park
          destinationList = ['findlaterscornercoffeeshop', 'trentpark'];
          title = '🪑 Chair Navigation System';
          subtitle = 'Limited access - basic navigation only';
        }

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the glowing button on the chair\'s armrest...', type: 'info' },
            { text: '🪑 The chair hums softly and activates its navigation system!', type: 'system' },
            { text: '� A travel menu interface materializes before you...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: destinationList,
            },
          },
        };
      }

      // Handle throne press button in Palace main hall (when sitting in crystal throne)
      if (currentRoom.id === 'faepalacemainhall' &&
          gameState.flags.sittingInPalaceThrone &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'control' || noun === 'regal_control')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '👑 Royal Fae Court Network';
        const subtitle = 'Throne magic activated - travel through the royal realms';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You press the regal crystalline control that materialized...', type: 'info' },
            { text: '👑 The starlight-infused crystal throne pulses with ancient royal authority!', type: 'lore' },
            { text: '🏰 You feel the weight of Fae sovereignty as dimensional gateways awaken.', type: 'lore' },
            { text: '⚡ A royal travel interface appears, showing realms under Fae protection...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle broken chair press button in maze storage chamber (when sitting in broken chair)
      if (currentRoom.id === 'storagechamber' &&
          gameState.flags.sittingInStorageChair &&
          (!noun || noun === 'button' || noun === 'press_button' || noun === 'panel' || noun === 'flickering_panel')) {

        // Get visited rooms for travel menu
        const visitedRooms = gameState.player.visitedRooms || [];

        const title = '🪑 Broken Chair Portal System';
        const subtitle = 'Damaged but functional - unstable pathways to familiar places';

        // Store destinations in game state for travel menu
        return {
          messages: [
            { text: '✨ You carefully press the flickering panel that emerged...', type: 'info' },
            { text: '🪑 The broken chair creaks ominously but responds with surprising power!', type: 'lore' },
            { text: '💫 Despite its damage, ancient portal magic still flows through the worn wood.', type: 'lore' },
            { text: '⚡ A unstable travel interface flickers into view, showing accessible destinations...', type: 'system' }
          ],
          updates: {
            flags: {
              ...gameState.flags,
              showTravelMenu: true,
              travelMenuTitle: title,
              travelMenuSubtitle: subtitle,
              travelDestinations: visitedRooms,
            },
          },
        };
      }

      // Handle control panel and navigation console in crossing room
      if (currentRoom.id === 'crossing' &&
          (noun === 'control_panel' || noun === 'panel' || noun === 'control' || noun === 'controls')) {
        const messages: TerminalMessage[] = [];

        // Check if player has required navigation devices
        const hasRemoteControl = gameState.player.inventory.includes('remote_control');
        const hasNavigationCrystal = gameState.player.inventory.includes('navigation_crystal');

        if (hasRemoteControl) {
          messages.push(
            { text: '✨ You press the crystalline control panel...', type: 'info' },
            { text: '📱 Your remote control interfaces with the panel, downloading destination coordinates!', type: 'system' },
            { text: '🌟 The panel displays: "FULL DIMENSIONAL ACCESS GRANTED - ALL REALITIES AVAILABLE"', type: 'system' },
            { text: '⚡ Type "teleport" to access the complete destination matrix!', type: 'info' }
          );
        } else if (hasNavigationCrystal) {
          messages.push(
            { text: '✨ You press the crystalline control panel...', type: 'info' },
            { text: '🔮 Your navigation crystal resonates with the panel, but access is limited!', type: 'info' },
            { text: '⚠️ The panel displays: "LIMITED ACCESS - BASIC NAVIGATION ONLY"', type: 'system' },
            { text: '⚡ Type "teleport" to see available destinations!', type: 'info' }
          );
        } else {
          messages.push(
            { text: '✨ You press the crystalline control panel...', type: 'info' },
            { text: '❌ The panel flickers but remains inactive.', type: 'error' },
            { text: '💡 A message appears: "NAVIGATION DEVICE REQUIRED - REMOTE CONTROL OR NAVIGATION CRYSTAL"', type: 'system' },
            { text: '🔍 You need to find a navigation device to access the dimensional transport system.', type: 'info' }
          );
        }

        return { messages };
      }

      // Handle navigation console specifically
      if (currentRoom.id === 'crossing' &&
          (noun === 'navigation_console' || noun === 'console' || noun === 'navigation' || noun === 'interface')) {
        const messages: TerminalMessage[] = [];

        const hasRemoteControl = gameState.player.inventory.includes('remote_control');
        const hasNavigationCrystal = gameState.player.inventory.includes('navigation_crystal');

        if (hasRemoteControl || hasNavigationCrystal) {
          messages.push(
            { text: '🌀 You interface with the ethereal navigation console...', type: 'info' },
            { text: '✨ The console phases into full reality, responding to your navigation device!', type: 'system' },
            { text: '🎯 Dimensional coordinates are now accessible through the teleport system.', type: 'system' },
            { text: '⚡ Type "teleport" to begin your journey through the multiverse!', type: 'info' }
          );
        } else {
          messages.push(
            { text: '🌀 You try to interface with the ethereal navigation console...', type: 'info' },
            { text: '👻 Your hand passes through the console - it remains incorporeal.', type: 'error' },
            { text: '💫 The console whispers: "A navigation device must anchor this interface..."', type: 'system' },
            { text: '🔮 Find a remote control or navigation crystal to access this system.', type: 'info' }
          );
        }

        return { messages };
      }

      // Generic press for other objects
      return {
        messages: [{ text: `You can't press the ${noun}.`, type: 'error' }]
      };
    }

    // Miniquest-specific action handlers
    case 'inspect':
    case 'examine': {
      // Handle miniquest triggers for inspect/examine actions
      const target = noun || 'room';
      const action = `inspect ${target}`;
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      // Default examine behavior if no specific target
      if (!noun) {
        return {
          messages: [
            { text: 'You examine your surroundings more carefully.', type: 'info' },
            ...miniquestResult.messages
          ],
          updates: miniquestResult.updates
        };
      }

      // Check for specific object examination
      const examineMessages: TerminalMessage[] = [];

      if (target === 'stones' && currentRoom.id === 'faeglade') {
        examineMessages.push({ text: 'The standing stones pulse with ancient power, their Fae script shifting hypnotically.', type: 'lore' });
      } else if (target === 'reflections' && currentRoom.id === 'faelake') {
        examineMessages.push({ text: 'In the lake\'s surface, you see glimpses of alien worlds and distant realms.', type: 'lore' });
      } else if (target === 'symbols' && currentRoom.id === 'crossing') {
        examineMessages.push({ text: 'The floating symbols pulse with dimensional energy, hinting at pathways through reality.', type: 'lore' });
      } else {
        examineMessages.push({ text: `You examine the ${target} closely.`, type: 'info' });
      }

      return {
        messages: [...examineMessages, ...miniquestResult.messages],
        updates: miniquestResult.updates
      };
    }

    case 'listen': {
      const target = noun || '';
      const action = noun ? `listen ${noun}` : 'listen';
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      const listenMessages: TerminalMessage[] = [];

      if (currentRoom.id === 'faeglade' && (!target || target === 'trees' || target === 'oaks')) {
        listenMessages.push({ text: 'The ancient oaks whisper secrets of ages past in the ethereal breeze.', type: 'lore' });
      } else if (currentRoom.id === 'faepalacedungeons' && target === 'chains') {
        listenMessages.push({ text: 'The starlight chains hum with memories of what they have bound.', type: 'lore' });
      } else {
        listenMessages.push({ text: 'You listen carefully to your surroundings.', type: 'info' });
      }

      return {
        messages: [...listenMessages, ...miniquestResult.messages],
        updates: miniquestResult.updates
      };
    }

    case 'gather': {
      const target = noun || '';
      const action = `gather ${target}`;
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      if (target === 'sand' && currentRoom.id === 'faelake') {
        return {
          messages: [
            { text: 'You carefully gather some of the chiming silver sand.', type: 'system' },
            ...miniquestResult.messages
          ],
          updates: {
            player: {
              ...gameState.player,
              inventory: [...gameState.player.inventory, 'harmonic_sand']
            },
            ...miniquestResult.updates
          }
        };
      }

      return {
        messages: [
          { text: `You attempt to gather ${target || 'something'}.`, type: 'info' },
          ...miniquestResult.messages
        ],
        updates: miniquestResult.updates
      };
    }

    case 'trace': {
      const target = noun || '';
      const action = `trace ${target}`;
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      const traceMessages: TerminalMessage[] = [];

      if (target === 'symbols' && currentRoom.id === 'faepalacedungeons') {
        traceMessages.push({ text: 'As you trace the reality symbols, visions of cosmic truths flash through your mind.', type: 'lore' });
      } else if (target === 'markings' && currentRoom.id === 'forgottenchamber') {
        traceMessages.push({ text: 'The ancient markings reveal patterns that might be a map or code.', type: 'lore' });
      } else {
        traceMessages.push({ text: `You trace the ${target} with your finger.`, type: 'info' });
      }

      return {
        messages: [...traceMessages, ...miniquestResult.messages],
        updates: miniquestResult.updates
      };
    }

    case 'decipher': {
      const target = noun || '';
      const action = `decipher ${target}`;
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      return {
        messages: [
          { text: `You attempt to decipher the ${target}.`, type: 'info' },
          ...miniquestResult.messages
        ],
        updates: miniquestResult.updates
      };
    }

    case 'meditate': {
      const action = 'meditate';
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      const meditateMessages: TerminalMessage[] = [];

      if (currentRoom.id === 'trentpark') {
        meditateMessages.push({ text: 'You find inner peace in this sacred grove, feeling connected to ancient energies.', type: 'lore' });
      } else {
        meditateMessages.push({ text: 'You take a moment to center yourself and reflect.', type: 'info' });
      }

      return {
        messages: [...meditateMessages, ...miniquestResult.messages],
        updates: miniquestResult.updates
      };
    }

    case 'acknowledge': {
      const target = noun || '';
      const action = `acknowledge ${target}`;
      const miniquestResult = checkMiniquestTriggers(action, gameState, currentRoom);

      if (target === 'presence' && currentRoom.id === 'trentpark') {
        return {
          messages: [
            { text: 'You acknowledge the hidden watchers with a respectful nod. The shadows seem to shift in response.', type: 'lore' },
            ...miniquestResult.messages
          ],
          updates: miniquestResult.updates
        };
      }

      return {
        messages: [
          { text: `You acknowledge the ${target}.`, type: 'info' },
          ...miniquestResult.messages
        ],
        updates: miniquestResult.updates
      };
    }

    default: {
      // Check for special NPC interactions before returning unknown command
      const fullCommand = command.toLowerCase().trim();

      // Check for Librarian interactions (ask guard, enter door, talk to librarian)
      if (fullCommand.includes('ask guard') ||
          fullCommand.includes('enter') && fullCommand.includes('door') ||
          fullCommand.includes('librarian')) {

        // Import Librarian controller dynamically to avoid circular dependencies
        if (isLibrarianActive()) {
          // Set a flag to handle this interaction in the next state update
          return {
            messages: [{ text: "...", type: 'system' as const }],
            updates: {
              flags: {
                ...gameState.flags,
                pendingLibrarianCommand: fullCommand
              }
            }
          };
        }

        // For door choices specifically
        if ((fullCommand.includes('enter red door') ||
             fullCommand.includes('enter blue door') ||
             fullCommand.includes('enter green door')) ||
            fullCommand.startsWith('ask guard:')) {
          return {
            messages: [{ text: "Processing your choice...", type: 'system' as const }],
            updates: {
              flags: {
                ...gameState.flags,
                pendingLibrarianCommand: fullCommand
              }
            }
          };
        }
      }

      // Check if Mr. Wendell is mentioned and handle interaction
      if (fullCommand.includes('wendell')) {
        // Import Mr. Wendell controller dynamically to avoid circular dependencies
        // If Mr. Wendell is active, set a flag to handle this interaction in the next state update
        // (Dynamic import or controller logic should handle this elsewhere)
        return {
          messages: [{ text: "...", type: 'system' as const }],
          updates: {
            flags: {
              ...gameState.flags,
              pendingWendellCommand: fullCommand
            }
          }
        };
      }

      // Check for general rude behavior patterns
      const rudePatterns = [
        'bonehead', 'idiot', 'stupid', 'shut up', 'go away',
        'fuck off', 'piss off', 'get lost', 'screw you'
      ];

      if (rudePatterns.some(pattern => fullCommand.includes(pattern))) {
        return {
          messages: [{ text: "That's not very polite...", type: 'system' as const }],
          updates: {
            flags: {
              ...gameState.flags,
              wasRudeRecently: true,
              wasRudeToNPC: true
            }
          }
        };
      }

      return {
        messages: [{ text: "I don't understand that command.", type: 'error' as const }],
      };
    }
  }
}

export function isCommandResult(obj: any): obj is CommandResult {
  return (
    obj &&
    Array.isArray(obj.messages) &&
    obj.messages.every(
      (msg: any) =>
        msg &&
        typeof msg.text === 'string' &&
        ['info', 'error', 'system', 'lore'].includes(msg.type)
    ) &&
    (obj.updates === undefined ||
      (typeof obj.updates === 'object' && !Array.isArray(obj.updates)))
  );
}

export function isValidCommand(command: string): boolean {
  return typeof command === 'string' && command.trim().length > 0;
}
