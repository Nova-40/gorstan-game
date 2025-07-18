// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: inventory.ts
// Path: src/engine/inventory.ts
//
// inventory utility for Gorstan game.
// Provides functions to manage the player's inventory state in memory.
// Not persisted across reloads; only for the current session.

/**
 * Enhanced type definitions for inventory system
 */
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category?: ItemCategory;
  stackable?: boolean;
  quantity?: number;
  weight?: number;
  value?: number;
  rarity?: ItemRarity;
  effects?: ItemEffect[];
  metadata?: Record<string, unknown>;
}

export interface ItemEffect {
  type: 'heal' | 'boost' | 'unlock' | 'transform' | 'quest' | 'special';
  value?: number;
  duration?: number;
  description?: string;
}

export interface InventoryState {
  items: InventoryItem[];
  capacity: number;
  weight: number;
  maxWeight: number;
  categories: Record<ItemCategory, number>;
}

export interface InventoryOperation {
  type: 'add' | 'remove' | 'use' | 'move' | 'stack';
  item: string | InventoryItem;
  quantity?: number;
  target?: string;
  success: boolean;
  message?: string;
}

export interface InventoryContext {
  flags: Record<string, unknown>;
  traits: string[];
  room: string;
  allowOverflow?: boolean;
}

export type ItemCategory = 'tool' | 'consumable' | 'key' | 'document' | 'artifact' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

/**
 * Module-scoped array to hold the player's inventory items.
 * Not persisted between sessions.
 * Enhanced with comprehensive item data.
 */
let inventory: InventoryItem[] = [];

/**
 * Item database for converting string IDs to full item objects
 */
const ITEM_DATABASE: Record<string, Omit<InventoryItem, 'id'>> = {
  coffee: {
    name: 'Coffee',
    description: 'A steaming cup of coffee. Provides energy and alertness.',
    category: 'consumable',
    stackable: true,
    weight: 0.5,
    value: 5,
    rarity: 'common',
    effects: [
      { type: 'boost', value: 1, duration: 300000, description: 'Increased alertness' }
    ]
  },
  
  runbag: {
    name: 'Run Bag',
    description: 'A practical bag that increases your carrying capacity.',
    category: 'tool',
    stackable: false,
    weight: 2,
    value: 50,
    rarity: 'uncommon',
    effects: [
      { type: 'special', description: 'Increases inventory capacity' }
    ]
  },
  
  key: {
    name: 'Ancient Key',
    description: 'An ornate key that pulses with mysterious energy.',
    category: 'key',
    stackable: false,
    weight: 0.2,
    value: 100,
    rarity: 'rare',
    effects: [
      { type: 'unlock', description: 'Opens locked passages' }
    ]
  },
  
  map: {
    name: 'Detailed Map',
    description: 'A map of the local area with cryptic markings.',
    category: 'document',
    stackable: false,
    weight: 0.1,
    value: 25,
    rarity: 'common'
  },
  
  constitution_scroll: {
    name: 'Constitution Scroll',
    description: 'An ancient document containing fundamental truths.',
    category: 'document',
    stackable: false,
    weight: 0.3,
    value: 500,
    rarity: 'legendary',
    effects: [
      { type: 'quest', description: 'Reveals cosmic truths' }
    ]
  },
  
  polly_gift: {
    name: 'Polly\'s Gift',
    description: 'A small token of forgiveness and friendship.',
    category: 'artifact',
    stackable: false,
    weight: 0.1,
    value: 1000,
    rarity: 'unique',
    effects: [
      { type: 'special', description: 'Symbol of redemption' }
    ]
  },
  
  temporal_device: {
    name: 'Temporal Device',
    description: 'A device that seems to exist in multiple timelines simultaneously.',
    category: 'artifact',
    stackable: false,
    weight: 1.5,
    value: 2000,
    rarity: 'legendary',
    effects: [
      { type: 'special', description: 'Manipulates time flow' }
    ]
  }
};

/**
 * addItem
 * Adds an item to the inventory if it is not already present.
 * Enhanced with capacity checking, item data, and validation.
 *
 * @param item - The item to add (string ID or InventoryItem)
 * @param context - Optional context for capacity calculation
 * @param quantity - Quantity to add (for stackable items)
 * @returns InventoryOperation result
 */
