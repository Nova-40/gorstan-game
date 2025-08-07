// src/components/SplashScreen.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect } from 'react';













type SplashScreenProps = {
  onComplete: () => void;
};


const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
// React effect hook
  useEffect(() => {
// Variable declaration
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); 

// JSX return block or main return
    return () => clearTimeout(timer);
  }, [onComplete]);

// JSX return block or main return
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {}
      <div className="text-center font-mono">
        {}
        <h1
          className="text-6xl md:text-8xl font-bold mb-4 animate-pulse"
          style={{
            color: '#00ff00',
            textShadow: `
              0 0 5px #00ff00,
              0 0 10px #00ff00,
              0 0 15px #00ff00,
              0 0 20px #00ff00,
              0 0 35px #00ff00,
              0 0 40px #00ff00
            `
          }}
        >
          GORSTAN
        </h1>

        {}
        <p
          className="text-2xl md:text-3xl font-light tracking-wide"
          style={{
            color: '#00ffff',
            textShadow: `
              0 0 5px #00ffff,
              0 0 10px #00ffff,
              0 0 15px #00ffff
            `
          }}
        >
          The Game vBeta 1.0
        </p>

        {}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(
              transparent 40%,
              rgba(0, 255, 0, 0.1) 50%,
              transparent 60%
            )`,
            animation: 'scanLine 3s linear infinite'
          }}
        />
      </div>

      {}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scanLine {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
          }
        `
      }} />
    </div>
  );
};

export default SplashScreen;
