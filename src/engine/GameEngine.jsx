
import React, { useEffect, useRef, useState } from 'react';
import RoomRenderer from '../components/RoomRenderer';
import CommandInput from '../components/CommandInput';
import AylaPanel from '../components/AylaPanel';
import MovementPanel from '../components/MovementPanel';
import { initialiseStoryProgress } from './storyProgress';
import { seedTraps, handleRoomTrap } from './trapEngine';
import { seedItemsInRooms } from './itemEngine';

const GameEngine = ({ rooms, setRooms, playerName, startRoomId }) => {
  const audioRef = useRef(null);
  const [currentRoomId, setCurrentRoomId] = useState(startRoomId || 'controlnexus');
  const [playerState, setPlayerState] = useState({
    inventory: [],
    traits: [],
    history: []
  });
  const [messages, setMessages] = useState([]);
  const [storyFlags, setStoryFlags] = useState({});
  const engineRef = useRef({});
  const hasSeeded = useRef(false);

  useEffect(() => {
    window.engineRef = engineRef;
    engineRef.current.appendMessage = appendMessage;
    engineRef.current.setPlayerState = setPlayerState;
    engineRef.current.getCurrentRoomId = () => currentRoomId;
    engineRef.current.movePlayer = movePlayer;
    engineRef.current.stepBack = stepBack;
    engineRef.current.getInventory = () => playerState.inventory;
    engineRef.current.getTraits = () => playerState.traits;
    engineRef.current.getStoryFlags = () => storyFlags;
  }, [currentRoomId, playerState, storyFlags]);

  useEffect(() => {
    if (!rooms || rooms.length === 0 || hasSeeded.current) return;

    initialiseStoryProgress();

    const roomIds = rooms.map(r => r.id);
    seedTraps(roomIds);

    if (typeof setRooms === 'function') {
      const updatedRooms = seedItemsInRooms(rooms);
      setRooms(updatedRooms);
    }

    hasSeeded.current = true;
  }, [rooms, setRooms]);

  useEffect(() => {
    const room = rooms.find(r => r.id === currentRoomId);
    if (room?.ambientSound) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(`/sounds/${room.ambientSound}`);
      newAudio.loop = true;
      newAudio.volume = 0.5;
      newAudio.play().catch(() => {});
      audioRef.current = newAudio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentRoomId, rooms]);

  const currentRoom = rooms.find((room) => room.id === currentRoomId);

  const appendMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const movePlayer = (direction) => {
    const nextRoomId = currentRoom?.exits?.[direction];
    if (nextRoomId) {
      const trapResult = handleRoomTrap(nextRoomId, playerState);
      if (trapResult?.message) appendMessage(trapResult.message);
      if (!trapResult?.killed) {
        setPlayerState((prev) => ({
          ...prev,
          history: [...prev.history, currentRoomId]
        }));
        setCurrentRoomId(nextRoomId);
      }
    } else {
      appendMessage("You can't go that way.");
    }
  };

  const stepBack = () => {
    setPlayerState((prev) => {
      const history = [...prev.history];
      const lastRoom = history.pop();
      if (lastRoom) {
        setCurrentRoomId(lastRoom);
        appendMessage("You step back cautiously.");
      } else {
        appendMessage("There's nowhere to step back to.");
      }
      return { ...prev, history };
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 max-w-4xl mx-auto">
      <RoomRenderer room={currentRoom} />
      <AylaPanel askAyla={(q) => {
        const res = engineRef.current.askAyla?.(q);
        if (res) appendMessage(res);
      }} />
      <MovementPanel
        currentRoom={currentRoom}
        rooms={rooms}
        inventory={playerState.inventory}
        movePlayer={movePlayer}
        storyFlags={storyFlags}
        traits={playerState.traits}
        stepBack={stepBack}
        onMove={movePlayer}
      />
      {messages.map((msg, idx) => (
        <div key={`msg-${idx}`} className="text-sm text-gray-700 font-mono">
          {msg}
        </div>
      ))}
      <CommandInput
        gameState={playerState}
        setGameState={setPlayerState}
        appendMessage={appendMessage}
        playerName={playerName}
      />
    </div>
  );
};

export default GameEngine;
