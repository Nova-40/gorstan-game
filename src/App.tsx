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
// Game module.

import AppCore from "./components/AppCore";
import { CelebrationController } from "./celebrate";
import DebugOverlay from './components/DebugOverlay';
import TooltipSystem from './components/TooltipSystem';
import SessionGoalBanner from './components/SessionGoalBanner';
import QuestLog from './components/QuestLog';
import QuickMap from './components/QuickMap';

import React from "react";

import { GameStateProvider } from "./state/gameState";

const App: React.FC = () => {
  const rooms = [
    { id: 'room1', title: 'Starting Area', unlocked: true },
    { id: 'room2', title: 'Control Room', unlocked: false },
    { id: 'room3', title: 'Puzzle Chamber', unlocked: true },
  ];

  const currentRoomId = 'room1';

  // JSX return block or main return
  return (
    <GameStateProvider>
      <CelebrationController>
        <AppCore />
        {process.env.NODE_ENV === 'development' && <DebugOverlay />}
        <TooltipSystem />
        <SessionGoalBanner />
        <QuestLog />
        <QuickMap rooms={rooms} currentRoomId={currentRoomId} />
      </CelebrationController>
    </GameStateProvider>
  );
};

export default App;
