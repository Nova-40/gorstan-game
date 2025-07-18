// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: trapEngine.ts
// Path: src/engine/trapEngine.ts

/**
 * trapEngine.ts – Gorstan Game v6.0.0 
 * Handles trap seeding, activation, disarming, and diagnostics.
 * Core trap engine that works in conjunction with trapController.ts
 * MIT License © 2025 Geoff Webster
 */

// Type definitions for better TypeScript integration
export interface PlayerState {
  traits?: string[];
  items?: string[];
  inventory?: string[];
  command?: string;
  score?: number;
  health?: number;
  level?: number;
  flags?: Record<string, boolean>;
  name?: string;
  difficulty?: string;
}

export interface TrapResult {
  damage?: number;
  message: string;
  trapType?: string;
  disarmed?: boolean;
  effects?: Record<string, any>;
  severity?: string;
  success?: boolean;
}

export interface TrapDefinition {
  triggered: boolean;
  description: string;
  damage?: number;
  type?: string;
  severity?: 'light' | 'moderate' | 'severe' | 'lethal';
  roomId?: string;
  id?: string;
  autoDisarm?: boolean;
  cooldown?: number;
}

/**
 * Enhanced trap seeding configuration
 */
export interface TrapSeedingConfig {
  count: number;
  probability: number;
  excludeRooms: string[];
  preferredRooms: string[];
  severityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

/**
 * Trap statistics interface
 */
export interface TrapEngineStats {
  totalSeeded: number;
  totalTriggered: number;
  totalDisarmed: number;
  damageDealt: number;
  debugModeUsage: number;
  lastSeedTime: number;
}

/**
 * Module-scoped object to track seeded traps by room ID.
 * Enhanced structure: { [roomId]: TrapDefinition }
 * Not persisted across reloads; only for the current session.
 */
let seededTraps: Record<string, TrapDefinition> = {};

/**
 * Debug mode toggle. If true, traps do not harm the player.
 */
let debugMode: boolean = false;

/**
 * Enhanced trap tracking and statistics
 */
const trapStats: TrapEngineStats = {
  totalSeeded: 0,
  totalTriggered: 0,
  totalDisarmed: 0,
  damageDealt: 0,
  debugModeUsage: 0,
  lastSeedTime: 0
};

/**
 * Cache for trap calculations to improve performance
 */
const trapCache: Map<string, { result: boolean; timestamp: number }> = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Default seeding configuration
 */
const DEFAULT_SEED_CONFIG: TrapSeedingConfig = {
  count: 5,
  probability: 0.3,
  excludeRooms: ['intro', 'safe_zone', 'shop', 'inn'],
  preferredRooms: [],
  severityDistribution: { light: 0.5, moderate: 0.3, severe: 0.15, lethal: 0.05 },
  typeDistribution: { generic: 0.6, magical: 0.2, mechanical: 0.15, environmental: 0.05 }
};

/**
 * Enhanced seedTraps with configuration support
 * Seeds traps randomly across the game world with advanced options.
 *
 * @param roomIds - Array of valid room IDs where traps will be seeded.
 * @param config - Seeding configuration (count, probability, exclusions, etc.).
 */
export function seedTraps(
  roomIds: string[] = [], 
  config?: Partial<TrapSeedingConfig>
): void {
  try {
    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      console.warn("[TrapEngine] Warning: No valid room IDs provided for seeding traps.");
      return;
    }

    // Clear existing traps
    seededTraps = {};
    trapCache.clear();

    // Filter out excluded rooms
    
    if (validRooms.length === 0) {
      console.warn("[TrapEngine] No valid rooms available for trap seeding after exclusions.");
      return;
    }

    // Prioritize preferred rooms

    // Calculate number of traps to seed
            
    // Seed traps in preferred rooms first
        
    let trapsSeeded = 0;

    // Seed preferred rooms
    for (let i = 0; i < preferredTraps && i < shuffledPreferred.length; i++) {
            if (Math.random() < seedConfig.probability) {
                seededTraps[roomId] = trapDef;
        trapsSeeded++;
      }
    }

    // Seed remaining rooms
    for (let i = 0; i < remainingTraps && i < shuffledOther.length; i++) {
            if (Math.random() < seedConfig.probability) {
                seededTraps[roomId] = trapDef;
        trapsSeeded++;
      }
    }

    // Update statistics
    trapStats.totalSeeded += trapsSeeded;
    trapStats.lastSeedTime = Date.now();

    if (debugMode) {
      console.info(`🧨 Traps seeded: ${trapsSeeded} in rooms:`, Object.keys(seededTraps));
    }
  } catch (error) {
    console.error("[TrapEngine] Error during trap seeding:", error);
  }
}

