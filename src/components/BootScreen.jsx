/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: The welcome screen for the Gorstan game, allowing users to enter their name and begin.
 */

import React, { useState } from 'react';

const BootScreen = ({ onStart }) => {
  const [playerName, setPlayerName] = useState('');

  const handleStart = () => {
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">Enter Your Name</h1>
      <p className="text-gray-400 mb-8">To begin your journey into the Gorstan multiverse.</p>

      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Type your name..."
        className="w-full max-w-sm text-center text-lg p-3 rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleStart}
        className="mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition"
      >
        Start
      </button>
    </div>
  );
};

export default BootScreen;
