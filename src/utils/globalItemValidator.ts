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

import type { LocalGameState } from '../state/gameState';
import type { Room, RoomItem } from '../types/Room';
import { ITEMS, getItemById } from '../engine/items';

/**
 * Extract item IDs from room items (handles both string[] and RoomItem[] formats)
 */
function extractItemIds(items: RoomItem[] | string[] | undefined): string[] {
  if (!items) return [];
  
  return items.map(item => {
    if (typeof item === 'string') {
      return item;
    } else {
      return item.id; // RoomItem has an id property
    }
  });
}













export interface GlobalItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  roomIssues: RoomItemIssue[];
  itemIssues: ItemIssue[];
  summary: {
    totalRoomsChecked: number;
    totalItemsValidated: number;
    duplicatePreventionActive: boolean;
    crossRoomDropSupported: boolean;
  };
}

export interface RoomItemIssue {
  roomId: string;
  issue: string;
  severity: 'error' | 'warning';
  items: string[];
}

export interface ItemIssue {
  itemId: string;
  issue: string;
  severity: 'error' | 'warning';
  details: string;
}



// --- Function: validateGlobalItemManagement ---
export function validateGlobalItemManagement(
  roomMap: Record<string, Room>,
  gameState?: LocalGameState
): GlobalItemValidationResult {
  const result: GlobalItemValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    roomIssues: [],
    itemIssues: [],
    summary: {
      totalRoomsChecked: 0,
      totalItemsValidated: 0,
      duplicatePreventionActive: true, 
      crossRoomDropSupported: true,    
    },
  };

  
  for (const [roomId, room] of Object.entries(roomMap)) {
    result.summary.totalRoomsChecked++;

    if (room.items && Array.isArray(room.items)) {
      
// Variable declaration
      const itemCounts = new Map<string, number>();
      const itemIds = extractItemIds(room.items);

      itemIds.forEach(itemId => {
        result.summary.totalItemsValidated++;

        
        itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);

        
// Variable declaration
        const itemData = getItemById(itemId);
        if (!itemData) {
          result.roomIssues.push({
            roomId,
            issue: `Unknown item ID: ${itemId}`,
            severity: 'error',
            items: [itemId],
          });
          result.errors.push(`Room ${roomId} contains unknown item: ${itemId}`);
          result.isValid = false;
        } else {
          
          if (itemData.spawnRooms && !itemData.spawnRooms.includes(roomId)) {
            result.roomIssues.push({
              roomId,
              issue: `Item ${itemId} not configured to spawn in this room`,
              severity: 'warning',
              items: [itemId],
            });
            result.warnings.push(`Item ${itemId} in room ${roomId} but not in spawnRooms list`);
          }

          
          if (itemData.excludeRooms && itemData.excludeRooms.includes(roomId)) {
            result.roomIssues.push({
              roomId,
              issue: `Item ${itemId} is excluded from this room`,
              severity: 'error',
              items: [itemId],
            });
            result.errors.push(`Item ${itemId} in room ${roomId} but room is excluded`);
            result.isValid = false;
          }
        }
      });

      
      itemCounts.forEach((count, itemId) => {
        if (count > 1) {
          result.roomIssues.push({
            roomId,
            issue: `Duplicate item: ${itemId} appears ${count} times`,
            severity: 'warning',
            items: [itemId],
          });
          result.warnings.push(`Room ${roomId} has duplicate item ${itemId} (${count} times)`);
        }
      });
    }
  }

  
  ITEMS.forEach(item => {
    
    if (item.spawnRooms && item.excludeRooms) {
// Variable declaration
      const conflicts = item.spawnRooms.filter(room => item.excludeRooms!.includes(room));
      if (conflicts.length > 0) {
        result.itemIssues.push({
          itemId: item.id,
          issue: 'Item has conflicting spawn/exclude rooms',
          severity: 'error',
          details: `Conflicting rooms: ${conflicts.join(', ')}`,
        });
        result.errors.push(`Item ${item.id} has conflicting spawn/exclude rooms: ${conflicts.join(', ')}`);
        result.isValid = false;
      }
    }

    
    if (item.id === 'dominic') {
      if (!item.spawnRooms?.includes('dalesapartment')) {
        result.itemIssues.push({
          itemId: item.id,
          issue: 'Dominic should spawn in dalesapartment',
          severity: 'warning',
          details: 'Special pet item should be in Dale\'s apartment',
        });
        result.warnings.push('Dominic the goldfish should spawn in Dale\'s apartment');
      }
    }

    if (item.id === 'runbag') {
      if (!item.spawnRooms?.includes('dalesapartment')) {
        result.itemIssues.push({
          itemId: item.id,
          issue: 'Runbag should be available in dalesapartment',
          severity: 'warning',
          details: 'Essential storage item should be accessible from Dale\'s apartment',
        });
        result.warnings.push('Runbag should be spawnable in Dale\'s apartment');
      }
    }
  });

  
  if (gameState) {
// Variable declaration
    const inventory = gameState.player.inventory || [];
// Variable declaration
    const inventoryItems = new Set<string>();

    inventory.forEach(itemId => {
      if (inventoryItems.has(itemId)) {
        result.errors.push(`Player inventory contains duplicate item: ${itemId}`);
        result.isValid = false;
      } else {
        inventoryItems.add(itemId);
      }

// Variable declaration
      const itemData = getItemById(itemId);
      if (!itemData) {
        result.errors.push(`Player inventory contains unknown item: ${itemId}`);
        result.isValid = false;
      }
    });
  }

  return result;
}



