// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: GameLayout.jsx
// Path: src/components/GameLayout.jsx


// src/components/GameLayout.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// GameLayout component for Gorstan game.
// Provides the main two-column layout for the game UI, including the console output,
// command input, room header, and quick actions panel.

import React from 'react';
import PropTypes from 'prop-types';
import CommandInput from './CommandInput';
import RoomHeader from './RoomHeader';
import QuickActions from './QuickActions';

/**
 * GameLayout
 * Renders the main game layout with a left column for the console and command input,
 * and a right column for the room header and quick actions.
 *
 * @param {Object} props - Component props.
 * @param {JSX.Element} props.consoleOutput - The main narrative or Ayla panel to display.
 * @param {string} props.roomName - The current room's name.
 * @param {Function} props.onDirection - Callback for directional movement actions.
 * @param {Function} props.onQuickAction - Callback for quick toolbar actions.
 * @param {Function} props.onAskAyla - Callback for Ayla/hint requests.
 * @param {Function} props.onCommandSubmit - Callback for command input submission.
 * @returns {JSX.Element}
 */
const GameLayout = ({
  consoleOutput,
  roomName,
  onDirection,
  onQuickAction,
  onAskAyla,
  onCommandSubmit,
}) => {
  return (
    <div className="flex h-screen">
      {/* Left column: Main Console and Command Input */}
      <div className="flex flex-col w-full md:w-2/3 lg:w-3/5 border-r border-gray-200">
        {consoleOutput /* Main narrative or Ayla panel */}
        <CommandInput onSubmit={onCommandSubmit} />
      </div>

      {/* Right column: Room Header and Quick Actions */}
      <div className="hidden md:flex flex-col w-1/3 lg:w-2/5 p-4 space-y-6">
        <RoomHeader name={roomName} />
        <QuickActions
          onDirection={onDirection}
          onQuickAction={onQuickAction}
          onAskAyla={onAskAyla}
        />
      </div>
    </div>
  );
};

GameLayout.propTypes = {
  consoleOutput: PropTypes.node.isRequired,
  roomName: PropTypes.string.isRequired,
  onDirection: PropTypes.func.isRequired,
  onQuickAction: PropTypes.func.isRequired,
  onAskAyla: PropTypes.func.isRequired,
  onCommandSubmit: PropTypes.func.isRequired,
};

// Export the GameLayout component for use in the main application
export default GameLayout;