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
// Movement policy and pathfinding for wandering NPCs

export interface NPCMoveContext {
  currentRoom: string;
  npcId: string;
  allowedAdjacency: string[];
  roamRadius?: number;
  homeRoom?: string;
  avoidRooms: string[];
  preferRooms: string[];
  playerRoomId: string;
  roomCapacity?: Record<string, number>;
  occupiedRooms?: Record<string, string[]>; // roomId -> npcIds
  questGates?: Record<string, boolean>; // roomId -> accessible
  lockedDoors?: Record<string, boolean>; // roomId -> locked
}

export interface MovePolicyConfig {
  mode: 'random-adjacent' | 'patrol' | 'player-seek' | 'player-avoid' | 'home-bias';
  patrolRoute?: string[]; // For patrol mode
  seekChance?: number; // For player-seek mode (0-1)
  avoidDistance?: number; // For player-avoid mode (rooms)
  homeReturnChance?: number; // For home-bias mode (0-1)
  respectCapacity?: boolean;
  allowTeleportFallback?: boolean; // Fallback if no adjacent moves possible
}

export interface MoveDecision {
  targetRoom: string | null;
  reason: string;
  confidence: number; // 0-1, how good this move is
  isLegal: boolean;
  requiresTeleport: boolean;
}

/**
 * Main decision function for NPC movement
 */
export function decideMove(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  // Validate context
  if (!context.currentRoom || !context.npcId) {
    return {
      targetRoom: null,
      reason: 'Invalid context',
      confidence: 0,
      isLegal: false,
      requiresTeleport: false
    };
  }

  // Check for illegal current position (shouldn't happen, but safety)
  if (isRoomIllegal(context.currentRoom, context)) {
    const escapeRoom = findEscapeRoom(context);
    if (escapeRoom) {
      return {
        targetRoom: escapeRoom,
        reason: 'Escape from illegal room',
        confidence: 1.0,
        isLegal: true,
        requiresTeleport: true
      };
    }
  }

  // Apply movement policy
  switch (policy.mode) {
    case 'random-adjacent':
      return decideRandomAdjacent(context, policy);
    
    case 'patrol':
      return decidePatrol(context, policy);
    
    case 'player-seek':
      return decidePlayerSeek(context, policy);
    
    case 'player-avoid':
      return decidePlayerAvoid(context, policy);
    
    case 'home-bias':
      return decideHomeBias(context, policy);
    
    default:
      return decideRandomAdjacent(context, policy);
  }
}

/**
 * Random movement to adjacent rooms
 */
function decideRandomAdjacent(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  const validMoves = getValidAdjacentMoves(context);
  
  if (validMoves.length === 0) {
    if (policy.allowTeleportFallback) {
      const teleportTarget = findTeleportFallback(context);
      if (teleportTarget) {
        return {
          targetRoom: teleportTarget,
          reason: 'Teleport fallback - no adjacent moves',
          confidence: 0.3,
          isLegal: true,
          requiresTeleport: true
        };
      }
    }
    
    return {
      targetRoom: null,
      reason: 'No valid adjacent moves available',
      confidence: 0,
      isLegal: false,
      requiresTeleport: false
    };
  }

  // Apply preferences
  const preferred = validMoves.filter(room => 
    context.preferRooms.includes(room)
  );
  
  const candidates = preferred.length > 0 ? preferred : validMoves;
  const targetRoom = candidates[Math.floor(Math.random() * candidates.length)];
  
  return {
    targetRoom,
    reason: preferred.length > 0 ? 'Random adjacent (preferred)' : 'Random adjacent',
    confidence: 0.7,
    isLegal: true,
    requiresTeleport: false
  };
}

/**
 * Patrol between specific rooms in order
 */
function decidePatrol(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  if (!policy.patrolRoute || policy.patrolRoute.length === 0) {
    return decideRandomAdjacent(context, policy);
  }

  const currentIndex = policy.patrolRoute.indexOf(context.currentRoom);
  
  if (currentIndex === -1) {
    // Not on patrol route - return to nearest patrol point
    const nearestPatrolRoom = findNearestPatrolRoom(context, policy.patrolRoute);
    if (nearestPatrolRoom) {
      return {
        targetRoom: nearestPatrolRoom,
        reason: 'Return to patrol route',
        confidence: 0.8,
        isLegal: true,
        requiresTeleport: !context.allowedAdjacency.includes(nearestPatrolRoom)
      };
    }
  } else {
    // On patrol route - move to next point
    const nextIndex = (currentIndex + 1) % policy.patrolRoute.length;
    const nextRoom = policy.patrolRoute[nextIndex];
    
    if (isMoveLegal(context.currentRoom, nextRoom, context)) {
      return {
        targetRoom: nextRoom,
        reason: `Patrol to point ${nextIndex + 1}/${policy.patrolRoute.length}`,
        confidence: 0.9,
        isLegal: true,
        requiresTeleport: !context.allowedAdjacency.includes(nextRoom)
      };
    }
  }

  // Fallback to random if patrol fails
  return decideRandomAdjacent(context, policy);
}

