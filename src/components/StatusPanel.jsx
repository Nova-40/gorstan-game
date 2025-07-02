import React, { useState } from 'react';
import { getAllTraits, getAchievements } from '../engine/npcMemory';

const StatusPanel = () => {
  const [showDev, setShowDev] = useState(false);
  const traits = getAllTraits();
  const achievements = getAchievements();

  return (
    <div className="text-sm bg-black text-green-300 p-2 border-t border-green-700">
      <div className="flex justify-between items-center">
        <span>Status Panel</span>
        <button
          onClick={() => setShowDev(!showDev)}
          className="text-xs bg-green-700 hover:bg-green-600 px-2 py-1 ml-2"
        >
          {showDev ? 'Hide' : 'Diagnostics'}
        </button>
      </div>
      {showDev && (
        <div className="mt-2 p-2 bg-green-950 rounded border border-green-700">
          <h4 className="font-bold text-green-200">Player Traits</h4>
          <pre>{JSON.stringify(traits, null, 2)}</pre>
          <h4 className="font-bold mt-2 text-green-200">Achievements</h4>
          <ul className="list-disc ml-5">
            {achievements.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusPanel;