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
// Core game engine module.

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


const flags: Set<string> = new Set();
const flagTimestamps: Map<string, number> = new Map();
const flagDependencies: Map<string, string[]> = new Map();
const flagMetadata: Map<string, FlagMetadata> = new Map();


const categorizedFlags: Record<string, Set<string>> = {
  quest: new Set(),
  story_event: new Set(),
  chapter_progress: new Set(),
  general: new Set(),
  achievement: new Set(),
  relationship: new Set(),
  exploration: new Set(),
};


const eventTriggers: Map<string, EventCallback[]> = new Map();

const flagCache: Map<string, { valid: boolean; timestamp: number }> = new Map();
// Variable declaration
const CACHE_TTL = 30000; 
const MAX_EVENT_TRIGGERS = 10;
const MAX_CACHE_SIZE = 1000;
const MODULE_VERSION = '1.0.0'; 


// Variable declaration
const CLEANUP_INTERVAL = 60000; 





// --- Function: setFlag ---
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

    // Check dependencies
    if (flagDependencies.has(flag)) {
      const dependencies = flagDependencies.get(flag) || [];
      const unmetDependencies = dependencies.filter(dep => !hasFlag(dep));
      if (unmetDependencies.length > 0) {
        console.warn(`[StoryProgress] Cannot set flag ${flag}, missing dependencies:`, unmetDependencies);
        return false;
      }
    }

    flags.add(flag);

    
    if (expiry && expiry > 0) {
      flagTimestamps.set(flag, Date.now() + expiry);
    }

    // Handle categorization
    const normalizedCategory = (category || 'general').toLowerCase();
    if (categorizedFlags[normalizedCategory]) {
      categorizedFlags[normalizedCategory].add(flag);
    } else {
      categorizedFlags[normalizedCategory] = new Set([flag]);
    }

    
    flagMetadata.set(flag, {
      setTime: Date.now(),
      category: normalizedCategory,
      description,
      priority,
      triggeredEvents: []
    });

    
    flagCache.delete(flag);

    
    triggerEvent(flag);

    console.log(`[StoryProgress] Flag set: ${flag} (category: ${normalizedCategory})`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error setting flag:', error);
    return false;
  }
}



// --- Function: hasFlag ---
export function hasFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

    // Check cache first
    const cached = flagCache.get(flag);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.valid;
    }

    if (!flags.has(flag)) {
      updateCache(flag, false);
      return false;
    }

    
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



// --- Function: isFlagExpired ---
export function isFlagExpired(flag: string): boolean {
  try {
    const expiryTime = flagTimestamps.get(flag);
    return expiryTime ? Date.now() > expiryTime : false;
  } catch (error) {
    console.error('[StoryProgress] Error checking flag expiry:', error);
    return false;
  }
}



