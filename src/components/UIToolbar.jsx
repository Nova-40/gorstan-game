import React, { useState } from 'react';
import SoundToggle from './SoundToggle';
import HelpModal from './HelpModal';
import { HelpCircle, Monitor, TerminalSquare } from 'lucide-react';

/**
 * UIToolbar
 * Renders a floating toolbar with sound toggle, help, fullscreen, and cheat/debug controls.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.soundEnabled - Whether sound is currently enabled.
 * @param {Function} props.setSoundEnabled - Setter function to toggle sound state.
 * @returns {JSX.Element}
 */
const UIToolbar = ({ soundEnabled, setSoundEnabled }) => {
  // State to control the display of the help modal
  const [showHelp, setShowHelp] = useState(false);

  /**
   * toggleFullscreen
   * Toggles the browser's fullscreen mode for the game.
   */
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
        {/* Sound toggle button */}
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

      {/* Help modal overlay */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
};

// Export the UIToolbar component for use in the main application
export default UIToolbar;

