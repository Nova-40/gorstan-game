// File: src/components/AppCore.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// Main application core for Gorstan game. Handles stage transitions, player state,
// and orchestrates the rendering of all major UI/game components.

import React, { useState } from 'react';
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

/**
 * AppCore
 * Main React component for Gorstan game.
 * Manages global state, handles stage transitions, and renders the appropriate UI.
 */
const AppCore = () => {
  // Stage of the game: 'welcome', 'nameCapture', 'intro', 'resetting', 'game'
  const [stage, setStage] = useState('welcome');
  // Player's name
  const [playerName, setPlayerName] = useState('');
  // Room queued for reset transitions
  const [queuedRoom, setQueuedRoom] = useState(null);
  // Current room data object
  const [roomData, setRoomData] = useState(null);
  // Main game state: inventory, flags, history, etc.
  const [gameState, setGameState] = useState({ inventory: [], flags: {}, history: [] });
  // Sound enabled/disabled
  const [soundEnabled, setSoundEnabled] = useState(true);

  /**
   * startGameAt
   * Loads a room by ID and initializes the game state for a new session or transition.
   * @param {string} roomId - The ID of the room to start in.
   * @param {Array} inventory - Optional starting inventory.
   */
  const startGameAt = async (roomId, inventory = []) => {
    const loadedRoom = await loadRoomById(roomId);
    setRoomData(loadedRoom);
    setGameState({
      currentRoom: roomId,
      inventory,
      playerName,
      flags: {},
      history: [roomId],
    });
    setStage('game');
  };

  /**
   * handleQuickAction
   * Handles quick toolbar actions such as toggling sound or resetting the game.
   * @param {string} action - The action to perform.
   */
  const handleQuickAction = (action) => {
    if (action === 'toggleSound') setSoundEnabled((prev) => !prev);
    if (action === 'resetGame') setStage('welcome');
  };

  /**
   * handleIntroComplete
   * Handles the completion of the intro sequence and determines the next stage or room.
   * @param {Object} route - Route object with route type and optional data.
   */
  const handleIntroComplete = (route) => {
    if (route.route === 'jump') {
      startGameAt(route.targetRoom, route.inventoryBonus ?? []);
    } else if (route.route === 'wait') {
      setQueuedRoom({ room: 'introreset', inventory: ['coffee'] });
      setStage('resetting');
    } else if (route.route === 'sip') {
      setQueuedRoom({ room: 'crossing', inventory: ['coffee'] });
      setStage('resetting');
    }
    // TODO: Add handling for other intro routes if needed
  };

  /**
   * handleResetComplete
   * Handles the completion of a reset transition, starting the queued room.
   */
  const handleResetComplete = () => {
    if (queuedRoom) {
      startGameAt(queuedRoom.room, queuedRoom.inventory ?? []);
      setQueuedRoom(null);
    }
  };

  /**
   * renderStage
   * Renders the appropriate UI component(s) based on the current stage.
   * @returns {JSX.Element|null}
   */
  const renderStage = () => {
    switch (stage) {
      case 'welcome':
        // Welcome screen, advances to name capture
        return <WelcomeScreen onContinue={() => setStage('nameCapture')} />;
      case 'nameCapture':
        // Player name input screen
        return (
          <PlayerNameCapture
            onNameSubmit={(name) => {
              setPlayerName(name);
              setStage('intro');
            }}
          />
        );
      case 'intro':
        // Teletype intro sequence
        return (
          <TeletypeIntro
            playerName={playerName}
            onComplete={handleIntroComplete}
          />
        );
      case 'resetting':
        // Reset transition screen
        return <ResetScreen onComplete={handleResetComplete} />;
      case 'game':
        // Main game UI
        return (
          <>
            <StatusPanel gameState={gameState} />
            <RoomRenderer room={roomData} />
            <NPCConsole gameState={gameState} />
            <GameEngine
              gameState={gameState}
              setGameState={setGameState}
              setRoomData={setRoomData}
              onQuickAction={handleQuickAction}
            />
            <CommandInput
              gameState={gameState}
              setGameState={setGameState}
            />
          </>
        );
      default:
        // Fallback for unknown stage
        // FIXME: Should we show an error or fallback UI here?
        return null;
    }
  };

  // Main render: wraps the UI in a styled container and includes the toolbar
  return (
    <div className="min-h-screen bg-black text-green-400">
      <UIToolbar
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />
      {renderStage()}
    </div>
  );
};

// Export the AppCore component for use in the main application
export default AppCore;





