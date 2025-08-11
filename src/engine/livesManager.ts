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

// src/engine/livesManager.ts
// Handles life count, death tracking, and full reset when out of lives

const LIVES_KEY = "playerLives";
const DEFAULT_LIVES = 9;

export function getRemainingLives(): number {
  const lives = parseInt(localStorage.getItem(LIVES_KEY) || "", 10);
  return isNaN(lives) ? DEFAULT_LIVES : lives;
}

export function loseLife(): number {
  const remaining = getRemainingLives() - 1;
  localStorage.setItem(LIVES_KEY, Math.max(remaining, 0).toString());
  return remaining;
}

export function resetLives(): void {
  localStorage.setItem(LIVES_KEY, DEFAULT_LIVES.toString());
}

export function isGameOver(): boolean {
  return getRemainingLives() <= 0;
}