// --- Function: removeFlag ---
export function removeFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

    const wasRemoved = flags.delete(flag);
    if (!wasRemoved) {
      return false;
    }

    
    flagTimestamps.delete(flag);
    flagDependencies.delete(flag);
    flagMetadata.delete(flag);
    flagCache.delete(flag);

    
    Object.values(categorizedFlags).forEach(categorySet => {
      categorySet.delete(flag);
    });

    
    eventTriggers.delete(flag);

    // Remove dependencies on this flag
    flagDependencies.forEach((deps, depFlag) => {
      const updatedDeps = deps.filter(dep => dep !== flag);
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



// --- Function: getAllFlags ---
export function getAllFlags(): string[] {
  try {
    cleanupExpiredFlags();
    return Array.from(flags).sort();
  } catch (error) {
    console.error('[StoryProgress] Error getting all flags:', error);
    return [];
  }
}



// --- Function: getFlagsByCategory ---
export function getFlagsByCategory(category: string): string[] {
  try {
    const normalizedCategory = category.toLowerCase();
    if (!categorizedFlags[normalizedCategory]) {
      return [];
    }

    // Get flags for the category and sort by priority
    const categoryFlags = Array.from(categorizedFlags[normalizedCategory])
      .map(flagName => {
        const meta = flagMetadata.get(flagName);
        return { flagName, meta };
      })
      .sort((a, b) => {
        return (b.meta?.priority || 0) - (a.meta?.priority || 0);
      })
      .map(item => item.flagName);

    return categoryFlags;
  } catch (error) {
    console.error('[StoryProgress] Error getting flags by category:', error);
    return [];
  }
}



// --- Function: canActivateFlag ---
export function canActivateFlag(flag: string): boolean {
  try {
    if (!validateFlagName(flag)) {
      return false;
    }

    const requiredFlags = flagDependencies.get(flag) || [];
    return requiredFlags.every(dep => hasFlag(dep));
  } catch (error) {
    console.error('[StoryProgress] Error checking flag activation:', error);
    return false;
  }
}



// --- Function: setFlagDependencies ---
export function setFlagDependencies(flag: string, dependencies: string[]): boolean {
  try {
    if (!validateFlagName(flag) || !Array.isArray(dependencies)) {
      console.warn('[StoryProgress] Invalid dependencies provided for flag:', flag);
      return false;
    }

    // Validate dependencies
    const validDependencies = dependencies.filter(dep => validateFlagName(dep));
    if (validDependencies.length !== dependencies.length) {
      console.warn('[StoryProgress] Some dependencies are invalid for flag:', flag);
    }

    
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



// --- Function: registerEventTrigger ---
export function registerEventTrigger(flag: string, eventCallback: EventCallback): boolean {
  try {
    if (!validateFlagName(flag) || typeof eventCallback !== 'function') {
      console.warn('[StoryProgress] Invalid event trigger registration:', flag);
      return false;
    }

    if (!eventTriggers.has(flag)) {
      eventTriggers.set(flag, []);
    }

    const callbacks = eventTriggers.get(flag)!;
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



// --- Function: triggerEvent ---
export function triggerEvent(flag: string, context?: any): void {
  try {
    const callbacks = eventTriggers.get(flag);
    if (!callbacks || callbacks.length === 0) {
      return;
    }

    const metadata = flagMetadata.get(flag);
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



// --- Function: cleanupExpiredFlags ---
export function cleanupExpiredFlags(): number {
  try {
    const expiredFlags: string[] = [];
    const now = Date.now();

    for (const [flag, timestamp] of flagTimestamps.entries()) {
      if (now > timestamp) {
        expiredFlags.push(flag);
      }
    }

    expiredFlags.forEach(flag => removeFlag(flag));

    
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



// --- Function: loadFlags ---
export function loadFlags(): boolean {
  try {
    const savedData = localStorage.getItem('storyProgressState');
    if (!savedData) {
      console.log('[StoryProgress] No saved state found');
      return false;
    }

    const state: StoryProgressState = JSON.parse(savedData);

    
    if (state.version !== MODULE_VERSION) {
      console.log(`[StoryProgress] Migrating from version ${state.version} to ${MODULE_VERSION}`);
      migrateState(state);
    }

    
    if (state.flags && Array.isArray(state.flags)) {
      state.flags.forEach(flag => {
        if (validateFlagName(flag)) {
          flags.add(flag);
        }
      });
    }

    
    if (state.timestamps) {
      Object.entries(state.timestamps).forEach(([flag, timestamp]) => {
        if (validateFlagName(flag) && typeof timestamp === 'number') {
          flagTimestamps.set(flag, timestamp);
        }
      });
    }

    
    if (state.dependencies) {
      Object.entries(state.dependencies).forEach(([flag, deps]) => {
        if (validateFlagName(flag) && Array.isArray(deps)) {
          flagDependencies.set(flag, deps.filter(dep => validateFlagName(dep)));
        }
      });
    }

    
    if (state.categories) {
      Object.entries(state.categories).forEach(([category, flagList]) => {
        if (Array.isArray(flagList)) {
          const normalizedCategory = category.toLowerCase();
          categorizedFlags[normalizedCategory] = new Set(
            flagList.filter(flag => validateFlagName(flag))
          );
        }
      });
    }

    
    if (state.metadata) {
      Object.entries(state.metadata).forEach(([flag, meta]) => {
        if (validateFlagName(flag) && validateMetadata(meta)) {
          flagMetadata.set(flag, meta);
        }
      });
    }

    // Cleanup and finalize
    const cleanedCount = cleanupExpiredFlags();

    console.log(`[StoryProgress] Loaded ${flags.size} flags from localStorage (cleaned ${cleanedCount} expired)`);
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error loading flags:', error);
    return false;
  }
}



// --- Function: saveFlags ---
export function saveFlags(): boolean {
  try {
    
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

    // Serialize and save
    const serialized = JSON.stringify(state);
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



// --- Function: initialiseStoryProgress ---
export function initialiseStoryProgress(): void {
  try {
    const initialFlags: FlagData[] = [
      { name: 'game_started', category: 'general', priority: 10, description: 'Game has been started' },
      { name: 'first_visit', category: 'story_event', priority: 9, description: 'First visit to the game world' },
      { name: 'tutorial_complete', category: 'chapter_progress', priority: 8, description: 'Tutorial has been completed' },
      { name: 'has_map', category: 'quest', priority: 5, description: 'Player has obtained a map' },
      
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



// --- Function: getProgressStatistics ---
export function getProgressStatistics(): ProgressStatistics {
  try {
    cleanupExpiredFlags();

    const flagsByCategory: Record<string, number> = {};
    Object.entries(categorizedFlags).forEach(([category, flagSet]) => {
      flagsByCategory[category] = flagSet.size;
    });

    const recentlySet = Array.from(flags)
      .filter(flag => {
        const timestamp = flagTimestamps.get(flag);
        return timestamp && Date.now() - timestamp < 300000; // Last 5 minutes
      });

    const highPriorityFlags = Array.from(flags)
      .map(flag => {
        const meta = flagMetadata.get(flag);
        return { flag, meta };
      })
      .filter(item => item.meta && item.meta.priority && item.meta.priority > 5)
      .sort((a, b) => {
        return (b.meta?.priority || 0) - (a.meta?.priority || 0);
      })
      .map(item => item.flag);

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



// --- Function: clearAllProgress ---
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

    
    localStorage.removeItem('storyProgressState');

    console.log('[StoryProgress] All progress cleared');
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error clearing progress:', error);
    return false;
  }
}




// --- Function: validateFlagName ---
function validateFlagName(flag: string): boolean {
  return typeof flag === 'string' &&
         flag.length > 0 &&
         flag.length <= 100 &&
         /^[a-zA-Z0-9_-]+$/.test(flag);
}


// --- Function: validateCategory ---
function validateCategory(category: string): string {
  const validCategories: FlagCategory[] = [
    'quest', 'story_event', 'chapter_progress', 'general',
    'achievement', 'relationship', 'exploration'
  ];
  return validCategories.includes(category as FlagCategory) ? category : 'general';
}


// --- Function: validateMetadata ---
function validateMetadata(meta: any): meta is FlagMetadata {
  return typeof meta === 'object' &&
         meta !== null &&
         typeof meta.setTime === 'number' &&
         typeof meta.category === 'string' &&
         typeof meta.priority === 'number' &&
         Array.isArray(meta.triggeredEvents);
}


// --- Function: hasCircularDependency ---
function hasCircularDependency(flag: string, dependencies: string[]): boolean {
  const visited = new Set<string>();
  const stack = new Set<string>();

// --- Function: dfs ---
  function dfs(current: string): boolean {
    if (stack.has(current)) return true;
    if (visited.has(current)) return false;

    visited.add(current);
    stack.add(current);

    const deps = flagDependencies.get(current) || [];
    for (const dep of deps) {
      if (dfs(dep)) return true;
    }

    stack.delete(current);
    return false;
  }

  return dfs(flag);
}


// --- Function: updateCache ---
function updateCache(flag: string, valid: boolean): void {
  if (flagCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = flagCache.keys().next().value;
    if (oldestKey) {
      flagCache.delete(oldestKey);
    }
  }
  flagCache.set(flag, { valid, timestamp: Date.now() });
}


// --- Function: cleanupCache ---
function cleanupCache(): void {
  const keysToDelete: string[] = [];
  const now = Date.now();

  for (const [key, value] of flagCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => flagCache.delete(key));
}


// --- Function: migrateState ---
function migrateState(state: StoryProgressState): void {
  
  state.version = MODULE_VERSION;
}


// --- Function: cleanupOldData ---
function cleanupOldData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('storyProgress_backup_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}



// --- Function: getStoryFlags ---
export function getStoryFlags(): string[] {
  return getAllFlags();
}



// --- Function: hasStoryFlag ---
export function hasStoryFlag(flag: string): boolean {
  return hasFlag(flag);
}

// --- Function: getStatistics ---
export function getStatistics(): ProgressStatistics {
  const stats: ProgressStatistics = {
    totalFlags: flags.size,
    flagsByCategory: {},
    expiredFlags: 0,
    dependentFlags: flagDependencies.size,
    recentlySet: [],
    highPriorityFlags: []
  };

  // Calculate categories
  Object.entries(categorizedFlags).forEach(([category, flagSet]) => {
    stats.flagsByCategory[category] = flagSet.size;
  });

  // Count expired flags
  const now = Date.now();
  for (const [flag, timestamp] of flagTimestamps.entries()) {
    if (now > timestamp) {
      stats.expiredFlags++;
    }
  }

  // Get recent and high priority flags
  for (const [flag, metadata] of flagMetadata.entries()) {
    if (metadata.setTime > now - 300000) { // Last 5 minutes
      stats.recentlySet.push(flag);
    }
    if (metadata.priority > 5) {
      stats.highPriorityFlags.push(flag);
    }
  }

  return stats;
}

// --- Function: clearAllFlags ---
export function clearAllFlags(): boolean {
  try {
    flags.clear();
    flagTimestamps.clear();
    flagDependencies.clear();
    flagMetadata.clear();
    flagCache.clear();
    eventTriggers.clear();
    
    Object.keys(categorizedFlags).forEach(key => {
      categorizedFlags[key].clear();
    });

    localStorage.removeItem('storyProgressState');
    console.log('[StoryProgress] All flags cleared');
    return true;
  } catch (error) {
    console.error('[StoryProgress] Error clearing flags:', error);
    return false;
  }
}



// --- Function: setStoryFlag ---
export function setStoryFlag(flag: string, category?: string): boolean {
  return setFlag(flag, null, category || 'general');
}



// --- Function: getFlagMetadata ---
export function getFlagMetadata(flag: string): FlagMetadata | null {
  return flagMetadata.get(flag) || null;
}



// --- Function: setMultipleFlags ---
export function setMultipleFlags(flagsToSet: Array<{ name: string; category?: string; description?: string }>): number {
  let successCount = 0;
  flagsToSet.forEach(({ name, category, description }) => {
    if (setFlag(name, null, category, description)) {
      successCount++;
    }
  });
  return successCount;
}


if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredFlags();
    cleanupCache();
  }, CLEANUP_INTERVAL);
}

// Export all the functions as a module
const StoryProgressUtils = {
  setFlag,
  hasFlag,
  removeFlag,
  isFlagExpired,
  getFlagsByCategory,
  canActivateFlag,
  setFlagDependencies,
  registerEventTrigger,
  triggerEvent,
  cleanupExpiredFlags,
  loadFlags,
  saveFlags,
  getAllFlags,
  getStatistics,
  clearAllFlags
};

export default StoryProgressUtils;

// Additional type definitions
export interface FlagConflictReport {
  conflicts: Array<{ flags: string[]; reason: string }>;
  suggestions: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CircularDependency {
  chain: string[];
  severity: 'high' | 'medium' | 'low';
}

interface FlagSystemBridge {
  syncWithEngineFlags(): void;
  syncWithNPCFlags(): void;
  resolveConflicts(): FlagConflictReport;
}

class DependencyGraph {
  validateDependencyChain(flag: string, deps: string[]): ValidationResult {
    // Implementation would go here
    return { isValid: true, errors: [], warnings: [] };
  }
  
  findCircularDependencies(): CircularDependency[] {
    // Implementation would go here
    return [];
  }
  
  optimizeDependencyOrder(): string[] {
    // Implementation would go here
    return [];
  }
}


interface FlagAnalytics {
  mostUsedFlags: Array<{ flag: string; usage: number }>;
  unusedFlags: string[];
  conflictingFlags: Array<{ flags: string[]; reason: string }>;
}
