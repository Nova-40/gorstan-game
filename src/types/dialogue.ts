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
