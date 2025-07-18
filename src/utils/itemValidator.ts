// Filename: itemValidator.ts
// Location: utils/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import type { Room } from '../types/Room';
import type { Player } from '../types/GameTypes';

/**
 * Item validation result interface
 */
export interface ItemValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Room item consistency check result
 */
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

/**
 * Player inventory validation result
 */
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

/**
 * Validates a single item entry
 */
export function validateItem(itemId: string, itemName?: string): ItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check item ID format
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

  // Check item name if provided
  if (itemName && typeof itemName !== 'string') {
    errors.push('Item name must be a string if provided');
  } else if (itemName && itemName.length < 2) {
    warnings.push('Item name is very short - players may not understand what it is');
  }

  // Provide suggestions
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

/**
 * Validates all items in a room for consistency and correctness
 */
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

  const seenItemIds = new Set<string>();
  const seenItemNames = new Set<string>();

  for (const item of room.items) {
    // Check for duplicate IDs
    if (seenItemIds.has(item.id)) {
      duplicateItems.push(item.id);
    } else {
      seenItemIds.add(item.id);
    }

    // Check for duplicate names
    if (item.name && seenItemNames.has(item.name)) {
      duplicateItems.push(item.name);
    } else if (item.name) {
      seenItemNames.add(item.name);
    }

    // Validate individual item
    const validation = validateItem(item.id, item.name);
    if (!validation.isValid) {
      invalidItemIds.push(item.id);
    }

    // Check for missing descriptions on important items
    if (!item.description && (item.isKey || item.cursed)) {
      missingDescriptions.push(item.id);
    }

    // Check for conflicting flags
    if (item.isKey && item.cursed) {
      conflictingFlags.push(`${item.id}: Key items should generally not be cursed`);
    }

    if (item.oneTimeUse && item.isKey) {
      conflictingFlags.push(`${item.id}: Key items should generally not be one-time use`);
    }
  }

  // Generate recommendations
  if (room.items.length > 10) {
    recommendations.push('Room has many items - consider if this enhances or clutters gameplay');
  }

  const keyItems = room.items.filter(item => item.isKey);
  if (keyItems.length > 3) {
    recommendations.push('Room has many key items - ensure puzzle logic is clear to players');
  }

  const cursedItems = room.items.filter(item => item.cursed);
  if (cursedItems.length > 1) {
    recommendations.push('Multiple cursed items in one room - consider player frustration levels');
  }

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

/**
 * Validates and cleans player inventory
 */
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

  const seenItems = new Set<string>();

  for (const item of player.inventory) {
    // Check for invalid item names
    if (!item || typeof item !== 'string') {
      invalidItemNames.push(String(item));
      continue;
    }

    // Check for duplicates
    if (seenItems.has(item)) {
      duplicateItems.push(item);
      continue; // Skip adding to cleaned inventory
    }

    seenItems.add(item);

    // Check against known items list if provided
    if (knownItems && !knownItems.includes(item)) {
      unknownItems.push(item);
    }

    // Add to cleaned inventory
    cleanedInventory.push(item);
  }

  // Generate suggestions
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

/**
 * Comprehensive validation suite for all game items
 */
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

  // Collect all known items from rooms
  const allKnownItems = new Set<string>();
  
  // Validate each room
  for (const [roomId, room] of Object.entries(rooms)) {
    try {
      const roomValidation = validateRoomItems(room);
      roomValidations.push(roomValidation);

      // Collect item IDs for global validation
      if (room.items) {
        for (const item of room.items) {
          allKnownItems.add(item.id);
          if (item.name) {
            allKnownItems.add(item.name);
          }
        }
      }
    } catch (error) {
      globalIssues.push(`Failed to validate room ${roomId}: ${error}`);
    }
  }

  // Validate player inventory
  const inventoryValidation = validatePlayerInventory(player, Array.from(allKnownItems));

  // Check for global issues
  const totalItems = Array.from(allKnownItems).length;
  if (totalItems === 0) {
    globalIssues.push('No items found in any room - game may lack interactive elements');
  }

  const invalidRooms = roomValidations.filter(r => !r.isValid).length;
  if (invalidRooms > 0) {
    globalIssues.push(`${invalidRooms} rooms have item validation issues`);
  }

  // Generate global recommendations
  if (totalItems > 200) {
    recommendations.push('Large number of items in game - ensure they all serve a purpose');
  }

  const roomsWithItems = roomValidations.filter(r => {
    const room = rooms[r.roomId];
    return room && room.items && room.items.length > 0;
  }).length;
  const totalRooms = Object.keys(rooms).length;
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

/**
 * Quick item checker for development use
 */
export function quickItemCheck(itemId: string, context: 'room' | 'inventory' | 'codex' = 'room'): string[] {
  const issues: string[] = [];

  if (!itemId) {
    issues.push('Item ID is empty or undefined');
    return issues;
  }

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

/**
 * Auto-fix common item issues
 */
export function autoFixInventory(inventory: string[]): {
  fixedInventory: string[];
  changesApplied: string[];
} {
  const changesApplied: string[] = [];
  const fixedInventory: string[] = [];
  const seen = new Set<string>();

  for (const item of inventory) {
    if (!item || typeof item !== 'string') {
      changesApplied.push(`Removed invalid item: ${item}`);
      continue;
    }

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
