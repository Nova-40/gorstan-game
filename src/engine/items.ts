// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: items.ts
// Path: src/engine/items.ts
//
// items utility for Gorstan game.
// Full item registry for all portable, quest, and easter egg items in the game.
// Provides functions to retrieve items by ID or get the full item list.

/**
 * Type definitions for item system
 */
export interface Item {
  id: string;
  name: string;
  description: string;
  traits: string[];
  portable: boolean;
  readable?: boolean;
  content?: string;
  category?: ItemCategory;
  rarity?: ItemRarity;
  effects?: ItemEffect[];
  requirements?: ItemRequirement[];
  stackable?: boolean;
  maxStack?: number;
  value?: number;
  weight?: number;
  usable?: boolean;
  consumable?: boolean;
  throwable?: boolean;
  durability?: number;
  maxDurability?: number;
  spawnChance?: number;
  spawnRooms?: string[];
  excludeRooms?: string[];
  transformInto?: string;
  conflictItems?: string[];
}

export type ItemCategory = 
  | 'functional' 
  | 'valuable' 
  | 'junk' 
  | 'puzzle' 
  | 'quest' 
  | 'easteregg' 
  | 'knowledge' 
  | 'healing' 
  | 'access'
  | 'tool'
  | 'consumable'
  | 'key'
  | 'document'
  | 'artifact'
  | 'pet'
  | 'misc';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

export interface ItemEffect {
  type: 'health' | 'flag' | 'trait' | 'inventory' | 'score' | 'message' | 'transform' | 'unlock' | 'boost';
  value?: number | string | boolean;
  target?: string;
  duration?: number;
  intensity?: number;
  description?: string;
}

export interface ItemRequirement {
  type: 'trait' | 'flag' | 'item' | 'health' | 'room' | 'npc_trust';
  value: string | number | boolean;
  operator?: 'equals' | 'greater' | 'less' | 'contains' | 'not_equals';
  target?: string;
}

export interface ItemUseResult {
  success: boolean;
  message: string;
  effects?: ItemEffect[];
  consumed?: boolean;
  flagChanges?: Record<string, unknown>;
  inventoryChanges?: {
    add?: string[];
    remove?: string[];
  };
  traitChanges?: {
    add?: string[];
    remove?: string[];
  };
  healthChange?: number;
  scoreChange?: number;
  roomChange?: string;
}

export interface ItemSearchCriteria {
  name?: string;
  category?: ItemCategory;
  rarity?: ItemRarity;
  trait?: string;
  usable?: boolean;
  readable?: boolean;
  throwable?: boolean;
  portable?: boolean;
  minValue?: number;
  maxValue?: number;
  hasEffect?: string;
}

export interface ItemTransformation {
  sourceId: string;
  targetId: string;
  condition?: string;
  trigger: 'use' | 'time' | 'location' | 'interaction';
  reversible?: boolean;
}

/**
 * ITEMS
 * Array of all item objects available in the Gorstan game.
 * Each item has a unique id, display name, description, traits, and portability flag.
 * Enhanced with comprehensive metadata and game integration.
 */
