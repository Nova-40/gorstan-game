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

import React from "react";
import { useGameState } from "../state/gameState";

const DebugPanel: React.FC = () => {
  const { state, dispatch } = useGameState();

  // Variable declaration
  const clearFlags = () => {
    dispatch({ type: "CLEAR_ALL_FLAGS" });
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        text: "[DEBUG] All flags cleared.",
        type: "system",
        timestamp: Date.now(),
      },
    });
  };

  // Variable declaration
  const listFlags = Object.keys(state.flags || {});

  // JSX return block or main return
  return (
    <div className="debug-panel">
      <button
        onClick={() =>
          dispatch({
            type: "SET_ROOM",
            payload: { roomId: "offgorstanZone_ancientvault" },
          })
        }
      >
        Warp: Ancient Vault
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "SET_ROOM",
            payload: { roomId: "offmultiverseZone_shatteredrealm" },
          })
        }
      >
        Warp: Shattered Realm
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "SET_FLAG",
            payload: { key: "napkinExtrapolated", value: true },
          })
        }
      >
        Set Flag: Napkin Extrapolated
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "SET_FLAG",
            payload: { key: "sidedWith", value: "al" },
          })
        }
      >
        Set Flag: Sided with Al
      </button>
      <h3>Debug Panel</h3>
      <button onClick={clearFlags}>Clear All Flags</button>
      <h4>Active Flags:</h4>
      <ul>
        {listFlags.length === 0 ? (
          <li>
            <em>No active flags</em>
          </li>
        ) : (
          listFlags.map((flag, i) => <li key={i}>{flag}</li>)
        )}
      </ul>
    </div>
  );
};

export default DebugPanel;
