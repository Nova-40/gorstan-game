// wanderingNPCController.ts
// Main controller for dynamic wandering NPC system
// (c) 2025 Geoffrey Alan Webster. MIT License

import { LocalGameState } from '../state/gameState';
import { GameAction } from '../types/GameTypes';
import { Room } from '../types/Room';
import { 
  WanderingNPC, 
  wanderingNPCs, 
  evaluateNPCSpawning,
  getActiveNPCInRoom,
  forceSpawnNPC,
  forceDespawnNPC
} from './npcSpawner';
import { 
  getWanderingNPCResponse, 
  getWanderingNPCIdleLine,
  getNPCInteractionLine 
} from './wanderingNPCDialogue';
import { PlayerState, NPCState } from './npcMemory';
import { evaluateWendellSpawn, handleWendellInteraction, isWendellActive, onRoomTransition } from './mrWendellController';
import { 
  evaluateLibrarianSpawn, 
  spawnLibrarian, 
  handleLibrarianInteraction, 
  isLibrarianActive,
  getLibrarianRoom 
} from './librarianController';

interface ActiveWanderingNPC {
  npcId: string;
  roomId: string;
  spawnTime: number;
  lastInteraction?: number;
  mood?: string;
  flags?: Record<string, any>;
}

interface WanderingNPCState {
  activeNPCs: ActiveWanderingNPC[];
  lastRoomCheck: number;
  globalCooldowns: Record<string, number>;
}

let wanderingNPCState: WanderingNPCState = {
  activeNPCs: [],
  lastRoomCheck: 0,
  globalCooldowns: {}
};

// Global transition counter for Mr. Wendell's logic
let globalTransitionCount = 0;

/**
 * Initialize wandering NPC system
 */
export function initializeWanderingNPCs(dispatch: React.Dispatch<GameAction>): void {
  console.log('[WanderingNPC] System initialized');
  
  // Set up periodic NPC evaluation
  setInterval(() => {
    evaluateWanderingNPCs(dispatch);
  }, 30000); // Check every 30 seconds
  
  // Set up NPC movement/departure
  setInterval(() => {
    processNPCMovement(dispatch);
  }, 60000); // Process movement every minute
}

/**
 * Generate a deterministic pseudo-random number based on room ID and game seed
 */
function getDeterministicRandom(roomId: string, gameState: LocalGameState): number {
  // Create a simple hash from room ID and game state for deterministic randomness
  const seed = gameState.player.name + roomId + (gameState.player.visitedRooms?.length || 0);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert hash to number between 0 and 1
  return Math.abs(hash) / 2147483647;
}

/**
 * Evaluate NPC hierarchy and encounter sequences
 */
function evaluateNPCEncounter(
  room: Room,
  gameState: LocalGameState,
  random: number
): { npcs: WanderingNPC[]; isMultiNPC: boolean; encounterType: string } {
  
  // Ayla owns the game - highest priority
  const aylaChance = 0.15; // 15% base chance for Ayla
  if (random < aylaChance) {
    const ayla = wanderingNPCs.find(npc => npc.id === 'ayla');
    if (ayla) {
      return { npcs: [ayla], isMultiNPC: false, encounterType: 'ayla_dominant' };
    }
  }
  
  // Multi-NPC encounter sequences (10% chance)
  const multiNPCChance = 0.10;
  if (random >= aylaChance && random < aylaChance + multiNPCChance) {
    return evaluateMultiNPCEncounter(room, gameState, random);
  }
  
  // Single NPC encounters - evaluate by priority
  const availableNPCs = wanderingNPCs
    .filter(npc => npc.id !== 'ayla') // Ayla handled separately
    .filter(npc => npc.id !== 'mr_wendell' && npc.id !== 'librarian') // Special NPCs handled separately
    .sort((a, b) => b.personality.priority - a.personality.priority); // Sort by priority descending
  
  for (const npc of availableNPCs) {
    // Check spawn conditions and zone preferences
    if (evaluateNPCSpawnConditions(npc, room, gameState)) {
      return { npcs: [npc], isMultiNPC: false, encounterType: 'single_npc' };
    }
  }
  
  return { npcs: [], isMultiNPC: false, encounterType: 'none' };
}

