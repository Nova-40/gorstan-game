/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// src/utils/roomUtils.ts
// Utility to get the zone for a given roomId
import roomRegistry from "../rooms/roomRegistry";

/**
 * Returns the zone string for a given roomId, or empty string if not found.
 */
export function getZoneForRoom(roomId: string): string {
  const room = roomRegistry[roomId as keyof typeof roomRegistry];
  return room && typeof room.zone === "string" ? room.zone : "";
}
