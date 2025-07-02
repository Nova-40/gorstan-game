// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: inventory.js
// Path: src/engine/inventory.js


// src/engine/inventory.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// inventory utility for Gorstan game.
// Provides functions to manage the player's inventory state in memory.
// Not persisted across reloads; only for the current session.

/**
 * Module-scoped array to hold the player's inventory items.
 * Not persisted between sessions.
 * @type {Array<string>}
 */
let inventory = [];

/**
 * addItem
 * Adds an item to the inventory if it is not already present.
 *
 * @param {string} item - The item to add.
 */
export function addItem(item) {
  if (!inventory.includes(item)) inventory.push(item);
}

/**
 * hasItem
 * Checks if the inventory contains a specific item.
 *
 * @param {string} item - The item to check.
 * @returns {boolean}
 */
export function hasItem(item) {
  return inventory.includes(item);
}

/**
 * getInventory
 * Returns a shallow copy of the current inventory array.
 *
 * @returns {Array<string>}
 */
export function getInventory() {
  return [...inventory];
}

/**
 * removeItem
 * Removes a specific item from the inventory.
 *
 * @param {string} item - The item to remove.
 */
export function removeItem(item) {
  inventory = inventory.filter(i => i !== item);
}

/**
 * clearInventory
 * Clears all items from the inventory.
 */
export function clearInventory() {
  inventory = [];
}

// All functions are exported as named exports for use in game logic and UI.
// TODO: Consider adding persistence or event hooks for inventory