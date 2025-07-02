// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: ResetScreen.jsx
// Path: src/components/ResetScreen.jsx


/**
 * ResetScreen.jsx
 * Simulates a terminal-style reset boot sequence with braille spinner.
 * Transitions automatically to the welcome screen after a short delay.
 *
 * Version: 3.9.9
 * Author: Geoff Webster
 * License: MIT
 */

import React, { useEffect, useState } from 'react';

/**
 * ResetScreen
 * Renders a simulated terminal boot/reset sequence with animated spinner.
 * Calls the onComplete callback after the sequence finishes.
 *
 * @param {Object} props - Component props.
 * @param {Function} [props.onComplete] - Callback invoked when the reset sequence is complete.
 * @returns {JSX.Element}
 */
const ResetScreen = ({ onComplete = () => {} }) => {
  // Array of boot sequence lines to display
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

  // Spinner frames for the animated effect
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
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
        if (prev < bootLines.length) return prev + 1;
        setFinished(true);
        clearInterval(lineTimer);
        return prev;
      });
    }, 500);

    return () => clearInterval(lineTimer);
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
      clearInterval(spinnerTimer);
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
        {bootLines.slice(0, currentLine).map((line, index) => `> ${line}\n`).join('')}
        {/* Show spinner after boot sequence is finished */}
        {finished && `> Stand by. ${spinnerFrames[spinnerIndex]}`}
      </div>
    </div>
  );
};

// Export the ResetScreen component for use in the main application
export default ResetScreen;