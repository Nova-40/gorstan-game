import React, { useEffect } from 'react';



// SplashScreen.tsx — components/SplashScreen.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: SplashScreen

// Module: src/components/SplashScreen.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


type SplashScreenProps = {
  onComplete: () => void;
};

/**
 * SplashScreen
 * Renders a fullscreen splash screen with neon terminal styling
 * that displays for 2 seconds before auto-transitioning.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onComplete - Callback when splash completes.
 * @returns {JSX.Element}
 */
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Neon terminal styling */}
      <div className="text-center font-mono">
        {/* Main title */}
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

        {/* Subtitle */}
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

        {/* Optional scanning line effect */}
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

      {/* Global CSS for the scanning animation */}
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
