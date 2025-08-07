// src/engine/trapController.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles trap logic and room-based dangers.

// Import removed - using TrapData interface defined below instead of Trap

interface PlayerState {
  readonly inventory?: readonly string[];
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
  readonly traits?: readonly string[];
  readonly health?: number;
  readonly score?: number;
  readonly name?: string;
  readonly level?: number;
  readonly experience?: number;
}

interface TrapData {
  id: string;
  name?: string;
  description: string;
  type?: 'environmental' | 'magical' | 'mechanical' | 'cursed';
  difficulty?: number;
  isTriggered?: boolean;
  damage?: number;
  effects?: {
    statusEffect?: string;
    teleport?: string;
    flagSet?: string;
    itemGiven?: string;
    itemTaken?: string;
  };
  requirements?: {
    minLevel?: number;
    flags?: string[];
    items?: string[];
  };
  autoDisarm?: boolean;
  severity?: 'light' | 'moderate' | 'severe' | 'lethal';
  triggered?: boolean;
  roomId?: string;
  createdAt?: number;
  triggeredAt?: number;
  disarmedBy?: string;
  repeatTrigger?: boolean;
  cooldown?: number;
}

interface TrapCheck {
  success: boolean;
  message: string;
  damage?: number;
  effects?: string[];
}

interface TrapContext {
  playerState: PlayerState;
  roomState?: Record<string, any>;
  trapData: TrapData;
  attemptCount?: number;
}

interface TrapSystem {
  activeTrap: TrapData | null;
  setActiveTrap: (trap: TrapData | null) => void;
  checkTrap: (trapId: string, context: TrapContext) => TrapCheck;
  triggerTrap: (trap: TrapData, context: TrapContext) => TrapCheck;
  disarmTrap: (trap: TrapData, context: TrapContext) => TrapCheck;
  bypassTrap: (trap: TrapData, context: TrapContext) => TrapCheck;
}

interface TrapResult {
  damage: number;
  message: string;
  trapType: string;
  effects?: any;
  severity?: string;
  disarmed?: boolean;
}

// Registry for all traps in the game
const trapRegistry = new Map<string, TrapData>();

// Active trap tracking
let currentActiveTrap: TrapData | null = null;

/**
 * Registers a trap in the system
 */
export function registerTrap(trapData: TrapData): void {
  const { id } = trapData;
  if (trapRegistry.has(id)) {
    console.warn(`Trap with id ${id} already registered, overwriting`);
  }
  trapRegistry.set(id, trapData);
}

/**
 * Retrieves a trap by ID
 */
export function getTrap(trapId: string): TrapData | undefined {
  return trapRegistry.get(trapId);
}
















export interface TrapTriggerContext {
  playerState: PlayerState;
  roomId: string;
  triggerType: 'enter' | 'exit' | 'search' | 'take' | 'use';
  itemUsed?: string;
  preventDamage?: boolean;
}


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


export interface TrapSeedConfig {
  probability: number;
  severityWeights: Record<string, number>;
  typeWeights: Record<string, number>;
  roomExclusions: string[];
  forcedTraps: Record<string, Partial<TrapData>>;
}


const activeTraps: Record<string, TrapData> = {};


const trapCooldowns: Map<string, number> = new Map();


const trapCache: Map<string, { exists: boolean; timestamp: number }> = new Map();
// Variable declaration
const CACHE_DURATION = 30000; 


const DEFAULT_SEED_CONFIG: TrapSeedConfig = {
  probability: 0.2, 
  severityWeights: { light: 0.5, moderate: 0.3, severe: 0.15, lethal: 0.05 },
  typeWeights: { environmental: 0.4, mechanical: 0.3, magical: 0.2, cursed: 0.1 },
  roomExclusions: ['intro', 'safe_zone', 'shop', 'inn'],
  forcedTraps: {}
};


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



