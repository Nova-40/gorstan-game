// src/utils/roomLoader.js
export async function loadAllRooms() {
  const roomModules = import.meta.glob('../rooms/**/*.json', { eager: true });

  const rooms = {};
  for (const path in roomModules) {
    try {
      const room = roomModules[path];
      const key = path.split('/').pop().replace('.json', '');
      rooms[key] = room.default || room;
    } catch (err) {
      console.warn(`[roomLoader] Failed to load ${path}:`, err);
    }
  }

  return rooms;
}

