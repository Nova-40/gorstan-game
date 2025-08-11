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

import React, { useState, useEffect } from 'react';










type ResetScreenProps = {
  onComplete?: () => void;
};


const ResetScreen: React.FC<ResetScreenProps> = ({ onComplete = () => {} }) => {
  
// Variable declaration
  const bootLines = [
    'SYSTEM INITIALIZATION...',
    'Loading quantum core modules...',
    'Establishing reality anchor...',
    'Calibrating temporal flux...',
    'GORSTAN SYSTEM ONLINE',
    'Welcome back, traveller.'
  ];

  
// Variable declaration
  const spinnerFrames = ['|', '/', '-', '\\'];

  
// React state declaration
  const [currentLine, setCurrentLine] = useState(0);
  
// React state declaration
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  
// React state declaration
  const [finished, setFinished] = useState(false);

  
// React effect hook
  useEffect(() => {
// Variable declaration
    const lineTimer = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev >= bootLines.length) {
          setFinished(true);
          clearInterval(lineTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

// JSX return block or main return
    return () => clearInterval(lineTimer);
    
  }, []);

  
// React effect hook
  useEffect(() => {
    if (!finished) return;

// Variable declaration
    const spinnerTimer = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 120);

// Variable declaration
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

// JSX return block or main return
    return () => {
      clearInterval(spinnerTimer);
      clearTimeout(completeTimer);
    };
  }, [finished, onComplete, spinnerFrames.length]);

// JSX return block or main return
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl text-left whitespace-pre-wrap text-sm md:text-base">
        {}
        {bootLines.slice(0, currentLine).map((line, _index) => `> ${line}\n`).join('')}
        {}
        {finished && `> Stand by. ${spinnerFrames[spinnerIndex]}`}
      </div>
    </div>
  );
};

export default ResetScreen;