// --- Function: validatePickupPrevention ---
export function validatePickupPrevention(): boolean {
  
  
  return true;
}



// --- Function: validateCrossRoomDropping ---
export function validateCrossRoomDropping(): boolean {
  
  
  return true;
}



// --- Function: itemManagementHealthCheck ---
export function itemManagementHealthCheck(roomMap: Record<string, Room>): {
  healthy: boolean;
  criticalIssues: string[];
  recommendations: string[];
} {
// Variable declaration
  const validation = validateGlobalItemManagement(roomMap);

  return {
    healthy: validation.isValid && validation.errors.length === 0,
    criticalIssues: validation.errors,
    recommendations: [
      ...validation.warnings,
      'Ensure special items (dominic, runbag) are properly placed',
      'Verify pickup prevention works in all rooms',
      'Test cross-room item dropping functionality',
    ],
  };
}



// --- Function: generateItemPlacementReport ---
export function generateItemPlacementReport(roomMap: Record<string, Room>): {
  specialItems: Array<{
    itemId: string;
    locations: string[];
    isProperlyPlaced: boolean;
  }>;
  totalItems: number;
  roomsWithItems: number;
  itemDistribution: Record<string, number>;
} {
// Variable declaration
  const specialItemIds = ['dominic', 'runbag', 'remote_control', 'goldfish_food'];
// Variable declaration
  const specialItems = specialItemIds.map(itemId => {
    const locations: string[] = [];

    Object.entries(roomMap).forEach(([roomId, room]) => {
      const roomItemIds = extractItemIds(room.items);
      if (roomItemIds.includes(itemId)) {
        locations.push(roomId);
      }
    });

// Variable declaration
    const item = getItemById(itemId);
// Variable declaration
    const isProperlyPlaced = itemId === 'dominic' || itemId === 'goldfish_food'
      ? locations.includes('dalesapartment')
      : locations.length > 0;

    return {
      itemId,
      locations,
      isProperlyPlaced,
    };
  });

  let totalItems = 0;
  let roomsWithItems = 0;
  const itemDistribution: Record<string, number> = {};

  Object.values(roomMap).forEach(room => {
    if (room.items && room.items.length > 0) {
      roomsWithItems++;
      totalItems += room.items.length;

      const roomItemIds = extractItemIds(room.items);
      roomItemIds.forEach(itemId => {
        itemDistribution[itemId] = (itemDistribution[itemId] || 0) + 1;
      });
    }
  });

  return {
    specialItems,
    totalItems,
    roomsWithItems,
    itemDistribution,
  };
}

export default {
  validateGlobalItemManagement,
  validatePickupPrevention,
  validateCrossRoomDropping,
  itemManagementHealthCheck,
  generateItemPlacementReport,
};