/**
 * Evaluate multi-NPC encounter sequences
 */
function evaluateMultiNPCEncounter(
  room: Room,
  gameState: LocalGameState,
  random: number
): { npcs: WanderingNPC[]; isMultiNPC: boolean; encounterType: string } {
  
  // Define encounter sequences based on narrative tension
  const encounterSequences = [
    {
      type: 'tension_trio',
      npcs: ['morthos', 'polly', 'albie'],
      condition: () => gameState.flags?.emotional_trigger === true,
      chance: 0.3
    },
    {
      type: 'helper_duo',
      npcs: ['al_escape_artist', 'albie'],
      condition: () => (gameState.player.visitedRooms?.length || 0) > 10,
      chance: 0.4
    },
    {
      type: 'philosophical_pair',
      npcs: ['dominic_wandering', 'morthos'],
      condition: () => gameState.flags?.moral_choice_made === true,
      chance: 0.25
    },
    {
      type: 'wildcard_chaos',
      npcs: ['polly', 'dominic_wandering'],
      condition: () => gameState.flags?.dominic_taken === false,
      chance: 0.15
    }
  ];
  
  // Select an encounter sequence that meets conditions
  for (const sequence of encounterSequences) {
    if (sequence.condition() && random < sequence.chance) {
      const npcs = sequence.npcs
        .map(id => wanderingNPCs.find(npc => npc.id === id))
        .filter(npc => npc !== undefined) as WanderingNPC[];
      
      if (npcs.length >= 2) {
        return { npcs, isMultiNPC: true, encounterType: sequence.type };
      }
    }
  }
  
  return { npcs: [], isMultiNPC: false, encounterType: 'none' };
}

/**
 * Check if an NPC meets spawn conditions for the current room/state
 */
