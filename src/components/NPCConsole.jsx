// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: NPCConsole.jsx
// Path: src/components/NPCConsole.jsx


// File: /src/components/NPCConsole.jsx
// Version: v4.0.0-preprod

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * NPCConsole
 * Renders a console panel showing the response of the currently active NPC to a player query.
 * Uses the global npcEngine to generate responses for each NPC.
 */
const NPCConsole = ({ activeNPC, playerQuery, playerState, onRespond }) => {
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!playerQuery || !activeNPC) return;

    const engine = window.npcEngine;
    if (!engine) {
      setResponse('⚠️ NPC engine unavailable.');
      return;
    }

    setIsThinking(true);
    setResponse(''); // Clear previous response while thinking

    const timeout = setTimeout(() => {
      try {
        let npcResponse = '';

        switch (activeNPC) {
          case 'ayla':
            npcResponse = engine.generateAylaResponse(playerQuery, playerState);
            break;
          case 'morthos':
            npcResponse = engine.generateMorthosResponse(playerQuery, playerState);
            break;
          case 'al':
            npcResponse = engine.generateAlResponse(playerQuery, playerState);
            break;
          default:
            npcResponse = "There's no one here to answer that.";
            // TODO: Add support for Polly, Wendell, Findlater, etc.
        }

        setResponse(npcResponse);
        if (onRespond) onRespond(npcResponse);
      } catch (err) {
        console.error('[NPCConsole] Error generating NPC response:', err);
        setResponse('⚠️ Error: NPC could not respond.');
      } finally {
        setIsThinking(false);
      }
    }, 500); // Slight delay to simulate "thinking"

    return () => clearTimeout(timeout);
  }, [playerQuery, activeNPC, playerState, onRespond]);

  if (!activeNPC) return null;

  const nameMap = {
    ayla: 'Ayla',
    morthos: 'Morthos',
    al: 'Al',
  };

  return (
    <div className="border rounded-xl p-4 bg-black/70 text-green-200 shadow-lg max-w-xl mx-auto my-4">
      <div className="text-lg font-semibold mb-1">
        {nameMap[activeNPC] || '???'} says:
      </div>
      <div className="italic">
        {isThinking ? '💬 ...thinking' : response || '—'}
      </div>
    </div>
  );
};

NPCConsole.propTypes = {
  activeNPC: PropTypes.string,
  playerQuery: PropTypes.string,
  playerState: PropTypes.object.isRequired,
  onRespond: PropTypes.func,
};


/**
 * CSS Styling for Ayla handwriting messages
 * Add this inline or via a global style later if needed
 */
const style = document.createElement('style');
style.innerHTML = `
  .ayla-message {
    font-family: 'Lucida Handwriting', cursive;
    color: #b6fcd5;
    background-color: #000;
    padding: 0.5rem;
    border-left: 3px solid #6ee7b7;
    margin: 0.5rem 0;
    white-space: pre-wrap;
  }
`;
document.head.appendChild(style);

export default NPCConsole;