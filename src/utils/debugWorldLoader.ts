// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: debugWorldLoader.ts
// Path: src/utils/debugWorldLoader.ts
//
// debugWorldLoader utility for Gorstan game.
// Provides a function to load all room data for debugging purposes, with console output for diagnostics.

/**
 * debugWorldLoader
 * Loads all room data using the loadRooms utility and logs diagnostic information to the console.
 * Useful for debugging world/room loading issues during development.
 *
 * @returns {Promise<Object>} - Resolves to the loaded rooms object.
 * @throws {Error} - Throws if loading fails.
 */
export async function debugWorldLoader(): Promise<Record<string, any>> {
  try {
    console.log('[DEBUG] Starting world load...');
        if (!rooms || Object.keys(rooms).length === 0) {
      console.error('[ERROR] No rooms loaded. Possible directory or schema issue.');
    } else {
      console.log(`[SUCCESS] ${Object.keys(rooms).length} rooms loaded.`);
    }
    return rooms;
  } catch (err) {
    console.error('[CRITICAL] Error loading world:', err);
    throw err;
  }
}

// Exported as a named export for use in debug and development tools.
// TODO: Add more detailed diagnostics or validation as world
