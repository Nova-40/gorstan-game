import { FlagRegistry } from '../state/flagRegistry';

import { NPC } from './NPCTypes';

import { useCallback } from 'react';

import { useGameState } from '../state/gameState';



// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useFlags.ts
// Description: Unified flag management hook for Gorstan game


/**
 * Unified flag management hook that consolidates all flag operations
 * Reduces code duplication and provides type-safe flag handling
 */
export const useFlags = () => {
  const { state, dispatch } = useGameState();

  /**
   * Set a flag to a specific value
   */
  // Accepts either a registry key or a string, but prefers registry
  const setFlag = useCallback((key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string, value: boolean | string | number) => {
    const flagKey = typeof key === 'string' ? key : key;
    dispatch({ type: 'SET_FLAG', payload: { key: flagKey, value } });
  }, [dispatch]);

  /**
   * Clear a flag (set to false)
   */
  const clearFlag = useCallback((key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string) => {
    setFlag(key, false);
  }, [setFlag]);

  /**
   * Clear multiple flags at once
   */
  const clearFlags = useCallback((keys: Array<keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string>) => {
    keys.forEach(key => clearFlag(key));
  }, [clearFlag]);

  /**
   * Get a flag value with optional default
   */
  const getFlag = useCallback(<T = boolean | string | number>(
    key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string,
    defaultValue: T
  ): T => {
    const flagKey = typeof key === 'string' ? key : key;
    return (state.flags?.[flagKey] as T) ?? defaultValue;
  }, [state.flags]);

  /**
   * Check if a flag exists and is truthy
   */
  const hasFlag = useCallback((key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string): boolean => {
    const flagKey = typeof key === 'string' ? key : key;
    return Boolean(state.flags?.[flagKey]);
  }, [state.flags]);

  /**
   * Check if any of the provided flags are truthy
   */
  const hasAnyFlag = useCallback((keys: Array<keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string>): boolean => {
    return keys.some(key => hasFlag(key));
  }, [hasFlag]);

  /**
   * Check if all of the provided flags are truthy
   */
  const hasAllFlags = useCallback((keys: Array<keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string>): boolean => {
    return keys.every(key => hasFlag(key));
  }, [hasFlag]);

  /**
   * Toggle a boolean flag
   */
  const toggleFlag = useCallback((key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string) => {
    const currentValue = Boolean(getFlag(key, false));
    setFlag(key, !currentValue);
  }, [getFlag, setFlag]);

  /**
   * Increment a numeric flag
   */
  const incrementFlag = useCallback((key: keyof typeof FlagRegistry[keyof typeof FlagRegistry] | string, amount: number = 1) => {
    const currentValue = Number(getFlag(key, 0));
    setFlag(key, currentValue + amount);
  }, [getFlag, setFlag]);

  /**
   * Get all flags that match a pattern
   */
  const getFlagsMatching = useCallback((pattern: RegExp): Record<string, any> => {
    const matchingFlags: Record<string, any> = {};
    Object.entries(state.flags || {}).forEach(([key, value]) => {
      if (pattern.test(key)) {
        matchingFlags[key] = value;
      }
    });
    return matchingFlags;
  }, [state.flags]);

  return {
    setFlag,
    clearFlag,
    clearFlags,
    getFlag,
    hasFlag,
    hasAnyFlag,
    hasAllFlags,
    toggleFlag,
    incrementFlag,
    getFlagsMatching
  };
};

/**
 * Common flag patterns for convenience
 */
export const FLAG_PATTERNS = {
  SITTING: /^sittingIn.*Chair$/,
  DEBUG: /^debug.*$/,
  PENDING: /^pending.*Command$/,
  NPC: /^.*NPC.*$/,
  TRAVEL: /^travel.*$/,
} as const;
