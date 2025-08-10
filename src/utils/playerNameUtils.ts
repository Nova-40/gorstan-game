// src/utils/playerNameUtils.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Player name utility functions for NPC dialogue enhancement

import type { LocalGameState } from '../state/gameState';

/**
 * Get the player's name from game state, with fallback to "Player"
 */
export function getPlayerName(state: LocalGameState): string {
  return state.player?.name || state.playerName || "Player";
}

/**
 * Format dialogue text by replacing {playerName} placeholders with the actual player name
 */
export function formatDialogue(line: string, state: LocalGameState): string {
  const playerName = getPlayerName(state);
  return line
    .replace(/\{playerName\}/g, playerName)
    .replace(/\{PLAYER_NAME\}/g, playerName)
    .replace(/\{player\}/g, playerName)
    .replace(/\{PLAYER\}/g, playerName);
}

/**
 * Format dialogue text with additional context variables
 */
export function formatDialogueWithContext(
  line: string, 
  state: LocalGameState, 
  context: Record<string, string> = {}
): string {
  let formatted = formatDialogue(line, state);
  
  // Replace additional context variables
  Object.entries(context).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{${key}\\}`, 'g');
    formatted = formatted.replace(pattern, value);
  });
  
  return formatted;
}

/**
 * Check if player name is set (not default)
 */
export function hasCustomPlayerName(state: LocalGameState): boolean {
  const name = getPlayerName(state);
  return name !== "Player" && name.trim().length > 0;
}

/**
 * Get appropriate greeting based on whether player has custom name
 */
export function getPersonalizedGreeting(state: LocalGameState, defaultGreeting: string): string {
  const hasCustomName = hasCustomPlayerName(state);
  const playerName = getPlayerName(state);
  
  if (hasCustomName) {
    return `Hello, ${playerName}! ${defaultGreeting}`;
  }
  
  return defaultGreeting;
}
