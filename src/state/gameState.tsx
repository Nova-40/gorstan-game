// src/state/gameState.tsx
// Gorstan Game Beta 1 (Restored & Enhanced)
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game state context, reducer, and provider

import React, { createContext, useContext, useReducer, Dispatch } from 'react';

import { processCommand } from '../engine/commandParser';
import { unlockAchievement } from '../logic/achievementEngine';
import { Room } from '../types/Room';
import { Player, GameAction, GameMessage, MiniquestState } from '../types/GameTypes';
import type { NPC } from '../types/NPCTypes';
import type { ConversationThread } from '../types/dialogue';
import { conversationsReducer } from '../reducers/conversations';

// --- Util: Add Room Description To History ---
function addRoomDescriptionToHistory(history: GameMessage[], room: Room | null, roomId: string): GameMessage[] {
  if (!room || !room.description) return history;
  const newHistory = [...history];

  if (room.title && room.title !== roomId) {
    newHistory.push({
      id: `room-title-${Date.now()}`,
      text: `📍 ${room.title}`,
      type: 'system',
      timestamp: Date.now(),
    });
  }

  newHistory.push({
    id: `room-desc-${Date.now()}`,
    text: Array.isArray(room.description) ? room.description.join(' ') : room.description,
    type: 'narrative',
    timestamp: Date.now(),
  });

  return newHistory;
}

// --- Stage constants ---
export const STAGES = {
  SPLASH: 'splash',
  WELCOME: 'welcome',
  NAME_CAPTURE: 'nameCapture',
  INTRO: 'intro',
  GAME: 'game',
  END: 'end',
} as const;

// --- Initial State ---
export const initialGameState: LocalGameState = {
  stage: STAGES.SPLASH, // Normal game start sequence
  transition: null,
  player: {
    id: 'player',
    name: '', // Player will enter their name during the normal flow
    health: 100,
    score: 0,
    inventory: [],
    traits: [],
    flags: {},
    npcRelationships: {},
    reputation: {},
    currentRoom: 'controlnexus',
    visitedRooms: [],
    playTime: 0,
    lastSave: '',
  },
  history: [],
  currentRoomId: 'controlnexus',
  previousRoomId: undefined,
  roomMap: {},
  miniquestState: {}, 
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
  },
  messages: [],
  inventory: [],
  // Inter-NPC conversation system
  conversations: {},
  overhearNPCBanter: true,
};

// --- Helper: Blue Button Press ---
export const handleBlueButtonPress = (state: LocalGameState): LocalGameState => {
  const currentCount = typeof state.player.flags?.bluePressCount === 'number' ? state.player.flags.bluePressCount : 0;
  const nextCount = currentCount + 1;

  if (nextCount === 1) {
    const warningMessage: GameMessage = {
      id: `blue-button-first-${Date.now()}`,
      text: '🟦 You pressed the blue button. A panel lights up with a stern warning...',
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
          showBlueButtonWarning: true,
        }
      },
      history: [...state.history, warningMessage],
    };
  } else {
    const finalWarningMessage: GameMessage = {
      id: `blue-button-final-${Date.now()}`,
      text: '🟦 You pressed the button again despite all warnings. Reality begins to unravel...',
      type: 'error',
      timestamp: Date.now(),
    };

    return {
      ...state,
      player: {
        ...state.player,
        flags: {
          ...state.player.flags,
          bluePressCount: 0,
          showBlueButtonWarning: false,
        }
      },
      flags: {
        ...state.flags,
        multiverse_reboot_pending: true,
      },
      history: [...state.history, finalWarningMessage], 
    };
  }
};

