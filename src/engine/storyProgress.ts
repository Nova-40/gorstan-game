

// src/engine/storyProgress.js
// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: storyProgress.ts
// Path: src/engine/storyProgress.ts
//
// storyProgress utility for Gorstan game.
// Provides a flexible flag and event system for tracking story, quest, and chapter progress.
// Supports flag expiry, dependencies, categories, event triggers, and persistence.

/**
 * Type definitions for story progress system
 */
export interface FlagData {
  name: string;
  category?: string;
  expiry?: number;
  dependencies?: string[];
  description?: string;
  priority?: number;
}

export interface StoryProgressState {
  flags: string[];
  timestamps: Record<string, number>;
  dependencies: Record<string, string[]>;
  categories: Record<string, string[]>;
  metadata: Record<string, FlagMetadata>;
  version: string;
}

export interface FlagMetadata {
  setTime: number;
  category: string;
  description?: string;
  priority: number;
  triggeredEvents: string[];
}

export interface ProgressStatistics {
  totalFlags: number;
  flagsByCategory: Record<string, number>;
  expiredFlags: number;
  dependentFlags: number;
  recentlySet: string[];
  highPriorityFlags: string[];
}

export type EventCallback = (flagName: string, context?: any) => void;
export type FlagCategory = 'quest' | 'story_event' | 'chapter_progress' | 'general' | 'achievement' | 'relationship' | 'exploration';

/**
 * Enhanced flag state management with better performance
 */
const flags: Set<string> = new Set();
const flagTimestamps: Map<string, number> = new Map();
const flagDependencies: Map<string, string[]> = new Map();
const flagMetadata: Map<string, FlagMetadata> = new Map();

/**
 * Enhanced categorized flag sets with additional categories
 */
const categorizedFlags: Record<string, Set<string>> = {
  quest: new Set(),
  story_event: new Set(),
  chapter_progress: new Set(),
  general: new Set(),
  achievement: new Set(),
  relationship: new Set(),
  exploration: new Set(),
};

/**
 * Enhanced event system with multiple callbacks per flag
 */
const eventTriggers: Map<string, EventCallback[]> = new Map();

/**
 * Cache for expensive operations
 */
const flagCache: Map<string, { valid: boolean; timestamp: number }> = new Map();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Performance and memory management
 */
const CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Module version for state migration
 */

/**
 * Enhanced flag setting with comprehensive validation and integration
 */
export function setFlag(
  flag: string,
  expiry: number | null = null,
  category: string = 'general',
  description?: string,
  priority: number = 0
): boolean {
  try {
    if (!validateFlagName(flag)) {
      console.warn('[StoryProgress] Invalid flag name provided:', flag);
      return false;
    }

    // Check dependencies before setting
    if (flagDependencies.has(flag)) {
                  if (unmetDependencies.length > 0) {
        console.warn(`[StoryProgress] Cannot set flag ${flag}, missing dependencies:`, unmetDependencies);
        return false;
      }
    }

    flags.add(flag);

    // Set expiry timestamp
    if (expiry && expiry > 0) {
      flagTimestamps.set(flag, Date.now() + expiry);
    }

    // Add to category
        if (categorizedFlags[normalizedCategory]) {
      categorizedFlags[normalizedCategory].add(flag);
    } else {
      categorizedFlags[normalizedCategory] = new Set([flag]);
    }

    // Store metadata
    flagMetadata.set(flag, {
      setTime: Date.now(),
      category: normalizedCategory,
      description,
      priority,
      triggeredEvents: []
    });

    // Clear cache for this flag
    flagCache.delete(flag);

    // Trigger events
    triggerEvent(flag);

    console.log(`[StoryProgress] Flag set: ${flag} (category: ${normalizedCategory})`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error setting flag:', error);
    return false;
  }
}

/**
 * Enhanced flag checking with caching and validation
 */
export function hasFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

    // Check cache first
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.valid;
    }

    if (!flags.has(flag)) {
      updateCache(flag, false);
      return false;
    }

    // Check if flag has expired
    if (isFlagExpired(flag)) {
      removeFlag(flag);
      updateCache(flag, false);
      return false;
    }

    updateCache(flag, true);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error checking flag:', error);
    return false;
  }
}

/**
 * Enhanced expiry checking with better validation
 */
export function isFlagExpired(flag: string): boolean {
  try {
        return expiryTime ? Date.now() > expiryTime : false;
  } catch (error) {
    console.error('[StoryProgress] Error checking flag expiry:', error);
    return false;
  }
}

/**
 * Enhanced flag removal with comprehensive cleanup
 */
