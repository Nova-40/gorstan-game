// Module: src/types/GameTypes.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import type { Room } from './Room';

/**
 * Core player interface with all essential properties
 */
export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth?: number;
  score?: number;
  inventory: string[];
  traits?: string[];
  flags?: Record<string, boolean | number | string>;
  npcRelationships?: Record<string, number>;
  reputation?: Record<string, number>;
  currentRoom?: string;
  visitedRooms?: string[];
  playTime?: number;
  lastSave?: string;
  level?: number;
  experience?: number;
}

/**
 * Extended player state for gameplay systems
 */
export interface PlayerState extends Player {
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  charisma?: number;
  statusEffects?: Array<{
    id: string;
    name: string;
    duration: number;
    effect: Record<string, unknown>;
  }>;
  activeQuests?: string[];
  completedQuests?: string[];
  questProgress?: Record<string, unknown>;
  skills?: Record<string, number>;
  achievements?: string[];
  statistics?: Record<string, number>;
}

export interface GameMessage {
  id: string;
  text: string;
  type: 'narrative' | 'action' | 'dialogue' | 'system' | 'error' | 'warning' | 'success' | 'achievement';
  timestamp: number;
  speaker?: string;
  metadata?: Record<string, unknown>;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  autoSave: boolean;
  autoSaveInterval: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  textSpeed: number;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'auto';
  debugMode: boolean;
  fullscreen: boolean;
  cheatMode: boolean;
}

export interface GameActionContext {
  currentRoomId: string;
  playerState: Player;
  inventory: string[];
  traits: string[];
  flags: Record<string, boolean | number | string>;
  npcsInRoom: string[];
  name?: string;
  health?: number;
  topic?: string;
  playerResponse?: string;
  timestamp: number;
  command?: string;
  args?: string[];
  roomHistory?: string[];
  gameState?: Partial<GameState>;
}

export type GameAction =
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'SET_PLAYER_HEALTH'; payload: number }
  | { type: 'HEAL_PLAYER'; payload: number }
  | { type: 'DAMAGE_PLAYER'; payload: number }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'RESET_SCORE' }
  | { type: 'UPDATE_CODEX_ENTRY'; payload: { itemId: string; entry: any; isFirstDiscovery: boolean } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_INVENTORY'; payload: string[] }
  | { type: 'CLEAR_INVENTORY' }
  | { type: 'CHANGE_ROOM'; payload: string }
  | { type: 'SET_CURRENT_ROOM'; payload: string }
  | { type: 'ADD_VISITED_ROOM'; payload: string }
  | { type: 'SET_FLAG'; payload: { key: string; value: boolean | number | string } }
  | { type: 'CLEAR_FLAG'; payload: string }
  | { type: 'SET_FLAGS'; payload: Record<string, boolean | number | string> }
  | { type: 'SET_NPCS_IN_ROOM'; payload: string[] }
  | { type: 'ADD_NPC_TO_ROOM'; payload: string }
  | { type: 'REMOVE_NPC_FROM_ROOM'; payload: string }
  | { type: 'UPDATE_NPC_RELATIONSHIP'; payload: { npc: string; value: number } }
  | { type: 'ADD_TRAIT'; payload: string }
  | { type: 'REMOVE_TRAIT'; payload: string }
  | { type: 'SET_TRAITS'; payload: string[] }
  | { type: 'ADD_MESSAGE'; payload: GameMessage }
  | { type: 'PRESS_BLUE_BUTTON' }
  | { type: 'START_MULTIVERSE_REBOOT' }
  | { type: 'SHOW_RESET_SEQUENCE' }
  | { type: 'ADD_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_HISTORY'; payload: GameMessage[] }
  | { type: 'START_QUEST'; payload: string }
  | { type: 'COMPLETE_QUEST'; payload: string }
  | { type: 'UPDATE_QUEST_PROGRESS'; payload: { quest: string; progress: unknown } }
  | { type: 'RESET' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SAVE_GAME' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'ENABLE_DEBUG_MODE' }
  | { type: string; payload?: unknown };

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
  context: GameActionContext;
  data?: Record<string, unknown>;
  processed?: boolean;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  messages?: GameMessage[];
  newState?: Partial<GameState>;
  events?: GameEvent[];
  redirect?: string;
  delay?: number;
}

export interface CommandHandler {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  handler: (context: GameActionContext, args: string[]) => Promise<CommandResult> | CommandResult;
  requiresArgs?: boolean;
  minArgs?: number;
  maxArgs?: number;
  category?: 'movement' | 'interaction' | 'inventory' | 'system' | 'social' | 'combat';
}

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum?: string;
  metadata: {
    playerName: string;
    currentRoom: string;
    playTime: number;
    saveSlot?: number;
    description?: string;
  };
}

