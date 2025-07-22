import { handlePlayerDeath } from "./deathEngine";

import { NPC } from './NPCTypes';

import { Room } from './RoomTypes';

import { Trap } from './GameTypes';



// Gorstan (c) Geoffrey Alan Webster. Code MIT Licence
// Module: roomEngine.ts
// Version: v6.1.0
// Description: Handles all logic triggered when entering a room

/**
 * Room interface matching current game implementation
 */
interface Room {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly zone: string;
  readonly image?: string;
  readonly exits: Readonly<Record<string, string>>;
  readonly items: readonly string[];
  readonly npcs: readonly string[];
  readonly flags: readonly string[];
  readonly entryText?: string;
  readonly visualEffect?: string;
  readonly trap?: {
    readonly type: string;
    readonly severity: string;
    readonly disarmable: boolean;
    readonly message: string;
    readonly damage: number;
    readonly autoDisarm: boolean;
    readonly description: string;
  };
}

/**
 * Called when the player enters a new room.
 * Executes trap, NPC, lore, and ambient audio logic.
 */
export function processRoomEntry(room: RoomDefinition, gameState: GameState): void {

  if (!room) {
    console.warn(`[RoomEngine] Room '${roomId}' not found.`);
    appendToConsole(`Error: The room '${roomId}' could not be loaded.`);
    return;
  }

  console.log(`[RoomEngine] Entered room: ${room.id}`);
  if (room.zone) console.log(`[RoomEngine] Zone: ${room.zone}`);
  if (room.music) console.log(`[RoomEngine] Playing ambient music: ${room.music}`);
  if (room.items?.length) console.log(`[RoomEngine] Items in room:`, room.items.map(i => i.name || i.id || i));
  if (room.npcs?.length) console.log(`[RoomEngine] NPCs in room:`, room.npcs.map(n => n.name || n));

  // 🔒 Trigger trap if one exists
  if (room.trap) {
    try {
      triggerTrapIfPresent(room.trap, gameState);
    } catch (error) {
      console.warn(`[RoomEngine] Trap execution failed:`);
    console.error(`[RoomEngine] Error processing trap in room '${roomId}':`, error);
      appendToConsole(`Warning: Trap system encountered an error.`);
    }
  }

  // 🤖 Trigger NPC entry behaviour
  if (room.npcs && room.npcs.length > 0) {
    try {
      triggerNPCEntryEvents(room.npcs, gameState);
    } catch (error) {
      console.warn(`[RoomEngine] Trap execution failed:`);
    console.error(`[RoomEngine] Error processing NPCs in room '${roomId}':`, error);
      appendToConsole(`Warning: NPC system encountered an error.`);
    }
  }

  // 📜 Show ambient lore or room intro text
  if (room.entryText) {
    try {
      appendToConsole(room.entryText);
    } catch (error) {
      console.error(`[RoomEngine] Error displaying entry text:`, error);
    }
  }

  // 🔊 Play zone-based ambient audio (if zone defined)
  if (room.zone) {
    try {
      playAmbientForZone(room.zone);
    } catch (error) {
      console.warn(`[RoomEngine] Failed to play ambient audio for zone '${room.zone}':`, error);
    }
  }

  // 🎨 Apply visual effects if specified
  if (room.visualEffect) {
    try {
      applyVisualEffect(room.visualEffect);
      console.log(`[RoomEngine] Applied visual effect: ${room.visualEffect}`);
    } catch (error) {
      console.warn(`[RoomEngine] Failed to apply visual effect '${room.visualEffect}':`, error);
    }
  }

  // Future hooks: lighting changes, zone effects, etc.
}

// Export room interface for use in other modules
export type { Room };

// Example fatal trap:
// if (room.trap?.type === 'fatal') handlePlayerDeath();
