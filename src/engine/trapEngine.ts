// src/engine/trapEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles trap logic and room-based dangers.

// The Trap type is defined at the end of this file












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


export interface TrapSeedingConfig {
  count: number;
  probability: number;
  density: number;
  excludeRooms: string[];
  preferredRooms: string[];
  severityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}


export interface TrapEngineStats {
  totalSeeded: number;
  totalTriggered: number;
  totalDisarmed: number;
  damageDealt: number;
  debugModeUsage: number;
  lastSeedTime: number;
}


let seededTraps: Record<string, TrapDefinition> = {};


let debugMode: boolean = false;


const trapStats: TrapEngineStats = {
  totalSeeded: 0,
  totalTriggered: 0,
  totalDisarmed: 0,
  damageDealt: 0,
  debugModeUsage: 0,
  lastSeedTime: 0
};


const trapCache: Map<string, { result: boolean; timestamp: number }> = new Map();
// Variable declaration
const CACHE_DURATION = 30000; 


const DEFAULT_SEED_CONFIG: TrapSeedingConfig = {
  count: 5,
  probability: 0.3,
  density: 0.2,
  excludeRooms: ['intro', 'safe_zone', 'shop', 'inn'],
  preferredRooms: [],
  severityDistribution: { light: 0.5, moderate: 0.3, severe: 0.15, lethal: 0.05 },
  typeDistribution: { generic: 0.6, magical: 0.2, mechanical: 0.15, environmental: 0.05 }
};

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to generate trap description
function generateTrapDescription(severity: string, type: string): string {
  const descriptions = {
    generic: {
      light: "A loose floorboard creaks ominously.",
      moderate: "Sharp spikes jut from the walls.",
      severe: "A deadly pit trap lies hidden here.",
      lethal: "Ancient death magic permeates this space."
    },
    magical: {
      light: "Faint magical energy tingles in the air.",
      moderate: "Arcane symbols glow with dangerous power.",
      severe: "A powerful curse guards this area.",
      lethal: "Reality itself seems unstable here."
    },
    mechanical: {
      light: "You hear the faint click of a mechanism.",
      moderate: "Gears whir threateningly in the walls.",
      severe: "Complex machinery hums with deadly intent.",
      lethal: "An intricate doomsday device awaits."
    },
    environmental: {
      light: "The ground feels unstable beneath your feet.",
      moderate: "Toxic vapors seep from the walls.",
      severe: "The very air seems hostile to life.",
      lethal: "This place defies the laws of nature."
    }
  };
  
  return descriptions[type as keyof typeof descriptions]?.[severity as keyof typeof descriptions.generic] 
    || "A mysterious trap lurks here.";
}

// Helper function to get damage based on severity
function getSeverityDamage(severity: string): number {
  const damageMap: Record<string, number> = {
    light: 1,
    moderate: 3,
    severe: 5,
    lethal: 10
  };
  return damageMap[severity] || 1;
}

// Helper function to get cooldown based on severity
function getSeverityCooldown(severity: string): number {
  const cooldownMap: Record<string, number> = {
    light: 5000,
    moderate: 10000,
    severe: 15000,
    lethal: 30000
  };
  return cooldownMap[severity] || 5000;
}



