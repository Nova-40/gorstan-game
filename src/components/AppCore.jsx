import React, { useEffect, useState } from 'react';
import GameEngine from '../engine/GameEngine';

const AppCore = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../rooms/rooms_index.js')
      .then((module) => {
        setRoomData(module.default || module);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load room data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading world...
      </div>
    );
  }

  if (!roomData || Object.keys(roomData).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        No room data available. Try resetting the game?
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white">
      <GameEngine rooms={roomData} setRooms={setRoomData} />
    </div>
  );
};

export default AppCore;
