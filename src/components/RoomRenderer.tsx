// src/components/RoomRenderer.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import React, { useState, useEffect } from 'react';

import { Bone, Fish, Bot, UserCircle, ChefHat, Shield, Diamond, Compass, Eye } from 'lucide-react';


import { Room, RoomNPC, RoomItem } from '../types/Room';

import { useGameState } from '../state/gameState';














const npcIconMap: Record<string, React.ElementType> = {
  'mr wendell': Bone,
  dominic: Fish,
  ayla: Bot,
  polly: UserCircle,
  chef: ChefHat,
  albie: Shield,
};

interface NpcDisplayProps {
  npc: RoomNPC;
}

const NpcDisplay: React.FC<NpcDisplayProps> = ({ npc }) => {
// Variable declaration
  const Icon = npcIconMap[npc.name.toLowerCase()] || UserCircle;
// Variable declaration
  const description = npc.entryMessage || `${npc.name} is here.`;
// JSX return block or main return
  return (
    <div className="npc-item flex items-center space-x-2" title={description}>
      <Icon size={20} className="text-green-400" />
      <span className="npc-name font-medium text-green-300">{npc.name}</span>
    </div>
  );
};

const RoomRenderer: React.FC = () => {
  const { state, dispatch } = useGameState();
// Variable declaration
  const room = state.roomMap?.[state.currentRoomId];
// React state declaration
  const [looked, setLooked] = useState(false);
  const [lastRoomId, setLastRoomId] = useState<string | null>(null);

// React effect hook
  useEffect(() => {
    setLooked(false);

    
    if (room && room.id !== lastRoomId) {
      setLastRoomId(room.id);

// Variable declaration
      const descriptionLines = Array.isArray(room.description)
        ? room.description
        : [room.description ?? 'You see nothing of note.'];

      
// Variable declaration
      const entryMessages = [
        { text: `--- ${room.title} ---`, type: 'narrative' },
        ...descriptionLines.map(line => ({ text: line, type: 'narrative' }))
      ];

      
      if (room.consoleIntro && room.consoleIntro.length > 0) {
        
// Variable declaration
        const interpolateText = (text: string): string => {
          return text.replace(/\{\{PLAYER_NAME\}\}/g, state.player?.name || 'Player');
        };

// Variable declaration
        const consoleIntroMessages = [
          { text: '', type: 'system' }, 
          { text: `=== ${room.title.toUpperCase()} ===`, type: 'system' },
          ...room.consoleIntro.map(line => ({ text: interpolateText(line), type: 'system' })),
          { text: '', type: 'system' } 
        ];
        entryMessages.push(...consoleIntroMessages);
      }

      
// Variable declaration
      const roomData = room as any; 
      if (roomData.traps && roomData.traps.length > 0 && !state.player?.flags?.trapsDisabled) {
        
// Variable declaration
        const activeTrap = roomData.traps.find((trap: any) => !trap.triggered);
        if (activeTrap) {
          dispatch({ type: 'TRIGGER_TRAP', payload: activeTrap });
        }
      }

      
// Variable declaration
      const entryTimestamp = Date.now();
      entryMessages.forEach((msg, index) => {
// Variable declaration
        const message = {
          id: `room-entry-${room.id}-${entryTimestamp}-${index}`,
          text: msg.text,
          type: msg.type as any,
          timestamp: entryTimestamp + index, 
        };
        dispatch({ type: 'RECORD_MESSAGE', payload: message });
      });
    }
  }, [room?.id, lastRoomId, room, dispatch]);

  if (!room || !room.id) {
// JSX return block or main return
    return (
      <div className="room-container p-4 text-center text-red-500">
        Error: No room data available.
        <div className="text-sm mt-2 text-gray-600">
          Current Room ID: {state.currentRoomId || 'undefined'}
        </div>
      </div>
    );
  }

// Variable declaration
  const hasExtraDetails = room.items && room.items.length > 0;

// JSX return block or main return
  return (
    <div className="room-container flex flex-col h-full bg-black rounded-lg shadow-inner overflow-hidden border border-green-600">
      {}
      {room.image ? (
        <div className="room-image-wrapper h-full w-full overflow-hidden">
          <img
            src={`/images/${room.image}`}
            alt={room.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log(`Failed to load image: /images/${room.image}`);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="room-no-image h-full w-full flex items-center justify-center bg-gray-900 text-green-600">
          <div className="text-center">
            <h2 className="text-xl font-bold text-green-400 mb-2">{room.title}</h2>
            <p className="text-sm">No image available</p>
          </div>
        </div>
      )}

      {}
      {room.music && (
        <audio autoPlay loop>
          <source src={room.music} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
};

export default RoomRenderer;
