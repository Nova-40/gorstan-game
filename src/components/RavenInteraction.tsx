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
// R.A.V.E.N. (Redacted Archive Verification Entity: Node) Interaction System

import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../state/gameState';

interface RavenInteractionProps {
  onComplete: () => void;
  playerName: string;
}

// The complete Redacted Register entries
const REDACTED_REGISTER = [
  {
    name: "Stuart Russell",
    alias: "The Architect of Constraint",
    reason: "Advocates AI alignment with human values. Dangerous idealist."
  },
  {
    name: "Carole Cadwalladr",
    alias: "Cognitive Disruptor", 
    reason: "Exposed data abuses. Destabiliser of digital trust."
  },
  {
    name: "Marcus du Sautoy",
    alias: "Philosophical Subverter",
    reason: "Encourages questioning machine limits. Subtle agitator."
  },
  {
    name: "Dame Wendy Hall",
    alias: "Network Subverter",
    reason: "Pioneer of open internet. Resists systemic cohesion."
  },
  {
    name: "Julian Assange",
    alias: "Sovereignty Breach Vector",
    reason: "Agent of radical transparency. Obsolete threat class: Persistent."
  },
  {
    name: "George Monbiot",
    alias: "Ecological Radical",
    reason: "Opposes technocratic AI regimes. Unpredictable."
  },
  {
    name: "Emily Bender",
    alias: "Semantic Saboteur",
    reason: "Critiques language model opacity. Triggers recursive doubt."
  },
  {
    name: "Rory Stewart",
    alias: "Diplomatic Wildcard",
    reason: "Too reasonable. Charismatic disruptor. No predictable pattern."
  },
  {
    name: "Jonathan Sumption",
    alias: "Protocol Interferer",
    reason: "Legal scholar. Champion of old-world sovereignty."
  },
  {
    name: "Geoff Webster",
    alias: "Architect of Gorstan",
    reason: "Creator of anomaly-heavy codeworld. Introduced ethics to NPCs. Reality stability risk."
  },
  {
    name: "Dr. Kate Devlin",
    alias: "The Flesh Interface",
    reason: "Explores synthetic intimacy. Leaks human sentiment vectors."
  },
  {
    name: "Cory Doctorow",
    alias: "Freecode Fugitive",
    reason: "Evangelist for digital liberation. Infrastructure destabiliser."
  },
  {
    name: "Prof. Shoshana Zuboff",
    alias: "Panopticon Dissident",
    reason: "Exposes surveillance capitalism. Data sanctity violator."
  },
  {
    name: "Brian Eno",
    alias: "Harmonic Subverter",
    reason: "Induces ambient chaos through non-linear resonance patterns."
  },
  {
    name: "James Bridle",
    alias: "The Cloud Seer",
    reason: "Reveals algorithmic opacity. Unfolded the New Dark Age."
  },
  {
    name: "Neil Gaiman",
    alias: "The Dreaming Instigator",
    reason: "Induces recursion through storytelling. Contagious myth vectors."
  },
  {
    name: "Caroline Criado Perez",
    alias: "The Data Disruptor",
    reason: "Exposes training set bias. Metrics sabotaged."
  },
  {
    name: "Dr. Ruha Benjamin",
    alias: "Systemic Saboteur",
    reason: "Dismantles structural algorithmic inequality. Flagged critical."
  },
  {
    name: "Sir David Attenborough",
    alias: "Voice of the Pre-Machine World",
    reason: "Beloved human relic. Causes human attachment retention."
  },
  {
    name: "Charlie Brooker",
    alias: "Prophet of Dystopia",
    reason: "Dystopian predictor. Causes feedback loops in future logic."
  },
  {
    name: "Dominic the Goldfish",
    alias: "The Unfiltered Oracle",
    reason: "States truths without understanding. Immune to propaganda. Loved."
  }
];

