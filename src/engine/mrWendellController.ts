// mrWendellController.ts
// Specialized controller for Mr. Wendell's complex behavior
// (c) 2025 Geoffrey Alan Webster. MIT License

import { LocalGameState } from '../state/gameState';
import { GameAction } from '../types/GameTypes';
import { Room } from '../types/Room';
import { PlayerState } from './npcMemory';

interface WendellState {
  lastSpawnTransition: number;
  transitionsSinceSpawn: number;
  rudenessTriggerCount: number;
  cursedItemTriggerActive: boolean;
  isCurrentlyActive: boolean;
  currentRoomId?: string;
  sparedByPlayer: boolean;
}

let wendellState: WendellState = {
  lastSpawnTransition: 0,
  transitionsSinceSpawn: 0,
  rudenessTriggerCount: 0,
  cursedItemTriggerActive: false,
  isCurrentlyActive: false,
  sparedByPlayer: false
};

/**
 * Evaluate if Mr. Wendell should spawn based on complex conditions
 */
export function evaluateWendellSpawn(
  room: Room,
  gameState: LocalGameState,
  transitionCount: number
): { shouldSpawn: boolean; probability: number; reason: string } {
  
  // Don't spawn in safe rooms
  const safeRooms = [
    'welcome', 'hidden_library', 'cafe', 'prewelcome', 
    'controlnexus', 'lattice_library', 'library'
  ];
  
  const isSafeRoom = safeRooms.some(safe => 
    room.id.toLowerCase().includes(safe.toLowerCase())
  );
  
  if (isSafeRoom) {
    return { shouldSpawn: false, probability: 0, reason: 'Safe room' };
  }
  
  // Don't spawn if already active
  if (wendellState.isCurrentlyActive) {
    return { shouldSpawn: false, probability: 0, reason: 'Already active' };
  }
  
  // Cooldown logic - only appears once per 5 transitions unless triggered
  const transitionsSinceLast = transitionCount - wendellState.lastSpawnTransition;
  if (transitionsSinceLast < 5 && !hasActiveTriggers(gameState)) {
    return { shouldSpawn: false, probability: 0, reason: 'Cooldown active' };
  }
  
  // Check triggers
  const hasRudeness = gameState.flags?.wasRudeToNPC || gameState.flags?.wasRudeRecently;
  const hasCursedItems = checkForCursedItems(gameState);
  
  let probability = 0.05; // Base 5% chance
  let reason = 'Normal wandering';
  
  // Rudeness trigger: 50% for next 3 transitions
  if (hasRudeness && wendellState.rudenessTriggerCount < 3) {
    probability = 0.50;
    reason = 'Player was rude to NPC';
    wendellState.rudenessTriggerCount++;
  }
  
  // Cursed item trigger: 75% chance within 2 transitions
  if (hasCursedItems) {
    probability = Math.max(probability, 0.75);
    reason = 'Player carrying cursed items';
    wendellState.cursedItemTriggerActive = true;
  }
  
  // Both triggers: guaranteed spawn
  if (hasRudeness && hasCursedItems) {
    probability = 1.0;
    reason = 'Multiple triggers active - guaranteed spawn';
  }
  
  // Reset rudeness counter if no longer triggered
  if (!hasRudeness) {
    wendellState.rudenessTriggerCount = 0;
  }
  
  const shouldSpawn = Math.random() < probability;
  
  if (shouldSpawn) {
    wendellState.lastSpawnTransition = transitionCount;
    wendellState.isCurrentlyActive = true;
    wendellState.currentRoomId = room.id;
  }
  
  return { shouldSpawn, probability, reason };
}

/**
 * Check if player has cursed items
 */
function checkForCursedItems(gameState: LocalGameState): boolean {
  const cursedItems = ['cursedcoin', 'doomedscroll', 'cursed_artifact', 'doomed_scroll'];
  return gameState.player.inventory.some((item: any) => 
    cursedItems.includes(item.toLowerCase())
  );
}

/**
 * Check if any triggers are currently active
 */
function hasActiveTriggers(gameState: LocalGameState): boolean {
  const hasRudeness = gameState.flags?.wasRudeToNPC || gameState.flags?.wasRudeRecently;
  const hasCursedItems = checkForCursedItems(gameState);
  
  return hasRudeness || hasCursedItems || wendellState.rudenessTriggerCount > 0;
}

/**
 * Handle player interaction with Mr. Wendell
 */