/**
 * Seek player (rarely, conditionally)
 */
function decidePlayerSeek(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  const seekChance = policy.seekChance || 0.1;
  
  // Most of the time, don't seek
  if (Math.random() > seekChance) {
    return decideRandomAdjacent(context, policy);
  }

  // Check if player is in adjacent room
  if (context.allowedAdjacency.includes(context.playerRoomId)) {
    return {
      targetRoom: context.playerRoomId,
      reason: 'Seek player (adjacent)',
      confidence: 0.6,
      isLegal: true,
      requiresTeleport: false
    };
  }

  // Move toward player if possible
  const pathToPlayer = findShortestPath(
    context.currentRoom,
    context.playerRoomId,
    context
  );

  if (pathToPlayer && pathToPlayer.length > 1) {
    const nextStep = pathToPlayer[1]; // First step toward player
    
    if (isMoveLegal(context.currentRoom, nextStep, context)) {
      return {
        targetRoom: nextStep,
        reason: 'Seek player (pathfinding)',
        confidence: 0.5,
        isLegal: true,
        requiresTeleport: !context.allowedAdjacency.includes(nextStep)
      };
    }
  }

  // Fallback to random if seeking fails
  return decideRandomAdjacent(context, policy);
}

/**
 * Avoid player
 */
function decidePlayerAvoid(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  const avoidDistance = policy.avoidDistance || 2;
  const currentDistance = calculateDistance(context.currentRoom, context.playerRoomId, context);
  
  // If far enough away, move randomly
  if (currentDistance >= avoidDistance) {
    return decideRandomAdjacent(context, policy);
  }

  // Find moves that increase distance from player
  const validMoves = getValidAdjacentMoves(context);
  const avoidMoves = validMoves.filter(room => {
    const newDistance = calculateDistance(room, context.playerRoomId, context);
    return newDistance > currentDistance;
  });

  if (avoidMoves.length > 0) {
    const targetRoom = avoidMoves[Math.floor(Math.random() * avoidMoves.length)];
    return {
      targetRoom,
      reason: `Avoid player (distance ${currentDistance} -> ${calculateDistance(targetRoom, context.playerRoomId, context)})`,
      confidence: 0.8,
      isLegal: true,
      requiresTeleport: false
    };
  }

  // No avoiding moves available - stay put
  return {
    targetRoom: null,
    reason: 'Cannot avoid player further',
    confidence: 0.2,
    isLegal: true,
    requiresTeleport: false
  };
}

/**
 * Bias toward home room
 */
function decideHomeBias(
  context: NPCMoveContext,
  policy: MovePolicyConfig
): MoveDecision {
  if (!context.homeRoom) {
    return decideRandomAdjacent(context, policy);
  }

  const homeReturnChance = policy.homeReturnChance || 0.3;
  const currentDistance = calculateDistance(context.currentRoom, context.homeRoom, context);
  
  // Higher chance to return home if far away
  const adjustedChance = Math.min(homeReturnChance * (currentDistance + 1), 0.8);
  
  if (Math.random() < adjustedChance) {
    // Try to move toward home
    const pathToHome = findShortestPath(context.currentRoom, context.homeRoom, context);
    
    if (pathToHome && pathToHome.length > 1) {
      const nextStep = pathToHome[1];
      
      if (isMoveLegal(context.currentRoom, nextStep, context)) {
        return {
          targetRoom: nextStep,
          reason: `Return to home (${currentDistance} rooms away)`,
          confidence: 0.7,
          isLegal: true,
          requiresTeleport: !context.allowedAdjacency.includes(nextStep)
        };
      }
    }
  }

  // Otherwise move randomly
  return decideRandomAdjacent(context, policy);
}

// Utility functions

/**
 * Get valid adjacent rooms for movement
 */
function getValidAdjacentMoves(context: NPCMoveContext): string[] {
  return context.allowedAdjacency.filter(room => 
    isMoveLegal(context.currentRoom, room, context)
  );
}

/**
 * Check if a move between two rooms is legal
 */