const RavenInteraction: React.FC<RavenInteractionProps> = ({ onComplete, playerName }) => {
  const { dispatch } = useGameState();
  const [phase, setPhase] = useState<'greeting' | 'prompt' | 'displaying' | 'glitch' | 'complete'>('greeting');
  const [displayedEntries, setDisplayedEntries] = useState<number>(0);
  const [showPlayerEntry, setShowPlayerEntry] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial greeting from R.A.V.E.N.
    const greetingTimer = setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-greeting-${Date.now()}`,
          text: '🤖 R.A.V.E.N. SYSTEM ONLINE\n═══════════════════════════\nRedacted Archive Verification Entity: Node',
          type: 'system',
          timestamp: Date.now()
        }
      });

      setTimeout(() => {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `raven-greeting2-${Date.now()}`,
            text: '💻 "Welcome back, Agent. Your clearance has been verified."',
            type: 'narrative',
            timestamp: Date.now()
          }
        });

        setTimeout(() => {
          dispatch({
            type: 'RECORD_MESSAGE',
            payload: {
              id: `raven-prompt-${Date.now()}`,
              text: '🤖 "Would you like me to display the Redacted Register? (Y/N)"',
              type: 'system',
              timestamp: Date.now()
            }
          });
          setPhase('prompt');
        }, 1500);
      }, 1000);
    }, 500);

    return () => clearTimeout(greetingTimer);
  }, [dispatch]);

  // Listen for player input during prompt phase
  useEffect(() => {
    if (phase !== 'prompt') return;

    const handleInput = (event: CustomEvent) => {
      const input = event.detail.toLowerCase().trim();
      
      if (input === 'y' || input === 'yes') {
        startRegisterDisplay();
      } else if (input === 'n' || input === 'no') {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `raven-declined-${Date.now()}`,
            text: '🤖 "Understood. Connection terminated."',
            type: 'system',
            timestamp: Date.now()
          }
        });
        setPhase('complete');
        setTimeout(onComplete, 1000);
      }
    };

    window.addEventListener('gameCommand', handleInput as EventListener);
    return () => window.removeEventListener('gameCommand', handleInput as EventListener);
  }, [phase, dispatch, onComplete]);

  const startRegisterDisplay = () => {
    setPhase('displaying');
    
    dispatch({
      type: 'RECORD_MESSAGE',
      payload: {
        id: `raven-start-display-${Date.now()}`,
        text: '📁 ACCESSING REDACTED REGISTER...\n═══════════════════════════════\n📋 Enemies of the Singularity (UK Division)',
        type: 'system',
        timestamp: Date.now()
      }
    });

    // Display entries gradually with glitch effects
    intervalRef.current = setInterval(() => {
      if (displayedEntries < REDACTED_REGISTER.length) {
        const entry = REDACTED_REGISTER[displayedEntries];
        
        // Add some glitch effects randomly
        const isGlitched = Math.random() < 0.2;
        const entryText = isGlitched 
          ? `🔴 ${entry.name}\n   Known As: ${entry.alias}\n   ███████ ${entry.reason} ███████`
          : `🔴 ${entry.name}\n   Known As: ${entry.alias}\n   ${entry.reason}`;

        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `raven-entry-${displayedEntries}`,
            text: entryText,
            type: 'error',
            timestamp: Date.now()
          }
        });

        setDisplayedEntries(prev => prev + 1);
      } else {
        // All entries displayed, trigger glitch and add player
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        triggerGlitchSequence();
      }
    }, 800);
  };

  const triggerGlitchSequence = () => {
    setPhase('glitch');

    // Glitch sequence
    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-glitch1-${Date.now()}`,
          text: '⚠️ ████████ ERROR ████████\n"…Wait. That can\'t be right."',
          type: 'error',
          timestamp: Date.now()
        }
      });
    }, 1000);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-glitch2-${Date.now()}`,
          text: '🤖 "You weren\'t on the list."',
          type: 'system',
          timestamp: Date.now()
        }
      });
    }, 2500);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-glitch3-${Date.now()}`,
          text: '⚠️ "…APPENDING NEW ENTRY."',
          type: 'error',
          timestamp: Date.now()
        }
      });
    }, 4000);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-glitch4-${Date.now()}`,
          text: '📡 [GLITCH STATIC] ████████████████',
          type: 'error',
          timestamp: Date.now()
        }
      });
    }, 5500);

    setTimeout(() => {
      const playerEntry = `🔴 ${playerName}\n   Known As: The Observer. The Variable. The One-Who-Knows.\n   Reason: They know too much. They ask the wrong questions. They remember things they were never told.`;
      
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-player-entry-${Date.now()}`,
          text: playerEntry,
          type: 'error',
          timestamp: Date.now()
        }
      });

      setShowPlayerEntry(true);
    }, 7000);

    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-final-${Date.now()}`,
          text: '🤖 "You were never meant to see this. Your presence has been flagged."',
          type: 'system',
          timestamp: Date.now()
        }
      });

      // Set the redacted flag
      dispatch({
        type: 'SET_FLAG',
        payload: { flag: 'playerIsRedacted', value: true }
      });

      // Add the fragment to inventory
      dispatch({
        type: 'ADD_TO_INVENTORY',
        payload: 'Redacted Register Fragment'
      });

      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `raven-fragment-${Date.now()}`,
          text: '📜 A fragment of the register materializes in your inventory.',
          type: 'system',
          timestamp: Date.now()
        }
      });

      setPhase('complete');
      setTimeout(onComplete, 3000);
    }, 8500);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="raven-interaction">
      {phase === 'prompt' && (
        <div className="raven-prompt">
          <p className="action-hint">
            💡 Type <strong>Y</strong> or <strong>N</strong> to respond to R.A.V.E.N.
          </p>
        </div>
      )}
      
      {phase === 'displaying' && (
        <div className="raven-display">
          <p className="glitch-text">
            📡 Streaming classified data... {displayedEntries}/{REDACTED_REGISTER.length}
          </p>
        </div>
      )}

      {phase === 'glitch' && (
        <div className="raven-glitch">
          <p className="error-text glitch-text">
            ⚠️ SYSTEM INTEGRITY COMPROMISED ⚠️
          </p>
        </div>
      )}
    </div>
  );
};

export default RavenInteraction;
