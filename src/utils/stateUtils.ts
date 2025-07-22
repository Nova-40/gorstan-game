import { GameState } from '../types/GameTypes';

import { NPC } from './NPCTypes';



// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: stateUtils.ts
// Description: Unified state management utilities for Gorstan game


/**
 * Check if player has any of the specified items
 */
export const hasAnyItem = (state: GameState, items: string[]): boolean => {
  return items.some(item => state.player.inventory?.includes(item));
};

/**
 * Check if player has all of the specified items
 */
export const hasAllItems = (state: GameState, items: string[]): boolean => {
  return items.every(item => state.player.inventory?.includes(item));
};

/**
 * Check if player has remote control (common check throughout the game)
 */
export const hasRemoteControl = (state: GameState): boolean => {
  return state.player.inventory?.includes('remote_control') || false;
};

/**
 * Check if player has navigation crystal (common check throughout the game)
 */
export const hasNavigationCrystal = (state: GameState): boolean => {
  return state.player.inventory?.includes('navigation_crystal') || false;
};

/**
 * Check if player has any teleportation device
 */
export const hasTeleportationDevice = (state: GameState): boolean => {
  return hasRemoteControl(state) || hasNavigationCrystal(state);
};

/**
 * Get player's current location
 */
export const getCurrentLocation = (state: GameState): string => {
  return state.currentRoomId || '';
};

/**
 * Check if player is in a specific room
 */
export const isInRoom = (state: GameState, roomId: string): boolean => {
  return getCurrentLocation(state) === roomId;
};

/**
 * Check if player is in any of the specified rooms
 */
export const isInAnyRoom = (state: GameState, roomIds: string[]): boolean => {
  return roomIds.includes(getCurrentLocation(state));
};

/**
 * Check if player is sitting in any chair
 */
export const isSittingInAnyChair = (state: GameState): boolean => {
  const sittingFlags = Object.keys(state.flags || {}).filter(key =>
    key.startsWith('sittingIn') && key.endsWith('Chair')
  );
  return sittingFlags.some(flag => Boolean(state.flags?.[flag]));
};

/**
 * Check if player is sitting in a specific chair
 */
export const isSittingInChair = (state: GameState, chairId: string): boolean => {
  return Boolean(state.flags?.[`sittingIn${chairId}Chair`]);
};

/**
 * Get all active sitting states
 */
export const getActiveSittingStates = (state: GameState): string[] => {
  return Object.entries(state.flags || {})
    .filter(([key, value]) => key.startsWith('sittingIn') && key.endsWith('Chair') && value)
    .map(([key]) => key);
};

/**
 * Check if any NPCs are pending actions
 */
export const hasAnyPendingNPCs = (state: GameState): boolean => {
  const pendingFlags = Object.keys(state.flags || {}).filter(key =>
    key.includes('NPC') && key.includes('pending')
  );
  return pendingFlags.some(flag => Boolean(state.flags?.[flag]));
};

/**
 * Get pending NPC actions
 */
export const getPendingNPCActions = (state: GameState): string[] => {
  return Object.entries(state.flags || {})
    .filter(([key, value]) => key.includes('NPC') && key.includes('pending') && value)
    .map(([key]) => key);
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (state: GameState): boolean => {
  return Boolean(state.flags?.debugMode);
};

/**
 * Get player's inventory count
 */
export const getInventoryCount = (state: GameState): number => {
  return state.player.inventory?.length || 0;
};

/**
 * Check if inventory is empty
 */
export const isInventoryEmpty = (state: GameState): boolean => {
  return getInventoryCount(state) === 0;
};

/**
 * Check if inventory is full (if there's a max limit)
 */
export const isInventoryFull = (state: GameState, maxItems: number = 50): boolean => {
  return getInventoryCount(state) >= maxItems;
};

/**
 * Get room-specific flags for current room
 */
export const getCurrentRoomFlags = (state: GameState): Record<string, any> => {
  const currentRoom = getCurrentLocation(state);
  if (!currentRoom) return {};

  return Object.entries(state.flags || {})
    .filter(([key]) => key.includes(currentRoom))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
};

/**
 * Get zone from current room (extracting zone from room ID)
 */
export const getCurrentZone = (state: GameState): string => {
  const currentRoom = getCurrentLocation(state);
  if (!currentRoom) return '';

  // Extract zone from room format like "introZone_crossing" -> "introZone"
  const zoneMatch = currentRoom.match(/^([a-zA-Z]+Zone)/);
  return zoneMatch ? zoneMatch[1] : '';
};

/**
 * Check if player is in a specific zone
 */
export const isInZone = (state: GameState, zone: string): boolean => {
  return getCurrentZone(state) === zone;
};

/**
 * Get all flags matching a pattern
 */
export const getFlagsMatching = (state: GameState, pattern: RegExp): Record<string, any> => {
  return Object.entries(state.flags || {})
    .filter(([key]) => pattern.test(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);
};

/**
 * Check if any flags match a pattern
 */
export const hasAnyFlagsMatching = (state: GameState, pattern: RegExp): boolean => {
  return Object.keys(state.flags || {}).some(key => pattern.test(key));
};

/**
 * Count flags matching a pattern
 */
export const countFlagsMatching = (state: GameState, pattern: RegExp): number => {
  return Object.keys(state.flags || {}).filter(key => pattern.test(key)).length;
};

/**
 * Get state summary for debugging
 */
export const getStateSummary = (state: GameState) => {
  return {
    currentRoom: getCurrentLocation(state),
    currentZone: getCurrentZone(state),
    inventoryCount: getInventoryCount(state),
    flagCount: Object.keys(state.flags || {}).length,
    hasTeleportDevice: hasTeleportationDevice(state),
    isSitting: isSittingInAnyChair(state),
    isDebug: isDebugMode(state),
    pendingNPCs: getPendingNPCActions(state).length
  };
};

/**
 * Common flag patterns for filtering
 */
export const FLAG_PATTERNS = {
  SITTING: /^sittingIn.*Chair$/,
  DEBUG: /^debug.*$/,
  PENDING: /^pending.*Command$/,
  NPC: /^.*NPC.*$/,
  TRAVEL: /^travel.*$/,
  ROOM_SPECIFIC: (roomId: string) => new RegExp(`.*${roomId}.*`),
  ZONE_SPECIFIC: (zone: string) => new RegExp(`.*${zone}.*`)
} as const;
