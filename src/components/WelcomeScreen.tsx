// Module: src/components/WelcomeScreen.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

type WelcomeScreenProps = {
  onBegin: () => void;
  onLoadGame: () => void;
};

/**
 * WelcomeScreen
 * Renders the welcome screen with links and start/load buttons.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onBegin - Callback to begin the simulation.
 * @param {Function} props.onLoadGame - Callback to load a saved game.
 * @returns {JSX.Element}
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin, onLoadGame }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-black text-white p-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">🌌 Welcome to Gorstan</h1>
      <img
        src="/images/gorstanicon.png"
        alt="The Odd Rabbit"
        className="w-24 h-24 mb-4 animate-pulse rounded-full shadow-lg"
      />
      <p className="text-md md:text-lg text-center max-w-2xl mb-6">
        A multiverse simulation of coffee, consequence, and quantum possibility. Tread carefully. The rabbit is watching.
      </p>

      <div className="flex gap-4 mb-8 flex-wrap justify-center">
        <a
          href="https://www.buymeacoffee.com/gorstan"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 text-black px-4 py-2 rounded-xl hover:bg-yellow-300"
        >
          ☕ Buy Geoff a Coffee
        </a>
        <a
          href="https://www.geoffwebsterbooks.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-500"
        >
          📚 Explore the Books
        </a>
        <a
          href="https://www.thegorstanchronicles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400"
        >
          🌐 Visit Gorstan Chronicles
        </a>
      </div>

      <button
        onClick={onBegin}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-lg shadow-md transition-all"
        type="button"
      >
        Enter Simulation
      </button>
      <button
        onClick={onLoadGame}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-lg shadow-md transition-all mt-4"
        type="button"
      >
        Load Saved Game
      </button>
    </div>
  );
};

export default WelcomeScreen;
