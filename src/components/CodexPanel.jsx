// Gorstan Game v3.3.2 – Codex Logbook Panel
// MIT License © 2025 Geoff Webster

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CodexPanel = ({ playerState }) => {
  const { flags = {}, traits = [], inventory = [] } = playerState;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 w-80 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-800 text-white px-3 py-1 rounded-t-lg w-full hover:bg-indigo-700"
      >
        📘 Codex Logbook
      </button>
      {isOpen && (
        <div className="bg-slate-800 text-white p-3 rounded-b-lg max-h-[400px] overflow-y-auto text-sm shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Traits</h3>
          <ul className="mb-2 list-disc list-inside">
            {traits.length > 0 ? traits.map((trait, idx) => <li key={idx}>{trait}</li>) : <li>None yet</li>}
          </ul>
          <h3 className="text-lg font-semibold mb-2">Inventory</h3>
          <ul className="mb-2 list-disc list-inside">
            {inventory.length > 0 ? inventory.map((item, idx) => <li key={idx}>{item}</li>) : <li>Empty</li>}
          </ul>
          <h3 className="text-lg font-semibold mb-2">Flags</h3>
          <ul className="list-disc list-inside">
            {Object.keys(flags).length > 0 ? Object.entries(flags).map(([key, value], idx) => (
              <li key={idx}>{key}: {String(value)}</li>
            )) : <li>No flags set</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

CodexPanel.propTypes = {
  playerState: PropTypes.object.isRequired,
};

export default CodexPanel;
