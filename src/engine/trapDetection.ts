// src/engine/trapDetection.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles trap detection and visibility improvements

import { LocalGameState } from '../state/gameState';
import { Room } from '../types/Room';
import { checkForTrap, getTrapByRoom } from './trapController';
import { isRoomTrapped } from './trapEngine';

export interface TrapDetectionResult {
  detected: boolean;
  warning?: string;
  canDisarm?: boolean;
  detectionMethod?: string;
  severity?: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * Check for traps when entering a room and provide appropriate warnings
 */
export function detectTrapsOnEntry(
  room: Room,
  gameState: LocalGameState
): TrapDetectionResult {
  
  // Check for procedural traps first
  const proceduralTrap = checkForTrap(room.id, 'enter');
  if (proceduralTrap) {
    return {
      detected: true,
      warning: proceduralTrap,
      detectionMethod: 'basic_sense',
      severity: 'medium'
    };
  }

  // Check for static room traps
  if (room.traps && room.traps.length > 0) {
    const playerTraits = gameState.player.traits || [];
    const playerItems = gameState.player.inventory || [];
    
    for (const trap of room.traps) {
      // Skip already triggered traps
      if (trap.triggered) continue;
      
      // Check if trap can be detected
      const detection = checkTrapDetection(trap, playerTraits, playerItems);
      if (detection.detected) {
        return detection;
      }
    }
  }

  // Check trapEngine system
  if (isRoomTrapped(room.id)) {
    return {
      detected: true,
      warning: '⚠️ You sense something dangerous lurking in this area...',
      detectionMethod: 'instinct',
      severity: 'medium'
    };
  }

  return { detected: false };
}

/**
 * Check if a specific trap can be detected based on player abilities
 */
function checkTrapDetection(
  trap: any,
  playerTraits: string[],
  playerItems: string[]
): TrapDetectionResult {
  
  // Non-hidden traps are always detectable
  if (!trap.hidden) {
    return {
      detected: true,
      warning: `⚠️ You notice a ${trap.severity || 'dangerous'} trap: ${trap.description || 'Something dangerous blocks your path.'}`,
      canDisarm: trap.disarmable !== false,
      detectionMethod: 'visual',
      severity: getSeverityLevel(trap.severity)
    };
  }

  // Hidden trap detection requires skills or items
  let detectionChance = 0;
  let detectionMethod = 'none';

  // Trait-based detection
  if (playerTraits.includes('trap_expert') || playerTraits.includes('master_thief')) {
    detectionChance += 0.8;
    detectionMethod = 'expertise';
  } else if (playerTraits.includes('perceptive') || playerTraits.includes('alert')) {
    detectionChance += 0.6;
    detectionMethod = 'perception';
  } else if (playerTraits.includes('cautious')) {
    detectionChance += 0.4;
    detectionMethod = 'caution';
  }

  // Item-based detection
  if (playerItems.includes('trap_detector') || playerItems.includes('scanner')) {
    detectionChance += 0.7;
    detectionMethod = 'technology';
  } else if (playerItems.includes('thieves_tools') || playerItems.includes('lockpicks')) {
    detectionChance += 0.5;
    detectionMethod = 'tools';
  } else if (playerItems.includes('magnifying_glass')) {
    detectionChance += 0.3;
    detectionMethod = 'investigation';
  }

  // Base chance for all players (even hidden traps should have some detection possibility)
  detectionChance = Math.max(detectionChance, 0.1); // Minimum 10% chance

  // High-severity traps are easier to detect (they're more dangerous)
  if (trap.severity === 'major' || trap.severity === 'severe') {
    detectionChance += 0.2;
  } else if (trap.severity === 'lethal') {
    detectionChance += 0.3; // Very dangerous traps leave more clues
  }

  if (Math.random() < detectionChance) {
    return {
      detected: true,
      warning: generateDetectionWarning(trap, detectionMethod),
      canDisarm: trap.disarmable !== false,
      detectionMethod,
      severity: getSeverityLevel(trap.severity)
    };
  }

  return { detected: false };
}

/**
 * Generate appropriate warning message based on detection method
 */
function generateDetectionWarning(trap: any, method: string): string {
  const severity = trap.severity || 'minor';
  
  switch (method) {
    case 'expertise':
      return `🎯 Your expertise reveals a well-hidden ${severity} trap. ${trap.description || 'Dangerous mechanism detected.'}`;
    
    case 'perception':
      return `👁️ Your keen senses detect something amiss - a ${severity} trap lies ahead. ${trap.description || 'Proceed with caution.'}`;
    
    case 'caution':
      return `🤔 Your cautious nature makes you suspicious. You spot signs of a ${severity} trap.`;
    
    case 'technology':
      return `📱 Your detector beeps urgently - ${severity} trap detected! ${trap.description || 'Mechanism identified.'}`;
    
    case 'tools':
      return `🔧 Your thieves' tools help you identify trap mechanisms - ${severity} danger ahead.`;
    
    case 'investigation':
      return `🔍 Careful examination reveals telltale signs of a ${severity} trap.`;
    
    case 'visual':
      return `⚠️ You clearly see a ${severity} trap: ${trap.description || 'Dangerous obstacle ahead.'}`;
    
    default:
      return `⚠️ Something feels wrong here... you sense a ${severity} trap nearby.`;
  }
}

/**
 * Convert trap severity to detection severity level
 */
function getSeverityLevel(trapSeverity: string): 'low' | 'medium' | 'high' | 'extreme' {
  switch (trapSeverity) {
    case 'minor':
    case 'light':
      return 'low';
    case 'moderate':
      return 'medium';
    case 'major':
    case 'severe':
      return 'high';
    case 'lethal':
      return 'extreme';
    default:
      return 'medium';
  }
}

/**
 * Allow players to actively search for traps
 */
export function searchForTraps(
  room: Room,
  gameState: LocalGameState
): TrapDetectionResult {
  
  // Searching gives better detection chances
  const playerTraits = gameState.player.traits || [];
  const playerItems = gameState.player.inventory || [];
  
  // Check room traps with enhanced detection
  if (room.traps && room.traps.length > 0) {
    for (const trap of room.traps) {
      if (trap.triggered) continue;
      
      // Enhanced detection for active searching
      const detection = checkTrapDetection(trap, playerTraits, playerItems);
      if (detection.detected || Math.random() < 0.4) { // 40% base chance when searching
        return {
          detected: true,
          warning: `🔍 **Searching carefully...** You discover a ${trap.severity || 'dangerous'} trap! ${trap.description || 'Hidden mechanism found.'}`,
          canDisarm: trap.disarmable !== false,
          detectionMethod: 'active_search',
          severity: getSeverityLevel(trap.severity)
        };
      }
    }
  }

  // Check for procedural traps
  if (isRoomTrapped(room.id) || getTrapByRoom(room.id)) {
    return {
      detected: true,
      warning: '🔍 **Searching carefully...** Your investigation reveals hidden dangers in this area.',
      detectionMethod: 'active_search',
      severity: 'medium'
    };
  }

  return {
    detected: false,
    warning: '🔍 **Searching carefully...** You find no traps in this area. It appears safe.'
  };
}

/**
 * Check if player can disarm a detected trap
 */
export function canPlayerDisarmTrap(
  trap: any,
  playerTraits: string[],
  playerItems: string[]
): { canDisarm: boolean; method?: string; chance?: number } {
  
  if (trap.disarmable === false) {
    return { canDisarm: false };
  }

  let disarmChance = 0.3; // Base chance
  let method = 'basic';

  // Trait-based disarming
  if (playerTraits.includes('trap_expert')) {
    disarmChance = 0.9;
    method = 'expertise';
  } else if (playerTraits.includes('master_thief')) {
    disarmChance = 0.8;
    method = 'thief_skills';
  } else if (playerTraits.includes('technical')) {
    disarmChance = 0.6;
    method = 'technical_knowledge';
  }

  // Item-based disarming
  if (playerItems.includes('trapkit') || playerItems.includes('trap_kit')) {
    disarmChance = Math.max(disarmChance, 0.8);
    method = 'professional_tools';
  } else if (playerItems.includes('thieves_tools')) {
    disarmChance = Math.max(disarmChance, 0.7);
    method = 'thieves_tools';
  } else if (playerItems.includes('wire_cutters')) {
    disarmChance = Math.max(disarmChance, 0.5);
    method = 'wire_cutting';
  }

  return {
    canDisarm: true,
    method,
    chance: Math.min(disarmChance, 0.95) // Cap at 95%
  };
}
