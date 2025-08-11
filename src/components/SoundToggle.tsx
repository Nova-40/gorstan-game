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
