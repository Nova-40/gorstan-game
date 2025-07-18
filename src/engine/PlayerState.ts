// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: PlayerState.ts
// Description: Consolidated PlayerState, GameState interfaces and reducer for React integration

/**
 * Core player state interface - preserved existing structure
 */
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

  // Memory and progression tracking
  achievements?: string[];
  itemsCollected?: string[];
  dialogueFlags?: Record<string, boolean>;
  conversationHistory?: Record<string, number>;
  reputation?: Record<string, number>;

  // Timing
  lastSave?: number;
  sessionStart?: number;
  totalPlayTime?: number;

  // Any future keys
  [key: string]: unknown;
}

/**
 * Enhanced GameState interface - extends PlayerState with additional game-specific properties
 * Required for AppCore.tsx compatibility
 */
export interface GameState extends PlayerState {
  // Required core properties (made non-optional for game functionality)
  playerName: string;
  currentRoom: string;
  inventory: string[];
  flags: Record<string, boolean | string | number>;
  
  // Game session tracking
  visitedRooms: string[];
  commandHistory: string[];
  gameLog: string[];
  
  // Game flow control
  isTransitioning?: boolean;
  targetRoom?: string;
  lastCommand?: string;
  
  // Enhanced state tracking
  health: number;
  score: number;
  level: number;
  resetCount: number;
  
  // Session management
  sessionStart: number;
  totalPlayTime: number;
  lastSave: number;
}

/**
 * Game action types for the reducer
 */
export type GameAction =
  | { type: 'SET'; payload: Partial<GameState> }
  | { type: 'RESET'; payload?: Partial<GameState> }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_CURRENT_ROOM'; payload: string }
  | { type: 'ADD_TO_INVENTORY'; payload: string }
  | { type: 'REMOVE_FROM_INVENTORY'; payload: string }
  | { type: 'SET_FLAG'; payload: { key: string; value: boolean | string | number } }
  | { type: 'UPDATE_HEALTH'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'ADD_VISITED_ROOM'; payload: string }
  | { type: 'ADD_COMMAND_TO_HISTORY'; payload: string }
  | { type: 'ADD_TO_LOG'; payload: string }
  | { type: 'SET_TRANSITIONING'; payload: { isTransitioning: boolean; targetRoom?: string } }
  | { type: 'UPDATE_NPC_RELATIONSHIP'; payload: { npcId: string; value: number } }
  | { type: 'ADD_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_PLAY_TIME'; payload: number };

/**
 * Initial game state - provides sensible defaults for all required properties
 */
export const initialGameState: GameState = {
  // Core required properties
  playerName: 'Player',
  currentRoom: 'controlnexus', // Default starting room for Gorstan
  inventory: [],
  flags: {},
  
  // Game tracking
  visitedRooms: [],
  commandHistory: [],
  gameLog: [],
  
  // Player stats
  name: 'Player',
  health: 100,
  score: 0,
  level: 1,
  resetCount: 0,
  
  // Progression tracking
  traits: [],
  quest: '',
  npcRelationships: {},
  achievements: [],
  itemsCollected: [],
  dialogueFlags: {},
  conversationHistory: {},
  reputation: {},
  
  // Session timing
  sessionStart: Date.now(),
  totalPlayTime: 0,
  lastSave: Date.now(),
  
  // Game flow
  isTransitioning: false,
  targetRoom: undefined,
  lastCommand: undefined
};

  // PlayerState type definition for NPC interactions

// (Removed duplicate PlayerState interface to resolve type conflicts)

/**
 * Game state reducer - handles all state updates with proper immutability
 * Compatible with React's useReducer hook
 */
