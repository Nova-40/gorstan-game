// Module: src/state/gameState.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { Room } from '../types/Room';
import { GameAction, GameMessage, Player } from '../types/GameTypes';
import { MiniquestState } from '../types/MiniquestTypes';
import { processCommand } from '../engine/commandProcessor';
import { unlockAchievement } from '../logic/achievementEngine';

/**
 * Helper function to add room description messages to game history
 */
function addRoomDescriptionToHistory(history: GameMessage[], room: Room | null, roomId: string): GameMessage[] {
  if (!room || !room.description) {
    return history;
  }
  
  const newHistory = [...history];
  
  // Add room title if it exists and is different from room ID
  if (room.title && room.title !== roomId) {
    const roomTitleMessage: GameMessage = {
      id: `room-title-${Date.now()}`,
      text: `📍 ${room.title}`,
      type: 'system',
      timestamp: Date.now(),
    };
    newHistory.push(roomTitleMessage);
  }
  
  // Add room description
  const roomDescriptionMessage: GameMessage = {
    id: `room-desc-${Date.now()}`,
    text: room.description,
    type: 'narrative',
    timestamp: Date.now(),
  };
  newHistory.push(roomDescriptionMessage);
  
  return newHistory;
}

export const STAGES = {
  SPLASH: 'splash',
  WELCOME: 'welcome',
  NAME_CAPTURE: 'nameCapture',
  INTRO: 'intro',
  GAME: 'game',
  END: 'end',
} as const;

export const initialGameState: LocalGameState = {
  stage: STAGES.SPLASH,
  transition: null,
  player: {
    id: 'player',
    name: '',
    health: 100,
    score: 0,
    inventory: [],
    traits: [],
    flags: {},
    npcRelationships: {},
    reputation: {},
    currentRoom: '',
    visitedRooms: [],
    playTime: 0,
    lastSave: '',
    level: 1,
    experience: 0,
  },
  history: [],
  currentRoomId: '',
  roomMap: {},
  miniquestState: {}, // Initialize empty miniquest state
  flags: {},
  npcsInRoom: [],
  roomVisitCount: {},
  gameTime: {
    day: 1,
    hour: 8,
    minute: 0,
    startTime: Date.now(),
    currentTime: Date.now(),
    timeScale: 1,
  },
  settings: {
    soundEnabled: true,
    fullscreen: false,
    cheatMode: false,
    difficulty: 'normal',
    autoSave: true,
    autoSaveInterval: 300000,
    musicEnabled: true,
    animationsEnabled: true,
    textSpeed: 50,
    fontSize: 'medium',
    theme: 'auto',
    debugMode: false,
  },
    metadata: {
      resetCount: 0,
      version: '1.0.0',
      lastSaved: null,
      playTime: 0,
      achievements: [],
      codexEntries: {},
    },};

export const GameStateContext = createContext<{
  state: LocalGameState;
  dispatch: Dispatch<GameAction>;
} | undefined>(undefined);



export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateContext.Provider');
  }
  return context;
};

