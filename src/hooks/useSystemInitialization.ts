  import { FlagRegistry } from '../state/flagRegistry';

import { FlagRegistry } from '../state/flagRegistry';

import { getAllRoomsAsObject } from '../utils/roomLoader';

import { npc, debug } from '../state/flagRegistry';

import { Room } from './RoomTypes';

import { useEffect, useRef } from 'react';

import { useFlags } from './useFlags';

import { useGameState } from '../state/gameState';

import { useModuleLoader } from './useModuleLoader';

import { useTimers } from './useTimers';



// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useSystemInitialization.ts
// Description: Unified system initialization hook for Gorstan game


/**
 * Unified system initialization hook that handles all game system setup
 * Consolidates room loading, achievements, auto-save, and other initialization
 */
export const useSystemInitialization = () => {
  const { state, dispatch } = useGameState();
  const { hasFlag, setFlag, clearFlag } = useFlags();
  const { loadModule, preloadModules } = useModuleLoader();
  const { setTimer, clearTimer } = useTimers();

  const hasMounted = useRef(false);
  const systemsInitialized = useRef(false);

  // Initialize core game systems on mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      const initializeSystems = async () => {
        try {
          // Load room map
          const roomMap = getAllRoomsAsObject();
          dispatch({ type: 'SET_ROOM_MAP', payload: roomMap });
          setFlag(FlagRegistry.system.roomMapReady, true);

          // Initialize achievement engine
          const achievementModule = await loadModule('../logic/achievementEngine');
          if (achievementModule?.initializeAchievementEngine) {
            achievementModule.initializeAchievementEngine();
          }

          // Initialize wandering NPCs
          const npcModule = await loadModule('../engine/wanderingNPCController');
          if (npcModule?.initializeWanderingNPCs) {
            npcModule.initializeWanderingNPCs();
          }

          // Preload critical modules for performance
          preloadModules([
            '../engine/audio/audioController',
            '../engine/save/saveController',
            '../engine/flagController',
            '../engine/transitionController',
            '../engine/commandProcessor'
          ]);

          systemsInitialized.current = true;
          setFlag(FlagRegistry.system.systemsReady, true);

          console.log('[SYSTEM] Core game systems initialized successfully');

        } catch (error) {
          console.error('[SYSTEM] Failed to initialize game systems:', error);
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: 'System initialization failed. Some features may not work correctly.',
              type: 'error',
              timestamp: Date.now()
            }
          });
        }
      };

      initializeSystems();
    }
  }, [dispatch, setFlag, loadModule, preloadModules]);

  // Handle auto-save functionality
  useEffect(() => {
    if (hasFlag(FlagRegistry.system.systemsReady) && state.stage === 'game') {
      // Set up auto-save timer (every 5 minutes)
      setTimer({
        id: 'auto_save',
        callback: () => {
          loadModule('../engine/save/saveController').then((module) => {
            if (module?.autoSaveGame) {
              module.autoSaveGame(state);
            }
          });
        },
        delay: 5 * 60 * 1000, // 5 minutes
        repeat: true
      });

      return () => {
        clearTimer('auto_save');
      };
    }
  }, [hasFlag(FlagRegistry.system.systemsReady), state.stage, state, setTimer, clearTimer, loadModule]);

  // Handle transition animations
  useEffect(() => {
    const transitionType = state.transition;

    if (transitionType && hasFlag(FlagRegistry.system.systemsReady)) {
      // Set up transition timing
      setTimer({
        id: 'transition_delay',
        callback: () => {
          setFlag(FlagRegistry.system.readyForTransition, true);
        },
        delay: 100 // Small delay for smooth transitions
      });

      // Auto-clear transition after timeout
      setTimer({
        id: 'transition_timeout',
        callback: () => {
          dispatch({ type: 'SET_TRANSITION', payload: null });
          clearFlag(FlagRegistry.system.readyForTransition);
        },
        delay: 10000 // 10 second timeout
      });
    }
  }, [state.transition, hasFlag(FlagRegistry.system.systemsReady), setTimer, setFlag, dispatch, clearFlag]);

  // Handle room map updates
  useEffect(() => {
    if (hasFlag(FlagRegistry.system.refreshRoomMap)) {
      try {
        const roomMap = getAllRoomsAsObject();
        dispatch({ type: 'SET_ROOM_MAP', payload: roomMap });

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: 'Room map refreshed successfully.',
            type: 'system',
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.error('[SYSTEM] Failed to refresh room map:', error);
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: 'Failed to refresh room map.',
            type: 'error',
            timestamp: Date.now()
          }
        });
      }

      clearFlag(FlagRegistry.system.refreshRoomMap);
    }
  }, [hasFlag(FlagRegistry.system.refreshRoomMap), dispatch, clearFlag]);

  // Handle debug system commands
  useEffect(() => {
    if (hasFlag(FlagRegistry.system.debugSystemStatus)) {
      console.log('[DEBUG] System Status:');
      console.log('- Systems Initialized:', systemsInitialized.current);
      console.log('- Room Map Ready:', hasFlag(FlagMap.transition.roomMapReady));
      console.log('- Systems Ready:', hasFlag(FlagMap.transition.systemsReady));
      console.log('- Current Stage:', state.stage);
      console.log('- Room Count:', Object.keys(state.roomMap || {}).length);
      console.log('- Flag Count:', Object.keys(state.flags || {}).length);

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          text: 'System status logged to console.',
          type: 'system',
          timestamp: Date.now()
        }
      });

      clearFlag(FlagRegistry.system.debugSystemStatus);
    }
  }, [hasFlag(FlagRegistry.system.debugSystemStatus), state, hasFlag, clearFlag, dispatch]);

  // Handle system reset commands
  useEffect(() => {
    if (hasFlag(FlagRegistry.system.resetSystems)) {
      console.log('[SYSTEM] Resetting game systems...');

      // Clear all timers
      clearTimer('auto_save');
      clearTimer('transition_delay');
      clearTimer('transition_timeout');

      // Reset initialization flags
      systemsInitialized.current = false;
      clearFlag(FlagRegistry.system.systemsReady);
      clearFlag(FlagRegistry.system.roomMapReady);

      // Reinitialize systems
      setTimeout(() => {
        hasMounted.current = false;
      }, 100);

      clearFlag(FlagRegistry.system.resetSystems);
    }
  }, [hasFlag(FlagRegistry.system.resetSystems), clearTimer, clearFlag]);

  return {
    isInitialized: systemsInitialized.current,
    isReady: hasFlag(FlagRegistry.system.systemsReady),
    roomMapReady: hasFlag(FlagRegistry.system.roomMapReady)
  };
};

/**
 * System-related flags for easy reference
 */
export const SYSTEM_FLAGS = {
  ROOM_MAP_READY: 'roomMapReady',
  SYSTEMS_READY: 'systemsReady',
  READY_FOR_TRANSITION: 'readyForTransition',
  REFRESH_ROOM_MAP: 'refreshRoomMap',
  DEBUG_SYSTEM_STATUS: 'debugSystemStatus',
  RESET_SYSTEMS: 'resetSystems'
} as const;
