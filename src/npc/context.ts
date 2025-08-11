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
// World and player context for NPC conversations

export interface ContextSnapshot {
  roomId: string;
  zone: string;
  nearbyNPCs: string[];
  inventory: string[];
  timers: {
    pollyTakeover?: {
      active: boolean;
      timeRemaining: number;
    };
    [key: string]: any;
  };
  activeQuests: string[];
  recentConsoleEvents: string[];
  playerFlags: Record<string, any>;
  gameStage: string;
  roomDescription: string;
  availableExits: string[];
  roomItems: string[];
  environmentalCues: {
    ambientAudio?: string;
    roomMood?: string;
    lightLevel?: string;
    temperature?: string;
  };
  sessionInfo: {
    playTime: number;
    roomVisitCount: number;
    lastAction: string;
    idleTime: number;
  };
}

/**
 * Get a comprehensive context snapshot for NPC conversations
 */
export function getContextSnapshot(gameState: any): ContextSnapshot {
  const currentRoom = gameState.roomMap?.[gameState.currentRoomId];
  const zone = currentRoom?.zone || 'unknown';
  
  // Extract nearby NPCs
  const nearbyNPCs = (gameState.npcsInRoom || []).map((npc: any) => npc.id || npc.name);
  
  // Get player inventory
  const inventory = gameState.player?.inventory || [];
  
  // Check for active timers
  const timers: ContextSnapshot['timers'] = {};
  
  // Polly Takeover timer (example implementation)
  if (gameState.flags?.pollyTakeoverActive) {
    timers.pollyTakeover = {
      active: true,
      timeRemaining: gameState.flags?.pollyTakeoverTimeRemaining || 0
    };
  }
  
  // Extract recent console messages for context
  const recentConsoleEvents = (gameState.history || [])
    .slice(-5)
    .map((msg: any) => msg.text)
    .filter((text: string) => text && text.length > 0);
  
  // Get available exits
  const availableExits = currentRoom?.exits ? Object.keys(currentRoom.exits) : [];
  
  // Get room items
  const roomItems = currentRoom?.items || [];
  
  // Determine environmental cues
  const environmentalCues: ContextSnapshot['environmentalCues'] = {
    ambientAudio: currentRoom?.ambientAudio,
    roomMood: determineRoomMood(currentRoom, gameState),
    lightLevel: determineLightLevel(zone, currentRoom),
    temperature: determineTemperature(zone)
  };
  
  // Session information
  const sessionInfo: ContextSnapshot['sessionInfo'] = {
    playTime: gameState.metadata?.playTime || 0,
    roomVisitCount: gameState.roomVisitCount?.[gameState.currentRoomId] || 0,
    lastAction: gameState.metadata?.lastAction || 'unknown',
    idleTime: Date.now() - (gameState.metadata?.lastActionTime || Date.now())
  };
  
  return {
    roomId: gameState.currentRoomId || 'unknown',
    zone,
    nearbyNPCs,
    inventory,
    timers,
    activeQuests: extractActiveQuests(gameState),
    recentConsoleEvents,
    playerFlags: gameState.flags || {},
    gameStage: gameState.stage || 'unknown',
    roomDescription: Array.isArray(currentRoom?.description) 
      ? currentRoom.description.join(' ') 
      : currentRoom?.description || '',
    availableExits,
    roomItems,
    environmentalCues,
    sessionInfo
  };
}

/**
 * Determine room mood based on various factors
 */
function determineRoomMood(room: any, gameState: any): string {
  if (!room) return 'neutral';
  
  const zone = room.zone;
  const roomId = room.id;
  
  // Zone-based moods
  if (zone === 'glitchZone') return 'chaotic';
  if (zone === 'gorstanZone') return 'mystical';
  if (zone === 'introZone') return 'technological';
  if (zone === 'latticeZone') return 'scholarly';
  
  // Specific room moods
  if (roomId.includes('reset')) return 'urgent';
  if (roomId.includes('cafe') || roomId.includes('kitchen')) return 'cozy';
  if (roomId.includes('library')) return 'quiet';
  if (roomId.includes('maze')) return 'confusing';
  
  // State-dependent moods
  if (gameState.flags?.pollyTakeoverActive) return 'tense';
  if (gameState.flags?.dominicKilled) return 'somber';
  
  return 'neutral';
}

/**
 * Determine light level based on zone and room
 */
function determineLightLevel(zone: string, room: any): string {
  if (zone === 'glitchZone') return 'flickering';
  if (zone === 'introZone') return 'artificial';
  if (zone === 'latticeZone') return 'soft';
  if (room?.id?.includes('hidden')) return 'dim';
  if (room?.id?.includes('lab')) return 'bright';
  return 'normal';
}