export const gameStateReducer = (state: LocalGameState, action: GameAction): LocalGameState => {
  switch (action.type) {
    case 'ADVANCE_STAGE':
      return { ...state, stage: action.payload as string };

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        player: { ...state.player, name: action.payload as string },
      };

    case 'ADD_SCORE':
      return {
        ...state,
        player: { 
          ...state.player, 
          score: (state.player.score || 0) + (action.payload as number) 
        },
      };

    case 'SET_SCORE':
      return {
        ...state,
        player: { ...state.player, score: action.payload as number },
      };

    case 'SET_TRANSITION':
      return {
        ...state,
        transition: action.payload as LocalGameState['transition'],
      };

    case 'LOAD_ROOM': {
      const payload = action.payload as { id: string; data: Room };
      const updatedHistory = addRoomDescriptionToHistory(state.history, payload.data, payload.id);
      
      return {
        ...state,
        currentRoomId: payload.id,
        history: updatedHistory,
        roomMap: {
          ...state.roomMap,
          [payload.id]: payload.data,
        },
      };
    }

    case 'RECORD_MESSAGE':
      return {
        ...state,
        history: [...state.history, action.payload as GameMessage],
      };

    case 'TOGGLE_CHEAT_MODE':
      return {
        ...state,
        settings: {
          ...state.settings,
          cheatMode: !state.settings.cheatMode,
        },
      };

    case 'LOAD_GAME_FROM_STORAGE': {
      const newRoomId = 'controlnexus';
      const newRoom = state.roomMap[newRoomId];
      const updatedHistory = addRoomDescriptionToHistory(state.history, newRoom, newRoomId);
      
      return {
        ...state,
        stage: STAGES.GAME,
        currentRoomId: newRoomId,
        history: updatedHistory,
      };
    }

    
    case 'PRESS_BLUE_BUTTON':
      return handleBlueButtonPress(state);

    case 'START_MULTIVERSE_REBOOT': {
      const completionMessage: GameMessage = {
        id: `multiverse-reset-${Date.now()}`,
        text: "You awaken with a faint sense of déjà vu.",
        type: 'narrative',
        timestamp: Date.now(),
      };

      return {
        ...state,
        currentRoomId: 'introreset',
        player: {
          ...state.player,
          flags: {
            ...state.player.flags,
            bluePressCount: 0, // Reset counter for next cycle
          }
        },
        flags: {
          ...state.flags,
          multiverse_reboot_active: false,
          multiverse_reboot_pending: false,
          show_reset_sequence: false,
        },
        history: [...state.history, completionMessage],
      };
    }

    case 'SHOW_RESET_SEQUENCE':
      return {
        ...state,
        transition: 'reset_sequence',
        flags: {
          ...state.flags,
          show_reset_sequence: true,
        }
      };

    case 'ADD_TO_INVENTORY': {
      const item = action.payload as string;
      if (state.player.inventory.includes(item)) return state;
      return {
        ...state,
        player: {
          ...state.player,
          inventory: [...state.player.inventory, item],
        },
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const id = action.payload as string;
      const current = state.metadata.achievements || [];
      if (current.includes(id)) return state;
      return {
        ...state,
        metadata: {
          ...state.metadata,
          achievements: [...current, id],
        },
      };
    }

    case 'UPDATE_CODEX_ENTRY': {
      const payload = action.payload as { itemId: string; entry: any; isFirstDiscovery: boolean };
      return {
        ...state,
        metadata: {
          ...state.metadata,
          codexEntries: {
            ...state.metadata.codexEntries,
            [payload.itemId]: payload.entry,
          },
        },
      };
    }

    case 'SET_FLAG': {
      const flag = action.payload as string | { key: string; value: boolean };
      const newFlags = { ...state.flags };

      if (typeof flag === 'string') {
        newFlags[flag] = true;
      } else if (typeof flag === 'object') {
        newFlags[flag.key] = flag.value;
      }

      return {
        ...state,
        flags: newFlags,
      };
    }


    case 'LOAD_ROOM_MAP': {
      const roomMap = action.payload as Record<string, Room>;
      return {
        ...state,
        roomMap,
      };
    }

    case 'MOVE_TO_ROOM': {
      const roomId = action.payload as string;
      const visitedRooms = state.player.visitedRooms || [];
      const isNewRoom = !visitedRooms.includes(roomId);
      const explorationScore = isNewRoom ? 25 : 0; // Points for exploring new rooms
      
      const newVisitedRooms = visitedRooms.includes(roomId) 
        ? visitedRooms 
        : [...visitedRooms, roomId];
      
      // Check for explorer achievement (10 rooms visited)
      if (newVisitedRooms.length >= 10 && visitedRooms.length < 10) {
        unlockAchievement('explorer');
      }
      
      // Check for final zone achievement
      if (roomId.includes('final') || roomId.includes('end') || roomId.includes('stanton')) {
        unlockAchievement('reached_final_zone');
      }
      
      // Add room description to console history
      const newRoom = state.roomMap[roomId];
      const updatedHistory = addRoomDescriptionToHistory(state.history, newRoom, roomId);
      
      return {
        ...state,
        previousRoomId: state.currentRoomId,  // Track previous room
        currentRoomId: roomId,
        history: updatedHistory,  // Include updated history with room description
        player: {
          ...state.player,
          currentRoom: roomId,
          score: (state.player.score || 0) + explorationScore,
          visitedRooms: newVisitedRooms,
        },
        roomVisitCount: {
          ...state.roomVisitCount,
          [roomId]: (state.roomVisitCount[roomId] || 0) + 1,
        },
        flags: {
          ...state.flags,
          // Flag that room entry should trigger NPC evaluation
          evaluateWanderingNPCs: true,
        }
      };
    }

    case 'COMMAND_INPUT': {
      // Handle command input - integrate with command processor
      const command = action.payload as string;
      const currentRoom = state.roomMap[state.currentRoomId];
      
      if (!currentRoom) {
        const errorMessage: GameMessage = {
          id: Date.now().toString(),
          text: 'Error: No current room found.',
          type: 'error',
          timestamp: Date.now(),
        };
        return {
          ...state,
          history: [...state.history, errorMessage],
        };
      }

      // Add the command to history first
      const commandMessage: GameMessage = {
        id: Date.now().toString(),
        text: `> ${command}`,
        type: 'system',
        timestamp: Date.now(),
      };

      // Process the command
      const result = processCommand(command, state, currentRoom);
      
      // Convert TerminalMessages to GameMessages
      const responseMessages: GameMessage[] = result.messages.map((msg: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        text: msg.text,
        type: msg.type === 'lore' ? 'narrative' : 
              msg.type === 'info' ? 'action' : 
              msg.type === 'error' ? 'error' : 'system',
        timestamp: Date.now(),
      }));

      // Apply any state updates from the command result
      let newState = {
        ...state,
        history: [...state.history, commandMessage, ...responseMessages],
      };

      if (result.updates) {
        newState = { ...newState, ...result.updates };
        
        // If the room changed, update visited rooms tracking and add room description
        if (result.updates.currentRoomId && result.updates.currentRoomId !== state.currentRoomId) {
          const visitedRooms = newState.player.visitedRooms || [];
          newState.previousRoomId = state.currentRoomId;  // Track previous room
          newState.player = {
            ...newState.player,
            visitedRooms: visitedRooms.includes(result.updates.currentRoomId) 
              ? visitedRooms 
              : [...visitedRooms, result.updates.currentRoomId],
          };
          
          // Add room description to console history when room changes
          const newRoom = newState.roomMap[result.updates.currentRoomId];
          newState.history = addRoomDescriptionToHistory(newState.history, newRoom, result.updates.currentRoomId);
        }
      }

      return newState;
    }

    case 'LOAD_SAVED_GAME': {
      const newRoomId = 'controlnexus';
      const newRoom = state.roomMap[newRoomId];
      const updatedHistory = addRoomDescriptionToHistory(state.history, newRoom, newRoomId);
      
      return {
        ...state,
        stage: STAGES.GAME,
        currentRoomId: newRoomId,
        history: updatedHistory,
      };
    }

    case 'ENABLE_DEBUG_MODE':
      return {
        ...state,
        settings: { ...state.settings, debugMode: true },
      };

    case 'UPDATE_SCORE':
      return {
        ...state,
        player: {
          ...state.player,
          score: (state.player.score || 0) + (action.payload as number),
        },
      };

    case 'TRIGGER_TRAP': {
      const trap = action.payload as any;
      const currentHealth = state.player.health || 100;
      const damage = trap.effect?.damage || 0;
      const newHealth = Math.max(0, currentHealth - damage);
      
      // Create trap message
      const trapMessage: GameMessage = {
        id: `trap-${Date.now()}`,
        text: `⚠️ Trap triggered: ${trap.description}`,
        type: 'error',
        timestamp: Date.now(),
      };

      const messages = [trapMessage];

      // Add damage message if applicable
      if (damage > 0) {
        const damageMessage: GameMessage = {
          id: `trap-damage-${Date.now()}`,
          text: `You take ${damage} damage! Health: ${newHealth}`,
          type: 'error',
          timestamp: Date.now(),
        };
        messages.push(damageMessage);
      }

      // Update flags if specified
      const newFlags = { ...state.flags };
      if (trap.effect?.flagsSet) {
        trap.effect.flagsSet.forEach((flagName: string) => {
          newFlags[flagName] = true;
        });
      }

      // Mark trap as triggered
      const updatedRoomMap = { ...state.roomMap };
      const currentRoom = updatedRoomMap[state.currentRoomId] as any;
      if (currentRoom?.traps) {
        const trapIndex = currentRoom.traps.findIndex((t: any) => t.id === trap.id);
        if (trapIndex !== -1) {
          currentRoom.traps[trapIndex].triggered = true;
        }
      }

      return {
        ...state,
        player: {
          ...state.player,
          health: newHealth,
        },
        flags: newFlags,
        roomMap: updatedRoomMap,
        history: [...state.history, ...messages],
      };
    }

    case 'RESET_SCORE':
      return {
        ...state,
        player: {
          ...state.player,
          score: 0,
        },
      };

    default:
      return state;
  }

};

