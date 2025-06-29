import React, { useState } from 'react';
import SoundToggle from './SoundToggle';
import HelpModal from './HelpModal';
import { HelpCircle, Monitor, TerminalSquare } from 'lucide-react';

const UIToolbar = ({ soundEnabled, setSoundEnabled }) => {
  const [showHelp, setShowHelp] = useState(false);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <>
      {/* Toolbar container */}
      <div className="fixed top-4 right-4 z-50 bg-black/70 backdrop-blur-md p-2 rounded-xl flex gap-3 items-center shadow-lg">
        {/* Sound toggle */}
        <SoundToggle
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Help button */}
        <button
          title="Help"
          className="text-white hover:text-gray-300 transition"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle size={22} />
        </button>

        {/* Fullscreen button */}
        <button
          title="Toggle Fullscreen"
          className="text-white hover:text-gray-300 transition"
          onClick={toggleFullscreen}
        >
          <Monitor size={22} />
        </button>

        {/* Cheat button (non-functional placeholder for now) */}
        <button
          title="Cheat Mode (Ctrl+Click only)"
          className="text-white hover:text-pink-400 transition"
        >
          <TerminalSquare size={22} />
        </button>
      </div>

      {/* Help modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
};

export default UIToolbar;

