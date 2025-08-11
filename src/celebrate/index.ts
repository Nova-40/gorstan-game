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

// src/celebrate/index.ts
// Main exports for the celebration subsystem

// Core functionality
export {
  loadCelebrationData,
  loadCelebrationIndex,
  getActiveCelebrations,
  hasCelebrations,
  getCelebrationById,
  isCelebrationDismissed,
  dismissCelebration,
  clearDismissedCelebrations,
  getCelebrationPreferences,
  saveCelebrationPreferences,
  CELEBRATION_STORAGE_KEYS
} from './celebrateGate';

// React components
export { CelebrationController } from './celebrateController';

// Types
export type { CelebrationData, CelebrationIndex } from './celebrateGate';
export type { Span } from './gen/util';

// Utility for checking if celebration system should be enabled
export async function shouldShowCelebrations(): Promise<boolean> {
  try {
    const { hasCelebrations } = await import('./celebrateGate');
    return await hasCelebrations();
  } catch {
    return false;
  }
}
