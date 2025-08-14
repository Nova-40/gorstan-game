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

// src/npc/movementExecution.ts
// Movement execution layer that orchestrates NPC movement decisions and updates
// Integrates WanderScheduler, MovePolicy, and NPCPresence systems

import { getWanderScheduler } from "./wanderScheduler";
import { getNPCPresenceProvider } from "./npcPresence";
import {
  decideMove,
  createDefaultPolicy,
  NPCMoveContext,
  MovePolicyConfig,
} from "./movePolicy";
import { getWanderActivationController } from "./wanderActivation";
import { getZoneAwarenessProvider, ZoneSetupConfig } from "./zoneAwareness";
import { getPerformanceOptimizer } from "./performanceOptimizer";
import { getAccessibilityProvider } from "./accessibilityProvider";
import {
  getErrorHandler,
  NPCErrorType,
  NPCErrorSeverity,
  createSafeWrapper,
} from "./errorHandling";
import { getGameState } from "../state/gameState";

export interface NPCMovementConfig {
  npcId: string;
  npcType: "wanderer" | "guard" | "seeker" | "hermit";
  homeRoom?: string;
  roamRadius?: number;
  preferRooms?: string[];
  avoidRooms?: string[];
  customPolicy?: MovePolicyConfig;
  isActive?: boolean;
}

export interface MovementExecutionResult {
  success: boolean;
  npcId: string;
  fromRoom: string;
  toRoom: string | null;
  reason: string;
  requiresTeleport: boolean;
  timestamp: number;
}

export interface MovementStats {
  totalNPCs: number;
  activeNPCs: number;
  movingNPCs: number;
  successfulMoves: number;
  failedMoves: number;
  teleportMoves: number;
  lastUpdateTime: number;
}

/**
 * Movement execution layer that orchestrates NPC movement
 * Connects wandering scheduler with movement policies and presence tracking
 */
export class MovementExecutor {
  private npcConfigs = new Map<string, NPCMovementConfig>();
  private roomRegistry = new Map<string, string[]>(); // roomId -> adjacent rooms
  private isRunning = false;
  private stats: MovementStats = {
    totalNPCs: 0,
    activeNPCs: 0,
    movingNPCs: 0,
    successfulMoves: 0,
    failedMoves: 0,
    teleportMoves: 0,
    lastUpdateTime: Date.now(),
  };

  constructor() {
    console.log("[MovementExecution] Initialized movement executor");
  }

  /**
   * Start the movement execution system
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[MovementExecution] Already running");
      return;
    }

    this.isRunning = true;

    // Start dependent systems with error handling
    try {
      const scheduler = getWanderScheduler();
      const presence = getNPCPresenceProvider();
      const zoneAwareness = getZoneAwarenessProvider();
      const optimizer = getPerformanceOptimizer();
      const accessibility = getAccessibilityProvider();

      // Initialize performance monitoring
      optimizer.startMonitoring();

      // Enable accessibility features
      accessibility.enable();

      // Note: WanderActivationController doesn't have start/stop methods
      // It operates reactively based on game state updates

      presence.start();
      scheduler.start();
      zoneAwareness.initialize();

      console.log("[MovementExecution] Started movement execution system");
    } catch (error) {
      getErrorHandler().reportError(
        NPCErrorType.CONFIGURATION_ERROR,
        `Failed to start movement execution: ${(error as Error).message}`,
        { error },
        NPCErrorSeverity.HIGH,
      );
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the movement execution system
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    try {
      // Stop dependent systems
      const scheduler = getWanderScheduler();
      const presence = getNPCPresenceProvider();
      const optimizer = getPerformanceOptimizer();
      const accessibility = getAccessibilityProvider();

      scheduler.stop("MovementExecutor stopped");
      presence.stop();
      optimizer.stopMonitoring();
      accessibility.disable();

      console.log("[MovementExecution] Stopped movement execution system");
    } catch (error) {
      getErrorHandler().reportError(
        NPCErrorType.CONFIGURATION_ERROR,
        `Error during shutdown: ${(error as Error).message}`,
        { error },
        NPCErrorSeverity.MEDIUM,
      );
    }
  }

  /**
   * Register an NPC for movement execution
   */
  registerNPC(config: NPCMovementConfig): void {
    if (!this.isRunning) {
      console.warn("[MovementExecution] Cannot register NPC while stopped");
      return;
    }

    // Store configuration
    this.npcConfigs.set(config.npcId, {
      ...config,
      isActive: config.isActive ?? true,
    });

    // Get current room from presence provider or use home room
    const presence = getNPCPresenceProvider();
    const currentRoom =
      presence.getNPCState(config.npcId)?.currentRoom ||
      config.homeRoom ||
      "unknown";

    // Register with presence provider
    presence.registerNPC(config.npcId, currentRoom);

    // Register with wandering scheduler
    const scheduler = getWanderScheduler();
    scheduler.registerNPC(config.npcId, (npcId) => this.executeMovement(npcId));

    this.updateStats();
    console.log(
      `[MovementExecution] Registered NPC ${config.npcId} (type: ${config.npcType})`,
    );
  }

