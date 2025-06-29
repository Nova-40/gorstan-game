
// src/utils/debugWorldLoader.js
import { loadRooms } from './roomLoader.js';

export async function debugWorldLoader() {
  try {
    console.log('[DEBUG] Starting world load...');
    const rooms = await loadRooms();
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
