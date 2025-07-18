// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: trapController.ts
// Path: src/engine/trapController.ts
//
// trapController utility for Gorstan game.
// Handles trap seeding, detection, disarming, and debugging for room-based traps.
// Traps are stored in-memory for the current session and can be extended for persistence.

// Import types from trapEngine for consistency

/**
 * Enhanced trap definition with more detailed properties
 */
export interface TrapData {
  id: string;
  description: string;
  autoDisarm: boolean;
  severity: 'light' | 'moderate' | 'severe' | 'lethal';
  damage?: number;
  type?: 'environmental' | 'magical' | 'mechanical' | 'cursed';
  triggered?: boolean;
  roomId: string;
  createdAt: number;
  triggeredAt?: number;
  disarmedBy?: string;
  repeatTrigger?: boolean;
  cooldown?: number;
  requirements?: {
    minLevel?: number;
    flags?: string[];
    items?: string[];
  };
  effects?: {
    statusEffect?: string;
    teleport?: string;
    flagSet?: string;
    itemGiven?: string;
    itemTaken?: string;
  };
}

/**
 * Trap trigger context for enhanced event handling
 */
export interface TrapTriggerContext {
  playerState: PlayerState;
  roomId: string;
  triggerType: 'enter' | 'exit' | 'search' | 'take' | 'use';
  itemUsed?: string;
  preventDamage?: boolean;
}

/**
 * Trap statistics interface
 */
export interface TrapStatistics {
  total: number;
  triggered: number;
  active: number;
  disarmed: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  byRoom: Record<string, number>;
  recentTriggers: Array<{
    trapId: string;
    roomId: string;
    triggeredAt: number;
    disarmed: boolean;
  }>;
}

/**
 * Trap seeding configuration
 */
export interface TrapSeedConfig {
  probability: number;
  severityWeights: Record<string, number>;
  typeWeights: Record<string, number>;
  roomExclusions: string[];
  forcedTraps: Record<string, Partial<TrapData>>;
}

/**
 * In-memory trap state for simplicity. Could be persisted or stored in flags.
 */
const activeTraps: Record<string, TrapData> = {};

/**
 * Trap cooldowns to prevent spam triggering
 */
const trapCooldowns: Map<string, number> = new Map();

/**
 * Performance cache for trap checks
 */
const trapCache: Map<string, { exists: boolean; timestamp: number }> = new Map();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Configuration constants
 */
const DEFAULT_SEED_CONFIG: TrapSeedConfig = {
  probability: 0.2, // 20% chance
  severityWeights: { light: 0.5, moderate: 0.3, severe: 0.15, lethal: 0.05 },
  typeWeights: { environmental: 0.4, mechanical: 0.3, magical: 0.2, cursed: 0.1 },
  roomExclusions: ['intro', 'safe_zone', 'shop', 'inn'],
  forcedTraps: {}
};

/**
 * Enhanced trap descriptions by severity and type for variety
 */
