import React, { useEffect, useState } from 'react';
import RoomObjectivePanel from './components/RoomObjectivePanel';
import { RoomObjectivesManager } from './rooms/RoomObjectives';
import { TeleportSystem } from './engine/teleportSystem';
import { GameStateManager } from './engine/GameStateManager';
import TrapBadge from './components/TrapBadge';
import { armTrap, getRoomTraps } from './engine/trapSystem';
import { go, goBack, getCurrent } from './engine/roomRouter';
import { useAylaHint } from './services/aylaHintSystem';

const objectivesManager = new RoomObjectivesManager();
objectivesManager.addObjective('control-room', {
  id: '1',
  description: 'Activate the main console.',
  isCompleted: false,
});
objectivesManager.addObjective('control-room', {
  id: '2',
  description: 'Find the access key.',
  isCompleted: false,
});

const teleportSystem = TeleportSystem.getInstance();
const gameStateManager = GameStateManager.getInstance();

// Arm some traps for testing
armTrap('trap-1', 'room:maze', 'A hidden spike trap!', true);
armTrap('trap-2', 'room:maze', 'A tripwire alarm.', false);

const App: React.FC = () => {
  const [playerStuck, setPlayerStuck] = useState(false);
  const objectives = objectivesManager.getObjectives('control-room');
  const traps = getRoomTraps('room:maze');

  const hint = useAylaHint(playerStuck, () => 'Try exploring the maze for hidden clues.');

  const handleTeleport = (roomId: string) => {
    teleportSystem.teleportTo(roomId);
  };

  const handleRoomChange = (roomId: string) => {
    gameStateManager.updateCurrentRoom(roomId);
    console.log(`Player moved to ${roomId}`);
  };

  const handleGameEvent = (event: string) => {
    if (event === 'teleport:maze') {
      teleportSystem.teleportTo('room:maze');
    }
  };

  const handleNavigation = (roomId: string) => {
    go(roomId);
    console.log(`Current room: ${getCurrent()}`);
  };

  const handleGoBack = () => {
    goBack();
    console.log(`Current room after going back: ${getCurrent()}`);
  };

  useEffect(() => {
    // Simulate an in-game event triggering teleportation
    setTimeout(() => handleGameEvent('teleport:maze'), 3000);
  }, []);

  useEffect(() => {
    // Simulate player getting stuck after 10 seconds
    const timer = setTimeout(() => setPlayerStuck(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <h1>Welcome to Gorstan Game</h1>
      {hint && <div className="p-2 bg-yellow-300 text-black rounded-md">{hint}</div>}
      <RoomObjectivePanel objectives={objectives} />
      <div>
        <button
          onClick={() => handleTeleport('room:hub')}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Teleport to Hub
        </button>
      </div>
      <div>
        <button
          onClick={() => handleRoomChange('room:maze')}
          className="bg-green-500 text-white p-2 rounded"
        >
          Move to Maze
        </button>
      </div>
      <div>
        <TrapBadge traps={traps} />
      </div>
      <div>
        <button
          onClick={() => handleNavigation('room:maze')}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Go to Maze
        </button>
        <button
          onClick={handleGoBack}
          className="bg-gray-500 text-white p-2 rounded ml-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default App;