export function removeFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

        if (!wasRemoved) {
      return false;
    }

    // Comprehensive cleanup
    flagTimestamps.delete(flag);
    flagDependencies.delete(flag);
    flagMetadata.delete(flag);
    flagCache.delete(flag);

    // Remove from all categories
    Object.values(categorizedFlags).forEach(categorySet => {
      categorySet.delete(flag);
    });

    // Clean up event triggers
    eventTriggers.delete(flag);

    // Remove this flag from other flags' dependencies
    flagDependencies.forEach((deps, depFlag) => {
            if (updatedDeps.length !== deps.length) {
        flagDependencies.set(depFlag, updatedDeps);
      }
    });

    console.log(`[StoryProgress] Flag removed: ${flag}`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error removing flag:', error);
    return false;
  }
}

/**
 * Enhanced flag retrieval with cleanup and sorting
 */
export function getAllFlags(): string[] {
  try {
    cleanupExpiredFlags();
    return Array.from(flags).sort();
  } catch (error) {
    console.error('[StoryProgress] Error getting all flags:', error);
    return [];
  }
}

/**
 * Enhanced category-based flag retrieval
 */
export function getFlagsByCategory(category: string): string[] {
  try {
        if (!categorizedFlags[normalizedCategory]) {
      return [];
    }

    // Filter out expired flags and sort by priority
                    return (metaB?.priority || 0) - (metaA?.priority || 0);
      });

    return categoryFlags;
  } catch (error) {
    console.error('[StoryProgress] Error getting flags by category:', error);
    return [];
  }
}

/**
 * Enhanced dependency checking with validation
 */
export function canActivateFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

        return requiredFlags.every(dep => hasFlag(dep));
  } catch (error) {
    console.error('[StoryProgress] Error checking flag activation:', error);
    return false;
  }
}

/**
 * Enhanced dependency setting with validation
 */
