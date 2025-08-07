// src/engine/deathEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Manages death events, reset logic, and resurrection mechanics.

import { playSound } from '../utils/soundUtils';
import { unlockAchievement } from '../logic/achievementEngine';

// --- Type Definitions ---
export interface PlayerState {
  flags: Record<string, unknown>;
  traits?: string[];
  inventory?: string[];
  health?: number;
  currentRoom?: string;
  resetCount?: number;
  deathCount?: number;
  name?: string;
  score?: number;
  visitedRooms?: string[];
}

export interface DeathResult {
  nextRoomId: string;
  messages: string[];
  flags: Record<string, unknown>;
  deathStats?: DeathStatistics;
  specialEffects?: DeathEffect[];
  scoreAdjustment?: number;
  inventoryChanges?: {
    remove?: string[];
    add?: string[];
  };
}

export interface DeathStatistics {
  totalDeaths: number;
  deathsByCause: Record<string, number>;
  consecutiveDeaths: number;
  lastDeathLocation: string;
  lastDeathCause: string;
  timeOfDeath: number;
  lastDeathScore?: number;
}

export interface DeathEffect {
  type: 'trait_gained' | 'trait_lost' | 'item_lost' | 'memory_retained' | 'special_unlock' | 'score_penalty';
  description: string;
  value?: string | number;
}

export type DeathCause =
  | 'trap'
  | 'glitch'
  | 'npc'
  | 'environmental'
  | 'puzzle_failure'
  | 'paradox'
  | 'coin'
  | 'greed'
  | 'dominic_revenge'
  | 'polly_stalker'
  | 'wendell_encounter'
  | 'temporal_paradox'
  | 'Killed by Coin'
  | 'Killed by Greed'
  | 'Killed by Dominic'
  | 'Z-Spec Puzzle Failure'
  | 'unknown';

