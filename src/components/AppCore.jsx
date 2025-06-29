import React, { useState, useEffect } from 'react';
import GameEngine from '../engine/GameEngine';
import WelcomeScreen from './WelcomeScreen';
import TeletypeIntro from './TeletypeIntro';
import PlayerNameCapture from './PlayerNameCapture';
import UIToolbar from './UIToolbar';
import ResetScreen from './ResetScreen';
import StatusPanel from './StatusPanel';
import CommandInput from './CommandInput';
import MovementPanel from './MovementPanel';
import NPCConsole from './NPCConsole';
import QuickActions from './QuickActions';

const AppCore = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameStage, setGameStage] = useState('welcome');
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState({});
  const [queuedRoom, setQueuedRoom] = useState(null);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setGameStage('teletype');
  };

  const handleTeletypeChoice = (choice) => {
    let nextRoom = 'introstart';
    let inventoryBonus = [];
    let multiverseReset = false;

    switch (choice) {
      case 'jump':
        nextRoom = 'controlnexus';
        inventoryBonus = ['coffee'];
        setGameState((prev) => ({ ...prev, score: (prev.score || 0) + 10 }));
        break;
      case 'wait':
        nextRoom = 'introreset';
        multiverseReset = true;
        setGameState((prev) => ({ ...prev, score: (prev.score || 0) - 100 }));
        break;
      case 'sip':
        nextRoom = 'crossing';
        inventoryBonus = ['coffee'];
        multiverseReset = true;
        setGameState((prev) => ({ ...prev, score: (prev.score || 0) + 50 }));
        break;
      default:
        break;
    }

    if (multiverseReset) {
      setQueuedRoom({ room: nextRoom, inventory: inventoryBonus });
      setGameStage('resetting');
    } else {
      startGameAt(nextRoom, inventoryBonus);
    }
  };

  const startGameAt = (room, inventory) => {
    const initialState = {
      currentRoom: room,
      inventory: inventory,
      playerName,
    };
    setGameState(initialState);
    setGameStage('playing');
  };

  if (gameStage === 'welcome') {
    return <WelcomeScreen onContinue={() => setGameStage('nameInput')} />;
  }

  if (gameStage === 'nameInput') {
    return <PlayerNameCapture onNameSubmit={handleNameSubmit} />;
  }

  if (gameStage === 'teletype') {
    return <TeletypeIntro playerName={playerName} onChoice={handleTeletypeChoice} />;
  }

  if (gameStage === 'resetting') {
    return (
      <ResetScreen
        onComplete={() => {
          if (queuedRoom) {
            startGameAt(queuedRoom.room, queuedRoom.inventory);
            setQueuedRoom(null);
          }
        }}
      />
    );
  }

  if (gameStage === 'playing') {
    return (
      <div className="game-container flex flex-col min-h-screen">
        <UIToolbar />
        <StatusPanel gameState={gameState} />
        <GameEngine
          gameState={gameState}
          setGameState={setGameState}
          setRoomData={setRoomData}
        />
        <MovementPanel gameState={gameState} setGameState={setGameState} />
        <NPCConsole gameState={gameState} />
        <CommandInput gameState={gameState} setGameState={setGameState} />
        <QuickActions gameState={gameState} setGameState={setGameState} />
      </div>
    );
  }

  return null;
};

export default AppCore;


