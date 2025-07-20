// RoomTypes.ts — types/RoomTypes.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Basic room exits mapping directions to room IDs

// Module: src/types/RoomTypes.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

/**
 * Basic room exits mapping directions to room IDs
 */
export interface RoomExits {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  sit?: string;
  jump?: string;
  up?: string;
  down?: string;
  // Custom exits (portals, secret passages, etc.)
  [customDirection: string]: string | undefined;
}

/**
 * Trap definition for room hazards
 */
export interface TrapDefinition {
  id: string;
  type: 'damage' | 'teleport' | 'item_loss' | 'flag_set' | 'custom';
  severity: 'minor' | 'major' | 'fatal';
  description: string;
  trigger?: 'enter' | 'look' | 'search' | 'item_use' | 'command';
  effect?: {
    damage?: number;
    teleportTo?: string;
    itemsLost?: string[];
    flagsSet?: string[];
    customScript?: string;
  };
  disarmable?: boolean;
  hidden?: boolean;
  disarmSkill?: string;
  disarmDifficulty?: number;
  triggered?: boolean; // Track if trap has been triggered
}

/**
 * Enhanced room event system for scripted behaviors
 */
export interface RoomEvent {
  id: string;
  name?: string;
  trigger: 'enter' | 'exit' | 'look' | 'search' | 'command' | 'item_use' | 'time' | 'flag_check' | 'interact';
  condition?: string | {
    hasItem?: string;
    hasFlag?: string;
    visitCount?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    playerLevel?: number;
    customCondition?: string;
  };
  action: string;
  parameters?: Record<string, unknown>;
  repeatable?: boolean;
  cooldown?: number; // milliseconds
  priority?: number; // execution order
  target?: string; // for interact events
}

/**
 * Room events structure for different triggers
 */
export interface RoomEvents {
  onEnter?: string[];
  onExit?: string[];
  onLook?: string[];
  onSearch?: string[];
  onInteract?: Record<string, string[]>;
  onCommand?: Record<string, string[]>;
  onTime?: Record<string, string[]>;
  onFlag?: Record<string, string[]>;
  [customEvent: string]: string[] | Record<string, string[]> | undefined;
}

/**
 * Interactive element definition
 */
export interface InteractableElement {
  description: string;
  actions: string[];
  requires: string[];
  customActions?: Record<string, string>;
  hidden?: boolean;
  state?: Record<string, unknown>;
}

/**
 * NPC definition for rooms
 */
export interface RoomNPC {
  id: string;
  name: string;
  description: string;
  dialogue?: {
    greeting?: string;
    help?: string;
    farewell?: string;
    [key: string]: string | undefined;
  };
  spawnable?: boolean;
  spawnCondition?: string;
  interactions?: string[];
  flags?: Record<string, boolean>;
}

/**
 * Room atmosphere and mood settings
 */
export interface RoomAtmosphere {
  lighting: 'bright' | 'dim' | 'dark' | 'flickering' | 'magical' | 'emergency_red_and_blue' | 'dim_blue_glow' | 'shifting_and_unstable';
  temperature: 'freezing' | 'cold' | 'cool' | 'warm' | 'hot' | 'scorching' | 'unnaturally_cold' | 'warm_from_electronics';
  humidity?: 'arid' | 'dry' | 'normal' | 'humid' | 'damp' | 'dripping';
  airQuality: 'fresh' | 'stale' | 'smoky' | 'toxic' | 'magical' | 'sterile_with_ozone' | 'oppressive_and_heavy' | 'thick_with_dimensional_energy';
  noise?: 'silent' | 'quiet' | 'normal' | 'noisy' | 'loud' | 'deafening';
  mood?: 'peaceful' | 'tense' | 'mysterious' | 'ominous' | 'chaotic' | 'sacred';
  soundscape?: string[];
  hazards?: string[];
}

/**
 * Room security settings
 */
export interface RoomSecurity {
  level: 'none' | 'low' | 'moderate' | 'high' | 'maximum' | 'restricted' | 'quarantined' | 'transcendent';
  accessRequirements?: string[];
  alarmTriggers?: string[];
  surveillanceActive?: boolean;
  surveillanceType?: string;
}

/**
 * Room environmental details
 */
export interface RoomEnvironmental {
  lighting: string;
  temperature: string;
  airQuality: string;
  soundscape?: string[];
  hazards?: string[];
}

/**
 * Room quest integration
 */
export interface RoomQuests {
  main?: string;
  optional?: string[];
  hidden?: string[];
}

/**
 * Room secrets and hidden content
 */
export interface RoomSecrets {
  [secretId: string]: {
    description: string;
    requirements: string[];
    rewards: string[];
    hidden?: boolean;
  };
}

/**
 * Custom room actions
 */
export interface RoomCustomActions {
  [actionId: string]: {
    description: string;
    requirements: string[];
    effects: string[];
    hidden?: boolean;
  };
}

/**
 * Room entry requirements
 */
export interface RoomRequirements {
  items?: string[];           // Required items
  flags?: string[];           // Required flags
  level?: number;             // Required player level
  quest?: string;             // Required quest completion
}

/**
 * Room metadata for development and tracking
 */
