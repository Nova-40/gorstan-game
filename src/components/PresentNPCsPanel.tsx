// PresentNPCsPanel.tsx — components/PresentNPCsPanel.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: PresentNPCsPanel


import React from 'react';
import { useGameState } from '../state/gameState';
import { UserCircle2 } from 'lucide-react';
import './PresentNPCsPanel.css';

const PresentNPCsPanel: React.FC = () => {
  const { state } = useGameState();
  const currentRoom = state.roomMap?.[state.currentRoomId];

  if (!currentRoom?.npcs || currentRoom.npcs.length === 0) return null;

  return (
    <div className="present-npcs-panel">
      <h4 className="npc-label">Present NPCs:</h4>
      <div className="npc-icon-list">
        {currentRoom.npcs.map((npc) => (
          <div key={npc.id} className="npc-icon" title={npc.name}>
            <UserCircle2 size={20} />
            <span className="npc-name">{npc.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentNPCsPanel;
