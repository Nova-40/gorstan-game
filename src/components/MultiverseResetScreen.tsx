import '../styles/ResetScreen.css'; // Ensure global styles or override here

import React, { useEffect, useState } from 'react';




// MultiverseResetScreen.tsx
// (c) 2025 Geoffrey Alan Webster. MIT Licence


const MultiverseResetScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [countdown, setCountdown] = useState(10);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
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

    return () => clearInterval(timer);
  }, []);

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
