// src/ui/NPCConsole.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// NPC console utility functions

import { GameAction } from '../types/GameTypes';

/**
 * Dispatch function type for console operations
 */
type DispatchFunction = (action: GameAction) => void;

// Global dispatch reference for standalone usage
let globalDispatch: DispatchFunction | null = null;

/**
 * Set the global dispatch function for NPC console operations
 */
export function setNPCConsoleDispatch(dispatch: DispatchFunction): void {
  globalDispatch = dispatch;
}

/**
 * Append a message to the NPC console
 */
export function appendToNPCConsole(npcName: string, message: string): void {
  if (globalDispatch) {
    globalDispatch({
      type: 'ADD_CONSOLE_LINE',
      payload: `${npcName}: ${message}`
    });
  } else {
    console.warn('NPC Console dispatch not available:', npcName, message);
  }
}

/**
 * Append NPC dialogue to the console
 */
export function appendNPCDialogue(npcName: string, message: string): void {
  appendToNPCConsole(npcName, message);
}
