// src/components/InventoryPanel.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// User interface panel display.

import React from 'react';
import { useGameState } from '../state/gameState';

const InventoryPanel: React.FC = () => {
  console.log("📦 InventoryPanel rendered");
  const { state } = useGameState();
// Variable declaration
  const inventory = state.player?.inventory || [];

// JSX return block or main return
  return (
    <div className="inventory-panel" style={{ border: "2px solid lime", padding: "1rem", backgroundColor: "black", color: "lime", zIndex: 9999 }}>
      <h3>Inventory</h3>
      {inventory.length === 0 ? (
        <p><em>Your inventory is empty.</em></p>
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