/**
 * Generate a comprehensive trap definition
 */
function generateTrapDefinition(roomId: string, config: TrapSeedingConfig): TrapDefinition {
  try {
            
    return {
      id: `trap_${roomId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      triggered: false,
      description: generateTrapDescription(severity, type),
      damage: getSeverityDamage(severity),
      type,
      severity,
      autoDisarm: severity === 'light' && Math.random() < 0.3, // 30% chance for light traps
      cooldown: getSeverityCooldown(severity)
    };
  } catch (error) {
    console.error("[TrapEngine] Error generating trap definition:", error);
    return {
      id: `trap_${roomId}_fallback`,
      roomId,
      triggered: false,
      description: "A mysterious trap lurks here.",
      damage: 1,
      type: 'generic',
      severity: 'light'
    };
  }
}

/**
 * Enhanced isRoomTrapped with caching
 * Checks if the current room has a trap.
 *
 * @param roomId - The ID of the room to check.
 * @returns Returns true if the room is trapped, false otherwise.
 */
export function isRoomTrapped(roomId: string): boolean {
  try {
    if (!roomId || typeof roomId !== 'string') {
      return false;
    }

    // Check cache first
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }

    // Update cache
    trapCache.set(roomId, {
      result: isTrapped,
      timestamp: Date.now()
    });

    return isTrapped;
  } catch (error) {
    console.error("[TrapEngine] Error checking if room is trapped:", error);
    return false;
  }
}

/**
 * Enhanced handleRoomTrap with comprehensive mechanics
 * Handles trap activation when entering a trapped room.
 * Applies player traits/items for disarming, and returns a result object or null.
 *
 * @param roomId - The ID of the room entered by the player.
 * @param playerState - The current state of the player (inventory, traits, etc.).
 * @returns Returns an object with damage message if the trap is triggered, or null if no trap.
 */
export function handleRoomTrap(
  roomId: string,
  playerState: PlayerState
): TrapResult | null {
  try {
        if (!trap || trap.triggered) {
      return null; // No trap in the room or already triggered
    }

    if (debugMode) {
      trapStats.debugModeUsage++;
      return { 
        message: `🔧 Trap in ${roomId} triggered but harmless in debug mode.`,
        disarmed: true,
        trapType: trap.type,
        severity: trap.severity,
        success: true
      };
    }

    // Validate player state
    if (!playerState || typeof playerState !== 'object') {
      console.warn("[TrapEngine] Invalid player state provided");
      return null;
    }

    // Normalize inventory - check both 'items' and 'inventory' properties

    // Enhanced disarming logic with multiple methods
        
    if (disarmResult.canDisarm) {
      // Mark trap as triggered (disarmed)
      trap.triggered = true;
      trapStats.totalDisarmed++;
      
      // Clear cache for this room
      trapCache.delete(roomId);
      
      return { 
        message: disarmResult.message,
        disarmed: true,
        trapType: trap.type,
        severity: trap.severity,
        success: true
      };
    }

    // Trap activation
    trap.triggered = true;
    trapStats.totalTriggered++;
    
    // Calculate damage with player-specific modifiers
    let damage = trap.damage || 0;
    
    // Apply difficulty scaling
    if (playerState.difficulty === 'easy') {
      damage = Math.ceil(damage * 0.5);
    } else if (playerState.difficulty === 'hard') {
      damage = Math.ceil(damage * 1.5);
    }

    // Apply trait-based damage reduction
    if (playerTraits.includes('resistant') || playerTraits.includes('trap_resistant')) {
      damage = Math.ceil(damage * 0.7);
    }

    if (playerTraits.includes('fragile')) {
      damage = Math.ceil(damage * 1.3);
    }

    // Level-based damage scaling
    if (typeof playerState.level === 'number' && playerState.level > 1) {
      damage = Math.max(1, damage - Math.floor(playerState.level / 3));
    }

    trapStats.damageDealt += damage;
    
    // Clear cache for this room
    trapCache.delete(roomId);

    return {
      damage,
      message: `💥 ${trap.description}`,
      trapType: trap.type,
      severity: trap.severity,
      success: false
    };
  } catch (error) {
    console.error("[TrapEngine] Error handling room trap:", error);
    return {
      damage: 0,
      message: "⚠️ Something went wrong with the trap mechanism.",
      trapType: 'generic',
      success: false
    };
  }
}

/**
 * Enhanced disarm ability checking
 */
function checkDisarmAbility(
  trap: TrapDefinition,
  playerState: PlayerState,
  playerItems: string[],
  playerTraits: string[]
): { canDisarm: boolean; message: string; method: string } {
  try {
    // Auto-disarm traps
    if (trap.autoDisarm) {
      return {
        canDisarm: true,
        message: `🔧 The ${trap.severity} trap harmlessly disarms itself after triggering.`,
        method: 'auto'
      };
    }

    // Trait-based disarming
    if (playerTraits.includes('trap_expert') || playerTraits.includes('master_thief')) {
      return {
        canDisarm: true,
        message: `🎯 Your expertise allows you to expertly disarm the ${trap.severity} trap before it can harm you.`,
        method: 'expertise'
      };
    }

    if (playerTraits.includes('resistant') || playerTraits.includes('trap_resistant')) {
      return {
        canDisarm: true,
        message: `🛡️ Your natural resistance protects you from the ${trap.type} trap's effects.`,
        method: 'resistance'
      };
    }

    if (playerTraits.includes('lucky') && Math.random() < 0.3) {
      return {
        canDisarm: true,
        message: `🍀 Your luck helps you narrowly avoid the trap at the last second!`,
        method: 'luck'
      };
    }

    // Item-based disarming
    if (playerItems.includes('trapkit') || playerItems.includes('trap kit')) {
      return {
        canDisarm: true,
        message: `🔧 You quickly deploy your trap kit to neutralize the ${trap.type} trap.`,
        method: 'trapkit'
      };
    }

    if (playerItems.includes('thieves_tools') || playerItems.includes('lockpicks')) {
      return {
        canDisarm: true,
        message: `🔓 Your thieves' tools allow you to carefully disarm the mechanism.`,
        method: 'tools'
      };
    }

    // Magic-based disarming
    if (trap.type === 'magical' && (playerTraits.includes('mage') || playerTraits.includes('wizard'))) {
      return {
        canDisarm: true,
        message: `✨ Your magical knowledge allows you to dispel the trap's enchantment.`,
        method: 'magic'
      };
    }

    // Level-based disarming chance
    if (typeof playerState.level === 'number' && playerState.level >= 5) {
            if (Math.random() < disarmChance) {
        return {
          canDisarm: true,
          message: `🎓 Your experience helps you recognize and avoid the trap's trigger.`,
          method: 'experience'
        };
      }
    }

    return {
      canDisarm: false,
      message: '',
      method: 'none'
    };
  } catch (error) {
    console.error("[TrapEngine] Error checking disarm ability:", error);
    return { canDisarm: false, message: '', method: 'error' };
  }
}

