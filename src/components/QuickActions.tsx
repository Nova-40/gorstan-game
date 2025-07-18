// Filename: QuickActions.tsx
// Location: components/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import React from 'react';
import { Button } from './button';
import { GameStateContext } from '../state/gameState';
import type { Room } from '../types/Room.d.ts';

interface QuickActionsProps {
  room: Room | undefined;
}

const directions = ['north', 'south', 'east', 'west', 'up', 'down', 'jump', 'sit'];

const QuickActions: React.FC<QuickActionsProps> = ({ room }) => {
  const game = React.useContext(GameStateContext);
  if (!game) {
    return <div className="text-red-400">Game state not available.</div>;
  }

  const { state, dispatch } = game;

  const handleAction = (command: string) => {
    dispatch({ type: 'PROCESS_COMMAND', payload: { command } });
  };

  // Get available items in current room
  const roomItems = room?.items || [];
  
  // Get player inventory
  const inventory = state.player.inventory || [];
  
  // Get interactable NPCs in room
  const npcs = room?.npcs || [];

  if (!room) {
    return <div className="text-gray-500">No room loaded.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Movement Actions */}
      {room.exits && Object.keys(room.exits).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Movement</h4>
          <div className="grid grid-cols-2 gap-2">
            {directions.map((dir) => {
              const isAvailable = !!room.exits?.[dir];
              return (
                <Button
                  key={dir}
                  onClick={() => handleAction(`go ${dir}`)}
                  disabled={!isAvailable}
                  className={`text-sm ${isAvailable ? 'text-green-300' : 'text-gray-600'}`}
                >
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Actions */}
      {roomItems.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-300 mb-2">Items</h4>
          <div className="grid grid-cols-2 gap-2">
            {roomItems.slice(0, 6).map((item, index) => (
              <Button
                key={`item-${index}`}
                onClick={() => handleAction(`take ${item.name || item.id}`)}
                className="text-sm text-yellow-300 hover:text-yellow-100"
              >
                Take {item.name || item.id}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Actions */}
      {inventory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-cyan-300 mb-2">Inventory</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleAction('inventory')}
              className="text-sm text-cyan-300 hover:text-cyan-100"
            >
              Show Inventory
            </Button>
            <Button
              onClick={() => handleAction('codex')}
              className="text-sm text-purple-300 hover:text-purple-100"
            >
              View Codex
            </Button>
            {inventory.slice(0, 4).map((item, index) => (
              <Button
                key={`inv-${index}`}
                onClick={() => handleAction(`use ${item}`)}
                className="text-sm text-cyan-300 hover:text-cyan-100"
              >
                Use {item}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* NPC Interaction Actions */}
      {npcs.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-300 mb-2">NPCs</h4>
          <div className="grid grid-cols-2 gap-2">
            {npcs.slice(0, 6).map((npc, index) => (
              <Button
                key={`npc-${index}`}
                onClick={() => handleAction(`talk to ${npc.name || npc.id}`)}
                className="text-sm text-green-300 hover:text-green-100"
              >
                Talk {npc.name || npc.id}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* General Actions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleAction('look')}
            className="text-sm text-gray-300 hover:text-gray-100"
          >
            Look Around
          </Button>
          <Button
            onClick={() => handleAction('help')}
            className="text-sm text-blue-300 hover:text-blue-100"
          >
            Help
          </Button>
          {room.id?.includes('puzzle') && (
            <Button
              onClick={() => handleAction('hint')}
              className="text-sm text-orange-300 hover:text-orange-100"
            >
              Get Hint
            </Button>
          )}
          {/* Remote Control Fast Travel */}
          {inventory.includes('remote_control') && state.currentRoomId === 'introZone_crossing' && (
            <Button
              onClick={() => handleAction('use remote_control')}
              className="text-sm text-purple-300 hover:text-purple-100"
            >
              Use Remote
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
