/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Main application wrapper for the Gorstan game UI.
 */

import React, { useState } from 'react';
import GameEngine from './GameEngine.jsx';
import IntroScreen from './IntroScreen.jsx';
import BootScreen from './BootScreen.jsx';
import bannedWords from '../engine/bannedWords.js';

const sanitizeName = (name) => {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return !bannedWords.some((word) => normalized.includes(word));
};

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showBoot, setShowBoot] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [startGame, setStartGame] = useState(false);

  const handleNameSubmit = (name) => {
    if (!name || !sanitizeName(name)) {
      alert('Please enter a valid name.');
      return;
    }
    setPlayerName(name);
    setLoading(true);
    setStartGame(true);
  };

  if (!startGame) {
    if (showIntro) {
      return <IntroScreen onContinue={() => setShowIntro(false) || setShowBoot(true)} />;
    }

    if (showBoot) {
      return <BootScreen onStart={handleNameSubmit} />;
    }
  }

  return (
    <div className="w-screen h-screen bg-black text-white font-sans">
      {loading && (
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