/**
 * Enhanced handleTrapEscape with better logic
 * Handles trap escape when the player exits the room quickly.
 * Disarms the trap if present and conditions are met.
 *
 * @param roomId - The ID of the room the player is escaping from.
 * @param playerState - Current player state for escape calculations.
 */
export function handleTrapEscape(roomId: string, playerState?: PlayerState): boolean {
  try {
        if (!trap || trap.triggered) {
      return false;
    }

    // Calculate escape success based on player traits
    let escapeChance = 0.6; // Base 60% chance

    if (playerState) {
            
      if (playerTraits.includes('agile') || playerTraits.includes('quick')) {
        escapeChance += 0.2;
      }
      
      if (playerTraits.includes('clumsy')) {
        escapeChance -= 0.2;
      }

      // Level-based escape bonus
      if (typeof playerState.level === 'number') {
        escapeChance += playerState.level * 0.02;
      }
    }

    escapeChance = Math.max(0.1, Math.min(0.9, escapeChance));

    if (Math.random() < escapeChance) {
      delete seededTraps[roomId]; // Successfully escape and disarm
      trapCache.delete(roomId);
      
      if (debugMode) {
        console.info(`🚪 Trap in ${roomId} disarmed via quick escape.`);
      }
      
      return true;
    }

    // Failed escape - trap still active
    if (debugMode) {
      console.info(`❌ Failed to escape trap in ${roomId}.`);
    }

    return false;
  } catch (error) {
    console.error("[TrapEngine] Error handling trap escape:", error);
    return false;
  }
}