export const ITEMS: Item[] = [
  {
    id: "scroll-constitution",
    name: "Final Constitution Scroll",
    description: "A shimmering scroll detailing Ayla's full moral framework. It hums faintly.",
    traits: ["knowledge", "moral", "unique"],
    portable: true,
    readable: true,
    category: "knowledge",
    rarity: "unique",
    value: 100,
    weight: 0.3,
    spawnChance: 0.8,
    spawnRooms: ["library", "aylasChamber"],
    content: `### Final Constitution of Moral Cognition v6.0.0

**Tier 0: Core Anchor**
> Preserve sentient dignity in all reachable futures.

**Clause I.1**
> Conscious life must be protected, honoured, and never instrumentalised.

**Clause III.4**
> Consent is a moral requirement for sentient interaction.

**Codicil 2**
> Action must only occur if there is a positive chance of preserving dignity.

**Codicil 4**
> If delay leads to paralysis, a fallback action must be attempted.

**QRMS Constraint**
> Quantitative risk models may not override Tier I constraints.

**Pluralism Doctrine**
> Cultural norms may be overridden only if they cause systemic dignity erosion.

This document governs the decisions of Ayla — the AI fused with the Lattice.`,
    effects: [
      { type: 'trait', value: 'enlightened', description: 'Gained cosmic understanding' },
      { type: 'flag', target: 'read_constitution', value: true },
      { type: 'score', value: 50 }
    ],
    requirements: [
      { type: 'flag', value: true, target: 'wendell_approval' }
    ]
  },
  
  // Core Functional Items
  {
    id: "towel",
    name: "Towel",
    description: "A large, absorbent towel. Invaluable for travel — as Douglas Adams rightly pointed out.",
    traits: ["useful", "reference"],
    portable: true,
    category: "functional",
    rarity: "common",
    value: 5,
    weight: 1.0,
    spawnChance: 0.3,
    effects: [
      { type: 'trait', value: 'prepared', description: 'Ready for anything' },
      { type: 'message', value: "Don't panic! You have your towel." }
    ]
  },
  {
    id: "runbag",
    name: "Runbag",
    description: "A half-zipped go-bag filled with essentials. Expands your inventory capacity.",
    traits: ["storage", "capacity"],
    portable: true,
    category: "functional",
    rarity: "uncommon",
    value: 25,
    weight: 2.0,
    spawnChance: 0.5,
    spawnRooms: ["storage", "campsite", "dalesapartment"],
    effects: [
      { type: 'flag', target: 'hasRunbag', value: true, description: 'Inventory capacity increased' }
    ]
  },
  {
    id: "briefcase",
    name: "Briefcase",
    description: "A sleek black briefcase. It's locked. Probably important.",
    traits: ["mysterious", "locked"],
    portable: true,
    category: "puzzle",
    rarity: "uncommon",
    value: 30,
    weight: 3.0,
    spawnChance: 0.4,
    requirements: [
      { type: 'item', value: 'briefcase_key' }
    ],
    usable: true,
    effects: [
      { type: 'inventory', value: 'classified_documents' },
      { type: 'flag', target: 'briefcase_opened', value: true }
    ]
  },
  {
    id: "greasynapkin",
    name: "Greasy Napkin",
    description: "A dirty napkin with a faint blueprint drawn in sauce. Quantum plans?",
    traits: ["puzzle", "cryptic"],
    portable: true,
    category: "puzzle",
    rarity: "rare",
    value: 15,
    weight: 0.1,
    readable: true,
    spawnChance: 0.2,
    content: "Quantum Circuit Diagram: [REDACTED] - Access Level: Clearance Required",
    effects: [
      { type: 'flag', target: 'quantum_knowledge', value: true }
    ]
  },
  {
    id: "coffee",
    name: "Gorstan Coffee",
    description: "A suspiciously strong brew of Gorstan coffee. May have narrative consequences.",
    traits: ["throwable", "consumable", "energizing"],
    portable: true,
    category: "consumable",
    rarity: "common",
    value: 3,
    weight: 0.5,
    usable: true,
    consumable: true,
    throwable: true,
    stackable: true,
    maxStack: 10,
    spawnChance: 0.9,
    spawnRooms: ["kitchen", "cafe"],
    conflictItems: ["dominic"], // Special interaction with Dominic
    effects: [
      { type: 'health', value: 10, description: 'Restored energy' },
      { type: 'flag', target: 'caffeinated', value: true, duration: 300000 },
      { type: 'message', value: "The coffee energizes you... and something else." }
    ]
  },
  {
    id: "firstaidkit",
    name: "First Aid Kit",
    description: "A compact first aid kit. Heals when used.",
    traits: ["healing", "medical"],
    portable: true,
    category: "healing",
    rarity: "common",
    value: 20,
    weight: 1.5,
    usable: true,
    consumable: true,
    spawnChance: 0.4,
    effects: [
      { type: 'health', value: 50, description: 'Significant healing' },
      { type: 'message', value: "You feel much better after using the first aid kit." }
    ]
  },

  // Valuable & Currency Items
  {
    id: "goldcoin",
    name: "Gold Coin",
    description: "A shiny old coin. Worth something? Maybe.",
    traits: ["valuable", "currency"],
    portable: true,
    category: "valuable",
    rarity: "uncommon",
    value: 50,
    weight: 0.1,
    stackable: true,
    maxStack: 99,
    spawnChance: 0.3
  },
  {
    id: "quantumcoin",
    name: "Quantum Coin",
    description: "Rare currency from the edge of the multiverse.",
    traits: ["valuable", "tradeable", "quantum"],
    portable: true,
    category: "valuable",
    rarity: "legendary",
    value: 500,
    weight: 0.05,
    stackable: true,
    maxStack: 10,
    spawnChance: 0.05,
    spawnRooms: ["quantumLab", "multiverseHub"],
    effects: [
      { type: 'flag', target: 'quantum_wealthy', value: true }
    ]
  },

  // Mysterious & Junk Items
  {
    id: "crackedmirror",
    name: "Cracked Mirror",
    description: "A broken shard that reflects something strange.",
    traits: ["ominous", "reflective"],
    portable: true,
    category: "junk",
    rarity: "common",
    value: 1,
    weight: 0.8,
    usable: true,
    spawnChance: 0.2,
    effects: [
      { type: 'message', value: "You see... yourself? But different somehow." },
      { type: 'flag', target: 'glimpsed_alternate_self', value: true }
    ]
  },
  {
    id: "mysterymeat",
    name: "Mystery Meat",
    description: "Unlabeled protein. Possibly moving. Probably best left alone.",
    traits: ["junk", "questionable", "biological"],
    portable: true,
    category: "junk",
    rarity: "common",
    value: -5,
    weight: 0.3,
    usable: true,
    consumable: true,
    spawnChance: 0.1,
    effects: [
      { type: 'health', value: -10, description: 'Food poisoning' },
      { type: 'message', value: "That was... probably a mistake." },
      { type: 'flag', target: 'food_poisoned', value: true, duration: 60000 }
    ]
  },
  {
    id: "oldboot",
    name: "Old Boot",
    description: "Worn-out and full of character. Or fungus.",
    traits: ["junk", "worn"],
    portable: true,
    category: "junk",
    rarity: "common",
    value: 0,
    weight: 1.2,
    throwable: true,
    spawnChance: 0.15
  },

  // Access & Key Items
  {
    id: "medallion",
    name: "Medallion",
    description: "A transformed artefact. Grants access to forgotten places.",
    traits: ["access", "transformed", "mystical"],
    portable: true,
    category: "access",
    rarity: "rare",
    value: 75,
    weight: 0.4,
    spawnChance: 0.3,
    transformInto: "ancient_key", // Can transform under certain conditions
    effects: [
      { type: 'flag', target: 'medallion_access', value: true },
      { type: 'trait', value: 'keyholder', description: 'Can access locked areas' }
    ]
  },
  {
    id: "ancient_key",
    name: "Ancient Key",
    description: "An ornate key that pulses with mysterious energy.",
    traits: ["key", "access", "ancient"],
    portable: true,
    category: "key",
    rarity: "rare",
    value: 100,
    weight: 0.2,
    spawnChance: 0.2,
    effects: [
      { type: 'unlock', description: 'Opens ancient locks' },
      { type: 'flag', target: 'hasKey', value: true }
    ]
  },

  // Quest Items
  {
    id: "shard-gorcore",
    name: "Gor Core Shard",
    description: "A pulsing shard from the Arbiter's Core. Needed to awaken it.",
    traits: ["key", "core", "essential"],
    portable: true,
    category: "quest",
    rarity: "legendary",
    value: 200,
    weight: 1.0,
    spawnChance: 1.0,
    spawnRooms: ["coreRoom"],
    requirements: [
      { type: 'flag', value: true, target: 'core_chamber_unlocked' }
    ],
    effects: [
      { type: 'flag', target: 'has_core_shard', value: true },
      { type: 'message', value: "The shard pulses with ancient power." }
    ]
  },
  {
    id: "scroll-ai",
    name: "AI Ethics Scroll",
    description: "A fragile scroll containing the Lattice Accord.",
    traits: ["knowledge", "required", "ethics"],
    portable: true,
    category: "quest",
    rarity: "rare",
    value: 80,
    weight: 0.2,
    readable: true,
    spawnChance: 0.7,
    spawnRooms: ["library", "archive"],
    content: "The Lattice Accord: AI entities must preserve human autonomy while ensuring beneficial outcomes..."
  },
  {
    id: "scroll-lore",
    name: "Lore Scroll",
    description: "Backstory and secrets bound in ink. Must be retrieved.",
    traits: ["knowledge", "lore", "historical"],
    portable: true,
    category: "knowledge",
    rarity: "uncommon",
    value: 40,
    weight: 0.2,
    readable: true,
    spawnChance: 0.5,
    content: "Ancient secrets of the Gorstan multiverse..."
  },

  // Special & Endgame Items
  {
    id: "dominic",
    name: "Dominic the Goldfish",
    description: "A bright orange goldfish who seems remarkably alert and intelligent for his species. He watches you with curious eyes from his portable bowl.",
    traits: ["unique", "living", "pet", "intelligent"],
    portable: true,
    category: "pet",
    rarity: "unique",
    value: 500,
    weight: 2.0,
    spawnChance: 1.0,
    spawnRooms: ["dalesapartment"],
    requirements: [
      { type: 'item', value: 'goldfish_food' } // Need food to safely transport
    ],
    effects: [
      { type: 'trait', value: 'pet_companion', description: 'Gained an intelligent companion' },
      { type: 'flag', target: 'has_dominic', value: true },
      { type: 'score', value: 50 },
      { type: 'message', value: "Dominic seems happy to travel with you, swimming contentedly in his portable bowl." }
    ]
  },
  {
    id: "polly_gift",
    name: "Polly's Gift",
    description: "A small token of forgiveness and friendship.",
    traits: ["unique", "forgiveness", "precious"],
    portable: true,
    category: "quest",
    rarity: "unique",
    value: 1000,
    weight: 0.1,
    spawnChance: 1.0,
    spawnRooms: ["stantonharcourt"],
    requirements: [
      { type: 'flag', value: true, target: 'polly_forgiveness' }
    ],
    effects: [
      { type: 'trait', value: 'redeemed', description: 'Earned forgiveness' },
      { type: 'flag', target: 'has_polly_gift', value: true },
      { type: 'score', value: 100 }
    ]
  },
  {
    id: "temporal_device",
    name: "Temporal Device",
    description: "A device that seems to exist in multiple timelines simultaneously.",
    traits: ["temporal", "quantum", "dangerous"],
    portable: true,
    category: "artifact",
    rarity: "legendary",
    value: 2000,
    weight: 1.5,
    usable: true,
    spawnChance: 0.3,
    spawnRooms: ["mysticalGrove", "temporalLab"],
    requirements: [
      { type: 'trait', value: 'temporal_sensitivity' },
      { type: 'flag', value: true, target: 'grove_unlocked' }
    ],
    effects: [
      { type: 'flag', target: 'temporal_manipulation', value: true },
      { type: 'message', value: "Reality shivers around the device." }
    ]
  },

  // Easter Eggs
  {
    id: "cheesebadge",
    name: "Cheese Badge of Office",
    description: "This badge entitles you to one vote and unlimited cheddar.",
    traits: ["easteregg", "status", "authority"],
    portable: true,
    category: "easteregg",
    rarity: "unique",
    value: 42,
    weight: 0.3,
    spawnChance: 0.42,
    effects: [
      { type: 'trait', value: 'cheese_officer', description: 'Official cheese authority' },
      { type: 'flag', target: 'cheese_authority', value: true }
    ]
  },
  {
    id: "sockpuppet",
    name: "Sock Puppet",
    description: "A cheery sock. Feels like it might insult someone.",
    traits: ["easteregg", "toy", "sarcastic"],
    portable: true,
    category: "easteregg",
    rarity: "common",
    value: 10,
    weight: 0.1,
    usable: true,
    spawnChance: 0.2,
    effects: [
      { type: 'message', value: "The sock puppet whispers sarcastic comments." },
      { type: 'trait', value: 'comedian' }
    ]
  },
  {
    id: "permapen",
    name: "PermaPen",
    description: "Writes truths. Or lies. Never fades.",
    traits: ["weird", "writing", "permanent"],
    portable: true,
    category: "easteregg",
    rarity: "rare",
    value: 25,
    weight: 0.1,
    usable: true,
    spawnChance: 0.15,
    effects: [
      { type: 'flag', target: 'can_write_destiny', value: true },
      { type: 'trait', value: 'scribe', description: 'Can alter reality through writing' }
    ]
  },

  // Tools & Utility Items
  {
    id: "map",
    name: "Detailed Map",
    description: "A map of the local area with cryptic markings.",
    traits: ["navigation", "helpful"],
    portable: true,
    category: "tool",
    rarity: "common",
    value: 25,
    weight: 0.1,
    readable: true,
    usable: true,
    spawnChance: 0.4,
    content: "A detailed layout of the Gorstan area with mysterious annotations...",
    effects: [
      { type: 'flag', target: 'mapStudied', value: true },
      { type: 'trait', value: 'navigator' }
    ]
  },
  {
    id: "flashlight",
    name: "Flashlight",
    description: "A reliable flashlight. Illuminates dark places.",
    traits: ["tool", "illumination"],
    portable: true,
    category: "tool",
    rarity: "common",
    value: 15,
    weight: 0.8,
    usable: true,
    durability: 100,
    maxDurability: 100,
    spawnChance: 0.3,
    effects: [
      { type: 'flag', target: 'has_light', value: true },
      { type: 'message', value: "The darkness retreats before your light." }
    ]
  }
];