export function addItem(
  item: string | InventoryItem, 
  context?: InventoryContext,
  quantity: number = 1
): InventoryOperation {
  try {
    // Convert string to InventoryItem if needed
        
    if (!itemObj) {
      return {
        type: 'add',
        item,
        success: false,
        message: `Unknown item: ${typeof item === 'string' ? item : item.id}`
      };
    }

    // Check capacity
    if (!context?.allowOverflow) {
            
      if (inventory.length >= capacity && !canStackItem(itemObj.id)) {
        return {
          type: 'add',
          item: itemObj,
          success: false,
          message: `Inventory full! (${inventory.length}/${capacity})`
        };
      }
    }

    // Handle stackable items
    if (itemObj.stackable) {
            if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
        return {
          type: 'add',
          item: itemObj,
          quantity,
          success: true,
          message: `Added ${quantity}x ${itemObj.name} (total: ${existingItem.quantity})`
        };
      }
    }

    // Add new item
    const newItem: InventoryItem = {
      ...itemObj,
      quantity: itemObj.stackable ? quantity : 1
    };

    // Check for duplicates (non-stackable items)
    if (!itemObj.stackable && inventory.some(i => i.id === itemObj.id)) {
      return {
        type: 'add',
        item: itemObj,
        success: false,
        message: `You already have ${itemObj.name}`
      };
    }

    inventory.push(newItem);
    
    return {
      type: 'add',
      item: newItem,
      quantity,
      success: true,
      message: `Added ${itemObj.name} to inventory`
    };
    
  } catch (error) {
    console.error('[Inventory] Error adding item:', error);
    return {
      type: 'add',
      item,
      success: false,
      message: 'Error adding item to inventory'
    };
  }
}

/**
 * hasItem
 * Checks if the inventory contains a specific item.
 * Enhanced with quantity checking for stackable items.
 *
 * @param item - The item to check
 * @param minQuantity - Minimum quantity required (for stackable items)
 * @returns boolean
 */
export function hasItem(item: string, minQuantity: number = 1): boolean {
  try {
        if (!inventoryItem) return false;
    
        return quantity >= minQuantity;
  } catch (error) {
    console.error('[Inventory] Error checking item:', error);
    return false;
  }
}

/**
 * getInventory
 * Returns a shallow copy of the current inventory array.
 * Enhanced with optional filtering and sorting.
 *
 * @param category - Optional category filter
 * @param sortBy - Optional sort criteria
 * @returns Array of InventoryItems
 */
export function getInventory(
  category?: ItemCategory,
  sortBy?: 'name' | 'category' | 'rarity' | 'value' | 'weight'
): InventoryItem[] {
  try {
    let result = [...inventory];
    
    // Filter by category
    if (category) {
      result = result.filter(item => item.category === category);
    }
    
    // Sort by criteria
    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
            return (a.category || 'misc').localeCompare(b.category || 'misc');
          case 'rarity':
                        return rarityOrder.indexOf(a.rarity || 'common') - rarityOrder.indexOf(b.rarity || 'common');
          case 'value':
            return (b.value || 0) - (a.value || 0);
          case 'weight':
            return (a.weight || 0) - (b.weight || 0);
          default:
            return 0;
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('[Inventory] Error getting inventory:', error);
    return [];
  }
}

/**
 * removeItem
 * Removes a specific item from the inventory.
 * Enhanced with quantity handling for stackable items.
 *
 * @param item - The item to remove
 * @param quantity - Quantity to remove (for stackable items)
 * @returns InventoryOperation result
 */
export function removeItem(item: string, quantity: number = 1): InventoryOperation {
  try {
        
    if (itemIndex === -1) {
      return {
        type: 'remove',
        item,
        success: false,
        message: `You don't have ${item}`
      };
    }

    if (inventoryItem.stackable && (inventoryItem.quantity || 1) > quantity) {
      // Reduce quantity
      inventoryItem.quantity = (inventoryItem.quantity || 1) - quantity;
      return {
        type: 'remove',
        item: inventoryItem,
        quantity,
        success: true,
        message: `Removed ${quantity}x ${inventoryItem.name} (${inventoryItem.quantity} remaining)`
      };
    } else {
      // Remove entire item
      inventory.splice(itemIndex, 1);
      return {
        type: 'remove',
        item: inventoryItem,
        quantity: inventoryItem.quantity || 1,
        success: true,
        message: `Removed ${inventoryItem.name} from inventory`
      };
    }
  } catch (error) {
    console.error('[Inventory] Error removing item:', error);
    return {
      type: 'remove',
      item,
      success: false,
      message: 'Error removing item from inventory'
    };
  }
}

/**
 * clearInventory
 * Clears all items from the inventory.
 * Enhanced with optional category filtering.
 *
 * @param category - Optional category to clear (clears all if not specified)
 */
export function clearInventory(category?: ItemCategory): void {
  try {
    if (category) {
      inventory = inventory.filter(item => item.category !== category);
    } else {
      inventory = [];
    }
  } catch (error) {
    console.error('[Inventory] Error clearing inventory:', error);
  }
}

