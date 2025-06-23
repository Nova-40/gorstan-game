// src/engine/GameEngine.jsx
// Gorstan v3.3.1 – Engine with Trait, Flag, Score, and Ayla Ask Handling

import React, { useEffect, useState, useRef } from "react";
import RoomRenderer from "../components/RoomRenderer";
import StatusPanel from "../components/StatusPanel";
import CommandInput from "../components/CommandInput";
import AylaPanel from "../components/AylaPanel";
import { initialiseStoryProgress } from "./storyProgress";
import { seedTraps } from "./trapEngine";
import { seedItemsInRooms } from "./itemEngine";

const GameEngine = ({
  rooms,
  setRooms,
  playerName,
  startRoomId,
  entryMode,
  extraFlags = {},
}) => {
  const [currentRoom, setCurrentRoom] = useState(startRoomId);
  const [playerTraits, setPlayerTraits] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [storyFlags, setStoryFlags] = useState({});
  const messageLogRef = useRef([]);
  const engineRef = useRef({}); // Add this line for Ayla.ask support

  // Initial game setup
  useEffect(() => {
    console.log("🧠 Initialising GameEngine with:");
    console.log("🏁 Start Room:", startRoomId);
    console.log("📦 Extra Flags:", extraFlags);

    const initialTraits = extraFlags.traits || [];
    const initialScore = extraFlags.bonusScore || 0;
    const arrivedVia = extraFlags.arrivedVia || "unknown";

    setPlayerTraits(initialTraits);
    setPlayerScore(initialScore);

    const initialFlags = initialiseStoryProgress();
    initialFlags.arrivedVia = arrivedVia;
    setStoryFlags(initialFlags);

    seedTraps();
    seedItemsInRooms();

    messageLogRef.current = [`You awaken in ${startRoomId}...`];
  }, []);

  // Optional: define Ayla's internal parser logic
  engineRef.current.askAyla = (query) => {
    const q = query.toLowerCase();
    if (q.includes("coffee")) return "Ah, Gorstan coffee... smooth and radioactive.";
    if (q.includes("reset")) return "You’ve already reset once. Careful — they’re watching.";
    if (q.includes("dale")) return "Dale was here. That much I’m sure of.";
    return "I’m not sure how to help with that — but I’m listening.";
  };

  const appendMessage = (msg) => {
    messageLogRef.current.push(msg);
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-4">
      <RoomRenderer room={rooms[currentRoom]} />
      <StatusPanel traits={playerTraits} score={playerScore} />
      
      <AylaPanel
        askAyla={(q) => {
          const res = engineRef.current.askAyla?.(q);
          if (res) appendMessage(res);
        }}
      />
      
      <CommandInput
        gameState={{
          currentRoom,
          playerTraits,
          playerScore,
          storyFlags,
          rooms,
        }}
        setGameState={{
          setCurrentRoom,
          setPlayerTraits,
          setPlayerScore,
          setStoryFlags,
          setRooms,
        }}
        appendMessage={appendMessage}
        playerName={playerName}
      />
    </div>
  );
};

export default GameEngine;
