// File: src/components/TeletypeIntro.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// TeletypeIntro component for Gorstan game.
// Displays an animated typewriter-style introduction sequence with player name interpolation.
// Presents the player with a set of narrative choices at the end of the intro.

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * TeletypeIntro
 * Renders a typewriter-style animated intro sequence and presents narrative choices.
 *
 * @param {Object} props - Component props.
 * @param {string} props.playerName - The player's name to personalize the intro.
 * @param {Function} props.onComplete - Callback invoked with the chosen route object.
 * @returns {JSX.Element}
 */
const TeletypeIntro = ({ playerName, onComplete }) => {
  // The full intro story, with player name interpolated
  const fullStory = [
    `Good day ${playerName},`,
    "You're on your way home after a strange day. You reach for the coffee,",
    'check the lights are green and cross the road.',
    'Suddenly a BIG YELLOW TRUCK is thundering towards you!!!',
    'Everything stands still. There is a bird, hovering motionless.',
    'Do something…'
  ];

  // State for the currently displayed text (typewriter effect)
  const [displayedText, setDisplayedText] = useState('');
  // State for the current line being typed
  const [lineIndex, setLineIndex] = useState(0);
  // State for the current character index within the line
  const [charIndex, setCharIndex] = useState(0);
  // State to show/hide the choice buttons after the intro
  const [showChoices, setShowChoices] = useState(false);

  /**
   * useEffect to animate the typewriter effect for each line and character.
   * When all lines are finished, shows the choice buttons.
   */
  useEffect(() => {
    if (lineIndex < fullStory.length && !showChoices) {
      const currentLine = fullStory[lineIndex];
      if (charIndex < currentLine.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + currentLine[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        const nextTimeout = setTimeout(() => {
          setDisplayedText((prev) => prev + '\n');
          setLineIndex((prev) => prev + 1);
          setCharIndex(0);
        }, 600);
        return () => clearTimeout(nextTimeout);
      }
    } else if (lineIndex === fullStory.length && !showChoices) {
      // Done typing, show choices
      setShowChoices(true);
    }
  }, [charIndex, lineIndex, showChoices, fullStory]);

  /**
   * handleChoice
   * Handles the player's narrative choice and calls onComplete with the route object.
   *
   * @param {string} choice - The chosen action ('jump', 'wait', or 'sip').
   */
  const handleChoice = (choice) => {
    const routeMap = {
      jump: { route: 'jump', targetRoom: 'controlnexus', inventoryBonus: ['coffee'] },
      wait: { route: 'wait' },
      sip: { route: 'sip' },
    };
    onComplete(routeMap[choice]);
  };

  return (
    <div className="p-6 font-mono bg-black text-green-400 min-h-screen">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{displayedText}</pre>
      {showChoices && (
        <div className="mt-6 space-y-3">
          <button
            className="block w-full bg-green-700 text-white p-2 rounded hover:bg-green-600"
            onClick={() => handleChoice('jump')}
          >
            You leap without thinking — the world bends
          </button>
          <button
            className="block w-full bg-yellow-700 text-white p-2 rounded hover:bg-yellow-600"
            onClick={() => handleChoice('wait')}
          >
            You hesitate — the air thickens…
          </button>
          <button
            className="block w-full bg-blue-700 text-white p-2 rounded hover:bg-blue-600"
            onClick={() => handleChoice('sip')}
          >
            You sip the coffee — warmth floods your chest
          </button>
        </div>
      )}
    </div>
  );
};

TeletypeIntro.propTypes = {
  playerName: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};

// Export the TeletypeIntro component for use in the main application
export default TeletypeIntro;


