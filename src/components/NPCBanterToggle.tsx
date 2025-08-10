// src/components/NPCBanterToggle.tsx
// NPC Banter Toggle Component for Inter-NPC Conversations
// Gorstan Game Beta 1

import React, { useState } from 'react';
import { useGameState } from '../state/gameState';

const NPCBanterToggle: React.FC = () => {
  const { state, dispatch } = useGameState();
  const [hovered, setHovered] = useState(false);

  const overhearEnabled = state.overhearNPCBanter ?? true;

  const toggleBanter = () => {
    const newState = !overhearEnabled;
    dispatch({
      type: 'SET_OVERHEAR',
      payload: newState
    });
  };

  return (
    <button
      onClick={toggleBanter}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        px-3 py-2 rounded-lg border transition-all duration-200
        ${overhearEnabled 
          ? 'bg-blue-600 border-blue-500 text-white' 
          : 'bg-gray-600 border-gray-500 text-gray-300'
        }
        ${hovered ? 'shadow-lg transform scale-105' : ''}
        hover:border-opacity-80
      `}
      title={overhearEnabled ? 'Hide NPC conversations' : 'Show NPC conversations'}
    >
      {overhearEnabled ? '💬' : '🤐'}
      <span className="ml-2 text-sm">
        {overhearEnabled ? 'NPC Chatter On' : 'NPC Chatter Off'}
      </span>
    </button>
  );
};

export default NPCBanterToggle;
