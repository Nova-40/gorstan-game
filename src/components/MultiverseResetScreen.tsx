// src/components/MultiverseResetScreen.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Controls full multiverse reset logic.

import '../styles/ResetScreen.css'; 

import React, { useEffect, useState } from 'react';








const MultiverseResetScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
// React state declaration
  const [countdown, setCountdown] = useState(10);
// React state declaration
  const [finished, setFinished] = useState(false);

// React effect hook
  useEffect(() => {
// Variable declaration
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          setTimeout(onComplete, 2000);
          return 1;
        }
        return prev - 1;
      });
    }, 750);

// JSX return block or main return
    return () => clearInterval(timer);
  }, []);

// JSX return block or main return
  return (
    <div style={{
      backgroundColor: '#0033AA',
      color: '#FFFFFF',
      fontFamily: 'monospace',
      height: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.5rem'
    }}>
      <div>
        <p><strong>LOW-LEVEL MULTIVERSE FORMAT ENGAGED</strong></p>
        <p>Formatting core reality modules…</p>
        <p>Stability threshold exceeded.</p>
        <p>Countdown: {countdown}</p>
        {!finished && <p>Press any key to panic…</p>}
        {finished && <p>Multiversal reset activated…</p>}
      </div>
    </div>
  );
};

export default MultiverseResetScreen;