const TRAP_DESCRIPTIONS: Record<string, Record<string, string[]>> = {
  light: {
    environmental: [
      'A hidden pressure plate clicks beneath your foot!',
      'You notice a tripwire just as you step on it!',
      'A small pebble falls from a loose ceiling tile!'
    ],
    mechanical: [
      'A tiny dart shoots from a concealed hole in the wall!',
      'A spring-loaded panel snaps at your ankle!',
      'A small blade swipes across your path!'
    ],
    magical: [
      'Mystical runes briefly glow and spark!',
      'A minor ward zaps you with static energy!',
      'Ethereal whispers echo ominously around you!'
    ],
    cursed: [
      'You feel a moment of unease and dread!',
      'Dark energy briefly swirls around your feet!',
      'A chill runs down your spine as shadows shift!'
    ]
  },
  moderate: {
    environmental: [
      'Spikes shoot up from the floor!',
      'A heavy stone falls from the ceiling!',
      'Poisonous gas begins to seep from the walls!'
    ],
    mechanical: [
      'Crossbow bolts fire from hidden slots!',
      'A massive pendulum swings down from above!',
      'Grinding gears activate a crushing mechanism!'
    ],
    magical: [
      'Arcane energy crackles through the air!',
      'A magical explosion erupts from an enchanted circle!',
      'Spectral hands reach out from the walls!'
    ],
    cursed: [
      'Dark magic saps your strength!',
      'A malevolent presence attacks your mind!',
      'Cursed energy burns through your soul!'
    ]
  },
  severe: {
    environmental: [
      'The entire floor gives way beneath you!',
      'Massive boulders roll down from hidden chambers!',
      'A torrent of acid pours from concealed vents!'
    ],
    mechanical: [
      'Giant spinning blades emerge from the walls!',
      'A complex mechanism tries to crush you!',
      'Explosive charges detonate around the room!'
    ],
    magical: [
      'Lightning arcs between metallic walls!',
      'A devastating magical storm erupts!',
      'Powerful enchantments assault your very being!'
    ],
    cursed: [
      'Ancient curses tear at your life force!',
      'Malevolent spirits attempt to possess you!',
      'Dark gods turn their attention to you!'
    ]
  },
  lethal: {
    environmental: [
      'The room fills with deadly volcanic gas!',
      'Massive stone blocks fall in a deadly avalanche!',
      'Molten metal pours from hidden reservoirs!'
    ],
    mechanical: [
      'Industrial-grade crushing pistons activate!',
      'High-pressure steam jets try to cook you alive!',
      'Precision laser arrays begin their deadly dance!'
    ],
    magical: [
      'Reality itself begins to tear around you!',
      'Time magic threatens to age you to dust!',
      'A magical singularity forms in the center of the room!'
    ],
    cursed: [
      'The very concept of death reaches for you!',
      'Your soul begins to unravel from existence!',
      'Ancient evils focus their full attention on you!'
    ]
  }
};

/**
 * Enhanced seedTraps with configuration support
 * Seeds traps across provided room keys with advanced options.
 *
 * @param roomKeys - Array of room IDs to seed with traps.
 * @param config - Optional seeding configuration.
 */
export function seedTraps(roomKeys: string[], config?: Partial<TrapSeedConfig>): void {
  try {
    if (!Array.isArray(roomKeys) || roomKeys.length === 0) {
      console.warn('[TrapController] No valid room keys provided for seeding');
      return;
    }

    // Clear existing traps
    clearAllTraps();

    let trapsSeeded = 0;

    roomKeys.forEach((roomId) => {
      try {
        // Skip excluded rooms
        if (seedConfig.roomExclusions.some(exclusion => roomId.includes(exclusion))) {
          return;
        }

        // Check for forced traps first
        if (seedConfig.forcedTraps[roomId]) {
                    createTrap(roomId, forcedTrap);
          trapsSeeded++;
          return;
        }

        // Random seeding based on probability
        if (Math.random() < seedConfig.probability) {
                                        
          activeTraps[roomId] = trapData;
          trapsSeeded++;
        }
      } catch (error) {
        console.error(`[TrapController] Error seeding trap in room ${roomId}:`, error);
      }
    });
    
    // Clear trap cache after seeding
    trapCache.clear();
    
    console.log(`[TrapController] Traps seeded: ${trapsSeeded} out of ${roomKeys.length} rooms`);
    console.log('[TrapController] Active traps:', Object.keys(activeTraps));
  } catch (error) {
    console.error('[TrapController] Error during trap seeding:', error);
  }
}

/**
 * Enhanced trap creation with validation
 */
function createTrap(roomId: string, trapData: Partial<TrapData>): TrapData {
  try {
            
    const fullTrapData: TrapData = {
      id: `trap_${roomId}_${Date.now()}`,
      roomId,
      description: trapData.description || getRandomDescription(severity, type),
      autoDisarm: trapData.autoDisarm ?? (severity === 'light'),
      severity,
      type,
      damage: trapData.damage ?? getSeverityDamage(severity),
      triggered: false,
      createdAt: Date.now(),
      repeatTrigger: trapData.repeatTrigger ?? false,
      cooldown: trapData.cooldown ?? getCooldownForSeverity(severity),
      requirements: trapData.requirements,
      effects: trapData.effects,
      ...trapData
    };

    activeTraps[roomId] = fullTrapData;
    return fullTrapData;
  } catch (error) {
    console.error('[TrapController] Error creating trap:', error);
    throw error;
  }
}

