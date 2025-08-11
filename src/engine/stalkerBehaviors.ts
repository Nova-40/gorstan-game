// src/engine/stalkerBehaviors.ts
// Enhanced stalking AI for Mr. Wendell and Polly
// Gorstan Game Beta 1 - Code License MIT

import type { GameAction } from '../types/GameTypes';
import type { LocalGameState } from '../state/gameState';
import type { Dispatch } from 'react';
import { npcRegistry } from '../npcs/npcMemory';

interface StalkerState {
  target: string;
  lastSeenRoom: string;
  stalkerRoom: string;
  followDelay: number;
  intensity: number;
  messages: string[];
  cooldown: number;
  lastMessageTime: number;
}

const stalkerStates = new Map<string, StalkerState>();

// Get or create stalker state
function getStalkerState(npcId: string, playerId: string): StalkerState {
  const key = `${npcId}_${playerId}`;
  if (!stalkerStates.has(key)) {
    stalkerStates.set(key, {
      target: playerId,
      lastSeenRoom: '',
      stalkerRoom: '',
      followDelay: 3000, // 3 seconds default
      intensity: 1,
      messages: [],
      cooldown: 15000, // 15 seconds between messages
      lastMessageTime: 0
    });
  }
  return stalkerStates.get(key)!;
}

// Mr. Wendell stalking behavior - systematic and patient
export function handleWendellStalking(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  const wendell = npcRegistry.get('mrwendell') || npcRegistry.get('mr_wendell');
  if (!wendell) return;
  
  const playerId = state.player?.name || 'Player';
  const stalkerState = getStalkerState('wendell', playerId);
  const currentTime = Date.now();
  
  // Check if Wendell should start stalking (triggered by player behavior)
  const shouldStalk = checkWendellStalkingTriggers(state);
  
  if (!shouldStalk) return;
  
  // Update Wendell's position to follow player with delay
  if (state.currentRoomId !== stalkerState.lastSeenRoom) {
    stalkerState.lastSeenRoom = state.currentRoomId;
    
    // Wendell follows after a delay, always staying one room behind
    setTimeout(() => {
      if (wendell.currentRoom !== stalkerState.lastSeenRoom) {
        const previousRoom = wendell.currentRoom;
        wendell.currentRoom = stalkerState.lastSeenRoom;
        
        console.log(`[STALKER] Mr. Wendell moved from ${previousRoom} to ${wendell.currentRoom} (following player trail)`);
        
        // Chance for ominous message when Wendell moves
        if (Math.random() < 0.3 && currentTime - stalkerState.lastMessageTime > stalkerState.cooldown) {
          const stalkerMessage = getWendellStalkerMessage(stalkerState.intensity);
          
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: stalkerMessage,
              type: 'system',
              timestamp: currentTime
            }
          });
          
          stalkerState.lastMessageTime = currentTime;
          stalkerState.intensity = Math.min(stalkerState.intensity + 0.1, 3);
        }
      }
    }, stalkerState.followDelay);
  }
  
  // Wendell occasionally appears in the same room as player (rare, dramatic)
  if (Math.random() < 0.05 && currentTime - stalkerState.lastMessageTime > stalkerState.cooldown * 2) {
    wendell.currentRoom = state.currentRoomId;
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "*You sense a presence behind you. When you turn, Mr. Wendell is there, smiling politely. He wasn't there a moment ago.*",
        type: 'system',
        timestamp: currentTime
      }
    });
    
    // Update NPCs in room to include Wendell
    const currentNPCs = state.npcsInRoom || [];
    if (!currentNPCs.some(npc => npc.id === wendell.id)) {
      dispatch({
        type: 'SET_NPCS_IN_ROOM',
        payload: [...currentNPCs, wendell]
      });
    }
    
    stalkerState.lastMessageTime = currentTime;
    stalkerState.intensity = Math.min(stalkerState.intensity + 0.5, 3);
  }
}

// Polly stalking behavior - chaotic and vengeful (if Dominic is dead)
export function handlePollyStalking(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  const polly = npcRegistry.get('polly');
  if (!polly) return;
  
  // Only stalk if Dominic is dead
  if (!state.flags?.dominicIsDead && !state.flags?.dominicTakenAfterWarning) return;
  
  const playerId = state.player?.name || 'Player';
  const stalkerState = getStalkerState('polly', playerId);
  const currentTime = Date.now();
  
  // Polly follows more aggressively than Wendell
  stalkerState.followDelay = 1500; // Faster following
  stalkerState.cooldown = 8000; // More frequent messages
  
  // Update Polly's position - she follows more directly
  if (state.currentRoomId !== stalkerState.lastSeenRoom) {
    stalkerState.lastSeenRoom = state.currentRoomId;
    
    // Polly follows quickly, sometimes appearing in the same room
    setTimeout(() => {
      const shouldAppearInSameRoom = Math.random() < 0.4; // 40% chance
      const targetRoom = shouldAppearInSameRoom ? state.currentRoomId : stalkerState.lastSeenRoom;
      
      if (polly.currentRoom !== targetRoom) {
        const previousRoom = polly.currentRoom;
        polly.currentRoom = targetRoom;
        
        console.log(`[STALKER] Polly moved from ${previousRoom} to ${polly.currentRoom} (vengeful stalking)`);
        
        // Message when Polly appears
        if (shouldAppearInSameRoom && currentTime - stalkerState.lastMessageTime > stalkerState.cooldown) {
          const stalkerMessage = getPollyStalkerMessage(stalkerState.intensity);
          
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: stalkerMessage,
              type: 'system',
              timestamp: currentTime
            }
          });
          
          // Update NPCs in room to include Polly
          const currentNPCs = state.npcsInRoom || [];
          if (!currentNPCs.some(npc => npc.id === polly.id)) {
            dispatch({
              type: 'SET_NPCS_IN_ROOM',
              payload: [...currentNPCs, polly]
            });
          }
          
          stalkerState.lastMessageTime = currentTime;
          stalkerState.intensity = Math.min(stalkerState.intensity + 0.3, 5);
        }
      }
    }, stalkerState.followDelay);
  }
  
  // Escalating behavior as intensity increases
  if (stalkerState.intensity >= 3 && Math.random() < 0.1) {
    handlePollyEscalation(state, dispatch, stalkerState);
  }
}

