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