/**
 * Enhanced getTrap with caching
 * Returns trap data if a room is trapped.
 *
 * @param roomName - The room's unique name or ID.
 * @returns Trap object if present, otherwise null.
 */
export function getTrap(roomName: string): TrapData | null {
  try {
    if (!roomName || typeof roomName !== 'string') {
      return null;
    }

    // Check cache first
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.exists ? activeTraps[roomName] || null : null;
    }

    // Update cache
    trapCache.set(roomName, {
      exists: trap !== null,
      timestamp: Date.now()
    });

    return trap;
  } catch (error) {
    console.error('[TrapController] Error getting trap:', error);
    return null;
  }
}

/**
 * Enhanced checkForTrap with context awareness
 * Checks and returns a trap message if a trap is present in the room.
 *
 * @param roomName - The room's unique name or ID.
 * @param triggerType - Type of action that might trigger the trap.
 * @returns Trap warning message or null if no trap.
 */
export function checkForTrap(roomName: string, triggerType: 'enter' | 'exit' | 'search' | 'take' | 'use' = 'enter'): string | null {
  try {
        if (!trap || trap.triggered) {
      return null;
    }

    // Check cooldown
    if (trap.cooldown && isOnCooldown(trap.id)) {
      return null;
    }

    // Some traps only trigger on specific actions
    const triggerActions = ['enter', 'search']; // Most traps trigger on enter or search
    if (!triggerActions.includes(triggerType)) {
      return null;
    }

    return `⚠️ You sense danger in this room...`;
  } catch (error) {
    console.error('[TrapController] Error checking for trap:', error);
    return null;
  }
}

/**
 * Enhanced triggerTrap with comprehensive mechanics
 * Triggers a trap in the specified room and returns result.
 * Compatible with trapEngine.ts interface.
 *
 * @param roomName - The room's unique name or ID.
 * @param context - Trap trigger context with player state and additional info.
 * @returns Trap result or null if no trap exists.
 */
export function triggerTrap(roomName: string, context: TrapTriggerContext): TrapResult | null {
  try {
        if (!trap) {
      return null;
    }

    // Check if trap is already triggered and not repeatable
    if (trap.triggered && !trap.repeatTrigger) {
      return null;
    }

    // Check cooldown
    if (trap.cooldown && isOnCooldown(trap.id)) {
      return null;
    }

    // Check requirements
    if (trap.requirements && !checkTrapRequirements(trap.requirements, context.playerState)) {
      return null;
    }

    // Mark trap as triggered
    if (!trap.repeatTrigger) {
      trap.triggered = true;
    }
    trap.triggeredAt = Date.now();

    // Set cooldown
    if (trap.cooldown) {
      trapCooldowns.set(trap.id, Date.now() + trap.cooldown);
    }

    // Check for disarming abilities
        if (disarmResult.canDisarm) {
      disarmTrap(roomName, disarmResult.method);
      return {
        message: disarmResult.message,
        disarmed: true,
        trapType: trap.type || 'environmental',
        damage: 0
      };
    }

    // Calculate damage
    let damage = trap.damage || 0;
    if (context.preventDamage) {
      damage = 0;
    }

    // Apply resistance
    if (context.playerState.traits?.includes('trap_resistant')) {
      damage = Math.ceil(damage * 0.5);
    }

    // Apply trap effects
    
    // Clear cache for this room
    trapCache.delete(roomName);

    return {
      damage,
      message: `💥 ${trap.description}`,
      trapType: trap.type || 'environmental',
      effects,
      severity: trap.severity
    };
  } catch (error) {
    console.error('[TrapController] Error triggering trap:', error);
    return {
      damage: 0,
      message: '⚠️ Something went wrong with the trap mechanism.',
      trapType: 'environmental'
    };
  }
}

/**
 * Enhanced disarmTrap with tracking
 * Removes a trap from the specified room.
 *
 * @param roomName - The room's unique name or ID.
 * @param method - Method used to disarm (for statistics).
 */