function evaluateNPCSpawnConditions(
  npc: WanderingNPC,
  room: Room,
  gameState: LocalGameState
): boolean {
  
  // Check zone preferences
  const roomZone = determineRoomZone(room.id);
  if (npc.zonePreferences.length > 0 && !npc.zonePreferences.includes(roomZone)) {
    return false;
  }
  
  // Check spawn conditions
  for (const condition of npc.spawnConditions) {
    if (!evaluateSpawnCondition(condition, room, gameState)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Determine which zone a room belongs to based on its ID
 */
function determineRoomZone(roomId: string): string {
  if (roomId.includes('lattice')) return 'lattice';
  if (roomId.includes('london')) return 'london';
  if (roomId.includes('intro')) return 'intro';
  if (roomId.includes('glitch')) return 'glitch';
  if (roomId.includes('stanton')) return 'stanton';
  if (roomId.includes('elfhame')) return 'elfhame';
  if (roomId.includes('library')) return 'library_rooms';
  if (roomId.includes('hub')) return 'hub';
  return 'other';
}

/**
 * Evaluate a single spawn condition
 */
function evaluateSpawnCondition(
  condition: any,
  room: Room,
  gameState: LocalGameState
): boolean {
  
  switch (condition.type) {
    case 'flag':
      return gameState.flags?.[condition.key] === condition.value;
    
    case 'inventory':
      const hasItem = gameState.player.inventory.includes(condition.key);
      return condition.operator === 'not_contains' ? !hasItem : hasItem;
    
    case 'room_count':
      const visitedCount = gameState.player.visitedRooms?.length || 0;
      return condition.operator === 'greater' ? visitedCount > condition.value : visitedCount === condition.value;
    
    case 'zone':
      const roomZone = determineRoomZone(room.id);
      return roomZone === condition.value;
    
    case 'random':
      return true; // Always passes for random spawns
    
    default:
      return true;
  }
}

/**
 * Main evaluation function for spawning/managing wandering NPCs
 */
function evaluateWanderingNPCs(dispatch: React.Dispatch<GameAction>): void {
  const now = Date.now();
  
  // Skip if evaluated too recently
  if (now - wanderingNPCState.lastRoomCheck < 15000) return;
  wanderingNPCState.lastRoomCheck = now;
  
  // Get current game state (would need to be passed in or accessed differently)
  // For now, we'll trigger this from room changes
}

/**
 * Handle NPC spawning when player enters a room
 * Implements 45% chance for NPC encounters with hierarchical spawning
 */
export function handleRoomEntryForWanderingNPCs(
  room: Room,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): void {
  const now = Date.now();
  globalTransitionCount++;
  
  // Handle Mr. Wendell's room transition tracking
  onRoomTransition(room, gameState);
  
  // Rate limiting - only check every 2 seconds
  if (now - wanderingNPCState.lastRoomCheck < 2000) {
    return;
  }
  wanderingNPCState.lastRoomCheck = now;
  
  // Clear cooldowns that have expired
  for (const [npcId, cooldownTime] of Object.entries(wanderingNPCState.globalCooldowns)) {
    if (now >= cooldownTime) {
      delete wanderingNPCState.globalCooldowns[npcId];
    }
  }
  
  // Remove any existing wandering NPCs from this room first
  wanderingNPCState.activeNPCs = wanderingNPCState.activeNPCs
    .filter(active => active.roomId !== room.id);
  
  // Check for Mr. Wendell spawn first (highest priority, overrides 45% system)
  if (!isWendellActive()) {
    const wendellEval = evaluateWendellSpawn(room, gameState, globalTransitionCount);
    
    if (wendellEval.shouldSpawn) {
      const wendellNPC = wanderingNPCs.find(npc => npc.id === 'mr_wendell');
      if (wendellNPC) {
        spawnWanderingNPC(wendellNPC, room.id, dispatch);
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: `[Debug: Wendell spawned - ${wendellEval.reason} (${Math.round(wendellEval.probability * 100)}% chance)]`,
            type: 'system',
            timestamp: now
          }
        });
        
        return; // Mr. Wendell displaces all other NPCs
      }
    }
  }
  
  // If Mr. Wendell is active, don't spawn other NPCs unless it's the Librarian in a library
  if (isWendellActive()) {
    const librarianEval = evaluateLibrarianSpawn(room, gameState);
    if (librarianEval.shouldSpawn) {
      const wendellNPC = wanderingNPCs.find(npc => npc.id === 'mr_wendell');
      if (wendellNPC) {
        despawnWanderingNPC('mr_wendell', room.id, dispatch);
      }
      spawnLibrarian(room, gameState, dispatch);
    }
    return;
  }
  
  // Check for Librarian spawn (high priority in library rooms, overrides 45% system)
  if (!isLibrarianActive()) {
    const librarianEval = evaluateLibrarianSpawn(room, gameState);
    
    if (librarianEval.shouldSpawn) {
      spawnLibrarian(room, gameState, dispatch);
      return; // Librarian displaces other NPCs in libraries
    }
  }
  
  // Main 45% NPC encounter system
  const random = getDeterministicRandom(room.id, gameState);
  const encounterChance = 0.45; // 45% chance for NPC encounter
  
  if (random < encounterChance) {
    // Normalize random for encounter evaluation (0-1 within the 45% range)
    const encounterRandom = random / encounterChance;
    const encounter = evaluateNPCEncounter(room, gameState, encounterRandom);
    
    if (encounter.npcs.length > 0) {
      // Spawn the NPC(s)
      for (const npc of encounter.npcs) {
        spawnWanderingNPC(npc, room.id, dispatch);
      }
      
      // Add encounter message
      if (encounter.isMultiNPC) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: `Multiple figures emerge from the shadows - a ${encounter.encounterType} unfolds.`,
            type: 'narrative',
            timestamp: now
          }
        });
      }
    }
  }
}

/**
 * Spawn a wandering NPC in a room
 */
