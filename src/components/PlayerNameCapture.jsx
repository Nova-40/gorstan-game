// src/components/PlayerNameCapture.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// PlayerNameCapture component for Gorstan game.
// Prompts the player to enter their name and provides instructions or a cheat/debug panel via modal overlays.

import React, { useState } from 'react';

/**
 * PlayerNameCapture
 * Renders a prompt for the player to enter their name, with options to view instructions or a cheat/debug panel.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onNameSubmit - Callback invoked with the trimmed player name when submitted.
 * @returns {JSX.Element}
 */
const PlayerNameCapture = ({ onNameSubmit }) => {
  // State for the player's entered name
  const [name, setName] = useState('');
  // State to control the display of the instructions modal
  const [showInstructions, setShowInstructions] = useState(false);
  // State to control the display of the cheat/debug modal
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  /**
   * handleSubmit
   * Handles the form submission for the player's name.
   * Trims the input and calls onNameSubmit if not empty.
   *
   * @param {Object} e - Form event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onNameSubmit(trimmed);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 p-8 relative">
      {/* Game icon/logo */}
      <img
        src="/images/gorstan-icon.png"
        alt="The Odd Rabbit"
        className="w-20 h-20 mb-4 animate-pulse rounded-full"
      />
      {/* Main prompt */}
      <h1 className="text-3xl font-bold mb-4">What is your name, traveller?</h1>

      {/* Name input form */}
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

      {/* Button to show instructions or cheat/debug panel (Ctrl+Click) */}
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

      {/* Shared Modal Wrapper for instructions or cheat/debug panel */}
      {(showInstructions || showCheatSheet) && (
        <div className="absolute inset-0 bg-black bg-opacity-85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl max-w-lg w-full relative animate-fadeIn">
            {/* Close button for modal */}
            <button
              onClick={() => {
                setShowInstructions(false);
                setShowCheatSheet(false);
              }}
              className="absolute top-3 right-4 text-white text-xl hover:text-red-400"
              aria-label="Close"
            >✖</button>

            {/* Instructions modal content */}
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

            {/* Cheat/debug modal content (Ctrl+Click) */}
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

// Export the PlayerNameCapture component for use in the main application
export default PlayerNameCapture;
