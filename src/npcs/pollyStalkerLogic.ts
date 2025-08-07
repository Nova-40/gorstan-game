// src/npcs/pollyStalkerLogic.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import { GameState } from '../state/gameState';
import { logAchievement } from '../engine/achievementEngine';
import { appendToConsole } from '../ui/TerminalConsole';
import { dispatch } from '../state/dispatch';


// --- Function: handlePollyStalkerLogic ---
export function handlePollyStalkerLogic(gameState: GameState) {
  const { flags, inventory, currentRoomId, player } = gameState;
  const playerName = player.name;

  if (!flags.dominicIsDead || flags.killedByPolly) return;

  if (!flags.pollyStalker && inventory.includes('dead fish')) {
    flags.pollyStalker = true;
    appendToConsole("Polly’s eyes narrow. Something has changed.");
  }

  if (flags.pollyStalker) {
// Variable declaration
    const roomsVisited = flags.pollyStalkerRoomsVisited || [];
    if (!roomsVisited.includes(currentRoomId)) {
      roomsVisited.push(currentRoomId);
    }
    flags.pollyStalkerRoomsVisited = roomsVisited;

    if (roomsVisited.length >= 2 && !flags.warnedByPolly) {
      flags.warnedByPolly = true;
      appendToConsole("Polly: \"You don’t get to walk away from what you did.\"");
      appendToConsole("Polly: \"Dominic was the only thing that ever made me feel anything real.\"");
      appendToConsole("Polly: \"Run, " + playerName + ". Just run.\"");
    }

    if (roomsVisited.length >= 3 && !flags.killedByPolly) {
      import('../engine/specialDeathEffects').then(mod => mod.pollyDeathSequence());
      flags.killedByPolly = true;
      logAchievement("pollyKill");
      appendToConsole("You feel a sudden chill. Then pain. Then nothing.");
      appendToConsole("Polly smiles. It’s the last thing you see.");
    }
  }
}
export function attemptPollyMercy(inventory: string[]): boolean {
  const hasMercyItem = inventory.includes('tokenOfMercy') || inventory.includes('catTreats');
  if (hasMercyItem && Math.random() < 0.25) {
    console.log('[Polly] Took your mercy item and spared you (for now)');
    return true;
  }
  return false;
}

// Polly mercy callback setup — initiates multiverse panic arc

export function triggerPollyMercyTakeover(): void {
  appendToConsole("Polly takes the remote control from your hands. She stares at you... then vanishes.");
  appendToConsole("Moments later, two familiar figures shimmer into view.");
  appendToConsole("AL: 'You’ve made a mistake.'");
  appendToConsole("MORTHOS: 'A very big one. If we don’t reboot the multiverse in 4 minutes and 20 seconds, Polly will overwrite reality.'");
  appendToConsole("AL: 'Get to the reset chamber. Hit the blue button. Now.'");

  localStorage.setItem("pollyTakeoverActive", "true");

  setTimeout(() => {
    // Check current room from local storage or game state
    const currentRoom = localStorage.getItem('currentRoom') || '';
    if (currentRoom !== 'reset') {
      appendToConsole("💀 Too late. Reality flickers... and Polly becomes everything.");
      // Trigger death through dispatch system
      if (dispatch) {
        dispatch({ type: 'TRIGGER_DEATH', payload: 'npc' });
      }
    }
  }, 260000); // 4 minutes 20 seconds
}
