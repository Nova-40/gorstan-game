// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: resetEngine.ts
// Path: src/engine/resetEngine.ts
//
// resetEngine utility for Gorstan game.
// Provides functions to reset game state, track reset counts, and define the soft reset entry point.

/**
 * Type definitions for reset system
 */

// Deprecated: replaced by shared PlayerState
// export interface GameState {
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
  difficulty?: 'easy' | 'normal' | 'hard' | 'nightmare';
}

/**
 * Options for controlling how the game resets.
 * Flags allow fine-grained control over what is preserved across resets.
 */
export interface ResetOptions {
  preserveAchievements?: boolean;
  preserveFlags?: string[];
  resetType?: 'soft' | 'hard' | 'new_game_plus' | 'death' | 'checkpoint';
  customEntryPoint?: string;
  preserveNPCMemory?: boolean;
  preserveScore?: boolean;
  reason?: string;
  skipBackup?: boolean;
}

/**
 * Tracks all reset activity, including reasons, counts, and playtime before resets.
 */
export interface ResetStatistics {
  totalResets: number;
  softResets: number;
  hardResets: number;
  deathResets: number;
  checkpointResets: number;
  lastResetTimestamp: number;
  averagePlayTimeBeforeReset: number;
  resetReasons: Record<string, number>;
  successfulCompletions: number;
  resetsByDifficulty: Record<string, number>;
}

export interface CheckpointData extends GameState {
  checkpointTimestamp: number;
  checkpointName?: string;
  checkpointDescription?: string;
  checkpointVersion: string;
  gameStateHash?: string;
  automaticCheckpoint?: boolean;
}

export interface BackupData {
  gameState: GameState;
  timestamp: number;
  backupReason: string;
  backupId: string;
}

/**
 * Default initial game state with enhanced properties
 */
const DEFAULT_GAME_STATE: GameState = {
  inventory: [],
  flags: {
    game_started: false,
    tutorial_complete: false,
    first_run: true
  },
  traits: [],
  health: 100,
  score: 0,
  currentRoom: 'introstart',
  visitedRooms: ['introstart'],
  achievements: [],
  playTime: 0,
  lastSaved: Date.now(),
  npcRelationships: {},
  deathCount: 0,
  sessionId: generateSessionId(),
  gameVersion: '6.0.0',
  difficulty: 'normal'
};

/**
 * Reset entry points for different reset types with validation
 */
export 
/**
 * Flags that should typically be preserved across soft resets
 */

/**
 * Flags that should be preserved across NG+ resets
 */

/**
 * Maximum number of backups to maintain
 */

/**
 * Maximum number of checkpoints to maintain
 */

/**
 * Default reset entry point
 */
export 
/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced game state validation with comprehensive checks
 */
function validateGameState(state: unknown): state is GameState {
  try {
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Required fields validation
    if (s.inventory !== undefined && !Array.isArray(s.inventory)) return false;
    if (s.flags !== undefined && (typeof s.flags !== 'object' || s.flags === null)) return false;
    if (s.traits !== undefined && !Array.isArray(s.traits)) return false;
    if (s.health !== undefined && (typeof s.health !== 'number' || s.health < 0)) return false;
    if (s.score !== undefined && (typeof s.score !== 'number' || s.score < 0)) return false;
    if (s.currentRoom !== undefined && typeof s.currentRoom !== 'string') return false;
    if (s.visitedRooms !== undefined && !Array.isArray(s.visitedRooms)) return false;
    if (s.achievements !== undefined && !Array.isArray(s.achievements)) return false;
    if (s.playTime !== undefined && (typeof s.playTime !== 'number' || s.playTime < 0)) return false;
    if (s.lastSaved !== undefined && (typeof s.lastSaved !== 'number' || s.lastSaved <= 0)) return false;
    if (s.npcRelationships !== undefined && typeof s.npcRelationships !== 'object') return false;

    return true;
  } catch (error) {
    console.error('[ResetEngine] Error validating game state:', error);
    return false;
  }
}

/**
 * Create a hash of game state for integrity checking
 */
