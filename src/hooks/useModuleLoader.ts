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

import { useCallback } from "react";
// Custom hook to dynamically load game modules
export const useModuleLoader = () => {
  // Variable declaration
  const loadModule = useCallback(async (modulePath: string): Promise<any> => {
    const timeout = 3000;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Module load timeout: ${modulePath}`)),
        timeout,
      );
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
