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
// Controls full multiverse reset logic

import type { LocalGameState } from "../state/gameState";
import type { NPC } from "../types/NPCTypes";

export interface PlayerSnapshot {
  inventory?: string[];
  flags?: Record<string, boolean | unknown>;
  traits?: string[];
  health?: number;
  score?: number;
  currentRoom?: string;
  visitedRooms?: string[];
  achievements?: string[];
  playTime?: number;
  lastSaved?: number;
  npcRelationships?: Record<string, number>;
  deathCount?: number;
  sessionId?: string;
  gameVersion?: string;
  playerName?: string;
  difficulty?: "easy" | "normal" | "hard" | "nightmare";
}

export interface ResetOptions {
  preserveAchievements?: boolean;
  preserveFlags?: string[];
  resetType?: "soft" | "hard" | "new_game_plus" | "death" | "checkpoint";
  customEntryPoint?: string;
  preserveNPCMemory?: boolean;
  preserveCodex?: boolean;
  reasonCode?: string;
}

export interface CheckpointData extends LocalGameState {
  checkpointId: string;
  checkpointName: string;
  createdAt: number;
}

export interface ResetTransaction {
  id: string;
  timestamp: number;
  gameState: LocalGameState;
  options: ResetOptions;
  previousSnapshot?: PlayerSnapshot;
}

// Default entry points for different reset types
const RESET_ENTRY_POINTS = {
  soft: "controlnexus",
  hard: "controlnexus",
  death: "introreset",
  new_game_plus: "controlnexus",
};

// Default game state template
const DEFAULT_GAME_STATE: Partial<LocalGameState> = {
  stage: "game",
  transition: null,
  currentRoomId: "controlnexus",
  previousRoomId: undefined,
  history: [],
  flags: {},
  npcsInRoom: [],
  roomVisitCount: {},
  messages: [],
  inventory: [],
};

// Reset statistics tracking
const resetStats = {
  totalResets: 0,
  resetsByType: {} as Record<string, number>,
  lastResetTime: 0,
  resetReasons: [] as string[],
};

/**
 * Validates that a game state object has required properties
 */
function validateGameState(state: unknown): state is LocalGameState {
  if (!state || typeof state !== "object") {return false;}

  try {
    const s = state as LocalGameState;
    return !!(
      s.player &&
      s.stage &&
      s.currentRoomId &&
      typeof s.player.health === "number" &&
      Array.isArray(s.history) &&
      typeof s.flags === "object"
    );
  } catch {
    return false;
  }
}

/**
 * Creates a hash of game state for backup purposes
 */
function createGameStateHash(state: LocalGameState): string {
  const hashData = {
    stage: state.stage,
    player: {
      name: state.player.name,
      health: state.player.health,
      score: state.player.score,
      currentRoom: state.player.currentRoom,
    },
    currentRoomId: state.currentRoomId,
    flagCount: Object.keys(state.flags).length,
  };

  return btoa(JSON.stringify(hashData)).slice(0, 16);
}

/**
 * Main reset engine function - handles all types of game resets
 */
