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

// GameOverHandler.ts - Handles death events and lives system

import { resetGameState, clearInventory } from "../state/gameState";
import { FlagMap } from "../state/flagRegistry";
import { consoleWrite } from "../utils/consoleTools";

const MAX_LIVES = 9;

export function handlePollyKill(): void {
  freezeInput();
  showGameOverOverlay(
    "Polly's Revenge",
    "You killed Dominic. Polly ended you.",
  );

  decrementLives();

  if (getLives() <= 0) {
    consoleWrite("⚰️ You have no lives left. Restarting from the beginning...");
    fullGameReset();
  } else {
    respawnToCrossing();
  }
}

export function handleWendellKill(): void {
  freezeInput();
  showGameOverOverlay(
    "Judged by Wendell",
    "You betrayed the moral code. Mr. Wendell has no mercy.",
  );

  decrementLives();

  if (getLives() <= 0) {
    consoleWrite("⚰️ You have no lives left. Restarting from the beginning...");
    fullGameReset();
  } else {
    respawnToCrossing();
  }
}

function getLives(): number {
  const raw = localStorage.getItem(FlagMap.game.playerLives);
  return raw ? parseInt(raw) : MAX_LIVES;
}

function setLives(n: number): void {
  localStorage.setItem(FlagMap.game.playerLives, n.toString());
}

function decrementLives(): void {
  const remaining = getLives() - 1;
  setLives(Math.max(0, remaining));
}

function fullGameReset(): void {
  setLives(MAX_LIVES);
  // clearInventory needs current state - will be handled by resetGameState
  resetGameState();
  localStorage.clear();
  window.location.reload(); // hard reset
}

function respawnToCrossing(): void {
  // clearInventory needs current state - will be handled by reset
  localStorage.setItem(FlagMap.location.currentRoom, "crossing");
  window.location.reload(); // simulate death and recovery
}

function freezeInput(): void {
  localStorage.setItem("playerInputDisabled", "true");
}

function showGameOverOverlay(title: string, message: string): void {
  consoleWrite(`🟥 ${title}: ${message}`);
  const overlay = document.createElement("div");
  overlay.className = "game-over-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>${title}</h1>
      <p>${message}</p>
      <p>You will be returned to safety... if you have any lives left.</p>
    </div>
  `;
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.9)",
    color: "#00ff00",
    fontFamily: "Courier New, monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  });
  document.body.appendChild(overlay);
}
