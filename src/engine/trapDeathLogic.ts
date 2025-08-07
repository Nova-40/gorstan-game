// src/engine/trapDeathLogic.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles trap logic and room-based dangers.

import { triggerDeath } from './deathEngine';
import { logAchievement } from './achievementEngine';
import { appendToConsole } from '../ui/TerminalConsole';


// --- Function: deathByCoin ---
export function deathByCoin() {
  appendToConsole("You kept the cursed coin too long.");
  appendToConsole("It flips you.");
  triggerDeath("Killed by Coin");
  logAchievement("coinDeath");
}


// --- Function: deathByGreed ---
export function deathByGreed() {
  appendToConsole("You reached for treasure that wasn’t yours.");
  appendToConsole("Turns out it was bait. You took it anyway. Bold.");
  triggerDeath("Killed by Greed");
  logAchievement("greedDeath");
}


// --- Function: deathByDominicRevenge ---
export function deathByDominicRevenge() {
  appendToConsole("Dominic blinks. Reality buckles.");
  appendToConsole("You are... reversed.");
  triggerDeath("Killed by Dominic");
  logAchievement("dominicRevenge");
}