  /**
   * Unregister an NPC
   */
  unregisterNPC(npcId: string): void {
    this.npcConfigs.delete(npcId);

    // Unregister from systems
    const scheduler = getWanderScheduler();
    const presence = getNPCPresenceProvider();

    scheduler.unregisterNPC(npcId);
    presence.unregisterNPC(npcId);

    this.updateStats();
    console.log(`[MovementExecution] Unregistered NPC ${npcId}`);
  }

  /**
   * Update NPC configuration
   */
  updateNPCConfig(npcId: string, updates: Partial<NPCMovementConfig>): void {
    const config = this.npcConfigs.get(npcId);
    if (!config) {
      console.warn(`[MovementExecution] Cannot update unknown NPC ${npcId}`);
      return;
    }

    // Apply updates
    Object.assign(config, updates);
    this.npcConfigs.set(npcId, config);

    console.log(`[MovementExecution] Updated config for NPC ${npcId}`);
  }

  /**
   * Set room adjacency data
   */
  setRoomAdjacency(roomId: string, adjacentRooms: string[]): void {
    this.roomRegistry.set(roomId, [...adjacentRooms]);
    console.log(
      `[MovementExecution] Set adjacency for room ${roomId}: ${adjacentRooms.length} connections`,
    );
  }

  /**
   * Bulk set room adjacency data
   */
  setRoomRegistry(registry: Record<string, string[]>): void {
    this.roomRegistry.clear();
    Object.entries(registry).forEach(([roomId, adjacent]) => {
      this.roomRegistry.set(roomId, [...adjacent]);
    });
    console.log(
      `[MovementExecution] Set room registry with ${Object.keys(registry).length} rooms`,
    );
  }

  /**
   * Activate/deactivate an NPC
   */
  setNPCActive(npcId: string, active: boolean): void {
    const config = this.npcConfigs.get(npcId);
    if (!config) {
      console.warn(`[MovementExecution] Cannot activate unknown NPC ${npcId}`);
      return;
    }

    config.isActive = active;
    this.updateStats();
    console.log(`[MovementExecution] Set NPC ${npcId} active: ${active}`);
  }

  /**
   * Check if an NPC can move to a specific room (includes zone restrictions)
   */
  canNPCMoveToRoom(
    npcId: string,
    fromRoom: string,
    toRoom: string,
  ): {
    allowed: boolean;
    reason?: string;
    alternative?: string[];
  } {
    const config = this.npcConfigs.get(npcId);
    if (!config) {
      return { allowed: false, reason: "NPC not registered" };
    }

    // Check zone restrictions
    const zoneAwareness = getZoneAwarenessProvider();
    const zoneResult = zoneAwareness.canNPCMoveToRoom(
      npcId,
      config.npcType,
      fromRoom,
      toRoom,
    );

    if (!zoneResult.allowed) {
      return zoneResult;
    }

    // Additional movement checks could go here
    // (e.g., room capacity, NPC presence conflicts, etc.)

    return { allowed: true };
  }

  /**
   * Get preferred rooms for an NPC based on zone preferences
   */
  getPreferredRoomsForNPC(npcId: string, availableRooms: string[]): string[] {
    const config = this.npcConfigs.get(npcId);
    if (!config) {
      return availableRooms;
    }

    const zoneAwareness = getZoneAwarenessProvider();
    return zoneAwareness.getPreferredRoomsForNPC(npcId, availableRooms);
  }

  /**
   * Get NPC configuration
   */
  getNPCConfig(npcId: string): NPCMovementConfig | null {
    return this.npcConfigs.get(npcId) || null;
  }

