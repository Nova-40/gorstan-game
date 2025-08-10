// src/npc/registry.ts
// NPC Registry for Inter-NPC Conversations
// Gorstan Game Beta 1

export const NPC_IDS = {
  AYLA: "ayla",
  MORTHOS: "morthos", 
  AL: "al",
} as const;

export type NPCId = typeof NPC_IDS[keyof typeof NPC_IDS];

// NPCs that must be co-located (in same room) to talk unless scripted
export const CO_LOCATED_ONLY: NPCId[] = [NPC_IDS.MORTHOS, NPC_IDS.AL];

// NPCs that can talk across rooms (meta characters)
export const CROSS_ROOM_SPEAKERS: NPCId[] = [NPC_IDS.AYLA];

// Conversation cooldowns per NPC pair (in milliseconds)
export const CONVERSATION_COOLDOWNS: Record<string, number> = {
  'morthos-al': 90000,      // 90 seconds
  'ayla-morthos': 120000,   // 2 minutes
  'ayla-al': 120000,        // 2 minutes
  'default': 60000          // 1 minute default
};

// Maximum exchanges per conversation thread
export const MAX_THREAD_EXCHANGES = 12;

// Global rate limit for new conversations per room
export const ROOM_CONVERSATION_COOLDOWN = 75000; // 75 seconds
