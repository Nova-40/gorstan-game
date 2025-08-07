// src/components/SoundToggle.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Sound toggle component

import React, { useState } from 'react';

interface SoundToggleProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, setSoundEnabled }) => {
  const [hovered, setHovered] = useState(false);

  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);

    try {
      const { playAmbientAudio } = await import('../utils/soundUtils');
      playAmbientAudio(newState);
    } catch (error) {
      console.warn('Sound utils not available:', error);
    }
  };

  return (
    <button
      onClick={toggleSound}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        px-3 py-2 rounded-lg border transition-all duration-200
        ${soundEnabled 
          ? 'bg-green-600 border-green-500 text-white' 
          : 'bg-gray-600 border-gray-500 text-gray-300'
        }
        ${hovered ? 'shadow-lg transform scale-105' : ''}
        hover:border-opacity-80
      `}
      title={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
    >
      {soundEnabled ? '🔊' : '🔇'}
      <span className="ml-2 text-sm">
        {soundEnabled ? 'Sound On' : 'Sound Off'}
      </span>
    </button>
  );
};

export default SoundToggle;