// --- Reducer ---
export const gameStateReducer = (state: LocalGameState, action: GameAction): LocalGameState => {
  switch (action.type) {
    // --- Example action (legacy, retained for compatibility) ---
    case 'DRINK_COFFEE': {
      const hasCoffee = state.player.inventory.includes('coffee');
      if (hasCoffee) {
        return {
          ...state,
          player: {
            ...state.player,
            inventory: state.player.inventory.filter((item: string) => item !== 'coffee'),
          },
          messages: [
            ...state.messages,
            { id: `msg-${Date.now()}`, text: 'You drink the coffee. It’s still warm — and you feel slightly more alert.', type: 'system', timestamp: Date.now() }
          ],
          flags: {
            ...state.flags,
            coffeeConsumed: true
          }
        };
      } else {
        return {
          ...state,
          messages: [
            ...state.messages,
            { id: `msg-${Date.now()}`, text: 'You don’t have any coffee.', type: 'system', timestamp: Date.now() }
          ]
        };
      }
    }

    // --- Inventory ---
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

    // --- Use Items ---
    case 'USE_ITEM': {
      if (typeof action.payload === 'object' && action.payload !== null && 'item' in action.payload) {
        const { item } = action.payload as { item: string };
        if (item === 'batteries') {
          return {
            ...state,
            flags: {
              ...state.flags,
              batteriesInserted: true
            },
            messages: [
              ...state.messages,
              { id: `msg-${Date.now()}`, text: 'You insert the batteries.', type: 'system', timestamp: Date.now() }
            ]
          };
        }
      }
      return state;
    }
    case 'USE_ITEM_WITH': {
      if (
        typeof action.payload === 'object' &&
        action.payload !== null &&
        'item' in action.payload &&
        'target' in action.payload
      ) {
        const { item, target } = action.payload as { item: string; target: string };
        if ((item === 'batteries' && target === 'torch') || (item === 'torch' && target === 'batteries')) {
          const hasBatteries = state.flags?.batteriesInserted;
          if (hasBatteries) {
            return {
              ...state,
              flags: {
                ...state.flags,
                torchReady: true
              },
              messages: [
                ...state.messages,
                { id: `msg-${Date.now()}`, text: 'You insert the batteries into the torch. It flickers to life.', type: 'system', timestamp: Date.now() }
              ]
            };
          } else {
            return {
              ...state,
              messages: [
                ...state.messages,
                { id: `msg-${Date.now()}`, text: 'You need to insert the batteries first.', type: 'system', timestamp: Date.now() }
              ]
            };
          }
        }
      }
      return state;
    }

    // --- Player Actions ---
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

    // --- Stage/Transitions ---
    case 'ADVANCE_STAGE':
      return { ...state, stage: action.payload as string };

    // --- Room Loading/Travel ---
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
      const explorationScore = isNewRoom ? 5 : 0; // Using new scoring: +5 for new rooms
      const newVisitedRooms = visitedRooms.includes(roomId)
        ? visitedRooms
        : [...visitedRooms, roomId];

      // Achievement triggers
      if (newVisitedRooms.length >= 10 && visitedRooms.length < 10) {
        unlockAchievement('explorer');
      }
      if (roomId.includes('final') || roomId.includes('end') || roomId.includes('stanton')) {
        unlockAchievement('reached_final_zone');
      }

      const newRoom = state.roomMap[roomId];
      const updatedHistory = addRoomDescriptionToHistory(state.history, newRoom, roomId);

      // Trigger room entry events (including Morthos/Al encounter)
      let encounterFlag = false;
      if (newRoom && roomId === 'controlroom' && !state.flags?.hasMetMorthosAl) {
        encounterFlag = true;
      }

      return {
        ...state,
        previousRoomId: state.currentRoomId,  
        currentRoomId: roomId,
        history: updatedHistory,  
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
          evaluateWanderingNPCs: true,
          triggerMorthosAlEncounter: encounterFlag
        },
      };
    }

    case 'SET_NPCS_IN_ROOM': {
      const npcs = action.payload as NPC[];
      return {
        ...state,
        npcsInRoom: npcs,
      };
    }

    // --- Core Command Input & Response Pipeline ---
    case 'COMMAND_INPUT': {
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

      const commandMessage: GameMessage = {
        id: Date.now().toString(),
        text: `> ${command}`,
        type: 'system',
        timestamp: Date.now(),
      };

      const result = processCommand({
        input: command,
        currentRoom,
        gameState: state,
      });
      const responseMessages: GameMessage[] = result.messages.map((msg: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        text: msg.text,
        type: msg.type === 'lore' ? 'narrative' :
              msg.type === 'info' ? 'action' :
              msg.type === 'error' ? 'error' : 'system',
        timestamp: Date.now(),
      }));

      let newState = {
        ...state,
        history: [...state.history, commandMessage, ...responseMessages],
      };

      if (result.updates) {
        newState = { ...newState, ...result.updates };

        if (result.updates.currentRoomId && result.updates.currentRoomId !== state.currentRoomId) {
          const visitedRooms = newState.player.visitedRooms || [];
          newState.previousRoomId = state.currentRoomId;  
          newState.player = {
            ...newState.player,
            visitedRooms: visitedRooms.includes(result.updates.currentRoomId)
              ? visitedRooms
              : [...visitedRooms, result.updates.currentRoomId],
          };
          const newRoom = newState.roomMap[result.updates.currentRoomId];
          newState.history = addRoomDescriptionToHistory(newState.history, newRoom, result.updates.currentRoomId);
        }
      }

      return newState;
    }

    // --- Saving/Loading ---
    case 'SAVE_GAME': {
      return {
        ...state,
        metadata: {
          ...state.metadata,
          lastSaved: new Date().toISOString(),
        },
      };
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

    // --- Codex & Achievements ---
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

    // --- Game/Meta Flags ---
    case 'SET_FLAG': {
      if (
        'payload' in action &&
        action.payload &&
        typeof action.payload === 'object' &&
        Object.prototype.hasOwnProperty.call(action.payload, 'flag') &&
        (action.payload as any).flag !== undefined
      ) {
        const { flag, value } = action.payload as { flag: string; value: any };
        
        // Score events based on flag changes
        const scoreEvents: Record<string, { positive?: string; negative?: string }> = {
          'dominicIsDead': { negative: 'npc.dominic.dead' },
          'dominic_dead': { negative: 'npc.dominic.dead' },
          'dominicSpared': { positive: 'dominic.spared' },
          'puzzle_maze_lattice_solved': { positive: 'puzzle.solved' },
          'puzzle_glitch_echo_resolved': { positive: 'puzzle.solved' },
          'pollyTakeoverStopped': { positive: 'polly.takeover.prevented' },
          'pollyTakeoverInProgress': { negative: 'polly.takeover.failed.to.stop' },
          'playerIsRedacted': { negative: 'raven.flagged.redacted' },
          'realityStabilized': { positive: 'reality.stabilized' },
          'realityBroken': { negative: 'reality.broken.unstabilized' },
          'secretRoomDiscovered': { positive: 'secret.room.discovered' },
          'hiddenContentUnlocked': { positive: 'hidden.content.unlocked' },
          'wendellPolite': { positive: 'diplomacy.used' },
          'wendellRude': { negative: 'npc.wendell.rude' },
          'librarianHelpful': { positive: 'npc.librarian.helpful' },
          'resetCompletedCorrectly': { positive: 'reset.completed.correctly' },
          'multiverseRebootSuccessful': { positive: 'multiverse.reboot.successful' },
        };

        const scoreEvent = scoreEvents[flag];
        let scoreUpdates: GameMessage[] = [];
        
        if (scoreEvent) {
          const eventKey = value ? scoreEvent.positive : scoreEvent.negative;
          if (eventKey) {
            // Import and trigger score event dynamically
            try {
              const { applyScoreForEvent } = require('../state/scoreEffects');
              applyScoreForEvent(eventKey);
            } catch (error) {
              console.warn('Failed to apply score event:', eventKey, error);
            }
          }
        }

        return {
          ...state,
          flags: {
            ...state.flags,
            [flag]: value
          }
        };
      } else if ('payload' in action) {
        const flag = action.payload as string | { key: string; value: boolean };
        let newFlags = { ...state.flags };
        if (typeof flag === 'string') {
          newFlags[flag] = true;
        } else if (typeof flag === 'object' && flag && (flag as any).key) {
          newFlags[(flag as any).key] = (flag as any).value;
        }
        return {
          ...state,
          flags: newFlags,
        };
      }
      return state;
    }

    // --- Debug ---
    case 'ENABLE_DEBUG_MODE': {
      return {
        ...state,
        settings: { ...state.settings, debugMode: true },
        flags: {
          ...state.flags,
          ctrlClickOnInstructions: true,
        },
      };
    }
    case 'TOGGLE_CHEAT_MODE':
      return {
        ...state,
        settings: {
          ...state.settings,
          cheatMode: !state.settings.cheatMode,
        },
      };

    // --- Miniquest ---
    // Add further miniquest actions here if required

    // --- Trap & Damage ---
    case 'TRIGGER_TRAP': {
      const trap = action.payload as any;
      const currentHealth = state.player.health || 100;
      const damage = trap.effect?.damage || 0;
      const newHealth = Math.max(0, currentHealth - damage);

      const trapMessage: GameMessage = {
        id: `trap-${Date.now()}`,
        text: `⚠️ Trap triggered: ${trap.description}`,
        type: 'error',
        timestamp: Date.now(),
      };

      if (trap.effect?.scorePenalty !== false) {
        state.player.score = (state.player.score || 0) - 10;
      }

      const messages = [trapMessage];

      if (damage > 0) {
        messages.push({
          id: `trap-damage-${Date.now()}`,
          text: `You take ${damage} damage! Health: ${newHealth}`,
          type: 'error',
          timestamp: Date.now(),
        });
      }

      const newFlags = { ...state.flags };
      if (trap.effect?.flagsSet) {
        trap.effect.flagsSet.forEach((flagName: string) => {
          newFlags[flagName] = true;
        });
      }

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

    // --- Other ---
    case 'RESET_SCORE': {
      return {
        ...state,
        player: {
          ...state.player,
          score: 0,
        },
      };
    }
    case 'UPDATE_SCORE': {
      return {
        ...state,
        player: {
          ...state.player,
          score: (state.player.score || 0) + (action.payload as number),
        },
      };
    }
    case 'SET_SCORE': {
      return {
        ...state,
        player: {
          ...state.player,
          score: action.payload as number,
        },
      };
    }

    // --- Modal/Message/Legacy cases ---
    case 'RECORD_MESSAGE':
      return {
        ...state,
        history: [...state.history, action.payload as GameMessage],
      };

    // --- Press Blue Button (multiverse reboot) ---
    case 'PRESS_BLUE_BUTTON':
      return handleBlueButtonPress(state);

    // --- Dismiss Blue Button Warning ---
    case 'DISMISS_BLUE_BUTTON_WARNING':
      return {
        ...state,
        player: {
          ...state.player,
          flags: {
            ...state.player.flags,
            showBlueButtonWarning: false,
          }
        },
      };

    // --- Reset (narrative/transition) ---
    case 'START_MULTIVERSE_REBOOT': {
      const completionMessage: GameMessage = {
        id: `multiverse-reset-${Date.now()}`,
        text: "You awaken with a faint sense of déjà vu. Everything feels familiar yet different...",
        type: 'narrative',
        timestamp: Date.now(),
      };
      return {
        ...state,
        currentRoomId: 'introstart',
        player: {
          ...state.player,
          flags: {
            ...state.player.flags,
            bluePressCount: 0, 
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

    // --- Press Action (generic) ---
    case 'PRESS_ACTION':
      return {
        ...state,
        history: [...state.history, {
          id: `press-action-${Date.now()}`,
          text: "You press something, but nothing happens.",
          type: 'system',
          timestamp: Date.now(),
        }],
      };

    // --- Remove Item from Room ---
    case 'REMOVE_ITEM_FROM_ROOM': {
      const { roomId, item } = action.payload as { roomId: string; item: string };
      const room = state.roomMap?.[roomId];
      if (!room || !room.items) return state;
      
      // Ensure we maintain the original items type structure
      const originalItems = room.items;
      let filteredItems: typeof originalItems;
      
      if (originalItems.length > 0 && typeof originalItems[0] === 'string') {
        // Handle string[] type
        filteredItems = (originalItems as string[]).filter(roomItem => roomItem !== item);
      } else {
        // Handle RoomItem[] type
        filteredItems = (originalItems as any[]).filter(roomItem => 
          typeof roomItem === 'object' ? roomItem.name !== item : roomItem !== item
        );
      }
      
      return {
        ...state,
        roomMap: {
          ...state.roomMap,
          [roomId]: {
            ...room,
            items: filteredItems,
          } as Room,
        },
      };
    }

    // --- Morthos & Al First Encounter ---
    case 'TRIGGER_MORTHOS_AL_ENCOUNTER': {
      if (state.flags?.hasMetMorthosAl) {
        return state; // Already met them
      }

      const encounterMessages: GameMessage[] = [
        {
          id: `encounter-start-${Date.now()}`,
          text: '🌫️ The shadows in the control room suddenly deepen, and the air grows thick with tension...',
          type: 'narrative',
          timestamp: Date.now()
        },
        {
          id: `morthos-appear-${Date.now()}`,
          text: '🌑 From the darkest corner of the room, a figure emerges. Morthos steps forward, shadows writhing around his form like living things.',
          type: 'narrative',
          timestamp: Date.now() + 1000
        },
        {
          id: `morthos-speak-${Date.now()}`,
          text: 'MORTHOS: "So... another operator discovers our little sanctuary. How deliciously... inevitable."',
          type: 'system',
          timestamp: Date.now() + 2000
        },
        {
          id: `al-appear-${Date.now()}`,
          text: '📋 A bureaucratic figure in a slightly rumpled suit materializes near the monitoring stations, adjusting his glasses with practiced efficiency.',
          type: 'narrative',
          timestamp: Date.now() + 3000
        },
        {
          id: `al-speak-${Date.now()}`,
          text: 'AL: "Ah, excellent timing. We have protocols to discuss, forms to file, and reality to stabilize. In that order."',
          type: 'system',
          timestamp: Date.now() + 4000
        },
        {
          id: `tension-build-${Date.now()}`,
          text: '⚡ The room crackles with dimensional energy as these two powerful entities regard each other—and you—with interest.',
          type: 'narrative',
          timestamp: Date.now() + 5000
        },
        {
          id: `encounter-complete-${Date.now()}`,
          text: '✨ You sense this encounter will shape your journey through the multiverse...',
          type: 'system',
          timestamp: Date.now() + 6000
        }
      ];

      return {
        ...state,
        history: [...state.history, ...encounterMessages],
        flags: {
          ...state.flags,
          hasMetMorthosAl: true,
          metMorthos: true,
          metAl: true,
          firstEncounterComplete: true
        }
      };
    }

    // --- NPC Conversation Tracking ---
    case 'ADD_NPC_CONVERSATION': {
      const { npcId, topic, playerInput, npcResponse, mood } = action.payload as {
        npcId: string;
        topic: string;
        playerInput: string;
        npcResponse: string;
        mood?: string;
      };
      const currentHistory = (state.flags?.npcConversations as any) || {};
      const npcHistory = currentHistory[npcId] || {
        lastInteraction: 0,
        totalInteractions: 0,
        entries: [],
        relationship: 0,
        knownTopics: [],
        unresolved: []
      };

      const newEntry = {
        topic,
        playerInput,
        npcResponse,
        timestamp: Date.now(),
        mood
      };

      const updatedHistory = {
        ...currentHistory,
        [npcId]: {
          ...npcHistory,
          lastInteraction: Date.now(),
          totalInteractions: npcHistory.totalInteractions + 1,
          entries: [...npcHistory.entries.slice(-9), newEntry], // Keep last 10 entries
          knownTopics: [...new Set([...npcHistory.knownTopics, topic])],
          currentTopic: topic
        }
      };

      return {
        ...state,
        flags: {
          ...state.flags,
          npcConversations: updatedHistory
        }
      };
    }

    case 'UPDATE_NPC_CONVERSATION_HISTORY': {
      const { npcId, history } = action.payload as {
        npcId: string;
        history: any;
      };
      const currentHistory = (state.flags?.npcConversations as any) || {};
      
      return {
        ...state,
        flags: {
          ...state.flags,
          npcConversations: {
            ...currentHistory,
            [npcId]: history
          }
        }
      };
    }

    // Inter-NPC conversation cases
    case 'UPSERT_CONVERSATION':
    case 'SET_OVERHEAR':
    case 'CLEAR_CONVERSATION':
    case 'MUTE_CONVERSATION':
      return conversationsReducer(state, action);

    // Settings updates
    case 'UPDATE_SETTINGS': {
      const { payload } = action as { type: 'UPDATE_SETTINGS'; payload: any };
      return {
        ...state,
        settings: {
          ...state.settings,
          ...payload
        }
      };
    }

    default:
      return state;
  }
};

// --- Context, Provider, and Hooks ---
export const GameStateContext = createContext<{
  state: LocalGameState;
  dispatch: Dispatch<GameAction>;
} | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialGameState);
  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateContext.Provider');
  }
  return context;
};

// Note: getGameState cannot use React hooks - use useGameState hook instead in React components
export function getGameState(): LocalGameState | null {
  // This function is kept for backward compatibility but should not be used in React components
  // React components should use useGameState() hook instead
  console.warn('getGameState() called - React components should use useGameState() hook instead');
  return null;
}

// --- Full Type Definitions (restored for feature parity) ---
export interface LocalGameState {
  stage: string;
  transition: string | null;
  player: Player;
  history: GameMessage[];
  currentRoomId: string;
  previousRoomId?: string;  
  roomMap: Record<string, Room>;
  miniquestState?: MiniquestState; 
  flags: {
    resetButtonPressCount?: number;
    triggerResetEscalation?: boolean;
    [key: string]: any;
  };
  npcsInRoom: NPC[];
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
  messages: GameMessage[];
  inventory: string[];
  // Inter-NPC conversation system
  conversations: Record<string, ConversationThread>;
  overhearNPCBanter: boolean;
  // Additional properties for compatibility
  playerName?: string;
  visitedRooms?: string[];
  achievements?: string[];
  resetCount?: number;
}

// Export the Dispatch type for use in other modules.
export type { Dispatch };

// Export alias for compatibility
export type GameState = LocalGameState;

/**
 * Reset the game state to initial values
 */
export function resetGameState(): LocalGameState {
  return { ...initialGameState };
}

/**
 * Clear the inventory from game state
 */
export function clearInventory(state: LocalGameState): LocalGameState {
  return {
    ...state,
    player: {
      ...state.player,
      inventory: []
    }
  };
}