function createGameStateHash(state: GameState): string {
  try {
        
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
            hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  } catch (error) {
    console.error('[ResetEngine] Error creating game state hash:', error);
    return 'hash_error';
  }
}

/**
 * Enhanced resetGameState with better integration and validation
 */
export function resetGameState(
  currentState?: GameState,
  options: ResetOptions = {}
): GameState {
  try {
    const {
      preserveAchievements = false,
      preserveFlags = [],
      resetType = 'soft',
      customEntryPoint,
      preserveNPCMemory = false,
      preserveScore = false,
      reason = 'manual_reset',
      skipBackup = false
    } = options;

    // Create backup before reset (unless skipped)
    if (!skipBackup && currentState) {
      createBackup(currentState, `before_${resetType}_reset`);
    }

    // Start with default state
    const newState: GameState = { 
      ...DEFAULT_GAME_STATE,
      lastSaved: Date.now(),
      sessionId: generateSessionId(),
      gameVersion: '6.0.0'
    };

    // Validate and set entry point
        if (hasRoom(entryPoint)) {
      newState.currentRoom = entryPoint;
      newState.visitedRooms = [entryPoint];
    } else {
      console.warn(`[ResetEngine] Invalid entry point: ${entryPoint}, using default`);
      newState.currentRoom = RESET_ENTRY_POINTS.soft;
      newState.visitedRooms = [RESET_ENTRY_POINTS.soft];
    }

    // Preserve achievements if requested
    if (preserveAchievements && currentState?.achievements) {
      newState.achievements = [...currentState.achievements];
    }

    // Preserve score if requested
    if (preserveScore && currentState?.score) {
      newState.score = currentState.score;
    }

    // Handle different reset types with enhanced logic
    switch (resetType) {
      case 'soft':
        handleSoftReset(newState, currentState, preserveFlags);
        break;
        
      case 'hard':
        handleHardReset(newState);
        break;
        
      case 'new_game_plus':
        handleNewGamePlusReset(newState, currentState);
        break;
        
      case 'death':
        handleDeathReset(newState, currentState);
        break;
        
      case 'checkpoint':
        return handleCheckpointReset(customEntryPoint);
        
      default:
        console.warn(`[ResetEngine] Unknown reset type: ${resetType}, performing soft reset`);
        handleSoftReset(newState, currentState, preserveFlags);
    }

    // Preserve specific flags
        if (currentState?.flags) {
      allPreserveFlags.forEach(flag => {
        if (currentState.flags?.[flag] !== undefined) {
          newState.flags![flag] = currentState.flags[flag];
        }
      });
    }

    // Preserve NPC relationships if requested
    if (preserveNPCMemory && currentState?.npcRelationships) {
      newState.npcRelationships = { ...currentState.npcRelationships };
    }

    // Set reset tracking flags
    newState.flags = {
      ...newState.flags,
      game_reset: true,
      reset_type: resetType,
      reset_timestamp: Date.now(),
      reset_reason: reason,
      reset_count: (currentState?.flags?.reset_count as number || 0) + 1
    };

    // Validate final state
    if (!validateGameState(newState)) {
      console.error('[ResetEngine] Generated invalid game state, using default');
      return { ...DEFAULT_GAME_STATE };
    }

    console.log(`[ResetEngine] Game state reset (${resetType}) - reason: ${reason}`);
    return newState;
  } catch (error) {
    console.error('[ResetEngine] Error in resetGameState:', error);
    return { ...DEFAULT_GAME_STATE };
  }
}

/**
 * Handle soft reset logic
 */
function handleSoftReset(
  newState: GameState, 
  currentState?: GameState, 
  preserveFlags: string[] = []
): void {
  if (currentState) {
    // Preserve achievements in soft reset
    newState.achievements = currentState.achievements || [];
    
    // Preserve some traits that represent permanent learning
        newState.traits = [...newState.traits!, ...permanentTraits];
    
    // Preserve difficulty setting
    if (currentState.difficulty) {
      newState.difficulty = currentState.difficulty;
    }
    
    // Carry over some play time
    newState.playTime = (currentState.playTime || 0) * 0.1;
  }
}