// --- Function: seedTraps ---
export function seedTraps(roomKeys: string[], config?: Partial<TrapSeedConfig>): void {
  try {
    if (!Array.isArray(roomKeys) || roomKeys.length === 0) {
      console.warn('[TrapController] No valid room keys provided for seeding');
      return;
    }

    const seedConfig = { ...DEFAULT_SEED_CONFIG, ...config };
    clearAllTraps(true);

    let trapsSeeded = 0;

    roomKeys.forEach((roomId) => {
      try {
        
        if (seedConfig.roomExclusions.some(exclusion => roomId.includes(exclusion))) {
          return;
        }

        
        if (seedConfig.forcedTraps[roomId]) {
          const forcedTrap = seedConfig.forcedTraps[roomId];
          const trapData = createTrap(roomId, forcedTrap);
          activeTraps[roomId] = trapData;
          trapsSeeded++;
          return;
        }

        
        if (Math.random() < seedConfig.probability) {
          const severity = getWeightedRandomSeverity(seedConfig.severityWeights);
          const type = getWeightedRandomType(seedConfig.typeWeights);
          const trapData = createTrap(roomId, { severity, type });
          activeTraps[roomId] = trapData;
          trapsSeeded++;
        }
      } catch (error) {
        console.error(`[TrapController] Error seeding trap in room ${roomId}:`, error);
      }
    });

    
    trapCache.clear();

    console.log(`[TrapController] Traps seeded: ${trapsSeeded} out of ${roomKeys.length} rooms`);
    console.log('[TrapController] Active traps:', Object.keys(activeTraps));
  } catch (error) {
    console.error('[TrapController] Error during trap seeding:', error);
  }
}



