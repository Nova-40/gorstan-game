// src/types/npcMemory.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// NPC memory and state type definitions

import type { Player } from './GameTypes';

/**
 * Player state interface for NPC memory systems
 */
export interface PlayerState {
  name: string;
  location: string;
  inventory: string[];
  traits: string[];
  relationships: Record<string, number>;
  flags: Record<string, any>;
  health: number;
  score: number;
  visitedRooms?: string[];
}

/**
 * NPC state interface for memory and interaction tracking
 */
export interface NPCState {
  id: string;
  name: string;
  location: string;
  memory: NPCMemory;
  isActive: boolean;
  lastInteraction: number;
  traits: string[];
}

/**
 * NPC memory structure for tracking interactions and player state
 */
export interface NPCMemory {
  interactions: Array<{
    timestamp: number;
    playerAction: string;
    npcResponse: string;
    context: Record<string, any>;
  }>;
  lastInteraction: number;
  playerActions: string[];
  relationship: number;
  knownFacts: Record<string, any>;
  flags: Record<string, boolean>;
  preferences: Record<string, any>;
}

/**
 * Convert Player type to PlayerState for NPC systems
 */
export function playerToPlayerState(player: Player, location: string, flags: Record<string, any>): PlayerState {
  return {
    name: player.name,
    location,
    inventory: player.inventory,
    traits: player.traits || [],
    relationships: player.npcRelationships || {},
    flags,
    health: player.health,
    score: player.score || 0
  };
}