// --- Function: seedTraps ---
export function seedTraps(
  roomIds: string[] = [],
  config?: Partial<TrapSeedingConfig>
): void {
  try {
    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      console.warn("[TrapEngine] Warning: No valid room IDs provided for seeding traps.");
      return;
    }

    // Clear previous traps and cache
    seededTraps = {};
    trapCache.clear();

    // Merge config with defaults
    const seedConfig = { ...DEFAULT_SEED_CONFIG, ...config };
    
    // Filter valid rooms
    const validRooms = roomIds.filter(id => 
      !seedConfig.excludeRooms.includes(id) && typeof id === 'string' && id.length > 0
    );

    if (validRooms.length === 0) {
      console.warn("[TrapEngine] No valid rooms available for trap seeding after exclusions.");
      return;
    }

    // Separate preferred and other rooms
    const preferredRooms = validRooms.filter(id => seedConfig.preferredRooms.includes(id));
    const otherRooms = validRooms.filter(id => !seedConfig.preferredRooms.includes(id));
    
    // Shuffle arrays for randomness
    const shuffledPreferred = shuffleArray([...preferredRooms]);
    const shuffledOther = shuffleArray([...otherRooms]);
    
    // Calculate number of traps to place
    const maxTraps = Math.floor(validRooms.length * seedConfig.density);
    const preferredTraps = Math.min(Math.floor(maxTraps * 0.4), shuffledPreferred.length);
    const remainingTraps = Math.min(maxTraps - preferredTraps, shuffledOther.length);

    let trapsSeeded = 0;

    // Seed preferred rooms first
    for (let i = 0; i < preferredTraps && i < shuffledPreferred.length; i++) {
      const roomId = shuffledPreferred[i];
      const trapDef = generateTrapDefinition(roomId, seedConfig);
      if (Math.random() < seedConfig.probability) {
        seededTraps[roomId] = trapDef;
        trapsSeeded++;
      }
    }

    // Seed remaining rooms
    for (let i = 0; i < remainingTraps && i < shuffledOther.length; i++) {
      const roomId = shuffledOther[i];
      const trapDef = generateTrapDefinition(roomId, seedConfig);
      if (Math.random() < seedConfig.probability) {
        seededTraps[roomId] = trapDef;
        trapsSeeded++;
      }
    }

    
    trapStats.totalSeeded += trapsSeeded;
    trapStats.lastSeedTime = Date.now();

    if (debugMode) {
      console.info(`🧨 Traps seeded: ${trapsSeeded} in rooms:`, Object.keys(seededTraps));
    }
  } catch (error) {
    console.error("[TrapEngine] Error during trap seeding:", error);
  }
}



