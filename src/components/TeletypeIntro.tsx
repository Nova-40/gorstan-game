import React, { useState, useEffect } from 'react';



// TeletypeIntro.tsx — components/TeletypeIntro.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: TeletypeIntro

// Module: src/components/TeletypeIntro.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


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
  const [waitTimer, setWaitTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds

  const skipToChoices = () => {
    // Show the complete story immediately
    const fullText = fullStory.join('\n');
    setDisplayedText(fullText);
    setShowChoices(true);
    startWaitTimer();
  };

  const startWaitTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-trigger dramatic wait sequence
          handleChoice('dramatic_wait');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setWaitTimer(timer);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        startWaitTimer();
      }
    }, 30);

    return () => clearTimeout(timeout);

  }, [charIndex, lineIndex, showChoices, fullStory, currentLine]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (waitTimer) {
        clearInterval(waitTimer);
      }
    };
  }, [waitTimer]);

  const handleChoice = (choice: 'jump' | 'wait' | 'sip' | 'dramatic_wait') => {
    if (waitTimer) {
      clearInterval(waitTimer);
      setWaitTimer(null);
    }

    setSelectedChoice(choice);

    // Add a brief visual feedback delay before starting the transition
    setTimeout(() => {
      const routeMap = {
        jump: { route: 'jump', targetRoom: 'controlnexus', inventoryBonus: ['coffee'] },
        wait: { route: 'dramatic_wait', targetRoom: 'controlroom', inventoryBonus: ['quantum_coffee', 'dales_apartment_key'] },
        sip: { route: 'sip', targetRoom: 'crossing' },
        dramatic_wait: { route: 'dramatic_wait', targetRoom: 'crossing', inventoryBonus: ['quantum_coffee', 'dales_apartment_key'] }
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

      {/* Timer display - only visible when choices are shown */}
      {showChoices && !selectedChoice && (
        <div className="absolute top-4 right-4 bg-red-900 text-red-300 px-4 py-2 rounded border border-red-500">
          <div className="text-xs uppercase tracking-wide">Wait Timer</div>
          <div className="text-lg font-bold">{formatTime(timeRemaining)}</div>
          <div className="text-xs opacity-75">Auto-wait at 0:00</div>
        </div>
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
              selectedChoice === 'wait' || selectedChoice === 'dramatic_wait'
                ? 'bg-yellow-600 text-white transform scale-95'
                : timeRemaining <= 30
                  ? 'bg-red-700 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-yellow-700 text-white hover:bg-yellow-600'
            }`}
            onClick={() => handleChoice('wait')}
            type="button"
            disabled={!!selectedChoice}
          >
            {timeRemaining <= 30
              ? '⚠️ You hesitate — time is running out...'
              : 'You hesitate — the air thickens…'
            }
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

          {/* Timer warning messages */}
          {timeRemaining <= 60 && timeRemaining > 30 && !selectedChoice && (
            <div className="text-center text-yellow-400 text-sm animate-pulse">
              ⏰ One minute remaining... something is approaching...
            </div>
          )}
          {timeRemaining <= 30 && timeRemaining > 10 && !selectedChoice && (
            <div className="text-center text-red-400 text-sm animate-pulse">
              🚛 You hear the rumble of an approaching lorry...
            </div>
          )}
          {timeRemaining <= 10 && !selectedChoice && (
            <div className="text-center text-red-300 text-sm animate-bounce">
              💥 IMPACT IMMINENT! The lorry is here!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeletypeIntro;


