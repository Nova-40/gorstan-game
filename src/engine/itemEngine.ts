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
// Core game engine module.

import { Room } from '../types/Room';
import { getItemById, getAllItems, Item } from './items';














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

// Configuration constants
const SPAWN_CONFIG = {
  maxItemsPerRoom: 10,
  defaultMaxItems: 3,
  baseSpawnChance: 0.5,
};

const DEFAULT_ITEMS_CONFIG = {
  maxItems: SPAWN_CONFIG.defaultMaxItems,
  spawnChance: SPAWN_CONFIG.baseSpawnChance,
};




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



// --- Function: seedItemsInRooms ---
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



// --- Function: seedRoomItems ---
function seedRoomItems(room: RoomData, context?: SeedingContext): SeedingResult {
  try {
    const itemsToAdd: string[] = [];
    const itemsSkipped: string[] = [];

    // Get existing items for this room
    const existingItems = room.items || [];
    
    // Get candidate items for this room from spawn rules
    const roomRules = ROOM_SPAWN_RULES[room.id] || [];
    const candidateItems: ItemData[] = [];
    
    // Build candidate items from spawn rules
    for (const rule of roomRules) {
      const item = getItemById(rule.itemId);
      if (item && Math.random() < rule.chance) {
        candidateItems.push({
          id: item.id,
          name: item.name,
          description: item.description,
          category: (item.category as ItemCategory) || 'misc',
          rarity: (item.rarity as ItemRarity) || 'common',
          spawnChance: rule.chance,
          spawnRooms: item.spawnRooms,
          excludeRooms: item.excludeRooms,
          requiredFlags: item.requirements?.map(r => r.target).filter(Boolean) as string[] || [],
          conflictItems: item.conflictItems || []
        });
      }
    }

    for (const item of candidateItems) {
      // Check if item already exists in room
      const isDuplicate = existingItems.includes(item.id);

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



// --- Function: generateRoomItems ---
function generateRoomItems(roomId: string, context?: SeedingContext): ItemData[] {
  try {
    // Get all available items from the item registry
    const allItems = getAllItems();
    
    if (!Array.isArray(allItems) || allItems.length === 0) {
      console.warn('[ItemEngine] No items available from item registry');
      return [];
    }

    const selected: ItemData[] = [];
    const maxItems = DEFAULT_ITEMS_CONFIG.maxItems;
    
    // Get room-specific spawn rules
    const roomRules = ROOM_SPAWN_RULES[roomId] || [];
    
    // Process room-specific spawn rules first
    for (const rule of roomRules) {
      if (shouldSpawnItem(rule, context)) {
        const item = getItemById(rule.itemId);
        if (item && !selected.find(s => s.id === item.id)) {
          selected.push({
            id: item.id,
            name: item.name,
            description: item.description,
            category: (item.category as ItemCategory) || 'misc',
            rarity: (item.rarity as ItemRarity) || 'common',
            spawnChance: rule.chance,
            spawnRooms: item.spawnRooms,
            excludeRooms: item.excludeRooms,
            requiredFlags: item.requirements?.map(r => r.target).filter(Boolean) as string[] || [],
            conflictItems: item.conflictItems || []
          });
        }
      }
    }

    // Fill remaining slots with random items
    const attempts = Math.min(maxItems * 3, allItems.length); 
    let attemptCount = 0;

    while (selected.length < maxItems && attemptCount < attempts) {
      attemptCount++;
      
      // Get a random item from the registry
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      const itemData: ItemData = {
        id: randomItem.id,
        name: randomItem.name,
        description: randomItem.description,
        category: (randomItem.category as ItemCategory) || 'misc',
        rarity: (randomItem.rarity as ItemRarity) || 'common',
        spawnChance: randomItem.spawnChance || SPAWN_CONFIG.baseSpawnChance,
        spawnRooms: randomItem.spawnRooms,
        excludeRooms: randomItem.excludeRooms,
        requiredFlags: randomItem.requirements?.map(r => r.target).filter(Boolean) as string[] || [],
        conflictItems: randomItem.conflictItems || []
      };

      if (selected.find(s => s.id === itemData.id)) {
        continue; 
      }

      if (shouldSpawnRandomItem(itemData, roomId, context)) {
        selected.push(itemData);
      }
    }

    return selected;
  } catch (error) {
    console.error(`[ItemEngine] Error generating items for room ${roomId}:`, error);
    return [];
  }
}



// --- Function: shouldSpawnItem ---
function shouldSpawnItem(rule: ItemSpawnRule, context?: SeedingContext): boolean {
  try {
    
    if (Math.random() > rule.chance) {
      return false;
    }

    // Check spawn rule condition
    if (rule.condition && context?.playerFlags) {
      const hasCondition = Boolean(context.playerFlags[rule.condition]);
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



// --- Function: shouldSpawnRandomItem ---
function shouldSpawnRandomItem(item: ItemData, roomId: string, context?: SeedingContext): boolean {
  try {
    
    if (item.excludeRooms?.includes(roomId)) {
      return false;
    }

    
    if (item.spawnRooms && !item.spawnRooms.includes(roomId)) {
      return false;
    }

    // Check required flags
    if (item.requiredFlags && context?.playerFlags) {
      const hasAllFlags = item.requiredFlags.every(flag => Boolean(context.playerFlags![flag]));
      if (!hasAllFlags) {
        return false;
      }
    }

    // Calculate final spawn chance
    const finalChance = item.spawnChance || SPAWN_CONFIG.baseSpawnChance;
    return Math.random() < finalChance;
  } catch (error) {
    console.error('[ItemEngine] Error evaluating random item spawn:', error);
    return false;
  }
}



// --- Function: createSeededRandom ---
function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
// JSX return block or main return
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}



// --- Function: getItemsInRoom ---
export function getItemsInRoom(roomId: string, rooms: RoomData[]): string[] {
  try {
    const room = rooms.find(r => r.id === roomId);
    return room?.items || [];
  } catch (error) {
    console.error(`[ItemEngine] Error getting items in room ${roomId}:`, error);
    return [];
  }
}



// --- Function: addItemToRoom ---
export function addItemToRoom(roomId: string, itemId: string, rooms: RoomData[]): RoomData[] {
  try {
    return rooms.map(room => {
      if (room.id === roomId) {
        const currentItems = room.items || [];
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



// --- Function: removeItemFromRoom ---
export function removeItemFromRoom(roomId: string, itemId: string, rooms: RoomData[]): RoomData[] {
  try {
    return rooms.map(room => {
      if (room.id === roomId) {
        const currentItems = room.items || [];
        return {
          ...room,
          items: currentItems.filter((item: string) => item !== itemId)
        };
      }
      return room;
    });
  } catch (error) {
    console.error(`[ItemEngine] Error removing item ${itemId} from room ${roomId}:`, error);
    return rooms;
  }
}



// --- Function: validateRoomItems ---
export function validateRoomItems(rooms: RoomData[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  try {
    // Build a set of valid item IDs from the item registry
    const allItems = getAllItems();
    const itemIds = new Set(allItems.map(item => item.id));
    
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



// --- Function: getSeedingStatistics ---
export function getSeedingStatistics(results: SeedingResult[]): {
  totalRooms: number;
  totalItemsAdded: number;
  totalItemsSkipped: number;
  averageItemsPerRoom: number;
  mostPopulatedRoom: string;
  leastPopulatedRoom: string;
} {
  try {
    const totalRooms = results.length;
    const totalItemsAdded = results.reduce((sum, result) => sum + result.itemsAdded.length, 0);
    const totalItemsSkipped = results.reduce((sum, result) => sum + result.itemsSkipped.length, 0);
    const averageItemsPerRoom = totalRooms > 0 ? totalItemsAdded / totalRooms : 0;
    
    let mostPopulatedRoom = '';
    let leastPopulatedRoom = '';
    let maxItems = -1;
    let minItems = Infinity;
    
    results.forEach(result => {
      if (result.totalItems > maxItems) {
        maxItems = result.totalItems;
        mostPopulatedRoom = result.room.id;
      }
      if (result.totalItems < minItems) {
        minItems = result.totalItems;
        leastPopulatedRoom = result.room.id;
      }
    });

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

// Export object with available functions
const ItemEngine = {
  seedRoomItems,
  generateRoomItems,
  shouldSpawnItem,
  shouldSpawnRandomItem,
  getItemsInRoom,
  addItemToRoom,
  removeItemFromRoom,
  validateRoomItems,
  getSeedingStatistics,
  seedItemsInRooms
};

export default ItemEngine;
