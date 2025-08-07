// src/engine/resetRoomLogic.ts

export function handleResetButtonPress(): void {
  if (localStorage.getItem("pollyTakeoverActive") === "true") {
    localStorage.removeItem("pollyTakeoverActive");
    localStorage.setItem("restartDueToPolly", "true");
    import('./specialDeathEffects').then(mod => mod.showResetVisualSuccess());
    window.location.hash = "crossing"; // send player to introCrossing
    import('./dominicLogic').then(mod => mod.dominicChidesPostReset());
  } else {
    window.location.hash = "introstart"; // default reset
  }
}
