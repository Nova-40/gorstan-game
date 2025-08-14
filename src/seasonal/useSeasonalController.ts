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

// src/seasonal/useSeasonalController.ts
// Gorstan Game Beta 1
// React hook for managing seasonal overlay timing and display

import { useEffect, useRef } from "react";
import { maybeShowSeasonalOverlay } from "./seasonalController";

/**
 * useSeasonalController - Hook for integrating seasonal overlays into AppCore
 *
 * Features:
 * - Checks for seasonal overlays on boot
 * - Monitors for day rollover events
 * - Integrates with existing game state management
 * - Prevents duplicate checks with ref tracking
 *
 * @param dispatch - Game state dispatch function for May 13 NPC banter
 */
export const useSeasonalController = (dispatch?: any) => {
  const hasBootChecked = useRef(false);
  const lastCheckedDate = useRef<string | null>(null);

  // Boot check - run once when component mounts
  useEffect(() => {
    if (!hasBootChecked.current) {
      console.log(
        "[useSeasonalController] Running boot check for seasonal overlays",
      );
      maybeShowSeasonalOverlay(dispatch);
      hasBootChecked.current = true;
      lastCheckedDate.current = new Date().toDateString();
    }
  }, [dispatch]);

  // Day rollover check - monitor date changes
  useEffect(() => {
    const checkDateRollover = () => {
      const currentDateString = new Date().toDateString();

      if (
        lastCheckedDate.current &&
        lastCheckedDate.current !== currentDateString
      ) {
        console.log(
          "[useSeasonalController] Day rollover detected, checking for seasonal overlays",
        );
        maybeShowSeasonalOverlay(dispatch);
        lastCheckedDate.current = currentDateString;
      }
    };

    // Check every minute for date changes (covers midnight rollover)
    const interval = setInterval(checkDateRollover, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Return empty object for potential future expansion
  return {};
};
