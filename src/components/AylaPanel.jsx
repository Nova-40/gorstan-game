// src/components/AylaPanel.jsx
// Gorstan v3.2.7 – Enhanced Ayla Help Panel

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { animateTeletype } from '../utils/animateTeletype';

/**
 * AylaPanel
 * Displays a panel where players can ask Ayla for help and receive teletype responses.
 */
const AylaPanel = ({ askAyla }) => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef(null);

  const handleAsk = async () => {
    const playerQuery = query.trim();
    if (!playerQuery) return;

    setQuery('');
    const responseObj = { id: Date.now(), player: playerQuery, ayla: '' };
    setResponses((prev) => [...prev, responseObj]);

    setIsAnimating(true);
    try {
      const answer = await askAyla(playerQuery);
      const animated = await animateTeletype(answer || "…", 20);
      setResponses((prev) =>
        prev.map((r) =>
          r.id === responseObj.id ? { ...r, ayla: animated } : r
        )
      );
    } catch (err) {
      setResponses((prev) =>
        prev.map((r) =>
          r.id === responseObj.id ? { ...r, ayla: '⚠️ Ayla malfunctioned.' } : r
        )
      );
    } finally {
      setIsAnimating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAsk();
  };

  const handleClear = () => {
    setResponses([]);
  };

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
            <p className="text-blue-300"><strong>You:</strong> {r.player}</p>
            <p className="text-green-300"><strong>Ayla:</strong> {r.ayla}</p>
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
        >
          Ask
        </button>
        <button
          onClick={handleClear}
          className="bg-slate-700 hover:bg-slate-800 px-2 py-2 rounded text-white"
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

export default AylaPanel;



