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
// Global dispatch utility for actions

import { GameAction } from "../types/GameTypes";

/**
 * Dispatch function type
 */
type DispatchFunction = (action: GameAction) => void;

// Global dispatch reference
let globalDispatch: DispatchFunction | null = null;

/**
 * Set the global dispatch function
 */
export function setGlobalDispatch(dispatch: DispatchFunction): void {
  globalDispatch = dispatch;
}

/**
 * Get the global dispatch function
 */
export function getGlobalDispatch(): DispatchFunction | null {
  return globalDispatch;
}

/**
 * Global dispatch function for standalone usage
 */
export function dispatch(action: GameAction): void {
  if (globalDispatch) {
    globalDispatch(action);
  } else {
    console.warn("Global dispatch not available:", action);
  }
}