// --- Death Messages by Cause ---
const DEATH_MESSAGES: Record<DeathCause, string[]> = {
  trap: [
    'The ancient mechanism springs with deadly precision.',
    'You failed to notice the danger until it was too late.',
    'Sometimes the old ways of protection still work perfectly.',
    'The trap was more sophisticated than you anticipated.',
    'Your reflexes weren\'t quite fast enough.'
  ],
  glitch: [
    'Reality fragments around you like broken glass.',
    'The multiverse hiccups, and you pay the ultimate price.',
    'Something fundamental went wrong with the fabric of existence.',
    'The simulation encounters a fatal error.',
    'Your consciousness becomes corrupted data.'
  ],
  npc: [
    'Your opponent proves far more formidable than expected.',
    'Diplomatic relations have deteriorated beyond repair.',
    'Violence was not the answer, but it was their answer.',
    'Sometimes talking isn\'t enough.',
    'They had different plans for this conversation.'
  ],
  environmental: [
    'The environment proves unexpectedly hostile.',
    'Nature is beautifully indifferent to your survival.',
    'The elements claim another unfortunate traveler.',
    'The laws of physics apply equally to everyone.',
    'Your survival instincts needed more practice.'
  ],
  puzzle_failure: [
    'Your solution was... creative, but fatal.',
    'Sometimes the wrong answer has permanent consequences.',
    'The puzzle rejects your approach in the most definitive way.',
    'Logic puzzles can be surprisingly dangerous.',
    'Your reasoning was flawed in a critical way.'
  ],
  paradox: [
    'Temporal paradox detected. Reality unravels.',
    'You tried to use something that shouldn\'t exist.',
    'The universe abhors paradoxes, and you with them.',
    'Causality has some very strict rules.',
    'Time travel is more dangerous than it appears.'
  ],
  coin: [
    'The cursed coin exacts its terrible price.',
    'You should have known better than to keep it.',
    'Some treasures are too expensive to own.',
    'The coin flips you, as promised.',
    'Greed has its own form of justice.'
  ],
  greed: [
    'Your avarice proves to be your downfall.',
    'Not all treasure is meant to be taken.',
    'The bait was too tempting to resist.',
    'Some prices are paid in more than gold.',
    'Your hands reached further than your wisdom.'
  ],
  dominic_revenge: [
    'Dominic\'s patience has finally run out.',
    'You pushed the wrong buttons too many times.',
    'Some people don\'t forgive, and don\'t forget.',
    'Your past actions catch up with you.',
    'Revenge is a dish best served with finality.'
  ],
  polly_stalker: [
    'Polly\'s obsession reaches its inevitable conclusion.',
    'You couldn\'t escape her twisted affection.',
    'Love can be the most dangerous emotion of all.',
    'Some admirers refuse to take no for an answer.',
    'Her devotion proves fatal.'
  ],
  wendell_encounter: [
    'Mr. Wendell\'s experiments require a test subject.',
    'You become part of his research, permanently.',
    'Science demands sacrifices, and you\'re today\'s offering.',
    'His curiosity about human limits is finally satisfied.',
    'The price of knowledge is sometimes everything.'
  ],
  unknown: [
    'Death comes without warning or explanation.',
    'The cause remains frustratingly mysterious.',
    'Sometimes the multiverse just shrugs.',
    'Your story ends with an ellipsis...',
    'Something went wrong. The nature of that something is unclear.'
  ],
  temporal_paradox: [
    'Time folds in on itself, taking you with it.',
    'Temporal mechanics are unforgiving.',
    'You created a paradox that reality cannot resolve.',
    'The timeline rejects your existence.',
    'Cause and effect become meaningless.'
  ],
  'Killed by Coin': [
    'The cursed coin claims another victim.',
    'You should have left it where you found it.',
    'Greed and curiosity prove a fatal combination.',
    'The coin\'s curse activates with deadly precision.'
  ],
  'Killed by Greed': [
    'Your avarice becomes your undoing.',
    'Some treasures exact a terrible price.',
    'Greed blinds you to obvious danger.',
    'The lure of wealth proves irresistible and fatal.'
  ],
  'Killed by Dominic': [
    'Dominic\'s anger knows no bounds.',
    'You pushed him too far, too often.',
    'His patience finally snaps completely.',
    'Some relationships cannot be repaired.'
  ],
  'Z-Spec Puzzle Failure': [
    'The Z-Spec puzzle rejects your solution violently.',
    'Complex puzzles have complex failure modes.',
    'Your logic was fatally flawed.',
    'The puzzle was more dangerous than it appeared.'
  ]
};

// --- Awakening Messages (for resurrection) ---
const AWAKENING_MESSAGES = [
  'You awaken with the taste of copper and regret.',
  'Consciousness returns like an unwelcome visitor.',
  'Your eyes open to a world that feels slightly wrong.',
  'You remember dying, but here you are anyway.',
  'Death, it seems, was merely a temporary inconvenience.',
  'The multiverse has rules about permanent endings.',
  'You find yourself alive again, much to your surprise.',
  'Reality hiccups, and you slip back into existence.',
  'Your narrative thread refuses to be cut.',
  'Death is negotiable in certain jurisdictions.'
];

// --- Special Death Context Messages ---
const DEATH_CONTEXT_MESSAGES: Record<string, string[]> = {
  firstDeath: [
    'This is your first death. It won\'t be your last.',
    'Welcome to the club. Population: everyone who\'s tried this.',
    'Death is a learning experience. Take notes.'
  ],
  multipleDeath: [
    'You\'re getting good at this dying business.',
    'Practice makes perfect, even with dying.',
    'At least you\'re consistent.'
  ],
  sameCause: [
    'Perhaps try a different approach next time.',
    'Repeating the same mistake is a choice.',
    'Some lessons require multiple iterations.'
  ]
};

// --- Core Functions ---

/**
 * Main death handling function
 */
