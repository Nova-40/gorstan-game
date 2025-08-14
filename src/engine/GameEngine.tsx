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
// Core game engine module.

import CommandInput from "../components/CommandInput";

import QuickActionsPanel from "../components/QuickActionsPanel";

import React from "react";

import TerminalConsole from "../components/TerminalConsole";

import type { Room } from "../types/Room";

// Removed duplicate Room import

import { useGameState } from "../state/gameState";

const GameEngine: React.FC = () => {
  const { state, dispatch } = useGameState();
  const { currentRoomId, roomMap, player } = state;

  const room: Room | undefined = currentRoomId
    ? roomMap[currentRoomId]
    : undefined;

  if (!room) {
    console.error(
      `[GameEngine] No current room found for ID: ${currentRoomId}`,
    );
    // JSX return block or main return
    return (
      <div className="h-full w-full bg-black text-red-400 flex flex-col justify-center items-center p-8">
        <div className="text-lg">Initialising room context...</div>
        <div className="text-xs text-gray-500">
          (Room ID missing or not yet loaded: <code>{currentRoomId}</code>)
        </div>
      </div>
    );
  }

  // JSX return block or main return
  return (
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen gap-2 p-2 bg-black text-green-400 font-mono">
      {}
      <div className="p-2 border border-green-500 overflow-auto">
        <div className="text-2xl mb-2 font-bold">{room.title}</div>
        {room.image && (
          <img
            src={room.image}
            alt={room.title}
            className="w-full max-h-64 object-contain mb-2 rounded"
            style={{ background: "#0a0a0a", border: "1px solid #1fa350" }}
          />
        )}
        <pre className="whitespace-pre-wrap text-base">{room.description}</pre>
        {room.items && room.items.length > 0 && (
          <div className="mt-2 text-sm text-green-300">
            <strong>Items:</strong>{" "}
            {room.items
              .map((item) => (typeof item === "string" ? item : item.name))
              .join(", ")}
          </div>
        )}
        {room.npcs && room.npcs.length > 0 && (
          <div className="mt-1 text-sm text-green-200">
            <strong>NPCs:</strong>{" "}
            {room.npcs
              .map((npc) => (typeof npc === "string" ? npc : npc.name))
              .join(", ")}
          </div>
        )}
      </div>

      {}
      <div className="p-2 border border-green-500 overflow-auto">
        <TerminalConsole />
      </div>

      {}
      <div className="p-2">
        <CommandInput
          playerName={player.name || "Player"}
          onCommand={(cmd) =>
            dispatch({
              type: "RECORD_MESSAGE",
              payload: {
                id: Date.now().toString(),
                text: `> ${cmd}`,
                type: "action",
                timestamp: Date.now(),
              },
            })
          }
        />
      </div>

      {}
      <div className="p-2">
        {/* QuickActionsPanel temporarily disabled until props can be properly wired */}
        {/* <QuickActionsPanel ... /> */}
      </div>
    </div>
  );
};

export default GameEngine;
