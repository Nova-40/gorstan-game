// src/components/AylaPanel.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// AylaPanel component for Gorstan game.
// Provides an interactive panel for players to ask Ayla for help and receive animated teletype responses.

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { animateTeletype } from '../utils/animateTeletype';

/**
 * AylaPanel
 * Displays a panel where players can ask Ayla for help and receive teletype responses.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.askAyla - Function that takes a player query and returns Ayla's answer (async).
 * @returns {JSX.Element}
 */
const AylaPanel = ({ askAyla }) => {
  // State for the current input query from the player
  const [query, setQuery] = useState('');
  // State for the list of Q&A responses in the panel
  const [responses, setResponses] = useState([]);
  // State to indicate if Ayla is currently animating a response
  const [isAnimating, setIsAnimating] = useState(false);
  // Ref for the scrollable response area, to auto-scroll on new messages
  const scrollRef = useRef(null);

  /**
   * handleAsk
   * Handles the player submitting a question to Ayla.
   * Adds the player's query to the response list, then asynchronously gets and animates Ayla's answer.
   */
  const handleAsk = async () => {
    const playerQuery = query.trim();
    if (!playerQuery) return;

    setQuery('');
    const responseObj = { id: Date.now(), player: playerQuery, ayla: '' };
    setResponses((prev) => [...prev, responseObj]);

    setIsAnimating(true);
    try {
      // Await Ayla's answer and animate it teletype-style
      const answer = await askAyla(playerQuery);
      const animated = await animateTeletype(answer || '…', 20);
      setResponses((prev) =>
        prev.map((r) =>
          r.id === responseObj.id ? { ...r, ayla: animated } : r
        )
      );
    } catch (err) {
      // If Ayla fails, show an error message
      setResponses((prev) =>
        prev.map((r) =>
          r.id === responseObj.id ? { ...r, ayla: '⚠️ Ayla malfunctioned.' } : r
        )
      );
    } finally {
      setIsAnimating(false);
    }
  };

  /**
   * handleKeyDown
   * Submits the question if the Enter key is pressed in the input field.
   * @param {Object} e - Keyboard event.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAsk();
  };

  /**
   * handleClear
   * Clears all Q&A responses from the panel.
   */
  const handleClear = () => {
    setResponses([]);
  };

  /**
   * useEffect to auto-scroll the response area to the bottom when new responses are added.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 shadow-md max-w-3xl mx-auto">
      <h3 className="text-lg font-semibold text-purple-300 mb-2">
        🤖 Ask Ayla for Help
      </h3>

      <div
        ref={scrollRef}
        className="space-y-2 max-h-60 overflow-y-auto mb-3 pr-2"
      >
        {responses.map((r) => (
          <div key={r.id} className="text-sm">
            <p className="text-blue-300">
              <strong>You:</strong> {r.player}
            </p>
            <p className="text-green-300">
              <strong>Ayla:</strong> {r.ayla}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded bg-black border border-gray-600 text-white font-mono"
          placeholder="Ask Ayla something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnimating}
        />
        <button
          onClick={handleAsk}
          disabled={isAnimating}
          className="bg-purple-600 px-3 py-2 rounded text-white hover:bg-purple-700 disabled:opacity-50"
          type="button"
        >
          Ask
        </button>
        <button
          onClick={handleClear}
          className="bg-slate-700 hover:bg-slate-800 px-2 py-2 rounded text-white"
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

AylaPanel.propTypes = {
  askAyla: PropTypes.func.isRequired,
};

// Export the AylaPanel component for use in the main application
export default AylaPanel;