/**
 * Handle hard reset logic
 */
function handleHardReset(newState: GameState): void {
  // Hard reset maintains only the most basic persistent data
  newState.flags = {
    first_run: false, // Not first run anymore
    hard_reset_performed: true
  };
}

/**
 * Handle New Game Plus reset logic
 */
function handleNewGamePlusReset(newState: GameState, currentState?: GameState): void {
  if (currentState) {
    // Preserve all achievements
    newState.achievements = currentState.achievements || [];
    
    // Preserve learned traits
        newState.traits = [...newState.traits!, ...learnedTraits, 'ng_plus_veteran'];
    
    // Carry over percentage of score
    newState.score = Math.floor((currentState.score || 0) * 0.2);
    
    // Preserve NPC relationships with slight decay
    if (currentState.npcRelationships) {
      newState.npcRelationships = {};
      Object.entries(currentState.npcRelationships).forEach(([npc, relationship]) => {
        newState.npcRelationships![npc] = Math.floor(relationship * 0.5);
      });
    }
    
    // Preserve difficulty
    newState.difficulty = currentState.difficulty;
    
    // Set NG+ specific flags
    newState.flags = {
      ...newState.flags,
      new_game_plus: true,
      previous_completion: true
    };
  }
}

/**
 * Handle death reset logic
 */
function handleDeathReset(newState: GameState, currentState?: GameState): void {
  if (currentState) {
    // Preserve achievements and most progress
    newState.achievements = currentState.achievements || [];
    newState.traits = currentState.traits || [];
    newState.npcRelationships = currentState.npcRelationships || {};
    
    // Apply death penalties
    newState.score = Math.max(0, (currentState.score || 0) - 10);
    newState.deathCount = (currentState.deathCount || 0) + 1;
    
    // Preserve most flags except temporary ones
    if (currentState.flags) {
            newState.flags = { ...currentState.flags };
      flagsToReset.forEach(flag => {
        delete newState.flags![flag];
      });
    }
    
    // Set death-specific flags
    newState.flags = {
      ...newState.flags,
      player_died: true,
      death_count: newState.deathCount,
      last_death_timestamp: Date.now()
    };
    
    // Reset health
    newState.health = 100;
  }
}

/**
 * Handle checkpoint reset logic
 */
function handleCheckpointReset(checkpointName?: string): GameState {
    if (checkpoint) {
    console.log(`[ResetEngine] Restored from checkpoint${checkpointName ? ` (${checkpointName})` : ''}`);
    return {
      ...checkpoint,
      lastSaved: Date.now(),
      sessionId: generateSessionId()
    };
  } else {
    console.warn('[ResetEngine] No checkpoint found, performing soft reset');
    return resetGameState(undefined, { resetType: 'soft' });
  }
}

/**
 * Enhanced incrementResetCount with better statistics tracking
 */
export function incrementResetCount(
  resetType: ResetOptions['resetType'] = 'soft',
  reason: string = 'manual'
): void {
  try {
        
    // Update counters
    stats.totalResets += 1;
    
    switch (resetType) {
      case 'soft':
        stats.softResets += 1;
        break;
      case 'hard':
        stats.hardResets += 1;
        break;
      case 'death':
        stats.deathResets += 1;
        break;
      case 'checkpoint':
        stats.checkpointResets += 1;
        break;
    }
    
    // Track reset reasons
    stats.resetReasons[reason] = (stats.resetReasons[reason] || 0) + 1;
    
    // Update timestamp
            stats.lastResetTimestamp = now;
    
    // Calculate average play time with better accuracy
    if (stats.totalResets > 1 && timeSinceLastReset > 0) {
            stats.averagePlayTimeBeforeReset = Math.floor(weightedAverage);
    }
    
    // Save updated statistics with compression for large datasets
    try {
            localStorage.setItem('resetStatistics', statsData);
      localStorage.setItem('resetCount', stats.totalResets.toString());
      localStorage.setItem('lastResetType', resetType || 'unknown');
    } catch (storageError) {
      handleStorageError(storageError, stats);
    }
    
    console.log(`[ResetEngine] Reset count incremented: ${stats.totalResets} (${resetType}, ${reason})`);
  } catch (error) {
    console.error('[ResetEngine] Error incrementing reset count:', error);
  }
}

