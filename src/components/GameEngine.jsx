// src/components/GameEngine.jsx
/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 *
 * Description: Core game engine for the Gorstan game. Manages state, navigation, and rendering,
 * including multi-press reset button with countdown overlay and a 'look' command in the Hidden Lab.
 */

import React, { useEffect, useReducer, useState } from 'react';
import {
  BriefcasePuzzle,
  ExitDisplay,
  RoomRenderer,
  VowelLatticePuzzle,
  Modal
} from '.';
import { gameReducer, initialState } from '../engine/stateReducer';
import rooms from '../engine/rooms';

const COMMON_WIDTH = '200px';

export default function GameEngine({ playerName, onReady }) {
  // Global game state
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { currentRoom, visitedRooms, inventory, flags } = state;

  // UI state
  const [command, setCommand] = useState('');
  const [waitPhase, setWaitPhase] = useState(null); // 'splat' | 'reset'
  const [resetPressCount, setResetPressCount] = useState(0);
  const [countdown, setCountdown] = useState(null); // number or null
  const [isResetting, setIsResetting] = useState(false);

  // onReady delay
  useEffect(() => {
    const timer = setTimeout(onReady, 1000);
    return () => clearTimeout(timer);
  }, [onReady]);

  // First visit determination
  const isFirstVisitToCrossing = currentRoom === 'crossing' && !visitedRooms['crossing'];

  // Crossing images
  const { initial: crossingInitial, returned: crossingReturned } = rooms.crossing.graphics;

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    setIsResetting(true);
    const r = setTimeout(() => window.location.reload(), 3000);
    return () => clearTimeout(r);
  }, [countdown]);

  // Reset button logic
  const handleResetPress = () => {
    const next = resetPressCount + 1;
    setResetPressCount(next);
    if (next === 1) alert("Do not press this button again.");
    else if (next === 2) alert("No really don't press it again.");
    else if (next === 3) setCountdown(5);
  };

  // Command parser
  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const input = command.trim().toLowerCase();
    setCommand('');
    const directions = ['north','south','east','west','up','down'];

    switch (input) {
      case 'drink coffee':
        if (inventory.includes('coffee')) {
          dispatch({ type: 'REMOVE_ITEM', payload: 'coffee' });
          dispatch({ type: 'ADD_ITEM', payload: 'empty-cup' });
          alert('You guzzle down the coffee. You feel jittery!');
        } else alert('You have no coffee to drink.');
        break;

      case 'throw coffee':
        if (inventory.includes('coffee')) {
          dispatch({ type: 'REMOVE_ITEM', payload: 'coffee' });
          alert('You throw the coffee into the void. A portal hums open beside you.');
          dispatch({ type: 'MOVE_ROOM', payload: 'crossing' });
        } else alert('No coffee in inventory.');
        break;

      case 'jump':
        dispatch({ type: 'MOVE_ROOM', payload: 'controlnexus' });
        break;

      case 'wait':
        if (isFirstVisitToCrossing) {
          setWaitPhase('splat');
          setTimeout(() => setWaitPhase('reset'), 5000);
        } else alert('Nothing happens.');
        break;

      case 'inv':
        alert(`Inventory: ${inventory.join(', ') || 'empty'}`);
        break;

      case 'look':
        if (currentRoom === 'hiddenlab') {
          alert(
            "The Hidden Lab hums with quantum apparatus: entangled photons leap between mirrors, and Schrödinger’s cat peers at you from its box, both inside and outside at once. On a stainless‑steel pedestal glints the Fae Compass—its runes promise guidance in the Fae World."
          );
          if (!inventory.includes('fae-compass')) {
            dispatch({ type: 'ADD_ITEM', payload: 'fae-compass' });
            alert('You pick up the Fae Compass. This will surely aid you in the Fae realms ahead.');
          }
        } else alert("You look around but don't notice anything unusual here.");
        break;

      default:
        if (input.startsWith('go ') && directions.includes(input.slice(3))) {
          const dir = input.slice(3);
          const next = rooms[currentRoom]?.exits?.[dir];
          if (next) dispatch({ type: 'MOVE_ROOM', payload: next });
          else alert("You can't go that way.");
        } else if (directions.includes(input)) {
          const next = rooms[currentRoom]?.exits?.[input];
          if (next) dispatch({ type: 'MOVE_ROOM', payload: next });
          else alert("You can't go that way.");
        } else {
          alert(`Unrecognized command: "${input}"`);
        }
    }
  };

  // Special screens
  if (waitPhase === 'splat') return <SplashScreen text="SPLAT" />;
  if (waitPhase === 'reset') return <SplashScreen text="The multiverse resets..." />;
  if (countdown !== null) return <CountdownScreen count={countdown} />;
  if (isResetting) return <ResettingScreen />;

  // Main UI
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {currentRoom === 'crossing' ? (
        <CrossingView
          firstVisit={isFirstVisitToCrossing}
          initialImg={crossingInitial}
          returnedImg={crossingReturned}
          command={command}
          onInputChange={e => setCommand(e.target.value)}
          onCommandKey={handleCommand}
          inventory={inventory}
          dispatch={dispatch}
        />
      ) : currentRoom === 'resetroom' ? (
        <ResetRoomView
          handleResetPress={handleResetPress}
          command={command}
          onInputChange={e => setCommand(e.target.value)}
          onCommandKey={handleCommand}
          exits={flags.secretTunnel}
          currentRoom={currentRoom}
          rooms={rooms}
          inventory={inventory}
        />
      ) : (
        <MainGameUI
          currentRoom={currentRoom}
          rooms={rooms}
          flags={flags}
          inventory={inventory}
          command={command}
          onInputChange={e => setCommand(e.target.value)}
          onCommandKey={handleCommand}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

// Helper components
const SplashScreen = ({ text }) => (
  <div className="flex items-center justify-center h-screen bg-black">
    <h1 className="text-8xl font-bold animate-pulse text-red-500">{text}</h1>
  </div>
);

const CountdownScreen = ({ count }) => (
  <div className="flex items-center justify-center h-screen bg-black">
    <h1 className="text-9xl font-bold">{count}</h1>
  </div>
);

const ResettingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <h1 className="text-5xl font-bold text-black">
      Multiversal reset is commencing...
    </h1>
  </div>
);

// CrossingView component
export function CrossingView({
  firstVisit,
  initialImg,
  returnedImg,
  command,
  onInputChange,
  onCommandKey,
  inventory,
  dispatch
}) {
  const imgSrc = firstVisit ? initialImg : returnedImg;
  const placeholder = firstVisit
    ? 'Try: jump, wait, pick up coffee, throw coffee, inv, look'
    : 'What will you do next?';

  return (
    <div className="text-left fade-in">
      <div className="flex justify-center mb-4">
        <img src={imgSrc} alt="The Crossing" style={{ width: COMMON_WIDTH, height: 'auto' }} />
      </div>
      <input
        type="text"
        value={command}
        onChange={onInputChange}
        onKeyDown={onCommandKey}
        className="w-full mt-2 p-3 rounded-md border border-gray-700 bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        autoFocus
      />
      {firstVisit && (
        <>
          <p className="mt-2 mb-2">
            The sound of brakes squeals through the mist. A big yellow truck looms ahead—would you like to become one with several tonnes of accelerated regret?
          </p>
          <p className="mb-6 text-purple-300">
            A portal appears before you, its iridescent glow humming in the air.
          </p>
          {!inventory.includes('coffee') ? (
            <button
              onClick={() => dispatch({ type: 'ADD_ITEM', payload: 'coffee' })}
              className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Pick up coffee
            </button>
          ) : (
            <div className="mb-4 space-x-4">
              <button
                onClick={() => dispatch({ type: 'MOVE_ROOM', payload: 'controlnexus' })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
              >
                Jump
              </button>
              <button
                onClick={() => onCommandKey({ key: 'Enter', target: { value: 'wait' } })}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white"
              >
                Wait
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ResetRoomView component
export function ResetRoomView({
  handleResetPress,
  command,
  onInputChange,
  onCommandKey,
  exits,
  currentRoom,
  rooms,
  inventory
}) {
  return (
    <div className="space-y-4">
      <ExitDisplay currentRoom={currentRoom} rooms={rooms} secretExits={exits} inventory={inventory} />
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <RoomRenderer room={rooms.resetroom} />
        </div>
        <button
          onClick={handleResetPress}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white h-12 self-start"
        >
          PRESS RESET
        </button>
      </div>
      <input
        type="text"
        value={command}
        onChange={onInputChange}
        onKeyDown={onCommandKey}
        className="w-full mt-2 p-3 rounded-md border border-gray-700 bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="What will you do?"
        autoFocus
      />
    </div>
  );
}

// MainGameUI component
export function MainGameUI({
  currentRoom,
  rooms,
  flags,
  inventory,
  command,
  onInputChange,
  onCommandKey,
  dispatch
}) {
  return (
    <>
      <ExitDisplay currentRoom={currentRoom} rooms={rooms} secretExits={flags.secretTunnel} inventory={inventory} />
      <RoomRenderer room={rooms[currentRoom]} secretDoorRevealed={flags.secretTunnel} />
      {currentRoom === 'hiddenlibrary' && !flags.latticePuzzleSolved && (
        <VowelLatticePuzzle puzzle={rooms.hiddenlibrary.puzzle} onSolve={() => dispatch({ type: 'SET_FLAG', payload: { key: 'latticePuzzleSolved', value: true } })} />
      )}
      {currentRoom === 'controlnexus' && inventory.includes('briefcase') && !flags.briefcaseSolved && (
        <BriefcasePuzzle puzzle={rooms.controlnexus.briefcase} onSolve={() => dispatch({ type: 'SET_FLAG', payload: { key: 'briefcaseSolved', value: true } })} />
      )}
      <Modal />
      <input
        type="text"
        value={command}
        onChange={onInputChange}
        onKeyDown={onCommandKey}
        className="w-full mt-2 p-3 rounded-md border border-gray-700 bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="What will you do next?"
        autoFocus
      />
    </>
  );
}


