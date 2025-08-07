// src/npcs/pollyBayInterrogation.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import { getPlayerLocation } from '../utils/playerLoc';
import { appendToNPCConsole } from '../ui/NPCConsole';
import { GameState } from '../state/gameState';

export async function triggerPollyInterrogation(gameState: GameState) {
  if (gameState.currentRoomId !== 'mazeZone_Pollysbay' || gameState.flags.pollyBayTriggered) return;

  gameState.flags.pollyBayTriggered = true;

  appendToNPCConsole("Polly", "So. You think you’re safe now?");
  appendToNPCConsole("Polly", "Where are you playing from? What town?");

  setTimeout(async () => {
// Variable declaration
    const loc = await getPlayerLocation();
    if (loc && loc.city) {
      appendToNPCConsole("Polly", `LIAR. I know you're in ${loc.city}.`);
      if (loc.weather) {
        appendToNPCConsole("Polly", `It's ${loc.weather}, isn’t it? Rain on the roof. I can hear it.`);
      }
    } else {
      appendToNPCConsole("Polly", "No signal? No problem. I’ll find you anyway.");
    }
  }, 4000);
}
