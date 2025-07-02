// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: AppCore.jsx
// Path: src/components/AppCore.jsx


// File: /src/components/AppCore.jsx
// Version: v4.0.0-preprod

import React, { useState, useReducer, useEffect } from 'react';
import GameEngine from '../engine/GameEngine';
import WelcomeScreen from './WelcomeScreen';
import TeletypeIntro from './TeletypeIntro';
import PlayerNameCapture from './PlayerNameCapture';
import UIToolbar from './UIToolbar';
import ResetScreen from './ResetScreen';
import StatusPanel from './StatusPanel';
import RoomRenderer from './RoomRenderer';
import CommandInput from './CommandInput';
import NPCConsole from './NPCConsole';
import { loadRoomById } from '../utils/roomLoader';

// === Game Stage Constants ===
const STAGES = {
  WELCOME: 'welcome',
  NAME_CAPTURE: 'nameCapture',
  INTRO: 'intro',
  RESETTING: 'resetting',
  GAME: 'game',
};

// === Game State Reducer ===
function gameStateReducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.payload };
    case 'RESET':
      return { inventory: [], flags: {}, history: [] };
    default:
      return state;
  }
}

// === LocalStorage Helpers ===
function loadSavedGame() {
  try {
    const raw = localStorage.getItem('gorstanSave');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGame({ playerName, gameState, stage }) {
  try {
    localStorage.setItem(
      'gorstanSave',
      JSON.stringify({ playerName, state: gameState, stage })
    );
  } catch (e) {
    console.warn('Unable to save game state:', e);
  }
}

const AppCore = () => {
  const [stage, setStage] = useState(STAGES.WELCOME);
  const [playerName, setPlayerName] = useState('');
  const [queuedRoom, setQueuedRoom] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, dispatchGameState] = useReducer(gameStateReducer, {
    inventory: [],
    flags: {},
    history: [],
  });

  // Load save game (if confirmed by player)
  useEffect(() => {
    const saved = loadSavedGame();
    if (saved) {
      const ok = window.confirm('Load saved game?');
      if (ok) {
        dispatchGameState({ type: 'SET', payload: saved.state });
        setPlayerName(saved.playerName || '');
        setStage(saved.stage || STAGES.WELCOME);
      }
    }
  }, []);

  // Autosave on game state change
  useEffect(() => {
    saveGame({ playerName, gameState, stage });
  }, [playerName, gameState, stage]);

  const startGameAt = async (roomId, inventory = []) => {
    const loadedRoom = await loadRoomById(roomId);
    setRoomData(loadedRoom);
    dispatchGameState({
      type: 'SET',
      payload: {
        currentRoom: roomId,
        inventory,
        playerName,
        flags: {},
        history: [roomId],
      },
    });
    setStage(STAGES.GAME);
  };

  const handleQuickAction = (action) => {
    if (action === 'toggleSound') setSoundEnabled((prev) => !prev);
    if (action === 'resetGame') setStage(STAGES.WELCOME);
  };

  const handleIntroComplete = (route) => {
    if (route.route === 'jump') {
      startGameAt(route.targetRoom, route.inventoryBonus ?? []);
    } else if (route.route === 'wait') {
      setQueuedRoom({ room: 'introreset', inventory: ['coffee'] });
      setStage(STAGES.RESETTING);
    } else if (route.route === 'sip') {
      setQueuedRoom({ room: 'crossing', inventory: ['coffee'] });
      setStage(STAGES.RESETTING);
    }
  };

  const handleResetComplete = async () => {
    if (queuedRoom) {
      await startGameAt(queuedRoom.room, queuedRoom.inventory || []);
      setQueuedRoom(null);
    } else {
      setStage(STAGES.WELCOME);
    }
  };

  return (
    <>
      {stage === STAGES.WELCOME && (
        <WelcomeScreen onContinue={() => setStage(STAGES.NAME_CAPTURE)} />
      )}
      {stage === STAGES.NAME_CAPTURE && (
        <PlayerNameCapture
          onSubmit={setPlayerName}
          onNext={() => setStage(STAGES.INTRO)}
        />
      )}
      {stage === STAGES.INTRO && (
        <TeletypeIntro onComplete={handleIntroComplete} />
      )}
      {stage === STAGES.RESETTING && (
        <ResetScreen onComplete={handleResetComplete} />
      )}
      {stage === STAGES.GAME && (
        <>
          <UIToolbar
            onQuickAction={handleQuickAction}
            soundEnabled={soundEnabled}
          />
          <StatusPanel gameState={gameState} />
          <RoomRenderer room={roomData} />
          <CommandInput />
          <NPCConsole />
          <GameEngine
            playerName={playerName}
            gameState={gameState}
            dispatchGameState={dispatchGameState}
            setRoomData={setRoomData}
            onQuickAction={handleQuickAction}
          />
        </>
      )}
    </>
  );
};


import { getEndgameRoom } from '../engine/endgameRouter';

/**
 * Sends player to appropriate endgame room
 */
function triggerEndgame(playerState, dispatch) {
  const roomId = getEndgameRoom(playerState);
  dispatch({ type: 'SET_ROOM', roomId });
}


export default AppCore;







/* TEST: Codex display */
const debugCodex = {
  npcs: [
    { id: 'dominic', name: 'Dominic the Fish', description: 'Remembers past deaths and resets.' },
    { id: 'ayla', name: 'Ayla v2', description: 'Merged with the Lattice. Warm and intelligent.' }
  ],
  items: [
    { id: 'napkin', name: 'Greasy Napkin', description: 'Disgusting, but unexpectedly useful.' },
    { id: 'form42', name: 'Form 42-B', description: 'Apology form. Signed by the universe.' }
  ]
};

// Place this near return()
<CodexPanel codex={debugCodex} />