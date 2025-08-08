// src/npc/wanderScheduler.ts
// Gorstan Game Beta 1 - NPC Dialogue Engine v2
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Deterministic, pausable wandering scheduler for NPCs

export interface WanderSchedulerConfig {
  baseTickMs: number;
  jitterRangeMs: [number, number];
  seed: string;
  pauseConditions: {
    overlays: boolean;
    cutscenes: boolean;
    modals: boolean;
    teleport: boolean;
    death: boolean;
  };
}

export interface NPCWanderState {
  npcId: string;
  nextMoveTime: number;
  lastMoveTime: number;
  jitterMs: number;
  isPaused: boolean;
  pauseReason?: string;
}

export interface PauseScope {
  global?: boolean;
  npcIds?: string[];
  reason: string;
}

// Default configuration
const DEFAULT_CONFIG: WanderSchedulerConfig = {
  baseTickMs: 1000, // 1 second base tick
  jitterRangeMs: [100, 300], // 100-300ms jitter per NPC
  seed: 'gorstan-wander-v1',
  pauseConditions: {
    overlays: true,
    cutscenes: true,
    modals: true,
    teleport: true,
    death: true
  }
};

export class WanderScheduler {
  private config: WanderSchedulerConfig;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private npcStates: Map<string, NPCWanderState> = new Map();
  private pauseScopes: Map<string, PauseScope> = new Map();
  private rng: () => number;
  private moveCallbacks: Map<string, (npcId: string) => Promise<void>> = new Map();
  private lastTickTime: number = 0;
  private tickCount: number = 0;

  constructor(config: Partial<WanderSchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rng = this.createSeededRNG(this.config.seed);
  }

