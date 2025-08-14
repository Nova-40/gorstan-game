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
// Handles NPC logic, memory, or rendering.

import { useEffect } from "react";
import { useGameState } from "../state/gameState";
import { useFlags } from "./useFlags";
import { useModuleLoader } from "./useModuleLoader";
import { useTimers } from "./useTimers";
// Adjust the import according to the actual export in flagRegistry.ts
import { FlagMap } from "../state/flagRegistry";

export const useNPCController = () => {
  const { state, dispatch } = useGameState();
  const { hasFlag, clearFlag, setFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer } = useTimers();

  // Variable declaration
  const room = state.roomMap?.[state.currentRoomId] || null;
  // Variable declaration
  const npcFlags = FlagMap.npc;
  // Variable declaration
  const debugFlags = FlagMap.debug;
  // Variable declaration
  const systemFlags = FlagMap.system;

  // Optimized unified NPC movement system
  useEffect(() => {
    // Skip NPC movement during system overlays or special states using flags
    if (
      state.flags?.pollyTakeoverInProgress ||
      state.flags?.isSystemTransition ||
      !state.roomMap
    ) {
      return;
    }

    const movementInterval = setInterval(() => {
      // Skip if currently in transition or overlay state
      if (
        state.flags?.pollyTakeoverInProgress ||
        state.flags?.isSystemTransition
      ) {
        return;
      }

      // Set flag to trigger NPC movement evaluation
      setFlag(npcFlags.evaluateWanderingNPCs, true);

      // Optimized module loading with error handling
      loadModule("../engine/wanderingNPCController")
        .then((mod) => {
          if (
            mod?.wanderNPC &&
            state.roomMap &&
            !state.flags?.pollyTakeoverInProgress
          ) {
            // Dynamic NPC list from current game state instead of hardcoded
            const wanderingNPCs =
              state.npcsInRoom
                ?.filter((npc) => npc.canWander && !npc.questOnly)
                ?.map((npc) => npc.id) || [];

            // Fallback to known wandering NPCs if no NPCs in current state
            if (wanderingNPCs.length === 0) {
              const fallbackNPCs = [
                "morthos",
                "al_escape_artist",
                "polly",
                "dominic_wandering",
                "mr_wendell",
              ];
              wanderingNPCs.push(...fallbackNPCs);
            }

            // Batch process NPCs with error handling
            wanderingNPCs.forEach((npcId) => {
              try {
                mod.wanderNPC(npcId, state);
              } catch (error) {
                console.warn(`[NPC] Failed to move ${npcId}:`, error);
              }
            });
          }
        })
        .catch((error) => {
          console.warn("[NPC] Module loading failed:", error);
        });
    }, 18000); // Optimized to 18 seconds to avoid conflicts

    // Enhanced cleanup
    return () => {
      clearInterval(movementInterval);
      // Clean up any lingering window intervals
      if ((window as any).npcMovementInterval) {
        clearInterval((window as any).npcMovementInterval);
        delete (window as any).npcMovementInterval;
      }
    };
  }, [
    state.roomMap,
    state.flags?.pollyTakeoverInProgress,
    state.flags?.isSystemTransition,
  ]);

  // Trigger Morthos/Al encounter in control room
  useEffect(() => {
    if (
      state.flags?.triggerMorthosAlEncounter &&
      !state.flags?.hasMetMorthosAl
    ) {
      const timer = setTimeout(() => {
        dispatch({ type: "TRIGGER_MORTHOS_AL_ENCOUNTER", payload: null });
        // Clear the trigger flag after firing
        dispatch({
          type: "SET_FLAG",
          payload: { flag: "triggerMorthosAlEncounter", value: false },
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    state.flags?.triggerMorthosAlEncounter,
    state.flags?.hasMetMorthosAl,
    dispatch,
  ]);

  // React effect hook
  useEffect(() => {
    // Variable declaration
    const flag = npcFlags.evaluateWanderingNPCs || "evaluateWanderingNPCs";
    if (room && hasFlag(flag)) {
      clearFlag(flag);
      loadModule("../engine/wanderingNPCController").then((mod) => {
        mod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
      });
    }
  }, [room, hasFlag(npcFlags.evaluateWanderingNPCs), state]);

  // React effect hook
  useEffect(() => {
    if (
      hasFlag(debugFlags.debugSpawnNPC) &&
      hasFlag(debugFlags.debugSpawnRoom)
    ) {
      loadModule("../engine/wanderingNPCController").then((mod) => {
        if (mod?.debugSpawnWanderingNPC) {
          // Variable declaration
          const npc = debugFlags.debugSpawnNPC;
          // Variable declaration
          const room = debugFlags.debugSpawnRoom;
          // Variable declaration
          const success = mod.debugSpawnWanderingNPC(npc, room, dispatch);
          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              text: success
                ? `DEBUG: Spawned NPC '${npc}' successfully.`
                : `DEBUG: Failed to spawn NPC '${npc}'.`,
              type: success ? "system" : "error",
              timestamp: Date.now(),
            },
          });
        }
      });
      clearFlag(debugFlags.debugSpawnNPC);
      clearFlag(debugFlags.debugSpawnRoom);
    }
  }, [hasFlag(debugFlags.debugSpawnNPC), hasFlag(debugFlags.debugSpawnRoom)]);

  // React effect hook
  useEffect(() => {
    if (hasFlag(debugFlags.debugListNPCs)) {
      loadModule("../engine/wanderingNPCController").then((mod) => {
        mod?.debugListActiveWanderingNPCs?.();
      });
      clearFlag(debugFlags.debugListNPCs);
    }
  }, [hasFlag(debugFlags.debugListNPCs)]);

  // React effect hook
  useEffect(() => {
    // Variable declaration
    const pending = hasFlag(npcFlags.pendingWendellCommand);
    if (pending) {
      loadModule("../engine/mrWendellController").then((mod) => {
        if (mod?.handleWendellInteraction) {
          // Variable declaration
          const result = mod.handleWendellInteraction(pending, state, dispatch);
          if (!result?.handled) {
            dispatch({
              type: "ADD_MESSAGE",
              payload: {
                text: "I don't understand that command.",
                type: "error",
                timestamp: Date.now(),
              },
            });
          }
        }
      });
      clearFlag(npcFlags.pendingWendellCommand);
    }
  }, [hasFlag(npcFlags.pendingWendellCommand)]);

  // React effect hook
  useEffect(() => {
    // Variable declaration
    const pending = hasFlag(npcFlags.pendingLibrarianCommand);
    if (pending) {
      loadModule("../engine/librarianController").then((mod) => {
        if (mod?.handleLibrarianInteraction) {
          // Variable declaration
          const result = mod.handleLibrarianInteraction(
            pending,
            state,
            dispatch,
          );
          if (!result?.handled) {
            dispatch({
              type: "ADD_MESSAGE",
              payload: {
                text: "I don't understand that command.",
                type: "error",
                timestamp: Date.now(),
              },
            });
          }
        }
      });
      clearFlag(npcFlags.pendingLibrarianCommand);
    }
  }, [hasFlag(npcFlags.pendingLibrarianCommand)]);

  // React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.forceWendellSpawn) && room) {
      setFlag("wasRudeToNPC", true);
      loadModule("../engine/mrWendellController").then(() => {
        loadModule("../engine/wanderingNPCController").then((wmod) => {
          wmod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
        });
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            text: "DEBUG: Mr. Wendell spawn triggered.",
            type: "system",
            timestamp: Date.now(),
          },
        });
      });
      clearFlag(npcFlags.forceWendellSpawn);
    }
  }, [hasFlag(npcFlags.forceWendellSpawn), room]);

  // React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.forceLibrarianSpawn) && room) {
      setFlag("needsLibrarianHelp", true);
      loadModule("../engine/librarianController").then(() => {
        loadModule("../engine/wanderingNPCController").then((wmod) => {
          wmod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
        });
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            text: "DEBUG: Librarian spawn triggered.",
            type: "system",
            timestamp: Date.now(),
          },
        });
      });
      clearFlag(npcFlags.forceLibrarianSpawn);
    }
  }, [hasFlag(npcFlags.forceLibrarianSpawn), room]);

  // React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.checkWendellStatus)) {
      loadModule("../engine/mrWendellController").then((mod) => {
        if (mod?.isWendellActive && mod?.getWendellRoom) {
          console.log("[DEBUG] Mr. Wendell is active:", mod.isWendellActive());
          console.log("[DEBUG] Current room:", mod.getWendellRoom());
        }
      });
      clearFlag(npcFlags.checkWendellStatus);
    }
  }, [hasFlag(npcFlags.checkWendellStatus)]);

  return {
    room,
    hasActiveNPCs: () => state.npcsInRoom?.length > 0,
  };
};
