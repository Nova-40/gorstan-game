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
// Game module.

import { GameState } from "../types/GameTypes";

import { NPC } from "../types/NPCTypes";

export const hasAnyItem = (state: GameState, items: string[]): boolean => {
  return items.some((item) => state.player.inventory?.includes(item));
};

export const hasAllItems = (state: GameState, items: string[]): boolean => {
  return items.every((item) => state.player.inventory?.includes(item));
};

export const hasRemoteControl = (state: GameState): boolean => {
  return state.player.inventory?.includes("remote_control") || false;
};

export const hasNavigationCrystal = (state: GameState): boolean => {
  return state.player.inventory?.includes("navigation_crystal") || false;
};

export const hasTeleportationDevice = (state: GameState): boolean => {
  return hasRemoteControl(state) || hasNavigationCrystal(state);
};

export const getCurrentLocation = (state: GameState): string => {
  return state.currentRoomId || "";
};

export const isInRoom = (state: GameState, roomId: string): boolean => {
  return getCurrentLocation(state) === roomId;
};

export const isInAnyRoom = (state: GameState, roomIds: string[]): boolean => {
  return roomIds.includes(getCurrentLocation(state));
};

export const isSittingInAnyChair = (state: GameState): boolean => {
  // Variable declaration
  const sittingFlags = Object.keys(state.flags || {}).filter(
    (key) => key.startsWith("sittingIn") && key.endsWith("Chair"),
  );
  return sittingFlags.some((flag) => Boolean(state.flags?.[flag]));
};

export const isSittingInChair = (
  state: GameState,
  chairId: string,
): boolean => {
  return Boolean(state.flags?.[`sittingIn${chairId}Chair`]);
};

export const getActiveSittingStates = (state: GameState): string[] => {
  return Object.entries(state.flags || {})
    .filter(
      ([key, value]) =>
        key.startsWith("sittingIn") && key.endsWith("Chair") && value,
    )
    .map(([key]) => key);
};

export const hasAnyPendingNPCs = (state: GameState): boolean => {
  // Variable declaration
  const pendingFlags = Object.keys(state.flags || {}).filter(
    (key) => key.includes("NPC") && key.includes("pending"),
  );
  return pendingFlags.some((flag) => Boolean(state.flags?.[flag]));
};

export const getPendingNPCActions = (state: GameState): string[] => {
  return Object.entries(state.flags || {})
    .filter(
      ([key, value]) => key.includes("NPC") && key.includes("pending") && value,
    )
    .map(([key]) => key);
};

export const isDebugMode = (state: GameState): boolean => {
  return Boolean(state.flags?.debugMode);
};

export const getInventoryCount = (state: GameState): number => {
  return state.player.inventory?.length || 0;
};

export const isInventoryEmpty = (state: GameState): boolean => {
  return getInventoryCount(state) === 0;
};

export const isInventoryFull = (
  state: GameState,
  maxItems: number = 50,
): boolean => {
  return getInventoryCount(state) >= maxItems;
};

export const getCurrentRoomFlags = (state: GameState): Record<string, any> => {
  // Variable declaration
  const currentRoom = getCurrentLocation(state);
  if (!currentRoom) {return {};}

  return Object.entries(state.flags || {})
    .filter(([key]) => key.includes(currentRoom))
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, any>,
    );
};

export const getCurrentZone = (state: GameState): string => {
  // Variable declaration
  const currentRoom = getCurrentLocation(state);
  if (!currentRoom) {return "";}

  // Variable declaration
  const zoneMatch = currentRoom.match(/^([a-zA-Z]+Zone)/);
  return zoneMatch ? zoneMatch[1] : "";
};

export const isInZone = (state: GameState, zone: string): boolean => {
  return getCurrentZone(state) === zone;
};

export const getFlagsMatching = (
  state: GameState,
  pattern: RegExp,
): Record<string, any> => {
  return Object.entries(state.flags || {})
    .filter(([key]) => pattern.test(key))
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, any>,
    );
};

export const hasAnyFlagsMatching = (
  state: GameState,
  pattern: RegExp,
): boolean => {
  return Object.keys(state.flags || {}).some((key) => pattern.test(key));
};

export const countFlagsMatching = (
  state: GameState,
  pattern: RegExp,
): number => {
  return Object.keys(state.flags || {}).filter((key) => pattern.test(key))
    .length;
};

export const getStateSummary = (state: GameState) => {
  return {
    currentRoom: getCurrentLocation(state),
    currentZone: getCurrentZone(state),
    inventoryCount: getInventoryCount(state),
    flagCount: Object.keys(state.flags || {}).length,
    hasTeleportDevice: hasTeleportationDevice(state),
    isSitting: isSittingInAnyChair(state),
    isDebug: isDebugMode(state),
    pendingNPCs: getPendingNPCActions(state).length,
  };
};

export const FLAG_PATTERNS = {
  SITTING: /^sittingIn.*Chair$/,
  DEBUG: /^debug.*$/,
  PENDING: /^pending.*Command$/,
  NPC: /^.*NPC.*$/,
  TRAVEL: /^travel.*$/,
  ROOM_SPECIFIC: (roomId: string) => new RegExp(`.*${roomId}.*`),
  ZONE_SPECIFIC: (zone: string) => new RegExp(`.*${zone}.*`),
} as const;
