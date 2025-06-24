// src/engine/GameEngine.jsx
// Gorstan v3.3.7 – Enhanced Engine with Trap Logic, NPC State, Trait Modifiers, and Audio FX

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import PropTypes from 'prop-types';
import * as trapEngine from '../engine/trapEngine';
import * as trapController from '../engine/trapController';
import { playSound } from '../utils/soundUtils';
import StatusPanel from '../components/StatusPanel';
import RoomRenderer from '../components/RoomRenderer';
import CommandInput from '../components/CommandInput';

const GameEngine = forwardRef(({ rooms, playerName, setGameState, gameState }, ref) => {
  const engineRef = useRef();

  useImperativeHandle(ref, () => ({
    applyCommand,
  }));

  useEffect(() => {
    console.log('🧠 Initialising GameEngine with:');
    console.log('🏁 Start Room:', gameState.currentRoom);
    console.log('📦 Extra Flags:', gameState.flags);

    trapEngine.seedTraps(Object.keys(rooms));
  }, [rooms]);

  const applyCommand = (command) => {
    const trimmed = command.trim().toLowerCase();
    const { currentRoom, inventory, flags, playerTraits, rooms: roomMap } = gameState;
    const room = roomMap[currentRoom];
    let messages = [];
    let updates = {};

    // Trap check
    const trapMessage = trapController.checkForTrap(currentRoom, playerTraits);
    if (trapMessage) {
      messages.push(trapMessage);
      updates.flags = { ...flags, trapTriggered: true };
      playSound('trap');
    }

    // Trait-based actions
    if (trimmed === 'vanish' && playerTraits.includes('ghost')) {
      messages.push('🌫️ You fade from sight. Nothing perceives you.');
      updates.flags = { ...flags, invisible: true };
      playSound('vanish');
    }

    // NPC interaction
    if (trimmed.startsWith('talk ')) {
      const target = trimmed.split(' ')[1];
      if (room.npcs?.includes(target)) {
        messages.push(`🗣️ You start a dialogue with ${target}. They look at you cautiously.`);
        updates.flags = { ...flags, [`talkedTo_${target}`]: true };
        playSound('talk');
      } else {
        messages.push(`❌ No one named ${target} here to talk to.`);
      }
    }

    // Jumpgate
    if (trimmed === 'jumpgate' && playerTraits.includes('daring')) {
      messages.push('🌌 You leap into the unknown. A gate flickers open before you...');
      updates.currentRoom = 'jumpgatehub';
      playSound('teleport');
    }

    return { messages, updates };
  };

  return (
    <div className="game-engine">
      <StatusPanel
        playerName={playerName}
        inventory={gameState.inventory}
        flags={gameState.flags}
        playerTraits={gameState.playerTraits}
      />
      <RoomRenderer room={rooms[gameState.currentRoom]} />
      <div className="message-log p-4 text-green-200 font-mono bg-gray-900">
        {(gameState.messages || []).map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <CommandInput
        gameState={gameState}
        setGameState={setGameState}
        appendMessage={(msg) => {
          const newMessages = [...(gameState.messages || []), msg];
          setGameState({ ...gameState, messages: newMessages });
        }}
        playerName={playerName}
      />
    </div>
  );
});

GameEngine.propTypes = {
  rooms: PropTypes.object.isRequired,
  playerName: PropTypes.string.isRequired,
  setGameState: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  gameState: PropTypes.object.isRequired,
};

export default GameEngine;


