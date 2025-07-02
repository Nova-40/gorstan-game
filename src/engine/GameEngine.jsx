// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: GameEngine.jsx
// Path: src/engine/GameEngine.jsx


// File: /src/engine/GameEngine.jsx
// Version: v4.0.0-preprod

import React, { useState, useEffect } from 'react';
import QuickActions from '../components/QuickActions';
import { loadRoomById } from '../utils/roomLoader.jsx';

/**
 * GameEngine
 * Core component responsible for updating room state and interpreting directional and quick-action input.
 * Loads room data when the player's location changes and manages player state (e.g., sitting).
 */
const GameEngine = ({
  gameState,
  dispatchGameState,
  setRoomData,
  onQuickAction,
}) => {
  const [playerState, setPlayerState] = useState({ sitting: false });

  // Load the current room when gameState.currentRoom changes
  useEffect(() => {
    if (gameState?.currentRoom) {
      loadRoomById(gameState.currentRoom)
        .then(setRoomData)
        .catch((err) => {
          console.error('Failed to load room:', err);
          setRoomData(null);
        });
    }
  }, [gameState?.currentRoom, setRoomData]);

  /**
   * handleMove
   * Handles standard movement or sitting action.
   * If direction is 'sit', updates playerState to reflect sitting.
   * Otherwise, checks if movement is valid and updates gameState.
   */
  const handleMove = (direction) => {
    if (direction === 'sit') {
      console.log("You sit down. Something shifts in the air.");
      setPlayerState((prev) => ({ ...prev, sitting: true }));
      return;
    }

    const currentRoomId = gameState.currentRoom;
    if (!currentRoomId) return;

    loadRoomById(currentRoomId).then((room) => {
      const exits = room.exits || {};
      const nextRoomId = exits[direction];

      if (!nextRoomId) {
        const failSound = new Audio('/audio/fail.wav');
        failSound.play();
        return;
      }

      dispatchGameState({
        type: 'SET',
        payload: {
          currentRoom: nextRoomId,
          history: [...(gameState.history || []), nextRoomId],
        },
      });
    });
  };

  const handleSlip = () => handleMove('jump');
  const handleRewind = () => handleMove('back');
  const handleSit = () => handleMove('sit');

  return (
    <div>
      <QuickActions
        onDirection={handleMove}
        onQuickAction={onQuickAction}
        onSlip={handleSlip}
        onRewind={handleRewind}
        onSit={handleSit}
        canSit={gameState?.canSit}
      />
    </div>
  );
};

export default GameEngine;




/**
 * Checks if an exit is accessible based on player quest state
 */
export function isExitAccessible(exitId, playerState) {
  const gatedExits = {
    forgottenchamber: 'redemption',
    hiddenlab: 'redemption',
    ancientsroom: 'redemption'
  };
  if (gatedExits[exitId] && playerState.quest !== gatedExits[exitId]) {
    return false;
  }
  return true;
}

/**
 * Ayla assists with hints or teleportation to a zone
 */
export function aylaAssist(playerState, hintOnly = false) {
  if (playerState.quest === 'redemption') {
    const missingItems = [];
    if (!playerState.inventory.includes('Greasy Napkin')) missingItems.push('ancientsroom');
    if (!playerState.inventory.includes('Pen of Eternal Excuses')) missingItems.push('hiddenlab');
    if (!playerState.inventory.includes('Form 42-B: Admission of Guilt')) missingItems.push('forgottenchamber');

    const zones = {
      ancientsroom: 'ancientsZone',
      hiddenlab: 'scienceZone',
      forgottenchamber: 'forgottenZone'
    };

    if (missingItems.length > 0) {
      const targetRoom = missingItems[0];
      const targetZone = zones[targetRoom];
      if (hintOnly) {
        return `Ayla whispers: "Perhaps you should explore the ${targetZone} more closely."`;
      } else {
        return {
          type: 'teleportZone',
          zone: targetZone,
          message: 'Ayla gently redirects you...'
        };
      }
    }
  }
  return null;
}

/**
 * Trigger visual teleport effect
 * Replace with animation hook or class toggle in production
 */
export function triggerTeleportEffect(message = 'You feel a shift...') {
  const console = document.getElementById('game-console');
  if (console) {
    const div = document.createElement('div');
    div.className = 'ayla-message';
    div.innerText = message;
    console.appendChild(div);
  }
}

/**
 * Simulate puzzle tracking per zone
 */
export function completeZonePuzzle(zoneId, playerState) {
  if (!playerState.completedPuzzles) playerState.completedPuzzles = [];
  if (!playerState.completedPuzzles.includes(zoneId)) {
    playerState.completedPuzzles.push(zoneId);
  }
}

/**
 * Evaluate player endgame path
 */
export function checkEndgamePath(playerState) {
  const { resetCount, killedDominic, redeemedByPolly } = playerState;
  if (resetCount >= 7) return 'glitch';
  if (killedDominic && !redeemedByPolly) return 'bad';
  if (redeemedByPolly && !killedDominic) return 'redemption';
  return 'architect';
}