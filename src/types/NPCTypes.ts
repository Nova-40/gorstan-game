// ../types/NPCTypes.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.

export type NPCMood =
  | 'neutral'
  | 'friendly'
  | 'hostile'
  | 'suspicious'
  | 'helpful'
  | 'confused'
  | 'angry'
  | 'sad'
  | 'happy';

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
  shouldBeVisible?: (state: any, room: any) => boolean;
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
  value?: any;
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
  trend: 'improving' | 'declining' | 'stable';
  rate: number;
}
