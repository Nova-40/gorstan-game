// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: itemEngine.js
// Path: src/engine/itemEngine.js


// src/engine/itemEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// itemEngine utility for Gorstan game.
// Provides functions to seed items into rooms using the full item registry.
// Ensures no duplicate items are added to a room's inventory.

import { getAllItems } from './items';

/**
 * seedItemsInRooms
 * Seeds items into each room, ensuring no duplicates.
 * Uses generateRoomItems to determine which items to add.
 *
 * @param {Array<Object>} rooms - Array of room objects to seed with items.
 * @returns {Array<Object>} - New array of rooms with updated items arrays.
 */
export function seedItemsInRooms(rooms) {
  if (!Array.isArray(rooms)) return [];

  return rooms.map(room => {
    // Generate new items for this room, avoiding duplicates
    const newItems = generateRoomItems(room.id).filter(
      item =>
        !(room.items || []).some(
          existing => existing.id === item.id || existing === item.id
        )
    );

    return {
      ...room,
      items: [...(room.items || []), ...newItems.map(i => i.id)]
    };
  });
}

/**
 * generateRoomItems
 * Randomly selects a number of items from the full item registry for a given room.
 * Ensures no duplicate items are selected for a single room.
 *
 * @param {string} roomId - The unique ID of the room.
 * @returns {Array<Object>} - Array of item objects selected for the room.
 */
function generateRoomItems(roomId) {
  const allItems = getAllItems();
  const count = Math.floor(Math.random() * 7); // 0–6 items per room
  const selected = [];

  while (selected.length < count && selected.length < allItems.length) {
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    if (!selected.find(i => i.id === item.id)) {
      selected.push(item);
    }
  }

  return selected;
}

// Exported as named exports for use in world/room setup logic.
// TODO: Consider making item seeding deterministic for testing or replayability.