  /**
   * Get movement statistics
   */
  getStats(): MovementStats {
    return { ...this.stats };
  }

  /**
   * Get all registered NPCs
   */
  getRegisteredNPCs(): string[] {
    return Array.from(this.npcConfigs.keys());
  }

  /**
   * Clear all NPCs and data
   */
  clear(): void {
    this.npcConfigs.clear();
    this.roomRegistry.clear();

    // Clear dependent systems
    const scheduler = getWanderScheduler();
    const presence = getNPCPresenceProvider();

    presence.clear();
    // Note: scheduler doesn't have a clear method, unregister individually

    this.resetStats();
    console.log("[MovementExecution] Cleared all movement data");
  }

  // Private methods

  /**
   * Execute movement for a specific NPC
   */
  private async executeMovement(npcId: string): Promise<void> {
    const startTime = performance.now();
    const optimizer = getPerformanceOptimizer();
    const accessibility = getAccessibilityProvider();

    try {
      // Check if movement should be slowed for accessibility
      const speedMultiplier = accessibility.getMovementSpeedMultiplier();
      if (speedMultiplier < 1.0) {
        const delay = 1000 * (1 - speedMultiplier);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Execute movement with performance monitoring
      const result = await this.attemptMovement(npcId);

      // Record performance metrics
      const executionTime = performance.now() - startTime;
      optimizer.getMetrics().averageMovementTimeMs =
        optimizer.getMetrics().averageMovementTimeMs * 0.9 +
        executionTime * 0.1;

      if (result.success) {
        this.stats.successfulMoves++;
        if (result.requiresTeleport) {
          this.stats.teleportMoves++;
        }

        // Announce movement for accessibility
        if (
          result.fromRoom &&
          result.toRoom &&
          result.fromRoom !== result.toRoom
        ) {
          accessibility.announceNPCMovement(
            npcId,
            npcId, // Use npcId as display name for now
            result.fromRoom,
            result.toRoom,
            "transit",
          );
        }
      } else {
        this.stats.failedMoves++;

        // Report error for tracking
        getErrorHandler().reportError(
          NPCErrorType.MOVEMENT_FAILED,
          result.reason || "Unknown movement failure",
          { npcId, fromRoom: result.fromRoom, toRoom: result.toRoom },
          NPCErrorSeverity.LOW,
        );
      }

      this.stats.lastUpdateTime = Date.now();
      this.updateStats();

      console.log(
        `[MovementExecution] ${npcId}: ${result.reason} (${result.fromRoom} -> ${result.toRoom}) [${executionTime.toFixed(1)}ms]`,
      );
    } catch (error) {
      const executionTime = performance.now() - startTime;
      console.error(`[MovementExecution] Movement error for ${npcId}:`, error);

      // Report critical error
      getErrorHandler().reportError(
        NPCErrorType.MOVEMENT_FAILED,
        `Critical movement error: ${(error as Error).message}`,
        { npcId, executionTime, error },
        NPCErrorSeverity.HIGH,
      );

      this.stats.failedMoves++;
    }
  }

  /**
   * Attempt to move an NPC
   */
  private async attemptMovement(
    npcId: string,
  ): Promise<MovementExecutionResult> {
    const config = this.npcConfigs.get(npcId);
    const presence = getNPCPresenceProvider();
    const currentState = presence.getNPCState(npcId);
    const optimizer = getPerformanceOptimizer();
    const errorHandler = getErrorHandler();

    // Basic validation
    if (!config || !currentState || !config.isActive) {
      return {
        success: false,
        npcId,
        fromRoom: currentState?.currentRoom || "unknown",
        toRoom: null,
        reason: "NPC inactive or not found",
        requiresTeleport: false,
        timestamp: Date.now(),
      };
    }

    // Check if system is degraded and movement should be limited
    if (!errorHandler.isFeatureEnabled("random-movement")) {
      return {
        success: false,
        npcId,
        fromRoom: currentState.currentRoom,
        toRoom: null,
        reason: "Movement disabled due to system degradation",
        requiresTeleport: false,
        timestamp: Date.now(),
      };
    }

    // Check if already moving
    if (currentState.isMoving) {
      return {
        success: false,
        npcId,
        fromRoom: currentState.currentRoom,
        toRoom: null,
        reason: "Already moving",
        requiresTeleport: false,
        timestamp: Date.now(),
      };
    }

    // Build movement context with performance optimization
    const context = this.buildMoveContext(
      npcId,
      config,
      currentState.currentRoom,
    );

    // Get movement policy
    const policy = config.customPolicy || createDefaultPolicy(config.npcType);

    // Use optimized pathfinding if available and feature enabled
    let decision;
    if (errorHandler.isFeatureEnabled("complex-pathfinding")) {
      decision = await this.decideOptimizedMovement(
        context,
        policy,
        npcId,
        currentState.currentRoom,
      );
    } else {
      decision = decideMove(context, policy);
    }

    if (!decision.targetRoom) {
      return {
        success: false,
        npcId,
        fromRoom: currentState.currentRoom,
        toRoom: null,
        reason: decision.reason,
        requiresTeleport: false,
        timestamp: Date.now(),
      };
    }

    // Execute the movement
    const moveStarted = presence.startMove(
      npcId,
      currentState.currentRoom,
      decision.targetRoom,
    );

    if (!moveStarted) {
      return {
        success: false,
        npcId,
        fromRoom: currentState.currentRoom,
        toRoom: decision.targetRoom,
        reason: "Could not start move (room full or other constraint)",
        requiresTeleport: decision.requiresTeleport || false,
        timestamp: Date.now(),
      };
    }

    // Complete the movement immediately (for now, could add animation delay)
    const moveCompleted = presence.completeMove(npcId);

    if (!moveCompleted) {
      return {
        success: false,
        npcId,
        fromRoom: currentState.currentRoom,
        toRoom: decision.targetRoom,
        reason: "Could not complete move",
        requiresTeleport: decision.requiresTeleport || false,
        timestamp: Date.now(),
      };
    }

    return {
      success: true,
      npcId,
      fromRoom: currentState.currentRoom,
      toRoom: decision.targetRoom,
      reason: decision.reason,
      requiresTeleport: decision.requiresTeleport || false,
      timestamp: Date.now(),
    };
  }

  /**
   * Performance optimized movement decision using cached pathfinding
   */
  private async decideOptimizedMovement(
    context: NPCMoveContext,
    policy: MovePolicyConfig,
    npcId: string,
    currentRoom: string,
  ): Promise<{
    targetRoom: string | null;
    reason: string;
    requiresTeleport?: boolean;
  }> {
    const optimizer = getPerformanceOptimizer();

    // First try normal movement decision
    const basicDecision = decideMove(context, policy);

    if (!basicDecision.targetRoom) {
      return basicDecision;
    }

    // If basic decision has a target, check if optimized path exists
    try {
      const roomRegistry: Record<string, string[]> = {};
      this.roomRegistry.forEach((adjacent, roomId) => {
        roomRegistry[roomId] = adjacent;
      });

      const optimizedPath = optimizer.getOptimizedRoomPath(
        currentRoom,
        basicDecision.targetRoom,
        roomRegistry,
      );

      if (optimizedPath && optimizedPath.length > 1) {
        // Use the next step in the optimized path
        const nextRoom = optimizedPath[1];
        return {
          targetRoom: nextRoom,
          reason: `Optimized path: ${currentRoom} -> ${nextRoom} (${optimizedPath.length} steps to ${basicDecision.targetRoom})`,
          requiresTeleport: basicDecision.requiresTeleport,
        };
      }
    } catch (error) {
      getErrorHandler().reportError(
        NPCErrorType.PATHFINDING_ERROR,
        `Pathfinding optimization failed: ${(error as Error).message}`,
        { npcId, currentRoom, targetRoom: basicDecision.targetRoom },
        NPCErrorSeverity.LOW,
      );
    }

    // Fall back to basic decision
    return basicDecision;
  }

  /**
   * Build movement context for an NPC
   */
  private buildMoveContext(
    npcId: string,
    config: NPCMovementConfig,
    currentRoom: string,
  ): NPCMoveContext {
    const presence = getNPCPresenceProvider();

    // Get adjacent rooms
    const allowedAdjacency = this.roomRegistry.get(currentRoom) || [];

    // Get room occupancy data
    const occupiedRooms: Record<string, string[]> = {};
    const roomCapacity: Record<string, number> = {};

    // Build occupancy map for capacity checking
    const allRooms = presence.getAllRoomOccupancy();
    for (const [roomId, occupancy] of allRooms) {
      occupiedRooms[roomId] = occupancy.npcIds;
      if (occupancy.capacity) {
        roomCapacity[roomId] = occupancy.capacity;
      }
    }

    // Get player room from game state
    const gameState = getGameState();
    const playerRoomId = gameState?.currentRoomId || "controlnexus";

    return {
      currentRoom,
      npcId,
      homeRoom: config.homeRoom,
      roamRadius: config.roamRadius,
      allowedAdjacency,
      roomGraph: Object.fromEntries(Array.from(this.roomRegistry.entries())),
      avoidRooms: config.avoidRooms || [],
      preferRooms: config.preferRooms || [],
      playerRoomId,
      roomCapacity,
      occupiedRooms,
      questGates: gameState?.flags || {}, // Integrate with game state flags
      lockedDoors: {}, // Room exits are handled by room definitions
    };
  }

  /**
   * Update internal statistics
   */
  private updateStats(): void {
    const activeNPCs = Array.from(this.npcConfigs.values()).filter(
      (c) => c.isActive,
    ).length;
    const presence = getNPCPresenceProvider();
    const presenceStats = presence.getStats();

    this.stats.totalNPCs = this.npcConfigs.size;
    this.stats.activeNPCs = activeNPCs;
    this.stats.movingNPCs = presenceStats.movingNPCs;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      totalNPCs: 0,
      activeNPCs: 0,
      movingNPCs: 0,
      successfulMoves: 0,
      failedMoves: 0,
      teleportMoves: 0,
      lastUpdateTime: Date.now(),
    };
  }
}