/**
 * Handle storage errors with graceful fallbacks
 */
function handleStorageError(error: unknown, stats: ResetStatistics): void {
  if (error instanceof Error && error.name === 'QuotaExceededError') {
    console.warn('[ResetEngine] Storage quota exceeded, cleaning up old data');
    cleanupOldData();
    
    // Try saving essential data only
    try {
            localStorage.setItem('resetStatistics', JSON.stringify(essentialStats));
    } catch (secondError) {
      console.error('[ResetEngine] Failed to save even essential statistics:', secondError);
    }
  } else {
    console.error('[ResetEngine] Storage error:', error);
  }
}

/**
 * Clean up old data to free storage space
 */
function cleanupOldData(): void {
  try {
    // Clear old checkpoints
    clearOldCheckpoints();
    
    // Clear old backups
    clearOldBackups();
    
    // Clear other temporary data
            
    oldDataKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`[ResetEngine] Failed to remove key ${key}:`, error);
      }
    });
    
    console.log(`[ResetEngine] Cleaned up ${oldDataKeys.length} old data entries`);
  } catch (error) {
    console.error('[ResetEngine] Error during cleanup:', error);
  }
}

/**
 * Enhanced getResetCount with validation
 */
export function getResetCount(): number {
  try {
        if (stored) {
            return isNaN(count) ? 0 : Math.max(0, count);
    }
    return 0;
  } catch (error) {
    console.error('[ResetEngine] Error getting reset count:', error);
    return 0;
  }
}

/**
 * Enhanced getResetStatistics with migration support
 */
export function getResetStatistics(): ResetStatistics {
  try {
        if (saved) {
            
      // Validate and migrate if necessary
      if (isValidResetStatistics(parsed)) {
        return migrateResetStatistics(parsed);
      }
    }
  } catch (error) {
    console.error('[ResetEngine] Error loading reset statistics:', error);
  }
  
  // Return default statistics
  return {
    totalResets: 0,
    softResets: 0,
    hardResets: 0,
    deathResets: 0,
    checkpointResets: 0,
    lastResetTimestamp: 0,
    averagePlayTimeBeforeReset: 0,
    resetReasons: {},
    successfulCompletions: 0,
    resetsByDifficulty: {}
  };
}

/**
 * Validate reset statistics structure
 */
function isValidResetStatistics(stats: unknown): stats is ResetStatistics {
  if (!stats || typeof stats !== 'object') return false;
  
    return typeof s.totalResets === 'number' &&
         typeof s.softResets === 'number' &&
         typeof s.hardResets === 'number' &&
         typeof s.lastResetTimestamp === 'number';
}

/**
 * Migrate old reset statistics to new format
 */
function migrateResetStatistics(stats: Partial<ResetStatistics>): ResetStatistics {
  return {
    totalResets: stats.totalResets || 0,
    softResets: stats.softResets || 0,
    hardResets: stats.hardResets || 0,
    deathResets: stats.deathResets || 0,
    checkpointResets: stats.checkpointResets || 0,
    lastResetTimestamp: stats.lastResetTimestamp || 0,
    averagePlayTimeBeforeReset: stats.averagePlayTimeBeforeReset || 0,
    resetReasons: stats.resetReasons || {},
    successfulCompletions: stats.successfulCompletions || 0,
    resetsByDifficulty: stats.resetsByDifficulty || {}
  };
}

/**
 * Enhanced performSoftReset with better integration
 */
