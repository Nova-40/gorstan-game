
import React from 'react';
import { useGameState } from '../state/gameState';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerUpLeft, MousePointerClick, Coffee, UploadCloud, Armchair } from 'lucide-react';

const directionLabels: Record<string, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  up: 'Up',
  down: 'Down',
  return: 'Return',
  jump: 'Jump',
  sit: 'Sit',
  throwCoffee: 'Throw Coffee'
};

const iconMap: Record<string, React.ReactNode> = {
  north: <ArrowUp />,
  south: <ArrowDown />,
  east: <ArrowRight />,
  west: <ArrowLeft />,
  up: <ArrowUp />,
  down: <ArrowDown />,
  return: <CornerUpLeft />,
  jump: <UploadCloud />,
  sit: <Armchair />,
  throwCoffee: <Coffee />
};

const DirectionIconsPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const currentRoom = state.roomMap?.[state.currentRoomId];
  const exits = currentRoom?.exits ?? {};

  const handleDirectionClick = (direction: string) => {
    if (exits[direction]) {
      dispatch({ type: 'COMMAND_INPUT', payload: `go ${direction}` });
    }
  };

  return (
    <div className="direction-icons-panel">
      {Object.entries(directionLabels).map(([key, label]) => {
        const isActive = Boolean(exits[key]);
        const icon = iconMap[key] ?? <MousePointerClick />;
        return (
          <div
            key={key}
            className={`direction-icon ${isActive ? 'active' : 'inactive'}`}
            title={exits[key] ? `Go to ${exits[key]}` : `${label} (unavailable)`}
            onClick={() => handleDirectionClick(key)}
            style={{ cursor: isActive ? 'pointer' : 'default' }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
};

export default DirectionIconsPanel;