export function executeReset(
  options: ResetOptions = {},
  currentState?: LocalGameState,
): LocalGameState {
  const {
    resetType = "soft",
    preserveAchievements = true,
    preserveFlags = [],
    customEntryPoint,
    preserveNPCMemory = false,
    preserveCodex = true,
    reasonCode = "user_initiated",
  } = options;

  try {
    // Create backup of current state
    if (currentState) {
      function createBackup(state: LocalGameState, reason: string): void {
        const backup = {
          id: `backup_${Date.now()}`,
          state: JSON.parse(JSON.stringify(state)),
          reason,
          timestamp: Date.now(),
        };

        try {
          localStorage.setItem(
            `gorstan_backup_${backup.id}`,
            JSON.stringify(backup),
          );
        } catch (error) {
          console.warn("[ResetEngine] Could not create backup:", error);
        }
      }

      createBackup(currentState, reasonCode);
    }

    // Create new base state
    const newState: LocalGameState = {
      ...DEFAULT_GAME_STATE,
      player: {
        id: "player",
        name: currentState?.player?.name || "",
        health: 100,
        score: 0,
        inventory: [],
        traits: [],
        flags: {},
        npcRelationships: {},
        reputation: {},
        currentRoom: "controlnexus",
        visitedRooms: [],
        playTime: 0,
        lastSave: "",
        level: 1,
        experience: 0,
      },
      roomMap: currentState?.roomMap || {},
      gameTime: {
        day: 1,
        hour: 8,
        minute: 0,
        startTime: Date.now(),
        currentTime: Date.now(),
        timeScale: 1,
      },
      settings: currentState?.settings || {
        soundEnabled: true,
        fullscreen: false,
        cheatMode: false,
        difficulty: "normal",
        autoSave: true,
        autoSaveInterval: 300000,
        musicEnabled: true,
        animationsEnabled: true,
        textSpeed: 50,
        fontSize: "medium",
        theme: "auto",
        debugMode: false,
      },
      metadata: {
        resetCount: (currentState?.metadata?.resetCount || 0) + 1,
        version: "1.0.0",
        lastSaved: null,
        playTime: 0,
        achievements: [],
        codexEntries: {},
      },
      miniquestState: {},
    } as LocalGameState;

    // Set entry point
    const entryPoint =
      customEntryPoint ||
      RESET_ENTRY_POINTS[resetType as keyof typeof RESET_ENTRY_POINTS] ||
      RESET_ENTRY_POINTS.soft;
    newState.currentRoomId = entryPoint;
    newState.player.currentRoom = entryPoint;

    // Apply reset type specific logic
    switch (resetType) {
      case "soft":
        handleSoftReset(newState, currentState);
        break;
      case "hard":
        handleHardReset(newState);
        break;
      case "new_game_plus":
        handleNewGamePlusReset(newState, currentState);
        break;
      case "death":
        handleDeathReset(newState, currentState);
        break;
      case "checkpoint":
        // Checkpoint resets preserve more state
        if (currentState) {
          newState.player.visitedRooms = [
            ...(currentState.player.visitedRooms || []),
          ];
          newState.roomVisitCount = { ...currentState.roomVisitCount };
        }
        break;
    }

    // Handle preservation options
    if (currentState) {
      // Preserve achievements
      if (preserveAchievements && currentState.metadata?.achievements) {
        newState.metadata.achievements = [
          ...currentState.metadata.achievements,
        ];
      }

      // Preserve codex
      if (preserveCodex && currentState.metadata?.codexEntries) {
        newState.metadata.codexEntries = {
          ...currentState.metadata.codexEntries,
        };
      }

      // Preserve specific flags
      if (preserveFlags.length > 0) {
        preserveFlags.forEach((flagName) => {
          if (currentState.flags?.[flagName] !== undefined) {
            newState.flags[flagName] = currentState.flags[flagName];
          }
        });
      }

      // Preserve NPC memory
      if (preserveNPCMemory && currentState.player?.npcRelationships) {
        newState.player.npcRelationships = {
          ...currentState.player.npcRelationships,
        };
      }
    }

    // Update reset statistics
    updateResetStats(resetType, reasonCode);

    // Log reset for debugging
    if (import.meta.env.DEV) {
      console.log(`[ResetEngine] Executed ${resetType} reset:`, {
        entryPoint,
        preserveAchievements,
        preserveFlags,
        reasonCode,
      });
    }

    return newState;
  } catch (error) {
    console.error("[ResetEngine] Error during reset:", error);

    // Fallback to minimal safe state
    return {
      ...DEFAULT_GAME_STATE,
      player: {
        id: "player",
        name: "",
        health: 100,
        score: 0,
        inventory: [],
        traits: [],
        flags: {},
        npcRelationships: {},
        reputation: {},
        currentRoom: "controlnexus",
        visitedRooms: [],
        playTime: 0,
        lastSave: "",
        level: 1,
        experience: 0,
      },
      gameTime: {
        day: 1,
        hour: 8,
        minute: 0,
        startTime: Date.now(),
        currentTime: Date.now(),
        timeScale: 1,
      },
      settings: {
        soundEnabled: true,
        fullscreen: false,
        cheatMode: false,
        difficulty: "normal",
        autoSave: true,
        autoSaveInterval: 300000,
        musicEnabled: true,
        animationsEnabled: true,
        textSpeed: 50,
        fontSize: "medium",
        theme: "auto",
        debugMode: false,
      },
      metadata: {
        resetCount: 1,
        version: "1.0.0",
        lastSaved: null,
        playTime: 0,
        achievements: [],
        codexEntries: {},
      },
    } as LocalGameState;
  }
}

/**
 * Handles soft reset logic - preserves more player progress
 */
function handleSoftReset(
  newState: LocalGameState,
  currentState?: LocalGameState,
): void {
  if (currentState) {
    // Preserve player name and some basic progress
    newState.player.name = currentState.player.name;

    // Preserve some visited rooms (partial memory)
    if (
      currentState.player.visitedRooms &&
      currentState.player.visitedRooms.length > 0
    ) {
      newState.player.visitedRooms = currentState.player.visitedRooms.slice(
        0,
        3,
      );
    }

    // Preserve difficulty setting
    if (currentState.settings?.difficulty) {
      newState.settings.difficulty = currentState.settings.difficulty;
    }
  }
}

/**
 * Handles hard reset logic - complete fresh start
 */
function handleHardReset(newState: LocalGameState): void {
  // Hard reset is already handled by default state creation
  // This function exists for future expansion
  newState.metadata.resetCount = 0; // Reset even the reset count
}

/**
 * Handles New Game Plus reset - preserves achievements and some progress
 */