  /**
   * Start the wandering scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[WanderScheduler] Already running');
      return;
    }

    this.isRunning = true;
    this.lastTickTime = Date.now();
    this.tickCount = 0;

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.config.baseTickMs);

    console.log('[WanderScheduler] Started with config:', {
      baseTickMs: this.config.baseTickMs,
      jitterRange: this.config.jitterRangeMs,
      registeredNPCs: this.npcStates.size
    });
  }

  /**
   * Stop the scheduler completely
   */
  stop(reason: string = 'manual'): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log(`[WanderScheduler] Stopped: ${reason}`);
  }

  /**
   * Pause wandering for specific scope
   */
  pause(scope: PauseScope): void {
    const scopeId = this.generateScopeId(scope);
    this.pauseScopes.set(scopeId, scope);

    if (scope.global) {
      // Pause all NPCs
      for (const state of this.npcStates.values()) {
        state.isPaused = true;
        state.pauseReason = scope.reason;
      }
    } else if (scope.npcIds) {
      // Pause specific NPCs
      for (const npcId of scope.npcIds) {
        const state = this.npcStates.get(npcId);
        if (state) {
          state.isPaused = true;
          state.pauseReason = scope.reason;
        }
      }
    }

    console.log(`[WanderScheduler] Paused scope: ${scope.reason}`, scope);
  }

  /**
   * Resume wandering for specific scope
   */
  resume(scope: PauseScope): void {
    const scopeId = this.generateScopeId(scope);
    const existingScope = this.pauseScopes.get(scopeId);
    
    if (!existingScope) {
      console.warn('[WanderScheduler] Cannot resume unknown scope:', scope.reason);
      return;
    }

    this.pauseScopes.delete(scopeId);

    if (scope.global) {
      // Check if any other global pauses exist
      const hasGlobalPause = Array.from(this.pauseScopes.values()).some(s => s.global);
      if (!hasGlobalPause) {
        for (const state of this.npcStates.values()) {
          state.isPaused = false;
          state.pauseReason = undefined;
        }
      }
    } else if (scope.npcIds) {
      // Resume specific NPCs if no other pauses affect them
      for (const npcId of scope.npcIds) {
        const state = this.npcStates.get(npcId);
        if (state && !this.isNPCPausedByOtherScopes(npcId)) {
          state.isPaused = false;
          state.pauseReason = undefined;
        }
      }
    }

    console.log(`[WanderScheduler] Resumed scope: ${scope.reason}`);
  }

  /**
   * Register an NPC for wandering
   */
  registerNPC(npcId: string, callback: (npcId: string) => Promise<void>): void {
    const jitterMs = this.getJitterForNPC(npcId);
    const now = Date.now();
    
    this.npcStates.set(npcId, {
      npcId,
      nextMoveTime: now + this.config.baseTickMs + jitterMs,
      lastMoveTime: 0,
      jitterMs,
      isPaused: false
    });

    this.moveCallbacks.set(npcId, callback);
    
    console.log(`[WanderScheduler] Registered NPC: ${npcId} (jitter: ${jitterMs}ms)`);
  }

  /**
   * Unregister an NPC from wandering
   */
  unregisterNPC(npcId: string): void {
    this.npcStates.delete(npcId);
    this.moveCallbacks.delete(npcId);
    console.log(`[WanderScheduler] Unregistered NPC: ${npcId}`);
  }

  /**
   * Get current state of an NPC
   */
  getNPCState(npcId: string): NPCWanderState | null {
    return this.npcStates.get(npcId) || null;
  }

  /**
   * Get scheduler statistics
   */
  getStats(): {
    isRunning: boolean;
    totalTicks: number;
    registeredNPCs: number;
    pausedNPCs: number;
    activePauseScopes: number;
    uptime: number;
  } {
    const pausedCount = Array.from(this.npcStates.values()).filter(s => s.isPaused).length;
    
    return {
      isRunning: this.isRunning,
      totalTicks: this.tickCount,
      registeredNPCs: this.npcStates.size,
      pausedNPCs: pausedCount,
      activePauseScopes: this.pauseScopes.size,
      uptime: this.lastTickTime - (this.lastTickTime - (this.tickCount * this.config.baseTickMs))
    };
  }

  /**
   * Force immediate move for an NPC (bypasses cooldown)
   */
  async forceMove(npcId: string): Promise<void> {
    const state = this.npcStates.get(npcId);
    const callback = this.moveCallbacks.get(npcId);
    
    if (!state || !callback) {
      console.warn(`[WanderScheduler] Cannot force move unknown NPC: ${npcId}`);
      return;
    }

    if (state.isPaused) {
      console.warn(`[WanderScheduler] Cannot force move paused NPC: ${npcId} (${state.pauseReason})`);
      return;
    }

    const now = Date.now();
    try {
      await callback(npcId);
      state.lastMoveTime = now;
      state.nextMoveTime = now + this.config.baseTickMs + state.jitterMs;
      console.log(`[WanderScheduler] Force moved NPC: ${npcId}`);
    } catch (error) {
      console.error(`[WanderScheduler] Error in force move for ${npcId}:`, error);
    }
  }

  // Private methods

  /**
   * Main tick function - enforces "one move per tick" invariant
   */
  private tick(): void {
    const now = Date.now();
    this.lastTickTime = now;
    this.tickCount++;

    if (!this.isRunning) {
      return;
    }

    // Track NPCs that moved this tick to enforce invariant
    const movedThisTick = new Set<string>();
    const movePromises: Promise<void>[] = [];

    for (const [npcId, state] of this.npcStates) {
      if (state.isPaused || movedThisTick.has(npcId)) {
        continue;
      }

      if (now >= state.nextMoveTime) {
        const callback = this.moveCallbacks.get(npcId);
        if (callback) {
          movedThisTick.add(npcId);
          const movePromise = this.executeMove(npcId, state, callback, now);
          movePromises.push(movePromise);
        }
      }
    }

    // Wait for all moves to complete (optional - for debugging)
    if (movePromises.length > 0) {
      Promise.allSettled(movePromises).then(results => {
        const failed = results.filter(r => r.status === 'rejected').length;
        if (failed > 0) {
          console.warn(`[WanderScheduler] ${failed}/${results.length} moves failed this tick`);
        }
      });
    }
  }

  /**
   * Execute a single NPC move
   */
  private async executeMove(
    npcId: string, 
    state: NPCWanderState, 
    callback: (npcId: string) => Promise<void>,
    now: number
  ): Promise<void> {
    try {
      await callback(npcId);
      state.lastMoveTime = now;
      state.nextMoveTime = now + this.config.baseTickMs + state.jitterMs;
      
      // DEV logging
      if (this.config.seed.includes('debug')) {
        console.log(`[WanderScheduler] DEV:WANDER ${npcId} moved (next: ${state.nextMoveTime - now}ms)`);
      }
    } catch (error) {
      console.error(`[WanderScheduler] Error moving ${npcId}:`, error);
      // Back off on error - double the wait time
      state.nextMoveTime = now + (this.config.baseTickMs * 2) + state.jitterMs;
    }
  }

  /**
   * Create seeded RNG for deterministic behavior
   */
  private createSeededRNG(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return () => {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  /**
   * Get consistent jitter for an NPC based on seeded RNG
   */
  private getJitterForNPC(npcId: string): number {
    const [min, max] = this.config.jitterRangeMs;
    const npcSeed = this.config.seed + npcId;
    const npcRng = this.createSeededRNG(npcSeed);
    return Math.floor(min + (npcRng() * (max - min)));
  }

  /**
   * Generate unique scope ID for pause/resume tracking
   */
  private generateScopeId(scope: PauseScope): string {
    if (scope.global) {
      return `global:${scope.reason}`;
    } else if (scope.npcIds) {
      return `npcs:${scope.npcIds.sort().join(',')}:${scope.reason}`;
    }
    return `unknown:${scope.reason}`;
  }

  /**
   * Check if an NPC is paused by other active scopes
   */
  private isNPCPausedByOtherScopes(npcId: string): boolean {
    for (const scope of this.pauseScopes.values()) {
      if (scope.global || (scope.npcIds && scope.npcIds.includes(npcId))) {
        return true;
      }
    }
    return false;
  }
}

// Singleton instance
let globalScheduler: WanderScheduler | null = null;

/**
 * Get or create the global wander scheduler
 */
export function getWanderScheduler(config?: Partial<WanderSchedulerConfig>): WanderScheduler {
  if (!globalScheduler) {
    globalScheduler = new WanderScheduler(config);
  }
  return globalScheduler;
}

/**
 * Convenience functions for common operations
 */
export function startWandering(config?: Partial<WanderSchedulerConfig>): void {
  const scheduler = getWanderScheduler(config);
  scheduler.start();
}

export function stopWandering(reason?: string): void {
  if (globalScheduler) {
    globalScheduler.stop(reason);
  }
}

export function pauseGlobalWandering(reason: string): void {
  const scheduler = getWanderScheduler();
  scheduler.pause({ global: true, reason });
}

export function resumeGlobalWandering(reason: string): void {
  const scheduler = getWanderScheduler();
  scheduler.resume({ global: true, reason });
}

export function pauseNPCWandering(npcIds: string[], reason: string): void {
  const scheduler = getWanderScheduler();
  scheduler.pause({ npcIds, reason });
}

export function resumeNPCWandering(npcIds: string[], reason: string): void {
  const scheduler = getWanderScheduler();
  scheduler.resume({ npcIds, reason });
}

/**
 * Initialize wandering for common game states
 */
export function initializeGameWandering(): void {
  const scheduler = getWanderScheduler({
    seed: `gorstan-${Date.now()}-${Math.random()}` // Unique per session
  });

  // Auto-pause during common overlay states
  const originalPause = scheduler.pause.bind(scheduler);
  const originalResume = scheduler.resume.bind(scheduler);

  // Monitor for overlay states (would be connected to actual game state)
  (window as any).wanderScheduler = {
    pause: originalPause,
    resume: originalResume,
    scheduler
  };

  console.log('[WanderScheduler] Initialized for game');
}
