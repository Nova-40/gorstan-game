// src/hooks/useNPCController.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import { useEffect } from 'react';
import { useGameState } from '../state/gameState';
import { useFlags } from './useFlags';
import { useModuleLoader } from './useModuleLoader';
import { useTimers } from './useTimers';
// Adjust the import according to the actual export in flagRegistry.ts
import { FlagMap } from '../state/flagRegistry';



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

  // Enhanced wandering NPC movement system
  useEffect(() => {
    const movementInterval = setInterval(() => {
      // Set flag to trigger NPC movement evaluation
      setFlag(npcFlags.evaluateWanderingNPCs, true);
      
      // Also trigger individual NPC wandering
      loadModule('../engine/wanderingNPCController').then(mod => {
        if (mod?.wanderNPC && state.roomMap) {
          // Move wandering NPCs
          const wanderingNPCs = ['morthos', 'al_escape_artist', 'polly', 'dominic_wandering', 'mr_wendell'];
          wanderingNPCs.forEach(npcId => {
            mod.wanderNPC(npcId, state);
          });
        }
      });
    }, 20000); // Every 20 seconds

    return () => clearInterval(movementInterval);
  }, [state.roomMap]);

  // Trigger Morthos/Al encounter in control room
  useEffect(() => {
    if (state.flags?.triggerMorthosAlEncounter && !state.flags?.hasMetMorthosAl) {
      const timer = setTimeout(() => {
        dispatch({ type: 'TRIGGER_MORTHOS_AL_ENCOUNTER', payload: null });
        // Clear the trigger flag after firing
        dispatch({ type: 'SET_FLAG', payload: { flag: 'triggerMorthosAlEncounter', value: false } });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.flags?.triggerMorthosAlEncounter, state.flags?.hasMetMorthosAl, dispatch]);

  
// React effect hook
  useEffect(() => {
// Variable declaration
    const flag = npcFlags.evaluateWanderingNPCs || 'evaluateWanderingNPCs';
    if (room && hasFlag(flag)) {
      clearFlag(flag);
      loadModule('../engine/wanderingNPCController').then(mod => {
        mod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
      });
    }
  }, [room, hasFlag(npcFlags.evaluateWanderingNPCs), state]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(debugFlags.debugSpawnNPC) && hasFlag(debugFlags.debugSpawnRoom)) {
      loadModule('../engine/wanderingNPCController').then(mod => {
        if (mod?.debugSpawnWanderingNPC) {
// Variable declaration
          const npc = debugFlags.debugSpawnNPC;
// Variable declaration
          const room = debugFlags.debugSpawnRoom;
// Variable declaration
          const success = mod.debugSpawnWanderingNPC(npc, room, dispatch);
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: success ? `DEBUG: Spawned NPC '${npc}' successfully.` : `DEBUG: Failed to spawn NPC '${npc}'.`,
              type: success ? 'system' : 'error',
              timestamp: Date.now()
            }
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
      loadModule('../engine/wanderingNPCController').then(mod => {
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
      loadModule('../engine/mrWendellController').then(mod => {
        if (mod?.handleWendellInteraction) {
// Variable declaration
          const result = mod.handleWendellInteraction(pending, state, dispatch);
          if (!result?.handled) {
            dispatch({ type: 'ADD_MESSAGE', payload: { text: "I don't understand that command.", type: 'error', timestamp: Date.now() } });
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
      loadModule('../engine/librarianController').then(mod => {
        if (mod?.handleLibrarianInteraction) {
// Variable declaration
          const result = mod.handleLibrarianInteraction(pending, state, dispatch);
          if (!result?.handled) {
            dispatch({ type: 'ADD_MESSAGE', payload: { text: "I don't understand that command.", type: 'error', timestamp: Date.now() } });
          }
        }
      });
      clearFlag(npcFlags.pendingLibrarianCommand);
    }
  }, [hasFlag(npcFlags.pendingLibrarianCommand)]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.forceWendellSpawn) && room) {
      setFlag('wasRudeToNPC', true);
      loadModule('../engine/mrWendellController').then(() => {
        loadModule('../engine/wanderingNPCController').then(wmod => {
          wmod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
        });
        dispatch({ type: 'ADD_MESSAGE', payload: { text: 'DEBUG: Mr. Wendell spawn triggered.', type: 'system', timestamp: Date.now() } });
      });
      clearFlag(npcFlags.forceWendellSpawn);
    }
  }, [hasFlag(npcFlags.forceWendellSpawn), room]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.forceLibrarianSpawn) && room) {
      setFlag('needsLibrarianHelp', true);
      loadModule('../engine/librarianController').then(() => {
        loadModule('../engine/wanderingNPCController').then(wmod => {
          wmod?.handleRoomEntryForWanderingNPCs?.(room, state, dispatch);
        });
        dispatch({ type: 'ADD_MESSAGE', payload: { text: 'DEBUG: Librarian spawn triggered.', type: 'system', timestamp: Date.now() } });
      });
      clearFlag(npcFlags.forceLibrarianSpawn);
    }
  }, [hasFlag(npcFlags.forceLibrarianSpawn), room]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(npcFlags.checkWendellStatus)) {
      loadModule('../engine/mrWendellController').then(mod => {
        if (mod?.isWendellActive && mod?.getWendellRoom) {
          console.log('[DEBUG] Mr. Wendell is active:', mod.isWendellActive());
          console.log('[DEBUG] Current room:', mod.getWendellRoom());
        }
      });
      clearFlag(npcFlags.checkWendellStatus);
    }
  }, [hasFlag(npcFlags.checkWendellStatus)]);

  return {
    room,
    hasActiveNPCs: () => state.npcsInRoom?.length > 0
  };
};