export interface GameConfig {
  title: string;
  version: string;
  author: string;
  description: string;
  startingRoom: string;
  startingPlayer: Partial<Player>;
  defaultSettings: GameSettings;
  features: {
    autoSave: boolean;
    quickSave: boolean;
    multipleSlots: boolean;
    achievements: boolean;
    statistics: boolean;
    relationships: boolean;
  };
  limits: {
    maxInventorySize: number;
    maxHistorySize: number;
    maxSaveSlots: number;
    maxPlayerNameLength: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function isPlayer(obj: unknown): obj is Player {
  if (!obj || typeof obj !== 'object') return false;
  const player = obj as Player;
  return (
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    typeof player.health === 'number' &&
    Array.isArray(player.inventory)
  );
}

export function isGameState(obj: unknown): obj is GameState {
  if (!obj || typeof obj !== 'object') return false;
  return (
    isPlayer((obj as any).player) &&
    typeof (obj as any).currentRoomId === 'string' &&
    Array.isArray((obj as any).history) &&
    typeof (obj as any).flags === 'object'
  );
}

export function isGameMessage(obj: unknown): obj is GameMessage {
  if (!obj || typeof obj !== 'object') return false;
  return (
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).text === 'string' &&
    typeof (obj as any).type === 'string' &&
    typeof (obj as any).timestamp === 'number'
  );
}

export const GameUtils = {
  createDefaultPlayer(): Player {
    return {
      id: 'player_' + Date.now(),
      name: 'Player',
      health: 100,
      inventory: [],
    };
  },

  createDefaultGameState(config?: Partial<GameConfig>): GameState {
    return {
      stage: 'main',
      player: GameUtils.createDefaultPlayer(),
      currentRoomId: config?.startingRoom || 'start',
      history: [],
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
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 300000,
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true,
        textSpeed: 50,
        fontSize: 'medium',
        theme: 'auto',
        debugMode: false,
        fullscreen: false,
        cheatMode: false,
      },
      metadata: {
        version: '6.1.0',
        playTime: 0,
        resetCount: 0,
        lastSaved: null,
      },
      roomMap: {},
    };
  },

  validatePlayer(player: unknown): ValidationResult {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    if (!isPlayer(player)) {
      result.isValid = false;
      result.errors.push('Invalid player object structure');
      return result;
    }
    if (player.health < 0) {
      result.warnings.push('Player health is negative');
    }
    if (player.health > (player.maxHealth || 100)) {
      result.warnings.push('Player health exceeds maximum');
    }
    if (player.inventory.length > 100) {
      result.warnings.push('Player inventory is very large');
    }
    return result;
  },
};

export const GAME_CONSTANTS = {
  MAX_INVENTORY_SIZE: 100,
  MAX_HISTORY_SIZE: 500,
  DEFAULT_PLAYER_HEALTH: 100,
  DEFAULT_DIFFICULTY: 'normal',
  DEFAULT_THEME: 'auto',
} as const;

export type MessageType = GameMessage['type'];
export type Difficulty = GameSettings['difficulty'];
export type Theme = GameSettings['theme'];
export type FontSize = GameSettings['fontSize'];

export interface GameMetadata {
  version: string;
  playTime: number;
  lastSaved?: number | null;
  resetCount: number;
  achievements?: string[];
}

export type GameTransition = 'jump' | 'wait' | 'sip' | null;

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
  startTime: number;
  currentTime: number;
  timeScale: number;
}

// ...existing code...

export interface GameState {
  stage: string;
  transition?: GameTransition | null;
  player: Player;
  history: GameMessage[];
  currentRoomId: string;
  // PATCH: flags now explicitly includes triggerResetEscalation as optional boolean
  flags: {
    resetButtonPressCount?: number;
    triggerResetEscalation?: boolean;
    [key: string]: boolean | number | string | undefined;
  };
  npcsInRoom: string[];
  roomVisitCount: Record<string, number>;
  gameTime: GameTime;
  settings: GameSettings;
  metadata: GameMetadata;
  roomMap: Record<string, Room>;
}

// ...existing code...

export interface GameFlags {
  resetButtonPressCount?: number;
  triggerResetEscalation?: boolean;
  // Add any additional flags below
  [key: string]: any;
}
export interface GameStateWithFlags extends GameState {
  flags: GameFlags;
}