function spawnWanderingNPC(
  npc: WanderingNPC,
  roomId: string,
  dispatch: React.Dispatch<GameAction>
): void {
  const now = Date.now();
  
  // Add to active NPCs
  wanderingNPCState.activeNPCs.push({
    npcId: npc.id,
    roomId: roomId,
    spawnTime: now,
    mood: 'neutral'
  });
  
  // Send spawn message to terminal
  const spawnMessage = getWanderingNPCSpawnMessage(npc);
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: spawnMessage,
      type: 'narrative',
      timestamp: now
    }
  });
  
  console.log(`[WanderingNPC] Spawned ${npc.name} in ${roomId}`);
}

/**
 * Remove a wandering NPC from the game
 */
function despawnWanderingNPC(
  npcId: string,
  roomId: string,
  dispatch: React.Dispatch<GameAction>
): void {
  const now = Date.now();
  
  // Remove from active NPCs
  wanderingNPCState.activeNPCs = wanderingNPCState.activeNPCs
    .filter(active => !(active.npcId === npcId && active.roomId === roomId));
  
  // Set cooldown
  const npc = wanderingNPCs.find((n: WanderingNPC) => n.id === npcId);
  if (npc) {
    wanderingNPCState.globalCooldowns[npcId] = now + (60 * 60 * 1000); // 1 hour cooldown
    
    // Send departure message
    const departureMessage = getWanderingNPCDepartureMessage(npc);
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: departureMessage,
        type: 'narrative',
        timestamp: now
      }
    });
  }
  
  console.log(`[WanderingNPC] Despawned ${npcId} from ${roomId}`);
}

/**
 * Process NPC movement and departures
 */
function processNPCMovement(dispatch: React.Dispatch<GameAction>): void {
  const now = Date.now();
  
  // Check for NPCs that should depart
  const toRemove: ActiveWanderingNPC[] = [];
  
  for (const activeNPC of wanderingNPCState.activeNPCs) {
    const npc = wanderingNPCs.find((n: WanderingNPC) => n.id === activeNPC.npcId);
    if (!npc) continue;
    
    const timeInRoom = now - activeNPC.spawnTime;
    const maxStayTime = 10 * 60 * 1000; // 10 minutes default
    
    // Check if NPC should leave
    if (timeInRoom > maxStayTime) {
      toRemove.push(activeNPC);
    }
    
    // Check for random departure chance
    else if (Math.random() < 0.1) { // 10% chance per check
      toRemove.push(activeNPC);
    }
  }
  
  // Remove NPCs that should depart
  for (const npc of toRemove) {
    despawnWanderingNPC(npc.npcId, npc.roomId, dispatch);
  }
}

/**
 * Handle player interaction with wandering NPC
 */
export function handleWanderingNPCInteraction(
  npcId: string,
  topic: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): void {
  const now = Date.now();
  
  // Special handling for Mr. Wendell
  if (npcId === 'mr_wendell') {
    const wendellResult = handleWendellInteraction(topic, gameState, dispatch);
    if (wendellResult.handled) {
      return;
    }
  }
  
  // Special handling for the Librarian
  if (npcId === 'librarian' || topic.toLowerCase().includes('librarian')) {
    const librarianResult = handleLibrarianInteraction(topic, gameState, dispatch);
    if (librarianResult.handled) {
      return;
    }
  }
  
  const activeNPC = wanderingNPCState.activeNPCs.find(npc => npc.npcId === npcId);
  
  if (!activeNPC) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "That person seems to have wandered off.",
        type: 'system',
        timestamp: now
      }
    });
    return;
  }
  
  const npc = wanderingNPCs.find((n: WanderingNPC) => n.id === npcId);
  if (!npc) return;
  
  const playerState: PlayerState = {
    name: gameState.player.name || 'Player',
    currentRoom: gameState.currentRoomId || '',
    inventory: gameState.player.inventory,
    flags: gameState.flags || {},
    visitedRooms: gameState.player.visitedRooms || [],
    achievements: [] // TODO: Add achievements when available
  };
  
  const npcState: NPCState = {
    mood: 'neutral',
    memory: [],
    queryCount: 0,
    trustLevel: 0,
    lastInteraction: now,
    relationship: 'stranger',
    personalityTraits: npc.personality.traits || []
  };
  
  // Get response from dialogue system
  const response = getWanderingNPCResponse(npcId, topic, playerState, npcState);
  
  // Update last interaction time
  activeNPC.lastInteraction = now;
  
  // Send response to terminal
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: `${npc.name}: ${response}`,
      type: 'narrative',
      timestamp: now
    }
  });
}

