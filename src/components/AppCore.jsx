// src/components/AppCore.jsx
// Gorstan v3.3.6 – AppCore with full intro logic, fixed imports, and enhanced entry flags

import React, { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
import FrameWrapper from "./FrameWrapper";
import PlayerNameCapture from "./PlayerNameCapture";
import TeletypeIntro from "./TeletypeIntro";
import GameEngine from "../engine/GameEngine";
import { loadAllRooms } from "../engine/roomLoader";

const AppCore = () => {
  const [stage, setStage] = useState("welcome");
  const [playerName, setPlayerName] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [entryPoint, setEntryPoint] = useState(null);

  useEffect(() => {
    loadAllRooms()
      .then(setRooms)
      .catch((err) => console.error("❌ Error loading rooms:", err));
  }, []);

  const startRoomId = {
    jump: "controlnexus",
    sip: "controlnexus",
    wait: "introreset",
  }[entryPoint] || "controlnexus";

  const entryTraits = {
    jump: ["daring"],
    sip: ["caffeinated"],
    wait: ["resigned"],
  };

  const entryScore = {
    jump: 10,
    sip: 5,
    wait: 0,
  };

  const renderStage = () => {
    if (!rooms) {
      return <div className="text-white text-center p-4 bg-black">Loading world data...</div>;
    }

    switch (stage) {
      case "welcome":
        return (
          <FrameWrapper>
            <WelcomeScreen onBegin={() => setStage("name")} />
          </FrameWrapper>
        );

      case "name":
        return (
          <FrameWrapper>
            <PlayerNameCapture
              onNameSubmit={(name) => {
                setPlayerName(name);
                setStage("teletype");
              }}
            />
          </FrameWrapper>
        );

      case "teletype":
        return (
          <FrameWrapper>
            <TeletypeIntro
              playerName={playerName}
              onComplete={(choice) => {
                setEntryPoint(choice);
                setStage("game");
              }}
            />
          </FrameWrapper>
        );

      case "game":
        return (
          <GameEngine
            rooms={rooms}
            setRooms={setRooms}
            playerName={playerName}
            startRoomId={startRoomId}
            entryMode={entryPoint}
            extraFlags={{
              arrivedVia: entryPoint,
              traits: entryTraits[entryPoint] || [],
              bonusScore: entryScore[entryPoint] || 0,
            }}
          />
        );

      default:
        return (
          <div className="text-white text-center p-4 bg-black">
            Something went wrong. Try refreshing?
          </div>
        );
    }
  };

  return renderStage();
};

export default AppCore;

