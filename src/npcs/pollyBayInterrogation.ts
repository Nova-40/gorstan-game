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
// Handles NPC logic, memory, or rendering.

import { getPlayerLocation } from "../utils/playerLoc";
import { appendToNPCConsole } from "../ui/NPCConsole";
import { GameState } from "../state/gameState";

export async function triggerPollyInterrogation(gameState: GameState) {
  if (
    gameState.currentRoomId !== "mazeZone_Pollysbay" ||
    gameState.flags.pollyBayTriggered
  )
    {return;}

  gameState.flags.pollyBayTriggered = true;

  appendToNPCConsole("Polly", "So. You think you’re safe now?");
  appendToNPCConsole("Polly", "Where are you playing from? What town?");

  setTimeout(async () => {
    // Variable declaration
    const loc = await getPlayerLocation();
    if (loc && loc.city) {
      appendToNPCConsole("Polly", `LIAR. I know you're in ${loc.city}.`);
      if (loc.weather) {
        appendToNPCConsole(
          "Polly",
          `It's ${loc.weather}, isn’t it? Rain on the roof. I can hear it.`,
        );
      }
    } else {
      appendToNPCConsole(
        "Polly",
        "No signal? No problem. I’ll find you anyway.",
      );
    }
  }, 4000);
}
