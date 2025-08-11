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

import type { Player } from '../types/GameTypes';
import type { Room, RoomItem } from '../types/Room';

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
















export interface ItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}


export interface RoomValidationResult {
  roomId: string;
  isValid: boolean;
  issues: {
    duplicateItems: string[];
    invalidItemIds: string[];
    missingDescriptions: string[];
    conflictingFlags: string[];
  };
  recommendations: string[];
}


export interface InventoryValidationResult {
  isValid: boolean;
  issues: {
    unknownItems: string[];
    duplicateItems: string[];
    invalidItemNames: string[];
  };
  cleanedInventory: string[];
  suggestions: string[];
}



// --- Function: validateItem ---
export function validateItem(itemId: string, itemName?: string): ItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  
  if (!itemId || typeof itemId !== 'string') {
    errors.push('Item ID must be a non-empty string');
  } else {
    if (itemId.length < 2) {
      warnings.push('Item ID is very short - consider using more descriptive names');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
      warnings.push('Item ID contains special characters - consider using only letters, numbers, underscores, and hyphens');
    }
  }

  
  if (itemName && typeof itemName !== 'string') {
    errors.push('Item name must be a string if provided');
  } else if (itemName && itemName.length < 2) {
    warnings.push('Item name is very short - players may not understand what it is');
  }

  
  if (itemId && !itemName) {
    suggestions.push('Consider providing a display name for better player experience');
  }

  if (itemId && itemId === itemName) {
    suggestions.push('Item ID and name are identical - consider making the name more descriptive');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}



// --- Function: validateRoomItems ---
export function validateRoomItems(room: Room): RoomValidationResult {
  const duplicateItems: string[] = [];
  const invalidItemIds: string[] = [];
  const missingDescriptions: string[] = [];
  const conflictingFlags: string[] = [];
  const recommendations: string[] = [];

  if (!room.items || room.items.length === 0) {
    return {
      roomId: room.id,
      isValid: true,
      issues: {
        duplicateItems,
        invalidItemIds,
        missingDescriptions,
        conflictingFlags
      },
      recommendations: ['Room has no items - consider adding interactive elements if appropriate']
    };
  }

// Variable declaration
  const seenItemIds = new Set<string>();
// Variable declaration
  const seenItemNames = new Set<string>();
  const itemIds = extractItemIds(room.items);

  for (const itemId of itemIds) {
    // itemId is now guaranteed to be a string
    
    if (seenItemIds.has(itemId)) {
      duplicateItems.push(itemId);
    } else {
      seenItemIds.add(itemId);
    }

    // Validate the item ID
    const validation = validateItem(itemId, itemId);
    if (!validation.isValid) {
      invalidItemIds.push(itemId);
    }
  }

  
  if (room.items.length > 10) {
    recommendations.push('Room has many items - consider if this enhances or clutters gameplay');
  }

  // Note: Cannot check for key/cursed items since room.items only contains IDs
  // These checks would need access to item definitions

  return {
    roomId: room.id,
    isValid: duplicateItems.length === 0 && invalidItemIds.length === 0 && conflictingFlags.length === 0,
    issues: {
      duplicateItems,
      invalidItemIds,
      missingDescriptions,
      conflictingFlags
    },
    recommendations
  };
}



// --- Function: validatePlayerInventory ---
export function validatePlayerInventory(player: Player, knownItems?: string[]): InventoryValidationResult {
  const unknownItems: string[] = [];
  const duplicateItems: string[] = [];
  const invalidItemNames: string[] = [];
  const cleanedInventory: string[] = [];
  const suggestions: string[] = [];

  if (!player.inventory || player.inventory.length === 0) {
    return {
      isValid: true,
      issues: { unknownItems, duplicateItems, invalidItemNames },
      cleanedInventory: [],
      suggestions: ['Player has no items - this is fine for new players']
    };
  }

// Variable declaration
  const seenItems = new Set<string>();

  for (const item of player.inventory) {
    
    if (!item || typeof item !== 'string') {
      invalidItemNames.push(String(item));
      continue;
    }

    
    if (seenItems.has(item)) {
      duplicateItems.push(item);
      continue; 
    }

    seenItems.add(item);

    
    if (knownItems && !knownItems.includes(item)) {
      unknownItems.push(item);
    }

    
    cleanedInventory.push(item);
  }

  
  if (cleanedInventory.length > 20) {
    suggestions.push('Player has many items - consider adding inventory management features');
  }

  if (duplicateItems.length > 0) {
    suggestions.push('Remove duplicate items from inventory to prevent confusion');
  }

  if (unknownItems.length > 0 && knownItems) {
    suggestions.push('Some items in inventory are not recognized - verify item definitions');
  }

  return {
    isValid: unknownItems.length === 0 && duplicateItems.length === 0 && invalidItemNames.length === 0,
    issues: { unknownItems, duplicateItems, invalidItemNames },
    cleanedInventory,
    suggestions
  };
}



