// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useModuleLoader.ts
// Description: Unified dynamic module loading hook for Gorstan game

import { useCallback, useState, useRef } from 'react';

interface LoadedModule<T = any> {
  module: T;
  timestamp: number;
}

interface ModuleLoaderState {
  loading: Set<string>;
  cache: Map<string, LoadedModule>;
  errors: Map<string, Error>;
}

/**
 * Unified module loader hook that handles all dynamic imports
 * Provides caching, error handling, and loading state management
 */
export const useModuleLoader = () => {
  const [state] = useState<ModuleLoaderState>(() => ({
    loading: new Set(),
    cache: new Map(),
    errors: new Map()
  }));
  
  const stateRef = useRef(state);
  stateRef.current = state;
  
  /**
   * Load a module dynamically with caching and error handling
   */
  const loadModule = useCallback(async <T = any>(
    modulePath: string,
    options: {
      forceReload?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T | null> => {
    const { forceReload = false, timeout = 10000, retries = 2 } = options;
    const currentState = stateRef.current;
    
    // Return cached module if available and not forcing reload
    if (!forceReload && currentState.cache.has(modulePath)) {
      const cached = currentState.cache.get(modulePath)!;
      return cached.module as T;
    }
    
    // Prevent duplicate loads
    if (currentState.loading.has(modulePath)) {
      // Wait for existing load to complete
      while (currentState.loading.has(modulePath)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return result from cache or null if failed
      const cached = currentState.cache.get(modulePath);
      return cached ? cached.module as T : null;
    }
    
    currentState.loading.add(modulePath);
    currentState.errors.delete(modulePath); // Clear previous errors
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Module load timeout: ${modulePath}`)), timeout);
        });
        
        const loadPromise = import(modulePath);
        
        const module = await Promise.race([loadPromise, timeoutPromise]) as T;
        
        // Cache the loaded module
        currentState.cache.set(modulePath, {
          module,
          timestamp: Date.now()
        });
        
        currentState.loading.delete(modulePath);
        return module;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries) {
          currentState.errors.set(modulePath, lastError);
          console.error(`Failed to load module after ${retries + 1} attempts:`, modulePath, lastError);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    currentState.loading.delete(modulePath);
    return null;
  }, []);
  
  /**
   * Load multiple modules in parallel
   */
  const loadModules = useCallback(async <T = any>(
    modulePaths: string[],
    options?: Parameters<typeof loadModule>[1]
  ): Promise<(T | null)[]> => {
    const promises = modulePaths.map(path => loadModule<T>(path, options));
    return Promise.all(promises);
  }, [loadModule]);
  
  /**
   * Check if a module is currently loading
   */
  const isLoading = useCallback((modulePath: string): boolean => {
    return stateRef.current.loading.has(modulePath);
  }, []);
  
  /**
   * Check if any modules are currently loading
   */
  const isAnyLoading = useCallback((): boolean => {
    return stateRef.current.loading.size > 0;
  }, []);
  
  /**
   * Get error for a specific module
   */
  const getError = useCallback((modulePath: string): Error | null => {
    return stateRef.current.errors.get(modulePath) || null;
  }, []);
  
  /**
   * Clear cached module
   */
  const clearCache = useCallback((modulePath?: string) => {
    if (modulePath) {
      stateRef.current.cache.delete(modulePath);
      stateRef.current.errors.delete(modulePath);
    } else {
      stateRef.current.cache.clear();
      stateRef.current.errors.clear();
    }
  }, []);
  
  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const currentState = stateRef.current;
    return {
      cached: currentState.cache.size,
      loading: currentState.loading.size,
      errors: currentState.errors.size,
      totalMemory: Array.from(currentState.cache.values())
        .reduce((sum, { module }) => sum + (JSON.stringify(module).length || 0), 0)
    };
  }, []);
  
  /**
   * Preload modules for performance optimization
   */
  const preloadModules = useCallback(async (
    modulePaths: string[],
    options?: Parameters<typeof loadModule>[1]
  ): Promise<void> => {
    // Load modules in background without blocking
    modulePaths.forEach(path => {
      loadModule(path, options).catch(error => {
        console.warn(`Failed to preload module: ${path}`, error);
      });
    });
  }, [loadModule]);
  
  return {
    loadModule,
    loadModules,
    isLoading,
    isAnyLoading,
    getError,
    clearCache,
    getCacheStats,
    preloadModules
  };
};

/**
 * Common module paths for the Gorstan game
 */
export const MODULE_PATHS = {
  CONTROLLERS: {
    AUDIO: '../engine/audio/audioController',
    SAVE: '../engine/save/saveController',
    FLAG: '../engine/flagController',
    TRANSITION: '../engine/transitionController',
    COMMAND: '../engine/commandProcessor',
    NPC: '../engine/npcController'
  },
  COMPONENTS: {
    ROOM_VIEWER: '../components/RoomViewer',
    QUICK_ACTIONS: '../components/QuickActions',
    SIDE_PANEL: '../components/sidePanel/SidePanel'
  },
  UTILS: {
    TERMINAL_COLORS: '../utils/terminalColors',
    CHAT_ANALYZER: '../utils/chatAnalyzer',
    ROOM_UTILS: '../utils/roomUtils'
  }
} as const;
