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
// User interface panel display.

import React, { useState } from "react";
import { useGameState } from "../../state/gameState";
import { Room } from "../../types/Room";

// Variable declaration
const DebugPanel = () => {
  // React state declaration
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useGameState();

  // Variable declaration
  const handleRevealRooms = () => {
    // Reveal all visited rooms - dispatch appropriate action
    dispatch({ type: "DEBUG_REVEAL_ROOMS" });
  };

  // Variable declaration
  const handleJump = (roomId: string) => {
    dispatch({ type: "SET_ROOM", payload: { roomId } });
  };

  // Variable declaration
  const handleAddItem = (itemId: string) => {
    dispatch({ type: "ADD_ITEM", payload: { item: itemId } });
  };

  // Variable declaration
  const handleSummonNPC = (npcId: string) => {
    dispatch({ type: "SUMMON_NPC", payload: { npcId } });
  };

  // Variable declaration
  const handleKillPlayer = () => {
    dispatch({
      type: "KILL_PLAYER",
      payload: { reason: "Debug override: instant death triggered." },
    });
  };

  // Variable declaration
  const handleToggleAchievement = (id: string) => {
    dispatch({ type: "TOGGLE_ACHIEVEMENT", payload: { achievementId: id } });
  };

  // JSX return block or main return
  return (
    <div className="debug-panel">
      <button onClick={() => setIsOpen(!isOpen)} className="debug-toggle">
        {isOpen ? "Close Debug" : "Open Debug"}
      </button>
      {isOpen && (
        <div className="debug-content">
          <h2>Debug Panel</h2>
          <button onClick={handleRevealRooms}>Reveal All Rooms</button>
          <button onClick={() => handleJump("controlnexus")}>
            Jump to Control Nexus
          </button>
          <button onClick={() => handleAddItem("coffee")}>Add Coffee</button>
          <button onClick={() => handleSummonNPC("polly")}>Call Polly</button>
          <button onClick={handleKillPlayer}>💀 Kill Player</button>
          <button onClick={() => handleToggleAchievement("dominicMemory")}>
            Toggle Dominic Memory Achievement
          </button>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
