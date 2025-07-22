

// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: engineFlags.ts
// Path: src/engine/engineFlags.ts
//
// engineFlags utility for Gorstan game.
// Central flag logic utility for managing player state flags and related calculations.

/**
 * Type definitions for engine flags
 */
export interface FlagState {
  [key: string]: unknown;
}

export interface InventoryCapacityModifiers {
  baseCapacity: number;
  runbagBonus: number;
  scholarBonus: number;
  godmodeMultiplier: number;
}

export interface FlagValidationRule {
  name: string;
  type: 'boolean' | 'number' | 'string' | 'object';
  required?: boolean;
  defaultValue?: unknown;
  validator?: (value: unknown) => boolean;
}

export interface FlagOperation {
  type: 'set' | 'toggle' | 'increment' | 'decrement' | 'delete';
  key: string;
  value?: unknown;
  amount?: number;
}

/**
 * Default inventory capacity configuration
 */
export const INVENTORY_CONFIG: InventoryCapacityModifiers = {
  baseCapacity: 5,
  runbagBonus: 5,      // +5 when hasRunbag is true
  scholarBonus: 2,     // +2 when scholar trait exists
  godmodeMultiplier: 2 // x2 when godmode is active
};

/**
 * getInventoryCapacity
 * Determines the player's inventory capacity based on their flags.
 * If the player has the 'hasRunbag' flag, capacity is increased.
 * Enhanced with additional modifiers and validation.
 *
 * @param flags - The player's current flags object
 * @param traits - Optional player traits for additional bonuses
 * @returns The calculated inventory capacity
 */
export function getInventoryCapacity(
  flags: Record<string, unknown>,
  traits?: string[]
): number {
  try {
    // Validate input
    if (!validateFlagState(flags)) {
      console.warn('[EngineFlags] Invalid flags object, using base capacity');
      return INVENTORY_CONFIG.baseCapacity;
    }

    let capacity = INVENTORY_CONFIG.baseCapacity;

    // Original runbag logic (preserved)
    if (flags?.hasRunbag) {
      capacity += INVENTORY_CONFIG.runbagBonus;
    }

    // Additional modifiers
    if (traits?.includes('scholar')) {
      capacity += INVENTORY_CONFIG.scholarBonus;
    }

    if (flags?.godmode) {
      capacity *= INVENTORY_CONFIG.godmodeMultiplier;
    }

    // Ensure minimum capacity
    return Math.max(capacity, 1);

  } catch (error) {
    console.error('[EngineFlags] Error calculating inventory capacity:', error);
    return INVENTORY_CONFIG.baseCapacity;
  }
}

/**
 * hasFlag
 * Safely checks if a flag exists and is truthy
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to check
 * @returns True if flag exists and is truthy
 */
export function hasFlag(flags: FlagState, flagName: string): boolean {
  try {
    return Boolean(flags?.[flagName]);
  } catch (error) {
    console.error(`[EngineFlags] Error checking flag '${flagName}':`, error);
    return false;
  }
}

/**
 * setFlag
 * Safely sets a flag value with validation
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to set
 * @param value - Value to set (defaults to true)
 * @returns Updated flags object
 */
export function setFlag(
  flags: FlagState,
  flagName: string,
  value: unknown = true
): FlagState {
  try {
    if (!validateFlagName(flagName)) {
      console.warn(`[EngineFlags] Invalid flag name: '${flagName}'`);
      return flags;
    }

    return {
      ...flags,
      [flagName]: value
    };
  } catch (error) {
    console.error(`[EngineFlags] Error setting flag '${flagName}':`, error);
    return flags;
  }
}

/**
 * toggleFlag
 * Toggles a boolean flag value
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to toggle
 * @returns Updated flags object
 */
export function toggleFlag(flags: FlagState, flagName: string): FlagState {
  try {
        return setFlag(flags, flagName, !currentValue);
  } catch (error) {
    console.error(`[EngineFlags] Error toggling flag '${flagName}':`, error);
    return flags;
  }
}

/**
 * incrementFlag
 * Increments a numeric flag value
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to increment
 * @param amount - Amount to increment by (defaults to 1)
 * @returns Updated flags object
 */
export function incrementFlag(
  flags: FlagState,
  flagName: string,
  amount: number = 1
): FlagState {
  try {
        return setFlag(flags, flagName, currentValue + amount);
  } catch (error) {
    console.error(`[EngineFlags] Error incrementing flag '${flagName}':`, error);
    return flags;
  }
}

/**
 * decrementFlag
 * Decrements a numeric flag value (with minimum of 0)
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to decrement
 * @param amount - Amount to decrement by (defaults to 1)
 * @param allowNegative - Whether to allow negative values
 * @returns Updated flags object
 */
export function decrementFlag(
  flags: FlagState,
  flagName: string,
  amount: number = 1,
  allowNegative: boolean = false
): FlagState {
  try {

    return setFlag(flags, flagName, finalValue);
  } catch (error) {
    console.error(`[EngineFlags] Error decrementing flag '${flagName}':`, error);
    return flags;
  }
}

/**
 * removeFlag
 * Removes a flag from the state
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to remove
 * @returns Updated flags object
 */
export function removeFlag(flags: FlagState, flagName: string): FlagState {
  try {
    const { [flagName]: removed, ...remainingFlags } = flags;
    return remainingFlags;
  } catch (error) {
    console.error(`[EngineFlags] Error removing flag '${flagName}':`, error);
    return flags;
  }
}

