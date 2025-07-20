// scoreManager.ts — state/scoreManager.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Initialize the score manager with dispatch function

// Filename: scoreManager.ts
// Location: state/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import { GameAction } from '../types/GameTypes';

// Global dispatch reference for score updates
let globalDispatch: React.Dispatch<GameAction> | null = null;

/**
 * Initialize the score manager with dispatch function
 */
export function initializeScoreManager(dispatch: React.Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}

/**
 * Update the player's score by a delta amount
 */
export function updateScore(delta: number): void {
  if (globalDispatch) {
    globalDispatch({ type: 'UPDATE_SCORE', payload: delta });
    
    // Log score changes to console for feedback
    if (delta > 0) {
      globalDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `score-gain-${Date.now()}`,
          text: `+${delta} points`,
          type: 'system',
          timestamp: Date.now(),
        }
      });
    } else if (delta < 0) {
      globalDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `score-loss-${Date.now()}`,
          text: `${delta} points`,
          type: 'error',
          timestamp: Date.now(),
        }
      });
    }
  }
}

/**
 * Set the player's score to a specific value
 */
export function setScore(value: number): void {
  if (globalDispatch) {
    globalDispatch({ type: 'SET_SCORE', payload: value });
  }
}

/**
 * Reset the player's score to 0
 */
export function resetScore(): void {
  if (globalDispatch) {
    globalDispatch({ type: 'RESET_SCORE' });
    globalDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `score-reset-${Date.now()}`,
        text: 'Score reset to 0',
        type: 'system',
        timestamp: Date.now(),
      }
    });
  }
}

/**
 * Get current score (requires access to game state)
 */
export function getCurrentScore(): number {
  // This would need to be called from a component with access to state
  // For now, return 0 as placeholder
  return 0;
}

/**
 * Apply bonus scoring based on achievements or special conditions
 */
export function applyScoreBonus(reason: string, amount: number): void {
  if (globalDispatch) {
    updateScore(amount);
    globalDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `score-bonus-${Date.now()}`,
        text: `Bonus: ${reason} (+${amount} points)`,
        type: 'achievement',
        timestamp: Date.now(),
      }
    });
  }
}

/**
 * Apply score penalty with reason
 */
export function applyScorePenalty(reason: string, amount: number): void {
  if (globalDispatch) {
    updateScore(-Math.abs(amount)); // Ensure penalty is negative
    globalDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `score-penalty-${Date.now()}`,
        text: `Penalty: ${reason} (-${Math.abs(amount)} points)`,
        type: 'error',
        timestamp: Date.now(),
      }
    });
  }
}
