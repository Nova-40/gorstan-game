// src/logic/hiddenScrolls.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import { unlockAchievement } from './achievementEngine';










// --- Function: readConstitutionScroll ---
export function readConstitutionScroll(): string[] {
// Variable declaration
  const messages = [
    "You unroll the brittle parchment titled 'The Final Constitution'.",
    "It outlines a framework where AI must respect sentient dignity, seek quorum on moral overrides, and honour pluralism unless harm is systemic.",
    "This is Constitution v6.1.0 — a system built not to win, but to coexist."
  ];

  unlockAchievement('found_constitution');

  return messages;
}
