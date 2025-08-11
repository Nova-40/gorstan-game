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

// (c) Geoff Webster 2025

import type { LocalGameState } from '../state/gameState';

interface OptimizationSettings {
  maxHistoryLength: number;
  maxMessageLength: number;
  compressionEnabled: boolean;
  memoryThreshold: number; // MB
  autoCleanupInterval: number; // minutes
}

interface OptimizationMetrics {
  stateSize: number; // bytes
  compressionRatio: number;
  cleanupCount: number;
  lastOptimization: number;
  sizeBefore: number;
  sizeAfter: number;
}

class GameStateOptimizer {
  private settings: OptimizationSettings;
  private metrics: OptimizationMetrics;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.settings = {
      maxHistoryLength: 200,
      maxMessageLength: 100,
      compressionEnabled: true,
      memoryThreshold: 50, // MB
      autoCleanupInterval: 5 // minutes
    };

    this.metrics = {
      stateSize: 0,
      compressionRatio: 1,
      cleanupCount: 0,
      lastOptimization: 0,
      sizeBefore: 0,
      sizeAfter: 0
    };
  }

  /**
   * Start automatic optimization
   */
  public startAutoOptimization(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.performAutomaticCleanup();
    }, this.settings.autoCleanupInterval * 60 * 1000);

    console.log('[GameStateOptimizer] Auto-optimization started');
  }

  /**
   * Stop automatic optimization
   */
  public stopAutoOptimization(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    console.log('[GameStateOptimizer] Auto-optimization stopped');
  }

  /**
   * Optimize game state
   */
  public optimizeState(state: LocalGameState): LocalGameState {
    console.log('[GameStateOptimizer] Starting state optimization...');
    
    const startTime = performance.now();
    this.metrics.sizeBefore = this.calculateStateSize(state);

    let optimizedState = { ...state };

    // Optimize history
    optimizedState = this.optimizeHistory(optimizedState);

    // Optimize flags
    optimizedState = this.optimizeFlags(optimizedState);

    // Optimize room visit counts
    optimizedState = this.optimizeRoomVisitCounts(optimizedState);

    // Optimize player data
    optimizedState = this.optimizePlayerData(optimizedState);

    // Clean up empty or redundant data
    optimizedState = this.cleanupRedundantData(optimizedState);

    this.metrics.sizeAfter = this.calculateStateSize(optimizedState);
    this.metrics.compressionRatio = this.metrics.sizeBefore / this.metrics.sizeAfter;
    this.metrics.lastOptimization = Date.now();
    this.metrics.cleanupCount++;

    const optimizationTime = performance.now() - startTime;
    
    console.log(`[GameStateOptimizer] Optimization complete in ${optimizationTime.toFixed(2)}ms`);
    console.log(`[GameStateOptimizer] Size reduction: ${this.metrics.sizeBefore} → ${this.metrics.sizeAfter} bytes (${((1 - this.metrics.sizeAfter / this.metrics.sizeBefore) * 100).toFixed(1)}% reduction)`);

    return optimizedState;
  }

  /**
   * Optimize game history
   */
  private optimizeHistory(state: LocalGameState): LocalGameState {
    if (!state.history || state.history.length <= this.settings.maxHistoryLength) {
      return state;
    }

    // Keep recent messages and important system messages
    const importantMessages = state.history.filter(msg => 
      msg.type === 'system' || 
      msg.type === 'error' || 
      msg.text.includes('achievement') ||
      msg.text.includes('save')
    );

    const recentMessages = state.history.slice(-this.settings.maxHistoryLength);
    
    // Merge and deduplicate
    const optimizedHistory = [
      ...importantMessages.slice(0, 20), // Keep up to 20 important messages
      ...recentMessages.slice(-this.settings.maxHistoryLength + 20)
    ].filter((msg, index, arr) => 
      arr.findIndex(m => m.id === msg.id) === index
    );

    return {
      ...state,
      history: optimizedHistory
    };
  }

  /**
   * Optimize game flags
   */
  private optimizeFlags(state: LocalGameState): LocalGameState {
    if (!state.flags) return state;

    const optimizedFlags: Record<string, any> = {};

    // Remove false boolean flags (they're default anyway)
    // Keep important flags and non-boolean values
    Object.entries(state.flags).forEach(([key, value]) => {
      if (value === false && typeof value === 'boolean') {
        // Skip false boolean flags to save space
        return;
      }
      
      if (value === 0 && typeof value === 'number' && !key.includes('Count') && !key.includes('Score')) {
        // Skip zero numeric flags that aren't counters or scores
        return;
      }

      if (value === '' && typeof value === 'string') {
        // Skip empty string flags
        return;
      }

      optimizedFlags[key] = value;
    });

    return {
      ...state,
      flags: optimizedFlags
    };
  }

  /**
   * Optimize room visit counts
   */
  private optimizeRoomVisitCounts(state: LocalGameState): LocalGameState {
    if (!state.roomVisitCount) return state;

    // Remove rooms with zero visits
    const optimizedVisitCounts: Record<string, number> = {};
    
    Object.entries(state.roomVisitCount).forEach(([roomId, count]) => {
      if (count > 0) {
        optimizedVisitCounts[roomId] = count;
      }
    });

    return {
      ...state,
      roomVisitCount: optimizedVisitCounts
    };
  }

  /**
   * Optimize player data
   */
  private optimizePlayerData(state: LocalGameState): LocalGameState {
    if (!state.player) return state;

    const optimizedPlayer = { ...state.player };

    // Optimize reputation (remove neutral values)
    if (optimizedPlayer.reputation) {
      const optimizedReputation: Record<string, number> = {};
      Object.entries(optimizedPlayer.reputation).forEach(([npc, value]) => {
        if (value !== 0) {
          optimizedReputation[npc] = value;
        }
      });
      optimizedPlayer.reputation = optimizedReputation;
    }

    // Optimize NPC relationships (remove neutral values)
    if (optimizedPlayer.npcRelationships) {
      const optimizedRelationships: Record<string, number> = {};
      Object.entries(optimizedPlayer.npcRelationships).forEach(([npc, value]) => {
        if (value !== 0) {
          optimizedRelationships[npc] = value;
        }
      });
      optimizedPlayer.npcRelationships = optimizedRelationships;
    }

    // Remove duplicate inventory items
    if (optimizedPlayer.inventory) {
      optimizedPlayer.inventory = [...new Set(optimizedPlayer.inventory)];
    }

    // Remove duplicate visited rooms
    if (optimizedPlayer.visitedRooms) {
      optimizedPlayer.visitedRooms = [...new Set(optimizedPlayer.visitedRooms)];
    }

    return {
      ...state,
      player: optimizedPlayer
    };
  }

  /**
   * Clean up redundant data
   */
  private cleanupRedundantData(state: LocalGameState): LocalGameState {
    const cleaned = { ...state };

    // Remove undefined/null values from top level
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key as keyof LocalGameState] === undefined || cleaned[key as keyof LocalGameState] === null) {
        delete cleaned[key as keyof LocalGameState];
      }
    });

    // Clean up empty objects
    if (cleaned.miniquestState && Object.keys(cleaned.miniquestState).length === 0) {
      delete cleaned.miniquestState;
    }

    return cleaned;
  }

  /**
   * Calculate state size in bytes
   */
  private calculateStateSize(state: LocalGameState): number {
    try {
      return new Blob([JSON.stringify(state)]).size;
    } catch (error) {
      // Fallback calculation
      return JSON.stringify(state).length * 2; // Rough estimate (UTF-16)
    }
  }

  /**
   * Perform automatic cleanup based on memory usage
   */
  private performAutomaticCleanup(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;

      if (memoryUsageMB > this.settings.memoryThreshold) {
        console.log(`[GameStateOptimizer] Memory usage high (${memoryUsageMB.toFixed(1)}MB), triggering cleanup`);
        
        // Trigger garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }

        // Reduce history length temporarily
        this.settings.maxHistoryLength = Math.max(50, this.settings.maxHistoryLength * 0.8);
        
        console.log(`[GameStateOptimizer] Reduced max history length to ${this.settings.maxHistoryLength}`);
      }
    }
  }

  /**
   * Compress state data (if enabled)
   */
  public compressState(state: LocalGameState): string {
    if (!this.settings.compressionEnabled) {
      return JSON.stringify(state);
    }

    // Simple compression: remove whitespace and use shorter property names
    const compressed = JSON.stringify(state);
    
    // You could implement LZ-string or similar compression here
    // For now, just return the minified JSON
    return compressed;
  }

  /**
   * Decompress state data
   */
  public decompressState(compressedData: string): LocalGameState {
    // Simple decompression: just parse JSON
    // If you implement actual compression, decompress here
    return JSON.parse(compressedData);
  }

  /**
   * Get optimization metrics
   */
  public getMetrics(): OptimizationMetrics {
    return { ...this.metrics };
  }

  /**
   * Update optimization settings
   */
  public updateSettings(newSettings: Partial<OptimizationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('[GameStateOptimizer] Settings updated:', this.settings);
  }

  /**
   * Get current settings
   */
  public getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  /**
   * Generate optimization report
   */
  public generateReport(): string {
    const metrics = this.getMetrics();
    
    return `
=== GAME STATE OPTIMIZATION REPORT ===
Generated: ${new Date().toLocaleString()}

METRICS:
- Current State Size: ${metrics.stateSize} bytes
- Compression Ratio: ${metrics.compressionRatio.toFixed(2)}x
- Total Cleanups: ${metrics.cleanupCount}
- Last Optimization: ${new Date(metrics.lastOptimization).toLocaleString()}
- Size Reduction: ${((1 - metrics.sizeAfter / metrics.sizeBefore) * 100).toFixed(1)}%

SETTINGS:
- Max History Length: ${this.settings.maxHistoryLength}
- Max Message Length: ${this.settings.maxMessageLength}
- Compression Enabled: ${this.settings.compressionEnabled}
- Memory Threshold: ${this.settings.memoryThreshold} MB
- Auto Cleanup Interval: ${this.settings.autoCleanupInterval} minutes

STATUS: ${metrics.stateSize > 1000000 ? '⚠️ Large state detected' : '✅ State size optimal'}
`;
  }
}

// Global optimizer instance
export const gameStateOptimizer = new GameStateOptimizer();

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  gameStateOptimizer.startAutoOptimization();
  
  // Add global commands
  (window as any).gorstan = {
    ...(window as any).gorstan,
    optimizer: {
      getMetrics: () => gameStateOptimizer.getMetrics(),
      getReport: () => console.log(gameStateOptimizer.generateReport()),
      getSettings: () => gameStateOptimizer.getSettings(),
      updateSettings: (settings: any) => gameStateOptimizer.updateSettings(settings)
    }
  };
}

export default gameStateOptimizer;
