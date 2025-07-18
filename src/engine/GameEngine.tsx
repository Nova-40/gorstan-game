// GameEngine.tsx
// Gorstan (c) 2025 Geoffrey Alan Webster. MIT Licence
// Version: 6.1.0

import React from 'react';
import { useGameState } from '../state/gameState';
import TerminalConsole from '../components/TerminalConsole';
import CommandInput from '../components/CommandInput';
import QuickActions from '../components/QuickActions';
import type { Room } from '../types/Room';

const GameEngine: React.FC = () => {
  const { state, dispatch } = useGameState();
  const { currentRoomId, roomMap, player } = state;

  // Pull the room from the roomMap
  const room: Room | undefined = currentRoomId ? roomMap[currentRoomId] : undefined;

  if (!room) {
    // Log an error for dev visibility, show user-facing text
    console.error(`[GameEngine] No current room found for ID: ${currentRoomId}`);
    return (
      <div className="h-full w-full bg-black text-red-400 flex flex-col justify-center items-center p-8">
        <div className="text-lg">Initialising room context...</div>
        <div className="text-xs text-gray-500">
          (Room ID missing or not yet loaded: <code>{currentRoomId}</code>)
        </div>
      </div>
    );
  }

  // --- Quad view rendering ---
  return (
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen gap-2 p-2 bg-black text-green-400 font-mono">
      {/* Top left: Room view */}
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
          <strong>Items:</strong> {room.items.map((item) => typeof item === 'string' ? item : item.name).join(', ')}
          </div>
        )}
        {room.npcs && room.npcs.length > 0 && (
          <div className="mt-1 text-sm text-green-200">
          <strong>NPCs:</strong> {room.npcs.map((npc) => typeof npc === 'string' ? npc : npc.name).join(', ')}
          </div>
        )}
      </div>

      {/* Top right: TerminalConsole */}
      <div className="p-2 border border-green-500 overflow-auto">
        <TerminalConsole />
      </div>

      {/* Bottom left: CommandInput */}
      <div className="p-2">
        <CommandInput playerName={player.name || 'Player'} onCommand={(cmd) => dispatch({ type: 'RECORD_MESSAGE', payload: { id: Date.now().toString(), text: `> ${cmd}`, type: 'action', timestamp: Date.now() } })} />
      </div>

      {/* Bottom right: QuickActions */}
      <div className="p-2">
        <QuickActions room={room} />
      </div>
    </div>
  );
};

export default GameEngine;