export function setFlagDependencies(flag: string, dependencies: string[]): boolean {
  try {
    if (!validateFlagName(flag) || !Array.isArray(dependencies)) {
      console.warn('[StoryProgress] Invalid dependencies provided for flag:', flag);
      return false;
    }

    // Validate all dependency flag names
        if (validDependencies.length !== dependencies.length) {
      console.warn('[StoryProgress] Some dependencies are invalid for flag:', flag);
    }

    // Check for circular dependencies
    if (hasCircularDependency(flag, validDependencies)) {
      console.warn('[StoryProgress] Circular dependency detected for flag:', flag);
      return false;
    }

    flagDependencies.set(flag, [...validDependencies]);
    console.log(`[StoryProgress] Dependencies set for ${flag}: [${validDependencies.join(', ')}]`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error setting flag dependencies:', error);
    return false;
  }
}

/**
 * Enhanced event trigger registration with multiple callbacks support
 */
export function registerEventTrigger(flag: string, eventCallback: EventCallback): boolean {
  try {
    if (!validateFlagName(flag) || typeof eventCallback !== 'function') {
      console.warn('[StoryProgress] Invalid event trigger registration:', flag);
      return false;
    }

    if (!eventTriggers.has(flag)) {
      eventTriggers.set(flag, []);
    }

        if (callbacks.length >= MAX_EVENT_TRIGGERS) {
      console.warn(`[StoryProgress] Maximum event triggers reached for flag: ${flag}`);
      return false;
    }

    callbacks.push(eventCallback);
    console.log(`[StoryProgress] Event trigger registered for flag: ${flag}`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error registering event trigger:', error);
    return false;
  }
}

/**
 * Enhanced event triggering with error handling and context
 */
export function triggerEvent(flag: string, context?: any): void {
  try {
        if (!callbacks || callbacks.length === 0) {
      return;
    }

        if (metadata) {
      metadata.triggeredEvents.push(`triggered_${Date.now()}`);
    }

    callbacks.forEach((callback, index) => {
      try {
        callback(flag, context);
      } catch (error) {
        console.error(`[StoryProgress] Error in event callback ${index} for flag ${flag}:`, error);
      }
    });
  } catch (error) {
    console.error('[StoryProgress] Error triggering events:', error);
  }
}

/**
 * Enhanced cleanup with better performance
 */
export function cleanupExpiredFlags(): number {
  try {
    const expiredFlags: string[] = [];

    for (const [flag, timestamp] of flagTimestamps.entries()) {
      if (now > timestamp) {
        expiredFlags.push(flag);
      }
    }

    expiredFlags.forEach(flag => removeFlag(flag));

    // Clean up cache as well
    cleanupCache();

    if (expiredFlags.length > 0) {
      console.log(`[StoryProgress] Cleaned up ${expiredFlags.length} expired flags`);
    }

    return expiredFlags.length;
  } catch (error) {
    console.error('[StoryProgress] Error during cleanup:', error);
    return 0;
  }
}

/**
 * Enhanced loading with migration support
 */
export function loadFlags(): boolean {
  try {
        if (!savedData) {
      console.log('[StoryProgress] No saved state found');
      return false;
    }

    const state: StoryProgressState = JSON.parse(savedData);

    // Version migration if needed
    if (state.version !== MODULE_VERSION) {
      console.log(`[StoryProgress] Migrating from version ${state.version} to ${MODULE_VERSION}`);
      migrateState(state);
    }

    // Restore flags
    if (state.flags && Array.isArray(state.flags)) {
      state.flags.forEach(flag => {
        if (validateFlagName(flag)) {
          flags.add(flag);
        }
      });
    }

    // Restore timestamps
    if (state.timestamps) {
      Object.entries(state.timestamps).forEach(([flag, timestamp]) => {
        if (validateFlagName(flag) && typeof timestamp === 'number') {
          flagTimestamps.set(flag, timestamp);
        }
      });
    }

    // Restore dependencies
    if (state.dependencies) {
      Object.entries(state.dependencies).forEach(([flag, deps]) => {
        if (validateFlagName(flag) && Array.isArray(deps)) {
          flagDependencies.set(flag, deps.filter(dep => validateFlagName(dep)));
        }
      });
    }

    // Restore categories
    if (state.categories) {
      Object.entries(state.categories).forEach(([category, flagList]) => {
        if (Array.isArray(flagList)) {
                    categorizedFlags[normalizedCategory] = new Set(
            flagList.filter(flag => validateFlagName(flag))
          );
        }
      });
    }

    // Restore metadata
    if (state.metadata) {
      Object.entries(state.metadata).forEach(([flag, meta]) => {
        if (validateFlagName(flag) && validateMetadata(meta)) {
          flagMetadata.set(flag, meta);
        }
      });
    }

    // Clean up expired flags after loading

    console.log(`[StoryProgress] Loaded ${flags.size} flags from localStorage (cleaned ${cleanedCount} expired)`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error loading flags:', error);
    return false;
  }
}

/**
 * Enhanced saving with compression and validation
 */
export function saveFlags(): boolean {
  try {
    // Clean up before saving
    cleanupExpiredFlags();

    const state: StoryProgressState = {
      flags: Array.from(flags),
      timestamps: Object.fromEntries(flagTimestamps),
      dependencies: Object.fromEntries(flagDependencies),
      categories: Object.fromEntries(
        Object.entries(categorizedFlags).map(([key, set]) => [key, Array.from(set)])
      ),
      metadata: Object.fromEntries(flagMetadata),
      version: MODULE_VERSION
    };

    // Check localStorage quota
    try {
      localStorage.setItem('storyProgressState', serialized);
    } catch (quotaError) {
      console.warn('[StoryProgress] localStorage quota exceeded, cleaning up...');
      cleanupOldData();
      localStorage.setItem('storyProgressState', serialized);
    }

    console.log(`[StoryProgress] Saved ${flags.size} flags to localStorage`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error saving flags:', error);
    return false;
  }
}

/**
 * Enhanced initialization with predefined game flags
 */
export function initialiseStoryProgress(): void {
  try {
    const initialFlags: FlagData[] = [
      { name: 'game_started', category: 'general', priority: 10, description: 'Game has been started' },
      { name: 'first_visit', category: 'story_event', priority: 9, description: 'First visit to the game world' },
      { name: 'tutorial_complete', category: 'chapter_progress', priority: 8, description: 'Tutorial has been completed' },
      { name: 'has_map', category: 'quest', priority: 5, description: 'Player has obtained a map' },
      // Additional Gorstan-specific flags
      { name: 'met_dominic', category: 'relationship', priority: 7, description: 'Player has met Dominic' },
      { name: 'killed_dominic', category: 'story_event', priority: 9, description: 'Player killed Dominic' },
      { name: 'constitution_scroll_read', category: 'achievement', priority: 8, description: 'Read the constitution scroll' },
      { name: 'lattice_connected', category: 'story_event', priority: 9, description: 'Connected to the lattice' },
      { name: 'endgame_triggered', category: 'chapter_progress', priority: 10, description: 'Endgame sequence has begun' }
    ];

    initialFlags.forEach(({ name, category, priority, description }) => {
      if (!hasFlag(name)) {
        setFlag(name, null, category, description, priority);
      }
    });

    console.log('[StoryProgress] Story progress initialized with Gorstan-specific flags');
  } catch (error) {
    console.error('[StoryProgress] Error initializing story progress:', error);
  }
}

/**
 * Enhanced statistics with more comprehensive data
 */
export function getProgressStatistics(): ProgressStatistics {
  try {
    cleanupExpiredFlags();

                    return metaB.priority - metaA.priority;
      });

    return {
      totalFlags: flags.size,
      flagsByCategory,
      expiredFlags: flagTimestamps.size,
      dependentFlags: flagDependencies.size,
      recentlySet,
      highPriorityFlags
    };
  } catch (error) {
    console.error('[StoryProgress] Error getting statistics:', error);
    return {
      totalFlags: 0,
      flagsByCategory: {},
      expiredFlags: 0,
      dependentFlags: 0,
      recentlySet: [],
      highPriorityFlags: []
    };
  }
}

/**
 * Enhanced progress clearing with confirmation
 */
export function clearAllProgress(confirm: boolean = false): boolean {
  try {
    if (!confirm) {
      console.warn('[StoryProgress] clearAllProgress requires explicit confirmation');
      return false;
    }

    flags.clear();
    flagTimestamps.clear();
    flagDependencies.clear();
    flagMetadata.clear();
    flagCache.clear();
    Object.values(categorizedFlags).forEach(set => set.clear());
    eventTriggers.clear();

    // Clear localStorage
    localStorage.removeItem('storyProgressState');

    console.log('[StoryProgress] All progress cleared');
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error clearing progress:', error);
    return false;
  }
}

/**
 * Helper Functions
 */

function validateFlagName(flag: string): boolean {
  return typeof flag === 'string' &&
         flag.length > 0 &&
         flag.length <= 100 &&
         /^[a-zA-Z0-9_-]+$/.test(flag);
}

function validateCategory(category: string): string {
  const validCategories: FlagCategory[] = [
    'quest', 'story_event', 'chapter_progress', 'general',
    'achievement', 'relationship', 'exploration'
  ];
  return validCategories.includes(category as FlagCategory) ? category : 'general';
}

function validateMetadata(meta: any): meta is FlagMetadata {
  return typeof meta === 'object' &&
         meta !== null &&
         typeof meta.setTime === 'number' &&
         typeof meta.category === 'string' &&
         typeof meta.priority === 'number' &&
         Array.isArray(meta.triggeredEvents);
}

function hasCircularDependency(flag: string, dependencies: string[]): boolean {

  function dfs(current: string): boolean {
    if (stack.has(current)) return true;
    if (visited.has(current)) return false;

    visited.add(current);
    stack.add(current);

        for (const dep of deps) {
      if (dfs(dep)) return true;
    }

    stack.delete(current);
    return false;
  }

  return dfs(flag);
}

function updateCache(flag: string, valid: boolean): void {
  if (flagCache.size >= MAX_CACHE_SIZE) {
        flagCache.delete(oldestKey);
  }
  flagCache.set(flag, { valid, timestamp: Date.now() });
}

function cleanupCache(): void {
    const keysToDelete: string[] = [];

  for (const [key, value] of flagCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => flagCache.delete(key));
}

function migrateState(state: StoryProgressState): void {
  // Add any necessary migrations here
  state.version = MODULE_VERSION;
}

function cleanupOldData(): void {
  // Remove old backup data to free space
    for (let i = 0; i < localStorage.length; i++) {
        if (key?.startsWith('storyProgress_backup_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Integration functions for compatibility with existing systems
 */
export function getStoryFlags(): string[] {
  return getAllFlags();
}

/**
 * Compatibility function for existing flag systems
 */
export function hasStoryFlag(flag: string): boolean {
  return hasFlag(flag);
}

/**
 * Compatibility function for existing flag systems
 */
export function setStoryFlag(flag: string, category?: string): boolean {
  return setFlag(flag, null, category || 'general');
}

/**
 * Get flag metadata for debugging
 */
export function getFlagMetadata(flag: string): FlagMetadata | null {
  return flagMetadata.get(flag) || null;
}

/**
 * Batch flag operations for performance
 */
export function setMultipleFlags(flagsToSet: Array<{ name: string; category?: string; description?: string }>): number {
  let successCount = 0;
  flagsToSet.forEach(({ name, category, description }) => {
    if (setFlag(name, null, category, description)) {
      successCount++;
    }
  });
  return successCount;
}

/**
 * Auto-cleanup interval setup
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredFlags();
    cleanupCache();
  }, CLEANUP_INTERVAL);
}

/**
 * Enhanced exports with comprehensive utilities
 */
export
export default StoryProgressUtils;

// All functions and StoryProgressUtils object are exported for use in story, quest, and event logic.
// TODO: Expand persistence to include expiry and categories. Add flag removal and advanced dependency logic

// Add flag system integration layer
interface FlagSystemBridge {
  syncWithEngineFlags(): void;
  syncWithNPCFlags(): void;
  resolveConflicts(): FlagConflictReport;
}

// Implement flag dependencies with circular detection
class DependencyGraph {
  validateDependencyChain(flag: string, deps: string[]): ValidationResult;
  findCircularDependencies(): CircularDependency[];
  optimizeDependencyOrder(): string[];
}

// Add flag analytics for balancing
interface FlagAnalytics {
  mostUsedFlags: Array<{ flag: string; usage: number }>;
  unusedFlags: string[];
  conflictingFlags: Array<{ flags: string[]; reason: string }>;
}
