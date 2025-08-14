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

// src/engine/dominicLogic.ts
// Handles Dominic's warning and death effects

import { playSound } from "../utils/soundUtils";
import { triggerDeath } from "./deathEngine";
import { dispatch } from "../state/dispatch";
import { appendToConsole } from "../ui/TerminalConsole";

export function triggerDominicPickupWarning(): void {
  appendToConsole("Dominic looks at you with sadness.");
  appendToConsole(
    "'You… you don’t understand what you’re doing. There *will* be consequences.'",
  );
  playSound("ominous_warning");
}

export function dominicDeathSequence(): void {
  const overlay = document.createElement("div");
  overlay.className = "dominic-death-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>💧 You sacrificed Dominic</h1>
      <p>He trusted you.</p>
      <p>Some losses echo louder than others.</p>
    </div>
  `;
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#001",
    color: "lightblue",
    fontFamily: "Courier New, monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  });
  document.body.appendChild(overlay);
  playSound("dominic_fade");
  setTimeout(() => triggerDeath("npc"), 4000);
}

export function rememberDominicDeath(): void {
  localStorage.setItem("dominicSacrificed", "true");
}

export function dominicChidesPostReset(): void {
  if (localStorage.getItem("dominicSacrificed") === "true") {
    const ghostLines = [
      "A familiar shimmer drifts beside you...",
      "Dominic (ghost): 'You took me. And then you *used* me.'",
      "Dominic (ghost): 'You were supposed to be better than this.'",
    ];
    ghostLines.forEach((line) => {
      import("../ui/TerminalConsole").then((mod) => mod.appendToConsole(line));
    });
  }
}
