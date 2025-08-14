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

// Gorstan and characters (c) Geoff Webster 2025
// NPC conversation history and intelligence system

import type { LocalGameState } from "../state/gameState";

export interface ConversationEntry {
  topic: string;
  playerInput: string;
  npcResponse: string;
  timestamp: number;
  mood?: string;
  context?: Record<string, any>;
}

export interface NPCConversationHistory {
  [npcId: string]: {
    lastInteraction: number;
    totalInteractions: number;
    entries: ConversationEntry[];
    currentTopic?: string;
    relationship: number;
    knownTopics: string[];
    unresolved: string[];
  };
}

/**
 * Get conversation history for a specific NPC
 */
export function getNPCConversationHistory(
  state: LocalGameState,
  npcId: string,
): NPCConversationHistory[string] {
  const history =
    (state.flags?.npcConversations as NPCConversationHistory) || {};
  return (
    history[npcId] || {
      lastInteraction: 0,
      totalInteractions: 0,
      entries: [],
      relationship: 0,
      knownTopics: [],
      unresolved: [],
    }
  );
}

/**
 * Add a conversation entry to history
 */
export function addConversationEntry(
  state: LocalGameState,
  npcId: string,
  entry: Omit<ConversationEntry, "timestamp">,
): NPCConversationHistory {
  const currentHistory =
    (state.flags?.npcConversations as NPCConversationHistory) || {};
  const npcHistory = currentHistory[npcId] || {
    lastInteraction: 0,
    totalInteractions: 0,
    entries: [],
    relationship: 0,
    knownTopics: [],
    unresolved: [],
  };

  const newEntry: ConversationEntry = {
    ...entry,
    timestamp: Date.now(),
  };

  const updatedHistory = {
    ...currentHistory,
    [npcId]: {
      ...npcHistory,
      lastInteraction: Date.now(),
      totalInteractions: npcHistory.totalInteractions + 1,
      entries: [...npcHistory.entries.slice(-9), newEntry], // Keep last 10 entries
      knownTopics: [...new Set([...npcHistory.knownTopics, entry.topic])],
      currentTopic: entry.topic,
    },
  };

  return updatedHistory;
}

/**
 * Check if player has discussed a topic with NPC before
 */
export function hasDiscussedTopic(
  state: LocalGameState,
  npcId: string,
  topic: string,
): boolean {
  const history = getNPCConversationHistory(state, npcId);
  return history.knownTopics.includes(topic);
}

/**
 * Get last conversation entry for context
 */
export function getLastConversation(
  state: LocalGameState,
  npcId: string,
): ConversationEntry | null {
  const history = getNPCConversationHistory(state, npcId);
  return history.entries.length > 0
    ? history.entries[history.entries.length - 1]
    : null;
}

/**
 * Check if NPC should vary their response based on repetition
 */
export function shouldVaryResponse(
  state: LocalGameState,
  npcId: string,
  topic: string,
): boolean {
  const history = getNPCConversationHistory(state, npcId);
  const recentEntries = history.entries.slice(-3); // Check last 3 entries
  return recentEntries.filter((entry) => entry.topic === topic).length > 1;
}

/**
 * Get relationship level description
 */
export function getRelationshipLevel(relationship: number): string {
  if (relationship >= 80) {return "close friend";}
  if (relationship >= 60) {return "friend";}
  if (relationship >= 40) {return "acquaintance";}
  if (relationship >= 20) {return "neutral";}
  if (relationship >= 0) {return "wary";}
  if (relationship >= -20) {return "suspicious";}
  if (relationship >= -40) {return "unfriendly";}
  if (relationship >= -60) {return "hostile";}
  return "enemy";
}

/**
 * Update NPC relationship based on conversation
 */
export function updateNPCRelationship(
  state: LocalGameState,
  npcId: string,
  change: number,
): number {
  const currentRelationship = state.player?.npcRelationships?.[npcId] || 0;
  const newRelationship = Math.max(
    -100,
    Math.min(100, currentRelationship + change),
  );
  return newRelationship;
}
