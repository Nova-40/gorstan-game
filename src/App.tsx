import AppCore from './components/AppCore';

import React from 'react';

import { GameStateProvider } from './state/gameState'; // ✅ adjust path if needed



// App.tsx — App.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: App

// Module: src/App.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


const App: React.FC = () => {
  return (
    <GameStateProvider>
      <AppCore />
    </GameStateProvider>
  );
};

export default App;

