import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const NPCConsole = ({ activeNPC, playerQuery, playerState, onRespond }) => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!playerQuery) return;

    let npcResponse = '';
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
    }

    setResponse(npcResponse);
    if (onRespond) onRespond(npcResponse);
  }, [playerQuery, activeNPC, playerState, onRespond]);

  if (!activeNPC) return null;

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

export default NPCConsole;
