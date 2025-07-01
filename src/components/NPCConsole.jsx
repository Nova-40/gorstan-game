// src/components/NPCConsole.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// NPCConsole component for Gorstan game.
// Displays responses from active NPCs (Ayla, Morthos, Al) based on player queries and state.

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * NPCConsole
 * Renders a console panel showing the response of the currently active NPC to a player query.
 * Uses the global npcEngine to generate responses for each NPC.
 *
 * @param {Object} props - Component props.
 * @param {string} props.activeNPC - The currently active NPC ('ayla', 'morthos', 'al').
 * @param {string} props.playerQuery - The player's query or message to the NPC.
 * @param {Object} props.playerState - The current state of the player (traits, flags, etc).
 * @param {Function} [props.onRespond] - Optional callback invoked with the NPC's response.
 * @returns {JSX.Element|null}
 */
const NPCConsole = ({ activeNPC, playerQuery, playerState, onRespond }) => {
  // State to hold the current NPC response
  const [response, setResponse] = useState('');

  /**
   * useEffect to generate a new NPC response whenever the playerQuery, activeNPC,
   * playerState, or onRespond callback changes.
   */
  useEffect(() => {
    if (!playerQuery) return;

    let npcResponse = '';
    // Determine which NPC should respond and generate the response using npcEngine
    switch (activeNPC) {
      case 'ayla':
        npcResponse = window.npcEngine.generateAylaResponse(playerQuery, playerState);
        break;
      case 'morthos':
        npcResponse = window.npcEngine.generateMorthosResponse(playerQuery, playerState);
        break;
      case 'al':
        npcResponse = window.npcEngine.generateAlResponse(playerQuery, playerState);
        break;
      default:
        npcResponse = "There's no one here to answer that.";
        // TODO: Handle unknown NPCs or provide a fallback NPC.
    }

    setResponse(npcResponse);
    if (onRespond) onRespond(npcResponse);
  }, [playerQuery, activeNPC, playerState, onRespond]);

  // If there is no active NPC, do not render the console
  if (!activeNPC) return null;

  // Map NPC keys to display names
  const nameMap = {
    ayla: 'Ayla',
    morthos: 'Morthos',
    al: 'Al'
  };

  return (
    <div className="border rounded-xl p-4 bg-black/70 text-green-200 shadow-lg max-w-xl mx-auto my-4">
      <div className="text-lg font-semibold mb-1">{nameMap[activeNPC]} says:</div>
      <div className="italic">{response}</div>
    </div>
  );
};

NPCConsole.propTypes = {
  activeNPC: PropTypes.string, // 'ayla', 'morthos', 'al'
  playerQuery: PropTypes.string,
  playerState: PropTypes.object.isRequired,
  onRespond: PropTypes.func
};

// Export the NPCConsole component for use in the main application
export default NPCConsole;
