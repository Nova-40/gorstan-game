// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: items.js
// Path: src/engine/items.js


// src/engine/items.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// items utility for Gorstan game.
// Full item registry for all portable, quest, and easter egg items in the game.
// Provides functions to retrieve items by ID or get the full item list.

/**
 * ITEMS
 * Array of all item objects available in the Gorstan game.
 * Each item has a unique id, display name, description, traits, and portability flag.
 */
export const ITEMS = [
  // Core Functional
  {
    id: "towel",
    name: "Towel",
    description: "A large, absorbent towel. Invaluable for travel — as Douglas Adams rightly pointed out.",
    traits: ["useful"],
    portable: true
  },
  {
    id: "runbag",
    name: "Runbag",
    description: "A half-zipped go-bag filled with essentials. Expands your inventory capacity.",
    traits: ["storage"],
    portable: true
  },
  {
    id: "briefcase",
    name: "Briefcase",
    description: "A sleek black briefcase. It's locked. Probably important.",
    traits: ["mysterious"],
    portable: true
  },
  {
    id: "greasynapkin",
    name: "Greasy Napkin",
    description: "A dirty napkin with a faint blueprint drawn in sauce. Quantum plans?",
    traits: ["puzzle"],
    portable: true
  },
  {
    id: "coffee",
    name: "Gorstan Coffee",
    description: "A suspiciously strong brew of Gorstan coffee. May have narrative consequences.",
    traits: ["throwable", "consumable"],
    portable: true
  },
  {
    id: "firstaidkit",
    name: "First Aid Kit",
    description: "A compact first aid kit. Heals when used.",
    traits: ["healing"],
    portable: true
  },

  // Valuable & Junk
  {
    id: "goldcoin",
    name: "Gold Coin",
    description: "A shiny old coin. Worth something? Maybe.",
    traits: ["valuable"],
    portable: true
  },
  {
    id: "quantumcoin",
    name: "Quantum Coin",
    description: "Rare currency from the edge of the multiverse.",
    traits: ["valuable", "tradeable"],
    portable: true
  },
  {
    id: "crackedmirror",
    name: "Cracked Mirror",
    description: "A broken shard that reflects something strange.",
    traits: ["ominous"],
    portable: true
  },
  {
    id: "mysterymeat",
    name: "Mystery Meat",
    description: "Unlabeled protein. Possibly moving. Probably best left alone.",
    traits: ["junk"],
    portable: true
  },
  {
    id: "oldboot",
    name: "Old Boot",
    description: "Worn-out and full of character. Or fungus.",
    traits: ["junk"],
    portable: true
  },

  // Puzzle/Quest
  {
    id: "medallion",
    name: "Medallion",
    description: "A transformed artefact. Grants access to forgotten places.",
    traits: ["access", "transformed"],
    portable: true
  },
  {
    id: "shard-gorcore",
    name: "Gor Core Shard",
    description: "A pulsing shard from the Arbiter’s Core. Needed to awaken it.",
    traits: ["key", "core"],
    portable: true
  },
  {
    id: "scroll-ai",
    name: "AI Ethics Scroll",
    description: "A fragile scroll containing the Lattice Accord.",
    traits: ["knowledge", "required"],
    portable: true
  },
  {
    id: "scroll-lore",
    name: "Lore Scroll",
    description: "Backstory and secrets bound in ink. Must be retrieved.",
    traits: ["knowledge", "lore"],
    portable: true
  },

  // Easter Eggs
  {
    id: "cheesebadge",
    name: "Cheese Badge of Office",
    description: "This badge entitles you to one vote and unlimited cheddar.",
    traits: ["easteregg", "status"],
    portable: true
  },
  {
    id: "sockpuppet",
    name: "Sock Puppet",
    description: "A cheery sock. Feels like it might insult someone.",
    traits: ["easteregg", "toy"],
    portable: true
  },
  {
    id: "permapen",
    name: "PermaPen",
    description: "Writes truths. Or lies. Never fades.",
    traits: ["weird"],
    portable: true
  }
];

/**
 * getItemById
 * Retrieves an item object from the registry by its unique ID.
 *
 * @param {string} id - The unique item ID.
 * @returns {Object|null} - The item object if found, otherwise null.
 */
export function getItemById(id) {
  return ITEMS.find(item => item.id === id) || null;
}

/**
 * getAllItems
 * Returns the full array of item objects in the registry.
 *
 * @returns {Array<Object>} - All item objects.
 */
export function getAllItems() {
  return ITEMS;
}

// All functions and the ITEMS array are exported as named exports for use in inventory, room, and quest logic.
// TODO: Add item categories, rarity, or dynamic item generation as the