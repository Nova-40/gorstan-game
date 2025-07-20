// roomLoader.ts — utils/roomLoader.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: roomLoader

// Module: src/utils/roomLoader.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

// Type definitions
type RoomId = string;

interface RoomDefinition {
  id: string;
  title: string;
  description: string | string[];
  image: string;
  exits?: Record<string, string>;
  items?: string[];
  npcs?: string[];
}

// Import the actual roomRegistry from `src/rooms/roomRegistry.ts`
import roomRegistry from '../rooms/roomRegistry';
import { Room } from '../types';

// Room map to store validated rooms
const roomMap = new Map<RoomId, RoomDefinition>();

// Utility functions
function isValidRoomId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-z0-9_-]+$/i.test(id);
}

function validateRoomSchema(room: any): room is RoomDefinition {
  return (
    room &&
    typeof room === 'object' &&
    typeof room.id === 'string' &&
    typeof room.title === 'string' &&
    (typeof room.description === 'string' || Array.isArray(room.description)) &&
    typeof room.image === 'string'
  );
}

function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// Initialize room loading
function initializeRooms(): void {
  for (const [, room] of Object.entries(roomRegistry)) {
    // Ensure room is a valid object with an id
    if (!room || typeof room.id !== 'string') {
      console.warn('[roomLoader] Skipping invalid room entry in registry:', room);
      continue;
    }

    const roomId = room.id;

    if (!isValidRoomId(roomId)) {
      console.warn(`[roomLoader] Invalid room ID format: ${roomId}`);
      continue;
    }

    if (!validateRoomSchema(room)) {
      console.warn(`[roomLoader] Room ${roomId} failed schema validation`);
      continue;
    }

    // Check for duplicate IDs
    if (roomMap.has(roomId)) {
      console.warn(`[roomLoader] Duplicate room ID detected: ${roomId}. Overwriting.`);
    }

    roomMap.set(roomId, room);
  }
}

// Initialize on module load
initializeRooms();

export function loadRoomById(id: string): RoomDefinition | null {
  return roomMap.get(id as RoomId) || null;
}

export function validateRooms(): string[] {
  const warnings: string[] = [];

  for (const [id, room] of Object.entries(roomRegistry)) {
    if (!validateRoomSchema(room)) {
      warnings.push(`Room ${id} failed schema validation`);
    }
    if (!room.title || !isNonEmptyString(room.title)) {
      warnings.push(`Room ${id} is missing a valid title`);
    }
    if (!room.image || !isNonEmptyString(room.image)) {
      warnings.push(`Room ${id} is missing a valid image path`);
    }
  }

  return warnings;
}
export function getAllRoomsAsObject(): Record<string, Room> {
  const obj: Record<string, Room> = {};
  for (const [id, room] of roomMap.entries()) {
    obj[id] = {
      ...room,
      description: Array.isArray(room.description) ? room.description.join('\n') : room.description,
      zone: (room as any).zone ?? '',
      flags: (room as any).flags ?? [],
      exits: room.exits ?? {},
      items: Array.isArray(room.items) ? [...room.items] : [],
      npcs: Array.isArray(room.npcs) ? [...room.npcs] : [],
    };
  }
  return obj;
}