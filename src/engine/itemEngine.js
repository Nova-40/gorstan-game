
export function seedItemsInRooms(rooms) {
  if (!Array.isArray(rooms)) return [];

  return rooms.map(room => {
    const newItems = generateRoomItems(room.id).filter(
      item => !(room.items || []).some(existing => existing.id === item.id)
    );

    return {
      ...room,
      items: [...(room.items || []), ...newItems]
    };
  });
}

function generateRoomItems(roomId) {
  if (Math.random() < 0.3) {
    return [{
      id: `item-shard-${roomId}`,
      name: `Glowing Shard (${roomId})`,
      value: Math.floor(Math.random() * 10) + 1,
      description: "A faintly humming shard. You’re not sure why it calls to you."
    }];
  }
  return [];
}
