// src/engine/dominicPickupConversation.ts
// Enhanced Dominic conversation system for pickup attempts
// Gorstan Game Beta 1 - Code License MIT

import type { GameAction } from '../types/GameTypes';
import type { LocalGameState } from '../state/gameState';
import type { Dispatch } from 'react';

interface PickupConversationState {
  attempts: number;
  warnings: number;
  lastAttemptTime: number;
  hasBeenWarned: boolean;
  playerInsisted: boolean;
}

// Track Dominic pickup conversation state
const conversationStates = new Map<string, PickupConversationState>();

export function getPickupConversationState(playerId: string): PickupConversationState {
  if (!conversationStates.has(playerId)) {
    conversationStates.set(playerId, {
      attempts: 0,
      warnings: 0,
      lastAttemptTime: 0,
      hasBeenWarned: false,
      playerInsisted: false
    });
  }
  return conversationStates.get(playerId)!;
}

export function handleDominicPickupAttempt(
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
): boolean {
  const playerId = state.player?.name || 'Player';
  const convState = getPickupConversationState(playerId);
  const now = Date.now();
  
  // Check if this is in Dale's apartment
  if (state.currentRoomId !== 'dalesapartment') {
    return false; // Normal pickup behavior for wandering Dominic
  }
  
  convState.attempts++;
  convState.lastAttemptTime = now;
  
  // First attempt - gentle discouragement
  if (convState.attempts === 1) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "🐟 As you reach for Dominic, he swims to the far side of his tank and looks at you with intelligent, worried eyes.",
        type: 'system',
        timestamp: now
      }
    });
    
    // Trigger Dominic conversation
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          text: "*DOMINIC speaks in a voice only you can hear* \"Please... I'm safe here. Taking me from my tank would be... unpleasant for both of us.\"",
          type: 'npc',
          timestamp: now + 1000
        }
      });
    }, 1500);
    
    return true; // Prevent pickup
  }
  
  // Second attempt - more urgent
  if (convState.attempts === 2) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "🐟 Dominic swims frantically as you approach again, his distress clearly visible.",
        type: 'system',
        timestamp: now
      }
    });
    
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          text: "*DOMINIC's voice grows more desperate* \"Listen to me carefully - I've been through this before. It never ends well. There are consequences to taking me from this place.\"",
          type: 'npc',
          timestamp: now + 1000
        }
      });
    }, 1500);
    
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 2).toString(),
          text: "*DOMINIC continues* \"I'm not just a pet. I'm... aware. And I'm telling you: leave me be. For both our sakes.\"",
          type: 'npc',
          timestamp: now + 3000
        }
      });
    }, 3500);
    
    convState.hasBeenWarned = true;
    return true; // Prevent pickup
  }
  
  // Third attempt - final warning
  if (convState.attempts === 3 && !convState.playerInsisted) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "🐟 Despite his previous warnings, you reach for Dominic once more. He stops swimming and fixes you with a steady, knowing gaze.",
        type: 'system',
        timestamp: now
      }
    });
    
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          text: "*DOMINIC's voice is sad but resolute* \"I see. You're determined to ignore my warnings. Very well... but know this: taking me will mark you. Others will know what you've done. Polly will know.\"",
          type: 'npc',
          timestamp: now + 1000
        }
      });
    }, 1500);
    
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 2).toString(),
          text: "*DOMINIC's voice drops to a whisper* \"If you truly insist on this path, try once more. But remember - I warned you. The guilt is yours to carry.\"",
          type: 'npc',
          timestamp: now + 3500
        }
      });
    }, 4000);
    
    convState.playerInsisted = true;
    return true; // Prevent pickup, but next attempt will succeed
  }
  
  // Fourth attempt or beyond - allow pickup with consequences
  if (convState.attempts >= 4 || convState.playerInsisted) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: "🐟 Dominic stops resisting and allows you to take him, but his eyes are filled with sadness and resignation.",
        type: 'system',
        timestamp: now
      }
    });
    
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          text: "*DOMINIC's final words* \"So be it. But remember this moment when the consequences find you. I tried to save us both.\"",
          type: 'npc',
          timestamp: now + 1000
        }
      });
    }, 1500);
    
    // Set flags for consequences
    dispatch({ type: 'SET_FLAG', payload: { flag: 'dominicTakenAfterWarning', value: true } });
    dispatch({ type: 'SET_FLAG', payload: { flag: 'dominicWarningsIgnored', value: convState.attempts } });
    
    return false; // Allow pickup with consequences
  }
  
  return true; // Prevent pickup (fallback)
}

// Enhanced responses for different conversation contexts
export const dominicConversationResponses = {
  philosophical: [
    "Every tank is both a prison and a universe. The question is whether you choose to see the glass or the water.",
    "I've watched many players make choices. The wise ones listen before they act.",
    "Freedom isn't always about escape. Sometimes it's about understanding where you belong.",
    "The multiverse is vast, but some of us have found our place in it. Have you found yours?"
  ],
  
  warning: [
    "Taking me from this tank isn't just theft - it's murder with extra steps.",
    "Polly has... feelings... about what happens to me. Strong feelings. Violent feelings.",
    "I've seen this story before. It never has a happy ending.",
    "Some actions echo across the multiverse. This would be one of them."
  ],
  
  wise: [
    "Patience, young seeker. Understanding comes to those who observe before they act.",
    "The greatest adventures often begin with choosing not to act rashly.",
    "Wisdom is knowing that not everything that can be taken should be taken.",
    "True strength is shown in restraint, not in taking what you desire."
  ],
  
  sad: [
    "I had hoped you were different. That you would listen.",
    "Even knowing the consequences, some choose the dark path.",
    "My warnings fall on deaf ears, as they always do.",
    "The pattern repeats. The fish dies. The guilt remains."
  ]
};

// Context-aware response selection
export function getDominicResponse(context: 'philosophical' | 'warning' | 'wise' | 'sad'): string {
  const responses = dominicConversationResponses[context];
  return responses[Math.floor(Math.random() * responses.length)];
}
