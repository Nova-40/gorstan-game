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
// Handles NPC logic, memory, or rendering.

import React from "react";
import type { NPC } from "../types/NPCTypes";

interface PresentNPCsPanelProps {
  npcs: NPC[];
  onTalkToNPC?: (npc: NPC) => void;
}

const PresentNPCsPanel: React.FC<PresentNPCsPanelProps> = ({
  npcs,
  onTalkToNPC,
}) => {
  if (!npcs.length) {return null;}

  return (
    <div className="present-npcs-panel mt-2 flex flex-wrap gap-2 justify-center">
      {npcs.map((npc) => (
        <div
          key={npc.id}
          className="npc-card border border-green-700 p-2 rounded cursor-pointer hover:bg-green-900 transition"
          title={`Talk to ${npc.name}`}
          onClick={() =>
            onTalkToNPC
              ? onTalkToNPC(npc)
              : console.warn("No onTalkToNPC handler provided")
          }
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
