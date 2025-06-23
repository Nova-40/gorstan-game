// src/components/RoomRenderer_clean.jsx
// Gorstan v3.3 – Room Renderer without user selection
// MIT License © 2025 Geoff Webster

import React from 'react';
import PropTypes from 'prop-types';

const RoomRenderer = ({ room }) => {
  if (!room) {
    return (
      <div className="p-4 text-green-400 bg-black border border-green-700 rounded">
        No room data available. Try resetting the game?
      </div>
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
    <div className="flex flex-row gap-4 p-4 bg-black text-green-400 border-2 border-green-600 rounded-xl shadow-xl">
      {/* Room Image */}
      <div className="w-2/3">
        {roomImage ? (
          <img
            src={roomImage}
            alt={room.name}
            className="rounded-lg border border-green-500 shadow-md"
          />
        ) : (
          <div className="text-center italic text-green-600 border p-2 rounded">
            No image available for this room.
          </div>
        )}
      </div>

      {/* Room Details */}
      <div className="w-1/3 flex flex-col justify-between text-sm">
        <div>
          <h2 className="text-xl font-bold border-b border-green-600 pb-1 mb-2">
            {room.name}
          </h2>
          {descriptionArray.map((line, index) => (
            <p key={index} className="mb-2 italic">
              {line}
            </p>
          ))}
          <p className="mt-2 text-xs italic">
            Exits: {Object.keys(room.exits || {}).join(', ')}
          </p>
        </div>
      </div>
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
};

export default RoomRenderer;
