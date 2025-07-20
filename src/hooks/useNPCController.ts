// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useNPCController.ts
// Description: Unified NPC management hook for Gorstan game

import { useEffect } from 'react';
import { useFlags } from './useFlags';
import { useModuleLoader } from './useModuleLoader';
import { useTimers } from './useTimers';
import { useGameState } from '../state/gameState';

/**
 * Unified NPC controller hook that handles all NPC-related operations
 * Consolidates wandering NPCs, Mr. Wendell, Librarian, and debug commands
 */
export const useNPCController = () => {
  const { state, dispatch } = useGameState();
  const { hasFlag, clearFlag, setFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer } = useTimers();
  
  const room = state.roomMap?.[state.currentRoomId] || null;

  // Handle wandering NPCs when entering rooms
  useEffect(() => {
    if (room && hasFlag('evaluateWanderingNPCs')) {
      clearFlag('evaluateWanderingNPCs');
      
      loadModule('../engine/wanderingNPCController').then((module) => {
        if (module?.handleRoomEntryForWanderingNPCs) {
          module.handleRoomEntryForWanderingNPCs(room, state, dispatch);
        }
      });
    }
  }, [room, hasFlag('evaluateWanderingNPCs'), state, dispatch, clearFlag, loadModule]);

  // Handle debug NPC spawning
  useEffect(() => {
    const debugSpawnNPC = hasFlag('debugSpawnNPC');
    const debugSpawnRoom = hasFlag('debugSpawnRoom');
    
    if (debugSpawnNPC && debugSpawnRoom) {
      loadModule('../engine/wanderingNPCController').then((module) => {
        if (module?.debugSpawnWanderingNPC) {
          const success = module.debugSpawnWanderingNPC(
            debugSpawnNPC, 
            debugSpawnRoom, 
            dispatch
          );
          
          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: {
              text: success 
                ? `DEBUG: Spawned NPC '${debugSpawnNPC}' successfully.`
                : `DEBUG: Failed to spawn NPC '${debugSpawnNPC}'.`,
              type: success ? 'system' : 'error',
              timestamp: Date.now()
            }
          });
        }
      });
      
      clearFlag('debugSpawnNPC');
      clearFlag('debugSpawnRoom');
    }
  }, [hasFlag('debugSpawnNPC'), hasFlag('debugSpawnRoom'), dispatch, clearFlag, loadModule]);

  // Handle debug NPC listing
  useEffect(() => {
    if (hasFlag('debugListNPCs')) {
      loadModule('../engine/wanderingNPCController').then((module) => {
        if (module?.debugListActiveWanderingNPCs) {
          module.debugListActiveWanderingNPCs();
        }
      });
      
      clearFlag('debugListNPCs');
    }
  }, [hasFlag('debugListNPCs'), clearFlag, loadModule]);

  // Handle pending Mr. Wendell commands
  useEffect(() => {
    const pendingCommand = hasFlag('pendingWendellCommand');
    
    if (pendingCommand) {
      loadModule('../engine/mrWendellController').then((module) => {
        if (module?.handleWendellInteraction) {
          const result = module.handleWendellInteraction(pendingCommand, state, dispatch);
          if (!result.handled) {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: Date.now().toString(),
                text: "I don't understand that command.",
                type: 'error',
                timestamp: Date.now()
              }
            });
          }
        }
      });
      
      clearFlag('pendingWendellCommand');
    }
  }, [hasFlag('pendingWendellCommand'), state, dispatch, clearFlag, loadModule]);

  // Handle pending Librarian commands
  useEffect(() => {
    const pendingCommand = hasFlag('pendingLibrarianCommand');
    
    if (pendingCommand) {
      loadModule('../engine/librarianController').then((module) => {
        if (module?.handleLibrarianInteraction) {
          const result = module.handleLibrarianInteraction(pendingCommand, state, dispatch);
          if (!result.handled) {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: Date.now().toString(),
                text: "I don't understand that command.",
                type: 'error',
                timestamp: Date.now()
              }
            });
          }
        }
      });
      
      clearFlag('pendingLibrarianCommand');
    }
  }, [hasFlag('pendingLibrarianCommand'), state, dispatch, clearFlag, loadModule]);

  // Handle force Mr. Wendell spawn
  useEffect(() => {
    if (hasFlag('forceWendellSpawn') && room) {
      loadModule('../engine/mrWendellController').then((module) => {
        // Force spawn by setting triggers
        setFlag('wasRudeToNPC', true);
        
        // Load wandering NPC controller for room evaluation
        loadModule('../engine/wanderingNPCController').then((wanderingModule) => {
          if (wanderingModule?.handleRoomEntryForWanderingNPCs) {
            wanderingModule.handleRoomEntryForWanderingNPCs(room, state, dispatch);
          }
        });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: 'DEBUG: Mr. Wendell spawn conditions activated.',
            type: 'system',
            timestamp: Date.now()
          }
        });
      });
      
      clearFlag('forceWendellSpawn');
    }
  }, [hasFlag('forceWendellSpawn'), room, state, dispatch, clearFlag, setFlag, loadModule]);

  // Handle Mr. Wendell status check
  useEffect(() => {
    if (hasFlag('checkWendellStatus')) {
      loadModule('../engine/mrWendellController').then((module) => {
        if (module?.isWendellActive && module?.getWendellRoom) {
          console.log('[DEBUG] Mr. Wendell Status:');
          console.log('- Active:', module.isWendellActive());
          console.log('- Current Room:', module.getWendellRoom());
          console.log('- Player Flags:', {
            wasRudeToNPC: hasFlag('wasRudeToNPC'),
            wasRudeRecently: hasFlag('wasRudeRecently'),
            wendellSpared: hasFlag('wendellSpared')
          });
          console.log('- Cursed Items:', state.player.inventory.filter((item: any) => 
            ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
          ));
        }
      });
      
      clearFlag('checkWendellStatus');
    }
  }, [hasFlag('checkWendellStatus'), state, clearFlag, hasFlag, loadModule]);

  // Handle force Librarian spawn
  useEffect(() => {
    if (hasFlag('forceLibrarianSpawn') && room) {
      loadModule('../engine/librarianController').then((module) => {
        // Set up librarian spawn conditions
        setFlag('needsLibrarianHelp', true);
        
        // Load wandering NPC controller for room evaluation
        loadModule('../engine/wanderingNPCController').then((wanderingModule) => {
          if (wanderingModule?.handleRoomEntryForWanderingNPCs) {
            wanderingModule.handleRoomEntryForWanderingNPCs(room, state, dispatch);
          }
        });
        
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: 'DEBUG: Librarian spawn conditions activated.',
            type: 'system',
            timestamp: Date.now()
          }
        });
      });
      
      clearFlag('forceLibrarianSpawn');
    }
  }, [hasFlag('forceLibrarianSpawn'), room, state, dispatch, clearFlag, setFlag, loadModule]);

  return {
    // Expose useful methods for external use if needed
    room,
    hasActiveNPCs: () => state.npcsInRoom?.length > 0
  };
};

/**
 * NPC-related constants for easy reference
 */
export const NPC_FLAGS = {
  WANDERING: {
    EVALUATE: 'evaluateWanderingNPCs',
    DEBUG_SPAWN_NPC: 'debugSpawnNPC',
    DEBUG_SPAWN_ROOM: 'debugSpawnRoom',
    DEBUG_LIST: 'debugListNPCs'
  },
  WENDELL: {
    PENDING_COMMAND: 'pendingWendellCommand',
    FORCE_SPAWN: 'forceWendellSpawn',
    CHECK_STATUS: 'checkWendellStatus',
    WAS_RUDE: 'wasRudeToNPC',
    WAS_RUDE_RECENTLY: 'wasRudeRecently',
    SPARED: 'wendellSpared'
  },
  LIBRARIAN: {
    PENDING_COMMAND: 'pendingLibrarianCommand',
    FORCE_SPAWN: 'forceLibrarianSpawn',
    NEEDS_HELP: 'needsLibrarianHelp'
  }
} as const;
