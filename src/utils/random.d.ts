// src/utils/random.d.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.


// --- Function: randomInt ---
export function randomInt(min: number, max: number): number;

// --- Function: randomFloat ---
export function randomFloat(min: number, max: number): number;

// --- Function: pickRandom<T> ---
export function pickRandom<T>(arr: T[]): T;

// --- Function: chance ---
export function chance(probability: number): boolean;

// --- Function: shuffle<T> ---
export function shuffle<T>(arr: T[]): T[];
