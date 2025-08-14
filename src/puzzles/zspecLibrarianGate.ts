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

import { GameState } from "../state/gameState";
import { appendToNPCConsole } from "../ui/NPCConsole";
import { triggerDeath } from "../engine/deathEngine";
import { logAchievement } from "../engine/achievementEngine";
import { teleportToRoom } from "../engine/roomRouter";

// Variable declaration
const correctAnswers = ["B", "D"];

// --- Function: triggerZSpecPuzzle ---
export function triggerZSpecPuzzle(gameState: GameState) {
  if (gameState.flags.puzzle_maze_lattice_solved) {
    appendToNPCConsole("Librarian", "You’ve already passed this gate.");
    return;
  }

  appendToNPCConsole("Librarian", "Z-Spec validation required to proceed.");
  appendToNPCConsole("Librarian", "CAGE ::= [ a, b: NAT | a + b = 6 ∧ a ≠ b ]");
  appendToNPCConsole("Librarian", "Select all valid answers:");
  appendToNPCConsole("Librarian", "A: a = 3, b = 3");
  appendToNPCConsole("Librarian", "B: a = 2, b = 4");
  appendToNPCConsole("Librarian", "C: a = 6, b = 0");
  appendToNPCConsole("Librarian", "D: a = 1, b = 5");
  appendToNPCConsole(
    "Librarian",
    "Type your answer as a comma-separated list (e.g., 'B,D'):",
  );
}

// --- Function: handleZSpecAnswer ---
export function handleZSpecAnswer(gameState: GameState, answer: string) {
  // Variable declaration
  const response = answer.toUpperCase().replace(/\s+/g, "").split(",");

  // Variable declaration
  const correct =
    response.includes("B") && response.includes("D") && response.length === 2;

  if (correct) {
    appendToNPCConsole("Librarian", "That is... acceptable. You may pass.");
    gameState.flags.puzzle_maze_lattice_solved = true;
    logAchievement("puzzle_zspec_cleared");
    teleportToRoom("latticeentry");
  } else {
    if (!gameState.flags.zspecFailedOnce) {
      gameState.flags.zspecFailedOnce = true;
      gameState.flags.zspecRetryCountdown = 3;
      appendToNPCConsole("Librarian", "Incorrect. You are not ready.");
      teleportToRoom("maze_deadend");
    } else {
      appendToNPCConsole(
        "Librarian",
        "Incorrect again. You’ve had your second chance.",
      );
      triggerDeath("Z-Spec Puzzle Failure");
      teleportToRoom("crossing");
    }
  }
}

// --- Function: decrementRetryCountdown ---
export function decrementRetryCountdown(gameState: GameState) {
  if (gameState.flags.zspecRetryCountdown !== undefined) {
    gameState.flags.zspecRetryCountdown -= 1;
    if (gameState.flags.zspecRetryCountdown <= 0) {
      gameState.flags.zspecRetryCountdown = undefined;
      appendToNPCConsole("System", "You feel a shift in the maze...");
      teleportToRoom("mazeZone_Pollysbay");
    }
  }
}
