// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: deathEngine.ts
// Path: src/engine/deathEngine.ts
//
// deathEngine utility for Gorstan game.
// Handles fatal trap resolution and soft resets, returning the next room and updated flags.

/**
 * Type definitions for death engine
 */

// Deprecated: replaced by shared PlayerState
// export interface PlayerState {
  flags: Record<string, unknown>;
  traits?: string[];
  inventory?: string[];
  health?: number;
  currentRoom?: string;
  resetCount?: number;
  deathCount?: number;
  name?: string;
}

/**
 * Outcome of a fatal player event.
 * Includes next room, messages, stats, flags, and optional special effects.
 */
export interface DeathResult {
  nextRoomId: string;
  messages: string[];
  flags: Record<string, unknown>;
  deathStats?: DeathStatistics;
  specialEffects?: DeathEffect[];
}

/**
 * Tracks death-related statistics across sessions and causes.
 */
export interface DeathStatistics {
  totalDeaths: number;
  deathsByCause: Record<string, number>;
  consecutiveDeaths: number;
  lastDeathLocation: string;
  lastDeathCause: string;
  timeOfDeath: number;
}

/**
 * Effects triggered by death — loss of traits, memory retention, special unlocks, etc.
 */
export interface DeathEffect {
  type: 'trait_gained' | 'trait_lost' | 'item_lost' | 'memory_retained' | 'special_unlock';
  description: string;
  value?: string | number;
}

/**
 * Literal string union of all supported death types.
 * Used for statistics, messaging, and triggered logic.
 */
export type DeathCause = 
  | 'trap' 
  | 'glitch' 
  | 'npc' 
  | 'environmental' 
  | 'puzzle_failure' 
  | 'combat' 
  | 'starvation' 
  | 'madness' 
  | 'temporal_paradox' 
  | 'maze_lost' 
  | 'mirror_trap' 
  | 'fae_curse' 
  | 'unknown';

/**
 * Enhanced death messages with more variety and context
 */
/**
 * Contextual death messages based on the cause of death.
 */
const deathMessages: Record<DeathCause, string[]> = {
  trap: [
    'Your foot slips — and the room fills with gas.',
    'The floor gives way beneath you. The darkness is absolute.',
    'Ancient mechanisms whir to life. You have seconds to regret your carelessness.',
    'The walls close in with mechanical precision. Your last thought is admiration for the craftsmanship.'
  ],
  
  glitch: [
    'Reality folds in on itself. You vanish with a scream.',
    'The world pixelates around you. Error 404: Player not found.',
    'Time stutters. You exist in seventeen different moments simultaneously, then none.',
    'The universe hiccups. When it recovers, you are no longer part of the equation.'
  ],
  
  npc: [
    "They warned you. You didn't listen. That was your last mistake.",
    'Their patience finally runs out. Some conversations end more permanently than others.',
    'You pushed too far. The look in their eyes is the last thing you see.',
    '"Nothing personal," they say, as everything becomes very personal indeed.'
  ],
  
  environmental: [
    'The environment claims another victim. Nature is indifferent to your ambitions.',
    'Toxic fumes rise from the depths. Your lungs burn as consciousness fades.',
    'The cold seeps into your bones. Winter has claimed another soul.',
    'Radiation levels spike beyond survivable limits. The Geiger counter screams briefly, then falls silent.'
  ],
  
  puzzle_failure: [
    'The puzzle rejects your solution violently. Intelligence is not always rewarded.',
    'Wrong answer. The consequences are immediate and fatal.',
    'The riddle turns lethal. Your final thought: "I should have studied harder."',
    'Failure has a price here. You pay it in full.'
  ],
  
  combat: [
    'Your opponent proves superior. Honor in defeat is small comfort.',
    'The battle ends poorly for you. Victory was never guaranteed.',
    'Steel meets flesh. The outcome was never in doubt.',
    'Combat is unforgiving. You learn this lesson too late.'
  ],
  
  starvation: [
    'Hunger finally claims you. The multiverse feeds on many things.',
    'Your body fails from lack of sustenance. Planning was never your strength.',
    'Starvation is a slow death, but no less final.',
    'The last ration is consumed. Hope follows shortly after.'
  ],
  
  madness: [
    'Your mind fractures beyond repair. Some truths are too large for mortal comprehension.',
    'Sanity was always optional here. You chose unwisely.',
    'The whispers finally make sense. That was your mistake.',
    'Madness takes you gently, like an old friend. Reality was overrated anyway.'
  ],
  
  temporal_paradox: [
    'You meet yourself coming the other way. The universe cannot tolerate this.',
    'Causality loops collapse. You are both the cause and effect of your own demise.',
    'Time travel has rules. You broke them. Time breaks you in return.',
    'Past and future collide in your present. Physics weeps.'
  ],
  
  maze_lost: [
    'The maze claims another wanderer. Your bones will mark this path for others.',
    'Lost beyond hope of rescue, you become part of the labyrinth.',
    'The walls whisper your name as you fade. You are home now.',
    'Every maze needs its ghosts. Welcome to the collection.'
  ],
  
  mirror_trap: [
    'The mirror reflects your death before it happens. Prophecy fulfilled.',
    'Your reflection steps out as you step in. Only one of you can exist.',
    'The glass spider-webs around your touch. Seven years of very bad luck.',
    'Mirrors lie, but this one tells a fatal truth.'
  ],
  
  fae_curse: [
    'Fae magic exacts its price. You should have read the fine print.',
    'The curse activates with poetic justice. The fae appreciate irony.',
    'Ancient words carry ancient weight. Your tongue was too careless.',
    'Magic has rules. Breaking them breaks you.'
  ],
  
  unknown: [
    'You feel a sudden chill... then nothing.',
    'The cause remains mysterious. Death rarely explains itself.',
    'Something went wrong. The nature of that something is unclear.',
    'Your end comes without warning or explanation. Such is the multiverse.'
  ]
};

