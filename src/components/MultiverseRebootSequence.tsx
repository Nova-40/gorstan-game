
import React, { useEffect, useState } from 'react';

import { useGameState } from '../state/gameState';



// MultiverseRebootSequence.tsx
// Animated reboot sequence for blue button press
// (c) 2025 Geoffrey Alan Webster. MIT License


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
  { text: "Oops. Creating Spanish Inquisition...", delay: 3500, type: 'error' },
  { text: "⚠️ Unexpected Inquisition Error", delay: 4000, type: 'warning' },
  { text: "Removing Spanish Inquisition...", delay: 4500, type: 'system' },
  { text: "Recompiling narrative entropy...", delay: 5000, type: 'system' },
  { text: "Rebalancing protagonist probability...", delay: 5500, type: 'system' },
  { text: "Restoring player state...", delay: 6000, type: 'system' },
  { text: "Multiverse reboot complete.", delay: 6500, type: 'info' },
];

const MultiverseRebootSequence: React.FC = () => {
  const { state, dispatch } = useGameState();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<RebootMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [fadeStage, setFadeStage] = useState<'none' | 'fading' | 'black' | 'reboot'>('none');
  const [fadeOpacity, setFadeOpacity] = useState(0);

  useEffect(() => {
    if (!state.flags?.show_reset_sequence || isComplete || fadeStage !== 'reboot') {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    if (currentMessageIndex < rebootSequence.length) {
      const currentMessage = rebootSequence[currentMessageIndex];

      timeoutId = setTimeout(() => {
        setDisplayedMessages(prev => [...prev, currentMessage]);
        setCurrentMessageIndex(prev => prev + 1);

        // If this is the last message, trigger the reset
        if (currentMessageIndex === rebootSequence.length - 1) {
          setTimeout(() => {
            setIsComplete(true);

            // Unlock the multiverse rebooter achievement
            import('../logic/achievementEngine').then(({ unlockAchievement }) => {
              unlockAchievement('multiverse_rebooter');
            });

            // Reset to crossing after completion (not introreset)
            dispatch({
              type: 'CHANGE_ROOM',
              payload: 'crossing'
            });

            // Clear the reboot flags and reset fade stage
            dispatch({
              type: 'SET_FLAGS',
              payload: {
                ...state.flags,
                multiverse_reboot_pending: false,
                multiverse_reboot_active: false,
                show_reset_sequence: false,
              }
            });

            // Reset fade stage and opacity
            setFadeStage('none');
            setFadeOpacity(0);

            // Add final completion message to console
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

          }, 1500); // Slightly longer delay for better effect
        }
      }, currentMessage.delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentMessageIndex, state.flags?.show_reset_sequence, isComplete, fadeStage, dispatch, state.flags]);

  // Start the sequence when the flag is set
  useEffect(() => {
    if (state.flags?.multiverse_reboot_pending && !state.flags?.multiverse_reboot_active) {
      // Start fade to black
      setFadeStage('fading');

      // Trigger fade animation after a brief delay to ensure state is set
      const initialDelay = setTimeout(() => {
        setFadeOpacity(1);
      }, 50);

      let fadeTimeoutId: NodeJS.Timeout;
      let rebootTimeoutId: NodeJS.Timeout;

      // After fade completes, hold black screen for 2 seconds
      fadeTimeoutId = setTimeout(() => {
        setFadeStage('black');

        // After black screen hold, start the reboot sequence
        rebootTimeoutId = setTimeout(() => {
          setFadeStage('reboot');
          dispatch({ type: 'START_MULTIVERSE_REBOOT' });
          dispatch({ type: 'SHOW_RESET_SEQUENCE' });
        }, 2000); // 2 second hold on black screen
      }, 1000); // 1 second fade duration

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

  // Fade overlay styles
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

  // Show fade screen during fade and black stages
  if (fadeStage === 'fading' || fadeStage === 'black') {
    return <div style={fadeOverlayStyle} />;
  }

  // Show reboot sequence only during reboot stage
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
