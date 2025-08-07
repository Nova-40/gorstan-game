// src/engine/blueButtonLogic.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import { GameState } from '../types/GameTypes';
import { useGameState } from '../state/gameState';










// --- Function: handleBlueButtonPress ---
export function handleBlueButtonPress(gameState: GameState, setGameStage: (s: string) => void, setTransition: (s: string | null) => void): string {
// Variable declaration
  const currentCount = gameState.flags?.blueButtonCount || 0;
// Variable declaration
  const nextCount = Number(currentCount) + 1;

  gameState.flags.blueButtonCount = nextCount;

  if (nextCount % 2 === 1 && nextCount < 6) {
    
    return "DO NOT PRESS THAT BUTTON AGAIN.\n\nMultiversal reset mode is now engaged.\nPress ESC to continue…";
  } else if (nextCount === 6) {
    
    setTransition('multiverseReset'); 
    return "System override accepted. Initiating multiversal reset protocol…";
  } else if (nextCount > 6) {
    return "⚠️ Reset mechanism resetting… please wait…";
  } else {
    
    setGameStage('reset');
    return "Resetting multiversal stack… please stand by.";
  }
}
