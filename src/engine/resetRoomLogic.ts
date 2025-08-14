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

// src/engine/resetRoomLogic.ts

export function handleResetButtonPress(): void {
  if (localStorage.getItem("pollyTakeoverActive") === "true") {
    localStorage.removeItem("pollyTakeoverActive");
    localStorage.setItem("restartDueToPolly", "true");
    import("./specialDeathEffects").then((mod) => mod.showResetVisualSuccess());
    window.location.hash = "crossing"; // send player to introCrossing
    import("./dominicLogic").then((mod) => mod.dominicChidesPostReset());
  } else {
    window.location.hash = "introstart"; // default reset
  }
}
