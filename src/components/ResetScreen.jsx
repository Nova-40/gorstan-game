/**
 * ResetScreen.jsx
 * Simulates a terminal-style reset boot sequence with braille spinner.
 * Transitions automatically to the welcome screen after a short delay.
 *
 * Version: 3.8.9
 * Author: Geoff Webster
 * License: MIT
 */

import React, { useEffect, useState } from 'react';

const ResetScreen = ({ onComplete = () => {} }) => {
  const bootLines = [
    'Boot sequence initiated...',
    'Shutting down game engine...',
    'Unloading inventory cache...',
    'Creating Higgs Bosons...',
    'Higgs Boson decay in progress...',
    'b-quarks, W-bosons, Z-bosons and τ-leptons now detected.',
    'Mounting /rooms...',
    'Initialising AI core: Ayla...',
    'Reset vector stabilised.',
    'Reinitialising temporal narrative kernel...',
    'Stand by.'
  ];

  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const [currentLine, setCurrentLine] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < bootLines.length) return prev + 1;
        setFinished(true);
        clearInterval(lineTimer);
        return prev;
      });
    }, 500);

    return () => clearInterval(lineTimer);
  }, []);

  useEffect(() => {
    if (!finished) return;
    const spinnerTimer = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 120);

    const completeTimer = setTimeout(() => {
      clearInterval(spinnerTimer);
      onComplete();
    }, 4000);

    return () => {
      clearInterval(spinnerTimer);
      clearTimeout(completeTimer);
    };
  }, [finished]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl text-left whitespace-pre-wrap text-sm md:text-base">
        {bootLines.slice(0, currentLine).map((line, index) => `> ${line}\n`).join('')}
        {finished && `> Stand by. ${spinnerFrames[spinnerIndex]}`}
      </div>
    </div>
  );
};

export default ResetScreen;
