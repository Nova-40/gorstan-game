// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: CreditsScreen.jsx
// Path: src/components/CreditsScreen.jsx

import React, { useEffect, useState } from 'react';

const creditsText = [
  "Gorstan: A Multiversal Text Adventure",
  "",
  "Created by Geoffrey Alan Webster",
  "",
  "Code, Coffee, Chaos — also Geoff",
  "Inspired by Stanton Harcourt, strange dreams, and Dominic the Fish",
  "",
  "Special thanks to Mabel and Biscuit",
  "",
  "---",
  "☕ Buy Geoff a Coffee",
  "📚 Buy the Books",
  "🔁 Play Again?"
];

const CreditsScreen = ({ onRestart }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < creditsText.length) {
        setLines((prev) => [...prev, creditsText[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-black text-green-400 min-h-screen flex flex-col justify-center items-center font-mono">
      <div className="max-w-lg w-full">
        {lines.map((line, i) => (
          <div key={i} className="mb-2 text-center">
            {line === "☕ Buy Geoff a Coffee" ? (
              <a href="https://buymeacoffee.com/gorstan" target="_blank" rel="noopener noreferrer" className="underline text-green-300">
                {line}
              </a>
            ) : line === "📚 Buy the Books" ? (
              <a href="https://www.geoffwebsterbooks.com" target="_blank" rel="noopener noreferrer" className="underline text-green-300">
                {line}
              </a>
            ) : line === "🔁 Play Again?" ? (
              <button onClick={onRestart} className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-600 rounded">
                {line}
              </button>
            ) : (
              line
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditsScreen;