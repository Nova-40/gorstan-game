// Module: src/components/TeletypeIntro.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import React, { useState, useEffect } from 'react';

type TeletypeIntroProps = {
  playerName: string;
  onComplete: (route: { route: string; targetRoom?: string; inventoryBonus?: string[] }) => void;
};

const TeletypeIntro: React.FC<TeletypeIntroProps> = ({ playerName, onComplete }) => {
  const fullStory = [
    `Welcome, ${playerName}.`,
    `You awaken, not quite sure if this is a dream, a program, or both.`,
    `A smell of coffee drifts in, strangely reassuring.`,
    `Somewhere nearby, a console flickers into life.`,
    `Reality isn't broken, exactly — but it isn't quite right either.`,
    `Beyond this moment lies a tangle of resets, simulations, and choices.`,
    `A ripple passes through your thoughts. Time is waiting.`,
    `What do you choose?`
  ];

  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  
  const skipToChoices = () => {
    // Show the complete story immediately
    const fullText = fullStory.join('\n');
    setDisplayedText(fullText);
    setShowChoices(true);
  };

  const currentLine = fullStory[lineIndex] || '';

  useEffect(() => {
    if (showChoices) return;
    const timeout = setTimeout(() => {
      if (charIndex < currentLine.length) {
        setCharIndex((prev) => prev + 1);
        setDisplayedText((prev) => prev + currentLine[charIndex]);
      } else if (lineIndex < fullStory.length - 1) {
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
        setDisplayedText((prev) => prev + '\n');
      } else if (lineIndex === fullStory.length - 1 && !showChoices) {
        setShowChoices(true);
      }
    }, 30);

    return () => clearTimeout(timeout);

  }, [charIndex, lineIndex, showChoices, fullStory, currentLine]);

  const handleChoice = (choice: 'jump' | 'wait' | 'sip') => {
    setSelectedChoice(choice);
    
    // Add a brief visual feedback delay before starting the transition
    setTimeout(() => {
      const routeMap = {
        jump: { route: 'jump', targetRoom: 'controlnexus', inventoryBonus: ['coffee'] },
        wait: { route: 'wait', targetRoom: 'introreset' },
        sip: { route: 'sip', targetRoom: 'superLatticeHub' }
      };
      onComplete(routeMap[choice]);
    }, 300);
  };

  return (
    <div className="p-6 font-mono bg-black text-green-400 min-h-screen relative">
      {/* Skip button - only visible while teletype is animating */}
      {!showChoices && (
        <button
          onClick={skipToChoices}
          className="absolute top-4 right-4 bg-green-600 hover:bg-green-500 text-black px-3 py-1 rounded text-sm font-bold transition-colors"
        >
          Skip to Choices
        </button>
      )}
      
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{displayedText}</pre>
      {showChoices && (
        <div className={`mt-6 space-y-3 transition-opacity duration-300 ${selectedChoice ? 'opacity-50' : 'opacity-100'}`}>
          <button
            className={`block w-full p-2 rounded transition-all duration-200 ${
              selectedChoice === 'jump' 
                ? 'bg-green-600 text-white transform scale-95' 
                : 'bg-green-700 text-white hover:bg-green-600'
            }`}
            onClick={() => handleChoice('jump')}
            type="button"
            disabled={!!selectedChoice}
          >
            You leap without thinking — the world bends
          </button>
          <button
            className={`block w-full p-2 rounded transition-all duration-200 ${
              selectedChoice === 'wait' 
                ? 'bg-yellow-600 text-white transform scale-95' 
                : 'bg-yellow-700 text-white hover:bg-yellow-600'
            }`}
            onClick={() => handleChoice('wait')}
            type="button"
            disabled={!!selectedChoice}
          >
            You hesitate — the air thickens…
          </button>
          <button
            className={`block w-full p-2 rounded transition-all duration-200 ${
              selectedChoice === 'sip' 
                ? 'bg-blue-600 text-white transform scale-95' 
                : 'bg-blue-700 text-white hover:bg-blue-600'
            }`}
            onClick={() => handleChoice('sip')}
            type="button"
            disabled={!!selectedChoice}
          >
            You sip the coffee — warmth floods your chest
          </button>
        </div>
      )}
    </div>
  );
};

export default TeletypeIntro;


