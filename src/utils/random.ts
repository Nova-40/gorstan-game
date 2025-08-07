// src/utils/random.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.


// --- Function: randomInt ---
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}



// --- Function: randomFloat ---
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}



// --- Function: pickRandom<T> ---
export function pickRandom<T>(arr: T[]): T {
  if (!arr.length) throw new Error('Cannot pick random element from empty array');
  return arr[randomInt(0, arr.length)];
}



// --- Function: chance ---
export function chance(probability: number): boolean {
  return Math.random() < probability;
}



// --- Function: shuffle<T> ---
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
// Variable declaration
    const j = randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}



// --- Function: randomUUID ---
export function randomUUID(): string {
// JSX return block or main return
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 9)
  );
}
