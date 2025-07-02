// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: CommandInput.jsx
// Path: src/components/CommandInput.jsx


// File: /src/components/CommandInput.jsx
// Version: v4.0.0-preprod

// NOTE: setGameState replaced with dispatchGameState (reducer-style).
// Robust error handling added for engine command application.

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CommandInput = ({ gameState, dispatchGameState, appendMessage, playerName }) => {
  const [command, setCommand] = useState('');
  const [isLockedCommand, setIsLockedCommand] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hint, setHint] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);

  const traitLocks = {
    fly: 'seeker',
    vanish: 'ghost',
    jumpgate: 'daring',
    reveal: 'curious',
    resign: 'resigned',
  };

  const traits = gameState.playerTraits || [];

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

  const handleSubmit = async (e) => {
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

    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setCommand(suggestions[0] + ' ');
      }
      return;
    }

    if (e.key !== 'Enter' || !command.trim()) return;

    const trimmed = command.trim();
    const cmdWord = trimmed.split(' ')[0].toLowerCase();

    setHistory([...history, trimmed]);
    setHistoryIndex(history.length + 1);

    if (cmdWord === 'debug' && playerName.toLowerCase() !== 'geoff') {
      appendMessage('🛑 Debug mode is restricted. Only Geoff may enter.');
      setCommand('');
      return;
    }

    if (traitLocks[cmdWord] && !traits.includes(traitLocks[cmdWord])) {
      appendMessage(`⛔ Command '${cmdWord}' requires trait: ${traitLocks[cmdWord]}`);
      setFlicker(true);
      setTimeout(() => setFlicker(false), 300);
      setCommand('');
      return;
    }

    if (cmdWord === '/commands') {
      const available = Object.entries(traitLocks)
        .filter(([cmd, reqTrait]) => traits.includes(reqTrait))
        .map(([cmd]) => cmd);
      appendMessage(`💡 Commands available with your traits: ${available.join(', ') || 'None yet.'}`);
      setCommand('');
      return;
    }

    if (cmdWord === '/traits') {
      appendMessage(`🧬 Your traits: ${traits.length > 0 ? traits.join(', ') : 'None'}`);
      setCommand('');
      return;
    }

    const { inventory, currentRoom, rooms } = gameState;

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
        dispatchGameState({
          type: 'SET',
          payload: {
            inventory: updatedInventory,
            rooms: updatedRooms,
          },
        });
      }

      setCommand('');
      return;
    }

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
        dispatchGameState({
          type: 'SET',
          payload: {
            inventory: updatedInventory,
            rooms: updatedRooms,
          },
        });
      }

      setCommand('');
      return;
    }

    if (cmdWord === 'use') {
      const item = trimmed.split(' ').slice(1).join(' ').toLowerCase();

      if (!inventory || !inventory.includes(item)) {
        appendMessage(`❌ You don't have '${item}' to use.`);
        setCommand('');
        return;
      }

      const room = rooms[currentRoom];
      let result = '';

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

    if (trimmed === '/inventory') {
      if (inventory?.length > 0) {
        appendMessage(`🎒 Inventory: ${inventory.join(', ')}`);
      } else {
        appendMessage(`👜 You’re not carrying anything.`);
      }
      setCommand('');
      return;
    }

    const engine = window.engineRef?.current;
    if (!engine || typeof engine.applyCommand !== 'function') {
      appendMessage('⚠️ Engine not ready. Try again shortly.');
      setCommand('');
      return;
    }

    try {
      const response = await engine.applyCommand(trimmed);
      if (Array.isArray(response?.messages)) {
        response.messages.forEach((msg) => appendMessage(msg));
      }
      if (response?.updates) {
        dispatchGameState({ type: 'SET', payload: response.updates });
      }
    } catch (err) {
      console.error('[CommandInput] Error applying command:', err);
      const msg = err?.message ? err.message.split('\n')[0] : 'Unexpected error.';
      appendMessage(`⚠️ Command failed: ${msg}`);
    }

    setSuggestions([]);
    setHint('');
    setCommand('');
  };

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

      {hint && (
        <div className="absolute left-4 mt-1 text-xs text-red-400">💡 {hint}</div>
      )}

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
  dispatchGameState: PropTypes.func.isRequired,
  appendMessage: PropTypes.func.isRequired,
  playerName: PropTypes.string.isRequired,
};

export default CommandInput;
