
// GameUI.tsx
// Layout container for 4-quadrant Gorstan UI

import React from 'react';
import RoomRenderer from './RoomRenderer';
import TerminalConsole from './TerminalConsole';
import CommandInput from './CommandInput';
import DirectionIconsPanel from './DirectionIconsPanel'; // This will be used for Quad 4
import PresentNPCsPanel from './PresentNPCsPanel'; // Shows NPC icons/names under command input
import PlayerStatsPanel from './PlayerStatsPanel'; // Shows health, score, and player stats

const GameUI: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      height: '100vh',
      width: '100vw',
    }}>
      {/* Quad 1: Top Left - Room Image */}
      <div style={{ gridColumn: '1', gridRow: '1', padding: '6px' }}>
        <RoomRenderer />
      </div>

      {/* Quad 2: Top Right - Terminal Console */}
      <div style={{ gridColumn: '2', gridRow: '1', padding: '6px', overflow: 'auto' }}>
        <TerminalConsole />
      </div>

      {/* Quad 3: Bottom Left - Player Stats, Command Input and NPCs */}
      <div style={{ gridColumn: '1', gridRow: '2', padding: '6px' }}>
        <PlayerStatsPanel />
        <CommandInput />
        <PresentNPCsPanel />
      </div>

      {/* Quad 4: Bottom Right - Direction/QuickAction Icons */}
      <div style={{ gridColumn: '2', gridRow: '2', padding: '6px' }}>
        <DirectionIconsPanel />
      </div>
    </div>
  );
};

export default GameUI;
