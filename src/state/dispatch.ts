// src/state/dispatch.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Global dispatch utility for actions

import { GameAction } from '../types/GameTypes';

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
    console.warn('Global dispatch not available:', action);
  }
}
