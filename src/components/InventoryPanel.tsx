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

const InventoryPanel: React.FC = () => {
  console.log("📦 InventoryPanel rendered");
  const { state } = useGameState();
  // Variable declaration
  const inventory = state.player?.inventory || [];

  // JSX return block or main return
  return (
    <div
      className="inventory-panel"
      style={{
        border: "2px solid lime",
        padding: "1rem",
        backgroundColor: "black",
        color: "lime",
        zIndex: 9999,
      }}
    >
      <h3>Inventory</h3>
      {inventory.length === 0 ? (
        <p>
          <em>Your inventory is empty.</em>
        </p>
      ) : (
        <ul>
          {inventory.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryPanel;