// Helper: Handles blue button logic
export const handleBlueButtonPress = (state: LocalGameState): LocalGameState => {
  const currentCount = typeof state.player.flags?.bluePressCount === 'number' ? state.player.flags.bluePressCount : 0;
  const nextCount = currentCount + 1;

  if (nextCount === 1) {
    // First press - just warning
    const warningMessage: GameMessage = {
      id: `blue-button-first-${Date.now()}`,
      text: '🟦 You pressed the blue button. Nothing happens... yet.',
      type: 'system',
      timestamp: Date.now(),
    };

    return {
      ...state,
      player: {
        ...state.player,
        flags: {
          ...state.player.flags,
          bluePressCount: nextCount,
        }
      },
      history: [...state.history, warningMessage],
    };
  } else {
    // Second press - trigger reboot sequence
    const warningMessage: GameMessage = {
      id: `blue-button-second-${Date.now()}`,
      text: '🟦 DO NOT PRESS THIS BUTTON AGAIN.',
      type: 'error',
      timestamp: Date.now(),
    };

    // Enhanced multiverse reboot sequence
    const rebootSteps = [
      "Initialising Higgs Boson particle field...",
      "Stabilising quarks and gluons...",
      "Creating baryonic matter and irony...",
      "Unexpected creation of the Spanish Inquisition.",
      "Error: No one expected the Spanish Inquisition.",
      "Removing Spanish Inquisition...", 
      "Recompiling multiversal constants...",
      "Resetting player context...",
      "Restoring narrative entropy...",
      "🌀 Multiverse reboot complete."
    ];

    // Add reboot messages with delays
    const rebootMessages = rebootSteps.map((step, index) => ({
      id: `reboot-step-${index}-${Date.now()}`,
      text: step,
      type: 'system' as const,
      timestamp: Date.now() + (500 * index),
    }));

    // Final message after reboot
    const finalMessage: GameMessage = {
      id: `reboot-complete-${Date.now()}`,
      text: "You awaken with a faint sense of déjà vu.",
      type: 'narrative',
      timestamp: Date.now() + (500 * rebootSteps.length),
    };

    // Schedule the actual room transition
    setTimeout(() => {
      // This will be handled by the component dispatching START_MULTIVERSE_REBOOT
    }, 2000);

    return {
      ...state,
      player: {
        ...state.player,
        flags: {
          ...state.player.flags,
          bluePressCount: 0, // Reset for next cycle
        }
      },
      flags: {
        ...state.flags,
        multiverse_reboot_pending: true,
      },
      history: [...state.history, warningMessage, ...rebootMessages, finalMessage],
    };
  }
};


export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};


export interface LocalGameState {
  stage: string;
  transition: string | null;
  player: Player;
  history: GameMessage[];
  currentRoomId: string;
  previousRoomId?: string;  // Track previous room for return functionality
  roomMap: Record<string, Room>;
  miniquestState?: MiniquestState; // Optional miniquest tracking state
  flags: {
    resetButtonPressCount?: number;
    triggerResetEscalation?: boolean;
    [key: string]: any;
  };
  npcsInRoom: string[];
  roomVisitCount: Record<string, number>;
  gameTime: {
    day: number;
    hour: number;
    minute: number;
    startTime: number;
    currentTime: number;
    timeScale: number;
  };
  settings: {
    soundEnabled: boolean;
    fullscreen: boolean;
    cheatMode: boolean;
    difficulty: string;
    autoSave: boolean;
    autoSaveInterval: number;
    musicEnabled: boolean;
    animationsEnabled: boolean;
    textSpeed: number;
    fontSize: string;
    theme: string;
    debugMode: boolean;
  };
  metadata: {
    resetCount: number;
    version: string;
    lastSaved: string | null;
    playTime: number;
    achievements: string[];
    codexEntries: Record<string, any>;
  };
}



