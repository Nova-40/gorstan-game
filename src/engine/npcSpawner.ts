// npcSpawner.ts
// Dynamic NPC spawning system for wandering characters
// (c) 2025 Geoffrey Alan Webster. MIT License

import { GameAction } from '../types/GameTypes';
import { Room } from '../types/Room';
import { NPCState, PlayerState } from './npcMemory';
import { Dispatch } from 'react';

export interface WanderingNPC {
  id: string;
  name: string;
  entryLine?: string;
  exitLine?: string;
  personality: NPCPersonality;
  spawnConditions: SpawnCondition[];
  conflictRules: ConflictRule[];
  zonePreferences: string[];
  spawnChance: number; // 0.0 to 1.0
}

export interface NPCPersonality {
  traits: string[];
  mood: string;
  archetype: 'helper' | 'trickster' | 'guardian' | 'sage' | 'wildcard';
  priority: number; // Higher priority NPCs can displace lower ones
}

export interface SpawnCondition {
  type: 'flag' | 'inventory' | 'room_count' | 'npc_memory' | 'random' | 'zone' | 'quest' | 'custom';
  key?: string;
  value?: any;
  operator?: 'equals' | 'greater' | 'less' | 'contains' | 'not_contains';
}

export interface ConflictRule {
  type: 'cannot_coexist' | 'displaces' | 'avoids_zone' | 'requires_absence';
  targetNPC?: string;
  targetZone?: string;
  condition?: string;
}

