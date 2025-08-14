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
  type: "boolean" | "number" | "string" | "object";
  required?: boolean;
  defaultValue?: unknown;
  validator?: (value: unknown) => boolean;
}

export interface FlagOperation {
  type: "set" | "toggle" | "increment" | "decrement" | "delete";
  key: string;
  value?: unknown;
  amount?: number;
}

export const INVENTORY_CONFIG: InventoryCapacityModifiers = {
  baseCapacity: 5,
  runbagBonus: 5,
  scholarBonus: 2,
  godmodeMultiplier: 2,
};

// --- Function: getInventoryCapacity ---
export function getInventoryCapacity(
  flags: Record<string, unknown>,
  traits?: string[],
): number {
  try {
    if (!validateFlagState(flags)) {
      console.warn("[EngineFlags] Invalid flags object, using base capacity");
      return INVENTORY_CONFIG.baseCapacity;
    }

    let capacity = INVENTORY_CONFIG.baseCapacity;

    if (flags?.hasRunbag) {
      capacity += INVENTORY_CONFIG.runbagBonus;
    }

    if (traits?.includes("scholar")) {
      capacity += INVENTORY_CONFIG.scholarBonus;
    }

    if (flags?.godmode) {
      capacity *= INVENTORY_CONFIG.godmodeMultiplier;
    }

    return Math.max(capacity, 1);
  } catch (error) {
    console.error("[EngineFlags] Error calculating inventory capacity:", error);
    return INVENTORY_CONFIG.baseCapacity;
  }
}

// --- Function: hasFlag ---
export function hasFlag(flags: FlagState, flagName: string): boolean {
  try {
    return Boolean(flags?.[flagName]);
  } catch (error) {
    console.error(`[EngineFlags] Error checking flag '${flagName}':`, error);
    return false;
  }
}

// --- Function: setFlag ---
export function setFlag(
  flags: FlagState,
  flagName: string,
  value: unknown = true,
): FlagState {
  try {
    if (!validateFlagName(flagName)) {
      console.warn(`[EngineFlags] Invalid flag name: '${flagName}'`);
      return flags;
    }

    return {
      ...flags,
      [flagName]: value,
    };
  } catch (error) {
    console.error(`[EngineFlags] Error setting flag '${flagName}':`, error);
    return flags;
  }
}

// --- Function: toggleFlag ---
export function toggleFlag(flags: FlagState, flagName: string): FlagState {
  try {
    const currentValue = getFlagValue(flags, flagName, false);
    return setFlag(flags, flagName, !currentValue);
  } catch (error) {
    console.error(`[EngineFlags] Error toggling flag '${flagName}':`, error);
    return flags;
  }
}

// --- Function: incrementFlag ---
export function incrementFlag(
  flags: FlagState,
  flagName: string,
  amount: number = 1,
): FlagState {
  try {
    const currentValue = getFlagValue(flags, flagName, 0);
    return setFlag(flags, flagName, currentValue + amount);
  } catch (error) {
    console.error(
      `[EngineFlags] Error incrementing flag '${flagName}':`,
      error,
    );
    return flags;
  }
}

// --- Function: decrementFlag ---
export function decrementFlag(
  flags: FlagState,
  flagName: string,
  amount: number = 1,
  allowNegative: boolean = false,
): FlagState {
  try {
    const currentValue = getFlagValue(flags, flagName, 0) as number;
    const decrementedValue = currentValue - amount;
    const finalValue = allowNegative
      ? decrementedValue
      : Math.max(0, decrementedValue);
    return setFlag(flags, flagName, finalValue);
  } catch (error) {
    console.error(
      `[EngineFlags] Error decrementing flag '${flagName}':`,
      error,
    );
    return flags;
  }
}

// --- Function: removeFlag ---
export function removeFlag(flags: FlagState, flagName: string): FlagState {
  try {
    const { [flagName]: removed, ...remainingFlags } = flags;
    return remainingFlags;
  } catch (error) {
    console.error(`[EngineFlags] Error removing flag '${flagName}':`, error);
    return flags;
  }
}

// --- Function: unknown> ---
export function getFlagValue<T = unknown>(
  flags: FlagState,
  flagName: string,
  defaultValue?: T,
): T {
  try {
    const value = flags[flagName];
    return value !== undefined ? (value as T) : (defaultValue as T);
  } catch (error) {
    console.error(`[EngineFlags] Error getting flag '${flagName}':`, error);
    return defaultValue as T;
  }
}

