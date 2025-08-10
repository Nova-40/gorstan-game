// src/utils/roomLoader.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import roomRegistry from '../rooms/roomRegistry';

import type { Room } from '../types/Room';


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




// Variable declaration
const roomMap = new Map<RoomId, RoomDefinition>();



// --- Function: isValidRoomId ---
function isValidRoomId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-z0-9_-]+$/i.test(id);
}


// --- Function: validateRoomSchema ---
function validateRoomSchema(room: any): room is RoomDefinition {
// JSX return block or main return
  return (
    room &&
    typeof room === 'object' &&
    typeof room.id === 'string' &&
    typeof room.title === 'string' &&
    (typeof room.description === 'string' || Array.isArray(room.description)) &&
    typeof room.image === 'string'
  );
}


// --- Function: isNonEmptyString ---
function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}



// --- Function: initializeRooms ---
function initializeRooms(): void {
  console.log('[roomLoader] Initializing rooms...');
  console.log('[roomLoader] roomRegistry keys:', Object.keys(roomRegistry));
  
  for (const [, room] of Object.entries(roomRegistry)) {
    
    if (!room || typeof room.id !== 'string') {
      console.warn('[roomLoader] Skipping invalid room entry in registry:', room);
      continue;
    }

// Variable declaration
    const roomId = room.id;

    if (!isValidRoomId(roomId)) {
      console.warn(`[roomLoader] Invalid room ID format: ${roomId}`);
      continue;
    }

    if (!validateRoomSchema(room)) {
      console.warn(`[roomLoader] Room ${roomId} failed schema validation`);
      continue;
    }

    
    if (roomMap.has(roomId)) {
      console.warn(`[roomLoader] Duplicate room ID detected: ${roomId}. Overwriting.`);
    }

    roomMap.set(roomId, room);
  }
  
  console.log(`[roomLoader] Initialized ${roomMap.size} rooms`);
  if (roomMap.size === 0) {
    console.error('[roomLoader] No rooms were loaded! This is a critical error.');
  }
}


initializeRooms();


// --- Function: loadRoomById ---
export function loadRoomById(id: string): RoomDefinition | null {
// Variable declaration
  const room = roomMap.get(id as RoomId) || null;
  if (!room) {
    console.warn(`[roomLoader] Room transition failed: Room '${id}' does not exist. Falling back to 'controlnexus'.`);
  }
  return room;
}


// --- Function: validateRooms ---
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

// --- Function: getAllRoomsAsObject ---
export function getAllRoomsAsObject(): Record<string, Room> {
  console.log('[roomLoader] getAllRoomsAsObject called, roomMap size:', roomMap.size);
  
  if (roomMap.size === 0) {
    console.error('[roomLoader] roomMap is empty! Attempting to reinitialize...');
    initializeRooms();
  }
  
  const obj: Record<string, Room> = {};
  for (const [id, room] of roomMap.entries()) {
    obj[id] = {
      ...room,
      description: Array.isArray(room.description) ? room.description.join('\n') : room.description,
      zone: (room as any).zone ?? '',
      flags: (room as any).flags ?? [],
      exits: room.exits ?? {},
      items: Array.isArray(room.items)
        ? (room.items as unknown as import('../types/Room').RoomItem[])
        : [],
      npcs: Array.isArray(room.npcs) ? room.npcs.map(npc => typeof npc === 'string' ? { id: npc } as import('../types/Room').RoomNPC : npc) : [],
      rooms: (room as any).rooms ?? [],
    };
  }
  
  console.log('[roomLoader] Returning', Object.keys(obj).length, 'rooms');
  return obj;
}
