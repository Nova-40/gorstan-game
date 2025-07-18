// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: npcMemory.ts

// // TODO: Define PlayerState here temporarily if missing
export type PlayerState = any;

/** Individual memory entry */
export interface NPCMemory {
  topic: string;
  time: number;
  location?: string;
  importance: 'low' | 'medium' | 'high';
  id?: string;
  contextTags?: string[];
}

/** Full state for each NPC */
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

/** Context passed to NPCs during interactions */
export interface InteractionContext {
  currentRoomId?: string;
  playerState?: PlayerState;
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

/** Filters for memory queries */
export interface MemoryQueryOptions {
  limit?: number;
  importance?: NPCMemory['importance'];
  since?: number;
  topics?: string[];
  sortBy?: 'time' | 'importance' | 'relevance';
  includeContext?: boolean;
}

/** Summary statistics */
export interface NPCMemoryStats {
  totalMemories: number;
  memoryByImportance: Record<string, number>;
  oldestMemory?: number;
  newestMemory?: number;
  averageImportance: number;
  memoryTrends: Record<string, number>;
}

// === NPC STATES ===
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

// === FUNCTIONAL EXPORTS ===

/** Collect all unique personality traits from all NPCs */
export function getAllTraits(): string[] {
  return Object.values(npcStates)
    .flatMap((npc) => npc.personalityTraits)
    .filter((trait, i, arr) => arr.indexOf(trait) === i);
}

/** Collect achievements tagged in memory (e.g., 'achievement:xyz') */
export function getAchievements(): string[] {
  
  return Array.from(new Set(allTags))
    .filter(tag => tag.startsWith('achievement:'))
    .map(tag => tag.replace('achievement:', ''));
}

export default npcStates;
