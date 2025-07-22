import { FlagRegistry } from '../state/flagRegistry';

import { NPC } from './NPCTypes';

import { npc, debug } from '../state/flagRegistry';

import { Room } from './RoomTypes';

import { useEffect } from 'react';

import { useFlags } from './useFlags';

import { useGameState } from '../state/gameState';

import { useModuleLoader } from './useModuleLoader';

import { useTimers } from './useTimers';



// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useNPCController.ts
// Description: Unified NPC management hook for Gorstan game


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
    if (room && hasFlag(npc.evaluateWanderingNPCs)) {
    if (room && hasFlag(FlagRegistry.npc.evaluateWanderingNPCs || 'evaluateWanderingNPCs')) {
      clearFlag(FlagRegistry.npc.evaluateWanderingNPCs || 'evaluateWanderingNPCs');

      loadModule('../engine/wanderingNPCController').then((module) => {
        if (module?.handleRoomEntryForWanderingNPCs) {
          module.handleRoomEntryForWanderingNPCs(room, state, dispatch);
        }
      });
    }
  }, [room, hasFlag(npc.evaluateWanderingNPCs), state, dispatch, clearFlag, loadModule]);

  // Handle debug NPC spawning
  useEffect(() => {
    const debugSpawnNPC = hasFlag(debug.debugSpawnNPC);
    const debugSpawnNPC = hasFlag(FlagRegistry.debug.debugSpawnNPC || 'debugSpawnNPC');
    const debugSpawnRoom = hasFlag(FlagRegistry.debug.debugSpawnRoom || 'debugSpawnRoom');

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

      clearFlag(debug.debugSpawnNPC);
      clearFlag(FlagRegistry.debug.debugSpawnNPC || 'debugSpawnNPC');
      clearFlag(FlagRegistry.debug.debugSpawnRoom || 'debugSpawnRoom');
    }
  }, [hasFlag(debug.debugSpawnNPC), hasFlag('debugSpawnRoom'), dispatch, clearFlag, loadModule]);

  // Handle debug NPC listing
  useEffect(() => {
    if (hasFlag(debug.debugListNPCs)) {
      loadModule('../engine/wanderingNPCController').then((module) => {
        if (module?.debugListActiveWanderingNPCs) {
          module.debugListActiveWanderingNPCs();
        }
      });

    if (hasFlag(FlagRegistry.debug.debugListNPCs || 'debugListNPCs')) {
      clearFlag(FlagRegistry.debug.debugListNPCs || 'debugListNPCs');
    }
  }, [hasFlag(debug.debugListNPCs), clearFlag, loadModule]);

  // Handle pending Mr. Wendell commands
  useEffect(() => {
    const pendingCommand = hasFlag(npc.pendingWendellCommand);
    const pendingCommand = hasFlag(FlagRegistry.system.pendingWendellCommand || 'pendingWendellCommand');

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

      clearFlag(npc.pendingWendellCommand);
      clearFlag(FlagRegistry.system.pendingWendellCommand || 'pendingWendellCommand');
    }
  }, [hasFlag(npc.pendingWendellCommand), state, dispatch, clearFlag, loadModule]);

  // Handle pending Librarian commands
  useEffect(() => {
    const pendingCommand = hasFlag(npc.pendingLibrarianCommand);
    const pendingCommand = hasFlag(FlagRegistry.system.pendingLibrarianCommand || 'pendingLibrarianCommand');

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

      clearFlag(npc.pendingLibrarianCommand);
      clearFlag(FlagRegistry.system.pendingLibrarianCommand || 'pendingLibrarianCommand');
    }
  }, [hasFlag(npc.pendingLibrarianCommand), state, dispatch, clearFlag, loadModule]);

  // Handle force Mr. Wendell spawn
  useEffect(() => {
    if (hasFlag(npc.forceWendellSpawn) && room) {
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

      clearFlag(npc.forceWendellSpawn);
    }
  }, [hasFlag(npc.forceWendellSpawn), room, state, dispatch, clearFlag, setFlag, loadModule]);

  // Handle Mr. Wendell status check
  useEffect(() => {
    if (hasFlag(npc.checkWendellStatus)) {
      loadModule('../engine/mrWendellController').then((module) => {
        if (module?.isWendellActive && module?.getWendellRoom) {
          console.log('[DEBUG] Mr. Wendell Status:');
          console.log('- Active:', module.isWendellActive());
          console.log('- Current Room:', module.getWendellRoom());
          console.log('- Player Flags:', {
            wasRudeToNPC: hasFlag(npc.wasRudeToNPC),
            wasRudeRecently: hasFlag(npc.wasRudeRecently),
            wendellSpared: hasFlag(npc.wendellSpared)
          });
          console.log('- Cursed Items:', state.player.inventory.filter((item: any) =>
            ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
          ));
        }
      });

      clearFlag(npc.checkWendellStatus);
    }
  }, [hasFlag(npc.checkWendellStatus), state, clearFlag, hasFlag, loadModule]);

  // Handle force Librarian spawn
  useEffect(() => {
    if (hasFlag(npc.forceLibrarianSpawn) && room) {
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

      clearFlag(npc.forceLibrarianSpawn);
    }
  }, [hasFlag(npc.forceLibrarianSpawn), room, state, dispatch, clearFlag, setFlag, loadModule]);

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
