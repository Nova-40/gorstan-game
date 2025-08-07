// src/state/scoreManager.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import { GameAction } from '../types/GameTypes';
















let globalDispatch: React.Dispatch<GameAction> | null = null;



// --- Function: initializeScoreManager ---
export function initializeScoreManager(dispatch: React.Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}



// --- Function: updateScore ---
export function updateScore(delta: number): void {
  if (globalDispatch) {
    globalDispatch({ type: 'UPDATE_SCORE', payload: delta });

    
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



// --- Function: setScore ---
export function setScore(value: number): void {
  if (globalDispatch) {
    globalDispatch({ type: 'SET_SCORE', payload: value });
  }
}



// --- Function: resetScore ---
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



// --- Function: getCurrentScore ---
export function getCurrentScore(): number {
  
  
  return 0;
}



// --- Function: applyScoreBonus ---
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



// --- Function: applyScorePenalty ---
export function applyScorePenalty(reason: string, amount: number): void {
  if (globalDispatch) {
    updateScore(-Math.abs(amount)); 
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
