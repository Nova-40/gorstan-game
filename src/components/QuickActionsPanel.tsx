import PickupSelectionModal from './PickupSelectionModal';

import React, { useState, useEffect } from 'react';

import TravelMenu from './TravelMenu';

import { Coffee, Hand, Eye, MessageCircle, ArrowLeft, Bug, Square, AlertOctagon, Backpack, Armchair } from 'lucide-react';

import { Room } from './RoomTypes';

import { useGameState } from '../state/gameState';



// QuickActionsPanel.tsx — components/QuickActionsPanel.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: QuickActionsPanel



const quickActions = [
  { key: 'backpack', label: 'Show Inventory', icon: <Backpack /> },
  { key: 'look', label: 'Look Closer', icon: <Eye /> },
  { key: 'talk', label: 'Talk', icon: <MessageCircle /> },
  { key: 'return', label: 'Return', icon: <ArrowLeft /> },
  { key: 'coffee', label: 'Drink Coffee', icon: <Coffee /> },
  { key: 'pickup', label: 'Pick Up', icon: <Hand /> },
  { key: 'sit', label: 'Sit in Chair', icon: <Armchair /> },
  { key: 'press', label: 'Press', icon: <Square /> },
  { key: 'debug', label: 'Debug', icon: <Bug /> },
  { key: 'bluebutton', label: 'Press Blue Button', icon: <AlertOctagon style={{ color: 'white' }} /> }
];

const QuickActionsPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const currentRoom = state.roomMap?.[state.currentRoomId];
  const inventory = state.player?.inventory || [];
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [forceTravelMenuClosed, setForceTravelMenuClosed] = useState(false);

  const closeTravelMenu = () => {
    // Only update state, do not dispatch debug commands or log to console
    setForceTravelMenuClosed(true);
    dispatch({ type: 'COMMAND_INPUT', payload: 'stand' });
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: {
        flags: {
          ...state.flags,
          showTravelMenu: false,
          travelMenuTitle: undefined,
          travelMenuSubtitle: undefined,
          travelDestinations: undefined,
        }
      }
    });
  };

  // Emergency escape mechanism for travel menu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.flags?.showTravelMenu) {
        console.log('[QuickActionsPanel] Emergency escape - Escape key pressed');
        closeTravelMenu();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.flags?.showTravelMenu]);


  // Only reset forceTravelMenuClosed when entering 'crossing' and travel menu is actually open
  useEffect(() => {
    if (state.currentRoomId === 'crossing' && state.flags?.showTravelMenu) {
      setForceTravelMenuClosed(false);
    }
  }, [state.currentRoomId, state.flags?.showTravelMenu]);

  // Reset force close when player sits in chair (to allow new travel menu to appear)
  useEffect(() => {
    if (state.flags?.sittingInCrossingChair) {
      console.log('[QuickActionsPanel] Player sat in chair, resetting force close flag');
      setForceTravelMenuClosed(false);
    }
  }, [state.flags?.sittingInCrossingChair]);

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
      case 'sit':
        // Show sit button only in crossing room when not already sitting
        return Boolean(state.currentRoomId === 'crossing' && !state.flags?.sittingInCrossingChair);
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
      case 'sit':
        dispatch({ type: 'COMMAND_INPUT', payload: 'sit' });
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

  const handleTravelMenuTeleport = (destinationId: string) => {
    // Clear the travel menu flag and teleport
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: {
        flags: {
          ...state.flags,
          showTravelMenu: false,
          travelMenuTitle: undefined,
          travelMenuSubtitle: undefined,
          travelDestinations: undefined,
        }
      }
    });
    dispatch({ type: 'COMMAND_INPUT', payload: `teleport to ${destinationId}` });
  };

  // Deduplicate destinations for TravelMenu
  const travelDestinationsRaw = state.flags?.travelDestinations || state.player?.visitedRooms || [];
  const travelDestinations = Array.isArray(travelDestinationsRaw)
    ? travelDestinationsRaw.filter((d, i, arr) =>
        typeof d === 'object' && d !== null && 'id' in d
          ? arr.findIndex(x => typeof x === 'object' && x !== null && 'id' in x && x.id === d.id) === i
          : arr.indexOf(d) === i
      )
    : travelDestinationsRaw;

  // Deduplicate availableItems for PickupSelectionModal
  const availableItemsRaw = getAvailableItems();
  const availableItems = Array.isArray(availableItemsRaw)
    ? availableItemsRaw.filter((item, i, arr) => arr.indexOf(item) === i)
    : availableItemsRaw;

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

      {/* Travel Menu */}
      {state.flags?.showTravelMenu && !forceTravelMenuClosed && (
        <TravelMenu
          title={state.flags.travelMenuTitle || "Travel Menu"}
          subtitle={state.flags.travelMenuSubtitle || "Select your destination"}
          destinations={travelDestinations}
          onTeleport={handleTravelMenuTeleport}
          onClose={closeTravelMenu}
        />
      )}

      <PickupSelectionModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        availableItems={availableItems}
        onPickupSelected={handlePickupSelected}
        roomTitle={currentRoom?.title || 'Current Room'}
      />
    </div>
  );
};

export default QuickActionsPanel;
