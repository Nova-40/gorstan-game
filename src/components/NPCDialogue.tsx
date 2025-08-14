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

import React, { useState, useEffect } from "react";
import { NPC } from "../types/NPCTypes";

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
    if (npc === "wendell" && playerName?.toLowerCase() !== "mr wendell") {
      const usedBefore = localStorage.getItem("wendellRude") === "true";
      const phrase = "You must respect the proper forms of address!";
      setMessage(usedBefore ? `${phrase} Again.` : phrase);
      localStorage.setItem("wendellRude", "true");

      setTimeout(() => {
        document.body.classList.add("flash-red");
        setTimeout(() => {
          document.body.classList.remove("flash-red");
          if (dispatchGameState) {
            dispatchGameState({ type: "RESET" });
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
    "mr wendell": "Greetings. I remember everything. Even you.",
  };

  if (!npc) {return null;}

  // JSX return block or main return
  return (
    <div className="fixed bottom-4 right-4 bg-black border border-green-600 text-green-300 p-4 rounded w-64 shadow-xl z-50">
      <div className="flex justify-between items-center mb-2">
        <strong>{npc.charAt(0).toUpperCase() + npc.slice(1)}</strong>
        <button
          className="text-green-400 hover:text-red-400"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
      </div>
      <p className="text-sm italic">
        {message || npcLines[npc.toLowerCase()] || "They don't respond."}
      </p>
    </div>
  );
};

export default NPCDialogue;
