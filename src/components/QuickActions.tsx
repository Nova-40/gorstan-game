// QuickActions.tsx — components/QuickActions.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: QuickActions

// Filename: QuickActions.tsx
// Location: components/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import React, { useState } from 'react';
import { Button } from './button';
import { GameStateContext } from '../state/gameState';
import TeleportationMenu from './TeleportationMenu';
import TravelMenu from './TravelMenu';
import type { Room } from '../types/Room.d.ts';

interface QuickActionsProps {
  room: Room | undefined;
}

const directions = ['north', 'south', 'east', 'west', 'up', 'down', 'jump', 'sit'];

const QuickActions: React.FC<QuickActionsProps> = ({ room }) => {
  const game = React.useContext(GameStateContext);
  const [showTeleportMenu, setShowTeleportMenu] = useState(false);
  
  if (!game) {
    return <div className="text-red-400">Game state not available.</div>;
  }

  const { state, dispatch } = game;

  const handleAction = (command: string) => {
    dispatch({ type: 'PROCESS_COMMAND', payload: { command } });
  };

  const handleTeleport = (destinationId: string) => {
    handleAction(`teleport to ${destinationId}`);
  };

  const handleTravelMenuTeleport = (destinationId: string) => {
    // Clear the travel menu flag and teleport
    dispatch({ 
      type: 'UPDATE_GAME_STATE', 
      payload: { 
        flags: { 
          ...state.flags, 
          showTravelMenu: false,
          travelMenuTitle: undefined,
          travelMenuSubtitle: undefined,
          travelDestinations: undefined,
        } 
      } 
    });
    handleAction(`teleport to ${destinationId}`);
  };

  const closeTravelMenu = () => {
    dispatch({ 
      type: 'UPDATE_GAME_STATE', 
      payload: { 
        flags: { 
          ...state.flags, 
          showTravelMenu: false,
          travelMenuTitle: undefined,
          travelMenuSubtitle: undefined,
          travelDestinations: undefined,
        } 
      } 
    });
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
          {/* Sit Button - only shows in crossing when not already sitting */}
          {!state.flags?.sittingInCrossingChair && (state.currentRoomId === 'crossing' || state.currentRoomId === 'introZone_crossing') && (
            <Button
              onClick={() => handleAction('sit')}
              className="text-sm text-blue-300 hover:text-blue-100"
            >
              🪑 Sit in Chair
            </Button>
          )}
          {/* Chair Press Button - only shows when sitting in crossing chair */}
          {state.flags?.sittingInCrossingChair && (state.currentRoomId === 'crossing' || state.currentRoomId === 'introZone_crossing') && (
            <Button
              onClick={() => handleAction('press')}
              className="text-sm text-yellow-300 hover:text-yellow-100 bg-yellow-900 hover:bg-yellow-800"
            >
              ✨ Press
            </Button>
          )}
          {/* Stand Button - only shows when sitting in crossing chair */}
          {state.flags?.sittingInCrossingChair && (state.currentRoomId === 'crossing' || state.currentRoomId === 'introZone_crossing') && (
            <Button
              onClick={() => handleAction('stand')}
              className="text-sm text-gray-300 hover:text-gray-100"
            >
              🚶 Stand Up
            </Button>
          )}
          {/* Remote Control Fast Travel */}
          {inventory.includes('remote_control') && (state.currentRoomId === 'crossing' || state.currentRoomId === 'introZone_crossing') && (
            <Button
              onClick={() => setShowTeleportMenu(true)}
              className="text-sm text-purple-300 hover:text-purple-100"
            >
              Use Remote
            </Button>
          )}
          {/* Navigation Crystal Limited Travel */}
          {!inventory.includes('remote_control') && inventory.includes('navigation_crystal') && (state.currentRoomId === 'crossing' || state.currentRoomId === 'introZone_crossing') && (
            <Button
              onClick={() => setShowTeleportMenu(true)}
              className="text-sm text-blue-300 hover:text-blue-100"
            >
              Use Crystal
            </Button>
          )}
        </div>
      </div>
      
      {/* Teleportation Menu */}
      {state.flags?.showTravelMenu && (
        <TravelMenu
          title={state.flags.travelMenuTitle || "Travel Menu"}
          subtitle={state.flags.travelMenuSubtitle || "Select your destination"}
          destinations={state.flags.travelDestinations || state.player.visitedRooms || []}
          onTeleport={handleTravelMenuTeleport}
          onClose={closeTravelMenu}
        />
      )}
      
      {showTeleportMenu && (
        <TeleportationMenu
          onTeleport={handleTeleport}
          onClose={() => setShowTeleportMenu(false)}
          hasRemoteControl={inventory.includes('remote_control')}
          hasNavigationCrystal={inventory.includes('navigation_crystal')}
        />
      )}
    </div>
  );
};

export default QuickActions;
