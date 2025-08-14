/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import { NPC } from "../types/NPCTypes";

export interface PlayerState {
  name?: string;
  inventory?: string[];
  traits?: string[];
  health?: number;
  score?: number;
  level?: number;
  currentRoom?: string;
  resetCount?: number;
  quest?: string;
  flags?: Record<string, boolean | string | number>;
  npcRelationships?: Record<string, number>;

  achievements?: string[];
  itemsCollected?: string[];
  dialogueFlags?: Record<string, boolean>;
  conversationHistory?: Record<string, number>;
  reputation?: Record<string, number>;

  lastSave?: number;
  sessionStart?: number;
  totalPlayTime?: number;

  [key: string]: unknown;
}

export interface GameState extends PlayerState {
  playerName: string;
  currentRoom: string;
  inventory: string[];
  flags: Record<string, boolean | string | number>;

  visitedRooms: string[];
  commandHistory: string[];
  gameLog: string[];

  isTransitioning?: boolean;
  targetRoom?: string;
  lastCommand?: string;

  health: number;
  score: number;
  level: number;
  resetCount: number;

  sessionStart: number;
  totalPlayTime: number;
  lastSave: number;
}

export type GameAction =
  | { type: "SET"; payload: Partial<GameState> }
  | { type: "RESET"; payload?: Partial<GameState> }
  | { type: "SET_PLAYER_NAME"; payload: string }
  | { type: "SET_CURRENT_ROOM"; payload: string }
  | { type: "ADD_TO_INVENTORY"; payload: string }
  | { type: "REMOVE_FROM_INVENTORY"; payload: string }
  | {
      type: "SET_FLAG";
      payload: { key: string; value: boolean | string | number };
    }
  | { type: "UPDATE_HEALTH"; payload: number }
  | { type: "UPDATE_SCORE"; payload: number }
  | { type: "ADD_VISITED_ROOM"; payload: string }
  | { type: "ADD_COMMAND_TO_HISTORY"; payload: string }
  | { type: "ADD_TO_LOG"; payload: string }
  | {
      type: "SET_TRANSITIONING";
      payload: { isTransitioning: boolean; targetRoom?: string };
    }
  | {
      type: "UPDATE_NPC_RELATIONSHIP";
      payload: { npcId: string; value: number };
    }
  | { type: "ADD_ACHIEVEMENT"; payload: string }
  | { type: "UPDATE_PLAY_TIME"; payload: number };

export const initialGameState: GameState = {
  playerName: "Player",
  currentRoom: "controlnexus",
  inventory: [],
  flags: {},

  visitedRooms: [],
  commandHistory: [],
  gameLog: [],

  name: "Player",
  health: 100,
  score: 0,
  level: 1,
  resetCount: 0,

  traits: [],
  quest: "",
  npcRelationships: {},
  achievements: [],
  itemsCollected: [],
  dialogueFlags: {},
  conversationHistory: {},
  reputation: {},

  sessionStart: Date.now(),
  totalPlayTime: 0,
  lastSave: Date.now(),

  isTransitioning: false,
  targetRoom: undefined,
  lastCommand: undefined,
};