export function handlePlayerDeath(
  playerState: PlayerState,
  cause: DeathCause = 'unknown',
  location?: string,
  context?: Record<string, any>
): DeathResult {
  try {
    console.log(`[DeathEngine] Processing death: ${cause} at ${location || playerState.currentRoom}`);
    
    // Calculate death statistics
    const currentDeathCount = (playerState.deathCount || 0) + 1;
    const deathsByCause = { ...(playerState.flags?.deathsByCause as Record<string, number> || {}) };
    deathsByCause[cause] = (deathsByCause[cause] || 0) + 1;
    
    const deathStats: DeathStatistics = {
      totalDeaths: currentDeathCount,
      deathsByCause,
      consecutiveDeaths: 1, // This would be calculated from a sequence
      lastDeathLocation: location || playerState.currentRoom || 'unknown',
      lastDeathCause: cause,
      timeOfDeath: Date.now(),
      lastDeathScore: playerState.score || 0
    };

    // Generate death messages
    const messages = generateDeathMessages(cause, deathStats, playerState, context);
    
    // Calculate special effects
    const specialEffects = calculateDeathEffects(cause, deathStats, playerState);
    
    // Determine respawn location
    const nextRoomId = determineRespawnLocation(cause, playerState, context);
    
    // Update flags
    const updatedFlags = {
      ...playerState.flags,
      isDead: false, // They're being resurrected
      hasBeenDead: true,
      deathCount: currentDeathCount,
      deathsByCause,
      lastDeathCause: cause,
      lastDeathLocation: location || playerState.currentRoom,
      [`death_${cause}_count`]: (playerState.flags?.[`death_${cause}_count`] as number || 0) + 1
    };

    // Calculate score adjustments
    const scoreAdjustment = calculateScoreAdjustment(cause, deathStats, specialEffects);

    // Inventory changes
    const inventoryChanges = calculateInventoryChanges(cause, deathStats, playerState);

    // Trigger achievements
    triggerDeathAchievements(cause, deathStats, playerState);

    // Play death sound
    playDeathSound(cause);

    return {
      nextRoomId,
      messages,
      flags: updatedFlags,
      deathStats,
      specialEffects,
      scoreAdjustment,
      inventoryChanges
    };

  } catch (error) {
    console.error('[DeathEngine] Error handling player death:', error);
    return getFailsafeDeathResult(playerState, cause);
  }
}

/**
 * Simplified death trigger function for direct use
 */
export function triggerDeath(cause: DeathCause, playerState?: PlayerState, location?: string): void {
  console.log(`[DeathEngine] Death triggered: ${cause}`);
  
  // If no player state provided, create minimal state
  const state = playerState || {
    flags: {},
    currentRoom: 'controlnexus',
    deathCount: 0
  };

  // Process the death
  const result = handlePlayerDeath(state, cause, location);
  
  // The actual state update would be handled by the game's state management system
  // This function primarily serves as a trigger point for other systems
  
  // Log for debugging
  console.log('[DeathEngine] Death processed:', result);
}

// --- Helper Functions ---

function generateDeathMessages(
  cause: DeathCause, 
  deathStats: DeathStatistics, 
  playerState: PlayerState,
  context?: Record<string, any>
): string[] {
  const messages: string[] = [];
  
  // Primary death message
  const deathMessages = DEATH_MESSAGES[cause] || DEATH_MESSAGES.unknown;
  const messageIndex = Math.floor(Math.random() * deathMessages.length);
  messages.push(deathMessages[messageIndex]);

  // Add context if this isn't their first death of this type
  if (deathStats.deathsByCause[cause] > 1) {
    const contextMessages = DEATH_CONTEXT_MESSAGES.sameCause;
    const contextIndex = Math.floor(Math.random() * contextMessages.length);
    messages.push(contextMessages[contextIndex]);
  }

  // Add awakening message
  const awakeningIndex = Math.floor(Math.random() * AWAKENING_MESSAGES.length);
  messages.push(AWAKENING_MESSAGES[awakeningIndex]);

  // Add death count message
  messages.push(`This is your ${getOrdinalNumber(deathStats.totalDeaths)} death.`);

  // Add special effects descriptions
  const effects = calculateDeathEffects(cause, deathStats, playerState);
  effects.forEach(effect => {
    if (effect.description) {
      messages.push(effect.description);
    }
  });

  // Warn about repeated deaths from same cause
  if (deathStats.deathsByCause[cause] >= 3) {
    messages.push(`You seem particularly susceptible to ${cause}. Perhaps try a different approach?`);
  }

  return messages;
}

