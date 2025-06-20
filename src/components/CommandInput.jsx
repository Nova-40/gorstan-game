// src/components/CommandInput.jsx
// Gorstan v3.2.8 – Input Field for Commands
// Handles player commands and safely applies game logic.
// MIT License © 2025 Geoff Webster

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CommandInput
 * Handles player input and submits to the command engine.
 *
 * @param {Object} props
 * @param {Object} props.gameState - The current global game state.
 * @param {Function|Object} props.setGameState - Function or object of state setters.
 * @param {Function} props.appendMessage - Callback to render messages in the UI.
 * @param {string} props.playerName - Current player name.
 * @returns {JSX.Element}
 */
const CommandInput = ({ gameState, setGameState, appendMessage, playerName }) => {
  // State for the current command input value
  const [command, setCommand] = useState('');

  /**
   * Handles the Enter key event to submit the command.
   * Applies the command to the engine and updates state/messages as needed.
   */
  const handleSubmit = async (e) => {
    if (e.key !== 'Enter' || !command.trim()) return;

    const trimmed = command.trim();
    if (trimmed.toLowerCase() === 'debug' && playerName.toLowerCase() !== 'geoff') {
      appendMessage('🛑 Debug mode is restricted. Only Geoff may enter.');
      setCommand(''); return;
    }
    // Access the engine instance from a global ref
    const engine = window.engineRef?.current;

    if (!engine || typeof engine.applyCommand !== 'function') {
      appendMessage('⚠️ Engine not ready. Try again shortly.');
      setCommand('');
      return;
    }

    try {
      // Apply the command to the engine
      const response = await engine.applyCommand(trimmed);

      // Display response messages, if any
      if (Array.isArray(response?.messages)) {
        response.messages.forEach((msg) => appendMessage(msg));
      }

      // Apply game state updates, if any
      if (response?.updates) {
        if (typeof setGameState === 'function') {
          // Merge updates into the previous game state
          setGameState((prev) => ({ ...prev, ...response.updates }));
        } else if (typeof setGameState === 'object') {
          // Call individual state setters if provided as an object
          for (const [key, value] of Object.entries(response.updates)) {
            const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            if (typeof setGameState[setterName] === 'function') {
              setGameState[setterName](value);
            } else {
              // Warn if a setter is missing
              console.warn(`⚠️ Missing setter: ${setterName}`);
            }
          }
        }
      }
    } catch (err) {
      // Handle errors from the engine
      console.error('[CommandInput] Error applying command:', err);
      appendMessage(`⚠️ Error: ${err.message}`);
    }

    setCommand('');
  };

  return (
    <div className="w-full mt-4 px-4">
      <input
        type="text"
        className="w-full p-2 border border-gray-600 rounded-lg bg-black text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={`Type a command, ${playerName}...`}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleSubmit}
        autoFocus
        aria-label="Command input field"
      />
    </div>
  );
};

CommandInput.propTypes = {
  gameState: PropTypes.object.isRequired,
  setGameState: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  appendMessage: PropTypes.func.isRequired,
  playerName: PropTypes.string.isRequired,
};

export default CommandInput;

