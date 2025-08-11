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

// src/seasonal/seasonalFlags.ts
// Simple flag system for seasonal event gating - Gorstan Game Beta 1

/**
 * Get a flag value from localStorage
 */
export function getFlag(key: string): boolean {
  try {
    const value = localStorage.getItem(`gorstan.seasonal.${key}`);
    return value === 'true';
  } catch (error) {
    console.warn('[SeasonalFlags] Failed to get flag:', key, error);
    return false;
  }
}

/**
 * Set a flag value in localStorage
 */
export function setFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(`gorstan.seasonal.${key}`, value.toString());
  } catch (error) {
    console.warn('[SeasonalFlags] Failed to set flag:', key, error);
  }
}

/**
 * Clear all seasonal flags (for testing/debugging)
 */
export function clearAllFlags(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('gorstan.seasonal.')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('[SeasonalFlags] Failed to clear flags:', error);
  }
}

/**
 * Get all seasonal flags (for debugging)
 */
export function getAllFlags(): Record<string, boolean> {
  try {
    const flags: Record<string, boolean> = {};
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('gorstan.seasonal.')) {
        const flagKey = key.replace('gorstan.seasonal.', '');
        flags[flagKey] = localStorage.getItem(key) === 'true';
      }
    });
    return flags;
  } catch (error) {
    console.warn('[SeasonalFlags] Failed to get all flags:', error);
    return {};
  }
}