// --- Function: generateTrapDefinition ---
function generateTrapDefinition(roomId: string, config: TrapSeedingConfig): TrapDefinition {
  try {
    // Select random severity based on distribution
    const severityRand = Math.random();
    let severityCumulative = 0;
    let severity = 'light';
    for (const [sev, prob] of Object.entries(config.severityDistribution)) {
      severityCumulative += prob;
      if (severityRand <= severityCumulative) {
        severity = sev;
        break;
      }
    }

    // Select random type based on distribution
    const typeRand = Math.random();
    let typeCumulative = 0;
    let type = 'generic';
    for (const [tp, prob] of Object.entries(config.typeDistribution)) {
      typeCumulative += prob;
      if (typeRand <= typeCumulative) {
        type = tp;
        break;
      }
    }

    return {
      id: `trap_${roomId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      triggered: false,
      description: generateTrapDescription(severity, type),
      damage: getSeverityDamage(severity),
      type,
      severity: severity as 'light' | 'moderate' | 'severe' | 'lethal',
      autoDisarm: severity === 'light' && Math.random() < 0.3, 
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



// --- Function: isRoomTrapped ---
export function isRoomTrapped(roomId: string): boolean {
  try {
    if (!roomId || typeof roomId !== 'string') {
      return false;
    }

    // Check cache first
    const cached = trapCache.get(roomId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }

    // Check if room has an active trap
    const isTrapped = seededTraps[roomId] && !seededTraps[roomId].triggered;
    
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



// --- Function: handleRoomTrap ---
export function handleRoomTrap(
  roomId: string,
  playerState: PlayerState
): TrapResult | null {
  try {
    // Get the trap for this room
    const trap = seededTraps[roomId];
    if (!trap || trap.triggered) {
      return null; 
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

    
    if (!playerState || typeof playerState !== 'object') {
      console.warn("[TrapEngine] Invalid player state provided");
      return null;
    }

    // Extract player traits for trap resistance checks
    const playerTraits = playerState.traits || [];
    const playerItems = playerState.items || playerState.inventory || [];

    // Attempt automatic disarmament based on player skills
    const disarmResult = checkDisarmAbility(trap, playerState, playerItems, playerTraits);

    if (disarmResult.canDisarm) {
      
      trap.triggered = true;
      trapStats.totalDisarmed++;

      
      trapCache.delete(roomId);

      return {
        message: disarmResult.message,
        disarmed: true,
        trapType: trap.type,
        severity: trap.severity,
        success: true
      };
    }

    
    trap.triggered = true;
    trapStats.totalTriggered++;

    
    let damage = trap.damage || 0;

    
    if (playerState.difficulty === 'easy') {
      damage = Math.ceil(damage * 0.5);
    } else if (playerState.difficulty === 'hard') {
      damage = Math.ceil(damage * 1.5);
    }

    
    if (playerTraits.includes('resistant') || playerTraits.includes('trap_resistant')) {
      damage = Math.ceil(damage * 0.7);
    }

    if (playerTraits.includes('fragile')) {
      damage = Math.ceil(damage * 1.3);
    }

    
    if (typeof playerState.level === 'number' && playerState.level > 1) {
      damage = Math.max(1, damage - Math.floor(playerState.level / 3));
    }

    trapStats.damageDealt += damage;

    
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



// --- Function: checkDisarmAbility ---
function checkDisarmAbility(
  trap: TrapDefinition,
  playerState: PlayerState,
  playerItems: string[],
  playerTraits: string[]
): { canDisarm: boolean; message: string; method: string } {
  try {
    
    if (trap.autoDisarm) {
      return {
        canDisarm: true,
        message: `🔧 The ${trap.severity} trap harmlessly disarms itself after triggering.`,
        method: 'auto'
      };
    }

    
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

    
    if (trap.type === 'magical' && (playerTraits.includes('mage') || playerTraits.includes('wizard'))) {
      return {
        canDisarm: true,
        message: `✨ Your magical knowledge allows you to dispel the trap's enchantment.`,
        method: 'magic'
      };
    }

    
    if (typeof playerState.level === 'number' && playerState.level >= 5) {
      const disarmChance = Math.min(0.7, playerState.level * 0.1); // Max 70% chance, scales with level
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



// --- Function: handleTrapEscape ---
export function handleTrapEscape(roomId: string, playerState?: PlayerState): boolean {
  try {
    // Get the trap for this room
    const trap = seededTraps[roomId];
    if (!trap || trap.triggered) {
      return false;
    }

    
    let escapeChance = 0.6; 

    if (playerState) {
      // Extract player traits
      const playerTraits = playerState.traits || [];

      if (playerTraits.includes('agile') || playerTraits.includes('quick')) {
        escapeChance += 0.2;
      }

      if (playerTraits.includes('clumsy')) {
        escapeChance -= 0.2;
      }

      
      if (typeof playerState.level === 'number') {
        escapeChance += playerState.level * 0.02;
      }
    }

    escapeChance = Math.max(0.1, Math.min(0.9, escapeChance));

    if (Math.random() < escapeChance) {
      delete seededTraps[roomId]; 
      trapCache.delete(roomId);

      if (debugMode) {
        console.info(`🚪 Trap in ${roomId} disarmed via quick escape.`);
      }

      return true;
    }

    
    if (debugMode) {
      console.info(`❌ Failed to escape trap in ${roomId}.`);
    }

    return false;
  } catch (error) {
    console.error("[TrapEngine] Error handling trap escape:", error);
    return false;
  }
}



// --- Function: listActiveTraps ---
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



// --- Function: enableDebugMode ---
export function enableDebugMode(): void {
  debugMode = true;
  console.info('🔧 Trap debug mode enabled - traps will not cause damage');
}


// --- Function: disableDebugMode ---
export function disableDebugMode(): void {
  debugMode = false;
  console.info('⚔️ Trap debug mode disabled - traps will cause damage');
}


// --- Function: getDebugMode ---
export function getDebugMode(): boolean {
  return debugMode;
}


// --- Function: toggleDebugMode ---
export function toggleDebugMode(): boolean {
  debugMode = !debugMode;
  console.info(`🔧 Trap debug mode ${debugMode ? 'enabled' : 'disabled'}`);
  return debugMode;
}



// --- Function: maybeTriggerInquisitionTrap ---
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

    if (Math.random() < 0.01) { 
      appendMessage(`⚠️ The air thickens. Robed figures burst in!`);
      appendMessage(`🟥 "NO ONE EXPECTS THE SPANISH INQUISITION!"`);
      appendMessage(`They interrogate you about improper codex dusting.`);

      // Check if player's last command mentioned expecting or inquisition
      const commandText = playerState.command || '';
      if (commandText.includes("expect") || commandText.includes("inquisition")) {
        appendMessage(`😲 They're baffled by your cleverness and award you a certificate.`);
        if (typeof playerState.score === 'number') {
          playerState.score += 5;
        }

        
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


// --- Function: maybeTriggerBugblatterTrap ---
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

    if (Math.random() < 0.0142) { 
      appendMessage(`🌌 You feel a strange presence. Something *very stupid* is watching you.`);
      appendMessage(`💥 A voice booms: "Beware the Ravenous Bugblatter Beast of Traal!"`);

      // Check if player has a towel in inventory
      const playerInventory = playerState.inventory || playerState.items || [];
      const hasTowel = playerInventory.some(item => 
        item && typeof item === 'string' && item.toLowerCase().includes('towel')
      );

      if (hasTowel) {
        appendMessage(`🧼 You wrap your towel around your head. The beast assumes you can't see it... and wanders off confused.`);
        appendMessage(`🧠 As Douglas Adams rightly pointed out, towels are invaluable for travel.`);

        
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



// --- Function: handleTrapResult ---
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
      const severityIcon = getSeverityIcon(trap.severity);
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



// --- Function: clearAllTraps ---
export function clearAllTraps(): void {
  try {
    const trapCount = Object.keys(seededTraps).length;
    seededTraps = {};
    trapCache.clear();

    if (debugMode) {
      console.info(`🧹 All ${trapCount} traps cleared`);
    }
  } catch (error) {
    console.error("[TrapEngine] Error clearing all traps:", error);
  }
}



// --- Function: getTrapCount ---
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



// --- Function: getTrapStatistics ---
export function getTrapStatistics(): TrapEngineStats & {
  activeTrapsByType: Record<string, number>;
  activeTrapsBySeverity: Record<string, number>;
} {
  try {
    const activeTraps = Object.values(seededTraps).filter(trap => !trap.triggered);
    
    const activeTrapsByType = activeTraps.reduce((acc, trap) => {
      const type = trap.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeTrapsBySeverity = activeTraps.reduce((acc, trap) => {
      const severity = trap.severity || 'low';
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



// --- Function: resetTrapStatistics ---
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



// --- Function: getTrapInfo ---
export function getTrapInfo(roomId: string): TrapDefinition | null {
  try {
    return seededTraps[roomId] || null;
  } catch (error) {
    console.error("[TrapEngine] Error getting trap info:", error);
    return null;
  }
}




// --- Function: getWeightedRandom ---
function getWeightedRandom(weights: Record<string, number>): string {
  try {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
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


// --- Function: getSeverityIcon ---
function getSeverityIcon(severity?: string): string {
  switch (severity) {
    case 'light': return '⚠️';
    case 'moderate': return '⚡';
    case 'severe': return '💥';
    case 'lethal': return '☠️';
    default: return '⚠️';
  }
}



// --- Function: getSeededTraps ---
export function getSeededTraps(): Record<string, TrapDefinition> {
  try {
    return { ...seededTraps };
  } catch (error) {
    console.error("[TrapEngine] Error getting seeded traps:", error);
    return {};
  }
}



// --- Function: clearTrapCache ---
export function clearTrapCache(): void {
  try {
    trapCache.clear();
    console.info("[TrapEngine] Trap cache cleared");
  } catch (error) {
    console.error("[TrapEngine] Error clearing trap cache:", error);
  }
}


export type Trap = TrapDefinition;