// Check triggers for Wendell stalking behavior
function checkWendellStalkingTriggers(state: LocalGameState): boolean {
  const flags = state.flags || {};
  
  // Wendell stalks if player has been rude to NPCs
  if (flags.rudeToNPCs) return true;
  
  // Wendell stalks if player has taken cursed items
  const inventory = state.player?.inventory || [];
  const cursedItems = ['cursed_ring', 'haunted_mirror', 'death_coin'];
  if (cursedItems.some(item => inventory.includes(item))) return true;
  
  // Wendell stalks if player has killed or harmed NPCs
  if (flags.dominicIsDead || flags.npcKilled) return true;
  
  // Wendell stalks if player has made too many dark choices
  const darkChoices = (flags.darkChoiceCount || 0);
  if (darkChoices >= 3) return true;
  
  return false;
}

// Get escalating Wendell stalker messages
function getWendellStalkerMessage(intensity: number): string {
  const messages = {
    low: [
      "*You catch a glimpse of a well-dressed figure in your peripheral vision.*",
      "*The sound of polite footsteps echoes behind you, always at the same distance.*",
      "*A familiar scent of old books and lavender lingers in the air.*"
    ],
    medium: [
      "*Mr. Wendell's silhouette appears briefly in doorways you've already passed.*",
      "*You hear the faint sound of pages turning, though no one else is around.*",
      "*The temperature drops slightly, and you sense patient, watchful eyes.*"
    ],
    high: [
      "*Mr. Wendell is always exactly where you just were, watching with that polite smile.*",
      "*Reality seems to bend slightly around Mr. Wendell's presence. He's closer than he should be.*",
      "*The shadows whisper Mr. Wendell's name, and he whispers yours in return.*"
    ]
  };
  
  let category: keyof typeof messages;
  if (intensity < 1.5) category = 'low';
  else if (intensity < 2.5) category = 'medium';
  else category = 'high';
  
  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

// Get escalating Polly stalker messages
function getPollyStalkerMessage(intensity: number): string {
  const messages = {
    low: [
      "*Polly steps out from behind a corner, her eyes filled with accusation.*",
      "\"I know what you did,\" *Polly whispers from the shadows.*",
      "*Polly appears, holding something that might have been Dominic's favorite toy.*"
    ],
    medium: [
      "*Polly blocks your path, her grief transformed into cold anger.*",
      "\"He trusted you,\" *Polly says, her voice breaking.* \"And you killed him.\"",
      "*Polly's presence fills the room with tangible sorrow and rage.*"
    ],
    high: [
      "*Polly materializes inches from your face, her eyes burning with vengeance.*",
      "\"You will pay for what you did to Dominic,\" *Polly snarls, reality crackling around her.*",
      "*The air itself seems angry. Polly is everywhere and nowhere, her grief made manifest.*"
    ]
  };
  
  let category: keyof typeof messages;
  if (intensity < 2) category = 'low';
  else if (intensity < 3.5) category = 'medium';
  else category = 'high';
  
  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

// Handle Polly's escalating behavior
function handlePollyEscalation(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>,
  stalkerState: StalkerState
): void {
  const escalations = [
    "The lights flicker as Polly's anger grows stronger.",
    "Objects in the room shift slightly when you're not looking directly at them.",
    "You hear Dominic's name whispered in empty rooms.",
    "The air grows thick with the weight of Polly's grief and rage.",
    "Reality bends around Polly's presence. This won't end well."
  ];
  
  const message = escalations[Math.floor(Math.random() * escalations.length)];
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: message,
      type: 'system',
      timestamp: Date.now()
    }
  });
  
  // Set escalation flags
  dispatch({ type: 'SET_FLAG', payload: { flag: 'pollyVengeanceEscalating', value: true } });
  dispatch({ type: 'SET_FLAG', payload: { flag: 'pollyIntensity', value: stalkerState.intensity } });
}

// Main stalker update function to be called periodically
export function updateStalkerBehaviors(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  handleWendellStalking(state, dispatch);
  handlePollyStalking(state, dispatch);
}

// Initialize stalking systems
export function initializeStalkerBehaviors(): void {
  console.log('[STALKER] Stalker behavior systems initialized');
  
  // Clear any existing stalker states on game restart
  stalkerStates.clear();
}
