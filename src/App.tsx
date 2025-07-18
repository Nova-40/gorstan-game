// Module: src/App.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import React from 'react';
import AppCore from './components/AppCore';
import { GameStateProvider } from './state/gameState'; // ✅ adjust path if needed

const App: React.FC = () => {
  return (
    <GameStateProvider>
      <AppCore />
    </GameStateProvider>
  );
};

export default App;

