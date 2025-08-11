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
