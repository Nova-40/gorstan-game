// src/App.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import AppCore from './components/AppCore';
import { CelebrationController } from './celebrate';

import React from 'react';

import { GameStateProvider } from './state/gameState'; 













const App: React.FC = () => {
// JSX return block or main return
  return (
    <GameStateProvider>
      <CelebrationController>
        <AppCore />
      </CelebrationController>
    </GameStateProvider>
  );
};

export default App;