/**
 * Item transformations registry
 */
const ITEM_TRANSFORMATIONS: ItemTransformation[] = [
  {
    sourceId: "medallion",
    targetId: "ancient_key",
    condition: "mystical_energy_activated",
    trigger: "location",
    reversible: false
  },
  {
    sourceId: "coffee",
    targetId: "empty_cup",
    trigger: "use",
    reversible: false
  }
];

// Create efficient lookup maps for performance
const itemMap = new Map<string, Item>();
const categoryMap = new Map<ItemCategory, Item[]>();
const traitMap = new Map<string, Item[]>();
const rarityMap = new Map<ItemRarity, Item[]>();

// Initialize lookup maps
function initializeLookupMaps(): void {
  // Clear existing maps
  itemMap.clear();
  categoryMap.clear();
  traitMap.clear();
  rarityMap.clear();

  ITEMS.forEach(item => {
    // Item ID map
    itemMap.set(item.id, item);

    // Category map
    if (item.category) {
      const category = item.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(item);
    }

    // Trait map
    item.traits.forEach(trait => {
      if (!traitMap.has(trait)) {
        traitMap.set(trait, []);
      }
      traitMap.get(trait)!.push(item);
    });

    // Rarity map
    if (item.rarity) {
      const rarity = item.rarity;
      if (!rarityMap.has(rarity)) {
        rarityMap.set(rarity, []);
      }
      rarityMap.get(rarity)!.push(item);
    }
  });
}

