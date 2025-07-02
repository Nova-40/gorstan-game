// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: RoomHeader.jsx
// Path: src/components/RoomHeader.jsx


// src/components/RoomHeader.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// RoomHeader component for Gorstan game.
// Displays the current room's name as a styled header.

/**
 * RoomHeader
 * Renders the name of the current room in a styled header.
 *
 * @param {Object} props - Component props.
 * @param {string} props.name - The name of the current room to display.
 * @returns {JSX.Element}
 */
export function RoomHeader({ name }) {
  return (
    <h1 className="text-2xl font-semibold pb-2 border-b border-gray-300">
      {name}
    </h1>
  );
}

// Exported as a named export for use in the main application.
// TODO: Add support for room subtitles or icons if needed in future.