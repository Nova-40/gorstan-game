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
