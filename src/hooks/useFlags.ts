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
// Game module.

import { FlagMap as FlagRegistryType } from '../state/flagRegistry'; // Adjusted import to match actual export

import { useCallback } from 'react';

import { useGameState } from '../state/gameState';











type FlagKey = keyof typeof FlagRegistryType[keyof typeof FlagRegistryType] | string;

export const useFlags = () => {
  const { state, dispatch } = useGameState();

  const setFlag = useCallback((key: FlagKey, value: boolean | string | number) => {
    const flagKey = String(key); // Ensure key is a string
    dispatch({ type: 'SET_FLAG', payload: { key: flagKey, value } });
  }, [dispatch]);

  const clearFlag = useCallback((key: FlagKey) => {
    setFlag(key, false);
  }, [setFlag]);

  const clearFlags = useCallback((keys: Array<FlagKey>) => {
    keys.forEach(key => clearFlag(key));
  }, [clearFlag]);

  const getFlag = useCallback(<T = boolean | string | number>(
    key: FlagKey,
    defaultValue: T
  ): T => {
    const flagKey = String(key); // Ensure key is a string
    return (state.flags?.[flagKey] as T) ?? defaultValue;
  }, [state.flags]);

  const hasFlag = useCallback((key: FlagKey): boolean => {
    const flagKey = String(key); // Ensure key is a string
    return Boolean(state.flags?.[flagKey]);
  }, [state.flags]);

  const hasAnyFlag = useCallback((keys: Array<FlagKey>): boolean => {
    return keys.some(key => hasFlag(key));
  }, [hasFlag]);

  const hasAllFlags = useCallback((keys: Array<FlagKey>): boolean => {
    return keys.every(key => hasFlag(key));
  }, [hasFlag]);

  const toggleFlag = useCallback((key: FlagKey) => {
    const currentValue = Boolean(getFlag(key, false));
    setFlag(key, !currentValue);
  }, [getFlag, setFlag]);

  const incrementFlag = useCallback((key: FlagKey, amount: number = 1) => {
    const currentValue = Number(getFlag(key, 0));
    setFlag(key, currentValue + amount);
  }, [getFlag, setFlag]);

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


export const FLAG_PATTERNS = {
  SITTING: /^sittingIn.*Chair$/,
  DEBUG: /^debug.*$/,
  PENDING: /^pending.*Command$/,
  NPC: /^.*NPC.*$/,
  TRAVEL: /^travel.*$/,
} as const;
