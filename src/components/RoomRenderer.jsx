// src/components/RoomRenderer.jsx
// Gorstan v3.2.9 – Room Renderer with Debug and Fallback Image

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Dynamically import all images in /public/images/ (common formats)
const RoomRenderer = ({ room, users }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setSelectedUser(null);
  }, [users]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  if (!room) {
    return (
      <div className="p-4 text-gray-400">No room data available. Try resetting the game?</div>
    );
  }

  const descriptionArray = Array.isArray(room.description)
    ? room.description
    : [room.description];

  const getImageUrl = (filename) => {
  if (!filename) return null;
  return `/images/${filename}`;
};

  const roomImage = room.image ? getImageUrl(room.image) : null;

  return (
    <div className="rounded-xl border border-gray-200 p-4 shadow-md bg-white space-y-4 w-full max-w-3xl">
      <h2 className="text-2xl font-bold text-indigo-700 tracking-wide">
        {room.name || 'Unnamed Room'}
      </h2>

      {roomImage ? (
        <img
          src={roomImage}
          alt={room.name}
          className="w-full max-h-72 object-cover rounded-md shadow-sm"
        />
      ) : (
        <div className="text-center text-red-500 italic">
          No image available for this room.
        </div>
      )}

      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {descriptionArray.map((line, idx) => (
          <p key={`line-${idx}`} className="mb-2">
            {line}
          </p>
        ))}
      </div>

      {room.exits && (
        <div className="text-sm text-gray-500 italic">
          <strong>Exits:</strong> {Object.keys(room.exits).join(', ')}
        </div>
      )}

      {/* User selection */}
      <div className="user-list-container mt-4">
        <h3 className="text-lg font-semibold text-gray-700">Select a User:</h3>
        <ul className="user-list">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <li
                key={user.id}
                className={
                  selectedUser && selectedUser.id === user.id ? 'selected' : ''
                }
                onClick={() => handleSelectUser(user)}
              >
                {user.name}
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">No users found.</li>
          )}
        </ul>
      </div>

      {selectedUser && (
        <div className="user-details mt-2 p-2 border-t border-gray-200">
          <h4 className="font-semibold">{selectedUser.name}</h4>
          <p className="text-sm text-gray-600">Email: {selectedUser.email}</p>
        </div>
      )}
    </div>
  );
};

RoomRenderer.propTypes = {
  room: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    image: PropTypes.string,
    exits: PropTypes.object,
  }),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
    })
  ),
};

export default RoomRenderer;

