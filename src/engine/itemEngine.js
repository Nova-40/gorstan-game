// src/engine/itemEngine.js
// Gorstan v3.3 – Item Seeder with Full Registry Integration
// MIT License © 2025 Geoff Webster

import { getAllItems } from './items';

export function seedItemsInRooms(rooms) {
  if (!Array.isArray(rooms)) return [];

  return rooms.map(room => {
    const newItems = generateRoomItems(room.id).filter(
      item => !(room.items || []).some(existing => existing.id === item.id || existing === item.id)
    );

    return {
      ...room,
      items: [...(room.items || []), ...newItems.map(i => i.id)]
    };
  });
}

function generateRoomItems(roomId) {
  const allItems = getAllItems();
  const count = Math.floor(Math.random() * 7); // 0–6 items
  const selected = [];

  while (selected.length < count && selected.length < allItems.length) {
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    if (!selected.find(i => i.id === item.id)) {
      selected.push(item);
    }
  }

  return selected;
}
