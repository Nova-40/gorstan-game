// src/components/MovementPanel.jsx
// Gorstan v3.3 – Movement Panel with working green pick-up buttons and auto-removal

import React from 'react';
import PropTypes from 'prop-types';
import { getItemById } from '../engine/items';

const MovementPanel = ({
  currentRoom,
  onMove,
  flags = {},
  traits = [],
  inventory = [],
  previousRoomId,
  onPickUp,
  onInspect,
  onUse,
  onDrop,
  roomNameMap = {},
}) => {
  if (!currentRoom?.exits) return null;

  const isGodmode = flags.godmode === true;

  const directionLabels = {
    north: 'Go North',
    south: 'Go South',
    east: 'Go East',
    west: 'Go West',
    up: 'Go Up',
    down: 'Go Down',
    jump: 'Leap Boldly',
  };

  const visibleExits = Object.entries(currentRoom.exits).filter(
    ([, destination]) =>
      destination &&
      destination !== '???' &&
      (isGodmode || !destination.startsWith('_hidden'))
  );

  const getRoomName = (roomId) => roomNameMap[roomId] || roomId;

  const isInInventory = (itemId) =>
    inventory.some((invItem) => invItem.id === itemId || invItem.name === itemId);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Movement Buttons with tooltips */}
      <div className="flex flex-wrap justify-center gap-3">
        {visibleExits.map(([direction, destination]) => (
          <button
            key={`exit-${direction}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            onClick={() => onMove(direction)}
            title={`To ${getRoomName(destination)}`}
            aria-label={`Go ${directionLabels[direction] || direction}`}
          >
            {directionLabels[direction] || direction}
          </button>
        ))}

        {currentRoom.exits.jump && currentRoom.exits.jump !== '???' && (
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
            onClick={() => onMove('jump')}
            title={`To ${getRoomName(currentRoom.exits.jump) || 'Unknown jump location'}`}
            aria-label="Jump into the unknown"
          >
            🚀 Jump
          </button>
        )}

        {previousRoomId && (
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
            onClick={() => onMove('back')}
            title={`Back to ${getRoomName(previousRoomId) || 'previous room'}`}
            aria-label="Go back"
          >
            ⬅️ Back
          </button>
        )}
      </div>

      {/* Room Item Pickup */}
      {currentRoom.items?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {currentRoom.items.map((itemId) => {
            if (isInInventory(itemId)) return null;
            const item = getItemById(itemId);
            if (!item) return null;
            return (
              <button
                key={`item-${itemId}`}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                onClick={() => onPickUp?.(item)}
                title={`Pick up ${item.name}`}
              >
                🧺 Pick up {item.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Inventory Management */}
      {inventory.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {inventory.map((item) => (
            <div key={`inv-${item.id || item.name}`} className="flex gap-1">
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                onClick={() => onInspect?.(item)}
                title={`Inspect ${item.name || item.id}`}
              >
                🔍 {item.name || item.id}
              </button>
              <button
                className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                onClick={() => onUse?.(item)}
                title={`Use ${item.name || item.id}`}
              >
                🧪
              </button>
              <button
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                onClick={() => onDrop?.(item)}
                title={`Drop ${item.name || item.id}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

MovementPanel.propTypes = {
  currentRoom: PropTypes.object.isRequired,
  onMove: PropTypes.func.isRequired,
  flags: PropTypes.object,
  traits: PropTypes.array,
  inventory: PropTypes.array,
  previousRoomId: PropTypes.string,
  onPickUp: PropTypes.func,
  onInspect: PropTypes.func,
  onUse: PropTypes.func,
  onDrop: PropTypes.func,
  roomNameMap: PropTypes.object,
};

export default MovementPanel;
