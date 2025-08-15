import React, { useEffect } from 'react';
import { RoomObjective } from '../rooms/RoomObjectives';

type RoomObjectivePanelProps = {
  objectives: RoomObjective[];
};

const RoomObjectivePanel: React.FC<RoomObjectivePanelProps> = ({ objectives }) => {
  useEffect(() => {
    objectives.forEach((objective) => {
      if (objective.isCompleted) {
        console.log(`Objective completed: ${objective.description}`);
      }
    });
  }, [objectives]);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-md">
      <h2 className="text-lg font-bold mb-2">Room Objectives</h2>
      <ul>
        {objectives.map((objective) => (
          <li key={objective.id} className={objective.isCompleted ? 'line-through text-gray-500' : ''}>
            {objective.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomObjectivePanel;
