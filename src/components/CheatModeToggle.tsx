// src/components/CheatModeToggle.jsx
// Gorstan (c) Geoff Webster. MIT Licence
// Version: 1.0.0

/**
 * CheatModeToggle
 * Displays a cheat mode toggle button (only if player is 'Geoff')
 */
export default function CheatModeToggle({ dispatch }) {
      dispatch({ type: 'SET', payload: { cheatMode: true } });
  };

  return (
    <div className="group relative flex items-center justify-center mt-2">
      <button
        className="p-2 text-green-400 hover:text-green-100 transition-transform hover:scale-110"
        onClick={activateCheat}
        aria-label="Activate Cheat Mode"
      >
        <FlaskConical className="w-6 h-6" />
      </button>
      <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block text-[10px] text-white bg-black bg-opacity-80 px-1.5 py-0.5 rounded z-50">
        Cheat Mode
      </span>
    </div>
  );
}

CheatModeToggle.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
