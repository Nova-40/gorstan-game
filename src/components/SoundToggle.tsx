// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: SoundToggle.tsx
// Path: src/components/SoundToggle.tsx
//
// SoundToggle component for Gorstan game.
// Provides a button to toggle sound on/off, with a tooltip and animated icon.
// Fades ambient sound using a utility function when toggled.

type SoundToggleProps = {
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * SoundToggle
 * Renders a button to toggle sound on or off, with a tooltip that appears on hover.
 * When toggled, calls fadeAmbient from soundUtils to smoothly adjust ambient sound.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.soundEnabled - Whether sound is currently enabled.
 * @param {Function} props.setSoundEnabled - Setter function to toggle sound state.
 * @returns {JSX.Element}
 */
const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, setSoundEnabled }) => {
  // State to track whether the button is hovered, for tooltip display
  const [hovered, setHovered] = useState(false);

  /**
   * toggleSound
   * Toggles the sound state and fades ambient sound accordingly.
   * Uses dynamic import to avoid loading soundUtils until needed.
   */
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
        type="button"
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
      {/* Tooltip appears when hovered */}
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

// Export the SoundToggle component for use in the main application
export default SoundToggle;