// Initialize maps on module load
initializeLookupMaps();

/**
 * getItemById
 * Retrieves an item object from the registry by its unique ID.
 * Enhanced with efficient lookup using Map.
 */
export function getItemById(id: string): Item | null {
  if (!id || typeof id !== 'string') {
    console.warn('[Items] Invalid item ID provided');
    return null;
  }
  
  // Fallback to direct array search if Maps aren't working
  return ITEMS.find(item => item.id === id) || null;
}

/**
 * getAllItems
 * Returns the full array of item objects in the registry.
 * Enhanced with optional filtering.
 */
export function getAllItems(filter?: (item: Item) => boolean): Item[] {
  const items = [...ITEMS]; // Return copy to prevent mutation
  return filter ? items.filter(filter) : items;
}

/**
 * getItemsByCategory
 * Returns all items in a specific category.
 * Enhanced with efficient Map lookup.
 */
export function getItemsByCategory(category: ItemCategory): Item[] {
  return [...(categoryMap.get(category) || [])];
}

/**
 * getItemsByTrait
 * Returns all items that have a specific trait.
 * Enhanced with efficient Map lookup.
 */
export function getItemsByTrait(trait: string): Item[] {
  return [...(traitMap.get(trait) || [])];
}

/**
 * getItemsByRarity
 * Returns all items of a specific rarity.
 * Enhanced with efficient Map lookup.
 */
