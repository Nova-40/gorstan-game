/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect, useState } from 'react';

import { useGameState } from '../state/gameState';








interface RebootMessage {
  text: string;
  delay: number;
  type: 'info' | 'error' | 'system' | 'warning';
}

const rebootSequence: RebootMessage[] = [
  { text: "Initialising Higgs Boson field...", delay: 500, type: 'system' },
  { text: "Calibrating quantum foam lattice...", delay: 1000, type: 'system' },
  { text: "Creating fundamental particles...", delay: 1500, type: 'system' },
  { text: "Applying gravity patch (v1.0.2)...", delay: 2000, type: 'system' },
  { text: "Generating baryonic matter...", delay: 2500, type: 'system' },
  { text: "Constructing multiversal constants...", delay: 3000, type: 'system' },
  { text: "Recompiling narrative entropy...", delay: 3500, type: 'system' },
  { text: "Rebalancing protagonist probability...", delay: 4000, type: 'system' },
  { text: "Restoring player state...", delay: 4500, type: 'system' },
  { text: "Multiverse reboot complete.", delay: 5000, type: 'info' },
];

const MultiverseRebootSequence: React.FC = () => {
  const { state, dispatch } = useGameState();
// React state declaration
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<RebootMessage[]>([]);
// React state declaration
  const [isComplete, setIsComplete] = useState(false);
  const [fadeStage, setFadeStage] = useState<'none' | 'fading' | 'black' | 'reboot'>('none');
// React state declaration
  const [fadeOpacity, setFadeOpacity] = useState(0);

// React effect hook
  useEffect(() => {
    if (!state.flags?.show_reset_sequence || isComplete || fadeStage !== 'reboot') {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (currentMessageIndex < rebootSequence.length) {
// Variable declaration
      const currentMessage = rebootSequence[currentMessageIndex];

      timeoutId = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, currentMessage]);
        setCurrentMessageIndex(prev => prev + 1);

        
        if (currentMessageIndex === rebootSequence.length - 1) {
          setTimeout(() => {
            setIsComplete(true);

            
            import('../logic/achievementEngine').then(({ unlockAchievement }) => {
              unlockAchievement('multiverse_rebooter');
            });

            
            dispatch({
              type: 'CHANGE_ROOM',
              payload: 'crossing'
            });

            
            dispatch({
              type: 'SET_FLAGS',
              payload: {
                ...state.flags,
                multiverse_reboot_pending: false,
                multiverse_reboot_active: false,
                show_reset_sequence: false,
              }
            });

            
            setFadeStage('none');
            setFadeOpacity(0);

            
            setTimeout(() => {
              dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                  id: `reboot-complete-${Date.now()}`,
                  text: 'You awaken with a faint sense of déjà vu. The multiverse has been rebooted.',
                  type: 'narrative',
                  timestamp: Date.now(),
                }
              });
            }, 1000);

          }, 1500); 
        }
      }, currentMessage.delay);
    }

// JSX return block or main return
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentMessageIndex, state.flags?.show_reset_sequence, isComplete, fadeStage, dispatch, state.flags]);

  
// React effect hook
  useEffect(() => {
    if (state.flags?.multiverse_reboot_pending && !state.flags?.multiverse_reboot_active) {
      
      setFadeStage('fading');

      
// Variable declaration
      const initialDelay = setTimeout(() => {
        setFadeOpacity(1);
      }, 50);

      let fadeTimeoutId: NodeJS.Timeout;
      let rebootTimeoutId: NodeJS.Timeout;

      
      fadeTimeoutId = setTimeout(() => {
        setFadeStage('black');

        
        rebootTimeoutId = setTimeout(() => {
          setFadeStage('reboot');
          dispatch({ type: 'START_MULTIVERSE_REBOOT' });
          dispatch({ type: 'SHOW_RESET_SEQUENCE' });
        }, 2000); 
      }, 1000); 

// JSX return block or main return
      return () => {
        clearTimeout(initialDelay);
        clearTimeout(fadeTimeoutId);
        clearTimeout(rebootTimeoutId);
      };
    }
  }, [state.flags?.multiverse_reboot_pending, state.flags?.multiverse_reboot_active, dispatch]);

  if (!state.flags?.multiverse_reboot_pending && fadeStage === 'none') {
    return null;
  }

  
  const fadeOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'black',
    opacity: fadeOpacity,
    transition: 'opacity 1s ease-in-out',
    zIndex: 10000,
    pointerEvents: 'all',
  };

  
  if (fadeStage === 'fading' || fadeStage === 'black') {
    return <div style={fadeOverlayStyle} />;
  }

  
  if (fadeStage !== 'reboot') {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
  };

  const containerStyle: React.CSSProperties = {
    background: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    color: '#00ccff',
    margin: '0 0 1rem 0',
    fontFamily: 'Courier New, monospace',
    fontSize: '1.2rem',
  };

  const loadingBarStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    background: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const progressStyle: React.CSSProperties = {
    height: '100%',
    background: 'linear-gradient(90deg, #00ccff, #0099cc)',
    borderRadius: '4px',
    width: `${(currentMessageIndex / rebootSequence.length) * 100}%`,
    transition: 'width 0.5s ease-in-out',
  };

  const consoleStyle: React.CSSProperties = {
    fontFamily: 'Courier New, monospace',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    minHeight: '200px',
  };

  const messageStyle: React.CSSProperties = {
    marginBottom: '0.5rem',
  };

  const prefixStyle: React.CSSProperties = {
    color: '#666',
    marginRight: '0.5rem',
  };

// Variable declaration
  const getMessageColor = (type: string): string => {
    switch (type) {
      case 'system': return '#00ccff';
      case 'info': return '#00ff00';
      case 'error': return '#ff6666';
      case 'warning': return '#ffaa00';
      default: return '#ffffff';
    }
  };

  const cursorStyle: React.CSSProperties = {
    color: '#00ccff',
    fontWeight: 'bold',
    animation: 'blink 1s infinite',
  };

// JSX return block or main return
  return (
    <div style={overlayStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>🌌 MULTIVERSE REBOOT IN PROGRESS</h2>
          <div style={loadingBarStyle}>
            <div style={progressStyle} />
          </div>
        </div>

        <div style={consoleStyle}>
          {displayedMessages.map((message, index) => (
            <div key={index} style={messageStyle}>
              <span style={prefixStyle}>{'>'}</span>
              <span style={{ color: getMessageColor(message.type) }}>
                {message.text}
              </span>
            </div>
          ))}

          {currentMessageIndex < rebootSequence.length && (
            <div style={cursorStyle}>█</div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MultiverseRebootSequence;
