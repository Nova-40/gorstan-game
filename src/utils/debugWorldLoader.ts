// src/utils/debugWorldLoader.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

export async function debugWorldLoader(): Promise<Record<string, any>> {
  try {
    console.log('[DEBUG] Starting world load...');
    
    // Mock room loading - in a real implementation this would load from files
    const rooms: Record<string, any> = {
      start: { id: 'start', name: 'Starting Room' },
      reset: { id: 'reset', name: 'Reset Room' }
    };
    
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