export function performSoftReset(
  currentState: GameState,
  preserveFlags: string[] = [],
  reason: string = 'player_request'
): GameState {
  try {
    incrementResetCount('soft', reason);
    
    // Integrate with story progress system
    setFlag('soft_reset_performed', null, 'story_event');
    
    // Integrate with NPC memory system if available
    try {
      const { incrementReset } = require('./npcMemory');
      if (typeof incrementReset === 'function') {
        incrementReset();
      }
    } catch (importError) {
      // NPC memory system not available, continue without it
      console.warn('[ResetEngine] NPC memory system not available for reset tracking');
    }
    
    return resetGameState(currentState, {
      resetType: 'soft',
      preserveAchievements: true,
      preserveFlags: [...DEFAULT_PRESERVE_FLAGS, ...preserveFlags],
      preserveNPCMemory: true,
      reason
    });
  } catch (error) {
    console.error('[ResetEngine] Error performing soft reset:', error);
    return resetGameState(undefined, { resetType: 'soft' });
  }
}

/**
 * Enhanced performHardReset with comprehensive cleanup
 */
export function performHardReset(reason: string = 'player_request'): GameState {
  try {
    incrementResetCount('hard', reason);
    
    // Clear story progress
    clearAllProgress();
    
    // Clear NPC memory if available
    try {
      const { resetAllNPCs } = require('./npcMemory');
      if (typeof resetAllNPCs === 'function') {
        resetAllNPCs();
      }
    } catch (importError) {
      console.warn('[ResetEngine] NPC memory system not available for hard reset');
    }
    
    // Clear all localStorage data except essential statistics
            
    try {
      const preservedData: Record<string, string> = {};
      
      keysToPreserve.forEach(key => {
                if (value) preservedData[key] = value;
      });
      
      localStorage.clear();
      
      Object.entries(preservedData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      
    } catch (error) {
      console.error('[ResetEngine] Error during hard reset localStorage cleanup:', error);
    }
    
    return resetGameState(undefined, { 
      resetType: 'hard',
      reason,
      skipBackup: true // No point backing up before hard reset
    });
  } catch (error) {
    console.error('[ResetEngine] Error performing hard reset:', error);
    return { ...DEFAULT_GAME_STATE };
  }
}

/**
 * Enhanced performNewGamePlus with validation
 */
export function performNewGamePlus(
  currentState: GameState,
  reason: string = 'game_completed'
): GameState {
  try {
    // Validate that NG+ is actually unlocked
    if (!currentState.flags?.ng_plus_unlocked && !currentState.flags?.game_completed) {
      console.warn('[ResetEngine] New Game Plus not unlocked, performing soft reset instead');
      return performSoftReset(currentState, [], 'ng_plus_unavailable');
    }
    
    incrementResetCount('soft', reason);
    
    setFlag('new_game_plus_started', null, 'story_event');
    
    return resetGameState(currentState, {
      resetType: 'new_game_plus',
      preserveAchievements: true,
      preserveFlags: NG_PLUS_PRESERVE_FLAGS,
      preserveNPCMemory: true,
      preserveScore: true,
      reason
    });
  } catch (error) {
    console.error('[ResetEngine] Error performing New Game Plus:', error);
    return performSoftReset(currentState, [], 'ng_plus_error');
  }
}

/**
 * Enhanced getResetEntryPoint with validation
 */
export function getResetEntryPoint(resetType: keyof typeof RESET_ENTRY_POINTS): string {
  try {
        
    // Validate that the room exists
    if (hasRoom(entryPoint)) {
      return entryPoint;
    } else {
      console.warn(`[ResetEngine] Entry point room ${entryPoint} not found, using default`);
      return RESET_ENTRY_POINTS.soft;
    }
  } catch (error) {
    console.error('[ResetEngine] Error getting reset entry point:', error);
    return RESET_ENTRY_POINTS.soft;
  }
}

/**
 * Enhanced saveCheckpoint with compression and validation
 */
export function saveCheckpoint(
  gameState: GameState, 
  name?: string, 
  description?: string,
  automatic: boolean = false
): boolean {
  try {
    if (!validateGameState(gameState)) {
      console.error('[ResetEngine] Invalid game state provided for checkpoint');
      return false;
    }
    
    const checkpoint: CheckpointData = {
      ...gameState,
      checkpointTimestamp: Date.now(),
      checkpointName: name,
      checkpointDescription: description,
      checkpointVersion: '6.0.0',
      gameStateHash: createGameStateHash(gameState),
      automaticCheckpoint: automatic
    };

    try {
      localStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
    } catch (storageError) {
      if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
        // Clear old checkpoints and try again
        clearOldCheckpoints();
        localStorage.setItem(checkpointKey, JSON.stringify(checkpoint));
      } else {
        throw storageError;
      }
    }
    
    // Manage checkpoint list
    if (name) {
            if (!checkpointList.includes(name)) {
        checkpointList.push(name);
        
        // Limit checkpoint list size
        if (checkpointList.length > MAX_CHECKPOINTS) {
                    if (oldestCheckpoint) {
            localStorage.removeItem(`gameCheckpoint_${oldestCheckpoint}`);
          }
        }
        
        localStorage.setItem('checkpointList', JSON.stringify(checkpointList));
      }
    }
    
    console.log(`[ResetEngine] Checkpoint saved${name ? ` (${name})` : ''}${automatic ? ' [AUTO]' : ''}`);
    return true;
  } catch (error) {
    console.error('[ResetEngine] Error saving checkpoint:', error);
    return false;
  }
}