// --- Function: checkMultipleFlags ---
export function checkMultipleFlags(
  flags: FlagState,
  flagNames: string[],
  mode: "and" | "or" = "and",
): boolean {
  try {
    if (flagNames.length === 0) {return true;}

    const results = flagNames.map((name) => getFlagValue(flags, name, false));
    return mode === "and"
      ? results.every((result: boolean) => result)
      : results.some((result: boolean) => result);
  } catch (error) {
    console.error("[EngineFlags] Error checking multiple flags:", error);
    return false;
  }
}

// --- Function: applyFlagOperations ---
export function applyFlagOperations(
  flags: FlagState,
  operations: FlagOperation[],
): FlagState {
  try {
    return operations.reduce((currentFlags, operation) => {
      switch (operation.type) {
        case "set":
          return setFlag(currentFlags, operation.key, operation.value);
        case "toggle":
          return toggleFlag(currentFlags, operation.key);
        case "increment":
          return incrementFlag(currentFlags, operation.key, operation.amount);
        case "decrement":
          return decrementFlag(currentFlags, operation.key, operation.amount);
        case "delete":
          return removeFlag(currentFlags, operation.key);
        default:
          console.warn(
            `[EngineFlags] Unknown operation type: ${operation.type}`,
          );
          return currentFlags;
      }
    }, flags);
  } catch (error) {
    console.error("[EngineFlags] Error applying flag operations:", error);
    return flags;
  }
}

// --- Function: validateFlagState ---
export function validateFlagState(flags: unknown): flags is FlagState {
  return typeof flags === "object" && flags !== null;
}

// --- Function: validateFlagName ---
export function validateFlagName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.length > 0 &&
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
  );
}

// --- Function: getFlagStatistics ---
export function getFlagStatistics(flags: FlagState): {
  totalFlags: number;
  booleanFlags: number;
  numericFlags: number;
  stringFlags: number;
  objectFlags: number;
  trueBooleanFlags: number;
} {
  try {
    const entries = Object.entries(flags);

    return {
      totalFlags: entries.length,
      booleanFlags: entries.filter(
        ([_key, v]: [string, any]) => typeof v === "boolean",
      ).length,
      numericFlags: entries.filter(
        ([_key, v]: [string, any]) => typeof v === "number",
      ).length,
      stringFlags: entries.filter(
        ([_key, v]: [string, any]) => typeof v === "string",
      ).length,
      objectFlags: entries.filter(
        ([_key, v]: [string, any]) => typeof v === "object",
      ).length,
      trueBooleanFlags: entries.filter(([_key, v]: [string, any]) => v === true)
        .length,
    };
  } catch (error) {
    console.error("[EngineFlags] Error calculating flag statistics:", error);
    return {
      totalFlags: 0,
      booleanFlags: 0,
      numericFlags: 0,
      stringFlags: 0,
      objectFlags: 0,
      trueBooleanFlags: 0,
    };
  }
}

// --- Function: cloneFlags ---
export function cloneFlags(flags: FlagState): FlagState {
  try {
    return JSON.parse(JSON.stringify(flags));
  } catch (error) {
    console.error("[EngineFlags] Error cloning flags:", error);
    return {};
  }
}

// --- Function: mergeFlags ---
export function mergeFlags(
  baseFlags: FlagState,
  newFlags: FlagState,
): FlagState {
  try {
    return { ...baseFlags, ...newFlags };
  } catch (error) {
    console.error("[EngineFlags] Error merging flags:", error);
    return baseFlags;
  }
}

// --- Function: filterFlags ---
export function filterFlags(
  flags: FlagState,
  predicate: (key: string, value: unknown) => boolean,
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
    console.error("[EngineFlags] Error filtering flags:", error);
    return flags;
  }
}

// Create EngineFlags object containing all functions
const EngineFlags = {
  getInventoryCapacity,
  hasFlag,
  setFlag,
  toggleFlag,
  incrementFlag,
  decrementFlag,
  removeFlag,
  getFlagValue,
  checkMultipleFlags,
  applyFlagOperations,
  validateFlagState,
  validateFlagName,
  getFlagStatistics,
  cloneFlags,
  mergeFlags,
  filterFlags,
};

export default EngineFlags;
