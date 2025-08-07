// src/utils/consoleMessages.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.


// --- Function: pushConsoleMessage ---
export function pushConsoleMessage(
  dispatch: (action: { type: string; payload: { text: string; type: string } }) => void,
  text: string,
  type: string = 'default'
): void {
  dispatch({ type: 'ADD_MESSAGE', payload: { text, type } });
}
