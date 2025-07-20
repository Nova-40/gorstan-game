// types.d.ts — types.d.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Type-safe JSON module declaration

// Module: src/types.d.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

/// <reference types="react" />
/// <reference types="vite/client" />

// =============================================================================
// MODULE DECLARATIONS
// =============================================================================

/**
 * Type-safe JSON module declaration
 * Replaces generic 'any' with proper typing for JSON imports
 */
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

/**
 * Image module declarations for game assets
 */
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

/**
 * Audio module declarations for game music and sound effects
 */
declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}

declare module "*.ogg" {
  const src: string;
  export default src;
}

// =============================================================================
// VITE & ENVIRONMENT TYPES
// =============================================================================

/**
 * Enhanced Vite environment interface with game-specific variables
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_CHEAT_ENABLED: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

/**
 * Enhanced ImportMeta interface with Vite-specific features
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: Record<string, unknown>;
    accept(): void;
    accept(cb: (mod: unknown) => void): void;
    accept(dep: string, cb: (mod: unknown) => void): void;
    accept(deps: readonly string[], cb: (mods: unknown[]) => void): void;
    dispose(cb: (data: Record<string, unknown>) => void): void;
    decline(): void;
    invalidate(): void;
  };
  readonly glob: (
    pattern: string,
    options?: { eager?: boolean; as?: string }
  ) => Record<string, () => Promise<unknown>>;
  readonly globEager: (pattern: string) => Record<string, unknown>;
}

// =============================================================================
// CORE GAME TYPES
// =============================================================================

/**
 * Game stage constants for application flow control
 */
export type GameStage = 
  | 'WELCOME'           // Initial welcome screen
  | 'NAME_CAPTURE'      // Player name input
  | 'GAME'              // Main game loop
  | 'CREDITS'           // End credits
  | 'ERROR'             // Error state
  | 'LOADING';          // Loading state

/**
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

/**
 * Game actions for state reducer
 */
export type GameAction =
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_CURRENT_ROOM'; payload: string }
  | { type: 'SET_GAME_STAGE'; payload: GameStage }
  | { type: 'ADD_TO_INVENTORY'; payload: string }
  | { type: 'REMOVE_FROM_INVENTORY'; payload: string }
  | { type: 'SET_FLAG'; payload: { flag: string; value: boolean } }
  | { type: 'SET_ROOM_FLAG'; payload: { room: string; flag: string; value: boolean } }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'ADD_VISITED_ROOM'; payload: string }
  | { type: 'ADD_COMMAND'; payload: string }
  | { type: 'INCREMENT_SCORE'; payload: number }
  | { type: 'INCREMENT_TURN' }
  | { type: 'TOGGLE_DEBUG' }
  | { type: 'TOGGLE_CHEAT' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_SAVE'; payload: Partial<GameState> };

// =============================================================================
// ROOM SYSTEM TYPES
// =============================================================================

/**
 * Trap severity levels for damage calculation
 */
export type TrapSeverity = 'light' | 'moderate' | 'critical';

/**
 * Trap types for different mechanisms
 */
export type TrapType = 'generic' | 'adaptive' | 'environmental' | 'magical';

/**
 * Current trap system definition matching room implementations
 */
export interface TrapDefinition {
  readonly type: TrapType;
  readonly severity: TrapSeverity;
  readonly disarmable: boolean;
  readonly message: string;
  readonly damage: number;
  readonly autoDisarm: boolean;
  readonly description: string;
}

/**
 * Dynamic content anomaly for procedural events
 */
export interface AnomalyDefinition {
  readonly type: string;
  readonly description: string;
  readonly trigger_chance: number; // 0.0 to 1.0
}

/**
 * Progressive storytelling narratives
 */
export interface VisitNarratives {
  readonly [key: string]: string;
}

/**
 * Contextual room descriptions
 */
export interface AltDescriptions {
  readonly [key: string]: string;
}

/**
 * Room-specific special properties
 */
export interface SpecialProperties {
  readonly [key: string]: boolean | string | number;
}

/**
 * Comprehensive room definition matching current zone implementations
 */
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
  readonly trap?: TrapDefinition;
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

/**
 * Room collection by zone
 */
export interface RoomCollection {
  readonly [roomId: string]: Room;
}

// =============================================================================
// NPC SYSTEM TYPES
// =============================================================================

/**
 * NPC emotional states for dynamic interaction
 */
export type NPCMood = 
  | 'neutral' | 'friendly' | 'hostile' | 'suspicious'
  | 'helpful' | 'confused' | 'angry' | 'sad' | 'happy';

/**
 * NPC memory system for tracking player interactions
 */
export interface NPCMemory {
  readonly interactions: number;
  readonly lastInteraction: number;
  readonly playerActions: readonly string[];
  readonly relationship: number; // -100 to 100
  readonly knownFacts: readonly string[];
}

/**
 * NPC conversation tree node
 */
export interface ConversationNode {
  readonly id: string;
  readonly text: string;
  readonly responses?: readonly {
    readonly text: string;
    readonly nextId?: string;
    readonly action?: string;
    readonly condition?: string;
  }[];
  readonly condition?: string;
  readonly action?: string;
}

/**
 * Complete NPC definition
 */
export interface NPC {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly mood: NPCMood;
  readonly health: number;
  readonly maxHealth: number;
  readonly memory: NPCMemory;
  readonly conversation?: readonly ConversationNode[];
  readonly inventory: readonly string[];
  readonly flags: readonly string[];
  readonly special?: SpecialProperties;
}

// =============================================================================
// ITEM SYSTEM TYPES
// =============================================================================

/**
 * Item categories for organization and mechanics
 */
export type ItemCategory = 
  | 'tool' | 'weapon' | 'armor' | 'consumable' 
  | 'key' | 'document' | 'artifact' | 'misc';

/**
 * Item use effects and consequences
 */
export interface ItemEffect {
  readonly type: string;
  readonly value: number;
  readonly duration?: number;
  readonly message?: string;
}

/**
 * Complete item definition
 */
export interface Item {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ItemCategory;
  readonly weight: number;
  readonly value: number;
  readonly usable: boolean;
  readonly consumable: boolean;
  readonly effects?: readonly ItemEffect[];
  readonly requirements?: readonly string[];
  readonly flags: readonly string[];
  readonly special?: SpecialProperties;
}

// =============================================================================
// COMMAND SYSTEM TYPES
// =============================================================================

/**
 * Command result for game engine processing
 */
export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly newRoom?: string;
  readonly itemsAdded?: readonly string[];
  readonly itemsRemoved?: readonly string[];
  readonly flagsSet?: Readonly<Record<string, boolean>>;
  readonly score?: number;
  readonly gameOver?: boolean;
  readonly special?: SpecialProperties;
}

