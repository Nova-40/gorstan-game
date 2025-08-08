// src/utils/roomUtils.ts
// Utility to get the zone for a given roomId
import { roomRegistry } from '../data/roomRegistry';

/**
 * Returns the zone string for a given roomId, or empty string if not found.
 */
export function getZoneForRoom(roomId: string): string {
  const room = roomRegistry[roomId];
  return room && typeof room.zone === 'string' ? room.zone : '';
}
