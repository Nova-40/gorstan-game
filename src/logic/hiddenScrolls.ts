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
