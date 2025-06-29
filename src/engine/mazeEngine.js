export function isInMaze(roomId) {
  return roomId.toLowerCase().includes("maze");
}

export function nextMazeRoom(current) {
  const options = ["stillamazeroom", "anothermazeroom", "forgottonchamber"];
  return options[Math.floor(Math.random() * options.length)];
}