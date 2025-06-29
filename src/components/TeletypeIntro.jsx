import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TeletypeIntro = ({ playerName = 'traveller', onComplete = () => {} }) => {
  const fullStory = [
    `Good day ${playerName},`,
    "You're on your way home after a strange day. You reach for the coffee,",
    'check the lights are green and cross the road.',
    'Suddenly a BIG YELLOW TRUCK is thundering towards you!!!',
    'Everything stands still. There is a bird, hovering motionless.',
    'Do something…'
  ];

  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Teletype effect
  useEffect(() => {
    if (isSkipping) {
      setDisplayedText(fullStory.join('\n'));
      setShowChoices(true);
      return;
    }

    if (lineIndex < fullStory.length) {
      const line = fullStory[lineIndex];

      if (charIndex < line.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + line[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 35);
        return () => clearTimeout(timer);
      } else {
        const delayAfterLine = 500;
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + '\n');
          setLineIndex((prev) => prev + 1);
          setCharIndex(0);
        }, delayAfterLine);
        return () => clearTimeout(timer);
      }
    } else {
      const finalDelay = 600;
      const timer = setTimeout(() => setShowChoices(true), finalDelay);
      return () => clearTimeout(timer);
    }
  }, [charIndex, lineIndex, isSkipping]);

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
    setShowOverlay(true);
  };

  const overlayMessages = {
    jump: 'You leap without thinking — the world bends...',
    sip: 'You raise the cup — the flavour... unreal.',
    wait: 'You freeze. The truck does not. SPLAT.'
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-mono p-6">
      {/* Teletype display */}
      <div className="text-base md:text-lg mb-6 whitespace-pre-wrap border border-green-700 rounded-lg p-4 bg-black w-full max-w-2xl leading-relaxed">
        {displayedText}
        <span className="animate-pulse">█</span>
      </div>

      {/* Skip button */}
      {!showChoices && (
        <button
          onClick={() => setIsSkipping(true)}
          className="mt-2 text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow"
        >
          ⏩ Skip Intro
        </button>
      )}

      {/* Choice buttons */}
      {showChoices && !selectedChoice && (
        <div className="flex flex-col gap-4 mt-6 items-center w-full max-w-lg animate-fadeInSlow">
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl w-full"
            onClick={() => handleChoice('jump')}
          >
            🚀 Jump (with coffee)
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl w-full"
            onClick={() => handleChoice('sip')}
          >
            ☕ Sip Coffee (you keep it)
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl w-full"
            onClick={() => handleChoice('wait')}
          >
            ⏳ Wait (you get splatted)
          </button>
        </div>
      )}

      {/* Overlay result + user-triggered continuation */}
      {showOverlay && selectedChoice && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white z-50 p-6">
          <div className="text-2xl text-center mb-6 animate-pulse">
            {overlayMessages[selectedChoice]}
          </div>
          <button
            onClick={() => {
              console.log('Continue clicked with choice:', selectedChoice);
              if (typeof onComplete === 'function') {
                onComplete(selectedChoice);
              } else {
                console.warn('onComplete is not defined!');
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
          >
            ✅ Continue
          </button>
        </div>
      )}
    </div>
  );
};

TeletypeIntro.propTypes = {
  playerName: PropTypes.string,
  onComplete: PropTypes.func
};

export default TeletypeIntro;