/**
 * Enhanced handlePlayerDeath function with comprehensive death handling
 */
export function handlePlayerDeath(
  playerState: PlayerState,
  cause: DeathCause = 'unknown',
  location?: string
): DeathResult {
  try {
    // Calculate death statistics
        
    // Get contextual death message
        
    // Determine special effects based on death circumstances
        
    // Build updated flags
        
    // Determine respawn location
        
    // Build response messages
        
    return {
      nextRoomId,
      messages,
      flags: updatedFlags,
      deathStats,
      specialEffects
    };
    
  } catch (error) {
    console.error('[DeathEngine] Error handling player death:', error);
    return getFailsafeDeathResult(playerState, cause);
  }
}

/**
 * Calculate comprehensive death statistics
 */
function calculateDeathStats(
  playerState: PlayerState,
  cause: DeathCause,
  location?: string
): DeathStatistics {
        
  // Update death counts
      newDeathsByCause[cause] = (newDeathsByCause[cause] || 0) + 1;
  
  return {
    totalDeaths: newDeathCount,
    deathsByCause: newDeathsByCause,
    consecutiveDeaths: consecutiveDeaths + 1,
    lastDeathLocation: location || playerState.currentRoom || 'unknown',
    lastDeathCause: cause,
    timeOfDeath: Date.now()
  };
}

/**
 * Get contextual death message based on circumstances
 */
function getContextualDeathMessage(
  cause: DeathCause,
  playerState: PlayerState,
  deathStats: DeathStatistics
): string {
    
  // Select message based on death count for variation
    let selectedMessage = messages[messageIndex];
  
  // Add context for repeated deaths
  if (deathStats.totalDeaths > 5) {
            selectedMessage = `${selectedMessage} ${contextMessage}`;
  }
  
  return selectedMessage;
}

/**
 * Determine special effects based on death circumstances
 */
function determineDeathEffects(
  playerState: PlayerState,
  cause: DeathCause,
  deathStats: DeathStatistics
): DeathEffect[] {
  const effects: DeathEffect[] = [];
  
  // Experience-based trait gains
  if (deathStats.totalDeaths >= 3 && !playerState.traits?.includes('experienced_with_death')) {
    effects.push({
      type: 'trait_gained',
      description: 'You gain a grim familiarity with mortality.',
      value: 'experienced_with_death'
    });
  }
  
  if (deathStats.totalDeaths >= 10 && !playerState.traits?.includes('death_defiant')) {
    effects.push({
      type: 'trait_gained',
      description: 'Death becomes an inconvenience rather than an ending.',
      value: 'death_defiant'
    });
  }
  
  // Cause-specific effects
  switch (cause) {
    case 'trap':
      if (deathStats.deathsByCause.trap >= 3 && !playerState.traits?.includes('trap_wise')) {
        effects.push({
          type: 'trait_gained',
          description: 'Painful experience teaches you to spot traps.',
          value: 'trap_wise'
        });
      }
      break;
      
    case 'maze_lost':
      if (deathStats.deathsByCause.maze_lost >= 2) {
        effects.push({
          type: 'memory_retained',
          description: 'Your dying thoughts map a portion of the maze.',
          value: 'maze_partial_map'
        });
      }
      break;
      
    case 'fae_curse':
      effects.push({
        type: 'trait_gained',
        description: 'Fae magic leaves its mark on your soul.',
        value: 'fae_touched'
      });
      break;
  }
  
  // Consecutive death penalties
  if (deathStats.consecutiveDeaths >= 3) {
    effects.push({
      type: 'trait_lost',
      description: 'Repeated failures erode your confidence.',
      value: 'confident'
    });
  }
  
  return effects;
}

/**
 * Build updated flags with death information
 */
function buildUpdatedFlags(
  playerState: PlayerState,
  cause: DeathCause,
  location: string | undefined,
  deathStats: DeathStatistics
): Record<string, unknown> {
  return {
    ...playerState.flags,
    player_splatted: true,
    lastDeathCause: cause,
    lastDeathLocation: location || playerState.currentRoom || 'unknown',
    deathCount: deathStats.totalDeaths,
    deathsByCause: deathStats.deathsByCause,
    consecutiveDeaths: deathStats.consecutiveDeaths,
    lastDeathTime: deathStats.timeOfDeath,
    deathExperience: deathStats.totalDeaths >= 5 ? 'veteran' : 
                    deathStats.totalDeaths >= 3 ? 'experienced' : 'novice'
  };
}