export function disarmTrap(roomName: string, method: string = 'unknown'): boolean {
  try {
        if (!trap) {
      return false;
    }

    trap.disarmedBy = method;
    delete activeTraps[roomName];
    
    // Clear cache
    trapCache.delete(roomName);
    
    console.log(`[TrapController] Trap disarmed in ${roomName} using ${method}`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error disarming trap:', error);
    return false;
  }
}

/**
 * Enhanced listActiveTraps with filtering
 * Returns all currently active traps with optional filtering.
 *
 * @param filter - Optional filter criteria.
 * @returns Record of filtered active traps.
 */
export function listActiveTraps(filter?: {
  severity?: string;
  type?: string;
  triggered?: boolean;
  room?: string;
}): Record<string, TrapData> {
  try {
    let traps = { ...activeTraps };

    if (filter) {
      traps = Object.fromEntries(
        Object.entries(traps).filter(([roomId, trap]) => {
          if (filter.severity && trap.severity !== filter.severity) return false;
          if (filter.type && trap.type !== filter.type) return false;
          if (filter.triggered !== undefined && trap.triggered !== filter.triggered) return false;
          if (filter.room && roomId !== filter.room) return false;
          return true;
        })
      );
    }

    return traps;
  } catch (error) {
    console.error('[TrapController] Error listing active traps:', error);
    return {};
  }
}

/**
 * Enhanced isRoomTrapped with validation
 * Checks if a room has an active trap.
 *
 * @param roomName - The room's unique name or ID.
 * @returns True if room is trapped, false otherwise.
 */
export function isRoomTrapped(roomName: string): boolean {
  try {
    if (!roomName || typeof roomName !== 'string') {
      return false;
    }

        return trap !== null && (!(trap.triggered ?? false) || (trap.repeatTrigger ?? false));
  } catch (error) {
    console.error('[TrapController] Error checking if room is trapped:', error);
    return false;
  }
}

/**
 * Enhanced getTrapCount with filtering
 * Returns the number of active traps with optional filtering.
 *
 * @param filter - Optional filter criteria.
 * @returns Number of matching traps.
 */
export function getTrapCount(filter?: { active?: boolean; severity?: string; type?: string }): number {
  try {
        
    if (!filter) {
      return traps.length;
    }

    return traps.filter(trap => {
      if (filter.active !== undefined) {
                if (isActive !== filter.active) return false;
      }
      if (filter.severity && trap.severity !== filter.severity) return false;
      if (filter.type && trap.type !== filter.type) return false;
      return true;
    }).length;
  } catch (error) {
    console.error('[TrapController] Error getting trap count:', error);
    return 0;
  }
}

/**
 * Enhanced clearAllTraps with confirmation
 * Clears all active traps (useful for game reset).
 *
 * @param confirm - Explicit confirmation to prevent accidental clearing.
 */
export function clearAllTraps(confirm: boolean = false): boolean {
  try {
    if (!confirm) {
      console.warn('[TrapController] clearAllTraps requires explicit confirmation');
      return false;
    }

        Object.keys(activeTraps).forEach(key => delete activeTraps[key]);
    trapCooldowns.clear();
    trapCache.clear();
    
    console.log(`[TrapController] ${count} traps cleared`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error clearing all traps:', error);
    return false;
  }
}

/**
 * Enhanced resetTrap with validation
 * Resets a triggered trap to its original state.
 *
 * @param roomName - The room's unique name or ID.
 */
export function resetTrap(roomName: string): boolean {
  try {
        if (!trap) {
      return false;
    }

    trap.triggered = false;
    delete trap.triggeredAt;
    delete trap.disarmedBy;
    
    // Clear cooldown
    trapCooldowns.delete(trap.id);
    
    // Clear cache
    trapCache.delete(roomName);
    
    console.log(`[TrapController] Trap reset in ${roomName}`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error resetting trap:', error);
    return false;
  }
}

/**
 * Helper Functions
 */

function getWeightedRandomSeverity(weights: Record<string, number>): 'light' | 'moderate' | 'severe' | 'lethal' {
    let cumulative = 0;
  
  for (const [severity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return severity as 'light' | 'moderate' | 'severe' | 'lethal';
    }
  }
  
  return 'light'; // Fallback
}

function getWeightedRandomType(weights: Record<string, number>): 'environmental' | 'magical' | 'mechanical' | 'cursed' {
    let cumulative = 0;
  
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return type as 'environmental' | 'magical' | 'mechanical' | 'cursed';
    }
  }
  
  return 'environmental'; // Fallback
}

function getRandomDescription(severity: string, type: string): string {
  try {
        if (!descriptions || descriptions.length === 0) {
      return 'A mysterious trap activates!';
    }
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  } catch (error) {
    console.error('[TrapController] Error getting random description:', error);
    return 'A mysterious trap activates!';
  }
}

function generateTrapData(roomId: string, severity: string, type: string): TrapData {
  return {
    id: `trap_${roomId}_${Date.now()}`,
    roomId,
    description: getRandomDescription(severity, type),
    autoDisarm: severity === 'light',
    severity: severity as 'light' | 'moderate' | 'severe' | 'lethal',
    type: type as 'environmental' | 'magical' | 'mechanical' | 'cursed',
    damage: getSeverityDamage(severity),
    triggered: false,
    createdAt: Date.now(),
    repeatTrigger: Math.random() < 0.1, // 10% chance of repeatable traps
    cooldown: getCooldownForSeverity(severity)
  };
}

function getSeverityDamage(severity: string): number {
  switch (severity) {
    case 'light': return Math.floor(Math.random() * 2) + 1; // 1-2
    case 'moderate': return Math.floor(Math.random() * 3) + 2; // 2-4
    case 'severe': return Math.floor(Math.random() * 4) + 3; // 3-6
    case 'lethal': return Math.floor(Math.random() * 6) + 5; // 5-10
    default: return 1;
  }
}

function getCooldownForSeverity(severity: string): number {
  switch (severity) {
    case 'light': return 5000; // 5 seconds
    case 'moderate': return 10000; // 10 seconds
    case 'severe': return 30000; // 30 seconds
    case 'lethal': return 60000; // 1 minute
    default: return 5000;
  }
}

function isOnCooldown(trapId: string): boolean {
    if (!cooldownEnd) return false;
  
  if (Date.now() >= cooldownEnd) {
    trapCooldowns.delete(trapId);
    return false;
  }
  
  return true;
}

function checkTrapRequirements(requirements: NonNullable<TrapData['requirements']>, playerState: PlayerState): boolean {
  try {
    if (requirements.minLevel && (playerState.level || 1) < requirements.minLevel) {
      return false;
    }

    if (requirements.flags && requirements.flags.length > 0) {
            if (!requirements.flags.every(flag => playerFlags[flag])) {
        return false;
      }
    }

    if (requirements.items && requirements.items.length > 0) {
            if (!requirements.items.some(item => playerItems.includes(item))) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[TrapController] Error checking trap requirements:', error);
    return true; // Default to allowing trap if check fails
  }
}

function checkDisarmAbility(trap: TrapData, context: TrapTriggerContext): {
  canDisarm: boolean;
  method: string;
  message: string;
} {
  try {
        
    // Auto-disarm traps
    if (trap.autoDisarm) {
      return {
        canDisarm: true,
        method: 'auto',
        message: '🔧 The trap harmlessly disarms itself after triggering.'
      };
    }

    // Trait-based disarming
    if (playerTraits.includes('trap_expert')) {
      return {
        canDisarm: true,
        method: 'expertise',
        message: '🎯 Your expertise allows you to expertly disarm the trap before it can harm you.'
      };
    }

    if (playerTraits.includes('resistant') || playerTraits.includes('trap_resistant')) {
      return {
        canDisarm: true,
        method: 'resistance',
        message: '🛡️ Your natural resistance protects you from the trap\'s effects.'
      };
    }

    // Item-based disarming
    if (playerItems.includes('trapkit') || playerItems.includes('trap kit')) {
      return {
        canDisarm: true,
        method: 'trapkit',
        message: '🔧 You quickly deploy your trap kit to neutralize the danger.'
      };
    }

    if (playerItems.includes('thieves_tools') || playerItems.includes('lockpicks')) {
      return {
        canDisarm: true,
        method: 'tools',
        message: '🔓 Your thieves\' tools allow you to carefully disarm the mechanism.'
      };
    }

    // Magic-based disarming for magical traps
    if (trap.type === 'magical' && playerTraits.includes('mage')) {
      return {
        canDisarm: true,
        method: 'magic',
        message: '✨ Your magical knowledge allows you to dispel the trap\'s enchantment.'
      };
    }

    // Luck-based disarming (small chance)
    if (Math.random() < 0.05) { // 5% chance
      return {
        canDisarm: true,
        method: 'luck',
        message: '🍀 Pure luck helps you avoid the trap at the last second!'
      };
    }

    return {
      canDisarm: false,
      method: 'none',
      message: ''
    };
  } catch (error) {
    console.error('[TrapController] Error checking disarm ability:', error);
    return { canDisarm: false, method: 'error', message: '' };
  }
}

function applyTrapEffects(trap: TrapData, context: TrapTriggerContext): Record<string, any> {
  try {
    const effects: Record<string, any> = {};

    if (!trap.effects) {
      return effects;
    }

    if (trap.effects.statusEffect) {
      effects.statusEffect = trap.effects.statusEffect;
    }

    if (trap.effects.teleport) {
      effects.teleport = trap.effects.teleport;
    }

    if (trap.effects.flagSet) {
      effects.flagSet = trap.effects.flagSet;
    }

    if (trap.effects.itemGiven) {
      effects.itemGiven = trap.effects.itemGiven;
    }

    if (trap.effects.itemTaken) {
      effects.itemTaken = trap.effects.itemTaken;
    }

    return effects;
  } catch (error) {
    console.error('[TrapController] Error applying trap effects:', error);
    return {};
  }
}

/**
 * Enhanced getTrapStatistics with comprehensive data
 * Export trap statistics for debugging and analytics.
 */
export function getTrapStatistics(): TrapStatistics {
  try {
                
          return acc;
    }, {} as Record<string, number>);

          acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

          return acc;
    }, {} as Record<string, number>);

    return {
      total: traps.length,
      triggered,
      active: traps.length - triggered,
      disarmed,
      bySeverity,
      byType,
      byRoom,
      recentTriggers
    };
  } catch (error) {
    console.error('[TrapController] Error getting trap statistics:', error);
    return {
      total: 0,
      triggered: 0,
      active: 0,
      disarmed: 0,
      bySeverity: {},
      byType: {},
      byRoom: {},
      recentTriggers: []
    };
  }
}

