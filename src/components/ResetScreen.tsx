// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: ResetScreen.tsx
// Path: src/components/ResetScreen.tsx

import React, { useState, useEffect } from 'react';

type ResetScreenProps = {
  onComplete?: () => void;
};

/**
 * ResetScreen
 * Renders a simulated terminal boot/reset sequence with animated spinner.
 * Calls the onComplete callback after the sequence finishes.
 *
 * @param {Object} props - Component props.
 * @param {Function} [props.onComplete] - Callback invoked when the reset sequence is complete.
 * @returns {JSX.Element}
 */
const ResetScreen: React.FC<ResetScreenProps> = ({ onComplete = () => {} }) => {
  // Array of boot sequence lines to display
  const bootLines = [
    'SYSTEM INITIALIZATION...',
    'Loading quantum core modules...',
    'Establishing reality anchor...',
    'Calibrating temporal flux...',
    'GORSTAN SYSTEM ONLINE',
    'Welcome back, traveller.'
  ];
  
  // Spinner frames for the animated effect
  const spinnerFrames = ['|', '/', '-', '\\'];
  
  // State for the current line being displayed
  const [currentLine, setCurrentLine] = useState(0);
  // State for the spinner animation frame
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  // State to indicate if the boot sequence is finished
  const [finished, setFinished] = useState(false);

  /**
   * useEffect to incrementally display boot lines at a fixed interval.
   * When all lines are shown, marks the sequence as finished.
   */
  useEffect(() => {
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

    return () => clearInterval(lineTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * useEffect to animate the spinner and trigger the onComplete callback after a delay.
   * Only runs after the boot sequence is finished.
   */
  useEffect(() => {
    if (!finished) return;

    const spinnerTimer = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
    }, 120);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearInterval(spinnerTimer);
      clearTimeout(completeTimer);
    };
  }, [finished, onComplete, spinnerFrames.length]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl text-left whitespace-pre-wrap text-sm md:text-base">
        {/* Display boot lines up to the current line */}
        {bootLines.slice(0, currentLine).map((line, _index) => `> ${line}\n`).join('')}
        {/* Show spinner after boot sequence is finished */}
        {finished && `> Stand by. ${spinnerFrames[spinnerIndex]}`}
      </div>
    </div>
  );
};

export default ResetScreen;
