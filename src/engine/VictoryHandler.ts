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

// VictoryHandler.ts - Handles game victory conditions

export function triggerVictoryCheck(): void {
  try {
    checkVictoryConditions();
  } catch (err) {
    console.warn("[VictoryHandler] Failed to evaluate:", err);
  }
}
import { FlagMap } from "../state/flagRegistry";
import { consoleWrite } from "../utils/consoleTools";

export function checkVictoryConditions(): void {
  const sidedWith = localStorage.getItem(FlagMap.game.sidedWith);
  const metAl = localStorage.getItem(FlagMap.game.metAl) === "true";
  const metMorthos = localStorage.getItem(FlagMap.game.metMorthos) === "true";

  // Example condition: met both Al and Morthos and chose neither (neutral path)
  if (metAl && metMorthos && !sidedWith) {
    triggerVictory(
      "Diplomatic Balance",
      "You navigated the tensions without picking a side.",
    );
  }

  // Example condition: sided with Al and found remote
  if (sidedWith === "al" && localStorage.getItem(FlagMap.items.remoteControl)) {
    triggerVictory(
      "Alliance with Al",
      "Together, you stabilised the dimensional flow.",
    );
  }

  // Example condition: sided with Morthos and used the extrapolator
  if (
    sidedWith === "morthos" &&
    localStorage.getItem(FlagMap.story.extrapolatorUsed)
  ) {
    triggerVictory(
      "Morthos' Vision",
      "You aided Morthos in rewriting the laws of space.",
    );
  }
}

function triggerVictory(title: string, message: string): void {
  consoleWrite(`🌟 Victory Achieved: ${title}`);
  const overlay = document.createElement("div");
  overlay.className = "victory-overlay";
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>${title}</h1>
      <p>${message}</p>
      <p>You’ve completed Gorstan… for now.</p>
    </div>
  `;
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.95)",
    color: "#00ff00",
    fontFamily: "Courier New, monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  });
  document.body.appendChild(overlay);

  localStorage.setItem(FlagMap.game.victoryAchieved, "true");
}
