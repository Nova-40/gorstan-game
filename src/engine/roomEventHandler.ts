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
// Handles room-specific events and encounters

import { GameAction } from "../types/GameTypes";
import { LocalGameState } from "../state/gameState";
import { Room } from "../types/Room";
import { Dispatch } from "react";
import { maybeTriggerInquisitionTrap } from "./trapEngine";
import { detectTrapsOnEntry } from "./trapDetection";

/**
 * Handles room entry events, including special encounters
 */
export function handleRoomEntry(
  room: Room,
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>,
): void {
  // Check for traps when entering room
  const trapDetection = detectTrapsOnEntry(room, gameState);
  if (trapDetection.detected && trapDetection.warning) {
    let messageType: "system" | "warning" | "error" = "warning";

    // Adjust message type based on severity
    if (trapDetection.severity === "extreme") {
      messageType = "error";
    } else if (trapDetection.severity === "low") {
      messageType = "system";
    }

    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: `trap-warning-${Date.now()}`,
        text: trapDetection.warning,
        type: messageType,
        timestamp: Date.now(),
      },
    });

    // Add disarm hint if applicable
    if (trapDetection.canDisarm) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: `trap-hint-${Date.now()}`,
          text: '💡 You might be able to disarm this trap with the right tools or skills. Try "disarm trap" or "search for traps".',
          type: "system",
          timestamp: Date.now(),
        },
      });
    }
  }

  // Check for Morthos & Al first encounter in Control Room - handled by room file
  // (Removed duplicate encounter trigger - room handles its own events)

  // Random chance for Spanish Inquisition (but not during intro stages)
  if (gameState.stage === "game" && room.id !== "introreset") {
    const playerState = {
      traits: gameState.player.traits || [],
      items: gameState.player.inventory || [],
      inventory: gameState.player.inventory || [],
      command: "", // Last command would need to be tracked
      score: gameState.player.score || 0,
      health: gameState.player.health || 100,
      level: 1, // Default level
      flags: {}, // Convert complex flags to boolean flags for trap engine
      name: gameState.player.name || "Player",
      difficulty: "normal",
    };

    maybeTriggerInquisitionTrap(room.id, playerState, (message: string) => {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: `inquisition-${Date.now()}`,
          text: message,
          type: "system",
          timestamp: Date.now(),
        },
      });
    });
  }

  // Handle other room-specific events
  if (room.events?.onEnter) {
    room.events.onEnter.forEach((event: string) => {
      handleRoomEvent(event, room, gameState, dispatch);
    });
  }
}

/**
 * Generic room event handler
 */
function handleRoomEvent(
  event: string,
  room: Room,
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>,
): void {
  // Check if room has custom event handlers
  if (room.eventHandlers && room.eventHandlers[event]) {
    const result = room.eventHandlers[event](gameState);
    if (result) {
      // Dispatch messages
      if (result.messages) {
        result.messages.forEach((message: any) => {
          dispatch({
            type: "RECORD_MESSAGE",
            payload: message,
          });
        });
      }

      // Apply updates
      if (result.updates) {
        if (result.updates.flags) {
          Object.entries(result.updates.flags).forEach(([flag, value]) => {
            dispatch({
              type: "SET_FLAG",
              payload: { flag, value },
            });
          });
        }
        if (result.updates.npcsInRoom) {
          dispatch({
            type: "SET_NPCS_IN_ROOM",
            payload: result.updates.npcsInRoom,
          });
        }
      }
    }
    return;
  }

  // Fallback to generic event handling
  switch (event) {
    case "checkMorthosAlEncounter":
      // Encounter is handled by room's eventHandlers
      console.log(
        "[RoomEventHandler] Morthos/Al encounter should be handled by room eventHandlers",
      );
      break;

    case "showControlRoomIntro":
      // Default control room intro handling
      break;

    case "checkEmergencyStatus":
      // Emergency status check
      break;

    case "updateTacticalDisplay":
      // Tactical display update
      break;

    default:
      // Handle other events as needed
      break;
  }
}

/**
 * REMOVED: initializeNPCMovementSystem
 * This secondary timer system was causing conflicts with the main NPC timer.
 * NPC movement is now handled exclusively by useNPCController.ts for better performance.
 */

/**
 * Enhanced wandering NPC movement trigger
 */
export function triggerNPCMovement(
  gameState: LocalGameState,
  dispatch: Dispatch<GameAction>,
): void {
  // Import and use wandering controller
  import("./wanderingNPCController").then((mod) => {
    if (mod.wanderNPC) {
      // Trigger movement for wandering NPCs
      const wanderingNPCs = [
        "morthos",
        "al_escape_artist",
        "polly",
        "dominic_wandering",
        "mr_wendell",
      ];

      wanderingNPCs.forEach((npcId) => {
        mod.wanderNPC(npcId, gameState);
      });
    }
  });
}
