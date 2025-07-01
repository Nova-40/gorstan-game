// src/components/CommandInput.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// CommandInput component for Gorstan game.
// Provides a command-line input for the player, with trait-locked commands, inventory logic, tab completion, and command history.

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * CommandInput
 * Renders a command input field with advanced features for the Gorstan game.
 * Handles trait-locked commands, inventory management, tab completion, and command history.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.gameState - The current game state object.
 * @param {Function|Object} props.setGameState - Setter(s) for updating game state.
 * @param {Function} props.appendMessage - Function to append a message to the game log.
 * @param {string} props.playerName - The current player's name.
 * @returns {JSX.Element}
 */
const CommandInput = ({ gameState, setGameState, appendMessage, playerName }) => {
  // State for the current command input
  const [command, setCommand] = useState('');
  // State for whether the current command is locked by a missing trait
  const [isLockedCommand, setIsLockedCommand] = useState(false);
  // State for flicker animation on error
  const [flicker, setFlicker] = useState(false);
  // State for tab-completion suggestions
  const [suggestions, setSuggestions] = useState([]);
  // State for command hint (e.g., missing trait)
  const [hint, setHint] = useState('');
  // State for command history
  const [history, setHistory] = useState([]);
  // State for navigating command history
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Ref for the input element
  const inputRef = useRef(null);

  // Trait-locked commands and their required traits
  const traitLocks = {
    fly: 'seeker',
    vanish: 'ghost',
    jumpgate: 'daring',
    reveal: 'curious',
    resign: 'resigned',
  };

  // Player's traits from game state
  const traits = gameState.playerTraits || [];

  /**
   * useEffect to update command lock state and suggestions based on input and traits.
   */
  useEffect(() => {
    const firstWord = command.trim().split(' ')[0].toLowerCase();
    if (traitLocks[firstWord] && !traits.includes(traitLocks[firstWord])) {
      setIsLockedCommand(true);
      setHint(`Requires trait: ${traitLocks[firstWord]}`);
    } else {
      setIsLockedCommand(false);
      setHint('');
    }

    if (firstWord.length > 0) {
      const available = Object.entries(traitLocks)
        .filter(([cmd, reqTrait]) => traits.includes(reqTrait) && cmd.startsWith(firstWord))
        .map(([cmd]) => cmd);
      setSuggestions(available);
    } else {
      setSuggestions([]);
    }
  }, [command, traits]);

  /**
   * handleSubmit
   * Handles all key events for the command input, including history navigation,
   * tab completion, and command execution.
   *
   * @param {Object} e - Keyboard event.
   */
  const handleSubmit = async (e) => {
    // Command history navigation (up/down arrows)
    if (e.key === 'ArrowUp') {
      if (history.length > 0) {
        const newIndex = Math.max(0, historyIndex - 1);
        setCommand(history[newIndex] || '');
        setHistoryIndex(newIndex);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      if (history.length > 0) {
        const newIndex = Math.min(history.length - 1, historyIndex + 1);
        setCommand(history[newIndex] || '');
        setHistoryIndex(newIndex);
      }
      return;
    }

    // Tab completion for trait-locked commands
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCommand(suggestions[0] + ' ');
      }
      return;
    }

    // Only process Enter key if command is not empty
    if (e.key !== 'Enter' || !command.trim()) return;

    const trimmed = command.trim();
    const cmdWord = trimmed.split(' ')[0].toLowerCase();

    // Add command to history
    setHistory([...history, trimmed]);
    setHistoryIndex(history.length + 1);

    // Restrict debug command to specific player
    if (cmdWord === 'debug' && playerName.toLowerCase() !== 'geoff') {
      appendMessage('🛑 Debug mode is restricted. Only Geoff may enter.');
      setCommand('');
      return;
    }

    // Block trait-locked commands if trait is missing
    if (traitLocks[cmdWord] && !traits.includes(traitLocks[cmdWord])) {
      appendMessage(`⛔ Command '${cmdWord}' requires trait: ${traitLocks[cmdWord]}`);
      setFlicker(true);
      setTimeout(() => setFlicker(false), 300);
      setCommand('');
      return;
    }

    // Show available commands for player's traits
    if (cmdWord === '/commands') {
      const available = Object.entries(traitLocks)
        .filter(([cmd, reqTrait]) => traits.includes(reqTrait))
        .map(([cmd]) => cmd);
      appendMessage(`💡 Commands available with your traits: ${available.join(', ') || 'None yet.'}`);
      setCommand('');
      return;
    }

    // Show player's traits
    if (cmdWord === '/traits') {
      appendMessage(`🧬 Your traits: ${traits.length > 0 ? traits.join(', ') : 'None'}`);
      setCommand('');
      return;
    }

    // Inventory and room data from game state
    const { inventory, currentRoom, rooms } = gameState;

    // TAKE command: pick up an item from the room
    if (cmdWord === 'take') {
      const item = trimmed.split(' ').slice(1).join(' ').toLowerCase();
      const room = rooms[currentRoom];
      const available = room.items || [];

      if (!item) {
        appendMessage('❓ Take what?');
      } else if (!available.includes(item)) {
        appendMessage(`❌ There's no '${item}' here.`);
      } else {
        const updatedItems = available.filter(i => i !== item);
        const updatedRoom = { ...room, items: updatedItems };
        const updatedRooms = { ...rooms, [currentRoom]: updatedRoom };
        const updatedInventory = [...(inventory || []), item];

        appendMessage(`🎒 You picked up: ${item}`);
        // Update rooms and inventory using setGameState
        setGameState.setRooms(updatedRooms);
        setGameState.setInventory(updatedInventory);
      }

      setCommand('');
      return;
    }

    // DROP command: drop an item into the room
    if (cmdWord === 'drop') {
      const item = trimmed.split(' ').slice(1).join(' ').toLowerCase();
      if (!inventory || !inventory.includes(item)) {
        appendMessage(`❌ You don't have '${item}' to drop.`);
      } else {
        const updatedInventory = inventory.filter(i => i !== item);
        const room = rooms[currentRoom];
        const updatedItems = [...(room.items || []), item];
        const updatedRoom = { ...room, items: updatedItems };
        const updatedRooms = { ...rooms, [currentRoom]: updatedRoom };

        appendMessage(`🪙 You dropped: ${item}`);
        setGameState.setInventory(updatedInventory);
        setGameState.setRooms(updatedRooms);
      }

      setCommand('');
      return;
    }

    // USE command: use an item from inventory
    if (cmdWord === 'use') {
      const item = trimmed.split(' ').slice(1).join(' ').toLowerCase();

      if (!inventory || !inventory.includes(item)) {
        appendMessage(`❌ You don't have '${item}' to use.`);
        setCommand('');
        return;
      }

      const room = rooms[currentRoom];
      let result = '';

      // Special logic for certain items and rooms
      if (item === 'mirror' && currentRoom === 'throneroom') {
        result = '🪞 You raise the mirror. The illusion shatters! The throne flickers, revealing a passage.';
      } else if (item === 'coffee') {
        result = '☕ You fling hot coffee wildly. Somewhere, a shriek echoes. Effective.';
      } else {
        result = `🧐 You use the ${item}. Nothing dramatic happens... yet.`;
      }

      appendMessage(result);
      setCommand('');
      return;
    }

    // INVENTORY command: show player's inventory
    if (trimmed === '/inventory') {
      if (inventory?.length > 0) {
        appendMessage(`🎒 Inventory: ${inventory.join(', ')}`);
      } else {
        appendMessage(`👜 You’re not carrying anything.`);
      }
      setCommand('');
      return;
    }

    // Reference to the game engine for applying other commands
    const engine = window.engineRef?.current;
    if (!engine || typeof engine.applyCommand !== 'function') {
      appendMessage('⚠️ Engine not ready. Try again shortly.');
      setCommand('');
      return;
    }

    // Try to apply the command using the engine
    try {
      const response = await engine.applyCommand(trimmed);
      if (Array.isArray(response?.messages)) {
        response.messages.forEach((msg) => appendMessage(msg));
      }
      if (response?.updates) {
        // Support both function and object-based setGameState
        if (typeof setGameState === 'function') {
          setGameState((prev) => ({ ...prev, ...response.updates }));
        } else if (typeof setGameState === 'object') {
          for (const [key, value] of Object.entries(response.updates)) {
            const setterName = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
            if (typeof setGameState[setterName] === 'function') {
              setGameState[setterName](value);
            } else {
              // FIXME: Setter missing for this key; consider handling this case.
              console.warn(`⚠️ Missing setter: ${setterName}`);
            }
          }
        }
      }
    } catch (err) {
      // Log and display errors from the engine
      console.error('[CommandInput] Error applying command:', err);
      appendMessage(`⚠️ Error: ${err.message}`);
    }

    // Reset suggestions, hint, and command input
    setSuggestions([]);
    setHint('');
    setCommand('');
  };

  // Main render: input field with suggestions and hints
  return (
    <div className="w-full mt-4 px-4 relative">
      <input
        ref={inputRef}
        type="text"
        className={`w-full p-2 border rounded-lg bg-black text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 
          ${isLockedCommand ? 'border-red-500 ring-red-500' : 'border-gray-600'} 
          ${flicker ? 'animate-pulse border-red-600' : ''}`}
        placeholder={`Type a command, ${playerName}...`}
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleSubmit}
        autoFocus
        aria-label="Command input field"
      />

      {/* Display a hint if the command is locked or needs info */}
      {hint && (
        <div className="absolute left-4 mt-1 text-xs text-red-400">💡 {hint}</div>
      )}

      {/* Display tab-completion suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute left-4 top-full mt-6 bg-gray-800 border border-gray-700 rounded text-sm text-white px-2 py-1 shadow-lg z-10">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => setCommand(s + ' ')}
              className="cursor-pointer hover:bg-gray-600 px-1 rounded"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CommandInput.propTypes = {
  gameState: PropTypes.object.isRequired,
  setGameState: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  appendMessage: PropTypes.func.isRequired,
  playerName: PropTypes.string.isRequired,
};

// Export the CommandInput component for use
export default CommandInput;