// --- Function: gameStateReducer ---
export function gameStateReducer(
  state: GameState,
  action: GameAction,
): GameState {
  try {
    switch (action.type) {
      case "SET":
        return {
          ...state,
          ...action.payload,
          lastSave: Date.now(),
        };

      case "RESET":
        return {
          ...initialGameState,
          ...action.payload,
          sessionStart: Date.now(),
          resetCount: state.resetCount + 1,
          totalPlayTime: state.totalPlayTime || 0,
        };

      case "SET_PLAYER_NAME":
        return {
          ...state,
          playerName: action.payload,
          name: action.payload,
          lastSave: Date.now(),
        };

      case "SET_CURRENT_ROOM":
        return {
          ...state,
          currentRoom: action.payload,

          visitedRooms: state.visitedRooms.includes(action.payload)
            ? state.visitedRooms
            : [...state.visitedRooms, action.payload],
          isTransitioning: false,
          targetRoom: undefined,
          lastSave: Date.now(),
        };

      case "ADD_TO_INVENTORY":
        if (state.inventory.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          inventory: [...state.inventory, action.payload],
          itemsCollected: state.itemsCollected
            ? [...new Set([...state.itemsCollected, action.payload])]
            : [action.payload],
          lastSave: Date.now(),
        };

      case "REMOVE_FROM_INVENTORY":
        return {
          ...state,
          inventory: state.inventory.filter((item) => item !== action.payload),
          lastSave: Date.now(),
        };

      case "SET_FLAG":
        return {
          ...state,
          flags: {
            ...state.flags,
            [action.payload.key]: action.payload.value,
          },
          lastSave: Date.now(),
        };

      case "UPDATE_HEALTH":
        const newHealth = Math.max(0, Math.min(100, action.payload as number));
        return {
          ...state,
          health: newHealth,
          lastSave: Date.now(),
        };

      case "UPDATE_SCORE":
        const newScore = Math.max(0, action.payload as number);
        return {
          ...state,
          score: newScore,
          lastSave: Date.now(),
        };

      case "ADD_VISITED_ROOM":
        if (state.visitedRooms.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          visitedRooms: [...state.visitedRooms, action.payload],
        };

      case "ADD_COMMAND_TO_HISTORY":
        const updatedHistory = [...state.commandHistory, action.payload];
        if (updatedHistory.length > 100) {
          updatedHistory.shift();
        }
        return {
          ...state,
          commandHistory: updatedHistory,
          lastCommand: action.payload,
        };

      case "ADD_TO_LOG":
        const updatedLog = [...state.gameLog, action.payload];
        if (updatedLog.length > 500) {
          updatedLog.shift();
        }
        return {
          ...state,
          gameLog: updatedLog,
        };

      case "SET_TRANSITIONING":
        return {
          ...state,
          isTransitioning: action.payload.isTransitioning,
          targetRoom: action.payload.targetRoom,
        };

      case "UPDATE_NPC_RELATIONSHIP":
        const clampedValue = Math.max(
          -100,
          Math.min(100, action.payload.value),
        );
        return {
          ...state,
          npcRelationships: {
            ...state.npcRelationships,
            [action.payload.npcId]: clampedValue,
          },
          lastSave: Date.now(),
        };

      case "ADD_ACHIEVEMENT":
        if (state.achievements?.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          achievements: [...(state.achievements || []), action.payload],
          lastSave: Date.now(),
        };

      case "UPDATE_PLAY_TIME":
        return {
          ...state,
          totalPlayTime: (state.totalPlayTime || 0) + action.payload,
        };

      default:
        console.warn(
          "[PlayerState] Unknown action type:",
          (action as any).type,
        );
        return state;
    }
  } catch (error) {
    console.error("[PlayerState] Error in gameStateReducer:", error);

    return state;
  }
}

// --- Function: hasItem ---
export function hasItem(state: GameState, itemId: string): boolean {
  return state.inventory.includes(itemId);
}

// --- Function: hasFlag ---
export function hasFlag(state: GameState, flagKey: string): boolean {
  return Boolean(state.flags[flagKey]);
}

// --- Function: getFlagValue ---
export function getFlagValue<T = boolean | string | number>(
  state: GameState,
  flagKey: string,
  defaultValue?: T,
): T {
  const value = state.flags?.[flagKey];
  return value !== undefined ? (value as T) : (defaultValue as T);
}

// --- Function: hasVisitedRoom ---
export function hasVisitedRoom(state: GameState, roomId: string): boolean {
  return state.visitedRooms.includes(roomId);
}

// --- Function: getNPCRelationship ---
export function getNPCRelationship(state: GameState, npcId: string): number {
  return state.npcRelationships?.[npcId] || 0;
}

// --- Function: calculateSessionTime ---
export function calculateSessionTime(state: GameState): number {
  return Date.now() - state.sessionStart;
}

// --- Function: validateGameState ---
export function validateGameState(state: Partial<GameState>): boolean {
  try {
    if (typeof state.playerName !== "string") {return false;}
    if (typeof state.currentRoom !== "string") {return false;}
    if (!Array.isArray(state.inventory)) {return false;}
    if (typeof state.flags !== "object" || state.flags === null) {return false;}
    if (!Array.isArray(state.visitedRooms)) {return false;}

    if (
      typeof state.health !== "number" ||
      state.health < 0 ||
      state.health > 100
    )
      {return false;}
    if (typeof state.score !== "number" || state.score < 0) {return false;}
    if (typeof state.level !== "number" || state.level < 1) {return false;}

    return true;
  } catch (error) {
    console.error("[PlayerState] Error validating game state:", error);
    return false;
  }
}

// --- Function: prepareSaveState ---
export function prepareSaveState(state: GameState): Partial<GameState> {
  const { isTransitioning, targetRoom, sessionStart, ...saveableState } = state;

  return {
    ...saveableState,
    totalPlayTime: (state.totalPlayTime || 0) + calculateSessionTime(state),
  };
}

// --- Function: mergeLoadedState ---
export function mergeLoadedState(
  currentState: GameState,
  loadedState: Partial<GameState>,
): GameState {
  if (!validateGameState(loadedState)) {
    console.warn("[PlayerState] Invalid loaded state, using current state");
    return currentState;
  }

  return {
    ...currentState,
    ...loadedState,

    sessionStart: Date.now(),
    isTransitioning: false,
    targetRoom: undefined,
    lastSave: Date.now(),
  };
}
