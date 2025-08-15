export type RoomId = string;

const history: RoomId[] = [];
let currentRoom: RoomId = 'room:hub';

export function go(room: RoomId): void {
  history.push(currentRoom);
  currentRoom = room;
  console.log(`Navigated to ${room}`);
}

export function goBack(): void {
  if (history.length > 0) {
    currentRoom = history.pop()!;
    console.log(`Returned to ${currentRoom}`);
  } else {
    currentRoom = 'room:hub';
    console.log('Returned to fallback room: room:hub');
  }
}

export function getCurrent(): RoomId {
  return currentRoom;
}
