
// Gorstan v3.2.5 – Dynamic Room Loader
// This module imports all .json room files under /src/rooms/** and merges them

export async function loadAllRooms() {
  const modules = import.meta.glob('../rooms/**/*.json', { eager: true });
  const rooms = Object.values(modules).flat();
  return Array.isArray(rooms[0]) ? rooms.flat() : rooms;
}

export default loadAllRooms;
