// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: useOptimizedEffects.ts
// Description: Combined effects hook to reduce useEffect overhead

import { useEffect } from 'react';
import { useFlags } from './useFlags';
import { useModuleLoader } from './useModuleLoader';
import { useTimers } from './useTimers';

/**
 * Combined effects hook that batches multiple flag-based effects
 * Reduces the number of useEffect hooks and improves performance
 */
export const useOptimizedEffects = (
  state: any,
  dispatch: any,
  room: any
) => {
  const { hasFlag, clearFlag, setFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer } = useTimers();

  // Batch flag-based effects to reduce React overhead
  useEffect(() => {
    const flags = state.flags || {};
    const effectsToRun: Array<() => void> = [];

    // Debug system status
    if (hasFlag('debugSystemStatus')) {
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
        
        clearFlag('debugSystemStatus');
      });
    }

    // Reset game state
    if (hasFlag('resetGameState')) {
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
        
        clearFlag('resetGameState');
      });
    }

    // Clear all flags debug command
    if (hasFlag('debugClearAllFlags')) {
      effectsToRun.push(() => {
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

    // Show inventory debug
    if (hasFlag('debugShowInventory')) {
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
        
        clearFlag('debugShowInventory');
      });
    }

    // Performance analysis
    if (hasFlag('debugPerformance')) {
      effectsToRun.push(() => {
        const performance = window.performance;
        const memory = (performance as any).memory;
        
        console.log('[DEBUG] Performance Metrics:');
        console.log('- Memory Used:', memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A');
        console.log('- Memory Total:', memory ? `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A');
        console.log('- Navigation Timing:', performance.getEntriesByType('navigation'));
        
        clearFlag('debugPerformance');
      });
    }

    // Execute all batched effects
    if (effectsToRun.length > 0) {
      // Use a small delay to batch multiple flag changes
      setTimer({
        id: 'batch_effects',
        callback: () => {
          effectsToRun.forEach(effect => effect());
        },
        delay: 0 // Execute immediately but batched
      });
    }

  }, [
    // Only depend on specific flags to avoid unnecessary re-runs
    hasFlag('debugSystemStatus'),
    hasFlag('resetGameState'),
    hasFlag('debugClearAllFlags'),
    hasFlag('debugShowInventory'),
    hasFlag('debugPerformance'),
    state.stage,
    state.roomMap,
    state.player?.inventory,
    dispatch,
    clearFlag,
    setTimer
  ]);

  // Audio-related effects
  useEffect(() => {
    if (hasFlag('playAmbientSound')) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.playAmbientAudio) {
          module.playAmbientAudio();
        }
      });
      clearFlag('playAmbientSound');
    }

    if (hasFlag('stopAllAudio')) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.stopAllAudio) {
          module.stopAllAudio();
        }
      });
      clearFlag('stopAllAudio');
    }

    if (hasFlag('muteAudio')) {
      loadModule('../engine/audio/audioController').then((module) => {
        if (module?.setMute) {
          module.setMute(true);
        }
      });
      clearFlag('muteAudio');
    }
  }, [
    hasFlag('playAmbientSound'),
    hasFlag('stopAllAudio'),
    hasFlag('muteAudio'),
    loadModule,
    clearFlag
  ]);

  // Save/Load effects
  useEffect(() => {
    if (hasFlag('saveGame')) {
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
      clearFlag('saveGame');
    }

    if (hasFlag('loadGame')) {
      loadModule('../engine/save/saveController').then((module) => {
        if (module?.loadGame) {
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
      clearFlag('loadGame');
    }
  }, [
    hasFlag('saveGame'),
    hasFlag('loadGame'),
    state,
    dispatch,
    loadModule,
    clearFlag
  ]);
};
