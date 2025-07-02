// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: AskAyla.jsx
// Path: src/components/AskAyla.jsx


// src/components/AskAyla.jsx
// Version: 4.0.0-preprod
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { generateAylaResponse, getNPCStatus } from '@/engine/npcEngine';

/**
 * AskAyla component — a lightweight AI-style assistant using npcEngine memory
 * Player can enter queries, and Ayla responds with hints, context, or lore
 */
export default function AskAyla({ playerState }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const askAyla = () => {
    if (!query.trim()) return;
    const reply = generateAylaResponse(query, playerState);
    setResponse(reply);
    setQuery('');
  };

  const recent = getNPCStatus('ayla')?.recentTopics || [];

  return (
    <div className="bg-gray-950 text-green-300 p-4 rounded-xl border border-green-700 max-w-xl mx-auto shadow-lg mt-4">
      <div className="text-lg font-bold mb-2">Ask Ayla</div>

      <input
        className="w-full p-2 bg-black text-green-200 border border-green-600 rounded mb-2"
        type="text"
        value={query}
        placeholder="Ask Ayla for help or insight..."
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && askAyla()}
      />

      <button
        className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600"
        onClick={askAyla}
      >
        Submit
      </button>

      {response && (
        <div className="mt-3 text-green-400 italic">{response}</div>
      )}

      {recent.length > 0 && (
        <div className="mt-4 text-xs text-green-500">
          <strong>Recent topics Ayla remembers:</strong> {recent.join(', ')}
        </div>
      )}
    </div>
  );
}

AskAyla.propTypes = {
  playerState: PropTypes.object.isRequired
};