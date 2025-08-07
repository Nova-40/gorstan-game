export type PlayerState = any;

// src/engine/npcMemory.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.


import { NPC } from '../types/NPCTypes';

export interface NPCMemory {
  topic: string;
  time: number;
  location?: string;
  id?: string;
  contextTags?: string[];
}

export interface NPCState {
  mood:
    | 'neutral'
    | 'weary'
    | 'cynical'
    | 'hopeful'
    | 'grudging'
    | 'glowing'
    | 'hostile'
    | 'friendly'
    | 'interested'
    | 'disappointed';
  memory: NPCMemory[];
  queryCount: number;
  trustLevel: number;
  lastInteraction?: number;
  relationship:
    | 'stranger'
    | 'acquaintance'
    | 'friend'
    | 'ally'
    | 'enemy'
    | 'trusted'
    | 'despised';
  personalityTraits: string[];
  preferences?: Record<string, number>;
  memoryCapacity?: number;
  initialized?: boolean;
}


export interface InteractionContext {
  currentRoomId?: string;
  playerState?: any;
  inventory?: string[];
  traits?: string[];
  flags?: Record<string, boolean>;
  name?: string;
  health?: number;
  topic?: string;
  playerResponse?: string;
  timestamp?: number;
  severity?: 'minor' | 'normal' | 'major';
}


export interface MemoryQueryOptions {
  limit?: number;
  since?: number;
  topics?: string[];
  sortBy?: 'time' | 'importance' | 'relevance';
  includeContext?: boolean;
}


export interface NPCMemoryStats {
  totalMemories: number;
  memoryByImportance: Record<string, number>;
  oldestMemory?: number;
  newestMemory?: number;
  averageImportance: number;
  memoryTrends: Record<string, number>;
}


const npcStates: Record<string, NPCState> = {
  ayla: {
    mood: 'neutral',
    memory: [],
    queryCount: 0,
    trustLevel: 5,
    relationship: 'acquaintance',
    personalityTraits: ['scholarly', 'patient', 'mysterious', 'wise', 'helpful'],
    preferences: {
      knowledge: 3,
      magic: 2,
      learning: 3,
      wisdom: 4,
      guidance: 3,
    },
    memoryCapacity: 60,
    initialized: true,
  },
  morthos: {
    mood: 'cynical',
    memory: [],
    queryCount: 0,
    trustLevel: -2,
    relationship: 'stranger',
    personalityTraits: ['cynical', 'cryptic', 'chaotic'],
    memoryCapacity: 50,
    initialized: true,
  },
};





// --- Function: getAllTraits ---
export function getAllTraits(): string[] {
  return Object.values(npcStates)
    .flatMap((npc) => npc.personalityTraits)
    .filter((trait, i, arr) => arr.indexOf(trait) === i);
}




// --- Function: getAchievements ---
export function getAchievements(): string[] {
  // Aggregate all contextTags from all NPC memories
  const allTags: string[] = Object.values(npcStates)
    .flatMap(npc => npc.memory.flatMap(mem => mem.contextTags || []));
  return Array.from(new Set(allTags))
    .filter(tag => tag.startsWith('achievement:'))
    .map(tag => tag.replace('achievement:', ''));
}

export default npcStates;
