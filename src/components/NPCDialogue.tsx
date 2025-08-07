// src/components/NPCDialogue.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

import React, { useState, useEffect } from 'react';
import { NPC } from '../types/NPCTypes';

type NPCDialogueProps = {
  npc?: string | null;
  onClose: () => void;
  playerName?: string;
  dispatchGameState?: (action: { type: string }) => void;
};

const NPCDialogue: React.FC<NPCDialogueProps> = ({
  npc,
  onClose,
  playerName,
  dispatchGameState,
}) => {
  const [message, setMessage] = useState<string | null>(null);

// React effect hook
  useEffect(() => {
    if (
      npc === 'wendell' &&
      playerName?.toLowerCase() !== 'mr wendell'
    ) {
      const usedBefore = localStorage.getItem('wendellRude') === 'true';
      const phrase = "You must respect the proper forms of address!";
      setMessage(usedBefore ? `${phrase} Again.` : phrase);
      localStorage.setItem('wendellRude', 'true');

      setTimeout(() => {
        document.body.classList.add('flash-red');
        setTimeout(() => {
          document.body.classList.remove('flash-red');
          if (dispatchGameState) {
            dispatchGameState({ type: 'RESET' });
          }
        }, 1200);
      }, 1800);
    }
  }, [npc, playerName, dispatchGameState]);

  const npcLines: Record<string, string> = {
    dominic: "Bloop. You again?",
    polly: "What do you want? I'm thinking.",
    albie: "Stay in your lane, citizen.",
    chef: "Order up!",
    ayla: "I'm part of the game, not playing it — so they are your choices.",
    'mr wendell': "Greetings. I remember everything. Even you."
  };

  if (!npc) return null;

// JSX return block or main return
  return (
    <div className="fixed bottom-4 right-4 bg-black border border-green-600 text-green-300 p-4 rounded w-64 shadow-xl z-50">
      <div className="flex justify-between items-center mb-2">
        <strong>{npc.charAt(0).toUpperCase() + npc.slice(1)}</strong>
        <button className="text-green-400 hover:text-red-400" onClick={onClose} type="button">&times;</button>
      </div>
      <p className="text-sm italic">
        {message || npcLines[npc.toLowerCase()] || "They don't respond."}
      </p>
    </div>
  );
};

export default NPCDialogue;
