// src/components/PlayerNameCapture.jsx

import React, { useState } from 'react';

const PlayerNameCapture = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onNameSubmit(trimmed);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 p-8 relative">
      <img
        src="/images/gorstan-icon.png"
        alt="The Odd Rabbit"
        className="w-20 h-20 mb-4 animate-pulse rounded-full"
      />
      <h1 className="text-3xl font-bold mb-4">What is your name, traveller?</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-2 rounded border border-green-400 bg-black text-green-200 placeholder-green-600 focus:outline-none focus:ring focus:border-green-500 w-64"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 shadow"
        >
          Begin
        </button>
      </form>

      <button
        onClick={(e) => {
          if (e.ctrlKey) {
            setShowCheatSheet(true);
          } else {
            setShowInstructions(true);
          }
        }}
        className="mt-6 text-sm underline text-green-300 hover:text-green-100"
      >
        Show Instructions
      </button>

      {/* Shared Modal Wrapper */}
      {(showInstructions || showCheatSheet) && (
        <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl max-w-lg w-full relative animate-fadeIn">
            <button
              onClick={() => {
                setShowInstructions(false);
                setShowCheatSheet(false);
              }}
              className="absolute top-3 right-4 text-white text-xl hover:text-red-400"
              aria-label="Close"
            >✖</button>

            {showInstructions && (
              <>
                <h2 className="text-2xl font-bold mb-4">🧭 How to Survive Gorstan</h2>
                <p className="mb-3 leading-relaxed">
                  Use the input bar or on-screen buttons to interact. You can move, examine, take, use, and talk.
                </p>
                <p className="mb-3 leading-relaxed">
                  The world is filled with puzzles, secrets, traps, and occasional sarcasm. Pay attention.
                </p>
                <p className="mb-3 leading-relaxed">
                  Ayla is your guide. Type <code className="text-green-300">ask Ayla</code> or click the “Help” button.
                </p>
                <p className="italic text-sm text-green-400">
                  Tip: Coffee is more important than it may seem.
                </p>
              </>
            )}

            {showCheatSheet && (
              <>
                <h2 className="text-2xl font-bold mb-4">💀 Cheat & Debug Panel</h2>
                <p className="mb-3 leading-relaxed">
                  Welcome, deviant. The system now thinks you’re either a developer or a very bored philosopher.
                </p>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                  <li><code>/goto [room]</code> — Teleport</li>
                  <li><code>/get [item]</code> — Grab anything</li>
                  <li><code>/solve</code> — Magically solve puzzles</li>
                  <li><code>/summon [npc]</code> — Summon anyone</li>
                  <li><code>/godhelp</code> — Full power menu</li>
                </ul>
                <p className="italic text-yellow-300">
                  Overusing these may spawn Mr. Wendell. Good luck explaining that.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerNameCapture;
