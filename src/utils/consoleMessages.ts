

// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: consoleMessages.ts
// Path: src/utils/consoleMessages.ts

/**
 * pushConsoleMessage
 * Dispatches a message to the console/message UI.
 *
 * @param {function} dispatch - The dispatch function for state/messages.
 * @param {string} text - The message text to display.
 * @param {string} [type='default'] - The message type (e.g., 'default', 'error', 'success').
 */
export function pushConsoleMessage(
  dispatch: (action: { type: string; payload: { text: string; type: string } }) => void,
  text: string,
  type: string = 'default'
): void {
  dispatch({ type: 'ADD_MESSAGE', payload: { text, type } });
}
