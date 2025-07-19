
import React, { useState } from 'react';
import { useGameState } from '../state/gameState';
import { Coffee, Hand, Eye, MessageCircle, ArrowLeft, Bug, Square, AlertOctagon, Backpack } from 'lucide-react';
import PickupSelectionModal from './PickupSelectionModal';

const quickActions = [
  { key: 'backpack', label: 'Show Inventory', icon: <Backpack /> },
  { key: 'look', label: 'Look Closer', icon: <Eye /> },
  { key: 'talk', label: 'Talk', icon: <MessageCircle /> },
  { key: 'return', label: 'Return', icon: <ArrowLeft /> },
  { key: 'coffee', label: 'Drink Coffee', icon: <Coffee /> },
  { key: 'pickup', label: 'Pick Up', icon: <Hand /> },
  { key: 'press', label: 'Press', icon: <Square /> },
  { key: 'debug', label: 'Debug', icon: <Bug /> },
  { key: 'bluebutton', label: 'Press Blue Button', icon: <AlertOctagon style={{ color: 'white' }} /> }
];

const QuickActionsPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const currentRoom = state.roomMap?.[state.currentRoomId];
  const inventory = state.player?.inventory || [];
  const [showPickupModal, setShowPickupModal] = useState(false);

  const isActionActive = (key: string) => {
    switch (key) {
      case 'backpack':
        return true; // Inventory is always available to view
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
        // Hide press button in reset room since we have the special blue button
        return Boolean(state.currentRoomId !== 'introreset');
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
      case 'backpack':
        dispatch({ type: 'COMMAND_INPUT', payload: 'inventory' });
        break;
      case 'pickup':
        // Show pickup selection modal instead of auto-picking first item
        setShowPickupModal(true);
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

  const getAvailableItems = (): string[] => {
    if (!currentRoom?.items) return [];
    return currentRoom.items.map(item => 
      typeof item === 'string' ? item : item.id || item.name || String(item)
    );
  };

  const handlePickupSelected = (selectedItems: string[]) => {
    // Pick up all selected items
    selectedItems.forEach(itemId => {
      dispatch({ type: 'COMMAND_INPUT', payload: `get ${itemId}` });
    });
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
        const isBlueButton = key === 'bluebutton';
        
        return (
          <div
            key={key}
            className={`quick-action ${active ? 'active' : 'inactive'} ${isBlueButton ? 'blue-button' : ''}`}
            title={active ? label : `${label} (unavailable)`}
            onClick={() => handleAction(key)}
            style={{ 
              cursor: active ? 'pointer' : 'default',
              ...(isBlueButton && active ? {
                backgroundColor: '#3b82f6',
                color: 'white',
                border: '2px solid #1d4ed8',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                transform: 'scale(1.1)',
              } : {})
            }}
          >
            {icon}
          </div>
        );
      })}
      
      <PickupSelectionModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        availableItems={getAvailableItems()}
        onPickupSelected={handlePickupSelected}
        roomTitle={currentRoom?.title || 'Current Room'}
      />
    </div>
  );
};

export default QuickActionsPanel;
