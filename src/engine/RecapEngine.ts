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

import { GameState } from "../state/gameState";
import { pushConsoleMessage } from "../utils/consoleTools";

// Variable declaration
const greetings = [
  "Hi.",
  "Hi, {playerName}.",
  "Hello again.",
  "Wow, {playerName}, back so soon?",
  "Well well, look who rebooted reality.",
  "Miss me already, {playerName}?",
  "Your sense of self-preservation is... endearing.",
  "Another fine loop you've gotten us into, {playerName}.",
];

// --- Function: playRecap ---
export function playRecap(gameState: GameState) {
  const { flags, player, metadata } = gameState;
  const playerName = player?.name || "Player";
  const visitedRooms = player?.visitedRooms || [];
  const achievements = metadata?.achievements || [];
  const resetCount = metadata?.resetCount || 0;
  const inventory = player?.inventory || [];

  // Variable declaration
  const greeting = greetings[
    Math.floor(Math.random() * greetings.length)
  ].replace("{playerName}", playerName);
  pushConsoleMessage(`Ayla: ${greeting}`, "info");

  pushConsoleMessage("Ayla: Previously on Gorstan:", "info");

  if (flags.dominicIsDead) {
    pushConsoleMessage("Ayla: Dominic trusted you. That went well.", "info");
  }

  if (flags.killedByPolly) {
    pushConsoleMessage(
      "Ayla: Polly found you. You didn't survive the conversation.",
      "info",
    );
  }

  if (resetCount > 5) {
    pushConsoleMessage(
      "Ayla: You've reset reality so often it's got whiplash.",
      "info",
    );
  }

  if (visitedRooms && visitedRooms.includes("glitchinguniverse")) {
    pushConsoleMessage(
      "Ayla: Reality is fraying. But sure, keep exploring.",
      "info",
    );
  }

  if (achievements.includes("pollyKill")) {
    pushConsoleMessage("Ayla: Stalked by love. Again, bold choices.", "info");
  }

  if (inventory.includes("dead fish")) {
    pushConsoleMessage(
      "Ayla: You're still carrying Dominic's corpse. Classy.",
      "info",
    );
  }

  if (!flags.dominicIsDead && !flags.killedByPolly && resetCount <= 5) {
    pushConsoleMessage(
      "Ayla: You wandered around. You touched things. Some of them exploded.",
      "info",
    );
  }
}