/**
 * useItem
 * Uses an item from inventory, applying its effects
 *
 * @param itemId - ID of item to use
 * @param context - Game context for effect application
 * @returns InventoryOperation result
 */
export function useItem(itemId: string, context?: InventoryContext): InventoryOperation {
  try {
        
    if (!item) {
      return {
        type: 'use',
        item: itemId,
        success: false,
        message: `You don't have ${itemId}`
      };
    }

    // Apply item effects
        
    // Remove consumable items after use
    if (item.category === 'consumable') {
            if (!removeResult.success) {
        return removeResult;
      }
    }

    return {
      type: 'use',
      item,
      success: true,
      message: `Used ${item.name}${effectMessages ? `: ${effectMessages}` : ''}`
    };
  } catch (error) {
    console.error('[Inventory] Error using item:', error);
    return {
      type: 'use',
      item: itemId,
      success: false,
      message: 'Error using item'
    };
  }
}

/**
 * getInventoryState
 * Returns comprehensive inventory state information
 *
 * @param context - Context for capacity calculation
 * @returns InventoryState object
 */
export function getInventoryState(context?: InventoryContext): InventoryState {
  try {

          counts[category] = (counts[category] || 0) + (item.quantity || 1);
      return counts;
    }, {} as Record<ItemCategory, number>);

    return {
      items: [...inventory],
      capacity,
      weight,
      maxWeight: 100, // Base max weight, could be modified by traits/items
      categories
    };
  } catch (error) {
    console.error('[Inventory] Error getting inventory state:', error);
    return {
      items: [],
      capacity: 5,
      weight: 0,
      maxWeight: 100,
      categories: {} as Record<ItemCategory, number>
    };
  }
}

/**
 * findItems
 * Find items by various criteria
 *
 * @param criteria - Search criteria
 * @returns Array of matching items
 */
export function findItems(criteria: {
  name?: string;
  category?: ItemCategory;
  rarity?: ItemRarity;
  hasEffect?: string;
  minValue?: number;
  maxWeight?: number;
}): InventoryItem[] {
  try {
    return inventory.filter(item => {
      if (criteria.name && !item.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      if (criteria.category && item.category !== criteria.category) {
        return false;
      }
      if (criteria.rarity && item.rarity !== criteria.rarity) {
        return false;
      }
      if (criteria.hasEffect && !item.effects?.some(e => e.type === criteria.hasEffect)) {
        return false;
      }
      if (criteria.minValue && (item.value || 0) < criteria.minValue) {
        return false;
      }
      if (criteria.maxWeight && (item.weight || 0) > criteria.maxWeight) {
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error('[Inventory] Error finding items:', error);
    return [];
  }
}

/**
 * getItemValue
 * Calculate total value of inventory or specific items
 *
 * @param itemIds - Optional array of specific item IDs to value
 * @returns Total value
 */
export function getItemValue(itemIds?: string[]): number {
  try {
          
    return items.reduce((total, item) => 
      total + ((item.value || 0) * (item.quantity || 1)), 0
    );
  } catch (error) {
    console.error('[Inventory] Error calculating item value:', error);
    return 0;
  }
}

// Helper functions
function createItemFromId(itemId: string): InventoryItem | null {
    if (!itemData) return null;
  
  return {
    id: itemId,
    ...itemData
  };
}

function canStackItem(itemId: string): boolean {
    return Boolean(existingItem?.stackable);
}

function applyItemEffect(effect: ItemEffect, context?: InventoryContext): string | null {
  // This would integrate with your game's effect system
  // For now, return a description of what happened
  switch (effect.type) {
    case 'heal':
      return `Restored ${effect.value} health`;
    case 'boost':
      return `${effect.description} for ${effect.duration}ms`;
    case 'unlock':
      return 'New areas may be accessible';
    default:
      return effect.description || null;
  }
}

/**
 * Legacy function support - convert string array to item array
 */
export function setInventoryFromStringArray(items: string[]): void {
  try {
    inventory = [];
    items.forEach(itemId => {
            if (!result.success) {
        console.warn(`[Inventory] Failed to add legacy item: ${itemId}`);
      }
    });
  } catch (error) {
    console.error('[Inventory] Error setting inventory from string array:', error);
  }
}

/**
 * Legacy function support - get inventory as string array
 */
export function getInventoryAsStringArray(): string[] {
  try {
    return inventory.map(item => item.id);
  } catch (error) {
    console.error('[Inventory] Error getting inventory as string array:', error);
    return [];
  }
}

/**
 * Export utilities for external use
 */
export 
export default InventoryEngine;

// All functions are exported as named exports for use in game logic and UI.
// Enhanced with comprehensive item management, capacity integration, and TypeScript compliance.
