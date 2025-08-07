// src/components/debug/DebugPanel.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// User interface panel display.

import React, { useState } from 'react';
import { useGameState } from '../../state/gameState';
import { Room } from '../../types/Room';

// Variable declaration
const DebugPanel = () => {
// React state declaration
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useGameState();

// Variable declaration
  const handleRevealRooms = () => {
    // Reveal all visited rooms - dispatch appropriate action
    dispatch({ type: 'DEBUG_REVEAL_ROOMS' });
  };

// Variable declaration
  const handleJump = (roomId: string) => {
    dispatch({ type: 'SET_ROOM', payload: { roomId } });
  };

// Variable declaration
  const handleAddItem = (itemId: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item: itemId } });
  };

// Variable declaration
  const handleSummonNPC = (npcId: string) => {
    dispatch({ type: 'SUMMON_NPC', payload: { npcId } });
  };

// Variable declaration
  const handleKillPlayer = () => {
    dispatch({ type: 'KILL_PLAYER', payload: { reason: "Debug override: instant death triggered." } });
  };

// Variable declaration
  const handleToggleAchievement = (id: string) => {
    dispatch({ type: 'TOGGLE_ACHIEVEMENT', payload: { achievementId: id } });
  };

// JSX return block or main return
  return (
    <div className="debug-panel">
      <button onClick={() => setIsOpen(!isOpen)} className="debug-toggle">
        {isOpen ? 'Close Debug' : 'Open Debug'}
      </button>
      {isOpen && (
        <div className="debug-content">
          <h2>Debug Panel</h2>
          <button onClick={handleRevealRooms}>Reveal All Rooms</button>
          <button onClick={() => handleJump('controlnexus')}>Jump to Control Nexus</button>
          <button onClick={() => handleAddItem('coffee')}>Add Coffee</button>
          <button onClick={() => handleSummonNPC('polly')}>Call Polly</button>
          <button onClick={handleKillPlayer}>💀 Kill Player</button>
          <button onClick={() => handleToggleAchievement('dominicMemory')}>Toggle Dominic Memory Achievement</button>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