export interface RoomMetadata {
  author?: string;
  version?: string;
  created?: string;
  lastModified?: string;
  tags?: string[];
  notes?: string;
  playTested?: boolean;
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'hard' | 'extreme' | 'disturbing';
  estimatedPlayTime?: string;
  keyFeatures?: string[];
}

/**
 * Core Room interface - the main type exported from this file
 * This is the primary interface that all room files should implement
 */
export interface Room {
  // === CORE IDENTITY (Required) ===
  id: string;                    // Unique room identifier
  title: string;                 // Display name
  zone: string;                  // Zone/area grouping
  description: string | string[]; // Main room description (can be array for paragraphs)

  // === VISUAL & AUDIO ===
  image?: string;                // Room image path
  visualEffect?: string;         // CSS class or effect name
  ambientAudio?: string;         // Ambient sound file
  atmosphere?: RoomAtmosphere;   // Environmental details
  environmental?: RoomEnvironmental; // Environmental settings

  // === NAVIGATION ===
  exits: RoomExits;             // Available exits (can be empty object)
  hiddenExits?: RoomExits;      // Secret or conditional exits

  // === CONTENT ===
  items?: string[];             // Items present in room
  npcs?: string[] | RoomNPC[];  // NPCs present in room
  furniture?: string[];         // Furniture/objects for interaction
  containers?: string[];        // Searchable containers
  interactables?: Record<string, InteractableElement>; // Interactive elements

  // === NARRATIVE ===
  entryText?: string;           // Text shown on first entry
  lookDescription?: string;     // Extended description from 'look' command
  searchDescription?: string;   // Description from 'search' command
  altDescriptions?: Record<string, string>; // Conditional descriptions
  visitNarratives?: Record<string, string>; // Visit-based narrative changes
  consoleIntro?: string[];      // Console/system introduction text

  // === GAME STATE ===
  flags?: Record<string, boolean> | string[]; // Room state flags
  requirements?: RoomRequirements; // Entry requirements
  
  // === INTERACTIVE ELEMENTS ===
  traps?: TrapDefinition[];     // Room hazards
  events?: RoomEvents;          // Scripted behaviors
  interactions?: Record<string, string>; // Custom interaction responses

  // === ATMOSPHERIC DETAILS ===
  echoes?: string[];            // Ambient text snippets
  memoryHooks?: string[];       // Narrative memory triggers
  timeVariations?: Record<string, Partial<Room>>; // Time-based changes

  // === QUEST INTEGRATION ===
  microQuestId?: string;        // Associated micro-quest
  questFlags?: string[];        // Quest-specific flags
  questRequirements?: string[]; // Quest prerequisites
  quests?: RoomQuests;          // Quest integration

  // === SECURITY & ACCESS ===
  security?: RoomSecurity;      // Security settings

  // === SECRETS & HIDDEN CONTENT ===
  secrets?: RoomSecrets;        // Hidden secrets and discoveries

  // === CUSTOM ACTIONS ===
  customActions?: RoomCustomActions; // Room-specific actions

  // === TECHNICAL ===
  special?: Record<string, unknown>; // Custom properties
  metadata?: RoomMetadata;      // Development metadata
}

/**
 * Room definition type alias for consistency with existing code
 */
export type RoomDefinition = Room;

/**
 * Extended room data used by the editor
 * Includes additional editor-specific properties
 */
export interface RoomData extends Room {
  // Editor-specific properties
  editHistory?: {
    lastModified: Date;
    modifiedBy: string;
    changeLog: string[];
  };
  
  // Validation status
  validationStatus?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: Date;
  };
}

/**
 * Validation interfaces
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Type guards for runtime type checking
 */
export function isRoom(obj: unknown): obj is Room {
  if (!obj || typeof obj !== 'object') return false;
  
  const room = obj as Room;
  return (
    typeof room.id === 'string' &&
    typeof room.title === 'string' &&
    typeof room.zone === 'string' &&
    (typeof room.description === 'string' || Array.isArray(room.description)) &&
    typeof room.exits === 'object' &&
    room.exits !== null
  );
}

export function isRoomData(obj: unknown): obj is RoomData {
  return isRoom(obj);
}

/**
 * Helper function to create a basic room template
 */
export function createEmptyRoom(id: string, zone: string): Room {
  return {
    id,
    title: 'Untitled Room',
    zone,
    description: '',
    exits: {},
    items: [],
    npcs: [],
    flags: {},
    metadata: {
      author: 'Unknown',
      version: '1.0.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: []
    }
  };
}

/**
 * Constants for common room properties
 */
export const COMMON_EXITS = ['north', 'south', 'east', 'west', 'up', 'down'] as const;
export const LIGHTING_TYPES = ['bright', 'dim', 'dark', 'flickering', 'magical'] as const;
export const SECURITY_LEVELS = ['none', 'low', 'moderate', 'high', 'maximum'] as const;
export const DIFFICULTY_LEVELS = ['easy', 'moderate', 'challenging', 'hard', 'extreme'] as const;
export const EVENT_TRIGGERS = ['enter', 'exit', 'look', 'search', 'interact', 'command'] as const;

// Re-export the main Room interface as the default export
export default Room;

// Export type for easier importing
export type { Room as RoomType };