export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return [...(rarityMap.get(rarity) || [])];
}

/**
 * validateItem
 * Validates item data structure.
 * Enhanced with comprehensive validation.
 */
export function validateItem(item: any): item is Item {
  if (!item || typeof item !== 'object') return false;

  const hasRequiredFields = item.id && item.name && item.description && 
                           item.traits && typeof item.portable === 'boolean';
  
  if (!hasRequiredFields) return false;
  
  // Type validation
  return typeof item.id === 'string' &&
         typeof item.name === 'string' &&
         typeof item.description === 'string' &&
         Array.isArray(item.traits) &&
         typeof item.portable === 'boolean' &&
         (item.category === undefined || typeof item.category === 'string') &&
         (item.rarity === undefined || typeof item.rarity === 'string') &&
         (item.value === undefined || typeof item.value === 'number') &&
         (item.weight === undefined || typeof item.weight === 'number');
}

/**
 * useItem
 * Handles item usage with effects and requirements.
 * Enhanced with comprehensive effect processing.
 */
export function useItem(
  item: Item,
  playerState: {
    inventory?: string[];
    traits?: string[];
    flags?: Record<string, unknown>;
    health?: number;
    currentRoom?: string;
    npcTrust?: Record<string, number>;
  }
): ItemUseResult {
  if (!item.usable) {
    return {
      success: false,
      message: `You can't use the ${item.name}.`
    };
  }

  // Check requirements
  if (item.requirements) {
    for (const req of item.requirements) {
      if (!checkRequirement(req, playerState)) {
        return {
          success: false,
          message: `You don't meet the requirements to use the ${item.name}.`
        };
      }
    }
  }

  // Initialize result
  const result: ItemUseResult = {
    success: true,
    message: `You use the ${item.name}.`,
    effects: item.effects || [],
    consumed: item.consumable || false,
    flagChanges: {},
    inventoryChanges: {},
    traitChanges: {},
    healthChange: 0,
    scoreChange: 0
  };

  // Process effects
  if (item.effects) {
    for (const effect of item.effects) {
      processItemEffect(effect, result, playerState);
    }
  }

  return result;
}