/**
 * Batch trap operations for performance
 */
export function batchTrapOperations(operations: Array<{
  type: 'create' | 'trigger' | 'disarm' | 'reset';
  roomId: string;
  data?: any;
}>): Array<{ success: boolean; error?: string }> {
  try {
    return operations.map(op => {
      try {
        switch (op.type) {
          case 'create':
            createTrap(op.roomId, op.data || {});
            return { success: true };
          case 'trigger':
            triggerTrap(op.roomId, op.data);
            return { success: true };
          case 'disarm':
            disarmTrap(op.roomId, op.data?.method);
            return { success: true };
          case 'reset':
            resetTrap(op.roomId);
            return { success: true };
          default:
            return { success: false, error: 'Unknown operation type' };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  } catch (error) {
    console.error('[TrapController] Error in batch operations:', error);
    return operations.map(() => ({ 
      success: false, 
      error: 'Batch operation failed' 
    }));
  }
}

/**
 * Save trap state to localStorage
 */
export function saveTrapState(): boolean {
  try {
        
    localStorage.setItem('gorstan_trap_state', JSON.stringify(state));
    console.log('[TrapController] Trap state saved');
    return true;
  } catch (error) {
    console.error('[TrapController] Error saving trap state:', error);
    return false;
  }
}

/**
 * Load trap state from localStorage
 */
export function loadTrapState(): boolean {
  try {
        if (!savedState) {
      console.log('[TrapController] No saved trap state found');
      return false;
    }

    // Restore active traps
    Object.assign(activeTraps, state.activeTraps || {});
    
    // Restore cooldowns
    if (state.trapCooldowns) {
      Object.entries(state.trapCooldowns).forEach(([key, value]) => {
        trapCooldowns.set(key, value as number);
      });
    }

    // Clear expired cooldowns
        for (const [trapId, cooldownEnd] of trapCooldowns.entries()) {
      if (now >= cooldownEnd) {
        trapCooldowns.delete(trapId);
      }
    }

    console.log(`[TrapController] Loaded ${Object.keys(activeTraps).length} traps from saved state`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error loading trap state:', error);
    return false;
  }
}

/**
 * Enhanced exports with comprehensive utilities
 */
export 
export default TrapController;
