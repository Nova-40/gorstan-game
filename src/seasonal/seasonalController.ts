// src/seasonal/seasonalController.ts
// Seasonal events controller - Gorstan Game Beta 1

import { isChristmasDay, isEasterWindow, isMay13, shouldShowOncePerYear, markShown, inLondonNow } from "./seasonalGate";
import { overlayBus } from "./overlayBus";
import { config } from "../config";

export function maybeShowSeasonalOverlay(dispatch?: any) {
  if (!config.enableSeasonal) return;
  const now = inLondonNow();
  const y = now.getFullYear();

  const forced = config.forceSeason as "christmas" | "easter" | "may13" | null | undefined;
  if (forced === "christmas") return triggerXmas(y);
  if (forced === "easter") return triggerEaster(y);
  if (forced === "may13") return triggerMay13(y, dispatch);

  // Christmas Day
  if (isChristmasDay(now) && shouldShowOncePerYear(`christmas-${y}`)) {
    triggerXmas(y);
  }

  // Easter window (Palm Sunday to Easter Monday)
  if (isEasterWindow(now) && shouldShowOncePerYear(`easter-${y}`)) {
    triggerEaster(y);
  }

  // May 13 (author's birthday)
  if (isMay13(now) && shouldShowOncePerYear(`may13-${y}`)) {
    triggerMay13(y, dispatch);
  }
}

function triggerXmas(year: number) {
  console.log(`🎄 Christmas overlay triggered for ${year}`);
  overlayBus.showOverlay('christmas');
  markShown(`christmas-${year}`);
}

function triggerEaster(year: number) {
  console.log(`🐰 Easter overlay triggered for ${year}`);
  overlayBus.showOverlay('easter');
  markShown(`easter-${year}`);
}

function triggerMay13(year: number, dispatch?: any) {
  console.log(`🎂 May 13 overlay triggered for ${year}`);
  overlayBus.showOverlay('may13');
  markShown(`may13-${year}`);
  
  // Set flags for post-overlay NPC banter
  if (dispatch) {
    dispatch({ type: 'SET_FLAG', payload: { flag: 'may13Celebration', value: true } });
  }
}
