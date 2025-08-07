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
