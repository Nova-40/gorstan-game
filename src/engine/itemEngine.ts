import { Room } from './RoomTypes';



// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: itemEngine.ts
// Path: src/engine/itemEngine.ts
//
// itemEngine utility for Gorstan game.
// Provides functions to seed items into rooms using the full item registry.
// Ensures no duplicate items are added to a room's inventory.

/**
 * Enhanced type definitions for item engine
 */
export interface RoomData {
  id: string;
  name: string;
  description: string;
  items: string[];
  exits: Exit[];
  npcs: string[];
  actions: string[];
  flags: string[];
  music?: string;
  specialEffects?: string[];
  itemSpawnRules?: ItemSpawnRule[];
}

export interface Exit {
  direction: string;
  destination: string;
  condition?: string;
  hidden?: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  spawnChance: number;
  spawnRooms?: string[];
  excludeRooms?: string[];
  requiredFlags?: string[];
  conflictItems?: string[];
}

export interface ItemSpawnRule {
  itemId: string;
  chance: number;
  condition?: string;
  maxQuantity?: number;
  respawn?: boolean;
}

export interface SeedingContext {
  playerFlags?: Record<string, unknown>;
  gamePhase?: 'early' | 'mid' | 'late' | 'endgame';
  difficulty?: 'easy' | 'normal' | 'hard';
  seed?: number;
}

export interface SeedingResult {
  room: RoomData;
  itemsAdded: string[];
  itemsSkipped: string[];
  totalItems: number;
}

export type ItemCategory = 'tool' | 'consumable' | 'key' | 'document' | 'artifact' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

/**
 * Default item spawn configuration
 */

/**
 * Room-specific item spawn rules
 */
const ROOM_SPAWN_RULES: Record<string, ItemSpawnRule[]> = {
  library: [
    { itemId: 'constitution_scroll', chance: 0.8, condition: 'wendell_approval' },
    { itemId: 'ancient_tome', chance: 0.6 },
    { itemId: 'map', chance: 0.4 }
  ],

  kitchen: [
    { itemId: 'coffee', chance: 0.9, maxQuantity: 3 },
    { itemId: 'food', chance: 0.7 }
  ],

  storage: [
    { itemId: 'runbag', chance: 0.5 },
    { itemId: 'tools', chance: 0.6 }
  ],

  mysticalGrove: [
    { itemId: 'temporal_device', chance: 0.3, condition: 'grove_unlocked' },
    { itemId: 'crystal', chance: 0.4 }
  ],

  stantonharcourt: [
    { itemId: 'polly_gift', chance: 1.0, condition: 'polly_forgiveness' },
    { itemId: 'endgame_key', chance: 0.8, condition: 'readyForEndgame' }
  ]
};

/**
 * seedItemsInRooms
 * Seeds items into each room, ensuring no duplicates.
 * Uses generateRoomItems to determine which items to add.
 * Enhanced with proper TypeScript types and comprehensive logic.
 *
 * @param rooms - Array of room objects to seed with items
 * @param context - Optional seeding context for smart item placement
 * @returns New array of rooms with updated items arrays
 */
export function seedItemsInRooms(
  rooms: RoomData[],
  context?: SeedingContext
): SeedingResult[] {
  if (!Array.isArray(rooms)) {
    console.error('[ItemEngine] Invalid rooms array provided');
    return [];
  }

  try {
    return rooms.map(room => seedRoomItems(room, context));
  } catch (error) {
    console.error('[ItemEngine] Error seeding items in rooms:', error);
    return rooms.map(room => ({
      room,
      itemsAdded: [],
      itemsSkipped: [],
      totalItems: room.items?.length || 0
    }));
  }
}

/**
 * seedRoomItems
 * Seeds items for a single room with comprehensive logic
 *
 * @param room - Room to seed with items
 * @param context - Optional seeding context
 * @returns Seeding result for the room
 */
