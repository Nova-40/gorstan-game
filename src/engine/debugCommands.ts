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
// Debug commands for testing encounters and NPC movement

import { LocalGameState } from '../state/gameState';
import { GameAction } from '../types/GameTypes';
import { Dispatch } from 'react';

/**
 * Debug commands for testing game features
 */
export const debugCommands: Record<string, { description: string; handler: (gameState: LocalGameState, dispatch?: Dispatch<GameAction>) => any }> = {
  'debug morthos al': {
    description: 'Trigger the Morthos and Al encounter manually',
    handler: (gameState: LocalGameState, dispatch?: Dispatch<GameAction>) => {
      if (dispatch) {
        dispatch({ type: 'TRIGGER_MORTHOS_AL_ENCOUNTER', payload: null });
      }
      return {
        messages: [{
          id: `debug-encounter-${Date.now()}`,
          text: 'DEBUG: Morthos and Al encounter triggered.',
          type: 'system',
          timestamp: Date.now()
        }]
      };
    }
  },
  
  'debug npc movement': {
    description: 'Force NPC movement evaluation',
    handler: (gameState: LocalGameState, dispatch?: Dispatch<GameAction>) => {
      if (dispatch) {
        dispatch({ 
          type: 'SET_FLAG', 
          payload: { flag: 'evaluateWanderingNPCs', value: true } 
        });
      }
      
      return {
        messages: [{
          id: `debug-movement-${Date.now()}`,
          text: 'DEBUG: NPC movement evaluation triggered.',
          type: 'system',
          timestamp: Date.now()
        }]
      };
    }
  },

  'debug check flags': {
    description: 'Check current encounter flags',
    handler: (gameState: LocalGameState) => {
      const flags = gameState.flags || {};
      const relevantFlags = {
        hasMetMorthosAl: flags.hasMetMorthosAl,
        metMorthos: flags.metMorthos,
        metAl: flags.metAl,
        firstEncounterComplete: flags.firstEncounterComplete
      };
      
      return {
        messages: [{
          id: `debug-flags-${Date.now()}`,
          text: `DEBUG FLAGS: ${JSON.stringify(relevantFlags, null, 2)}`,
          type: 'system',
          timestamp: Date.now()
        }]
      };
    }
  },

  'debug reset encounter': {
    description: 'Reset the Morthos/Al encounter flags',
    handler: (gameState: LocalGameState, dispatch?: Dispatch<GameAction>) => {
      if (dispatch) {
        dispatch({ type: 'SET_FLAG', payload: { flag: 'hasMetMorthosAl', value: false } });
        dispatch({ type: 'SET_FLAG', payload: { flag: 'metMorthos', value: false } });
        dispatch({ type: 'SET_FLAG', payload: { flag: 'metAl', value: false } });
        dispatch({ type: 'SET_FLAG', payload: { flag: 'firstEncounterComplete', value: false } });
      }
      
      return {
        messages: [{
          id: `debug-reset-${Date.now()}`,
          text: 'DEBUG: Encounter flags reset. Visit control room again to trigger.',
          type: 'system',
          timestamp: Date.now()
        }]
      };
    }
  }
};

/**
 * Check if a command is a debug command and handle it
 */
export function handleDebugCommand(
  input: string, 
  gameState: LocalGameState, 
  dispatch: Dispatch<GameAction>
) {
  const command = input.toLowerCase().trim();
  
  if (debugCommands[command]) {
    return debugCommands[command].handler(gameState, dispatch);
  }
  
  return null;
}
