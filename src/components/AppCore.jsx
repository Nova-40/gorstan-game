/**
 * AppCore.jsx
 * Main application controller for the Gorstan game.
 * Handles stage transitions, persistent state, ambient audio, and UI toggles.
 *
 * Version: 3.8.9
 * Author: Geoff Webster
 * License: MIT
 */

import React, { useEffect, useState } from 'react';
import GameEngine from '../engine/GameEngine';
import WelcomeScreen from './WelcomeScreen';
import TeletypeIntro from './TeletypeIntro';
import PlayerNameCapture from './PlayerNameCapture';
import UIToolbar from './UIToolbar';
import ResetScreen from './ResetScreen';

const AppCore = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState({
    currentRoom: 'start',
    inventory: [],
    flags: {},
  });
  const [playerName, setPlayerName] = useState('');
  const [gameStage, setGameStage] = useState('welcome'); // 'welcome' → 'name' → 'teletype' → 'playing' → 'resetting'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cheatVisible, setCheatVisible] = useState(false);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('gorstanPlayer');
    const savedState = localStorage.getItem('gorstanState');
    const savedSound = localStorage.getItem('gorstanSound');

    if (savedPlayer) setPlayerName(savedPlayer);
    if (savedState && savedPlayer) {
      try {
        setGameState(JSON.parse(savedState));
        setGameStage('playing');
      } catch (e) {
        console.warn('Invalid saved state:', e);
      }
    }
    if (savedSound === 'off') setSoundEnabled(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (playerName?.trim()) {
      localStorage.setItem('gorstanPlayer', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('gorstanState', JSON.stringify(gameState));
    }
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('gorstanSound', soundEnabled ? 'on' : 'off');
  }, [soundEnabled]);

  useEffect(() => {
    if (gameStage === 'playing' && soundEnabled) {
      import('../utils/soundUtils').then((mod) => {
        if (mod.playAmbient) {
          mod.playAmbient(true);
        } else {
          console.warn('playAmbient is not defined in soundUtils:', mod);
        }
      });
    }
  }, [gameStage, soundEnabled]);

  useEffect(() => {
    const handleClick = (e) => {
      if (e.ctrlKey) setCheatVisible(true);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleResetGame = () => {
    setPlayerName('');
    setGameState({
      currentRoom: 'start',
      inventory: [],
      flags: {},
    });
    localStorage.removeItem('gorstanPlayer');
    localStorage.removeItem('gorstanState');
    setGameStage('resetting');
  };

  if (loading) {
    return <div className="text-white flex justify-center items-center h-screen">Loading world...</div>;
  }

  if (!roomData || Object.keys(roomData).length === 0) {
    return <div className="text-red-500">No room data available.</div>;
  }

  return (
    <>
      <UIToolbar
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        cheatVisible={cheatVisible}
      />

      {gameStage === 'resetting' && (
        <ResetScreen onComplete={() => setGameStage('welcome')} />
      )}

      {gameStage === 'welcome' && (
        <WelcomeScreen
          onStart={() => {
            import('../utils/soundUtils').then(({ playClick }) => {
              if (soundEnabled && typeof playClick === 'function') {
                playClick();
              }
            });
            setGameStage('name');
          }}
        />
      )}

      {gameStage === 'name' && (
        <PlayerNameCapture
          onNameSubmit={(name) => {
            setPlayerName(name);
            if (soundEnabled) {
              import('../utils/soundUtils').then(({ playClick }) => {
                if (typeof playClick === 'function') {
                  playClick();
                }
              });
            }
            setGameStage('teletype');
          }}
        />
      )}

      {gameStage === 'teletype' && (
        <TeletypeIntro onFinish={() => setGameStage('playing')} />
      )}

      {gameStage === 'playing' && (
        <GameEngine
          rooms={roomData}
          setRooms={setRoomData}
          gameState={gameState}
          setGameState={setGameState}
          playerName={playerName}
          onResetGame={handleResetGame}
          soundEnabled={soundEnabled}
          cheatVisible={cheatVisible}
        />
      )}
    </>
  );
};

export default AppCore;

