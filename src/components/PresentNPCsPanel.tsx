// src/components/PresentNPCsPanel.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import React from 'react';
import type { NPC } from '../types/NPCTypes';

interface PresentNPCsPanelProps {
  npcs: NPC[];
  onTalkToNPC?: (npc: NPC) => void;
}

const PresentNPCsPanel: React.FC<PresentNPCsPanelProps> = ({ npcs, onTalkToNPC }) => {
  if (!npcs.length) return null;

  return (
    <div className="present-npcs-panel mt-2 flex flex-wrap gap-2 justify-center">
      {npcs.map((npc) => (
        <div
          key={npc.id}
          className="npc-card border border-green-700 p-2 rounded cursor-pointer hover:bg-green-900 transition"
          title={`Talk to ${npc.name}`}
          onClick={() => onTalkToNPC ? onTalkToNPC(npc) : console.warn('No onTalkToNPC handler provided')}
        >
          <div className="text-center font-mono text-green-300">{npc.name}</div>
          {npc.portrait && (
            <img
              src={npc.portrait}
              alt={`${npc.name}'s portrait`}
              className="mt-1 mx-auto max-w-[64px] max-h-[64px] rounded shadow-md"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PresentNPCsPanel;
