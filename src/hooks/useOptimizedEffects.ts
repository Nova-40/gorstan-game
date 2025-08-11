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
// Game module.

import { FlagMap } from '../state/flagRegistry';
const { npc, debug } = FlagMap;

import { Room } from '../types/Room';

import { useEffect } from 'react';

import { useFlags } from './useFlags';

import { useModuleLoader } from './useModuleLoader';

import { useTimers } from './useTimers';

export const useOptimizedEffects = (
  state: any,
  dispatch: any,
  room: any
) => {
  const { hasFlag, clearFlag, setFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer } = useTimers();

  
// React effect hook
  useEffect(() => {
// Variable declaration
    const flags = state.flags || {};
    const effectsToRun: Array<() => void> = [];

    
    if (hasFlag(FlagMap.transition.roomMapReady)) {
      effectsToRun.push(() => {
        console.log('[DEBUG] System Status:');
        console.log('- Current Stage:', state.stage);
        console.log('- Room Count:', Object.keys(state.roomMap || {}).length);
        console.log('- Flag Count:', Object.keys(flags).length);
        console.log('- Inventory Count:', state.player?.inventory?.length || 0);

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: 'System status logged to console.',
            type: 'system',
            timestamp: Date.now()
          }
        });

        clearFlag(debug.debugSystemStatus);
        clearFlag(FlagMap.transition.roomMapReady);
      });
    }

    
    if (hasFlag(FlagMap.game.resetGameState)) {
      effectsToRun.push(() => {
        console.log('[SYSTEM] Resetting game state...');

        dispatch({ type: 'RESET_GAME' });

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: 'Game state has been reset.',
            type: 'system',
            timestamp: Date.now()
          }
        });

        clearFlag(FlagMap.game.resetGameState);
      });
    }

    
    if (hasFlag(debug.debugSystemStatus)) {
      effectsToRun.push(() => {
// Variable declaration
        const flagKeys = Object.keys(flags);
        console.log(`[DEBUG] Clearing ${flagKeys.length} flags...`);

        flagKeys.forEach(key => clearFlag(key));

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: `Cleared ${flagKeys.length} flags.`,
            type: 'system',
            timestamp: Date.now()
          }
        });
      });
    }

    
    if (hasFlag(debug.debugShowInventory)) {
      effectsToRun.push(() => {
        console.log('[DEBUG] Player Inventory:', state.player?.inventory || []);

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: `Inventory: ${(state.player?.inventory || []).join(', ') || 'Empty'}`,
            type: 'system',
            timestamp: Date.now()
          }
        });

        clearFlag(debug.debugShowInventory);
        clearFlag(debug.debugShowInventory);
      });
    }

    
    if (hasFlag(debug.debugPerformance)) {
      effectsToRun.push(() => {
// Variable declaration
        const performance = window.performance;
// Variable declaration
        const memory = (performance as any).memory;

        console.log('[DEBUG] Performance Metrics:');
        console.log('- Memory Used:', memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A');
        console.log('- Memory Total:', memory ? `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A');
        console.log('- Navigation Timing:', performance.getEntriesByType('navigation'));

        clearFlag(debug.debugPerformance);
        clearFlag(debug.debugPerformance);
      });
    }

    
    if (effectsToRun.length > 0) {
      
      setTimer({
        id: 'batch_effects',
        callback: () => {
          effectsToRun.forEach(effect => effect());
        },
        delay: 0 
      });
    }

  }, [
    
    hasFlag(FlagMap.transition.roomMapReady),
    hasFlag(FlagMap.game.resetGameState),
    hasFlag(debug.debugSystemStatus),
    hasFlag(debug.debugShowInventory),
    hasFlag(debug.debugPerformance),
    state.stage,
    state.roomMap,
    state.player?.inventory,
    dispatch,
    clearFlag,
    setTimer
  ]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(FlagMap.audio.playAmbientSound)) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.playAmbientAudio) {
          module.playAmbientAudio();
        }
      });
      clearFlag(FlagMap.audio.playAmbientSound);
        clearFlag(FlagMap.audio.playAmbientSound);
    }

    if (hasFlag(FlagMap.audio.stopAllAudio)) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.stopAllAudio) {
          module.stopAllAudio();
        }
      });
      clearFlag(FlagMap.audio.stopAllAudio);
    }

    if (hasFlag(FlagMap.audio.muteAudio)) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.setMute) {
          module.setMute(true);
        }
      });
      clearFlag(FlagMap.audio.muteAudio);
    }
  }, [
    hasFlag(FlagMap.audio.playAmbientSound),
    hasFlag(FlagMap.audio.stopAllAudio),
    hasFlag(FlagMap.audio.muteAudio),
    loadModule,
    clearFlag
  ]);

  
// React effect hook
  useEffect(() => {
    if (hasFlag(FlagMap.game.saveGame)) {
      loadModule('../engine/save/saveController').then((module) => {
        if (module?.saveGame) {
          module.saveGame(state);

          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: 'Game saved successfully.',
              type: 'system',
              timestamp: Date.now()
            }
          });
        }
      });
      clearFlag(FlagMap.game.saveGame);
    }

    if (hasFlag(FlagMap.game.loadGame)) {
      loadModule('../engine/save/saveController').then((module) => {
        if (module?.loadGame) {
// Variable declaration
          const saveData = module.loadGame();
          if (saveData) {
            dispatch({ type: 'LOAD_GAME', payload: saveData });

            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                text: 'Game loaded successfully.',
                type: 'system',
                timestamp: Date.now()
              }
            });
          }
        }
      });
      clearFlag(FlagMap.game.loadGame);
    }
  }, [
    hasFlag(FlagMap.game.saveGame),
    hasFlag(FlagMap.game.loadGame),
    state,
    dispatch,
    loadModule,
    clearFlag
  ]);
};