/**
 * Enhanced loadCheckpoint with integrity checking
 */
export function loadCheckpoint(name?: string): CheckpointData | null {
  try {
            
    if (saved) {
            
      // Validate checkpoint structure
      if (validateGameState(checkpoint) && checkpoint.checkpointTimestamp) {
        // Verify integrity if hash exists
        if (checkpoint.gameStateHash) {
                    if (currentHash !== checkpoint.gameStateHash) {
            console.warn(`[ResetEngine] Checkpoint integrity check failed for ${name || 'default'}`);
            // Don't return null, just warn - the checkpoint might still be usable
          }
        }
        
        console.log(`[ResetEngine] Checkpoint loaded${name ? ` (${name})` : ''}`);
        return checkpoint;
      } else {
        console.error(`[ResetEngine] Invalid checkpoint structure for ${name || 'default'}`);
      }
    }
  } catch (error) {
    console.error('[ResetEngine] Error loading checkpoint:', error);
  }
  return null;
}

/**
 * Enhanced hasCheckpoint with validation
 */
export function hasCheckpoint(name?: string): boolean {
  try {
            
    if (saved) {
      // Quick validation
            return parsed && typeof parsed.checkpointTimestamp === 'number';
    }
    return false;
  } catch (error) {
    console.error('[ResetEngine] Error checking checkpoint:', error);
    return false;
  }
}

/**
 * Enhanced getCheckpointList with sorting
 */
export function getCheckpointList(): string[] {
  try {
        if (saved) {
            if (Array.isArray(list)) {
        // Sort by checkpoint timestamp (newest first)
        return list.sort((a, b) => {
                              
          if (!checkpointA || !checkpointB) return 0;
          return checkpointB.checkpointTimestamp - checkpointA.checkpointTimestamp;
        });
      }
    }
    return [];
  } catch (error) {
    console.error('[ResetEngine] Error loading checkpoint list:', error);
    return [];
  }
}

/**
 * Enhanced clearOldCheckpoints with better age management
 */
function clearOldCheckpoints(): void {
  try {
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    let clearedCount = 0;
    
    const remainingCheckpoints: string[] = [];
    
    checkpointList.forEach(name => {
            if (checkpoint) {
                        
        // Clear if too old, or if it's automatic and we have too many
        if (age > maxAge || (isAutomatic && clearedCount < 2)) {
          localStorage.removeItem(`gameCheckpoint_${name}`);
          clearedCount++;
        } else {
          remainingCheckpoints.push(name);
        }
      } else {
        // Remove invalid checkpoint from list
        clearedCount++;
      }
    });
    
    // Update checkpoint list
    if (clearedCount > 0) {
      localStorage.setItem('checkpointList', JSON.stringify(remainingCheckpoints));
      console.log(`[ResetEngine] Cleared ${clearedCount} old checkpoints`);
    }
  } catch (error) {
    console.error('[ResetEngine] Error clearing old checkpoints:', error);
  }
}

