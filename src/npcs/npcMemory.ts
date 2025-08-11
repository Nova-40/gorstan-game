/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// --- NPC Response Logic ---
import { getAylaResponse } from '../utils/aylaBrain';

/**
 * Returns an intelligent response for the given NPC and input, using Ayla's meta logic if applicable.
 * @param npc The NPC object
 * @param input The player's input/question
 * @param state The current game state (for context-aware replies)
 */
export function getNPCResponseWithState(npc: NPC, input: string, state: any): string {
  if (npc.id === 'ayla') {
    return getAylaResponse(input, state);
  }
  // Fallback: use customResponses, context-aware, or default
  const key = input.toLowerCase().trim();
  if (npc.customResponses && npc.customResponses[key]) {
    return npc.customResponses[key];
  }
  // Try context-aware dialogue
  const contextReply = getContextAwareDialogue(npc.id, state);
  if (contextReply) return contextReply;
  // Default fallback
  return "I'm not sure how to answer that. Try asking something else.";
}
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.


import type { NPC } from '../types/NPCTypes';
import { wanderers } from './wanderers';



export const npcRegistry: Map<string, NPC> = new Map();

// --- Register all wanderers at module load ---
for (const npc of wanderers) {
  if (npc && npc.id) {
    npcRegistry.set(npc.id, npc);
  }
}





// --- Enhanced: NPC Interaction, Memory, Mood, Trust, Goals, Schedule ---
export interface NPCInteractionRecord {
  timestamp: number;
  topic: string;
  context: any;
}


export interface NPCMemoryState {
  interactions: NPCInteractionRecord[];
  state: Record<string, any>;
  memoryLog?: string[]; // e.g. ["player_took_coin", "dominic_dead"]
  mood?: 'neutral' | 'suspicious' | 'friendly' | 'hostile' | 'afraid' | 'curious';
  trust?: number; // 0-100
  goal?: string; // e.g. 'find_player', 'patrol_zone', 'avoid_glitchrealm'
  schedule?: Array<{ time: string; room: string }>;
}



const npcMemoryStore: Map<string, NPCMemoryState> = new Map();
// --- Enhanced: Add memory event to NPC ---
export function addMemoryEvent(npcId: string, event: string): void {
  initNPC(npcId);
  const memory = npcMemoryStore.get(npcId)!;
  if (!memory.memoryLog) memory.memoryLog = [];
  memory.memoryLog.push(event);
}

// --- Enhanced: Set mood/trust/goal for NPC ---
export function setNPCMood(npcId: string, mood: NPCMemoryState['mood']): void {
  initNPC(npcId);
  npcMemoryStore.get(npcId)!.mood = mood;
}
export function setNPCTrust(npcId: string, trust: number): void {
  initNPC(npcId);
  npcMemoryStore.get(npcId)!.trust = Math.max(0, Math.min(100, trust));
}
export function setNPCGoal(npcId: string, goal: string): void {
  initNPC(npcId);
  npcMemoryStore.get(npcId)!.goal = goal;
}
export function setNPCSchedule(npcId: string, schedule: Array<{ time: string; room: string }>): void {
  initNPC(npcId);
  npcMemoryStore.get(npcId)!.schedule = schedule;
}

// --- Enhanced: Goal-driven movement logic (to be called by controller) ---
export function getNextRoomForGoal(npcId: string, state: any): string | null {
  const memory = npcMemoryStore.get(npcId);
  if (!memory || !memory.goal) return null;
  // Example: find_player
  if (memory.goal === 'find_player' && state && state.player && state.player.currentRoom) {
    // TODO: Use pathfinding if available; for now, move directly
    return state.player.currentRoom;
  }
  // Example: patrol_zone (cycle through schedule)
  if (memory.goal === 'patrol_zone' && memory.schedule && memory.schedule.length > 0) {
    const now = new Date();
    const hhmm = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
    // Find next scheduled room
    for (const entry of memory.schedule) {
      if (entry.time >= hhmm) return entry.room;
    }
    // If past all times, loop to first
    return memory.schedule[0].room;
  }
  // Add more goal types as needed
  return null;
}

