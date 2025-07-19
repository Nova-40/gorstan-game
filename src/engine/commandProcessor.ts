// Module: src/engine/commandProcessor.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import { LocalGameState } from '../state/gameState';
import { TerminalMessage } from '../components/TerminalConsole';
import { Room } from '../types/Room';
import { RoomDefinition, TrapDefinition } from '../types/RoomTypes';
import { MiniquestEngine } from './miniquestInitializer';
import { unlockAchievement, listAchievements } from '../logic/achievementEngine';
import { applyScoreForEvent, getScoreBasedMessage, getDominicScoreComment } from '../state/scoreEffects';
import { recordItemDiscovery, displayCodex } from '../logic/codexTracker';

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
function processTrap(trap: TrapDefinition, gameState: LocalGameState): {
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
          const lostItems = trap.effect.itemsLost.filter(item => 
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
function processRoomEntry(room: Room & Partial<RoomDefinition>, gameState: LocalGameState): {
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
          const itemName = typeof item === 'string' ? item : item.name;
          messages.push({ text: `- ${itemName}`, type: 'info' as const });
        });
      }

      if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        messages.push({ text: 'People here:', type: 'info' as const });
        currentRoom.npcs.forEach(npc => {
          messages.push({ text: `- ${npc.name}`, type: 'info' as const });
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
        const itemName = typeof takenItem === 'string' ? takenItem : takenItem.name;
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
                ...currentRoom,
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
                  ...currentRoom,
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
                ...currentRoom,
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
          updates: curseMessages.updates
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
          if (gameState.currentRoomId !== 'introZone_crossing') {
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

      // Handle teleport to [hub name] commands
      if (!noun.startsWith('to ')) {
        return { messages: [{ text: 'Usage: teleport to [hub name]', type: 'error' }] };
      }

      const targetHubName = noun.substring(3).trim(); // Remove "to " prefix
      
      // Check if player has remote control
      if (!gameState.player.inventory.includes('remote_control')) {
        return { messages: [{ text: 'The remote hums quietly, but does nothing. You need the remote control to teleport.', type: 'error' }] };
      }

      // Check if player is at the crossing
      if (gameState.currentRoomId !== 'introZone_crossing') {
        return { messages: [{ text: 'You must be at the crossing to teleport. The remote doesn\'t respond elsewhere.', type: 'error' }] };
      }

      // Find matching hub
      const targetHubId = allowedHubs[targetHubName.toLowerCase()];
      if (!targetHubId) {
        const availableHubs = Object.keys(allowedHubs).join(', ');
        return { messages: [
          { text: `That destination is not recognized.`, type: 'error' },
          { text: `Available destinations: ${availableHubs}`, type: 'info' }
        ] };
      }

      // Check if the target room exists in the game
      if (!gameState.roomMap[targetHubId]) {
        return { messages: [{ text: `The ${targetHubName} is currently inaccessible.`, type: 'error' }] };
      }

      // Perform the teleportation
      const targetDisplayName = hubDisplayNames[targetHubId] || targetHubName;
      const messages: TerminalMessage[] = [
        { text: `📱 Remote control activated. Warping to ${targetDisplayName}...`, type: 'system' },
        { text: '🌀 Reality bends around you as the interdimensional portal opens!', type: 'system' },
        { text: `✨ You emerge at the ${targetDisplayName}.`, type: 'system' }
      ];

      // Record usage in codex
      
      recordItemDiscovery('remote_control', `Teleported to ${targetDisplayName}`);

      // Apply score bonus for successful teleportation
      applyScoreForEvent('teleport.successful');

      // Update room
      const updates = {
        currentRoomId: targetHubId,
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
        npc.id?.toLowerCase().includes('ayla') || npc.name?.toLowerCase().includes('ayla')
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
          const solved = currentRoom.flags?.[`${puzzle.id}_solved`];
          const attemptKey = `${puzzle.id}_attempts`;
          const attempts = typeof currentRoom.flags?.[attemptKey] === 'number' 
            ? currentRoom.flags[attemptKey] as number 
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
      // Show available miniquests in current room
      const engine = MiniquestEngine.getInstance();
      const questMessages = engine.listRoomQuests(gameState.currentRoomId, gameState as any);
      
      return {
        messages: questMessages.map(msg => ({ text: msg, type: 'system' as const }))
      };
    }

    case 'attempt': {
      if (!noun) {
        return { messages: [{ text: 'What miniquest do you want to attempt?', type: 'error' }] };
      }

      const engine = MiniquestEngine.getInstance();
      const result = engine.attemptQuest(noun, gameState.currentRoomId, gameState as any);
      
      const messages: TerminalMessage[] = [
        { text: result.message, type: result.success ? 'system' : 'error' }
      ];

      if (result.success && result.scoreAwarded) {
        messages.push({ text: `Score: +${result.scoreAwarded} points!`, type: 'system' });
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
        { text: `Room NPCs: ${(currentRoom.npcs && currentRoom.npcs.length > 0) ? currentRoom.npcs.map(npc => npc.name).join(', ') : 'None'}`, type: 'system' as const },
        { text: '--- DEBUG COMMANDS ---', type: 'system' as const },
        { text: 'heal - Restore full health', type: 'system' as const },
        { text: 'coffee - Add coffee to inventory', type: 'system' as const },
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
          const npcNames = currentRoom.npcs.map(npc => npc.name).join(', ');
          return { messages: [{ text: `Who do you want to talk to? Available: ${npcNames}`, type: 'info' }] };
        }
        return { messages: [{ text: 'There is no one here to talk to.', type: 'error' }] };
      }
      
      if (currentRoom.npcs && currentRoom.npcs.length > 0) {
        const npc = currentRoom.npcs.find(n => n.name.toLowerCase().includes(noun.toLowerCase()));
        if (npc) {
          const greeting = (npc as any).dialogue?.greeting || `${npc.name} nods at you but doesn't say anything.`;
          
          // Award points for meaningful NPC interactions
          const conversationScore = 10;
          const newScore = (gameState.player.score || 0) + conversationScore;
          
          return { 
            messages: [
              { text: `You speak to ${npc.name}.`, type: 'info' },
              { text: `${npc.name}: "${greeting}"`, type: 'lore' },
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
          { text: `Score: +${coffeeScore} points`, type: 'system' }
        ];

        // Generate random hidden exit if we have visited rooms to connect to
        let updatedRoom = currentRoom;
        if (availableDestinations.length > 0) {
          // Pick a random previously visited room
          const randomDestination = availableDestinations[Math.floor(Math.random() * availableDestinations.length)];
          
          // Create a temporary hidden exit
          const hiddenExitNames = ['secret', 'hidden', 'shimmer', 'phase', 'dimensional_rift', 'coffee_portal'];
          const exitName = hiddenExitNames[Math.floor(Math.random() * hiddenExitNames.length)];
          
          // Add the hidden exit to the current room
          updatedRoom = {
            ...currentRoom,
            exits: {
              ...currentRoom.exits,
              [exitName]: randomDestination
            }
          };

          messages.push({ 
            text: `A ${exitName.replace('_', ' ')} passage materializes, leading to a familiar place...`, 
            type: 'system' 
          });
          messages.push({ 
            text: `You can now go ${exitName} to return to a previously visited location.`, 
            type: 'info' 
          });
        } else {
          messages.push({ 
            text: 'You sense hidden possibilities, but no new paths reveal themselves yet.', 
            type: 'lore' 
          });
        }

        return {
          messages,
          updates: {
            player: {
              ...gameState.player,
              inventory: newInventory,
              score: newScore,
            },
            roomMap: {
              ...gameState.roomMap,
              [currentRoom.id]: updatedRoom,
            },
          },
        };
      }
      return { messages: [{ text: `You can't drink ${noun || 'that'}.`, type: 'error' }] };
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
          if (currentRoom.flags?.[`${puzzle.id}_solved`]) {
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
          const currentAttempts = typeof currentRoom.flags?.[attemptKey] === 'number' 
            ? currentRoom.flags[attemptKey] as number 
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
                  [currentRoom.id]: updatedRoom,
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
                  [currentRoom.id]: updatedRoom,
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
                },
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
        import('./librarianController').then(({ handleLibrarianInteraction, isLibrarianActive }) => {
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
        });
        
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
        import('./mrWendellController').then(({ handleWendellInteraction, isWendellActive }) => {
          if (isWendellActive()) {
            // Set a flag to handle this interaction in the next state update
            // Since we can't dispatch from here, we'll use the flag system
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
        });
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
