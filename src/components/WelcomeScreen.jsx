import React from 'react';

/**
 * WelcomeScreen
 * Renders the initial welcome screen with logo, title, and resource links.
 * Provides a button to continue to the next stage of the game.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onContinue - Callback invoked when the player clicks "Begin Simulation".
 * @returns {JSX.Element}
 */
const WelcomeScreen = ({ onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-6 space-y-6">
      {/* Gorstan logo/icon */}
      <img
        src="/images/gorstan-icon.png"
        alt="Rabbit Logo"
        className="w-24 h-24 mb-2 animate-pulse drop-shadow-md"
      />

      {/* Game title and subtitle */}
      <div>
        <h1 className="text-4xl font-extrabold leading-snug">Welcome to Gorstan</h1>
        <p className="text-xl text-gray-300">The Game</p>
      </div>

      {/* Button to continue/start the game */}
      <button
        onClick={onContinue}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-300"
      >
        Begin Simulation
      </button>

      {/* External resource links */}
      <div className="mt-10 space-y-3 text-base">
        <a
          href="https://www.geoffwebsterbooks.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline block"
        >
          📘 Visit GeoffWebsterBooks.com
        </a>
        <a
          href="https://www.thegorstanchronicles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline block"
        >
          🌀 Explore The Gorstan Chronicles
        </a>
        <a
          href="https://www.buymeacoffee.com/gorstan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg shadow transition duration-300"
        >
          ☕ Buy Me a Coffee
        </a>
      </div>
    </div>
  );
};

// Export the WelcomeScreen component for use in the main application
export default WelcomeScreen;
