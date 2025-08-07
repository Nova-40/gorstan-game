// src/engine/NPCTypes.ts
// Gorstan Game Beta 1
// Type definitions for NPCs and their memory.

export interface NPCMemory {
  topic: string;
  time: number;
  location?: string;
  id?: string;
  contextTags?: string[];
}

export interface NPC {
  name: string;
  mood?: string;
  memory: NPCMemory[];
  queryCount?: number;
  trustLevel?: number;
  lastInteraction?: number;
  relationship?: string;
  personalityTraits?: string[];
  preferences?: Record<string, number>;
  memoryCapacity?: number;
  initialized?: boolean;
  // Add any additional fields as needed for your game logic
}
