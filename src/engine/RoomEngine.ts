// src/engine/RoomEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { handlePlayerDeath } from "./deathEngine";
import { NPC } from '../types/NPCTypes';
import { Room } from '../types/Room';
import type { GameState } from '../types/GameTypes';

// --- Function: processRoomEntry ---
export function processRoomEntry(room: Room, gameState: GameState): void {

  if (!room) {
    console.warn(`[RoomEngine] Room not found.`);
    // appendToConsole(`Error: The room could not be loaded.`);
    return;
  }

  console.log(`[RoomEngine] Entered room: ${room.id}`);
  if (room.zone) console.log(`[RoomEngine] Zone: ${room.zone}`);
  if ((room as any).music) console.log(`[RoomEngine] Playing ambient music: ${(room as any).music}`);
  if (room.items?.length) console.log(`[RoomEngine] Items in room:`, room.items.map((i: any) => i.name || i.id || i));
  if (room.npcs?.length) console.log(`[RoomEngine] NPCs in room:`, room.npcs.map((n: any) => n.name || n));

  
  if (room.trap) {
    try {
      // triggerTrapIfPresent(room.trap, gameState);
      console.log(`[RoomEngine] Trap present: ${room.trap.type}`);
    } catch (error) {
      console.error(`[RoomEngine] Error processing trap in room '${room.id}':`, error);
      // appendToConsole(`Warning: Trap system encountered an error.`);
    }
  }

  
  if (room.npcs && room.npcs.length > 0) {
    try {
      // triggerNPCEntryEvents(room.npcs, gameState);
      console.log(`[RoomEngine] Processing NPCs:`, room.npcs);
    } catch (error) {
      console.error(`[RoomEngine] Error processing NPCs in room '${room.id}':`, error);
      // appendToConsole(`Warning: NPC system encountered an error.`);
    }
  }

  
  if (room.entryText) {
    try {
      // appendToConsole(room.entryText);
      console.log(`[RoomEngine] Entry text: ${room.entryText}`);
    } catch (error) {
      console.error(`[RoomEngine] Error displaying entry text:`, error);
    }
  }

  
  if (room.zone) {
    try {
      // playAmbientForZone(room.zone);
      console.log(`[RoomEngine] Zone ambient: ${room.zone}`);
    } catch (error) {
      console.warn(`[RoomEngine] Failed to play ambient audio for zone '${room.zone}':`, error);
    }
  }

  
  if (room.visualEffect) {
    try {
      // applyVisualEffect(room.visualEffect);
      console.log(`[RoomEngine] Applied visual effect: ${room.visualEffect}`);
    } catch (error) {
      console.warn(`[RoomEngine] Failed to apply visual effect '${room.visualEffect}':`, error);
    }
  }

  
}


export type { Room };
