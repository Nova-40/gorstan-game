// src/hooks/useModuleLoader.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import { useCallback } from 'react';
// Custom hook to dynamically load game modules
export const useModuleLoader = () => {
  // Variable declaration
  const loadModule = useCallback(async (modulePath: string): Promise<any> => {
    const timeout = 3000;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Module load timeout: ${modulePath}`)), timeout);
    });

    // Suppress Vite's warning about dynamic imports
    const loadPromise = import(/* @vite-ignore */ modulePath);

    try {
      const module = await Promise.race([loadPromise, timeoutPromise]);
      return module;
    } catch (error) {
      console.error(`[ModuleLoader] Failed to load ${modulePath}:`, error);
      return null;
    }
  }, []);

  return { loadModule };
};