function seedRoomItems(room: RoomData, context?: SeedingContext): SeedingResult {
  try {
        const itemsToAdd: string[] = [];
    const itemsSkipped: string[] = [];

    // Generate new items for this room, avoiding duplicates

    for (const item of candidateItems) {
      // Check for duplicates (both string IDs and item objects)

      if (!isDuplicate) {
        itemsToAdd.push(item.id);
      } else {
        itemsSkipped.push(item.id);
      }
    }

    const updatedRoom: RoomData = {
      ...room,
      items: [...existingItems, ...itemsToAdd]
    };

    return {
      room: updatedRoom,
      itemsAdded: itemsToAdd,
      itemsSkipped,
      totalItems: updatedRoom.items.length
    };
  } catch (error) {
    console.error(`[ItemEngine] Error seeding room ${room.id}:`, error);
    return {
      room,
      itemsAdded: [],
      itemsSkipped: [],
      totalItems: room.items?.length || 0
    };
  }
}

/**
 * generateRoomItems
 * Randomly selects a number of items from the full item registry for a given room.
 * Ensures no duplicate items are selected for a single room.
 * Enhanced with context awareness and spawn rules.
 *
 * @param roomId - The unique ID of the room
 * @param context - Optional context for smart item generation
 * @returns Array of item objects selected for the room
 */
function generateRoomItems(roomId: string, context?: SeedingContext): ItemData[] {
  try {

    if (!Array.isArray(allItems) || allItems.length === 0) {
      console.warn('[ItemEngine] No items available from item registry');
      return [];
    }

    // Get room-specific spawn rules
        const selected: ItemData[] = [];

    // First, process room-specific rules
    for (const rule of roomRules) {
      if (shouldSpawnItem(rule, context)) {
                if (item && !selected.find(s => s.id === item.id)) {
          selected.push(item);
        }
      }
    }

    // Then, add random items based on spawn chances

    // Use deterministic random if seed is provided

    const attempts = Math.min(maxItems * 3, allItems.length); // Prevent infinite loops
    let attemptCount = 0;

    while (selected.length < maxItems && attemptCount < attempts) {
      attemptCount++;

      if (selected.find(s => s.id === randomItem.id)) {
        continue; // Skip duplicates
      }

      if (shouldSpawnRandomItem(randomItem, roomId, context)) {
        selected.push(randomItem);
      }
    }

    return selected;
  } catch (error) {
    console.error(`[ItemEngine] Error generating items for room ${roomId}:`, error);
    return [];
  }
}

/**
 * shouldSpawnItem
 * Determines if a specific item should spawn based on rules and context
 *
 * @param rule - Spawn rule to evaluate
 * @param context - Optional seeding context
 * @returns True if item should spawn
 */
