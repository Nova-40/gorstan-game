
import React from 'react';
import { useGameState } from '../state/gameState';
import { Coffee, UploadCloud, Hand, Armchair, Eye, MessageCircle, ArrowLeft, Bug, Square, AlertOctagon } from 'lucide-react';

const quickActions = [
  { key: 'sit', label: 'Sit', icon: <Armchair /> },
  { key: 'look', label: 'Look Closer', icon: <Eye /> },
  { key: 'talk', label: 'Talk', icon: <MessageCircle /> },
  { key: 'return', label: 'Return', icon: <ArrowLeft /> },
  { key: 'coffee', label: 'Drink Coffee', icon: <Coffee /> },
  { key: 'pickup', label: 'Pick Up', icon: <Hand /> },
  { key: 'press', label: 'Press', icon: <Square /> },
  { key: 'jump', label: 'Jump', icon: <UploadCloud /> },
  { key: 'debug', label: 'Debug', icon: <Bug /> },
  { key: 'bluebutton', label: 'Press Blue Button', icon: <Square style={{ color: 'blue' }} /> }
];

const QuickActionsPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const currentRoom = state.roomMap?.[state.currentRoomId];
  const inventory = state.player?.inventory || [];

  const isActionActive = (key: string) => {
    switch (key) {
      case 'sit':
        // Check for chair_portal, regular sit exits, or chair interactables
        const roomDef = currentRoom as any;
        return Boolean(
          currentRoom?.exits?.sit || 
          currentRoom?.exits?.chair_portal ||
          (roomDef?.interactables?.chair)
        );
      case 'jump':
        return Boolean(currentRoom?.exits?.jump);
      case 'pickup':
        return Boolean(currentRoom?.items && currentRoom.items.length > 0);
      case 'coffee':
        return inventory.includes('coffee');
      case 'look':
        return true; // Look is always available
      case 'talk':
        return Boolean(currentRoom?.npcs && currentRoom.npcs.length > 0);
      case 'return':
        return Boolean(state.previousRoomId && state.player?.health > 0);
      case 'press':
        // Show press button when in reset room (for blue button) or other rooms with pressable objects
        return Boolean(state.currentRoomId === 'introreset');
      case 'debug':
        // Only show for player named "Geoff" when debug mode is enabled
        return Boolean(state.player?.name === 'Geoff' && state.settings?.debugMode);
      case 'bluebutton':
        // Only show the blue button action when in the reset room
        return Boolean(state.currentRoomId === 'introreset');
      default:
        return false;
    }
  };

  const handleAction = (key: string) => {
    if (!isActionActive(key)) return;
    
    // Dispatch the command as if typed in the command input
    switch (key) {
      case 'sit':
        dispatch({ type: 'COMMAND_INPUT', payload: 'sit' });
        break;
      case 'jump':
        dispatch({ type: 'COMMAND_INPUT', payload: 'jump' });
        break;
      case 'pickup':
        // Pick up the first available item
        if (currentRoom?.items && currentRoom.items.length > 0) {
          const firstItem = currentRoom.items[0];
          const itemName = typeof firstItem === 'string' ? firstItem : firstItem.name;
          dispatch({ type: 'COMMAND_INPUT', payload: `get ${itemName}` });
        }
        break;
      case 'coffee':
        dispatch({ type: 'COMMAND_INPUT', payload: 'drink coffee' });
        break;
      case 'look':
        dispatch({ type: 'COMMAND_INPUT', payload: 'look' });
        break;
      case 'talk':
        dispatch({ type: 'COMMAND_INPUT', payload: 'talk' });
        break;
      case 'return':
        dispatch({ type: 'COMMAND_INPUT', payload: 'return' });
        break;
      case 'press':
        // For the reset room, press the blue button
        if (state.currentRoomId === 'introreset') {
          dispatch({ type: 'COMMAND_INPUT', payload: 'press blue button' });
        } else {
          dispatch({ type: 'COMMAND_INPUT', payload: 'press button' });
        }
        break;
      case 'debug':
        dispatch({ type: 'COMMAND_INPUT', payload: 'debug' });
        break;
      case 'bluebutton':
        dispatch({ type: 'PRESS_BLUE_BUTTON' });
        break;
    }
  };

  return (
    <div className="quick-actions-panel">
      {quickActions
        .filter(({ key }) => {
          // Hide debug button completely unless it's active
          if (key === 'debug') {
            return isActionActive(key);
          }
          // Hide blue button unless in reset room
          if (key === 'bluebutton') {
            return isActionActive(key);
          }
          return true;
        })
        .map(({ key, label, icon }) => {
        const active = isActionActive(key);
        return (
          <div
            key={key}
            className={`quick-action ${active ? 'active' : 'inactive'}`}
            title={active ? label : `${label} (unavailable)`}
            onClick={() => handleAction(key)}
            style={{ cursor: active ? 'pointer' : 'default' }}
          >
            {icon}
          </div>
        );
      })}
    </div>
  );
};

export default QuickActionsPanel;