/**
 * Command parser result
 */
export interface ParsedCommand {
  readonly verb: string;
  readonly object?: string;
  readonly preposition?: string;
  readonly target?: string;
  readonly raw: string;
}

// =============================================================================
// UI & COMPONENT TYPES
// =============================================================================

/**
 * Terminal output line for the game console
 */
export interface TerminalLine {
  readonly text: string;
  readonly type: 'output' | 'command' | 'error' | 'system' | 'narrative';
  readonly timestamp: number;
  readonly id: string;
}

/**
 * Game console configuration
 */
export interface ConsoleConfig {
  readonly maxLines: number;
  readonly typingSpeed: number;
  readonly showTimestamps: boolean;
  readonly enableSound: boolean;
  readonly theme: string;
}

/**
 * Ayla AI assistant state and configuration
 */
export interface AylaState {
  readonly active: boolean;
  readonly mood: NPCMood;
  readonly helpLevel: 'minimal' | 'guided' | 'verbose';
  readonly personality: 'formal' | 'casual' | 'mysterious';
  readonly knowledgeLevel: number;
  readonly lastInteraction: number;
}

// =============================================================================
// SAVE/LOAD SYSTEM TYPES
// =============================================================================

/**
 * Save file metadata
 */
export interface SaveMetadata {
  readonly timestamp: number;
  readonly playerName: string;
  readonly currentRoom: string;
  readonly turnCount: number;
  readonly score: number;
  readonly version: string;
  readonly checksum: string;
}

/**
 * Complete save file structure
 */
export interface SaveFile {
  readonly metadata: SaveMetadata;
  readonly gameState: GameState;
  readonly roomStates?: Readonly<Record<string, SpecialProperties>>;
  readonly npcStates?: Readonly<Record<string, Partial<NPC>>>;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

/**
 * Game-specific error types
 */
export type GameErrorType = 
  | 'ROOM_NOT_FOUND'
  | 'INVALID_COMMAND'
  | 'ITEM_NOT_FOUND'
  | 'NPC_NOT_FOUND'
  | 'SAVE_FAILED'
  | 'LOAD_FAILED'
  | 'VALIDATION_ERROR'
  | 'ENGINE_ERROR';

/**
 * Structured game error
 */
export interface GameError {
  readonly type: GameErrorType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
  readonly timestamp: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Non-empty string for required fields
 */
export type NonEmptyString = string & { readonly __nonEmpty: true };

/**
 * Utility type for partial updates
 */
export type PartialUpdate<T> = {
  readonly [K in keyof T]?: T[K];
};

/**
 * Utility type for required fields
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// =============================================================================
// EXPORTS FOR MODULE INTEGRATION
// =============================================================================

export type {
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
  TrapDefinition,
  AnomalyDefinition
};