function shouldSpawnItem(rule: ItemSpawnRule, context?: SeedingContext): boolean {
  try {
    // Check base chance
    if (Math.random() > rule.chance) {
      return false;
    }

    // Check conditions
    if (rule.condition && context?.playerFlags) {
            if (!hasCondition) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[ItemEngine] Error evaluating spawn rule:', error);
    return false;
  }
}

/**
 * shouldSpawnRandomItem
 * Determines if a random item should spawn in a room
 *
 * @param item - Item to evaluate
 * @param roomId - ID of the room
 * @param context - Optional seeding context
 * @returns True if item should spawn
 */
function shouldSpawnRandomItem(item: ItemData, roomId: string, context?: SeedingContext): boolean {
  try {
    // Check if item is explicitly excluded from this room
    if (item.excludeRooms?.includes(roomId)) {
      return false;
    }

    // Check if item is restricted to specific rooms
    if (item.spawnRooms && !item.spawnRooms.includes(roomId)) {
      return false;
    }

    // Check required flags
    if (item.requiredFlags && context?.playerFlags) {
            if (!hasAllFlags) {
        return false;
      }
    }

    // Calculate spawn chance based on rarity and base chance

    return Math.random() < finalChance;
  } catch (error) {
    console.error('[ItemEngine] Error evaluating random item spawn:', error);
    return false;
  }
}

/**
 * createSeededRandom
 * Creates a deterministic random number generator
 *
 * @param seed - Seed value
 * @returns Random function
 */
function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

/**
 * getItemsInRoom
 * Gets all items currently in a specific room
 *
 * @param roomId - ID of the room
 * @param rooms - Array of room data
 * @returns Array of item IDs in the room
 */
export function getItemsInRoom(roomId: string, rooms: RoomData[]): string[] {
  try {
        return room?.items || [];
  } catch (error) {
    console.error(`[ItemEngine] Error getting items in room ${roomId}:`, error);
    return [];
  }
}

/**
 * addItemToRoom
 * Adds an item to a specific room if not already present
 *
 * @param roomId - ID of the room
 * @param itemId - ID of the item to add
 * @param rooms - Array of room data
 * @returns Updated rooms array
 */
export function addItemToRoom(roomId: string, itemId: string, rooms: RoomData[]): RoomData[] {
  try {
    return rooms.map(room => {
      if (room.id === roomId) {
                if (!currentItems.includes(itemId)) {
          return {
            ...room,
            items: [...currentItems, itemId]
          };
        }
      }
      return room;
    });
  } catch (error) {
    console.error(`[ItemEngine] Error adding item ${itemId} to room ${roomId}:`, error);
    return rooms;
  }
}

/**
 * removeItemFromRoom
 * Removes an item from a specific room
 *
 * @param roomId - ID of the room
 * @param itemId - ID of the item to remove
 * @param rooms - Array of room data
 * @returns Updated rooms array
 */
export function removeItemFromRoom(roomId: string, itemId: string, rooms: RoomData[]): RoomData[] {
  try {
    return rooms.map(room => {
      if (room.id === roomId) {
                return {
          ...room,
          items: currentItems.filter(item => item !== itemId)
        };
      }
      return room;
    });
  } catch (error) {
    console.error(`[ItemEngine] Error removing item ${itemId} from room ${roomId}:`, error);
    return rooms;
  }
}

/**
 * validateRoomItems
 * Validates that all items in rooms exist in the item registry
 *
 * @param rooms - Array of room data to validate
 * @returns Validation report
 */
export function validateRoomItems(rooms: RoomData[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  try {
            const errors: string[] = [];
    const warnings: string[] = [];

    rooms.forEach(room => {
      room.items?.forEach(itemId => {
        if (!itemIds.has(itemId)) {
          errors.push(`Room ${room.id} contains unknown item: ${itemId}`);
        }
      });

      if ((room.items?.length || 0) > SPAWN_CONFIG.maxItemsPerRoom) {
        warnings.push(`Room ${room.id} has ${room.items?.length} items (max recommended: ${SPAWN_CONFIG.maxItemsPerRoom})`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('[ItemEngine] Error validating room items:', error);
    return {
      valid: false,
      errors: ['Validation failed due to system error'],
      warnings: []
    };
  }
}

/**
 * getSeedingStatistics
 * Gets statistics about item seeding across all rooms
 *
 * @param results - Array of seeding results
 * @returns Statistics object
 */
export function getSeedingStatistics(results: SeedingResult[]): {
  totalRooms: number;
  totalItemsAdded: number;
  totalItemsSkipped: number;
  averageItemsPerRoom: number;
  mostPopulatedRoom: string;
  leastPopulatedRoom: string;
} {
  try {

    return {
      totalRooms,
      totalItemsAdded,
      totalItemsSkipped,
      averageItemsPerRoom,
      mostPopulatedRoom,
      leastPopulatedRoom
    };
  } catch (error) {
    console.error('[ItemEngine] Error calculating seeding statistics:', error);
    return {
      totalRooms: 0,
      totalItemsAdded: 0,
      totalItemsSkipped: 0,
      averageItemsPerRoom: 0,
      mostPopulatedRoom: 'none',
      leastPopulatedRoom: 'none'
    };
  }
}

/**
 * Export utilities for external use
 */
export
export default ItemEngine;

// Exported as named exports for use in world/room setup logic.
// Enhanced with deterministic seeding, context awareness, and comprehensive item management.
