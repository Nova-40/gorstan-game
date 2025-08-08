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
