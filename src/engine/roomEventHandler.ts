// src/engine/roomEventHandler.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles room-specific events and encounters

import { GameAction } from '../types/GameTypes';
import { LocalGameState } from '../state/gameState';
import { Room } from '../types/Room';
import { Dispatch } from 'react';

/**
 * Handles room entry events, including special encounters
 */
export function handleRoomEntry(
  room: Room,
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  // Check for Morthos & Al first encounter in Control Room
  if (room.id === 'controlroom' && !gameState.flags?.hasMetMorthosAl) {
    triggerMorthosAlEncounter(gameState, dispatch);
  }
  
  // Handle other room-specific events
  if (room.events?.onEnter) {
    room.events.onEnter.forEach((event: string) => {
      handleRoomEvent(event, room, gameState, dispatch);
    });
  }
}

/**
 * Triggers the first encounter with Morthos and Al in the Control Room
 */
function triggerMorthosAlEncounter(
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  // Delay the encounter slightly to let the room settle
  setTimeout(() => {
    // Initial atmosphere
    dispatch({
      type: 'RECORD_MESSAGE',
      payload: {
        id: `encounter-start-${Date.now()}`,
        text: '🌫️ The shadows in the control room suddenly deepen, and the air grows thick with tension...',
        type: 'narrative',
        timestamp: Date.now()
      }
    });

    // Morthos appears
    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `morthos-appear-${Date.now()}`,
          text: '🌑 From the darkest corner of the room, a figure emerges. Morthos steps forward, shadows writhing around his form like living things.',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }, 1500);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `morthos-speak-${Date.now()}`,
          text: '🗣️ MORTHOS: "So... another operator discovers our little sanctuary. How deliciously... inevitable."',
          type: 'system',
          timestamp: Date.now()
        }
      });
    }, 3000);

    // Al appears  
    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `al-appear-${Date.now()}`,
          text: '📋 A bureaucratic figure in a slightly rumpled suit materializes near the monitoring stations, adjusting his glasses with practiced efficiency.',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }, 4500);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `al-speak-${Date.now()}`,
          text: '🗣️ AL: "Ah, excellent timing. We have protocols to discuss, forms to file, and reality to stabilize. In that order."',
          type: 'system',
          timestamp: Date.now()
        }
      });
    }, 6000);

    // The tension
    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `tension-build-${Date.now()}`,
          text: '⚡ The room crackles with dimensional energy as these two powerful entities regard each other—and you—with interest.',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }, 7500);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `encounter-complete-${Date.now()}`,
          text: '✨ You sense this encounter will shape your journey through the multiverse...',
          type: 'system',
          timestamp: Date.now()
        }
      });

      // Set the flags
      dispatch({
        type: 'SET_FLAG',
        payload: { flag: 'hasMetMorthosAl', value: true }
      });
      
      dispatch({
        type: 'SET_FLAG',
        payload: { flag: 'metMorthos', value: true }
      });
      
      dispatch({
        type: 'SET_FLAG',
        payload: { flag: 'metAl', value: true }
      });

      dispatch({
        type: 'SET_FLAG',
        payload: { flag: 'firstEncounterComplete', value: true }
      });

    }, 9000);

  }, 2000); // Initial delay to let room description settle
}

/**
 * Generic room event handler
 */
function handleRoomEvent(
  event: string,
  room: Room,
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  switch (event) {
    case 'checkMorthosAlEncounter':
      if (!gameState.flags?.hasMetMorthosAl) {
        triggerMorthosAlEncounter(gameState, dispatch);
      }
      break;
    
    case 'showControlRoomIntro':
      // Default control room intro handling
      break;
      
    case 'checkEmergencyStatus':
      // Emergency status check
      break;
      
    case 'updateTacticalDisplay':
      // Tactical display update
      break;
      
    default:
      // Handle other events as needed
      break;
  }
}

/**
 * Handles wandering NPC movement intervals
 */
export function initializeNPCMovementSystem(
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  // Set up wandering NPC movement timer
  const movementInterval = setInterval(() => {
    // Trigger NPC evaluation flag
    dispatch({
      type: 'SET_FLAG',
      payload: { flag: 'evaluateWanderingNPCs', value: true }
    });
  }, 15000); // Check every 15 seconds

  // Store interval ID for cleanup
  (window as any).npcMovementInterval = movementInterval;
}

/**
 * Enhanced wandering NPC movement trigger
 */
export function triggerNPCMovement(
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>
): void {
  // Import and use wandering controller
  import('./wanderingNPCController').then(mod => {
    if (mod.wanderNPC) {
      // Trigger movement for wandering NPCs
      const wanderingNPCs = ['morthos', 'al_escape_artist', 'polly', 'dominic_wandering', 'mr_wendell'];
      
      wanderingNPCs.forEach(npcId => {
        mod.wanderNPC(npcId, gameState);
      });
    }
  });
}
