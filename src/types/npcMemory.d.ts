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
// Handles NPC logic, memory, or rendering.

import type { NPC } from '.src/types/types/NPCTypes';
export const npcRegistry: Map<string, NPC>;

// --- Function: initNPC ---
export function initNPC(npcId: string): void;

// --- Function: recordInteraction ---
export function recordInteraction(npcId: string, topic: string, context: any): void;

// --- Function: getNPCState ---
export function getNPCState(npcId: string): any;

// --- Function: updateNPCState ---
export function updateNPCState(npcId: string, updates: Record<string, any>): void;

// --- Function: getLastInteraction ---
export function getLastInteraction(npcId: string): any;

// --- Function: clearNPCMemory ---
export function clearNPCMemory(npcId: string): void;

// --- Function: exportAllMemory ---
export function exportAllMemory(): Record<string, any>;

// --- Function: importAllMemory ---
export function importAllMemory(data: Record<string, any>): void;
// --- MERGED FROM src/npcs/npcMemory.d.ts ---
// src/npcs/npcMemory.d.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import type { NPC } from '.src/types/types/NPCTypes';
export const npcRegistry: Map<string, NPC>;

// --- Function: initNPC ---
export function initNPC(npcId: string): void;

// --- Function: recordInteraction ---
export function recordInteraction(npcId: string, topic: string, context: any): void;

// --- Function: getNPCState ---
export function getNPCState(npcId: string): any;

// --- Function: updateNPCState ---
export function updateNPCState(npcId: string, updates: Record<string, any>): void;

// --- Function: getLastInteraction ---
export function getLastInteraction(npcId: string): any;

// --- Function: clearNPCMemory ---
export function clearNPCMemory(npcId: string): void;

// --- Function: exportAllMemory ---
export function exportAllMemory(): Record<string, any>;

// --- Function: importAllMemory ---
export function importAllMemory(data: Record<string, any>): void;