function calculateDeathEffects(
  cause: DeathCause, 
  deathStats: DeathStatistics, 
  playerState: PlayerState
): DeathEffect[] {
  const effects: DeathEffect[] = [];

  // Standard score penalty
  effects.push({
    type: 'score_penalty',
    description: 'Your score has been reduced as a consequence of death.',
    value: -50
  });

  // Special effects based on death cause
  switch (cause) {
    case 'coin':
      effects.push({
        type: 'trait_gained',
        description: 'You gain the trait "Cursed by Greed".',
        value: 'cursed_by_greed'
      });
      break;
      
    case 'paradox':
      effects.push({
        type: 'memory_retained',
        description: 'Fragments of temporal knowledge linger in your mind.',
        value: 'temporal_awareness'
      });
      break;
      
    case 'glitch':
      effects.push({
        type: 'special_unlock',
        description: 'Your brush with digital death grants insight into the simulation.',
        value: 'glitch_sensitivity'
      });
      break;
      
    case 'trap':
      if (deathStats.deathsByCause.trap >= 3) {
        effects.push({
          type: 'trait_gained',
          description: 'Multiple trap deaths have made you more cautious.',
          value: 'trap_wise'
        });
      }
      break;
  }

  // Effects based on total death count
  if (deathStats.totalDeaths >= 5) {
    effects.push({
      type: 'trait_gained',
      description: 'Death has become familiar to you.',
      value: 'death_experienced'
    });
  }

  if (deathStats.totalDeaths >= 10) {
    effects.push({
      type: 'special_unlock',
      description: 'The veil between life and death grows thin for you.',
      value: 'death_master'
    });
  }

  return effects;
}

function determineRespawnLocation(
  cause: DeathCause, 
  playerState: PlayerState, 
  context?: Record<string, any>
): string {
  // Special respawn locations based on death cause
  switch (cause) {
    case 'paradox':
      return 'introreset'; // Temporal deaths reset to beginning
    case 'glitch':
      return 'glitchrealmhub'; // Glitch deaths go to glitch realm
    case 'dominic_revenge':
      return 'controlroom'; // Dominic deaths go to control room
    case 'wendell_encounter':
      return 'hiddenlab'; // Wendell deaths go to hidden lab
    default:
      // Standard respawn logic
      if (playerState.currentRoom?.includes('intro')) {
        return 'controlnexus';
      }
      if (playerState.currentRoom?.includes('final')) {
        return 'controlroom';
      }
      return playerState.currentRoom || 'controlnexus';
  }
}

function calculateScoreAdjustment(
  cause: DeathCause, 
  deathStats: DeathStatistics, 
  effects: DeathEffect[]
): number {
  let adjustment = -50; // Base death penalty

  // Additional penalties for certain causes
  switch (cause) {
    case 'greed':
    case 'coin':
      adjustment -= 25; // Extra penalty for greed
      break;
    case 'puzzle_failure':
      adjustment -= 10; // Smaller penalty for puzzle failures
      break;
  }

  // Reduced penalty for repeated deaths (they're learning)
  if (deathStats.totalDeaths > 3) {
    adjustment = Math.floor(adjustment * 0.8);
  }

  // Add effect-based adjustments
  effects.forEach(effect => {
    if (effect.type === 'score_penalty' && typeof effect.value === 'number') {
      adjustment += effect.value;
    }
  });

  return adjustment;
}

