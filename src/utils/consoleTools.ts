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
// Console utility functions for game messaging

import { GameAction } from "../types/GameTypes";

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
 * Write a message to the game console (with dispatch parameter)
 */
export function consoleWriteWithDispatch(
  dispatch: DispatchFunction,
  message: string,
  type: "info" | "error" | "success" = "info",
): void {
  dispatch({
    type: "ADD_CONSOLE_LINE",
    payload: message,
  });
}

/**
 * Write a message to the game console (using global dispatch)
 */
export function consoleWrite(
  message: string,
  type: "info" | "error" | "success" = "info",
): void {
  if (globalDispatch) {
    globalDispatch({
      type: "ADD_CONSOLE_LINE",
      payload: message,
    });
  } else {
    console.warn("Console dispatch not available:", message);
  }
}

/**
 * Write an error message to the game console
 */
export function consoleError(message: string): void {
  consoleWrite(message, "error");
}

/**
 * Write a success message to the game console
 */
export function consoleSuccess(message: string): void {
  consoleWrite(message, "success");
}

/**
 * Push a console message with enhanced formatting (with dispatch parameter)
 */
export function pushConsoleMessageWithDispatch(
  dispatch: DispatchFunction,
  message: string,
  type: "info" | "error" | "success" = "info",
): void {
  consoleWriteWithDispatch(dispatch, message, type);
}

/**
 * Push a console message with enhanced formatting (using global dispatch)
 */
export function pushConsoleMessage(
  message: string,
  type: "info" | "error" | "success" = "info",
): void {
  consoleWrite(message, type);
}