export function handleWendellInteraction(
  command: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean; result?: 'spared' | 'killed' | 'neutral' } {
  
  if (!wendellState.isCurrentlyActive) {
    return { handled: false };
  }
  
  const lowerCommand = command.toLowerCase().trim();
  
  // Check for polite interaction
  if (lowerCommand.includes('talk to wendell') || 
      lowerCommand.includes('speak to wendell') ||
      lowerCommand.includes('greet wendell')) {
    
    // 10% chance to be spared
    if (Math.random() < 0.1) {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: 'Mr. Wendell: "Manners matter. So few show them. I\'ll let you pass... this once."',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
      
      // Set spared flag and remove Wendell
      dispatch({ type: 'SET_FLAG', payload: { key: 'wendellSpared', value: true } });
      wendellState.isCurrentlyActive = false;
      wendellState.sparedByPlayer = true;
      
      // Unlock achievement for first encounter
      unlockWendellAchievement(dispatch);
      
      return { handled: true, result: 'spared' };
    } else {
      // Normal polite response
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: 'Mr. Wendell: "Curiosity. A fine trait. Often fatal."',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
      
      return { handled: true, result: 'neutral' };
    }
  }
  
  // Check for rude behavior
  const rudeCommands = [
    'call wendell bonehead', 'say rude thing', 'insult wendell', 
    'ignore wendell', 'dismiss wendell', 'tell wendell to go away'
  ];
  
  if (rudeCommands.some(rude => lowerCommand.includes(rude)) ||
      (lowerCommand.includes('wendell') && 
       (lowerCommand.includes('stupid') || lowerCommand.includes('idiot') || 
        lowerCommand.includes('go away') || lowerCommand.includes('leave')))) {
    
    // Trigger death sequence
    triggerWendellDeath(dispatch);
    return { handled: true, result: 'killed' };
  }
  
  return { handled: false };
}

/**
 * Trigger Mr. Wendell's death sequence
 */
function triggerWendellDeath(dispatch: React.Dispatch<GameAction>): void {
  // Eerie warning message
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: 'Mr. Wendell: "That\'s just rude... I\'m going to eat you now."',
      type: 'narrative',
      timestamp: Date.now()
    }
  });
  
  // Atmospheric death approach
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'You feel the air chill. Mr. Wendell smiles. Polite to the end.',
        type: 'system',
        timestamp: Date.now()
      }
    });
    
    // Trigger actual death after a moment
    setTimeout(() => {
      dispatch({ type: 'DAMAGE_PLAYER', payload: 1000 }); // Instant death
      dispatch({ type: 'SET_FLAG', payload: { key: 'deathCause', value: 'Mr. Wendell' } });
      
      // Increment Wendell death counter
      const currentDeaths = 0; // TODO: Get from game state
      dispatch({ type: 'SET_FLAG', payload: { key: 'deathsFromWendell', value: currentDeaths + 1 } });
      
      // Reset Wendell state
      wendellState.isCurrentlyActive = false;
      
      // Unlock achievement
      unlockWendellAchievement(dispatch);
      
    }, 1000);
  }, 1500);
}

/**
 * Remove Mr. Wendell from current room
 */
export function removeWendellFromRoom(dispatch: React.Dispatch<GameAction>): void {
  if (wendellState.isCurrentlyActive) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'Mr. Wendell fades back into the darkness with an almost imperceptible nod.',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    
    wendellState.isCurrentlyActive = false;
    wendellState.currentRoomId = undefined;
  }
}

/**
 * Check if Mr. Wendell is currently in a room
 */
export function isWendellActive(): boolean {
  return wendellState.isCurrentlyActive;
}

/**
 * Get Mr. Wendell's current room
 */
export function getWendellRoom(): string | undefined {
  return wendellState.currentRoomId;
}

/**
 * Reset Mr. Wendell state (for new game/reset)
 */
export function resetWendellState(): void {
  wendellState = {
    lastSpawnTransition: 0,
    transitionsSinceSpawn: 0,
    rudenessTriggerCount: 0,
    cursedItemTriggerActive: false,
    isCurrentlyActive: false,
    sparedByPlayer: false
  };
}

/**
 * Handle room transitions for Mr. Wendell's tracking
 */
export function onRoomTransition(newRoom: Room, gameState: LocalGameState): void {
  wendellState.transitionsSinceSpawn++;
  
  // Reset cursed item trigger after 2 transitions if no longer carrying cursed items
  if (wendellState.cursedItemTriggerActive && wendellState.transitionsSinceSpawn >= 2) {
    if (!checkForCursedItems(gameState)) {
      wendellState.cursedItemTriggerActive = false;
    }
  }
  
  // Reset rudeness trigger after 3 transitions
  if (wendellState.rudenessTriggerCount > 0 && wendellState.transitionsSinceSpawn >= 3) {
    if (!gameState.flags?.wasRudeToNPC && !gameState.flags?.wasRudeRecently) {
      wendellState.rudenessTriggerCount = 0;
    }
  }
}

/**
 * Unlock Mr. Wendell related achievement
 */
function unlockWendellAchievement(dispatch: React.Dispatch<GameAction>): void {
  // Import the achievement function
  import('../logic/achievementEngine').then(({ unlockAchievement }) => {
    unlockAchievement('wendell_encounter');
  });
}
