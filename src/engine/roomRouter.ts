// src/engine/roomRouter.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Room navigation and teleportation utilities

import { pushConsoleMessage } from '../utils/consoleTools';

/**
 * Teleport player to a specified room
 * @param roomId - The ID of the room to teleport to
 */
export function teleportToRoom(roomId: string): void {
  pushConsoleMessage(`Teleporting to ${roomId}...`, 'info');
  
  // This would typically dispatch a room change action
  // For now, we'll use console message as placeholder
  pushConsoleMessage(`You find yourself in: ${roomId}`, 'success');
}

/**
 * Navigate to a room with transition effects
 * @param roomId - The ID of the room to navigate to
 * @param transitionType - Type of transition effect
 */
export function navigateToRoom(roomId: string, transitionType: 'instant' | 'fade' | 'slide' = 'instant'): void {
  switch (transitionType) {
    case 'fade':
      pushConsoleMessage('The world fades to black...', 'info');
      break;
    case 'slide':
      pushConsoleMessage('Reality shifts around you...', 'info');
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
  return typeof roomId === 'string' && roomId.length > 0;
}
