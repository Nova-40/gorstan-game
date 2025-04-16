/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Handles game logic, progression, and room updates.
 */

// GameEngine.jsx – Upgraded Core Logic with useReducer, Modular Commands, and Memory-aware Dialogue
// (c) Geoff Webster – Gorstan Game Engine 2025 – MIT Licensed

import React, { useReducer, useState } from 'react';
import RoomRenderer from './RoomRenderer';
import { initialState, gameReducer } from '../engine/stateReducer';
import parseCommand from '../engine/commandParser';
import { getDialogue } from '../engine/dialogueEngine';
import VowelLatticePuzzle from './VowelLatticePuzzle';
import BriefcasePuzzle from './BriefcasePuzzle';
import Modal from './Modal';
import rooms from '../engine/rooms';

export default function GameEngine({ playerName, onReady }) {

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [messages, setMessages] = useState([]);
  const [showLatticePuzzle, setShowLatticePuzzle] = useState(false);
  const [showBriefcasePuzzle, setShowBriefcasePuzzle] = useState(false);

  useEffect(() => {

  if (typeof onReady === 'function') {


    onReady();
  }
    if (state.flags.briefcasePuzzleActive) {
      setShowBriefcasePuzzle(true);
      dispatch({ type: 'SET_FLAG', payload: { key: 'briefcasePuzzleActive', value: false } });
    }
  }, [state.flags.briefcasePuzzleActive]);

  const roomData = rooms[state.currentRoom];


  function notify(text) {
    setMessages(prev => [...prev, { text, timestamp: Date.now() }]);
  }

  function handleCommand(input) {
    parseCommand(input, {
      ...state,
      notify,
      dispatch,
      inventory: state.inventory,
      currentRoom: state.currentRoom,
      flags: state.flags,
      setShowLatticePuzzle
    });
  }

  function handleLatticeSolved() {
    dispatch({ type: 'SET_FLAG', payload: { key: 'latticePuzzleSolved', value: true } });
    setShowLatticePuzzle(false);
    notify("The lattice glows with ancient recognition. [+60 Points]");
  }

  return (
    <div className="p-4">
      <RoomRenderer
        room={roomData}
        playerName={playerName}
        visitCount={state.visitedRooms[state.currentRoom] || 0}
        inventory={state.inventory}
        hasUniversalKey={state.flags.universalKey || false}
      />

      <div className="mt-6">
        <input
          type="text"
          placeholder="Type a command…"
          className="w-full p-3 rounded bg-gray-100 text-black placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCommand(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>

      <div className="mt-4 space-y-2 text-sm text-yellow-200">
        {messages.map((msg, idx) => (
          <div key={idx}>{msg.text}</div>
        ))}
      </div>

      <Modal show={showLatticePuzzle} onClose={() => setShowLatticePuzzle(false)}>
        <div>
          <VowelLatticePuzzle onSolve={handleLatticeSolved} />
        </div>
      </Modal>

      <Modal show={showBriefcasePuzzle} onClose={() => setShowBriefcasePuzzle(false)}>
        <BriefcasePuzzle
          onSolve={() => {
            dispatch({ type: 'REMOVE_ITEM', payload: 'briefcase' });
            dispatch({ type: 'ADD_ITEM', payload: 'medallion' });
            dispatch({ type: 'SET_FLAG', payload: { key: 'briefcaseSolved', value: true } });
            notify("Polly appears, smirking: 'Well done, genius. But I’ll warn you now — that medallion is cursed. When I meet you, if you hand it over, I’ll make sure it’s safe and see you right.'");
            setShowBriefcasePuzzle(false);
          }}
        />
      </Modal>
    </div>
  );
}
