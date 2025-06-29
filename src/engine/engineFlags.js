// src/engine/engineFlags.js
// Central flag logic utility

/**
 * Determines if a player's inventory should increase based on flags.
 * @param {Object} flags
 * @returns {number} New inventory size
 */
export function getInventoryCapacity(flags) {
  return flags?.hasRunbag ? 10 : 5;
}
