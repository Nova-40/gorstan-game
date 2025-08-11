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
