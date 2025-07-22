import { NPC, NPCMemory, NPCMood } from './NPCTypes';



// NPCTypes.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// NPC memory and behaviour types

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