/**
 * getFlagValue
 * Safely gets a flag value with optional default
 *
 * @param flags - Flag state object
 * @param flagName - Name of the flag to get
 * @param defaultValue - Default value if flag doesn't exist
 * @returns Flag value or default
 */
export function getFlagValue<T = unknown>(
  flags: FlagState,
  flagName: string,
  defaultValue?: T
): T {
  try {
        return value !== undefined ? (value as T) : (defaultValue as T);
  } catch (error) {
    console.error(`[EngineFlags] Error getting flag '${flagName}':`, error);
    return defaultValue as T;
  }
}

/**
 * checkMultipleFlags
 * Checks multiple flags with AND/OR logic
 *
 * @param flags - Flag state object
 * @param flagNames - Array of flag names to check
 * @param mode - 'and' (all must be true) or 'or' (any must be true)
 * @returns True if condition is met
 */
export function checkMultipleFlags(
  flags: FlagState,
  flagNames: string[],
  mode: 'and' | 'or' = 'and'
): boolean {
  try {
    if (flagNames.length === 0) return true;

    return mode === 'and'
      ? results.every(result => result)
      : results.some(result => result);
  } catch (error) {
    console.error('[EngineFlags] Error checking multiple flags:', error);
    return false;
  }
}

/**
 * applyFlagOperations
 * Applies multiple flag operations in sequence
 *
 * @param flags - Flag state object
 * @param operations - Array of flag operations to apply
 * @returns Updated flags object
 */
export function applyFlagOperations(
  flags: FlagState,
  operations: FlagOperation[]
): FlagState {
  try {
    return operations.reduce((currentFlags, operation) => {
      switch (operation.type) {
        case 'set':
          return setFlag(currentFlags, operation.key, operation.value);
        case 'toggle':
          return toggleFlag(currentFlags, operation.key);
        case 'increment':
          return incrementFlag(currentFlags, operation.key, operation.amount);
        case 'decrement':
          return decrementFlag(currentFlags, operation.key, operation.amount);
        case 'delete':
          return removeFlag(currentFlags, operation.key);
        default:
          console.warn(`[EngineFlags] Unknown operation type: ${operation.type}`);
          return currentFlags;
      }
    }, flags);
  } catch (error) {
    console.error('[EngineFlags] Error applying flag operations:', error);
    return flags;
  }
}

/**
 * validateFlagState
 * Validates that a flag state object is valid
 *
 * @param flags - Object to validate
 * @returns True if valid flag state
 */
export function validateFlagState(flags: unknown): flags is FlagState {
  return typeof flags === 'object' && flags !== null;
}

/**
 * validateFlagName
 * Validates that a flag name is valid
 *
 * @param name - Flag name to validate
 * @returns True if valid flag name
 */
export function validateFlagName(name: unknown): name is string {
  return typeof name === 'string' &&
         name.length > 0 &&
         /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * getFlagStatistics
 * Gets statistics about the current flag state
 *
 * @param flags - Flag state object
 * @returns Statistics object
 */
export function getFlagStatistics(flags: FlagState): {
  totalFlags: number;
  booleanFlags: number;
  numericFlags: number;
  stringFlags: number;
  objectFlags: number;
  trueBooleanFlags: number;
} {
  try {

    return {
      totalFlags: entries.length,
      booleanFlags: entries.filter(([_, v]) => typeof v === 'boolean').length,
      numericFlags: entries.filter(([_, v]) => typeof v === 'number').length,
      stringFlags: entries.filter(([_, v]) => typeof v === 'string').length,
      objectFlags: entries.filter(([_, v]) => typeof v === 'object').length,
      trueBooleanFlags: entries.filter(([_, v]) => v === true).length
    };
  } catch (error) {
    console.error('[EngineFlags] Error calculating flag statistics:', error);
    return {
      totalFlags: 0,
      booleanFlags: 0,
      numericFlags: 0,
      stringFlags: 0,
      objectFlags: 0,
      trueBooleanFlags: 0
    };
  }
}

/**
 * cloneFlags
 * Creates a deep copy of flag state
 *
 * @param flags - Flag state to clone
 * @returns Cloned flag state
 */
export function cloneFlags(flags: FlagState): FlagState {
  try {
    return JSON.parse(JSON.stringify(flags));
  } catch (error) {
    console.error('[EngineFlags] Error cloning flags:', error);
    return {};
  }
}

/**
 * mergeFlags
 * Merges two flag states (second overwrites first)
 *
 * @param baseFlags - Base flag state
 * @param newFlags - New flags to merge in
 * @returns Merged flag state
 */
export function mergeFlags(baseFlags: FlagState, newFlags: FlagState): FlagState {
  try {
    return { ...baseFlags, ...newFlags };
  } catch (error) {
    console.error('[EngineFlags] Error merging flags:', error);
    return baseFlags;
  }
}

/**
 * filterFlags
 * Filters flags based on a predicate function
 *
 * @param flags - Flag state object
 * @param predicate - Function to test each flag
 * @returns Filtered flag state
 */
export function filterFlags(
  flags: FlagState,
  predicate: (key: string, value: unknown) => boolean
): FlagState {
  try {
    const filtered: FlagState = {};

    Object.entries(flags).forEach(([key, value]) => {
      if (predicate(key, value)) {
        filtered[key] = value;
      }
    });

    return filtered;
  } catch (error) {
    console.error('[EngineFlags] Error filtering flags:', error);
    return flags;
  }
}

/**
 * Export utilities for external use
 */
export
export default EngineFlags;

// Maintain backward compatibility by exporting the original function
export { getInventoryCapacity as default };
