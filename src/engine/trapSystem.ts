export type TrapId = string;
export type RoomId = string;

export type Trap = {
  id: TrapId;
  room: RoomId;
  description: string;
  lethal?: boolean;
};

const armed: Map<RoomId, Trap[]> = new Map();

export function armTrap(id: TrapId, room: RoomId, description = 'You triggered a trap!', lethal = true) {
  const list = armed.get(room) ?? [];
  list.push({ id, room, description, lethal });
  armed.set(room, list);
}

export function disarmAll() {
  armed.clear();
}

export function getRoomTraps(room: RoomId): Trap[] {
  return armed.get(room) ?? [];
}

export function enterRoom(room: RoomId) {
  const traps = getRoomTraps(room);
  if (!traps.length) return { death: false, cause: null as string | null };
  const lethal = traps.find(t => t.lethal);
  return { death: !!lethal, cause: lethal?.description ?? traps[0].description };
}

import { useEffect } from 'react';
export function useRoomTraps(room: RoomId, onDeath?: (cause: string) => void) {
  useEffect(() => {
    const r = enterRoom(room);
    if (r.death && onDeath) onDeath(r.cause || 'A trap was sprung.');
  }, [room, onDeath]);
}
