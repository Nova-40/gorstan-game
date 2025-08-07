// src/components/DebugPanel.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// User interface panel display.

import React from 'react';
import { useGameState } from '../state/gameState';

const DebugPanel: React.FC = () => {
  const { state, dispatch } = useGameState();

// Variable declaration
  const clearFlags = () => {
    dispatch({ type: 'CLEAR_ALL_FLAGS' });
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        text: '[DEBUG] All flags cleared.',
        type: 'system',
        timestamp: Date.now()
      }
    });
  };

// Variable declaration
  const listFlags = Object.keys(state.flags || {});

// JSX return block or main return
  return (
    <div className="debug-panel">
      <button onClick={() => dispatch({ type: 'SET_ROOM', payload: { roomId: 'offgorstanZone_ancientvault' } })}>
        Warp: Ancient Vault
      </button>
      <button onClick={() => dispatch({ type: 'SET_ROOM', payload: { roomId: 'offmultiverseZone_shatteredrealm' } })}>
        Warp: Shattered Realm
      </button>
      <button onClick={() => dispatch({ type: 'SET_FLAG', payload: { key: 'napkinExtrapolated', value: true } })}>
        Set Flag: Napkin Extrapolated
      </button>
      <button onClick={() => dispatch({ type: 'SET_FLAG', payload: { key: 'sidedWith', value: 'al' } })}>
        Set Flag: Sided with Al
      </button>
      <h3>Debug Panel</h3>
      <button onClick={clearFlags}>Clear All Flags</button>
      <h4>Active Flags:</h4>
      <ul>
        {listFlags.length === 0 ? (
          <li><em>No active flags</em></li>
        ) : (
          listFlags.map((flag, i) => <li key={i}>{flag}</li>)
        )}
      </ul>
    </div>
  );
};

export default DebugPanel;