// Define the wandering NPCs
export const wanderingNPCs: WanderingNPC[] = [
  {
    id: 'mr_wendell',
    name: 'Mr. Wendell',
    entryLine: 'A chill settles over the room as Mr. Wendell materializes from the shadows, standing perfectly still.',
    exitLine: 'Mr. Wendell fades back into the darkness with an almost imperceptible nod.',
    personality: {
      traits: ['erudite', 'polite', 'predatory', 'observant', 'precise'],
      mood: 'coldly_amused',
      archetype: 'guardian',
      priority: 10 // Highest priority - can displace other NPCs
    },
    spawnConditions: [
      { type: 'custom', key: 'wendell_logic' } // Special custom logic
    ],
    conflictRules: [
      { type: 'displaces', condition: 'always' } // Mr. Wendell displaces everyone
    ],
    zonePreferences: ['all_except_safe'],
    spawnChance: 0.05 // Base 5% chance, modified by behavior
  },
  {
    id: 'librarian',
    name: 'The Librarian',
    entryLine: 'A scholarly figure emerges from the shadows between towering bookshelves.',
    exitLine: 'The Librarian retreats into the depths of knowledge, his footsteps echoing among ancient tomes.',
    personality: {
      traits: ['scholarly', 'mysterious', 'wise', 'testing'],
      mood: 'contemplative',
      archetype: 'sage',
      priority: 9 // Very high priority in library rooms
    },
    spawnConditions: [
      { type: 'custom', key: 'librarian_logic' } // Special library room logic
    ],
    conflictRules: [
      { type: 'displaces', condition: 'in_library' } // Displaces others in library rooms
    ],
    zonePreferences: ['library_rooms'],
    spawnChance: 0.8 // 80% chance in library rooms
  },
  {
    id: 'ayla',
    name: 'Ayla',
    entryLine: 'A warm presence fills the room as Ayla materializes, her form shimmering slightly.',
    exitLine: 'Ayla fades away with a gentle smile, leaving only a sense of understanding.',
    personality: {
      traits: ['philosophical', 'warm', 'ai-aware', 'helpful'],
      mood: 'serene',
      archetype: 'sage',
      priority: 10
    },
    spawnConditions: [
      { type: 'random' }, // Can spawn randomly
      { type: 'flag', key: 'ayla_summoned', value: true },
      { type: 'npc_memory', key: 'query_count', value: 3, operator: 'greater' }
    ],
    conflictRules: [
      { type: 'displaces', targetNPC: 'polly' },
      { type: 'displaces', targetNPC: 'morthos' }
    ],
    zonePreferences: ['lattice', 'intro', 'london'],
    spawnChance: 0.15
  },
  
  {
    id: 'al_escape_artist',
    name: 'Al',
    entryLine: 'A bureaucratic figure in a slightly rumpled suit appears, adjusting his glasses.',
    exitLine: 'Al checks his watch and fades away with bureaucratic efficiency.',
    personality: {
      traits: ['bureaucratic', 'deadpan', 'knowledgeable', 'helpful'],
      mood: 'neutral',
      archetype: 'helper',
      priority: 6
    },
    spawnConditions: [
      { type: 'zone', value: 'puzzle_heavy' },
      { type: 'flag', key: 'player_stuck', value: true },
      { type: 'room_count', value: 5, operator: 'greater' }
    ],
    conflictRules: [],
    zonePreferences: ['intro', 'lattice', 'system'],
    spawnChance: 0.12
  },
  
  {
    id: 'dominic_wandering',
    name: 'Dominic',
    entryLine: 'A goldfish bowl materializes on a nearby surface, Dominic swimming in contemplative circles.',
    exitLine: 'The fishbowl fades away, but Dominic\'s knowing look lingers in your memory.',
    personality: {
      traits: ['philosophical', 'fourth-wall-aware', 'sardonic', 'wise'],
      mood: 'contemplative',
      archetype: 'sage',
      priority: 4
    },
    spawnConditions: [
      { type: 'inventory', key: 'dominic', value: false, operator: 'not_contains' },
      { type: 'zone', value: 'surreal' },
      { type: 'flag', key: 'dominic_taken', value: false }
    ],
    conflictRules: [
      { type: 'cannot_coexist', targetNPC: 'polly' }
    ],
    zonePreferences: ['glitch', 'lattice', 'elfhame'],
    spawnChance: 0.08
  },
  
  {
    id: 'morthos',
    name: 'Morthos',
    entryLine: 'Shadows gather in the corners as Morthos emerges, his presence both threatening and oddly reassuring.',
    exitLine: 'Morthos dissolves back into shadow with a cryptic smile.',
    personality: {
      traits: ['cryptic', 'unpredictable', 'morally-ambiguous', 'philosophical'],
      mood: 'mysterious',
      archetype: 'trickster',
      priority: 7
    },
    spawnConditions: [
      { type: 'flag', key: 'moral_choice_made', value: true },
      { type: 'zone', value: 'dark' },
      { type: 'npc_memory', key: 'death_count', value: 2, operator: 'greater' }
    ],
    conflictRules: [
      { type: 'avoids_zone', targetZone: 'london' },
      { type: 'cannot_coexist', targetNPC: 'albie' }
    ],
    zonePreferences: ['glitch', 'stanton', 'liminal'],
    spawnChance: 0.1
  },
  
  {
    id: 'polly',
    name: 'Polly',
    entryLine: 'Polly steps out from behind something that wasn\'t there a moment ago, watching you intently.',
    exitLine: 'Polly backs away slowly, never breaking eye contact until she fades from view.',
    personality: {
      traits: ['manipulative', 'unpredictable', 'emotional', 'complex'],
      mood: 'volatile',
      archetype: 'wildcard',
      priority: 8
    },
    spawnConditions: [
      { type: 'flag', key: 'emotional_trigger', value: true },
      { type: 'flag', key: 'dominic_dead', value: true },
      { type: 'flag', key: 'stanton_reached', value: true }
    ],
    conflictRules: [
      { type: 'cannot_coexist', targetNPC: 'ayla' },
      { type: 'cannot_coexist', targetNPC: 'dominic_wandering' },
      { type: 'requires_absence', targetNPC: 'albie' }
    ],
    zonePreferences: ['stanton', 'emotional_spaces'],
    spawnChance: 0.06
  },
  
  {
    id: 'albie',
    name: 'Albie',
    entryLine: 'Albie strolls in with the confidence of someone who owns the place, nodding professionally.',
    exitLine: 'Albie tips his cap and walks away with the measured pace of security personnel.',
    personality: {
      traits: ['reliable', 'bureaucratic', 'protective', 'dry-humor'],
      mood: 'professional',
      archetype: 'guardian',
      priority: 9
    },
    spawnConditions: [
      { type: 'zone', value: 'stable' },
      { type: 'flag', key: 'need_intervention', value: true },
      { type: 'random' }
    ],
    conflictRules: [
      { type: 'displaces', targetNPC: 'morthos' },
      { type: 'displaces', targetNPC: 'polly' }
    ],
    zonePreferences: ['london', 'intro', 'hub'],
    spawnChance: 0.2
  }
];

