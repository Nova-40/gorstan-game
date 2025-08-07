// src/types/PlayerState.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import { NPC } from '../types/NPCTypes';










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
  reputation?: Record<string, number>; 
  relationships?: Record<string, number>; 
}
