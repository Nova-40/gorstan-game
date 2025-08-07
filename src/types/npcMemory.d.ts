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