/**
 * Get list of wandering NPCs in current room
 */
export function getWanderingNPCsInRoom(roomId: string): WanderingNPC[] {
  return wanderingNPCState.activeNPCs
    .filter(active => active.roomId === roomId)
    .map(active => wanderingNPCs.find((npc: WanderingNPC) => npc.id === active.npcId))
    .filter(Boolean) as WanderingNPC[];
}

/**
 * Get spawn message for NPC
 */
function getWanderingNPCSpawnMessage(npc: WanderingNPC): string {
  if (npc.entryLine) {
    return npc.entryLine;
  }
  
  const messages = [
    `${npc.name} wanders into the area.`,
    `You notice ${npc.name} has appeared nearby.`,
    `${npc.name} emerges from elsewhere in the multiverse.`,
    `A familiar figure approaches - it's ${npc.name}.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get departure message for NPC
 */
function getWanderingNPCDepartureMessage(npc: WanderingNPC): string {
  if (npc.exitLine) {
    return npc.exitLine;
  }
  
  const messages = [
    `${npc.name} wanders off to parts unknown.`,
    `${npc.name} fades back into the multiverse.`,
    `${npc.name} decides to explore elsewhere.`,
    `With a final look around, ${npc.name} departs.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Add idle NPC behaviors to room descriptions
 */
export function addWanderingNPCIdleLines(
  roomId: string,
  dispatch: React.Dispatch<GameAction>
): void {
  const npcsInRoom = getWanderingNPCsInRoom(roomId);
  
  for (const npc of npcsInRoom) {
    if (Math.random() < 0.3) { // 30% chance for idle line
      const idleLine = getWanderingNPCIdleLine(npc.id, {
        name: 'Player',
        currentRoom: roomId,
        inventory: [],
        flags: {},
        visitedRooms: [],
        achievements: []
      });
      
      if (idleLine) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: idleLine,
            type: 'narrative',
            timestamp: Date.now()
          }
        });
      }
    }
  }
}

/**
 * Handle room exit - chance for NPCs to interact or comment
 */
export function handleRoomExitForWanderingNPCs(
  roomId: string,
  dispatch: React.Dispatch<GameAction>
): void {
  const npcsInRoom = getWanderingNPCsInRoom(roomId);
  
  for (const npc of npcsInRoom) {
    if (Math.random() < 0.2) { // 20% chance for departure comment
      const comment = getWanderingNPCResponse(npc.id, 'goodbye', 
        { name: 'Player', currentRoom: roomId, inventory: [], flags: {}, visitedRooms: [], achievements: [] },
        { mood: 'neutral', memory: [], queryCount: 0, trustLevel: 0, relationship: 'stranger', personalityTraits: npc.personality.traits || [] }
      );
      
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: `${npc.name}: ${comment}`,
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }
  }
}

/**
 * Debug function to force spawn NPC
 */
export function debugSpawnWanderingNPC(
  npcId: string,
  roomId: string,
  dispatch: React.Dispatch<GameAction>
): boolean {
  const npc = wanderingNPCs.find((n: WanderingNPC) => n.id === npcId);
  if (!npc) {
    console.log(`[WanderingNPC] Debug: NPC ${npcId} not found`);
    return false;
  }
  
  spawnWanderingNPC(npc, roomId, dispatch);
  return true;
}

/**
 * Debug function to list all active wandering NPCs
 */
export function debugListActiveWanderingNPCs(): void {
  console.log('[WanderingNPC] Active NPCs:', wanderingNPCState.activeNPCs);
  console.log('[WanderingNPC] Cooldowns:', wanderingNPCState.globalCooldowns);
}
