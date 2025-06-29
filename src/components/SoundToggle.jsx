
import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SoundToggle = ({ soundEnabled, setSoundEnabled }) => {
  const [hovered, setHovered] = useState(false);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newState = !prev;
      import('../utils/soundUtils').then(({ fadeAmbient }) => {
        fadeAmbient(newState);
      });
      return newState;
    });
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={toggleSound}
        className="text-white hover:text-gray-300 transition-colors"
        title="Toggle Sound"
        aria-label="Toggle Sound"
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
      <div
        className={`absolute left-8 ml-2 bg-gray-800 text-white text-sm px-2 py-1 rounded transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {soundEnabled ? 'Sound On' : 'Sound Off'}
      </div>
    </div>
  );
};

export default SoundToggle;
