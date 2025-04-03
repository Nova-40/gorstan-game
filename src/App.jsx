// App.jsx – Gorstan Game Entry Point
// (c) Geoff Webster – Gorstan Chronicles, 2025

import React, { useState } from 'react';
import GameEngine from './gameEngine.jsx';

const bannedWords = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'dick', 'piss', 'slut', 'whore',
  'nigger', 'faggot', 'twat', 'bollocks', 'wank', 'bugger', 'cock', 'tit',
  'crap', 'bastard', 'motherfucker', 'nigga', 'puta', 'mierda', 'bollok', 'tosser'
];

const sanitizeName = (name) => {
  const lower = name.toLowerCase();
  return !bannedWords.some(word => lower.includes(word));
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [startGame, setStartGame] = useState(false);

  const handleStart = () => {
    if (!playerName || !sanitizeName(playerName)) {
      alert('Please enter a valid name.');
      return;
    }
    setStartGame(true);
  };

  if (!startGame) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h1>The Gorstan Chronicles</h1>
        <p>Welcome to the official multiverse adventure.</p>

        <div style={{ margin: '2rem auto', maxWidth: '400px' }}>
          <label htmlFor="playerName"><strong>Enter your name:</strong></label><br />
          <input
            id="playerName"
            type="text"
            placeholder="e.g. Dale"
            onBlur={e => setPlayerName(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', marginTop: '0.5rem' }}
          />
          <button onClick={handleStart} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            Start Game
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <a href="https://www.buymeacoffee.com/gorstan" target="_blank" rel="noopener noreferrer">
            ☕ Support development on Buy Me a Coffee
          </a>
          <br />
          <a href="https://www.thegorstanchronicles.com/book-showcase" target="_blank" rel="noopener noreferrer">
            📚 Explore the Books
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <h2>Welcome, {playerName}</h2>
      {loading && (
        <div className="loader" style={{ marginTop: '1rem', width: '40px', height: '40px', border: '5px solid #ccc', borderTop: '5px solid #555', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      )}
      <GameEngine playerName={playerName} onReady={() => setLoading(false)} />
    </div>
  );
}
