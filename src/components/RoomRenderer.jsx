/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Responsible for visual rendering of game rooms.
 */


import React from 'react';

export default function RoomRenderer({
  flags = {},
  room,
  secretDoorRevealed,
  isResetRoom,
  handleResetButtonPress,
  shuffledTunnelExits,
  playerName,
  visitCount = 0,
  inventory = [],
  hasUniversalKey = false,
}) {
  if (!room) {
    return <div className="text-red-500">This room does not exist in the current dimension.</div>;
  }

  return (
    <div className="w-full mb-6 p-4 bg-gray-900 rounded-lg shadow-inner">
      {room.graphic && (
        <div className="mb-4 rounded-xl border-4 border-indigo-500 shadow-lg bg-black bg-opacity-50 p-2 w-[400px] h-[280px] mx-auto flex justify-center items-center">
          <img
            src={room.graphic}
            alt={room.name}
            className="w-full h-full object-cover drop-shadow-md"
          />
        </div>
      )}

      <h1 className="text-2xl font-bold text-yellow-100 mb-2">{room.name}</h1>
      <p className="text-white mb-4">{room.description}</p>

      {isResetRoom && (
        <div className="my-6 text-center border border-blue-600 bg-blue-950 p-6 rounded-lg shadow-lg">
          <p className="text-blue-100 mb-3">
            A large blue button slowly pulses in the centre of the room. A handwritten sign is taped beside it:
          </p>
          <blockquote className="italic text-blue-300 text-lg mb-3">"Do not push this button."</blockquote>
          <p className="text-blue-400 text-sm">(It’s your handwriting.)</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleResetButtonPress}
              className="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-400 animate-pulse shadow-lg text-white font-bold text-sm"
            >
              PUSH
            </button>
          </div>
        </div>
      )}

      {(flags.secretTunnel || hasUniversalKey) && (
        <div className="mt-4 p-4 bg-yellow-800 text-yellow-100 border-l-4 border-yellow-400 rounded">
          <p>Your coffee splashes against the wall. A golden shimmer outlines a hidden door now visible to you.</p>
          <p className="mt-2 italic text-sm">
            You can now enter the <strong>SECRET DOOR</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
