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

import { ITEMS } from './items';

// Function for getting item definition from actual item registry
function getItemDefinition(itemId: string): InventoryItem | null {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) {
    console.warn(`[Inventory] Item not found in registry: ${itemId}`);
    return null;
  }
  
  // Map item categories from items.ts to inventory categories
  const categoryMap: Record<string, ItemCategory> = {
    'functional': 'tool',
    'valuable': 'artifact', 
    'consumable': 'consumable',
    'key': 'key',
    'document': 'document',
    'misc': 'misc'
  };
  
  const rarityMap: Record<string, ItemRarity> = {
    'common': 'common',
    'uncommon': 'uncommon', 
    'rare': 'rare',
    'epic': 'epic',
    'legendary': 'legendary'
  };
  
  return {
    id: item.id,
    name: item.name,
    stackable: item.stackable ?? true,
    category: categoryMap[item.category || 'misc'] || 'misc',
    rarity: rarityMap[item.rarity || 'common'] || 'common'
  };
}

// Function for getting category from item registry
function getCategoryForItem(itemId: string): ItemCategory {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) {
    return 'misc';
  }
  
  // Map item categories from items.ts to inventory categories
  const categoryMap: Record<string, ItemCategory> = {
    'functional': 'tool',
    'valuable': 'artifact',
    'consumable': 'consumable', 
    'key': 'key',
    'document': 'document',
    'misc': 'misc'
  };
  
  return categoryMap[item.category || 'misc'] || 'misc';
}

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
  inventory?: InventoryItem[];
  capacity?: number;
  flags: Record<string, unknown>;
  traits: string[];
  room: string;
  allowOverflow?: boolean;
}

export type ItemCategory = 'tool' | 'consumable' | 'key' | 'document' | 'artifact' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';


let inventory: InventoryItem[] = [];


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



