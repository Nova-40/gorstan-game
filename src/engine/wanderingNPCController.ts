// src/engine/wanderingNPCController.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import { npcRegistry } from '../npcs/npcMemory';
import { pickRandom } from '../utils/random';
import type { Room } from '../types/Room';
import type { NPC } from '../types/NPCTypes';
import type { GameAction } from '../types/GameTypes';
import type { LocalGameState } from '../state/gameState';
import type { Dispatch } from 'react';


// --- Function: handleRoomEntryForWanderingNPCs ---
export function handleRoomEntryForWanderingNPCs(
  room: Room,
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
) {
  console.log('[handleRoomEntryForWanderingNPCs] Checking room:', room.id);
  console.log('[handleRoomEntryForWanderingNPCs] NPC registry size:', npcRegistry.size);
  
  const visibleNPCs: NPC[] = [];

  for (const [npcId, npc] of npcRegistry.entries()) {
    const isHere = npc.currentRoom === room.id;
    const isVisible = typeof npc.shouldBeVisible === 'function'
      ? npc.shouldBeVisible(state, room)
      : true;

    console.log(`[handleRoomEntryForWanderingNPCs] NPC ${npcId}: currentRoom=${npc.currentRoom}, targetRoom=${room.id}, isHere=${isHere}, isVisible=${isVisible}`);

    if (isHere && isVisible) {
      visibleNPCs.push(npc);
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: `${npc.name} is here.`,
          type: 'system',
          timestamp: Date.now()
        }
      });
    }
  }

  console.log('[handleRoomEntryForWanderingNPCs] Found NPCs in room:', visibleNPCs.map(n => n.name));

  dispatch({
    type: 'SET_NPCS_IN_ROOM',
    payload: visibleNPCs
  });
}


// --- Function: wanderNPC ---
export function wanderNPC(npcId: string, state: LocalGameState) {
  const npc = npcRegistry.get(npcId) as NPC | undefined;
  const flags = state.flags;
  const roomMap = state.roomMap || {};

  if (!npc || !npc.canWander || npc.questOnly) return;

  const now = Date.now();
  if (npc.lastMoved && now - npc.lastMoved < 15000) return; // 15 second cooldown

  // Get all valid rooms from the room map for wandering
  let validRooms: Room[] = Object.values(roomMap).filter(room => 
    room &&
    typeof room === 'object' &&
    room.id !== npc.currentRoom && // Don't stay in same room
    !room.id.includes('trap') &&
    !room.id.includes('cutscene') &&
    !room.id.includes('puzzle') &&
    !room.id.includes('boss') &&
    room.zone !== 'private' // Avoid private rooms
  );

  // If NPC has zone preferences, bias toward those
  const biasZones: string[] = npc.biasZones || [];
  if (flags.waited && biasZones.length > 0) {
    const biasRooms = validRooms.filter(r => r.zone && biasZones.includes(r.zone));
    const neutralRooms = validRooms.filter(r => r.zone && !biasZones.includes(r.zone));
    const roll = Math.random();
    validRooms = (roll < 0.7 && biasRooms.length > 0) ? biasRooms : neutralRooms;
  }

  if (!validRooms.length) return;

  const newRoom: Room = pickRandom(validRooms);
  if (newRoom && newRoom.id !== npc.currentRoom) {
    const previousRoom = npc.currentRoom;
    npc.currentRoom = newRoom.id;
    npc.lastMoved = now;
    
    console.log(`[WANDER] ${npc.name} moved from ${previousRoom} to ${newRoom.id}`);
    
    // Trigger room update if player is in the room the NPC left or entered
    if (state.currentRoomId === previousRoom || state.currentRoomId === newRoom.id) {
      // The NPC controller will handle this via evaluateWanderingNPCs flag
    }
  }
}


// --- Function: initializeWanderingNPCs ---
export function initializeWanderingNPCs(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
) {
  for (const [npcId, npc] of npcRegistry.entries()) {
    if ((npc as NPC).shouldWander) {
      dispatch({
        type: 'ADD_NPC',
        payload: { ...npc }
      });
    }
  }
}
