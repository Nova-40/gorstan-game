// src/engine/engineFlags.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// engineFlags utility for Gorstan game.
// Central flag logic utility for managing player state flags and related calculations.

/**
 * getInventoryCapacity
 * Determines the player's inventory capacity based on their flags.
 * If the player has the 'hasRunbag' flag, capacity is increased.
 *
 * @param {Object} flags - The player's current flags object.
 * @returns {number} - The new inventory size.
 */
export function getInventoryCapacity(flags) {
  return flags?.hasRunbag ? 10 : 5;
}

// Exported as a named export for use in inventory and player state logic.
// TODO: Expand with more flag-based calculations as