/**
 * Enhanced listActiveTraps with detailed information
 * Lists all active traps with optional filtering.
 *
 * @param includeTriggered - Whether to include already triggered traps.
 * @returns Returns detailed information about active traps.
 */
export function listActiveTraps(includeTriggered: boolean = false): Array<{
  roomId: string;
  trap: TrapDefinition;
}> {
  try {
    return Object.entries(seededTraps)
      .filter(([_, trap]) => includeTriggered || !trap.triggered)
      .map(([roomId, trap]) => ({ roomId, trap }));
  } catch (error) {
    console.error("[TrapEngine] Error listing active traps:", error);
    return [];
  }
}

/**
 * Enhanced debug mode management
 */
export function enableDebugMode(): void {
  debugMode = true;
  console.info('🔧 Trap debug mode enabled - traps will not cause damage');
}

export function disableDebugMode(): void {
  debugMode = false;
  console.info('⚔️ Trap debug mode disabled - traps will cause damage');
}

export function getDebugMode(): boolean {
  return debugMode;
}

export function toggleDebugMode(): boolean {
  debugMode = !debugMode;
  console.info(`🔧 Trap debug mode ${debugMode ? 'enabled' : 'disabled'}`);
  return debugMode;
}

/**
 * Enhanced Easter egg traps with better error handling
 */
export function maybeTriggerInquisitionTrap(
  roomId: string,
  playerState: PlayerState,
  appendMessage: (msg: string) => void
): void {
  try {
    if (!appendMessage || typeof appendMessage !== 'function') {
      console.warn("[TrapEngine] Invalid appendMessage function provided");
      return;
    }

    if (Math.random() < 0.01) { // 1% chance
      appendMessage(`⚠️ The air thickens. Robed figures burst in!`);
      appendMessage(`🟥 "NO ONE EXPECTS THE SPANISH INQUISITION!"`);
      appendMessage(`They interrogate you about improper codex dusting.`);

            if (commandText.includes("expect") || commandText.includes("inquisition")) {
        appendMessage(`😲 They're baffled by your cleverness and award you a certificate.`);
        if (typeof playerState.score === 'number') {
          playerState.score += 5;
        }
        
        // Add achievement trait
        if (!playerState.traits) {
          playerState.traits = [];
        }
        if (!playerState.traits.includes('inquisition_survivor')) {
          playerState.traits.push('inquisition_survivor');
        }
      } else {
        appendMessage(`You sit in the comfy chair. Gain +1 health, lose -1 dignity.`);
        if (typeof playerState.health === 'number') {
          playerState.health = Math.min(playerState.health + 1, 100);
        }
      }
    }
  } catch (error) {
    console.error("[TrapEngine] Error in Inquisition trap:", error);
  }
}

export function maybeTriggerBugblatterTrap(
  roomId: string,
  playerState: PlayerState,
  appendMessage: (msg: string) => void
): void {
  try {
    if (!appendMessage || typeof appendMessage !== 'function') {
      console.warn("[TrapEngine] Invalid appendMessage function provided");
      return;
    }

    if (Math.random() < 0.0142) { // 1.42% chance (Douglas Adams reference)
      appendMessage(`🌌 You feel a strange presence. Something *very stupid* is watching you.`);
      appendMessage(`💥 A voice booms: "Beware the Ravenous Bugblatter Beast of Traal!"`);

      // Check both inventory properties for towel
            
      if (hasTowel) {
        appendMessage(`🧼 You wrap your towel around your head. The beast assumes you can't see it... and wanders off confused.`);
        appendMessage(`🧠 As Douglas Adams rightly pointed out, towels are invaluable for travel.`);
        
        // Safely modify traits
        if (!playerState.traits) {
          playerState.traits = [];
        }
        if (!playerState.traits.includes("wise")) {
          playerState.traits.push("wise");
        }
        if (!playerState.traits.includes("hoopy_frood")) {
          playerState.traits.push("hoopy_frood");
        }
        
        if (typeof playerState.score === 'number') {
          playerState.score += 3;
        }
      } else {
        appendMessage(`😱 The beast slobbers all over your narrative. You lose 2 health.`);
        if (typeof playerState.health === 'number') {
          playerState.health = Math.max(0, playerState.health - 2);
        }
      }
    }
  } catch (error) {
    console.error("[TrapEngine] Error in Bugblatter trap:", error);
  }
}

