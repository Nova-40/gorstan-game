
// blueButtonLogic.ts
// Handles logic for pressing the blue button
// (c) 2025 Geoffrey Alan Webster. MIT Licence

import { GameState, STAGES } from '../state/gameStateTypes';

export function handleBlueButtonPress(gameState: GameState, setGameStage: (s: string) => void, setTransition: (s: string | null) => void): string {
  const currentCount = gameState.flags?.blueButtonCount || 0;
  const nextCount = currentCount + 1;

  gameState.flags.blueButtonCount = nextCount;

  if (nextCount % 2 === 1 && nextCount < 6) {
    // 1st, 3rd, 5th press — warning screen
    return "DO NOT PRESS THAT BUTTON AGAIN.

Multiversal reset mode is now engaged.
Press ESC to continue…";
  } else if (nextCount === 6) {
    // 6th press — trigger fake low-level format screen
    setTransition('multiverseReset'); // This will be intercepted in AppCore or GameEngine
    return "System override accepted. Initiating multiversal reset protocol…";
  } else if (nextCount > 6) {
    return "⚠️ Reset mechanism resetting… please wait…";
  } else {
    // Even press < 6 — normal multiverse reset
    setGameStage(STAGES.RESET);
    return "Resetting multiversal stack… please stand by.";
  }
}
