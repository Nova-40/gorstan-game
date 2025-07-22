import { NPC } from './NPCTypes';



// PlayerState.ts — types/PlayerState.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: PlayerState

// PlayerState type definition for NPC interactions

export interface PlayerInteraction {
  npcId: string;
  timestamp: number;
  response?: string;
  severity?: 'minor' | 'normal' | 'major';
  context?: Record<string, any>;
}
export interface PlayerState {
  id: string;
  name: string;
  health: number;
  inventory: string[];
  traits?: string[];
  flags?: Record<string, boolean>;
  interactions?: PlayerInteraction[];
  reputation?: Record<string, number>; // Reputation with NPCs
  relationships?: Record<string, number>; // Relationship levels with NPCs
}
