import React, { useEffect, useState, useRef } from 'react';
import RoomRenderer from '../components/RoomRenderer';
import MovementPanel from '../components/MovementPanel';
import CommandInput from '../components/CommandInput';
import StatusPanel from '../components/StatusPanel';
import AskAyla from '../components/AskAyla';

import { applyCommand } from './commandParser';
import { initialiseStoryProgress } from './storyProgress';
import { seedTraps } from './trapEngine';
import { seedItemsInRooms } from './itemEngine';
import {
  handleRoomTrap,
  handleTrapEscape,
  disarmTrap,
  clearAllTraps
} from './trapController';

const GameEngine = ({ rooms, playerName, startRoomId, entryMode }) => {
  const [currentRoomId, setCurrentRoomId] = useState(startRoomId);
  const [previousRoomId, setPreviousRoomId] = useState(null);
  const [inventory, setInventory] = useState(entryMode === 'sip' ? ['coffee'] : []);
  const [traits, setTraits] = useState([]);
  const [flags, setFlags] = useState({});
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [command, setCommand] = useState('');

  const engineRef = useRef({});

  const currentRoom = rooms.find(room => room.id === currentRoomId);

  useEffect(() => {
    initialiseStoryProgress(flags, setFlags);
    seedTraps(rooms);
    seedItemsInRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    if (currentRoom) {
      handleRoomTrap(currentRoom, moveToRoom, () => {
        setHistory(prev => [...prev, '💥 You have died from a trap. Resetting...']);
        setTimeout(() => window.location.reload(), 3000);
      });
    }
  }, [currentRoom]);

  const moveToRoom = (nextRoomId) => {
    handleTrapEscape(currentRoom);
    setPreviousRoomId(currentRoomId);
    setCurrentRoomId(nextRoomId);
  };

  const handleCommandSubmit = (input) => {
    const { nextRoomId, updates, messages } = applyCommand({
      input,
      currentRoom,
      inventory,
      traits,
      flags,
      playerName,
    });

    if (nextRoomId) moveToRoom(nextRoomId);
    if (updates?.inventory) setInventory(updates.inventory);
    if (updates?.traits) setTraits(updates.traits);
    if (updates?.flags) setFlags({ ...flags, ...updates.flags });
    if (updates?.scoreDelta) setScore(score + updates.scoreDelta);
    if (messages?.length) setHistory(prev => [...prev, ...messages]);

    setCommand('');
  };

  const handlePickUp = (item) => {
    const hasRunBag = inventory.includes('runbag');
    const limit = hasRunBag ? 12 : 5;
    if (inventory.length >= limit) {
      setInventory([]);
      setHistory(prev => [
        ...prev,
        `⚠️ Your ${hasRunBag ? 'run bag' : 'pockets'} are overloaded! Everything spills onto the floor.`
      ]);
    } else {
      setInventory([...inventory, item]);
      setHistory(prev => [...prev, `🧺 You picked up ${item}.`]);
    }
  };

  const handleInspect = (item) => {
    setHistory(prev => [...prev, `🔍 You inspect the ${item}. It looks... intriguing.`]);
  };

  const handleUse = (item) => {
    setHistory(prev => [...prev, `💧 You used the ${item}.`]);
  };

  const handleDrop = (item) => {
    setInventory(inventory.filter(i => i !== item));
    setHistory(prev => [...prev, `🗑️ You dropped the ${item}.`]);
  };

  return (
    <div className="relative p-4 flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="border rounded-xl shadow p-4 bg-white">
        <RoomRenderer room={currentRoom} />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <AskAyla
          room={currentRoom}
          traits={traits}
          flags={flags}
          inventory={inventory}
          onHint={(hint) => setHistory(prev => [...prev, `💡 ${hint}`])}
        />
        <StatusPanel
          playerName={playerName}
          traits={traits}
          inventory={inventory}
          score={score}
          flags={flags}
        />
      </div>

      <MovementPanel
        currentRoom={currentRoom}
        onMove={moveToRoom}
        flags={flags}
        traits={traits}
        inventory={inventory}
        previousRoomId={previousRoomId}
        onPickUp={handlePickUp}
        onInspect={handleInspect}
        onUse={handleUse}
        onDrop={handleDrop}
      />

      <CommandInput
        command={command}
        setCommand={setCommand}
        onSubmit={handleCommandSubmit}
      />

      <div className="mt-4 border-t pt-2 text-sm max-h-48 overflow-y-auto bg-gray-50 rounded p-2">
        {history.map((msg, i) => (
          <div key={i} className="text-gray-800">{msg}</div>
        ))}
      </div>
    </div>
  );
};

export default GameEngine;

