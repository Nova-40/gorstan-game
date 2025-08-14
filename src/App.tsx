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
import { playSFX } from './utils/sfxManager';
import AylaResponseIndicator from "./components/AylaResponseIndicator";
import DevOverlay from "./devtools/DevOverlay";
import AccessibilitySettingsPanel from "./components/AccessibilitySettingsPanel";

import React from "react";
import './styles/animations.css';

import { GameStateProvider } from "./state/gameState";

const App: React.FC = () => {
  const rooms = [
    { id: 'room1', title: 'Starting Area', unlocked: true },
    { id: 'room2', title: 'Control Room', unlocked: false },
    { id: 'room3', title: 'Puzzle Chamber', unlocked: true },
  ];

  const currentRoomId = 'room1';

  const handleAction = (action: string) => {
    if (action === 'success') {
      playSFX('success');
    } else if (action === 'failure') {
      playSFX('failure');
    } else if (action === 'teleport') {
      playSFX('teleport');
    }
  };

  // JSX return block or main return
  return (
    <GameStateProvider>
      <div className="game-container">
        <AylaResponseIndicator />
        <AppCore />
        <CelebrationController>
          <div>Celebration content goes here</div>
        </CelebrationController>
        {process.env.NODE_ENV === 'development' && <DebugOverlay />}
        <TooltipSystem />
        <SessionGoalBanner />
        <QuestLog />
        <QuickMap rooms={rooms} currentRoomId={currentRoomId} />
        <button onClick={() => handleAction('success')}>Test Success SFX</button>
        <button onClick={() => handleAction('failure')}>Test Failure SFX</button>
        <button onClick={() => handleAction('teleport')}>Test Teleport SFX</button>
        <div className="fade-in">This fades in!</div>
        <div className="slide-in">This slides in!</div>
        <AccessibilitySettingsPanel />
        {process.env.DEV_ONLY && <DevOverlay />}
      </div>
    </GameStateProvider>
  );
};

export default App;
