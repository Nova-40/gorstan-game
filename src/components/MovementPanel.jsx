// src/components/MovementPanel.jsx
// Gorstan v3.2.8 – Improved Movement Panel with Exit Validation

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setSelectedUser(null);
  }, [currentRoom]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

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

  // ✅ Safe filter: destination must be truthy and not a hidden/placeholder unless in godmode
  const visibleExits = Object.entries(currentRoom.exits).filter(
    ([, destination]) =>
      destination &&
      destination !== '???' &&
      (isGodmode || !destination.startsWith('_hidden'))
  );

  const getRoomName = (roomId) => roomNameMap[roomId] || `Unknown (${roomId})`;

  const handleMoveClick = (roomId) => {
    if (roomId) onMove?.(roomId);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Movement Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {visibleExits.map(([direction, roomId]) => (
          <button
            key={`exit-${direction}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            onClick={() => handleMoveClick(roomId)}
            title={`${directionLabels[direction] || direction} to ${getRoomName(roomId)}`}
            aria-label={`Go ${directionLabels[direction] || direction}`}
          >
            {directionLabels[direction] || direction}
          </button>
        ))}

        {currentRoom.exits.jump && currentRoom.exits.jump !== '???' && (
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
            onClick={() => handleMoveClick(currentRoom.exits.jump)}
            title="Leap boldly into the unknown"
            aria-label="Jump into the unknown"
          >
            🚀 Jump
          </button>
        )}

        {previousRoomId && (
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700"
            onClick={() => handleMoveClick(previousRoomId)}
            title="Return to previous room"
            aria-label="Go back"
          >
            ⬅️ Back
          </button>
        )}
      </div>

      {/* Room Item Pickup */}
      {currentRoom.items?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {currentRoom.items.map((item) => (
            <button
              key={`item-${item.id || item.name}`}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
              onClick={() => onPickUp?.(item)}
              title={`Pick up ${item.name || item.id}`}
            >
              🧺 Pick up {item.name || item.id}
            </button>
          ))}
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

      {/* User Selection */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Select User</h3>
        <div className="user-list-container">
          <ul className="user-list">
            {currentRoom.users?.map((user) => (
              <li
                key={user.id}
                className={selectedUser?.id === user.id ? 'selected' : ''}
                onClick={() => handleSelectUser(user)}
              >
                {user.name}
              </li>
            ))}
          </ul>
          {selectedUser && (
            <div className="user-details">
              <h2>{selectedUser.name}</h2>
              <p>Email: {selectedUser.email}</p>
            </div>
          )}
        </div>
      </div>
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
