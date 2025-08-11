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
// Game module.

import { Direction, Room, RoomCollection } from './RoomTypes';

import { NPC, NPCMood, NPCMemory } from './NPCTypes';

import { Trap, Puzzle, Miniquest, Achievement, ScoreData } from './GameTypes';























declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}


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






interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_CHEAT_ENABLED: string;
  readonly VITE_GROQ_API_KEY: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}


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






export type GameStage =
  | 'WELCOME'           
  | 'NAME_CAPTURE'      
  | 'GAME'              
  | 'CREDITS'           
  | 'ERROR'             
  | 'LOADING';          


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






export type Severity = 'light' | 'moderate' | 'critical';


export type Type = 'generic' | 'adaptive' | 'environmental' | 'magical';


export interface Definition {
  readonly type: Type;
  readonly severity: Severity;
  readonly disarmable: boolean;
  readonly message: string;
  readonly damage: number;
  readonly autoDisarm: boolean;
  readonly description: string;
}


export interface AnomalyDefinition {
  readonly type: string;
  readonly description: string;
  readonly trigger_chance: number; 
}


export interface VisitNarratives {
  readonly [key: string]: string;
}


export interface AltDescriptions {
  readonly [key: string]: string;
}


export interface SpecialProperties {
  readonly [key: string]: boolean | string | number;
}




















export type ItemCategory =
  | 'tool' | 'weapon' | 'armor' | 'consumable'
  | 'key' | 'document' | 'artifact' | 'misc';


export interface ItemEffect {
  readonly type: string;
  readonly value: number;
  readonly duration?: number;
  readonly message?: string;
}


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


export interface ParsedCommand {
  readonly verb: string;
  readonly object?: string;
  readonly preposition?: string;
  readonly target?: string;
  readonly raw: string;
}






export interface TerminalLine {
  readonly text: string;
  readonly type: 'output' | 'command' | 'error' | 'system' | 'narrative';
  readonly timestamp: number;
  readonly id: string;
}


export interface ConsoleConfig {
  readonly maxLines: number;
  readonly typingSpeed: number;
  readonly showTimestamps: boolean;
  readonly enableSound: boolean;
  readonly theme: string;
}


export interface AylaState {
  readonly active: boolean;
  readonly mood: NPCMood;
  readonly helpLevel: 'minimal' | 'guided' | 'verbose';
  readonly personality: 'formal' | 'casual' | 'mysterious';
  readonly knowledgeLevel: number;
  readonly lastInteraction: number;
}






export interface SaveMetadata {
  readonly timestamp: number;
  readonly playerName: string;
  readonly currentRoom: string;
  readonly turnCount: number;
  readonly score: number;
  readonly version: string;
  readonly checksum: string;
}


export interface SaveFile {
  readonly metadata: SaveMetadata;
  readonly gameState: GameState;
  readonly roomStates?: Readonly<Record<string, SpecialProperties>>;
  readonly npcStates?: Readonly<Record<string, Partial<NPC>>>;
}






export type GameErrorType =
  | 'ROOM_NOT_FOUND'
  | 'INVALID_COMMAND'
  | 'ITEM_NOT_FOUND'
  | 'NPC_NOT_FOUND'
  | 'SAVE_FAILED'
  | 'LOAD_FAILED'
  | 'VALIDATION_ERROR'
  | 'ENGINE_ERROR';


export interface GameError {
  readonly type: GameErrorType;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly recoverable: boolean;
  readonly timestamp: number;
}






export type NonEmptyString = string & { readonly __nonEmpty: true };


export type PartialUpdate<T> = {
  readonly [K in keyof T]?: T[K];
};


export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
