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

// src/npc/profiles.ts
// NPC Profiles for Inter-NPC Conversations
// Memory management and voice characteristics
// Gorstan Game Beta 1

import { Voice } from "../types/dialogue";

// Simple memory structure for NPC conversations
export interface NPCMemory {
  facts: Record<string, any>;
  lastSpokeTo?: string;
  conversationHistory: Array<{
    with: string;
    topic: string;
    timestamp: number;
    summary: string;
  }>;
}

const memStore: Record<string, NPCMemory> = {};

export function initMemory(): NPCMemory {
  return {
    facts: {},
    conversationHistory: [],
  };
}

export function getNPCMemory(id: string): NPCMemory {
  return (memStore[id] ??= initMemory());
}

export function updateNPCMemory(id: string, updates: Partial<NPCMemory>): void {
  const memory = getNPCMemory(id);
  Object.assign(memory, updates);
}

export function getVoiceForNPC(id: string): Voice {
  switch (id) {
    case "ayla":
      return {
        formality: 1,
        humor: 1,
        terseness: 1,
        tics: ["…", "*nods thoughtfully*", "*smiles knowingly*"],
      };
    case "morthos":
      return {
        formality: 0,
        humor: 2,
        terseness: 1,
        tics: ["*clank*", "*adjusts mechanical parts*", "*whirrs softly*"],
      };
    case "al":
      return {
        formality: 2,
        humor: 0,
        terseness: 2,
        tics: ["Ahem.", "*adjusts spectacles*", "*clears throat*"],
      };
    default:
      return {
        formality: 1,
        humor: 0,
        terseness: 1,
      };
  }
}

// Record conversation in NPC memory
export function recordConversation(
  npcId: string,
  withWhom: string,
  topic: string,
  summary: string,
): void {
  const memory = getNPCMemory(npcId);
  memory.lastSpokeTo = withWhom;
  memory.conversationHistory.push({
    with: withWhom,
    topic,
    timestamp: Date.now(),
    summary,
  });

  // Keep only last 20 conversations
  if (memory.conversationHistory.length > 20) {
    memory.conversationHistory = memory.conversationHistory.slice(-20);
  }
}