function calculateInventoryChanges(
  cause: DeathCause, 
  deathStats: DeathStatistics, 
  playerState: PlayerState
): { remove?: string[]; add?: string[] } {
  const changes: { remove?: string[]; add?: string[] } = {};

  // Some deaths cause item loss
  switch (cause) {
    case 'coin':
      changes.remove = ['cursed_coin'];
      break;
    case 'greed':
      // Lose any 'treasure' items
      if (playerState.inventory) {
        changes.remove = playerState.inventory.filter(item => 
          item.includes('treasure') || item.includes('gold') || item.includes('gem')
        );
      }
      break;
    case 'glitch':
      // Digital items might get corrupted
      changes.add = ['corrupted_data'];
      break;
  }

  return changes;
}

function triggerDeathAchievements(
  cause: DeathCause, 
  deathStats: DeathStatistics, 
  playerState: PlayerState
): void {
  // Achievement for first death
  if (deathStats.totalDeaths === 1) {
    unlockAchievement('first_death');
  }

  // Achievements for specific death counts
  if (deathStats.totalDeaths === 5) {
    unlockAchievement('death_veteran');
  }
  
  if (deathStats.totalDeaths >= 10) {
    unlockAchievement('death_master');
  }

  // Achievements for specific death causes
  switch (cause) {
    case 'coin':
      unlockAchievement('coinDeath');
      break;
    case 'greed':
      unlockAchievement('greedDeath');
      break;
    case 'paradox':
      unlockAchievement('paradox_victim');
      break;
    case 'glitch':
      unlockAchievement('digital_death');
      break;
  }

  // Achievement for dying to all causes
  const uniqueDeathCauses = Object.keys(deathStats.deathsByCause).length;
  if (uniqueDeathCauses >= 5) {
    unlockAchievement('death_collector');
  }
}

function playDeathSound(cause: DeathCause): void {
  switch (cause) {
    case 'paradox':
      playSound('paradox_rip');
      break;
    case 'glitch':
      playSound('digital_death');
      break;
    case 'trap':
      playSound('trap_spring');
      break;
    case 'coin':
      playSound('coin_curse');
      break;
    default:
      playSound('death_general');
      break;
  }
}

function getFailsafeDeathResult(playerState: PlayerState, cause: DeathCause): DeathResult {
  return {
    nextRoomId: 'controlnexus',
    messages: [
      'Something went wrong during death processing.',
      'The multiverse experiences a brief glitch.',
      'You find yourself back at the beginning, confused but alive.'
    ],
    flags: { 
      ...playerState.flags, 
      isDead: false,
      hasBeenDead: true,
      deathCount: (playerState.deathCount || 0) + 1,
      lastDeathCause: cause 
    },
    deathStats: {
      totalDeaths: (playerState.deathCount || 0) + 1,
      deathsByCause: { [cause]: 1 },
      consecutiveDeaths: 1,
      lastDeathLocation: 'unknown',
      lastDeathCause: cause,
      timeOfDeath: Date.now()
    },
    specialEffects: [],
    scoreAdjustment: -25,
    inventoryChanges: {}
  };
}

function getOrdinalNumber(num: number): string {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return num + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
}

// --- Legacy Support Functions ---

/**
 * Legacy function for older code that expects simpler death handling
 */
export function simpleDeath(cause: string): void {
  triggerDeath(cause as DeathCause);
}

/**
 * Check if player has died from a specific cause
 */
export function hasPlayerDiedFrom(cause: DeathCause, playerState: PlayerState): boolean {
  const deathsByCause = playerState.flags?.deathsByCause as Record<string, number> || {};
  return (deathsByCause[cause] || 0) > 0;
}

/**
 * Get total death count for player
 */
export function getPlayerDeathCount(playerState: PlayerState): number {
  return playerState.deathCount || 0;
}

export default {
  handlePlayerDeath,
  triggerDeath,
  simpleDeath,
  hasPlayerDiedFrom,
  getPlayerDeathCount
};
