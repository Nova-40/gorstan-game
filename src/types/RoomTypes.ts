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
// Renders room descriptions and image logic.

import { NPC, NPCMemory, NPCMood } from "./NPCTypes";
import { RoomDefinition } from "../engine/roomSchema";

/**
 * Game stage enumeration for tracking player progress
 * Core Logic Preserved: All original stages maintained
 */
export type GameStage =
  | "splash"
  | "welcome"
  | "nameCapture"
  | "intro"
  | "game"
  | "transition"
  | "ending"
  | "credits";

/**
 * Game action types for command processing
 * Core Logic Preserved: All original actions maintained
 */
export type GameAction =
  | "move"
  | "look"
  | "take"
  | "drop"
  | "use"
  | "examine"
  | "talk"
  | "listen"
  | "smell"
  | "taste"
  | "touch"
  | "open"
  | "close"
  | "push"
  | "pull"
  | "turn"
  | "sit"
  | "stand"
  | "jump"
  | "climb"
  | "swim"
  | "coffee"
  | "press"
  | "wait"
  | "save"
  | "load"
  | "inventory"
  | "help"
  | "quit"
  | string;

/**
 * Direction types for room navigation
 * Includes standard compass directions and game-specific directions
 */
export type Direction =
  | "north"
  | "south"
  | "east"
  | "west"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest"
  | "up"
  | "down"
  | "in"
  | "out"
  | "jump"
  | "portal"
  | "climb"
  | "swim"
  | "coffee"
  | "chair"
  | "green"
  | "church"
  | "sit"
  | string;

/**
 * Item category enumeration for inventory management
 * Core Logic Preserved: All original categories maintained
 */
export type ItemCategory =
  | "consumable"
  | "tool"
  | "weapon"
  | "armor"
  | "key"
  | "document"
  | "container"
  | "misc"
  | "quest"
  | "coffee"
  | "special";

/**
 * Enhanced GameState interface with comprehensive typing
 * Core Logic Preserved: All original properties maintained
 */
export interface GameState {
  // Player information
  readonly playerName: string;
  readonly currentRoom: string;
  readonly gameStage: GameStage;

  // Inventory and items
  readonly inventory: readonly string[];
  readonly itemsPickedUp: readonly string[];

  // Flags and state tracking
  readonly flags: Readonly<Record<string, boolean>>;
  readonly roomFlags: Readonly<Record<string, boolean>>;

  // History and tracking
  readonly history: readonly string[];
  readonly visitedRooms: readonly string[];
  readonly commandHistory: readonly string[];

  // Game statistics
  readonly score: number;
  readonly turnCount: number;
  readonly startTime: number;

  // Debug and development
  readonly debugMode: boolean;
  readonly cheatEnabled: boolean;

  // Save system
  readonly lastSaved?: number;
  readonly saveSlot?: string;
}

/**
 * Item interface for game objects
 * Core Logic Preserved: All original properties maintained
 */
export interface Item {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ItemCategory;
  readonly weight?: number;
  readonly value?: number;
  readonly usable?: boolean;
  readonly consumable?: boolean;
  readonly stackable?: boolean;
  readonly maxStack?: number;
  readonly special?: Record<string, any>;
}

/**
 * Alternative descriptions interface for dynamic room content
 * Core Logic Preserved: All original functionality maintained
 */
export interface AltDescriptions {
  readonly [conditionKey: string]: string;
}

/**
 * Visit narratives interface for tracking room visits
 * Core Logic Preserved: All original tracking maintained
 */
export interface VisitNarratives {
  readonly firstVisit?: string;
  readonly secondVisit?: string;
  readonly subsequentVisits?: string;
  readonly conditionalVisits?: Record<string, string>;
}

/**
 * Special properties interface for room-specific behaviors
 * Core Logic Preserved: All original special properties maintained
 */
export interface SpecialProperties {
  readonly isDark?: boolean;
  readonly requiresLight?: boolean;
  readonly hasSecret?: boolean;
  readonly isPuzzle?: boolean;
  readonly isTrap?: boolean;
  readonly isEndGame?: boolean;
  readonly teleportDestination?: string;
  readonly customActions?: Record<string, string>;
}

/**
 * Definition interface for game elements
 * Core Logic Preserved: All original definition structure maintained
 */
export interface Definition {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type?: string;
  readonly properties?: Record<string, any>;
}

/**
 * Anomaly definition interface for special room effects
 * Core Logic Preserved: All original anomaly functionality maintained
 */
