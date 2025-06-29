
import React from 'react';
import PropTypes from 'prop-types';

const StatusPanel = ({ playerName = 'Explorer', inventory = [], flags = {}, playerTraits = [] }) => {
  const importantFlags = Object.entries(flags)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);

  return (
    <div className="bg-gray-900 text-white p-3 border-b border-gray-700 text-sm font-mono">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <strong>🧑 Name:</strong> {playerName}
        </div>
        <div>
          <strong>🎒 Inventory:</strong> {inventory.length > 0 ? inventory.join(', ') : 'Empty'}
        </div>
        <div>
          <strong>🧬 Traits:</strong>{' '}
          {playerTraits.length > 0 ? (
            playerTraits.map((trait, idx) => (
              <span
                key={idx}
                className="inline-block bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-xs ml-1"
              >
                {trait}
              </span>
            ))
          ) : (
            'None'
          )}
        </div>
        <div>
          <strong>🚩 Flags:</strong>{' '}
          {importantFlags.length > 0 ? importantFlags.join(', ') : 'None'}
        </div>
      </div>

      {flags.trapTriggered && (
        <div className="mt-2 text-red-400 animate-pulse">
          ⚠️ Trap triggered! You may be in danger...
        </div>
      )}

      {flags.invisible && (
        <div className="mt-1 text-blue-300 italic">🌫️ You are currently invisible.</div>
      )}
    </div>
  );
};

StatusPanel.propTypes = {
  playerName: PropTypes.string,
  inventory: PropTypes.array,
  flags: PropTypes.object,
  playerTraits: PropTypes.array,
};

export default StatusPanel;
