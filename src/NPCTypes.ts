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
// Handles NPC logic, memory, or rendering.

export type NPCMood =
  | "neutral"
  | "friendly"
  | "hostile"
  | "suspicious"
  | "helpful"
  | "confused"
  | "angry"
  | "sad"
  | "happy";

export interface NPCMemory {
  readonly interactions: number;
  readonly lastInteraction: number;
  readonly playerActions: readonly string[];
  readonly relationship: number;
  readonly knownFacts: readonly string[];
}

export interface SpecialProperties {
  [key: string]: unknown;
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