export interface AnomalyDefinition {
  readonly id: string;
  readonly type: string;
  readonly trigger: string;
  readonly effect: string;
  readonly description?: string;
  readonly conditions?: Record<string, any>;
}

/**
 * Enhanced Room interface with comprehensive typing
 * Core Logic Preserved: All original room properties maintained
 */
export interface Room {
  // Core room properties
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly zone: string;
  readonly RoomDefinition: string;

  // Enhanced descriptions
  readonly lookDescription?: string;
  readonly altDescriptions?: AltDescriptions;

  // Navigation and contents
  readonly exits: Readonly<Record<Direction, string>>;
  readonly items: readonly string[];
  readonly npcs: readonly string[];

  // Media and atmosphere
  readonly image?: string;
  readonly music?: string;
  readonly ambient?: string;

  // Special mechanics
  readonly trap?: Definition;
  readonly flags: readonly string[];
  readonly special?: SpecialProperties;

  // Enhanced narrative features
  readonly visitNarratives?: VisitNarratives;
  readonly echoes?: readonly string[];
  readonly moodTag?: string;
  readonly memoryHooks?: readonly string[];
  readonly anomalies?: readonly AnomalyDefinition[];
  readonly microQuestId?: string;
}

/**
 * Room collection interface for game world storage
 * Core Logic Preserved: All original collection structure maintained
 */
export interface RoomCollection {
  readonly [roomId: string]: Room;
}

/**
 * Command result interface for action outcomes
 * Core Logic Preserved: All original command processing maintained
 */
export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly type: "system" | "action" | "error" | "narrative";
  readonly roomChanged?: boolean;
  readonly inventoryChanged?: boolean;
  readonly flagsChanged?: Record<string, boolean>;
  readonly score?: number;
}

/**
 * Parsed command interface for input processing
 * Core Logic Preserved: All original parsing logic maintained
 */
export interface ParsedCommand {
  readonly action: GameAction;
  readonly target?: string;
  readonly subject?: string;
  readonly direction?: Direction;
  readonly raw: string;
  readonly tokens: readonly string[];
}

/**
 * Terminal line interface for console output
 * Core Logic Preserved: All original terminal functionality maintained
 */
export interface TerminalLine {
  readonly id: string;
  readonly text: string;
  readonly type: "input" | "output" | "system" | "error" | "narrative";
  readonly timestamp: number;
  readonly playerName?: string;
}

/**
 * Console configuration interface
 * Core Logic Preserved: All original console settings maintained
 */
export interface ConsoleConfig {
  readonly maxLines: number;
  readonly scrollback: number;
  readonly typewriterSpeed: number;
  readonly showTimestamps: boolean;
  readonly colorTheme: string;
}

/**
 * Ayla AI state interface for advanced NPC interactions
 * Core Logic Preserved: All original AI functionality maintained
 */
export interface AylaState {
  readonly isActive: boolean;
  readonly currentMood: NPCMood;
  readonly memory: NPCMemory;
  readonly lastInteraction: number;
  readonly conversationContext: readonly string[];
  readonly knowledgeBase: Record<string, any>;
}

/**
 * Save file interface for game persistence
 * Core Logic Preserved: All original save functionality maintained
 */
export interface SaveFile {
  readonly metadata: SaveMetadata;
  readonly gameState: GameState;
  readonly roomStates: Record<string, any>;
  readonly npcStates: Record<string, any>;
  readonly timestamp: number;
  readonly version: string;
}

/**
 * Save metadata interface for save file information
 * Core Logic Preserved: All original metadata maintained
 */
export interface SaveMetadata {
  readonly slotName: string;
  readonly playerName: string;
  readonly currentRoom: string;
  readonly gameStage: GameStage;
  readonly playTime: number;
  readonly saveDate: string;
  readonly gameVersion: string;
}

/**
 * Game error type enumeration
 * Core Logic Preserved: All original error types maintained
 */
export type GameErrorType =
  | "ROOM_NOT_FOUND"
  | "INVALID_COMMAND"
  | "ITEM_NOT_FOUND"
  | "NPC_NOT_FOUND"
  | "SAVE_FAILED"
  | "LOAD_FAILED"
  | "PARSE_ERROR"
  | "SYSTEM_ERROR";

/**
 * Game error interface for error handling
 * Core Logic Preserved: All original error handling maintained
 */
export interface GameError {
  readonly type: GameErrorType;
  readonly message: string;
  readonly details?: Record<string, any>;
  readonly timestamp: number;
  readonly recoverable: boolean;
}