/**
 * Determine respawn location based on death circumstances
 */
function determineRespawnLocation(
  playerState: PlayerState,
  cause: DeathCause,
  deathStats: DeathStatistics
): string {
  // Special respawn locations for specific causes
  switch (cause) {
    case 'maze_lost':
      return 'mazeentrance'; // Respawn at maze entrance
      
    case 'fae_curse':
      return 'elfhame'; // Respawn in fae realm
      
    case 'temporal_paradox':
      return 'timerift'; // Special temporal location if it exists
      
    case 'mirror_trap':
      return 'mirrored_introsplat'; // Alternate version if it exists
  }
  
  // Experience-based respawn improvements
  if (deathStats.totalDeaths >= 10 && playerState.traits?.includes('death_defiant')) {
    // Experienced players might respawn closer to their death location
    return playerState.flags.lastSafeRoom as string || 'introsplat';
  }
  
  // Default respawn
  return 'introsplat';
}

/**
 * Build comprehensive death messages
 */
function buildDeathMessages(
  deathMessage: string,
  playerState: PlayerState,
  deathStats: DeathStatistics,
  specialEffects: DeathEffect[]
): string[] {
    
  // Add awakening message
    
    messages.push(awakeningMessages[awakeningIndex]);
  
  // Add death count information
  if (deathStats.totalDeaths > 1) {
    messages.push(`This is your ${getOrdinalNumber(deathStats.totalDeaths)} death.`);
  }
  
  // Add special effect descriptions
  specialEffects.forEach(effect => {
    messages.push(effect.description);
  });
  
  // Add cause-specific observations
  if (deathStats.deathsByCause[deathStats.lastDeathCause] > 1) {
    messages.push(`You seem particularly susceptible to ${deathStats.lastDeathCause}. Perhaps a different approach?`);
  }
  
  return messages;
}

/**
 * Convert number to ordinal (1st, 2nd, 3rd, etc.)
 */
function getOrdinalNumber(num: number): string {
      return num + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
}

/**
 * Get failsafe death result for error conditions
 */
function getFailsafeDeathResult(playerState: PlayerState, cause: DeathCause): DeathResult {
  return {
    nextRoomId: 'introsplat',
    messages: [
      'Something went wrong with your death. How meta.',
      'You awaken with a sense that reality itself is glitching.'
    ],
    flags: {
      ...playerState.flags,
      player_splatted: true,
      lastDeathCause: cause,
      deathEngineError: true
    }
  };
}

/**
 * Enhanced getDeathMessage function for backwards compatibility
 */
function getDeathMessage(cause: string): string {
      return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get death statistics for external use
 */
export function getDeathStatistics(playerState: PlayerState): DeathStatistics | null {
    if (!deathCount) return null;
  
  return {
    totalDeaths: deathCount,
    deathsByCause: (playerState.flags.deathsByCause as Record<string, number>) || {},
    consecutiveDeaths: (playerState.flags.consecutiveDeaths as number) || 0,
    lastDeathLocation: (playerState.flags.lastDeathLocation as string) || 'unknown',
    lastDeathCause: (playerState.flags.lastDeathCause as string) || 'unknown',
    timeOfDeath: (playerState.flags.lastDeathTime as number) || 0
  };
}

/**
 * Reset death statistics (for new game)
 */
export function resetDeathStatistics(playerState: PlayerState): PlayerState {
    delete cleanedFlags.deathCount;
  delete cleanedFlags.deathsByCause;
  delete cleanedFlags.consecutiveDeaths;
  delete cleanedFlags.lastDeathLocation;
  delete cleanedFlags.lastDeathCause;
  delete cleanedFlags.lastDeathTime;
  delete cleanedFlags.deathExperience;
  
  return {
    ...playerState,
    flags: cleanedFlags
  };
}

/**
 * Check if player has died from specific cause
 */
export function hasPlayerDiedFrom(playerState: PlayerState, cause: DeathCause): boolean {
    return deathsByCause?.[cause] > 0;
}

/**
 * Get player's death experience level
 */
export function getDeathExperience(playerState: PlayerState): 'novice' | 'experienced' | 'veteran' | 'legend' {
    
  if (deathCount >= 20) return 'legend';
  if (deathCount >= 10) return 'veteran';
  if (deathCount >= 5) return 'experienced';
  return 'novice';
}

/**
 * Validate death cause
 */
export function validateDeathCause(cause: any): cause is DeathCause {
  const validCauses: DeathCause[] = [
    'trap', 'glitch', 'npc', 'environmental', 'puzzle_failure', 'combat',
    'starvation', 'madness', 'temporal_paradox', 'maze_lost', 'mirror_trap',
    'fae_curse', 'unknown'
  ];
  return typeof cause === 'string' && validCauses.includes(cause as DeathCause);
}

/**
 * Export utilities for external use
 */
export 
export default DeathEngine;

// Maintain backwards compatibility
export { getDeathMessage };
