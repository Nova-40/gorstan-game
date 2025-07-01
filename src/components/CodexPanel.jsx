// src/components/CodexPanel.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// CodexPanel component for Gorstan game.
// Provides a floating logbook panel that displays the player's traits, inventory, and flags.

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CodexPanel
 * Displays a floating panel with the player's current traits, inventory, and flags.
 * The panel can be toggled open/closed by the player.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.playerState - The player's state, including traits, inventory, and flags.
 * @returns {JSX.Element}
 */
const CodexPanel = ({ playerState }) => {
  // Destructure player state with defaults for safety
  const { flags = {}, traits = [], inventory = [] } = playerState;
  // State to track whether the panel is open or closed
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 w-80 z-50">
      {/* Button to toggle the Codex panel open/closed */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-indigo-800 text-white px-3 py-1 rounded-t-lg w-full hover:bg-indigo-700"
      >
        📘 Codex Logbook
      </button>
      {/* Conditionally render the panel if open */}
      {isOpen && (
        <div className="bg-slate-800 text-white p-3 rounded-b-lg max-h-[400px] overflow-y-auto text-sm shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Traits</h3>
          <ul className="mb-2 list-disc list-inside">
            {/* List player traits, or show 'None yet' if empty */}
            {traits.length > 0
              ? traits.map((trait, idx) => <li key={idx}>{trait}</li>)
              : <li>None yet</li>}
          </ul>
          <h3 className="text-lg font-semibold mb-2">Inventory</h3>
          <ul className="mb-2 list-disc list-inside">
            {/* List inventory items, or show 'Empty' if none */}
            {inventory.length > 0
              ? inventory.map((item, idx) => <li key={idx}>{item}</li>)
              : <li>Empty</li>}
          </ul>
          <h3 className="text-lg font-semibold mb-2">Flags</h3>
          <ul className="list-disc list-inside">
            {/* List flags as key:value, or show 'No flags set' if none */}
            {Object.keys(flags).length > 0
              ? Object.entries(flags).map(([key, value], idx) => (
                  <li key={idx}>
                    {key}: {String(value)}
                  </li>
                ))
              : <li>No flags set</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

CodexPanel.propTypes = {
  playerState: PropTypes.shape({
    flags: PropTypes.object,
    traits: PropTypes.array,
    inventory: PropTypes.array,
  }).isRequired,
};

// Export the CodexPanel component for use in the main application
export default CodexPanel;