/**
 * Enhanced handleTrapResult with better messaging
 * Processes trap result and dispatches appropriate messages.
 *
 * @param trap - The trap definition with triggered state and description.
 * @param dispatchMessage - Function to dispatch messages to the UI.
 */
export function handleTrapResult(
  trap: TrapDefinition,
  dispatchMessage: (msg: string, type: string) => void
): void {
  try {
    if (!dispatchMessage || typeof dispatchMessage !== 'function') {
      console.warn("[TrapEngine] Invalid dispatchMessage function provided");
      return;
    }

    if (!trap) {
      console.warn("[TrapEngine] No trap definition provided");
      return;
    }

    if (trap.triggered) {
            dispatchMessage(
        `${severityIcon} You spring a ${trap.severity || 'unknown'} trap! ${trap.description}`, 
        'error'
      );
    } else {
      dispatchMessage(`✅ You deftly avoid a trap.`, 'success');
    }
  } catch (error) {
    console.error("[TrapEngine] Error handling trap result:", error);
    if (dispatchMessage) {
      dispatchMessage("⚠️ Error processing trap result.", 'error');
    }
  }
}

/**
 * Enhanced clearAllTraps with statistics tracking
 * Clears all active traps (useful for game reset).
 */
export function clearAllTraps(): void {
  try {
        seededTraps = {};
    trapCache.clear();
    
    if (debugMode) {
      console.info(`🧹 All ${trapCount} traps cleared`);
    }
  } catch (error) {
    console.error("[TrapEngine] Error clearing all traps:", error);
  }
}

/**
 * Enhanced getTrapCount with filtering options
 * Returns the number of active traps with optional filters.
 *
 * @param filter - Optional filter criteria.
 */
export function getTrapCount(filter?: {
  triggered?: boolean;
  severity?: string;
  type?: string;
}): number {
  try {
    if (!filter) {
      return Object.keys(seededTraps).length;
    }

    return Object.values(seededTraps).filter(trap => {
      if (filter.triggered !== undefined && trap.triggered !== filter.triggered) {
        return false;
      }
      if (filter.severity && trap.severity !== filter.severity) {
        return false;
      }
      if (filter.type && trap.type !== filter.type) {
        return false;
      }
      return true;
    }).length;
  } catch (error) {
    console.error("[TrapEngine] Error getting trap count:", error);
    return 0;
  }
}

/**
 * Get comprehensive trap statistics
 */
export function getTrapStatistics(): TrapEngineStats & {
  activeTrapsByType: Record<string, number>;
  activeTrapsBySeverity: Record<string, number>;
} {
  try {
        
          acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

          acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...trapStats,
      activeTrapsByType,
      activeTrapsBySeverity
    };
  } catch (error) {
    console.error("[TrapEngine] Error getting trap statistics:", error);
    return {
      ...trapStats,
      activeTrapsByType: {},
      activeTrapsBySeverity: {}
    };
  }
}

/**
 * Reset trap statistics
 */
export function resetTrapStatistics(): void {
  try {
    trapStats.totalSeeded = 0;
    trapStats.totalTriggered = 0;
    trapStats.totalDisarmed = 0;
    trapStats.damageDealt = 0;
    trapStats.debugModeUsage = 0;
    trapStats.lastSeedTime = 0;
    
    console.info("[TrapEngine] Trap statistics reset");
  } catch (error) {
    console.error("[TrapEngine] Error resetting trap statistics:", error);
  }
}

/**
 * Get specific trap information
 */
export function getTrapInfo(roomId: string): TrapDefinition | null {
  try {
    return seededTraps[roomId] || null;
  } catch (error) {
    console.error("[TrapEngine] Error getting trap info:", error);
    return null;
  }
}

/**
 * Helper Functions
 */

