// src/rooms/glitchrealm/RavenChamberRoom.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// The R.A.V.E.N. Chamber - Redacted Archive Verification Entity Node

import React, { useState, useEffect } from 'react';
import { useGameState } from '../../state/gameState';
import RavenInteraction from '../../components/RavenInteraction';

interface RavenChamberRoomProps {
  roomId: string;
}

const RavenChamberRoom: React.FC<RavenChamberRoomProps> = ({ roomId }) => {
  const { state, dispatch } = useGameState();
  const [isConsoleActive, setIsConsoleActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if player has already been redacted
  const isPlayerRedacted = state.flags?.playerIsRedacted || false;

  useEffect(() => {
    // Ambient effects for the chamber
    const ambientTimer = setTimeout(() => {
      if (!hasInteracted) {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `raven-ambient-${Date.now()}`,
            text: '💻 The console screen flickers with ancient code. A faint synthetic voice whispers: "Agent... is that you?"',
            type: 'narrative',
            timestamp: Date.now()
          }
        });
      }
    }, 3000);

    return () => clearTimeout(ambientTimer);
  }, [hasInteracted, dispatch]);

  const handleConsoleInteraction = () => {
    setIsConsoleActive(true);
    setHasInteracted(true);
    
    dispatch({
      type: 'RECORD_MESSAGE',
      payload: {
        id: `raven-console-activate-${Date.now()}`,
        text: '💻 The console screen blazes to life. Ancient systems boot with crackling static...',
        type: 'system',
        timestamp: Date.now()
      }
    });
  };

  const handleRavenComplete = () => {
    setIsConsoleActive(false);
  };

  // Room-specific command processing
  useEffect(() => {
    const handleCommand = (event: CustomEvent) => {
      const command = event.detail.toLowerCase();
      
      if (command.includes('interact console') || 
          command.includes('access archive') || 
          command.includes('activate console') ||
          command.includes('touch console')) {
        handleConsoleInteraction();
      } else if (command.includes('look console') || command.includes('examine console')) {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `raven-examine-${Date.now()}`,
            text: '💻 The console is ancient but functional. Holographic displays flicker with fragments of corrupted data. A palm scanner glows faintly blue.',
            type: 'narrative',
            timestamp: Date.now()
          }
        });
      }
    };

    window.addEventListener('gameCommand', handleCommand as EventListener);
    return () => window.removeEventListener('gameCommand', handleCommand as EventListener);
  }, [dispatch]);

  return (
    <div className="raven-chamber-room">
      <div className="room-description">
        <p className="narrative-text">
          You step into a narrow chamber humming with quiet static. Cracked screens line the walls, 
          some looping nonsense glyphs, others frozen mid-boot. At the far end, a sunken pedestal 
          glows faintly blue.
        </p>
        
        {!hasInteracted && (
          <p className="narrative-text">
            As you approach, an ancient AI console flickers to life, casting harsh white light. 
            A synthetic voice—fragmented and uncertain—calls out to you, mistaking you for someone else.
          </p>
        )}

        {isPlayerRedacted && (
          <p className="glitch-text error-text">
            ⚠️ The chamber seems to pulse with recognition. Warning lights blink silently. 
            You feel watched by unseen systems.
          </p>
        )}
      </div>

      <div className="room-interactions">
        {!isConsoleActive && (
          <div className="console-prompt">
            <p className="action-hint">
              💡 You can <strong>interact console</strong> or <strong>access archive</strong> to activate the terminal.
            </p>
          </div>
        )}

        {isConsoleActive && (
          <RavenInteraction 
            onComplete={handleRavenComplete}
            playerName={state.player.name || 'Agent'}
          />
        )}
      </div>

      <div className="room-exits">
        <p className="exit-text">
          A crackling rift in the wall leads <strong>back</strong> to the hub.
        </p>
      </div>
    </div>
  );
};

export default RavenChamberRoom;
