// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: RoomRenderer.jsx
// Path: src/components/RoomRenderer.jsx


// File: src/components/RoomRenderer.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// RoomRenderer component for Gorstan game.
// Renders the current room's image, description, and available exits as interactive buttons.

import React from 'react';
import PropTypes from 'prop-types';

/**
 * RoomRenderer
 * Displays the current room's image, description, and exits.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.room - The current room object to render.
 * @returns {JSX.Element}
 */
const RoomRenderer = ({ room }) => {
  // If no room data is available, show a fallback message.
  if (!room) {
    return (
      <div className="p-4 text-green-400 bg-black border border-green-700 rounded">
        No room data available. Try resetting the game?
      </div>
    );
  }

  // Ensure the description is always an array for consistent rendering.
  const descriptionArray = Array.isArray(room.description)
    ? room.description
    : [room.description];

  /**
   * getImageUrl
   * Returns the image URL for the room, or null if not present.
   * @param {string} filename - The image filename.
   * @returns {string|null}
   */
  const getImageUrl = (filename) => (filename ? `/images/${filename}` : null);
  const roomImage = getImageUrl(room.image);

  return (
    <div className="flex flex-row gap-4 p-4 bg-black text-green-400 border-2 border-green-600 rounded-xl shadow-xl">
      {/* Left: Image and description */}
      <div className="flex-1 max-w-[60%]">
        {roomImage && (
          <img
            src={roomImage}
            alt={room.name}
            className="w-full max-w-sm mx-auto rounded shadow"
          />
        )}
        <div className="mt-4">
          {descriptionArray.map((line, index) => (
            <p key={index} className="mb-2">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Right: Exits with tooltips */}
      <div className="flex flex-col justify-center items-start space-y-2 w-32">
        {(room.exits && Object.entries(room.exits).length > 0) ? (
          Object.entries(room.exits).map(([direction, targetRoom]) => (
            <button
              key={direction}
              title={`Go to ${targetRoom.displayName || targetRoom}`}
              className="text-green-300 hover:text-green-100 text-xs bg-green-900 px-2 py-1 rounded shadow hover:scale-105 transition-transform"
              // TODO: Add onClick handler to actually move to the target room.
            >
              {direction.toUpperCase()}
            </button>
          ))
        ) : (
          <p className="text-xs italic">No visible exits</p>
        )}
      </div>
    </div>
  );
};

RoomRenderer.propTypes = {
  room: PropTypes.object,
};

// Export the RoomRenderer component for use in the main application
export default RoomRenderer;