function isMoveLegal(fromRoom: string, toRoom: string, context: NPCMoveContext): boolean {
  // Check avoid list
  if (context.avoidRooms.includes(toRoom)) {
    return false;
  }

  // Check room capacity
  if (context.roomCapacity && context.occupiedRooms) {
    const capacity = context.roomCapacity[toRoom];
    const occupied = context.occupiedRooms[toRoom] || [];
    
    if (capacity && occupied.length >= capacity) {
      return false;
    }
  }

  // Check quest gates
  if (context.questGates && context.questGates[toRoom] === false) {
    return false;
  }

  // Check locked doors
  if (context.lockedDoors && context.lockedDoors[toRoom] === true) {
    return false;
  }

  // Check roam radius if applicable
  if (context.roamRadius && context.homeRoom) {
    const distanceFromHome = calculateDistance(toRoom, context.homeRoom, context);
    if (distanceFromHome > context.roamRadius) {
      return false;
    }
  }

  return true;
}

/**
 * Check if current room is illegal for this NPC
 */
function isRoomIllegal(roomId: string, context: NPCMoveContext): boolean {
  return context.avoidRooms.includes(roomId);
}

/**
 * Find an escape room if NPC is in illegal location
 */
function findEscapeRoom(context: NPCMoveContext): string | null {
  // Try adjacent rooms first
  const validAdjacent = getValidAdjacentMoves(context);
  if (validAdjacent.length > 0) {
    return validAdjacent[0];
  }

  // Try home room
  if (context.homeRoom && !context.avoidRooms.includes(context.homeRoom)) {
    return context.homeRoom;
  }

  // Try any preferred room
  for (const room of context.preferRooms) {
    if (!context.avoidRooms.includes(room)) {
      return room;
    }
  }

  return null;
}

/**
 * Find fallback teleport target
 */
function findTeleportFallback(context: NPCMoveContext): string | null {
  // Try home room first
  if (context.homeRoom && isMoveLegal(context.currentRoom, context.homeRoom, context)) {
    return context.homeRoom;
  }

  // Try preferred rooms
  for (const room of context.preferRooms) {
    if (isMoveLegal(context.currentRoom, room, context)) {
      return room;
    }
  }

  return null;
}

/**
 * Find nearest room from patrol route
 */
function findNearestPatrolRoom(context: NPCMoveContext, patrolRoute: string[]): string | null {
  let nearest = null;
  let shortestDistance = Infinity;

  for (const room of patrolRoute) {
    const distance = calculateDistance(context.currentRoom, room, context);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = room;
    }
  }

  return nearest;
}

/**
 * Calculate distance between rooms (simplified - in real implementation would use actual room graph)
 */
export function calculateDistance(fromRoom: string, toRoom: string, context: NPCMoveContext): number {
  if (fromRoom === toRoom) return 0;
  
  // Simplified: Adjacent rooms are distance 1, others are estimated
  if (context.allowedAdjacency.includes(toRoom)) {
    return 1;
  }
  
  // Rough estimation based on room IDs (would be replaced with actual pathfinding)
  const fromZone = extractZone(fromRoom);
  const toZone = extractZone(toRoom);
  
  if (fromZone === toZone) {
    return 2; // Same zone, probably close
  } else {
    return 4; // Different zone, farther
  }
}

/**
 * Find shortest path between rooms (simplified BFS implementation)
 */
function findShortestPath(fromRoom: string, toRoom: string, context: NPCMoveContext): string[] | null {
  if (fromRoom === toRoom) {
    return [fromRoom];
  }

  // Simplified pathfinding - in real implementation would use actual room graph
  // For now, return direct path if adjacent, null otherwise
  if (context.allowedAdjacency.includes(toRoom)) {
    return [fromRoom, toRoom];
  }

  return null; // Path finding not implemented for multi-hop moves
}

/**
 * Extract zone from room ID
 */
function extractZone(roomId: string): string {
  const parts = roomId.split('_');
  return parts[0] || 'unknown';
}

/**
 * Create default move policy for an NPC type
 */
export function createDefaultPolicy(npcType: 'wanderer' | 'guard' | 'seeker' | 'hermit'): MovePolicyConfig {
  switch (npcType) {
    case 'wanderer':
      return {
        mode: 'random-adjacent',
        respectCapacity: true,
        allowTeleportFallback: false
      };
    
    case 'guard':
      return {
        mode: 'patrol',
        patrolRoute: [], // To be configured per NPC
        respectCapacity: true,
        allowTeleportFallback: true
      };
    
    case 'seeker':
      return {
        mode: 'player-seek',
        seekChance: 0.2,
        respectCapacity: true,
        allowTeleportFallback: false
      };
    
    case 'hermit':
      return {
        mode: 'home-bias',
        homeReturnChance: 0.7,
        respectCapacity: false,
        allowTeleportFallback: true
      };
    
    default:
      return {
        mode: 'random-adjacent',
        respectCapacity: true,
        allowTeleportFallback: false
      };
  }
}
