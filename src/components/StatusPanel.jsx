// File: src/components/StatusPanel.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// StatusPanel component for Gorstan game.
// Displays the player's name, inventory, traits, and active flags in a styled panel.
// Also shows contextual alerts based on specific flags (e.g., trap triggered, invisibility).

import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusPanel
 * Renders a status panel showing the player's name, inventory, traits, and flags.
 * Also displays contextual alerts for certain game states (e.g., traps, invisibility).
 *
 * @param {Object} props - Component props.
 * @param {string} [props.playerName='Explorer'] - The player's name.
 * @param {Array} [props.inventory=[]] - The player's inventory items.
 * @param {Object} [props.flags={}] - The player's current flags (booleans).
 * @param {Array} [props.playerTraits=[]] - The player's traits.
 * @returns {JSX.Element}
 */
const StatusPanel = ({
  playerName = 'Explorer',
  inventory = [],
  flags = {},
  playerTraits = [],
}) => {
  // Extract only the flags currently active (true values only)
  const importantFlags = Object.entries(flags)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  /**
   * formatInventory
   * Formats the inventory array for display, adding emoji for special items.
   * @param {Array} items - Inventory items.
   * @returns {string}
   */
  const formatInventory = (items) => {
    if (!items.length) return 'Empty';
    return items
      .map((item) => (item.toLowerCase() === 'coffee' ? '☕ Coffee' : item))
      .join(', ');
  };

  return (
    <div className="bg-gray-900 text-white p-3 border-b border-gray-700 text-sm font-mono">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <strong>🧑 Name:</strong> {playerName}
        </div>

        <div>
          <strong>🎒 Inventory:</strong> {formatInventory(inventory)}
        </div>

        <div>
          <strong>🧬 Traits:</strong>{' '}
          {playerTraits.length > 0 ? (
            playerTraits.map((trait, idx) => (
              <span
                key={idx}
                className="inline-block bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-xs ml-1"
              >
                {trait}
              </span>
            ))
          ) : (
            'None'
          )}
        </div>

        <div>
          <strong>🚩 Flags:</strong>{' '}
          {importantFlags.length > 0 ? importantFlags.join(', ') : 'None'}
        </div>
      </div>

      {/* Optional: contextual alerts based on specific flags */}
      {flags.trapTriggered && (
        <div className="mt-2 text-red-400 animate-pulse">
          ⚠️ Trap triggered! You may be in danger...
        </div>
      )}

      {flags.invisible && (
        <div className="mt-1 text-blue-300 italic">🌫️ You are currently invisible.</div>
      )}
    </div>
  );
};

StatusPanel.propTypes = {
  playerName: PropTypes.string,
  inventory: PropTypes.array,
  flags: PropTypes.object,
  playerTraits: PropTypes.array,
};

// Export the StatusPanel component for use in the main application
export default StatusPanel;