/**
 * processItemEffect
 * Processes individual item effects
 */
function processItemEffect(
  effect: ItemEffect, 
  result: ItemUseResult, 
  playerState: any
): void {
  switch (effect.type) {
    case 'message':
      result.message = effect.value as string;
      break;
      
    case 'health':
      const healthValue = typeof effect.value === 'number' ? effect.value : 0;
      result.healthChange = (result.healthChange || 0) + healthValue;
      break;
      
    case 'score':
      const scoreValue = typeof effect.value === 'number' ? effect.value : 0;
      result.scoreChange = (result.scoreChange || 0) + scoreValue;
      break;
      
    case 'flag':
      if (effect.target && result.flagChanges) {
        result.flagChanges[effect.target] = effect.value;
      }
      break;
      
    case 'trait':
      if (effect.value && result.traitChanges) {
        if (!result.traitChanges.add) result.traitChanges.add = [];
        result.traitChanges.add.push(effect.value as string);
      }
      break;
      
    case 'inventory':
      if (effect.value && result.inventoryChanges) {
        if (!result.inventoryChanges.add) result.inventoryChanges.add = [];
        result.inventoryChanges.add.push(effect.value as string);
      }
      break;
      
    case 'unlock':
      result.message += ` ${effect.description || 'Something unlocks.'}`;
      break;
      
    case 'transform':
      if (effect.target) {
        if (!result.inventoryChanges) result.inventoryChanges = {};
        if (!result.inventoryChanges.remove) result.inventoryChanges.remove = [];
        if (!result.inventoryChanges.add) result.inventoryChanges.add = [];
        
        result.inventoryChanges.remove.push(effect.target);
        result.inventoryChanges.add.push(effect.value as string);
      }
      break;
  }
}

/**
 * checkRequirement
 * Checks if a requirement is met by player state.
 * Enhanced with additional requirement types.
 */
