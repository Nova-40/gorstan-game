// src/npcs/npcMemory.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import type { NPC } from '../types/NPCTypes';


export const npcRegistry: Map<string, NPC> = new Map();




interface NPCInteractionRecord {
  timestamp: number;
  topic: string;
  context: any;
}

interface NPCMemoryState {
  interactions: NPCInteractionRecord[];
  state: Record<string, any>;
}

const npcMemoryStore: Map<string, NPCMemoryState> = new Map();



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
