// src/engine/GameEngine.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// GameEngine component for Gorstan game.
// Core logic for updating room state and interpreting player movement and quick actions.
// Wraps QuickActions and ensures the room is loaded when the player's location changes.

import React, { useState, useEffect } from 'react';
import QuickActions from '../components/QuickActions';
import { loadRoomById } from '../utils/roomLoader.jsx'; // ✅


/**
 * GameEngine
 * Core component responsible for updating room state and interpreting directional and quick-action input.
 * Loads room data when the player's location changes and manages player state (e.g., sitting).
 *
 * @param {Object} props - Component props.
 * @param {Object} props.gameState - The current game state object.
 * @param {Function} props.setGameState - Setter for updating the game state.
 * @param {Function} props.setRoomData - Setter for updating the current room data.
 * @param {Function} props.onQuickAction - Handler for quick toolbar actions.
 * @returns {JSX.Element}
 */
const GameEngine = ({ gameState, setGameState, setRoomData, onQuickAction }) => {
  // Local state for player-specific status (e.g., sitting)
  const [playerState, setPlayerState] = useState({ sitting: false });

  /**
   * Effect: Loads room data whenever the current room changes in gameState.
   * On error, sets room data to null and logs the error.
   */
  useEffect(() => {
    if (gameState?.currentRoom) {
      loadRoomById(gameState.currentRoom)
        .then(setRoomData)
        .catch((err) => {
          console.error('Failed to load room:', err);
          setRoomData(null);
        });
    }
  }, [gameState?.currentRoom, setRoomData]);

  /**
   * handleMove
   * Handles standard movement or sitting action.
   * If direction is 'sit', updates playerState to reflect sitting.
   * Otherwise, updates gameState to move to the specified direction/room.
   *
   * @param {string} direction - The direction or action ('sit', 'jump', 'back', etc.).
   */
  const handleMove = (direction) => {
    if (direction === 'sit') {
      console.log("You sit down. Something shifts in the air.");
      setPlayerState((prev) => ({ ...prev, sitting: true }));
    } else {
      setGameState((prev) => ({
        ...prev,
        currentRoom: direction,
        history: [...(prev.history || []), direction]
      }));
    }
  };

  /** Quick action wrappers for clarity */
  const handleSlip = () => handleMove('jump');
  const handleRewind = () => handleMove('back');
  const handleSit = () => handleMove('sit');

  return (
    <div>
      <QuickActions
        onDirection={handleMove}
        onQuickAction={onQuickAction}
        onSlip={handleSlip}
        onRewind={handleRewind}
        onSit={handleSit}
        canSit={gameState?.canSit}
      />
    </div>
  );
};

// Export the GameEngine component for use in the main application
export default GameEngine;


