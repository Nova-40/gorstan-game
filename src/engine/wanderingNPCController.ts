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
  
  // Check for Mr. Wendell spawn first (highest priority)
  if (!isWendellActive()) {
    const wendellEval = evaluateWendellSpawn(room, gameState, globalTransitionCount);
    
    if (wendellEval.shouldSpawn) {
      const wendellNPC = wanderingNPCs.find(npc => npc.id === 'mr_wendell');
      if (wendellNPC) {
        spawnWanderingNPC(wendellNPC, room.id, dispatch);
        
        // Add context message about the spawn reason
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
    // Check if this is a library room and allow Librarian to displace Wendell there
    const librarianEval = evaluateLibrarianSpawn(room, gameState);
    if (librarianEval.shouldSpawn) {
      // Force despawn Wendell temporarily
      const wendellNPC = wanderingNPCs.find(npc => npc.id === 'mr_wendell');
      if (wendellNPC) {
        despawnWanderingNPC('mr_wendell', room.id, dispatch);
      }
      
      spawnLibrarian(room, gameState, dispatch);
    }
    return;
  }
  
  // Check for Librarian spawn (high priority in library rooms)
  if (!isLibrarianActive()) {
    const librarianEval = evaluateLibrarianSpawn(room, gameState);
    
    if (librarianEval.shouldSpawn) {
      spawnLibrarian(room, gameState, dispatch);
      return; // Librarian displaces other NPCs in libraries
    }
  }
  
  // Create player state from game state
  const playerState: PlayerState = {
    name: gameState.player.name || 'Player',
    currentRoom: room.id,
    inventory: gameState.player.inventory,
    flags: gameState.flags || {},
    visitedRooms: gameState.player.visitedRooms || [],
    achievements: [] // TODO: Add achievements when available
  };
  
  // Evaluate spawning using the existing spawner (excluding special NPCs)
  const result = evaluateNPCSpawning(room.id, room, playerState, {});
  
  if (result.spawn && result.spawn.id !== 'mr_wendell' && result.spawn.id !== 'librarian') {
    spawnWanderingNPC(result.spawn, room.id, dispatch);
  }
  
  if (result.despawn) {
    despawnWanderingNPC(result.despawn, room.id, dispatch);
  }
  
  // Send any messages from the evaluation
  for (const message of result.messages) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: message,
        type: 'narrative',
        timestamp: now
      }
    });
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