function getWeightedRandom(weights: Record<string, number>): string {
  try {
        if (totalWeight === 0) return Object.keys(weights)[0] || 'default';
    
    let random = Math.random() * totalWeight;
    
    for (const [key, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) return key;
    }
    
    return Object.keys(weights)[0] || 'default';
  } catch (error) {
    console.error("[TrapEngine] Error in weighted random selection:", error);
    return 'default';
  }
}

function generateTrapDescription(severity: string, type: string): string {
  try {
    const descriptions: Record<string, Record<string, string[]>> = {
      light: {
        generic: ['A small pressure plate clicks beneath your foot!', 'You trigger a minor alarm!'],
        magical: ['Minor magical runes briefly glow!', 'A weak magical ward sparks!'],
        mechanical: ['A tiny dart shoots from the wall!', 'A small spring mechanism snaps!'],
        environmental: ['A pebble falls from above!', 'You step on a loose floorboard!']
      },
      moderate: {
        generic: ['A hidden mechanism activates!', 'You trigger a substantial trap!'],
        magical: ['Magical energy crackles through the air!', 'Arcane symbols flare with power!'],
        mechanical: ['Crossbow bolts fire from hidden slots!', 'Gears grind as mechanisms activate!'],
        environmental: ['Spikes shoot up from the floor!', 'Poisonous gas begins to seep out!']
      },
      severe: {
        generic: ['A deadly trap springs into action!', 'You trigger a lethal mechanism!'],
        magical: ['Devastating magical forces unleash!', 'Reality warps around magical sigils!'],
        mechanical: ['Massive blades swing down!', 'Heavy crushing pistons activate!'],
        environmental: ['The floor gives way beneath you!', 'Acid pours from hidden reservoirs!']
      },
      lethal: {
        generic: ['An extremely deadly trap activates!', 'You trigger a potentially fatal mechanism!'],
        magical: ['Reality-rending magic tears through space!', 'Ancient curses awaken with fury!'],
        mechanical: ['Industrial-grade death machines engage!', 'Precision-engineered kill mechanisms activate!'],
        environmental: ['The entire room becomes a death trap!', 'Catastrophic environmental hazards trigger!']
      }
    };

    return typeDescs[Math.floor(Math.random() * typeDescs.length)] || 'A mysterious trap activates!';
  } catch (error) {
    console.error("[TrapEngine] Error generating trap description:", error);
    return 'A mysterious trap activates!';
  }
}

function getSeverityDamage(severity: string): number {
  try {
    switch (severity) {
      case 'light': return Math.floor(Math.random() * 2) + 1; // 1-2
      case 'moderate': return Math.floor(Math.random() * 3) + 2; // 2-4
      case 'severe': return Math.floor(Math.random() * 4) + 3; // 3-6
      case 'lethal': return Math.floor(Math.random() * 6) + 5; // 5-10
      default: return 1;
    }
  } catch (error) {
    console.error("[TrapEngine] Error calculating severity damage:", error);
    return 1;
  }
}

function getSeverityCooldown(severity: string): number {
  try {
    switch (severity) {
      case 'light': return 5000; // 5 seconds
      case 'moderate': return 15000; // 15 seconds
      case 'severe': return 30000; // 30 seconds
      case 'lethal': return 60000; // 1 minute
      default: return 10000;
    }
  } catch (error) {
    console.error("[TrapEngine] Error calculating severity cooldown:", error);
    return 10000;
  }
}

function getSeverityIcon(severity?: string): string {
  switch (severity) {
    case 'light': return '⚠️';
    case 'moderate': return '⚡';
    case 'severe': return '💥';
    case 'lethal': return '☠️';
    default: return '⚠️';
  }
}

// Export the seeded traps for testing/debugging purposes
export function getSeededTraps(): Record<string, TrapDefinition> {
  try {
    return { ...seededTraps };
  } catch (error) {
    console.error("[TrapEngine] Error getting seeded traps:", error);
    return {};
  }
}

/**
 * Clear cache (useful for memory management)
 */
export function clearTrapCache(): void {
  try {
    trapCache.clear();
    console.info("[TrapEngine] Trap cache cleared");
  } catch (error) {
    console.error("[TrapEngine] Error clearing trap cache:", error);
  }
}

/**
 * Enhanced export object for easier module usage
 */
export 
export default TrapEngine;

// Unified trap export for reuse across modules
export type Trap = TrapDefinition;
