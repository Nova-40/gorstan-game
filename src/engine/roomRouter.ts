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

// Gorstan and characters (c) Geoff Webster 2025
// Room navigation and teleportation utilities

import { pushConsoleMessage } from "../utils/consoleTools";

/**
 * Teleport player to a specified room
 * @param roomId - The ID of the room to teleport to
 */
export function teleportToRoom(roomId: string): void {
  pushConsoleMessage(`Teleporting to ${roomId}...`, "info");

  // This would typically dispatch a room change action
  // For now, we'll use console message as placeholder
  pushConsoleMessage(`You find yourself in: ${roomId}`, "success");
}

/**
 * Navigate to a room with transition effects
 * @param roomId - The ID of the room to navigate to
 * @param transitionType - Type of transition effect
 */
export function navigateToRoom(
  roomId: string,
  transitionType: "instant" | "fade" | "slide" = "instant",
): void {
  switch (transitionType) {
    case "fade":
      pushConsoleMessage("The world fades to black...", "info");
      break;
    case "slide":
      pushConsoleMessage("Reality shifts around you...", "info");
      break;
    default:
      break;
  }

  teleportToRoom(roomId);
}

/**
 * Check if a room ID is valid
 * @param roomId - The room ID to validate
 * @returns Whether the room ID is valid
 */
export function isValidRoom(roomId: string): boolean {
  // Basic validation - room IDs should be non-empty strings
  return typeof roomId === "string" && roomId.length > 0;
}
