/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// src/components/WelcomeScreen.tsx
import React from "react";
import { getVersionString } from "../config/version";

interface WelcomeScreenProps {
  onBegin: () => void;
  onLoadGame: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin, onLoadGame }) => {
  // Log version info to console for debugging
  React.useEffect(() => {
    console.log(`%c🎮 Gorstan Game - ${getVersionString()}`, 'color: #10b981; font-weight: bold;');
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 border bg-gradient-to-b from-slate-900 to-black text-green-400 border-2 border-green-500 p-6 m-4 rounded-xl">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center flex items-center justify-center gap-4">
        <img
          src={"/images/gorstanicon.png"}
          alt="The Odd Rabbit"
          className="w-[72px] h-[72px] rounded-full shadow-md"
        />
        Welcome to Gorstan
      </h1>
      <p className="text-md md:text-lg text-center max-w-2xl mb-6">
        A multiverse simulation of coffee, consequence, and quantum possibility. Tread carefully. The rabbit is watching.
      </p>

      <div className="flex flex-col items-center">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <a
            href="https://buymeacoffee.com/geoffwebster"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black px-6 py-3 rounded-xl hover:bg-yellow-300 text-center min-w-[180px] transition-all"
          >
            ☕ Buy Geoff a Coffee
          </a>
          <a
            href="https://gorstanbooks.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-500 text-center min-w-[180px] transition-all"
          >
            📚 Explore the Books
          </a>
          <a
            href="https://gorstanchronicles.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl hover:bg-indigo-400 text-center min-w-[180px] transition-all"
          >
            🌐 Visit Gorstan Chronicles
          </a>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-[600px]">
          <div></div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={onBegin}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition-all min-w-[180px]"
              type="button"
            >
              Enter Simulation
            </button>

            <button
              onClick={onLoadGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg shadow-md transition-all min-w-[180px]"
              type="button"
            >
              Load Saved Game
            </button>
          </div>
          <div></div>
        </div>
      </div>
      
      {/* Build version - visible for deployment verification */}
      <div className="absolute bottom-2 right-2 text-green-300 text-xs opacity-60 select-none font-mono">
        {getVersionString()}
      </div>
      
      {/* Backup version indicator - always visible */}
      <div className="absolute bottom-2 left-2 text-green-400 text-xs opacity-40 select-none">
        Gorstan Live
      </div>
    </div>
  );
};

export default WelcomeScreen;
