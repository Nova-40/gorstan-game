import React, { useEffect, useState } from 'react';
import { loadRooms } from '../utils/roomLoader.js';
import RoomRenderer from '../components/RoomRenderer.jsx';
import { playSound } from '../utils/soundUtils';

const GameEngine = () => {
  const [rooms, setRooms] = useState({});
  const [currentRoomId, setCurrentRoomId] = useState('introstart');
  const [gameLoaded, setGameLoaded] = useState(false);

  useEffect(() => {
    async function loadGameWorld() {
      console.log("🧠 GameEngine booting...");
      try {
        const allRooms = await loadRooms();

        if (!allRooms || Object.keys(allRooms).length === 0) {
          throw new Error("No rooms loaded. Check rooms directory.");
        }

        setRooms(allRooms);
        setGameLoaded(true);
        console.log("✅ Rooms loaded:", Object.keys(allRooms));
      } catch (err) {
        console.error("💥 Room loading failed:", err);
      }
    }

    loadGameWorld();
  }, []);

  if (!gameLoaded) {
    return <div className="text-white p-4">Loading world...</div>;
  }

  const currentRoom = rooms[currentRoomId];
  if (!currentRoom) {
    return (
      <div className="text-red-500 p-4">
        ⚠️ Room not found: {currentRoomId}
      </div>
    );
  }

  return (
    <RoomRenderer
      room={currentRoom}
      rooms={rooms}
      setCurrentRoomId={setCurrentRoomId}
      playSound={playSound}
    />
  );
};

export default GameEngine;

