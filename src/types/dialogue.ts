// src/types/dialogue.ts
// Enhanced dialogue types for inter-NPC conversations
// Gorstan Game Beta 1 - Inter-NPC Communication System

export type SpeakerKind = "PLAYER" | "NPC";

export interface SpeakerRef { 
  kind: SpeakerKind; 
  id: string; // id: "ayla" | "morthos" | "al" | playerId
}

export interface NPCExchange {
  from: SpeakerRef;
  to: SpeakerRef;
  text: string;
  ts: number;
  topic?: string;       // "hint","lore","banter","quest"
  visibleToPlayer: boolean; // whether to print in console
}

export interface ConversationThread {
  id: string;
  roomId: string;
  participants: string[]; // npcIds and/or "player"
  exchanges: NPCExchange[];
  lastTs: number;
  mutedForPlayer?: boolean;
  priority: "low" | "normal" | "high";
}

// Voice profile for NPC personality during conversations
export interface Voice {
  formality: number;    // 0-2: casual to formal
  humor: number;        // 0-2: serious to humorous
  terseness: number;    // 0-2: verbose to terse
  tics?: string[];      // characteristic phrases/sounds
}
