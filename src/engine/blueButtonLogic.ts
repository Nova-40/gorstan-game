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
// Core game engine module.

import { GameState } from "../types/GameTypes";
import { useGameState } from "../state/gameState";

// --- Function: handleBlueButtonPress ---
export function handleBlueButtonPress(
  gameState: GameState,
  setGameStage: (s: string) => void,
  setTransition: (s: string | null) => void,
): string {
  // Variable declaration
  const currentCount = gameState.flags?.blueButtonCount || 0;
  // Variable declaration
  const nextCount = Number(currentCount) + 1;

  gameState.flags.blueButtonCount = nextCount;

  if (nextCount % 2 === 1 && nextCount < 6) {
    return "DO NOT PRESS THAT BUTTON AGAIN.\n\nMultiversal reset mode is now engaged.\nPress ESC to continue…";
  } else if (nextCount === 6) {
    setTransition("multiverseReset");
    return "System override accepted. Initiating multiversal reset protocol…";
  } else if (nextCount > 6) {
    return "⚠️ Reset mechanism resetting… please wait…";
  } else {
    setGameStage("reset");
    return "Resetting multiversal stack… please stand by.";
  }
}