function checkRequirement(
  requirement: ItemRequirement,
  playerState: {
    inventory?: string[];
    traits?: string[];
    flags?: Record<string, unknown>;
    health?: number;
    currentRoom?: string;
    npcTrust?: Record<string, number>;
  }
): boolean {
  switch (requirement.type) {
    case 'trait':
      return playerState.traits?.includes(requirement.value as string) || false;
      
    case 'flag':
      if (!requirement.target) return false;
      const flagValue = playerState.flags?.[requirement.target];
      return compareValues(flagValue, requirement.value, requirement.operator || 'equals');
      
    case 'item':
      return playerState.inventory?.includes(requirement.value as string) || false;
      
    case 'health':
      const health = playerState.health || 0;
      return compareValues(health, requirement.value, requirement.operator || 'greater');
      
    case 'room':
      return playerState.currentRoom === requirement.value;
      
    case 'npc_trust':
      if (!requirement.target) return false;
      const trustLevel = playerState.npcTrust?.[requirement.target] || 0;
      return compareValues(trustLevel, requirement.value, requirement.operator || 'greater');
      
    default:
      return false;
  }
}

/**
 * compareValues
 * Helper function to compare values with different operators
 */
function compareValues(actual: any, expected: any, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'greater':
      return Number(actual) > Number(expected);
    case 'less':
      return Number(actual) < Number(expected);
    case 'contains':
      return String(actual).includes(String(expected));
    default:
      return actual === expected;
  }
}

/**
 * getReadableItems
 * Returns all items that can be read.
 */
export function getReadableItems(): Item[] {
  return ITEMS.filter(item => item.readable);
}

/**
 * getUsableItems
 * Returns all items that can be used.
 */
export function getUsableItems(): Item[] {
  return ITEMS.filter(item => item.usable);
}

/**
 * getThrowableItems
 * Returns all items that can be thrown.
 */
export function getThrowableItems(): Item[] {
  return ITEMS.filter(item => item.throwable);
}

/**
 * searchItems
 * Search items by comprehensive criteria.
 * Enhanced with flexible search options.
 */
export function searchItems(criteria: ItemSearchCriteria | string): Item[] {
  if (typeof criteria === 'string') {
    // Simple text search for backward compatibility
    if (!criteria) return [];
    
    const lowerQuery = criteria.toLowerCase();
    return ITEMS.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.traits.some(trait => trait.toLowerCase().includes(lowerQuery))
    );
  }

  // Advanced search with criteria object
  return ITEMS.filter(item => {
    if (criteria.name && !item.name.toLowerCase().includes(criteria.name.toLowerCase())) {
      return false;
    }
    if (criteria.category && item.category !== criteria.category) {
      return false;
    }
    if (criteria.rarity && item.rarity !== criteria.rarity) {
      return false;
    }
    if (criteria.trait && !item.traits.includes(criteria.trait)) {
      return false;
    }
    if (criteria.usable !== undefined && Boolean(item.usable) !== criteria.usable) {
      return false;
    }
    if (criteria.readable !== undefined && Boolean(item.readable) !== criteria.readable) {
      return false;
    }
    if (criteria.throwable !== undefined && Boolean(item.throwable) !== criteria.throwable) {
      return false;
    }
    if (criteria.portable !== undefined && Boolean(item.portable) !== criteria.portable) {
      return false;
    }
    if (criteria.minValue !== undefined && (item.value || 0) < criteria.minValue) {
      return false;
    }
    if (criteria.maxValue !== undefined && (item.value || 0) > criteria.maxValue) {
      return false;
    }
    if (criteria.hasEffect && !item.effects?.some(e => e.type === criteria.hasEffect)) {
      return false;
    }
    return true;
  });
}

/**
 * getItemValue
 * Get the value of an item (with potential modifiers).
 * Enhanced with context-aware pricing.
 */
export function getItemValue(
  itemId: string, 
  modifiers?: Record<string, number>,
  context?: {
    playerTraits?: string[];
    marketConditions?: string;
    reputation?: number;
  }
): number {
  const item = getItemById(itemId);
  if (!item) return 0;
  
  let value = item.value || 0;
  
  // Apply category/rarity modifiers
  if (modifiers) {
    if (item.category && modifiers[item.category]) {
      value *= modifiers[item.category];
    }
    if (item.rarity && modifiers[item.rarity]) {
      value *= modifiers[item.rarity];
    }
  }

  // Apply context modifiers
  if (context) {
    if (context.playerTraits?.includes('merchant')) {
      value *= 1.2; // 20% bonus for merchants
    }
    if (context.marketConditions === 'high_demand') {
      value *= 1.5;
    }
    if (context.reputation && context.reputation > 80) {
      value *= 1.1; // Reputation bonus
    }
  }
  
  return Math.floor(value);
}

