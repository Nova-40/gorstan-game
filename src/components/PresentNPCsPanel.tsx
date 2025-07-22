// PresentNPCsPanel.tsx
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Displays both static and wandering NPCs with animations and tooltips

import React from 'react';
import { NPC } from '../NPCTypes';


// All portraits are in /public/images/
const npcPortraitMap: Record<string, string> = {
  Al: '/images/Al.png',
  Polly: '/images/Polly.png',
  Dominic: '/images/Dominic.png',
  Morthos: '/images/Morthos.png',
  Chef: '/images/Chef.png',
  MrWendell: '/images/MrWendell.png',
  Librarian: '/images/Librarian.png',
  Barista: '/images/Barista.png',
};

const defaultPortrait = '/images/Unknown.png';



interface PresentNPCsPanelProps {
  npcs: NPC[];
  wanderingNPCs?: NPC[];
}

const PresentNPCsPanel: React.FC<PresentNPCsPanelProps> = ({ npcs, wanderingNPCs = [] }) => {
  const allNPCs = [...npcs, ...wanderingNPCs];

  return (
    <div className="flex flex-wrap gap-4 p-2">
      {allNPCs.map((npc) => {
        const portrait = npcPortraitMap[npc.id] || `/images/${npc.id}.png`;
        return (
          <div
            key={npc.id + '-' + (npc.name || '')}
            className="flex flex-col items-center animate-fadeIn"
            title={npc.description ?? npc.name ?? npc.id}
          >
            <img
              src={portrait}
              alt={npc.id}
              className="w-20 h-20 rounded-xl shadow-md object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultPortrait; }}
            />
            <span className="text-sm text-gray-200 mt-1">{npc.name ?? npc.id}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PresentNPCsPanel;
