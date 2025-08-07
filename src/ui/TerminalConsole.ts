// src/ui/TerminalConsole.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Terminal console utility functions

import { GameAction } from '../types/GameTypes';

/**
 * Dispatch function type for console operations
 */
type DispatchFunction = (action: GameAction) => void;

// Global dispatch reference for standalone usage
let globalDispatch: DispatchFunction | null = null;

/**
 * Set the global dispatch function for console operations
 */
export function setConsoleDispatch(dispatch: DispatchFunction): void {
  globalDispatch = dispatch;
}

/**
 * Append a message to the console
 */
export function appendToConsole(message: string): void {
  if (globalDispatch) {
    globalDispatch({
      type: 'ADD_CONSOLE_LINE',
      payload: message
    });
  } else {
    console.warn('Console dispatch not available:', message);
  }
}

/**
 * Append multiple lines to the console
 */
export function appendLinesToConsole(lines: string[]): void {
  lines.forEach(line => appendToConsole(line));
}