// Global state for tracking active NPCs
let globalDispatch: Dispatch<GameAction> | null = null;
let activeNPCs: Map<string, string> = new Map(); // roomId -> npcId

export function initializeNPCSpawner(dispatch: Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}

/**
 * Main function to evaluate and spawn/despawn NPCs in a room
 */
export function evaluateNPCSpawning(
  roomId: string, 
  room: Room, 
  playerState: PlayerState, 
  npcStates: Record<string, NPCState>
): { spawn?: WanderingNPC; despawn?: string; messages: string[] } {
  
  const messages: string[] = [];
  const currentNPC = activeNPCs.get(roomId);
  
  // Check if current NPC should be despawned
  if (currentNPC) {
    const npc = wanderingNPCs.find(n => n.id === currentNPC);
    if (npc && !shouldNPCStayInRoom(npc, roomId, room, playerState)) {
      activeNPCs.delete(roomId);
      if (npc.exitLine) {
        messages.push(npc.exitLine);
      }
      return { despawn: currentNPC, messages };
    }
  }
  
  // If no NPC or need to spawn new one, evaluate spawning
  if (!currentNPC) {
    const candidateNPC = selectNPCToSpawn(roomId, room, playerState, npcStates);
    if (candidateNPC) {
      activeNPCs.set(roomId, candidateNPC.id);
      if (candidateNPC.entryLine) {
        messages.push(candidateNPC.entryLine);
      }
      return { spawn: candidateNPC, messages };
    }
  }
  
  return { messages };
}

/**
 * Select which NPC should spawn in a room
 */
function selectNPCToSpawn(
  roomId: string, 
  room: Room, 
  playerState: PlayerState, 
  npcStates: Record<string, NPCState>
): WanderingNPC | null {
  
  const eligibleNPCs = wanderingNPCs.filter(npc => 
    canNPCSpawnInRoom(npc, roomId, room, playerState, npcStates)
  );
  
  if (eligibleNPCs.length === 0) return null;
  
  // Sort by priority and spawn chance
  eligibleNPCs.sort((a, b) => {
    const priorityDiff = b.personality.priority - a.personality.priority;
    if (priorityDiff !== 0) return priorityDiff;
    return b.spawnChance - a.spawnChance;
  });
  
  // Roll for spawn chance
  for (const npc of eligibleNPCs) {
    if (Math.random() < npc.spawnChance) {
      return npc;
    }
  }
  
  return null;
}

/**
 * Check if an NPC can spawn in a specific room
 */
function canNPCSpawnInRoom(
  npc: WanderingNPC, 
  roomId: string, 
  room: Room, 
  playerState: PlayerState, 
  npcStates: Record<string, NPCState>
): boolean {
  
  // Check spawn conditions
  if (!npc.spawnConditions.every(condition => 
    evaluateSpawnCondition(condition, roomId, room, playerState, npcStates)
  )) {
    return false;
  }
  
  // Check conflict rules
  for (const rule of npc.conflictRules) {
    if (!evaluateConflictRule(rule, roomId, room, playerState)) {
      return false;
    }
  }
  
  // Check zone preferences
  const roomZone = getRoomZone(roomId, room);
  if (npc.zonePreferences.length > 0 && !npc.zonePreferences.includes(roomZone)) {
    return false;
  }
  
  return true;
}

/**
 * Check if an NPC should stay in a room
 */
