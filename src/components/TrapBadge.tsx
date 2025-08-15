import React from 'react';
import { Trap } from '../engine/trapSystem';

type TrapBadgeProps = {
  traps: Trap[];
};

const TrapBadge: React.FC<TrapBadgeProps> = ({ traps }) => {
  if (traps.length === 0) return null;

  return (
    <div className="p-2 bg-red-500 text-white rounded-md">
      <h3 className="text-sm font-bold">Active Traps</h3>
      <ul>
        {traps.map((trap) => (
          <li key={trap.id}>{trap.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default TrapBadge;