// --- Function: createTrap ---
function createTrap(roomId: string, trapData: Partial<TrapData>): TrapData {
  try {
    const severity = trapData.severity || 'light';
    const type = trapData.type || 'environmental';

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

// --- Function: getTrapByRoom ---
export function getTrapByRoom(roomName: string): TrapData | null {
  try {
    if (!roomName || typeof roomName !== 'string') {
      return null;
    }

    const cached = trapCache.get(roomName);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.exists ? activeTraps[roomName] || null : null;
    }

    const trap = activeTraps[roomName] || null;
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



// --- Function: checkForTrap ---
export function checkForTrap(roomName: string, triggerType: 'enter' | 'exit' | 'search' | 'take' | 'use' = 'enter'): string | null {
  try {
    const trap = getTrapByRoom(roomName);
    if (!trap || trap.triggered) {
      return null;
    }

    
    if (trap.cooldown && isOnCooldown(trap.id)) {
      return null;
    }

    
// Variable declaration
    const triggerActions = ['enter', 'search']; 
    if (!triggerActions.includes(triggerType)) {
      return null;
    }

    return `⚠️ You sense danger in this room...`;
  } catch (error) {
    console.error('[TrapController] Error checking for trap:', error);
    return null;
  }
}



// --- Function: triggerTrap ---
export function triggerTrap(roomName: string, context: TrapTriggerContext): TrapResult | null {
  try {
    const trap = getTrapByRoom(roomName);
    if (!trap) {
      return null;
    }

    
    if (trap.triggered && !trap.repeatTrigger) {
      return null;
    }

    
    if (trap.cooldown && isOnCooldown(trap.id)) {
      return null;
    }

    
    if (trap.requirements && !checkTrapRequirements(trap.requirements, context.playerState)) {
      return null;
    }

    
    if (!trap.repeatTrigger) {
      trap.triggered = true;
    }
    trap.triggeredAt = Date.now();

    
    if (trap.cooldown) {
      trapCooldowns.set(trap.id, Date.now() + trap.cooldown);
    }

    const disarmResult = checkAutoDisarm(trap, context);
    if (disarmResult.canDisarm) {
      disarmTrap(roomName, disarmResult.method);
      return {
        message: disarmResult.message,
        disarmed: true,
        trapType: trap.type || 'environmental',
        damage: 0
      };
    }

    
    let damage = trap.damage || 0;
    if (context.preventDamage) {
      damage = 0;
    }

    
    if (context.playerState.traits?.includes('trap_resistant')) {
      damage = Math.ceil(damage * 0.5);
    }

    const effects = trap.effects || {};

    
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



// --- Function: disarmTrap ---
export function disarmTrap(roomName: string, method: string = 'unknown'): boolean {
  try {
    const trap = getTrapByRoom(roomName);
    if (!trap) {
      return false;
    }

    trap.disarmedBy = method;
    delete activeTraps[roomName];

    
    trapCache.delete(roomName);

    console.log(`[TrapController] Trap disarmed in ${roomName} using ${method}`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error disarming trap:', error);
    return false;
  }
}



// --- Function: listActiveTraps ---
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



// --- Function: isRoomTrapped ---
export function isRoomTrapped(roomName: string): boolean {
  try {
    if (!roomName || typeof roomName !== 'string') {
      return false;
    }

    const trap = getTrapByRoom(roomName);
    return trap !== null && (!(trap.triggered ?? false) || (trap.repeatTrigger ?? false));
  } catch (error) {
    console.error('[TrapController] Error checking if room is trapped:', error);
    return false;
  }
}



// --- Function: getTrapCount ---
export function getTrapCount(filter?: { active?: boolean; severity?: string; type?: string }): number {
  try {
    const traps = Object.values(activeTraps);

    if (!filter) {
      return traps.length;
    }

    return traps.filter(trap => {
      if (filter.active !== undefined) {
        const isActive = !(trap.triggered ?? false) || (trap.repeatTrigger ?? false);
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



// --- Function: clearAllTraps ---
export function clearAllTraps(confirm: boolean = false): boolean {
  try {
    if (!confirm) {
      console.warn('[TrapController] clearAllTraps requires explicit confirmation');
      return false;
    }

    const count = Object.keys(activeTraps).length;
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



// --- Function: resetTrap ---
export function resetTrap(roomName: string): boolean {
  try {
    const trap = getTrapByRoom(roomName);
    if (!trap) {
      return false;
    }

    trap.triggered = false;
    delete trap.triggeredAt;
    delete trap.disarmedBy;

    
    trapCooldowns.delete(trap.id);

    
    trapCache.delete(roomName);

    console.log(`[TrapController] Trap reset in ${roomName}`);
    return true;
  } catch (error) {
    console.error('[TrapController] Error resetting trap:', error);
    return false;
  }
}




// --- Function: getWeightedRandomSeverity ---
function getWeightedRandomSeverity(weights: Record<string, number>): 'light' | 'moderate' | 'severe' | 'lethal' {
  const rand = Math.random();
  let cumulative = 0;

  for (const [severity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return severity as 'light' | 'moderate' | 'severe' | 'lethal';
    }
  }

  return 'light'; 
}


// --- Function: getWeightedRandomType ---
function getWeightedRandomType(weights: Record<string, number>): 'environmental' | 'magical' | 'mechanical' | 'cursed' {
  const rand = Math.random();
  let cumulative = 0;

  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return type as 'environmental' | 'magical' | 'mechanical' | 'cursed';
    }
  }

  return 'environmental'; 
}


// --- Function: getRandomDescription ---
function getRandomDescription(severity: string, type: string): string {
  try {
    const descriptions = TRAP_DESCRIPTIONS[severity]?.[type] || [];
    if (!descriptions || descriptions.length === 0) {
      return 'A mysterious trap activates!';
    }
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  } catch (error) {
    console.error('[TrapController] Error getting random description:', error);
    return 'A mysterious trap activates!';
  }
}


// --- Function: generateTrapData ---
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
    repeatTrigger: Math.random() < 0.1, 
    cooldown: getCooldownForSeverity(severity)
  };
}


// --- Function: getSeverityDamage ---
function getSeverityDamage(severity: string): number {
  switch (severity) {
    case 'light': return Math.floor(Math.random() * 2) + 1; 
    case 'moderate': return Math.floor(Math.random() * 3) + 2; 
    case 'severe': return Math.floor(Math.random() * 4) + 3; 
    case 'lethal': return Math.floor(Math.random() * 6) + 5; 
    default: return 1;
  }
}


// --- Function: getCooldownForSeverity ---
function getCooldownForSeverity(severity: string): number {
  switch (severity) {
    case 'light': return 5000; 
    case 'moderate': return 10000; 
    case 'severe': return 30000; 
    case 'lethal': return 60000; 
    default: return 5000;
  }
}


// --- Function: isOnCooldown ---
function isOnCooldown(trapId: string): boolean {
  const cooldownEnd = trapCooldowns.get(trapId);
  if (!cooldownEnd) return false;

  if (Date.now() >= cooldownEnd) {
    trapCooldowns.delete(trapId);
    return false;
  }

  return true;
}


// --- Function: checkTrapRequirements ---
function checkTrapRequirements(requirements: NonNullable<TrapData['requirements']>, playerState: PlayerState): boolean {
  try {
    if (requirements.minLevel && (playerState.level || 1) < requirements.minLevel) {
      return false;
    }

    if (requirements.flags && requirements.flags.length > 0) {
      const playerFlags = playerState.flags || {};
      if (!requirements.flags.every(flag => playerFlags[flag])) {
        return false;
      }
    }

    if (requirements.items && requirements.items.length > 0) {
      const playerItems = playerState.inventory || [];
      if (!requirements.items.some(item => playerItems.includes(item))) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[TrapController] Error checking trap requirements:', error);
    return true; 
  }
}


// --- Function: checkAutoDisarm ---
function checkAutoDisarm(trap: TrapData, context: TrapTriggerContext): {
  canDisarm: boolean;
  method: string;
  message: string;
} {
  try {
    const playerTraits = context.playerState.traits || [];

    
    if (trap.autoDisarm) {
      return {
        canDisarm: true,
        method: 'auto',
        message: '🔧 The trap harmlessly disarms itself after triggering.'
      };
    }

    
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

    const playerItems = context.playerState.inventory || [];
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

    
    if (trap.type === 'magical' && playerTraits.includes('mage')) {
      return {
        canDisarm: true,
        method: 'magic',
        message: '✨ Your magical knowledge allows you to dispel the trap\'s enchantment.'
      };
    }

    
    if (Math.random() < 0.05) { 
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


// --- Function: applyTrapEffects ---
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



// --- Function: getAllActiveTraps ---
function getAllActiveTraps(): TrapData[] {
  return Object.values(activeTraps);
}

// --- Function: getTrapStatistics ---
export function getTrapStatistics(): TrapStatistics {
  try {
    const allTraps = getAllActiveTraps();
    
    const trapsByType = allTraps.reduce((acc, trap) => {
      const type = trap.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trapsBySeverity = allTraps.reduce((acc, trap) => {
      const severity = trap.severity || 'light';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trapsByRoom = allTraps.reduce((acc, trap) => {
      const room = trap.roomId || 'unknown';
      acc[room] = (acc[room] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const triggered = allTraps.filter(trap => trap.triggered).length;
    const active = allTraps.filter(trap => !(trap.triggered ?? false) || (trap.repeatTrigger ?? false)).length;
    const disarmed = allTraps.filter(trap => trap.disarmedBy).length;
    
    return {
      total: allTraps.length,
      triggered,
      active,
      disarmed,
      bySeverity: trapsBySeverity,
      byType: trapsByType,
      byRoom: trapsByRoom,
      recentTriggers: []
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



// --- Function: batchTrapOperations ---
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



// --- Function: saveTrapState ---
export function saveTrapState(): boolean {
  try {
    const state = {
      activeTraps,
      trapCooldowns: Object.fromEntries(trapCooldowns)
    };
    localStorage.setItem('gorstan_trap_state', JSON.stringify(state));
    console.log('[TrapController] Trap state saved');
    return true;
  } catch (error) {
    console.error('[TrapController] Error saving trap state:', error);
    return false;
  }
}



// --- Function: loadTrapState ---
export function loadTrapState(): boolean {
  try {
    const savedState = localStorage.getItem('gorstan_trap_state');
    if (!savedState) {
      console.log('[TrapController] No saved trap state found');
      return false;
    }

    const state = JSON.parse(savedState);
    Object.assign(activeTraps, state.activeTraps || {});

    
    if (state.trapCooldowns) {
      Object.entries(state.trapCooldowns).forEach(([key, value]) => {
        trapCooldowns.set(key, value as number);
      });
    }

    const now = Date.now();
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
