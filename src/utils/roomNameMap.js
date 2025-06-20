import allRooms from '../rooms/roomLoader'; // or wherever your loader gathers all rooms

const roomNameMap = {};

for (const room of allRooms) {
  if (room.id && room.name) {
    roomNameMap[room.id] = room.name;
  }
}

export default roomNameMap;
// This utility creates a mapping of room IDs to their names
// for easier reference throughout the application.