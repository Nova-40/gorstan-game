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

import React from "react";

import { GameStateProvider } from "./state/gameState";

const App: React.FC = () => {
  // JSX return block or main return
  return (
    <GameStateProvider>
      <CelebrationController>
        <AppCore />
        {process.env.NODE_ENV === 'development' && <DebugOverlay />}
      </CelebrationController>
    </GameStateProvider>
  );
};

export default App;