// --- Function: addItem ---
export function addItem(
  item: string | InventoryItem,
  context?: InventoryContext,
  quantity: number = 1
): InventoryOperation {
  try {
    const inventory = context?.inventory || [];
    const capacity = context?.capacity || 10;
    
    // Get item object
    const itemObj = typeof item === 'string' ? getItemDefinition(item) : item;

    if (!itemObj) {
      return {
        type: 'add',
        item,
        success: false,
        message: `Unknown item: ${typeof item === 'string' ? item : item.id}`
      };
    }

    // Check capacity constraints
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
      const existingItem = inventory.find((invItem: InventoryItem) => invItem.id === itemObj.id);
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

    
    const newItem: InventoryItem = {
      ...itemObj,
      quantity: itemObj.stackable ? quantity : 1
    };

    
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



// --- Function: hasItem ---
export function hasItem(item: string, minQuantity: number = 1): boolean {
  try {
    const inventoryItem = inventory.find((invItem: InventoryItem) => invItem.id === item);
    if (!inventoryItem) return false;

    const quantity = inventoryItem.quantity || 1;
    return quantity >= minQuantity;
  } catch (error) {
    console.error('[Inventory] Error checking item:', error);
    return false;
  }
}



// --- Function: getInventory ---
export function getInventory(
  category?: ItemCategory,
  sortBy?: 'name' | 'category' | 'rarity' | 'value' | 'weight'
): InventoryItem[] {
  try {
    let result = [...inventory];

    
    if (category) {
      result = result.filter(item => item.category === category);
    }

    
    if (sortBy) {
      result.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'category':
// JSX return block or main return
            return (a.category || 'misc').localeCompare(b.category || 'misc');
          case 'rarity':
            const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'];
            return rarityOrder.indexOf(a.rarity || 'common') - rarityOrder.indexOf(b.rarity || 'common');
          case 'value':
// JSX return block or main return
            return (b.value || 0) - (a.value || 0);
          case 'weight':
// JSX return block or main return
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



// --- Function: removeItem ---
export function removeItem(item: string, quantity: number = 1): InventoryOperation {
  try {
    const itemIndex = inventory.findIndex((invItem: InventoryItem) => invItem.id === item);
    if (itemIndex === -1) {
      return {
        type: 'remove',
        item,
        success: false,
        message: `You don't have ${item}`
      };
    }

    const inventoryItem = inventory[itemIndex];
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
      // Remove item completely
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



// --- Function: clearInventory ---
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



// --- Function: useItem ---
export function useItem(itemId: string, context?: InventoryContext): InventoryOperation {
  try {
    const item = inventory.find((invItem: InventoryItem) => invItem.id === itemId);
    if (!item) {
      return {
        type: 'use',
        item: itemId,
        success: false,
        message: `You don't have ${itemId}`
      };
    }

    // Apply item effects
    let effectMessages = '';
    if (item.effects && item.effects.length > 0) {
      // Process each effect on the item
      const processedEffects = item.effects.map(effect => {
        switch (effect.type) {
          case 'heal':
            return `You feel refreshed (+${effect.value || 10} health)`;
          case 'boost':
            return `You feel empowered! (+${effect.value || 5} boost for ${effect.duration || 30}s)`;
          case 'unlock':
            return `You unlock something new!`;
          case 'transform':
            return `The ${itemId} transforms into something else!`;
          case 'quest':
            return `Quest progress updated`;
          case 'special':
            return effect.description || 'Something magical happens!';
          default:
            return effect.description || 'You use the item';
        }
      });
      effectMessages = processedEffects.join(', ');
    } else {
      effectMessages = 'You use the item';
    }

    // Remove consumable items after use
    if (item.category === 'consumable') {
      const removeResult = removeItem(itemId, 1);
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



// --- Function: getInventoryState ---
export function getInventoryState(context?: InventoryContext): InventoryState {
  try {
    const inventory = context?.inventory || [];
    const capacity = context?.capacity || 10;
    const weight = inventory.reduce((total, item) => total + (item.weight || 1) * (item.quantity || 1), 0);
    
    const categories = inventory.reduce((counts, item) => {
      const category = getCategoryForItem(item.id);
      if (category) {
        counts[category] = (counts[category] || 0) + (item.quantity || 1);
      }
      return counts;
    }, {} as Record<ItemCategory, number>);

    return {
      items: [...inventory],
      capacity,
      weight,
      maxWeight: 100, 
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



// --- Function: findItems ---
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



// --- Function: getItemValue ---
export function getItemValue(itemIds?: string[]): number {
  try {
    const items = itemIds ? inventory.filter(item => itemIds.includes(item.id)) : inventory;
    return items.reduce((total: number, item: InventoryItem) =>
      total + ((item.value || 0) * (item.quantity || 1)), 0
    );
  } catch (error) {
    console.error('[Inventory] Error calculating item value:', error);
    return 0;
  }
}



// --- Function: createItemFromId ---
function createItemFromId(itemId: string): InventoryItem | null {
  const itemData = getItemDefinition(itemId);
  if (!itemData) return null;

  return {
    ...itemData,
    id: itemId
  };
}


// --- Function: canStackItem ---
function canStackItem(itemId: string): boolean {
  const existingItem = inventory.find(item => item.id === itemId);
  return Boolean(existingItem?.stackable);
}


// --- Function: applyItemEffect ---
function applyItemEffect(effect: ItemEffect, context?: InventoryContext): string | null {
  
  
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



// --- Function: setInventoryFromStringArray ---
export function setInventoryFromStringArray(items: string[]): void {
  try {
    inventory = [];
    items.forEach(itemId => {
      const result = addItem(itemId);
      if (!result.success) {
        console.warn(`[Inventory] Failed to add legacy item: ${itemId}`);
      }
    });
  } catch (error) {
    console.error('[Inventory] Error setting inventory from string array:', error);
  }
}



// --- Function: getInventoryAsStringArray ---
export function getInventoryAsStringArray(): string[] {
  try {
    return inventory.map(item => item.id);
  } catch (error) {
    console.error('[Inventory] Error getting inventory as string array:', error);
    return [];
  }
}

// Create InventoryEngine object containing all functions
const InventoryEngine = {
  addItem,
  removeItem,
  hasItem,
  useItem,
  clearInventory,
  getInventory,
  getItemValue,
  setInventoryFromStringArray,
  createItemFromId,
  canStackItem,
  applyItemEffect
};

export default InventoryEngine;