// Global instance management
let globalMovementExecutor: MovementExecutor | null = null;

/**
 * Get the global movement executor instance
 */
export function getMovementExecutor(): MovementExecutor {
  if (!globalMovementExecutor) {
    globalMovementExecutor = new MovementExecutor();
  }
  return globalMovementExecutor;
}

/**
 * Reset the global movement executor (for testing)
 */
export function resetMovementExecutor(): void {
  if (globalMovementExecutor) {
    globalMovementExecutor.stop();
    globalMovementExecutor.clear();
  }
  globalMovementExecutor = null;
}

/**
 * High-level function to set up NPC movement system
 */
export function setupNPCMovement(options: {
  roomRegistry: Record<string, string[]>;
  npcs: NPCMovementConfig[];
  roomCapacities?: Record<string, number>;
  zoneConfig?: Omit<ZoneSetupConfig, "config">;
}): void {
  const executor = getMovementExecutor();

  // Set up zones if provided
  if (options.zoneConfig) {
    const zoneAwareness = getZoneAwarenessProvider();
    zoneAwareness.initialize();

    options.zoneConfig.zones.forEach((zone) =>
      zoneAwareness.registerZone(zone),
    );
    options.zoneConfig.roomMappings.forEach((mapping) =>
      zoneAwareness.mapRoomToZone(mapping),
    );

    if (options.zoneConfig.transitionRules) {
      options.zoneConfig.transitionRules.forEach((rule) =>
        zoneAwareness.addTransitionRule(rule),
      );
    }

    if (options.zoneConfig.npcPreferences) {
      options.zoneConfig.npcPreferences.forEach((pref) =>
        zoneAwareness.setNPCZonePreference(pref),
      );
    }
  }

  // Set up room data
  executor.setRoomRegistry(options.roomRegistry);

  // Set room capacities if provided
  if (options.roomCapacities) {
    const presence = getNPCPresenceProvider();
    Object.entries(options.roomCapacities).forEach(([roomId, capacity]) => {
      presence.setRoomCapacity(roomId, capacity);
    });
  }

  // Start the system
  executor.start();

  // Register NPCs
  options.npcs.forEach((npcConfig) => {
    executor.registerNPC(npcConfig);
  });

  console.log(
    `[MovementExecution] Set up movement system with ${options.npcs.length} NPCs and ${Object.keys(options.roomRegistry).length} rooms`,
  );
}

/**
 * Shutdown the entire NPC movement system
 */
export function shutdownNPCMovement(): void {
  const executor = getMovementExecutor();
  executor.stop();
  resetMovementExecutor();
  console.log("[MovementExecution] Shut down NPC movement system");
}