// --- Function: runFullItemValidation ---
export function runFullItemValidation(
  rooms: Record<string, Room>,
  player: Player
): {
  overallValid: boolean;
  roomValidations: RoomValidationResult[];
  inventoryValidation: InventoryValidationResult;
  globalIssues: string[];
  recommendations: string[];
} {
  const roomValidations: RoomValidationResult[] = [];
  const globalIssues: string[] = [];
  const recommendations: string[] = [];

  
// Variable declaration
  const allKnownItems = new Set<string>();

  
  for (const [roomId, room] of Object.entries(rooms)) {
    try {
// Variable declaration
      const roomValidation = validateRoomItems(room);
      roomValidations.push(roomValidation);

      
      if (room.items) {
        const roomItemIds = extractItemIds(room.items);
        for (const itemId of roomItemIds) {
          allKnownItems.add(itemId); // itemId is now guaranteed to be a string
        }
      }
    } catch (error) {
      globalIssues.push(`Failed to validate room ${roomId}: ${error}`);
    }
  }

  
// Variable declaration
  const inventoryValidation = validatePlayerInventory(player, Array.from(allKnownItems));

  
// Variable declaration
  const totalItems = Array.from(allKnownItems).length;
  if (totalItems === 0) {
    globalIssues.push('No items found in any room - game may lack interactive elements');
  }

// Variable declaration
  const invalidRooms = roomValidations.filter(r => !r.isValid).length;
  if (invalidRooms > 0) {
    globalIssues.push(`${invalidRooms} rooms have item validation issues`);
  }

  
  if (totalItems > 200) {
    recommendations.push('Large number of items in game - ensure they all serve a purpose');
  }

// Variable declaration
  const roomsWithItems = roomValidations.filter(r => {
// Variable declaration
    const room = rooms[r.roomId];
    return room && room.items && room.items.length > 0;
  }).length;
// Variable declaration
  const totalRooms = Object.keys(rooms).length;
// Variable declaration
  const itemCoverage = roomsWithItems / totalRooms;

  if (itemCoverage < 0.3) {
    recommendations.push('Less than 30% of rooms have items - consider adding more interactive elements');
  } else if (itemCoverage > 0.8) {
    recommendations.push('More than 80% of rooms have items - ensure this doesn\'t overwhelm players');
  }

  return {
    overallValid: globalIssues.length === 0 && inventoryValidation.isValid && roomValidations.every(r => r.isValid),
    roomValidations,
    inventoryValidation,
    globalIssues,
    recommendations
  };
}



// --- Function: quickItemCheck ---
export function quickItemCheck(itemId: string, context: 'room' | 'inventory' | 'codex' = 'room'): string[] {
  const issues: string[] = [];

  if (!itemId) {
    issues.push('Item ID is empty or undefined');
    return issues;
  }

// Variable declaration
  const validation = validateItem(itemId);
  issues.push(...validation.errors);
  issues.push(...validation.warnings);

  switch (context) {
    case 'room':
      if (itemId.includes(' ')) {
        issues.push('Room item IDs should not contain spaces - use underscores or hyphens');
      }
      break;
    case 'inventory':
      if (itemId.length > 30) {
        issues.push('Inventory item names should be concise for UI display');
      }
      break;
    case 'codex':
      if (!/^[a-zA-Z]/.test(itemId)) {
        issues.push('Codex entries should start with a letter for better organization');
      }
      break;
  }

  return issues;
}



// --- Function: autoFixInventory ---
export function autoFixInventory(inventory: string[]): {
  fixedInventory: string[];
  changesApplied: string[];
} {
  const changesApplied: string[] = [];
  const fixedInventory: string[] = [];
// Variable declaration
  const seen = new Set<string>();

  for (const item of inventory) {
    if (!item || typeof item !== 'string') {
      changesApplied.push(`Removed invalid item: ${item}`);
      continue;
    }

// Variable declaration
    const trimmedItem = item.trim();
    if (trimmedItem !== item) {
      changesApplied.push(`Trimmed whitespace from: "${item}" -> "${trimmedItem}"`);
    }

    if (seen.has(trimmedItem)) {
      changesApplied.push(`Removed duplicate item: ${trimmedItem}`);
      continue;
    }

    seen.add(trimmedItem);
    fixedInventory.push(trimmedItem);
  }

  return { fixedInventory, changesApplied };
}
