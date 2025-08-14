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
  readonly topic?: string;
  readonly time?: number;
  readonly location?: string;
  readonly id?: string;
  readonly contextTags?: string[];
  readonly emotion?: string;
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

export interface SpecialProperties {
  [key: string]: unknown;
}

export interface NPC {
  id: string;
  name: string;
  location: string;
  personality?: string;
  knowledge?: string[];
  customResponses?: Record<string, string>;
  // Existing/legacy fields for compatibility
  description?: string;
  mood?: NPCMood | string;
  health?: number;
  maxHealth?: number;
  memory?: NPCMemory;
  conversation?: readonly ConversationNode[];
  inventory?: readonly string[];
  flags?: readonly string[];
  special?: SpecialProperties;
  portrait?: string;
  responses?: Record<string, string[]>;
  relationshipLevels?: Record<string, number>;
  questData?: {
    available: string[];
    completed: string[];
    requirements: Record<string, string[]>;
  };
  currentRoom?: string;
  shouldBeVisible?: (
    state: import("../state/gameState").LocalGameState,
    room: import("./Room").Room,
  ) => boolean;
  shouldWander?: boolean;
  canWander?: boolean;
  questOnly?: boolean;
  lastMoved?: number;
  validRooms?: string[];
  biasZones?: string[];
  lastMessage?: string;
  emotion?: string;
  interrupted?: boolean;
  topics?: Array<{ triggers: string[]; response: string }>;
  queryCount?: number;
  trustLevel?: number;
  lastInteraction?: number;
  relationship?: string;
  personalityTraits?: string[];
  preferences?: Record<string, number>;
  memoryCapacity?: number;
  initialized?: boolean;
}

export interface NPCState {
  mood?: string;
  relationship?: number;
  lastInteraction?: number;
  flags?: Record<string, boolean | string | number>;
  [key: string]: unknown;
}

export interface Interaction {
  type: string;
  topic?: string;
  value?: unknown;
}

export interface ResponsePrediction {
  response: string;
  confidence: number;
}

export interface ConversationGoal {
  topic: string;
  desiredOutcome?: string;
}

export interface RelationshipTrend {
  trend: "improving" | "declining" | "stable";
  rate: number;
}