export function gameStateReducer(state: GameState, action: GameAction): GameState {
  try {
    switch (action.type) {
      case 'SET':
        // Bulk state update - preserves existing properties and updates with payload
        return {
          ...state,
          ...action.payload,
          lastSave: Date.now() // Always update save timestamp on state changes
        };

      case 'RESET':
        // Reset to initial state with optional overrides
        return {
          ...initialGameState,
          ...action.payload,
          sessionStart: Date.now(),
          resetCount: state.resetCount + 1,
          totalPlayTime: state.totalPlayTime || 0 // Preserve total play time across resets
        };

      case 'SET_PLAYER_NAME':
        return {
          ...state,
          playerName: action.payload,
          name: action.payload, // Keep both for compatibility
          lastSave: Date.now()
        };

      case 'SET_CURRENT_ROOM':
        return {
          ...state,
          currentRoom: action.payload,
          // Add to visited rooms if not already present
          visitedRooms: state.visitedRooms.includes(action.payload) 
            ? state.visitedRooms 
            : [...state.visitedRooms, action.payload],
          isTransitioning: false, // Clear transitioning state
          targetRoom: undefined,
          lastSave: Date.now()
        };

      case 'ADD_TO_INVENTORY':
        // Prevent duplicate items in inventory
        if (state.inventory.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          inventory: [...state.inventory, action.payload],
          itemsCollected: state.itemsCollected 
            ? [...new Set([...state.itemsCollected, action.payload])]
            : [action.payload],
          lastSave: Date.now()
        };

      case 'REMOVE_FROM_INVENTORY':
        return {
          ...state,
          inventory: state.inventory.filter(item => item !== action.payload),
          lastSave: Date.now()
        };

      case 'SET_FLAG':
        return {
          ...state,
          flags: {
            ...state.flags,
            [action.payload.key]: action.payload.value
          },
          lastSave: Date.now()
        };

      case 'UPDATE_HEALTH':
        // Ensure health stays within valid bounds (0-100)
                return {
          ...state,
          health: newHealth,
          lastSave: Date.now()
        };

      case 'UPDATE_SCORE':
        // Ensure score doesn't go negative
                return {
          ...state,
          score: newScore,
          lastSave: Date.now()
        };

      case 'ADD_VISITED_ROOM':
        // Add room to visited list if not already present
        if (state.visitedRooms.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          visitedRooms: [...state.visitedRooms, action.payload]
        };

      case 'ADD_COMMAND_TO_HISTORY':
        // Maintain command history with reasonable limit (last 100 commands)
                if (updatedHistory.length > 100) {
          updatedHistory.shift(); // Remove oldest command
        }
        return {
          ...state,
          commandHistory: updatedHistory,
          lastCommand: action.payload
        };

      case 'ADD_TO_LOG':
        // Maintain game log with reasonable limit (last 500 entries)
                if (updatedLog.length > 500) {
          updatedLog.shift(); // Remove oldest log entry
        }
        return {
          ...state,
          gameLog: updatedLog
        };

      case 'SET_TRANSITIONING':
        return {
          ...state,
          isTransitioning: action.payload.isTransitioning,
          targetRoom: action.payload.targetRoom
        };

      case 'UPDATE_NPC_RELATIONSHIP':
        // Update NPC relationship values (typically -100 to +100)
                return {
          ...state,
          npcRelationships: {
            ...state.npcRelationships,
            [action.payload.npcId]: clampedValue
          },
          lastSave: Date.now()
        };

      case 'ADD_ACHIEVEMENT':
        // Add achievement if not already earned
        if (state.achievements?.includes(action.payload)) {
          return state;
        }
        return {
          ...state,
          achievements: [...(state.achievements || []), action.payload],
          lastSave: Date.now()
        };

      case 'UPDATE_PLAY_TIME':
        return {
          ...state,
          totalPlayTime: (state.totalPlayTime || 0) + action.payload
        };

      default:
        // TypeScript should catch this, but provide runtime safety
        console.warn('[PlayerState] Unknown action type:', (action as any).type);
        return state;
    }
  } catch (error) {
    console.error('[PlayerState] Error in gameStateReducer:', error);
    // Return current state to prevent crashes
    return state;
  }
}

/**
 * Utility functions for working with game state
 */

/**
 * Check if player has a specific item in inventory
 */
export function hasItem(state: GameState, itemId: string): boolean {
  return state.inventory.includes(itemId);
}

/**
 * Check if a flag is set and truthy
 */
export function hasFlag(state: GameState, flagKey: string): boolean {
  return Boolean(state.flags[flagKey]);
}

/**
 * Get flag value with type safety
 */
export function getFlagValue<T = boolean | string | number>(
  state: GameState, 
  flagKey: string, 
  defaultValue?: T
): T {
    return value !== undefined ? (value as T) : (defaultValue as T);
}

/**
 * Check if player has visited a specific room
 */
export function hasVisitedRoom(state: GameState, roomId: string): boolean {
  return state.visitedRooms.includes(roomId);
}

/**
 * Get NPC relationship value
 */
export function getNPCRelationship(state: GameState, npcId: string): number {
  return state.npcRelationships?.[npcId] || 0;
}

/**
 * Calculate total game session time in milliseconds
 */
export function calculateSessionTime(state: GameState): number {
  return Date.now() - state.sessionStart;
}

/**
 * Validate game state integrity
 */
export function validateGameState(state: Partial<GameState>): boolean {
  try {
    // Check required properties
    if (typeof state.playerName !== 'string') return false;
    if (typeof state.currentRoom !== 'string') return false;
    if (!Array.isArray(state.inventory)) return false;
    if (typeof state.flags !== 'object' || state.flags === null) return false;
    if (!Array.isArray(state.visitedRooms)) return false;
    
    // Check numeric values
    if (typeof state.health !== 'number' || state.health < 0 || state.health > 100) return false;
    if (typeof state.score !== 'number' || state.score < 0) return false;
    if (typeof state.level !== 'number' || state.level < 1) return false;
    
    return true;
  } catch (error) {
    console.error('[PlayerState] Error validating game state:', error);
    return false;
  }
}

/**
 * Create a clean save-ready version of game state
 */
export function prepareSaveState(state: GameState): Partial<GameState> {
  const {
    // Remove runtime-only properties
    isTransitioning,
    targetRoom,
    sessionStart,
    ...saveableState
  } = state;
  
  return {
    ...saveableState,
    totalPlayTime: (state.totalPlayTime || 0) + calculateSessionTime(state)
  };
}

/**
 * Merge loaded state with current state safely
 */
export function mergeLoadedState(
  currentState: GameState, 
  loadedState: Partial<GameState>
): GameState {
  // Validate loaded state before merging
  if (!validateGameState(loadedState)) {
    console.warn('[PlayerState] Invalid loaded state, using current state');
    return currentState;
  }
  
  return {
    ...currentState,
    ...loadedState,
    // Reset session-specific properties
    sessionStart: Date.now(),
    isTransitioning: false,
    targetRoom: undefined,
    lastSave: Date.now()
  };

}