/**
 * Create backup of game state
 */
function createBackup(gameState: GameState, reason: string): boolean {
  try {
    const backupData: BackupData = {
      gameState: { ...gameState },
      timestamp: Date.now(),
      backupReason: reason,
      backupId: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    localStorage.setItem(`gameBackup_${backupData.backupId}`, JSON.stringify(backupData));
    
    // Manage backup list
        backupList.push(backupData.backupId);
    
    // Limit number of backups
    while (backupList.length > MAX_BACKUPS) {
            if (oldBackupId) {
        localStorage.removeItem(`gameBackup_${oldBackupId}`);
      }
    }
    
    localStorage.setItem('gameBackupList', JSON.stringify(backupList));
    console.log(`[ResetEngine] Backup created: ${reason}`);
    return true;
  } catch (error) {
    console.error('[ResetEngine] Error creating backup:', error);
    return false;
  }
}

/**
 * Get list of available backups
 */
function getBackupList(): string[] {
  try {
        return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('[ResetEngine] Error getting backup list:', error);
    return [];
  }
}

/**
 * Clear old backups
 */
function clearOldBackups(): void {
  try {
        let clearedCount = 0;
    
    backupList.forEach(backupId => {
      try {
        localStorage.removeItem(`gameBackup_${backupId}`);
        clearedCount++;
      } catch (error) {
        console.warn(`[ResetEngine] Failed to remove backup ${backupId}:`, error);
      }
    });
    
    localStorage.removeItem('gameBackupList');
    
    if (clearedCount > 0) {
      console.log(`[ResetEngine] Cleared ${clearedCount} old backups`);
    }
  } catch (error) {
    console.error('[ResetEngine] Error clearing old backups:', error);
  }
}

/**
 * Enhanced clearResetStatistics with comprehensive cleanup
 */
export function clearResetStatistics(): void {
  try {
    // Clear statistics
    localStorage.removeItem('resetStatistics');
    localStorage.removeItem('resetCount');
    localStorage.removeItem('lastResetType');
    
    // Clear checkpoints
    localStorage.removeItem('gameCheckpoint');
        checkpointList.forEach(name => {
      localStorage.removeItem(`gameCheckpoint_${name}`);
    });
    localStorage.removeItem('checkpointList');
    
    // Clear backups
    clearOldBackups();
    
    console.log('[ResetEngine] Reset statistics and related data cleared');
  } catch (error) {
    console.error('[ResetEngine] Error clearing statistics:', error);
  }
}

/**
 * Get comprehensive reset analytics
 */
export function getResetAnalytics(): {
  statistics: ResetStatistics;
  recommendations: string[];
  trends: {
    resetFrequency: 'low' | 'moderate' | 'high';
    averageSessionTime: number;
    commonResetReasons: string[];
  };
} {
  try {
        const recommendations: string[] = [];
    
    // Analyze reset patterns
        
    // Generate recommendations
    if (stats.deathResets > stats.totalResets * 0.6) {
      recommendations.push('Consider adjusting difficulty settings - high death rate detected');
    }
    
    if (stats.averagePlayTimeBeforeReset < 600000) { // Less than 10 minutes
      recommendations.push('Players are resetting quickly - consider improving early game experience');
    }
    
    if (stats.softResets > stats.totalResets * 0.8) {
      recommendations.push('Most resets are soft - players are engaged but may need better progression');
    }
    
    // Find most common reset reasons
        
    return {
      statistics: stats,
      recommendations,
      trends: {
        resetFrequency,
        averageSessionTime: stats.averagePlayTimeBeforeReset,
        commonResetReasons: commonReasons
      }
    };
  } catch (error) {
    console.error('[ResetEngine] Error generating analytics:', error);
    return {
      statistics: getResetStatistics(),
      recommendations: ['Error generating recommendations'],
      trends: {
        resetFrequency: 'low',
        averageSessionTime: 0,
        commonResetReasons: []
      }
    };
  }
}

/**
 * Export utilities for external use
 */
export 
export default ResetEngine;