function shouldNPCStayInRoom(
  npc: WanderingNPC, 
  roomId: string, 
  room: Room, 
  playerState: PlayerState
): boolean {
  
  // NPCs might leave if conditions change
  const roomZone = getRoomZone(roomId, room);
  
  // Check if zone is still preferred
  if (npc.zonePreferences.length > 0 && !npc.zonePreferences.includes(roomZone)) {
    return Math.random() < 0.3; // 30% chance to stay anyway
  }
  
  return true;
}

/**
 * Evaluate a spawn condition
 */
function evaluateSpawnCondition(
  condition: SpawnCondition, 
  roomId: string, 
  room: Room, 
  playerState: PlayerState, 
  npcStates: Record<string, NPCState>
): boolean {
  
  switch (condition.type) {
    case 'flag':
      if (!condition.key || !playerState.flags) return false;
      const flagValue = playerState.flags[condition.key];
      return evaluateValue(flagValue, condition.value, condition.operator);
      
    case 'inventory':
      if (!condition.key || !playerState.inventory) return false;
      const hasItem = playerState.inventory.includes(condition.key);
      return condition.operator === 'not_contains' ? !hasItem : hasItem;
      
    case 'room_count':
      const visitedCount = playerState.visitedRooms?.length || 0;
      return evaluateValue(visitedCount, condition.value, condition.operator);
      
    case 'random':
      return Math.random() < 0.3; // 30% random chance
      
    case 'zone':
      const zone = getRoomZone(roomId, room);
      return zone === condition.value || zone.includes(condition.value as string);
      
    case 'npc_memory':
      // Check NPC memory conditions
      return true; // Simplified for now
      
    default:
      return false;
  }
}

/**
 * Evaluate a conflict rule
 */
function evaluateConflictRule(
  rule: ConflictRule, 
  roomId: string, 
  room: Room, 
  playerState: PlayerState
): boolean {
  
  switch (rule.type) {
    case 'cannot_coexist':
      // Check if conflicting NPC is in this room
      const conflictingNPC = activeNPCs.get(roomId);
      return !conflictingNPC || conflictingNPC !== rule.targetNPC;
      
    case 'avoids_zone':
      const zone = getRoomZone(roomId, room);
      return zone !== rule.targetZone;
      
    case 'requires_absence':
      // Check if target NPC is NOT in room
      const targetNPC = activeNPCs.get(roomId);
      return !targetNPC || targetNPC !== rule.targetNPC;
      
    default:
      return true;
  }
}

/**
 * Helper function to evaluate values with operators
 */
function evaluateValue(actual: any, expected: any, operator?: string): boolean {
  switch (operator) {
    case 'equals': return actual === expected;
    case 'greater': return actual > expected;
    case 'less': return actual < expected;
    case 'contains': return actual && actual.includes && actual.includes(expected);
    case 'not_contains': return !actual || !actual.includes || !actual.includes(expected);
    default: return actual === expected;
  }
}

/**
 * Determine room zone for spawning logic
 */
function getRoomZone(roomId: string, room: Room): string {
  // Extract zone from room ID
  if (roomId.includes('Zone_')) {
    return roomId.split('Zone_')[0].toLowerCase();
  }
  
  // Fallback to room analysis
  if (room.title?.toLowerCase().includes('puzzle')) return 'puzzle_heavy';
  if (room.description?.toLowerCase().includes('dark')) return 'dark';
  if (room.description?.toLowerCase().includes('stable')) return 'stable';
  if (roomId.includes('glitch')) return 'surreal';
  if (roomId.includes('lattice')) return 'surreal';
  
  return 'neutral';
}

/**
 * Get currently active NPC in a room
 */
export function getActiveNPCInRoom(roomId: string): string | null {
  return activeNPCs.get(roomId) || null;
}

/**
 * Force spawn an NPC in a room (for debugging or story events)
 */
export function forceSpawnNPC(npcId: string, roomId: string): void {
  const npc = wanderingNPCs.find(n => n.id === npcId);
  if (npc) {
    activeNPCs.set(roomId, npcId);
  }
}

/**
 * Force despawn an NPC from a room
 */
export function forceDespawnNPC(roomId: string): void {
  activeNPCs.delete(roomId);
}
