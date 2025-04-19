/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Elegant and fully centered intro screen for the Gorstan game.
 */

import React from 'react';

const IntroScreen = ({ onContinue }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="text-center max-w-xl fade-in">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-4 tracking-wide">
          The Gorstan Chronicles
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          A multiverse adventure of quantum secrets, fractured AI, and the shadow of choice.
        </p>
        <p className="text-sm text-gray-500 mb-10 italic">
          Created by <span className="text-white font-semibold">Geoff Webster</span> &middot; © 2025
        </p>

        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Begin
        </button>

        <p className="text-xs text-gray-500 mt-10">
          Like the journey?{' '}
          <a
            href="https://www.buymeacoffee.com/gorstan"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-yellow-400 hover:text-yellow-300"
          >
            Buy me a coffee
          </a>{' '}
          ☕
        </p>
      </div>
    </div>
  );
};

export default IntroScreen;
