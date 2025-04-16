/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Main application wrapper for the Gorstan game UI.
 */

// App.jsx – Gorstan Game Entry Point
// (c) Geoff Webster – Gorstan Chronicles, 2025

import React, { useState } from 'react';
import GameEngine from './GameEngine.jsx';
import bannedWords from '../engine/bannedWords.js';

const sanitizeName = (name) => {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return !bannedWords.some((word) => normalized.includes(word));
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
const [showNameEntry, setShowNameEntry] = useState(false);
const [playerName, setPlayerName] = useState('');
  const [startGame, setStartGame] = useState(false);

  const handleStart = () => {
    if (!playerName || !sanitizeName(playerName)) {
      alert('Please enter a valid name.');
      return;
    }
    setLoading(true);
    setStartGame(true);
  };

  if (!startGame) {
    
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black text-white p-6 text-center flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">Welcome to The Gorstan Chronicles</h1>
        <p className="text-gray-300 mb-2 max-w-xl">
          You’re about to enter a strange and shifting multiverse — one where time bends, AIs whisper from fractured dimensions,
          and everything might be watching you.
        </p>
        <p className="text-gray-300 mb-2 max-w-xl">
          The code behind this experience is MIT licensed, but all characters and story are &copy; 2025 Geoff Webster.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          If you like this, <a href="https://www.buymeacoffee.com/gorstan" target="_blank" className="text-yellow-400 underline">buy me a coffee</a> ☕
        </p>
        <button
          onClick={() => {
            setShowWelcome(false);
            setShowNameEntry(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded shadow-md"
        >
          Accept & Continue
        </button>
        <div className="mt-8 text-xs text-gray-600">Version 1.0.0.0</div>
      </div>
    );
  }

return (
      <div
        style={{
          fontFamily: 'sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1>The Gorstan Chronicles</h1>
        <p>Welcome to the official multiverse adventure.</p>

        <div
          style={{
            margin: '2rem auto',
            maxWidth: '400px',
          }}
        >
          <label htmlFor="playerName">
            <strong>Enter your name:</strong>
          </label>
          <br />
          <input
  id="playerName"
  type="text"
  placeholder="e.g. Dale"
  onBlur={(e) => setPlayerName(e.target.value)}
  className="w-full p-2 rounded text-black bg-white border border-gray-400"
  style={{ marginTop: '0.5rem' }}
/>
          <button
            onClick={handleStart}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
            }}
          >
            Start Game
          </button>
        </div>

        <div
          style={{
            marginTop: '2rem',
          }}
        >
          <a
            href="https://www.buymeacoffee.com/gorstan"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ Support development on Buy Me a Coffee
          </a>
          <br />
          <a
            href="https://www.thegorstanchronicles.com/book-showcase"
            target="_blank"
            rel="noopener noreferrer"
          >
            📚 Explore the Books
          </a>
        </div>
      </div>
    );
  }

  
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-black text-white p-6 text-center flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">Welcome to The Gorstan Chronicles</h1>
        <p className="text-gray-300 mb-2 max-w-xl">
          You’re about to enter a strange and shifting multiverse — one where time bends, AIs whisper from fractured dimensions,
          and everything might be watching you.
        </p>
        <p className="text-gray-300 mb-2 max-w-xl">
          The code behind this experience is MIT licensed, but all characters and story are &copy; 2025 Geoff Webster.
        </p>
        <p className="text-sm text-gray-400 mb-4">
          If you like this, <a href="https://www.buymeacoffee.com/gorstan" target="_blank" className="text-yellow-400 underline">buy me a coffee</a> ☕
        </p>
        <button
          onClick={() => {
            setShowWelcome(false);
            setShowNameEntry(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded shadow-md"
        >
          Accept & Continue
        </button>
        <div className="mt-8 text-xs text-gray-600">Version 1.0.0.0</div>
      </div>
    );
  }

return (
    <div className="w-screen h-screen bg-black text-white font-sans">
      {startGame && loading && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <h2>Welcome, {playerName}</h2>
          <div
            className="loader"
            style={{
              marginTop: '1rem',
              width: '40px',
              height: '40px',
              border: '5px solid #ccc',
              borderTop: '5px solid #555',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>
      )}

      <GameEngine playerName={playerName} onReady={() => setLoading(false)} />
    </div>
  );
}