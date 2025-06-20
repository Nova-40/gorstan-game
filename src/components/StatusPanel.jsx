// src/components/StatusPanel.jsx

import React from 'react';
import PropTypes from 'prop-types';

const StatusPanel = ({ playerName, traits, inventory, score, flags }) => {
  const inventoryLimit = inventory.length > 5 && !inventory.includes('runbag')
    ? '⚠️ Pocket overflow risk!'
    : inventory.length > 12
    ? '💥 Bag burst!' : null;

  return (
    <div className="bg-white border shadow rounded-xl p-4 text-sm w-full max-w-md">
      <h2 className="text-lg font-bold mb-2">📊 Status</h2>

      <div className="mb-1"><strong>Name:</strong> {playerName}</div>
      <div className="mb-1"><strong>Score:</strong> {score}</div>

      <div className="mt-2">
        <strong>Traits:</strong>
        {traits.length > 0 ? (
          <ul className="list-disc list-inside ml-2">
            {traits.map((trait, i) => (
              <li key={i} title={`Trait effect: ${trait}`}>{trait}</li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 ml-2">None</div>
        )}
      </div>

      <div className="mt-2">
        <strong>Inventory:</strong>
        {inventory.length > 0 ? (
          <>
            <ul className="list-disc list-inside ml-2">
              {inventory.map((item, i) => (
                <li key={i} title={`Item: ${item}`}>{item}</li>
              ))}
            </ul>
            {inventoryLimit && (
              <div className="mt-1 text-red-600 font-medium">{inventoryLimit}</div>
            )}
          </>
        ) : (
          <div className="text-gray-500 ml-2">Empty</div>
        )}
      </div>

      {flags?.godmode && (
        <div className="mt-2 text-yellow-600 font-semibold">🛠 Godmode Active</div>
      )}
    </div>
  );
};

StatusPanel.propTypes = {
  playerName: PropTypes.string.isRequired,
  traits: PropTypes.array.isRequired,
  inventory: PropTypes.array.isRequired,
  score: PropTypes.number.isRequired,
  flags: PropTypes.object.isRequired,
};

export default StatusPanel;

