import { Direction, Room, RoomCollection } from './RoomTypes';

import { NPC, NPCMemory, NPCMood } from './NPCTypes';



// RoomTypes.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Room and navigation-related types

 * Direction types for room navigation
 * Includes standard compass directions and game-specific directions
 */
export type Direction =
  | 'north' | 'south' | 'east' | 'west'
  | 'northeast' | 'northwest' | 'southeast' | 'southwest'
  | 'up' | 'down' | 'in' | 'out'
  | 'jump' | 'portal' | 'climb' | 'swim'
  | 'coffee' | 'chair' | 'green' | 'church' // Game-specific directions
  | string; // Allow custom directions

/**
 * Comprehensive game state interface matching current implementation
 */
export interface GameState {
  // Player identity and progression
  readonly playerName: string;
  readonly currentRoom: string;
  readonly gameStage: GameStage;

  // Player inventory and items
  readonly inventory: readonly string[];
  readonly itemsPickedUp: readonly string[];

  // Game flags and conditions
  readonly flags: Readonly<Record<string, boolean>>;
  readonly roomFlags: Readonly<Record<string, boolean>>;

  // Game history and narrative
  readonly history: readonly string[];
  readonly visitedRooms: readonly string[];
  readonly commandHistory: readonly string[];

  // Game progression tracking
  readonly score: number;
  readonly turnCount: number;
  readonly startTime: number;

  // Debug and development features
  readonly debugMode: boolean;
  readonly cheatEnabled: boolean;

  // Save/load state management
  readonly lastSaved?: number;
  readonly saveSlot?: string;
}
export interface Room {
  // Core identification
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly zone: string;

  // Enhanced descriptions
  readonly lookDescription?: string;
  readonly altDescriptions?: AltDescriptions;

  // Navigation and content
  readonly exits: Readonly<Record<Direction, string>>;
  readonly items: readonly string[];
  readonly npcs: readonly string[];

  // Visual and audio
  readonly image?: string;
  readonly music?: string;
  readonly ambient?: string;

  // Game mechanics
  readonly trap?: Definition;
  readonly flags: readonly string[];
  readonly special?: SpecialProperties;

  // Narrative features
  readonly visitNarratives?: VisitNarratives;
  readonly echoes?: readonly string[];
  readonly moodTag?: string;
  readonly memoryHooks?: readonly string[];
  readonly anomalies?: readonly AnomalyDefinition[];
  readonly microQuestId?: string;
}
export interface RoomCollection {
  readonly [roomId: string]: Room;
}
  Direction,
  GameStage,
  GameAction,
  Room,
  RoomCollection,
  NPC,
  NPCMood,
  NPCMemory,
  Item,
  ItemCategory,
  CommandResult,
  ParsedCommand,
  TerminalLine,
  ConsoleConfig,
  AylaState,
  SaveFile,
  SaveMetadata,
  GameError,
  GameErrorType,
  Definition,
  AnomalyDefinition
};