/**
 * Determine temperature based on zone
 */
function determineTemperature(zone: string): string {
  if (zone === 'glitchZone') return 'unstable';
  if (zone === 'gorstanZone') return 'cool';
  if (zone === 'introZone') return 'controlled';
  return 'moderate';
}

/**
 * Extract active quests from game state
 */
function extractActiveQuests(gameState: any): string[] {
  const quests: string[] = [];
  
  // Check various flags that indicate active quests
  if (gameState.flags?.seekingResetRoom) quests.push('find_reset_room');
  if (gameState.flags?.pollyTakeoverActive) quests.push('stop_polly');
  if (gameState.flags?.hasSchrodingerCoin && !gameState.flags?.coinUsed) quests.push('use_coin');
  if (gameState.flags?.needsLibraryAccess) quests.push('access_library');
  if (gameState.flags?.lookingForDominic) quests.push('find_dominic');
  
  return quests;
}

/**
 * Check if player is in a puzzle-critical situation
 */
export function isPuzzleCritical(context: ContextSnapshot): boolean {
  // Time pressure situations
  if (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 60000) {
    return true;
  }
  
  // Critical rooms
  const criticalRooms = ['introreset', 'resetroom', 'blueswitch'];
  if (criticalRooms.some(room => context.roomId.includes(room))) {
    return true;
  }
  
  // Puzzle zones
  if (context.zone === 'glitchZone' && context.sessionInfo.idleTime > 30000) {
    return true;
  }
  
  return false;
}

/**
 * Analyze player behavior patterns
 */
export function analyzePlayerBehavior(context: ContextSnapshot): {
  isExploring: boolean;
  isStuck: boolean;
  isRushing: boolean;
  needsGuidance: boolean;
  confidenceLevel: number;
} {
  const recentEvents = context.recentConsoleEvents.join(' ').toLowerCase();
  const idleTime = context.sessionInfo.idleTime;
  
  // Check if player is exploring
  const isExploring = context.availableExits.length > 1 && 
                     context.sessionInfo.roomVisitCount < 3 &&
                     !recentEvents.includes('help');
  
  // Check if player seems stuck
  const isStuck = idleTime > 30000 || 
                  recentEvents.includes('help') ||
                  recentEvents.includes('stuck') ||
                  (context.recentConsoleEvents.length > 2 && 
                   context.recentConsoleEvents.every(event => event === context.recentConsoleEvents[0]));
  
  // Check if player is rushing
  const isRushing = context.sessionInfo.playTime > 0 && 
                    context.sessionInfo.roomVisitCount > 10 && 
                    !recentEvents.includes('look') &&
                    idleTime < 5000;
  
  // Check if player needs guidance
  const needsGuidance = isStuck || 
                        (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 120000) ||
                        recentEvents.includes('?');
  
  // Calculate confidence level
  let confidenceLevel = 0.5;
  if (isExploring && !isStuck) confidenceLevel += 0.3;
  if (isStuck) confidenceLevel -= 0.4;
  if (isRushing && !isStuck) confidenceLevel += 0.2;
  if (needsGuidance) confidenceLevel -= 0.2;
  
  confidenceLevel = Math.max(0, Math.min(1, confidenceLevel));
  
  return {
    isExploring,
    isStuck,
    isRushing,
    needsGuidance,
    confidenceLevel
  };
}

/**
 * Get location-specific context hints
 */
export function getLocationHints(context: ContextSnapshot): string[] {
  const hints: string[] = [];
  
  // Zone-specific hints
  switch (context.zone) {
    case 'glitchZone':
      hints.push('reality_unstable', 'expect_glitches');
      break;
    case 'latticeZone':
      hints.push('knowledge_focus', 'library_access');
      break;
    case 'gorstanZone':
      hints.push('mystical_realm', 'ancient_wisdom');
      break;
    case 'introZone':
      hints.push('control_center', 'tutorial_space');
      break;
  }
  
  // Room-specific hints
  if (context.roomId.includes('reset')) hints.push('critical_choice', 'point_of_no_return');
  if (context.roomId.includes('library')) hints.push('research_needed', 'information_available');
  if (context.roomId.includes('cafe')) hints.push('social_space', 'rest_area');
  if (context.roomId.includes('maze')) hints.push('navigation_challenge', 'patience_required');
  
  // Item-based hints
  if (context.inventory.includes('schrodingerCoin')) hints.push('quantum_paradox', 'choice_matters');
  if (context.inventory.includes('napkin')) hints.push('research_clue', 'library_relevant');
  
  return hints;
}
