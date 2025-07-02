import React from 'react';
import { getAllTraits, getAchievements } from '../engine/npcMemory';

const CodexPanel = () => {
  const traits = getAllTraits();
  const achievements = getAchievements();

  return (
    <div className="p-4 bg-black text-green-400 border border-green-600 rounded-xl">
      <h2 className="text-xl font-bold mb-2">Codex: Multiversal Journal</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Player Traits</h3>
        <pre className="text-sm">{JSON.stringify(traits, null, 2)}</pre>
      </div>

      <div>
        <h3 className="font-semibold">Achievements</h3>
        <ul className="list-disc ml-5">
          {achievements.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default CodexPanel;