// --- Enhanced: Context-aware dialogue helper ---
export function getContextAwareDialogue(npcId: string, state: any): string | null {
  const memory = npcMemoryStore.get(npcId);
  if (!memory) return null;
  // Example: Dominic is dead
  if (state.flags && state.flags.dominicIsDead && npcId !== 'dominic') {
    return 'You sense a somber mood. The air is heavy with loss.';
  }
  // Example: Player is redacted
  if (state.flags && state.flags.playerIsRedacted) {
    return 'The NPC eyes you warily, as if sensing something is off.';
  }
  // Example: Trust/mood
  if (memory.trust !== undefined && memory.trust < 30) {
    return 'The NPC seems reluctant to speak.';
  }
  if (memory.mood === 'friendly') {
    return 'The NPC greets you warmly.';
  }
  // Add more context rules as needed
  return null;
}

// --- Enhanced: NPC-to-NPC passive reactions (optional, for controller use) ---
export function getNPCtoNPCReactions(roomNPCs: string[], state: any): string[] {
  const reactions: string[] = [];
  if (roomNPCs.includes('polly') && roomNPCs.includes('dominic')) {
    reactions.push('Polly eyes Dominic with disdain.');
  }
  if (roomNPCs.includes('albie') && roomNPCs.includes('ayla')) {
    reactions.push('Albie glances nervously at Ayla.');
  }
  // Add more as needed
  return reactions;
}



// --- Function: initNPC ---
export function initNPC(npcId: string): void {
  if (!npcMemoryStore.has(npcId)) {
    npcMemoryStore.set(npcId, { interactions: [], state: {} });
  }
}



// --- Function: recordInteraction ---
export function recordInteraction(npcId: string, topic: string, context: any): void {
  initNPC(npcId);
// Variable declaration
  const memory = npcMemoryStore.get(npcId)!;
  memory.interactions.push({
    timestamp: Date.now(),
    topic,
    context
  });
}



// --- Function: getNPCState ---
export function getNPCState(npcId: string): NPCMemoryState | null {
  return npcMemoryStore.get(npcId) || null;
}



// --- Function: updateNPCState ---
export function updateNPCState(npcId: string, updates: Record<string, any>): void {
  initNPC(npcId);
// Variable declaration
  const memory = npcMemoryStore.get(npcId)!;
  Object.assign(memory.state, updates);
}



// --- Function: getLastInteraction ---
export function getLastInteraction(npcId: string): NPCInteractionRecord | null {
// Variable declaration
  const memory = npcMemoryStore.get(npcId);
  if (!memory || memory.interactions.length === 0) return null;
  return memory.interactions[memory.interactions.length - 1];
}



// --- Function: clearNPCMemory ---
export function clearNPCMemory(npcId: string): void {
  npcMemoryStore.delete(npcId);
}



// --- Function: exportAllMemory ---
export function exportAllMemory(): Record<string, NPCMemoryState> {
  const result: Record<string, NPCMemoryState> = {};
  for (const [npcId, state] of npcMemoryStore.entries()) {
    result[npcId] = state;
  }
  return result;
}



// --- Function: importAllMemory ---
export function importAllMemory(data: Record<string, NPCMemoryState>): void {
  npcMemoryStore.clear();
  for (const [npcId, state] of Object.entries(data)) {
    npcMemoryStore.set(npcId, state);
  }
}



for (const npc of npcRegistry.values()) {
  if (!npc.memory) {
    npc.memory = {
      interactions: 0,
      lastInteraction: 0,
      playerActions: [],
      relationship: 0,
      knownFacts: [],
      emotion: "neutral"
    };
  }
  if (!npc.memory.emotion) {
    npc.memory = {
      ...npc.memory,
      emotion: "neutral"
    };
  }
}
