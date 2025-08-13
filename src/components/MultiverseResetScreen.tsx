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
// Controls full multiverse reset logic.

// Using inline styles + Tailwind 

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
