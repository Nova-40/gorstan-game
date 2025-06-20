
import React, { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
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
      .catch((err) => {
        console.error("❌ Error loading rooms:", err);
      });
  }, []);

  const startRoomId = {
    jump: "controlnexus",
    sip: "controlnexus",
    wait: "introreset",
  }[entryPoint] || "controlnexus";

  const renderStage = () => {
    if (!rooms) {
      return (
        <div className="text-white text-center p-4 bg-black">
          Loading world data...
        </div>
      );
    }

    switch (stage) {
      case "welcome":
        return <WelcomeScreen onBegin={() => setStage("name")} />;
      case "name":
        return (
          <PlayerNameCapture
            onNameSubmit={(name) => {
              setPlayerName(name);
              setStage("teletype");
            }}
          />
        );
      case "teletype":
        return (
          <TeletypeIntro
            playerName={playerName}
            onComplete={(choice) => {
              setEntryPoint(choice);
              setStage("game");
            }}
          />
        );
      case "game":
        return (
          <GameEngine
            rooms={rooms}
            setRooms={setRooms}
            playerName={playerName}
            startRoomId={startRoomId}
            entryMode={entryPoint}
            extraFlags={{}}
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