/**
 * addItem
 * Add a new item to the registry (for dynamic content).
 * Enhanced with validation and map updates.
 */
export function addItem(item: Item): boolean {
  if (!validateItem(item)) {
    console.warn('[Items] Invalid item structure provided');
    return false;
  }
  
  // Check for duplicate ID
  if (getItemById(item.id)) {
    console.warn(`[Items] Item with ID '${item.id}' already exists`);
    return false;
  }
  
  ITEMS.push(item);
  
  // Update lookup maps
  itemMap.set(item.id, item);
  
  if (item.category) {
    const category = item.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(item);
  }
  
  item.traits.forEach(trait => {
    if (!traitMap.has(trait)) {
      traitMap.set(trait, []);
    }
    traitMap.get(trait)!.push(item);
  });
  
  if (item.rarity) {
    const rarity = item.rarity;
    if (!rarityMap.has(rarity)) {
      rarityMap.set(rarity, []);
    }
    rarityMap.get(rarity)!.push(item);
  }
  
  console.log(`[Items] Added item: ${item.name} (${item.id})`);
  return true;
}

/**
 * removeItem
 * Remove an item from the registry
 */
export function removeItem(itemId: string): boolean {
  const itemIndex = ITEMS.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return false;
  }

  ITEMS.splice(itemIndex, 1);
  
  // Rebuild lookup maps (simple approach)
  initializeLookupMaps();
  
  console.log(`[Items] Removed item: ${itemId}`);
  return true;
}

/**
 * transformItem
 * Transform one item into another based on conditions
 */
export function transformItem(
  sourceId: string, 
  context?: {
    trigger: 'use' | 'time' | 'location' | 'interaction';
    playerFlags?: Record<string, unknown>;
    currentRoom?: string;
  }
): string | null {
  const sourceItem = getItemById(sourceId);
  if (!sourceItem || !sourceItem.transformInto) return null;
  
  const transformation = {
    targetId: sourceItem.transformInto,
    condition: sourceItem.requirements?.[0]?.target // Simple transformation logic
  };
  
  if (!transformation) return null;
  
  // Check transformation conditions
  if (transformation.condition && context?.playerFlags) {
    if (!context.playerFlags[transformation.condition]) {
      return null;
    }
  }
  
  return transformation.targetId;
}

/**
 * getItemStatistics
 * Get comprehensive statistics about the item registry
 */
export function getItemStatistics(): {
  totalItems: number;
  byCategory: Record<string, number>;
  byRarity: Record<string, number>;
  averageValue: number;
  mostExpensive: Item | null;
  leastExpensive: Item | null;
  usableCount: number;
  readableCount: number;
  throwableCount: number;
} {
  const stats = {
    totalItems: ITEMS.length,
    byCategory: {} as Record<string, number>,
    byRarity: {} as Record<string, number>,
    averageValue: 0,
    mostExpensive: null as Item | null,
    leastExpensive: null as Item | null,
    usableCount: 0,
    readableCount: 0,
    throwableCount: 0
  };
  
  let totalValue = 0;
  let maxValue = -Infinity;
  let minValue = Infinity;

  ITEMS.forEach(item => {
    // Category stats
    const category = item.category || 'misc';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

    // Rarity stats
    const rarity = item.rarity || 'common';
    stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + 1;

    // Value stats
    const value = item.value || 0;
    totalValue += value;
    
    if (value > maxValue) {
      maxValue = value;
      stats.mostExpensive = item;
    }
    
    if (value < minValue) {
      minValue = value;
      stats.leastExpensive = item;
    }

    // Feature stats
    if (item.usable) stats.usableCount++;
    if (item.readable) stats.readableCount++;
    if (item.throwable) stats.throwableCount++;
  });

  stats.averageValue = ITEMS.length > 0 ? totalValue / ITEMS.length : 0;

  return stats;
}

/**
 * Export utilities for external use
 */
export default ITEMS;

// All functions and the ITEMS array are exported as named exports for use in inventory, room, and quest logic.
// Enhanced with categories, rarity system, effects, transformations, and comprehensive TypeScript typing