function handleNewGamePlusReset(
  newState: LocalGameState,
  currentState?: LocalGameState,
): void {
  if (currentState) {
    // Preserve all achievements
    if (currentState.metadata?.achievements) {
      newState.metadata.achievements = [...currentState.metadata.achievements];
    }

    // Preserve codex entries
    if (currentState.metadata?.codexEntries) {
      newState.metadata.codexEntries = {
        ...currentState.metadata.codexEntries,
      };
    }

    // Preserve some NPC relationships (reduced)
    if (currentState.player?.npcRelationships) {
      Object.entries(currentState.player.npcRelationships).forEach(
        ([npc, relationship]) => {
          if (typeof relationship === "number") {
            newState.player.npcRelationships![npc] = Math.floor(
              relationship * 0.5,
            );
          }
        },
      );
    }

    // Slight score bonus for New Game Plus
    newState.player.score = 50;

    // Mark as New Game Plus
    newState.flags.newGamePlus = true;
    newState.flags.preservedMemories = true;
  }
}

/**
 * Handles death reset logic - story-appropriate reset with narrative context
 */
function handleDeathReset(
  newState: LocalGameState,
  currentState?: LocalGameState,
): void {
  // Set specific entry point for death resets
  newState.currentRoomId = "introreset";
  newState.player.currentRoom = "introreset";

  if (currentState) {
    // Track death count
    const deathCount =
      ((currentState.player.flags?.deathCount as number) || 0) + 1;
    if (!newState.player.flags) {
      newState.player.flags = {};
    }
    newState.player.flags.deathCount = deathCount;
    newState.flags.playerDied = true;
    newState.flags.deathResetActive = true;

    // Preserve name and some basic flags
    newState.player.name = currentState.player.name;

    // Add death-related narrative flags
    newState.flags.remembersLastDeath = true;
    if (deathCount > 1) {
      newState.flags.multipleDeaths = true;
    }

    // Preserve some critical story flags
    const criticalFlags = [
      "metAyla",
      "metMorthos",
      "discoveredPortal",
      "foundSecretRoom",
    ];
    criticalFlags.forEach((flag) => {
      if (currentState.flags?.[flag]) {
        newState.flags[flag] = currentState.flags[flag];
      }
    });
  }
}

/**
 * Updates reset statistics for tracking and analytics
 */
function updateResetStats(resetType: string, reasonCode: string): void {
  resetStats.totalResets++;
  resetStats.resetsByType[resetType] =
    (resetStats.resetsByType[resetType] || 0) + 1;
  resetStats.lastResetTime = Date.now();
  resetStats.resetReasons.push(`${resetType}:${reasonCode}`);

  // Keep only last 50 reset reasons
  if (resetStats.resetReasons.length > 50) {
    resetStats.resetReasons = resetStats.resetReasons.slice(-25);
  }
}

/**
 * Creates a checkpoint of the current game state
 */
export function createCheckpoint(
  gameState: LocalGameState,
  checkpointName: string = "auto",
): CheckpointData {
  const checkpoint: CheckpointData = {
    ...JSON.parse(JSON.stringify(gameState)),
    checkpointId: `checkpoint_${Date.now()}`,
    checkpointName,
    createdAt: Date.now(),
  };

  try {
    localStorage.setItem(
      `gorstan_checkpoint_${checkpoint.checkpointId}`,
      JSON.stringify(checkpoint),
    );
  } catch (error) {
    console.warn("[ResetEngine] Could not save checkpoint:", error);
  }

  return checkpoint;
}

/**
 * Loads a checkpoint by ID
 */
export function loadCheckpoint(checkpointId: string): LocalGameState | null {
  try {
    const checkpointData = localStorage.getItem(
      `gorstan_checkpoint_${checkpointId}`,
    );
    if (checkpointData) {
      const checkpoint: CheckpointData = JSON.parse(checkpointData);
      if (validateGameState(checkpoint)) {
        return checkpoint;
      }
    }
  } catch (error) {
    console.warn("[ResetEngine] Could not load checkpoint:", error);
  }

  return null;
}

/**
 * Gets all available checkpoints
 */
export function getAvailableCheckpoints(): CheckpointData[] {
  const checkpoints: CheckpointData[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("gorstan_checkpoint_")) {
        const checkpointData = localStorage.getItem(key);
        if (checkpointData) {
          try {
            const checkpoint: CheckpointData = JSON.parse(checkpointData);
            if (validateGameState(checkpoint)) {
              checkpoints.push(checkpoint);
            }
          } catch {
            // Invalid checkpoint, skip
          }
        }
      }
    }
  } catch (error) {
    console.warn("[ResetEngine] Error loading checkpoints:", error);
  }

  return checkpoints.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Cleans up old checkpoints and backups
 */
export function cleanupOldSaves(
  maxAge: number = 7 * 24 * 60 * 60 * 1000,
): void {
  const cutoffTime = Date.now() - maxAge;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key?.startsWith("gorstan_checkpoint_") ||
        key?.startsWith("gorstan_backup_")
      ) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            const timestamp = parsed.createdAt || parsed.timestamp;
            if (timestamp && timestamp < cutoffTime) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid data, mark for removal
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (import.meta.env.DEV) {
      console.log(`[ResetEngine] Cleaned up ${keysToRemove.length} old saves`);
    }
  } catch (error) {
    console.warn("[ResetEngine] Error during cleanup:", error);
  }
}

// Export reset stats for debugging
export { resetStats as getResetStats };
