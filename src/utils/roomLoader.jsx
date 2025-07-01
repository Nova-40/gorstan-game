// File: src/utils/roomLoader.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// Utility for loading Gorstan room definitions either in bulk or by ID.

const roomModules = import.meta.glob('../rooms/**/*.json', { eager: true });

const roomCache = {};
const allRoomsCache = {};

export async function loadRooms() {
  if (Object.keys(allRoomsCache).length > 0) return allRoomsCache;

  for (const path in roomModules) {
    const room = roomModules[path];
    const id = room.id;

    if (!id) {
      console.warn(`Room at path ${path} is missing an 'id' field.`);
      continue;
    }

    allRoomsCache[id] = room;
    roomCache[id] = room;
  }

  return allRoomsCache;
}

export async function loadRoomById(id) {
  if (roomCache[id]) return roomCache[id];

  await loadRooms(); // populate cache if not already

  if (!roomCache[id]) {
    throw new Error(`Room with ID '${id}' not found in loaded data.`);
  }

  return roomCache[id];
}

// TODO: Add AJV schema validation against roomSchema.js