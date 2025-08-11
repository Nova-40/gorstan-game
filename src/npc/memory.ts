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
// NPC memory management system

export interface ConversationTurn {
  id: string;
  timestamp: number;
  speaker: 'player' | 'npc';
  message: string;
  npcId?: string;
  roomId?: string;
  context?: {
    intent?: string;
    entities?: string[];
    emotional_state?: string;
  };
}

export interface EpisodicMemory {
  id: string;
  timestamp: number;
  event_type: string;
  description: string;
  participants: string[];
  location: string;
  significance: number; // 0-1, how important this memory is
  tags: string[];
}

export interface NPCMemoryState {
  npcId: string;
  conversationBuffer: ConversationTurn[];
  episodicMemories: EpisodicMemory[];
  semanticMemory: Record<string, any>; // Persistent facts
  lastInteraction: number;
  totalInteractions: number;
  relationshipLevel: number; // -1 to 1
  playerPreferences: {
    likes_hints: boolean;
    impatient: boolean;
    explores_thoroughly: boolean;
    asks_for_help: boolean;
  };
}

// Configuration
const CONVERSATION_BUFFER_SIZE = 12;
const EPISODIC_MEMORY_TTL = 24 * 60 * 60 * 1000; // 24 hours
const SEMANTIC_MEMORY_PERSIST_KEYS = [
  'DominicKilled',
  'PlayerMetBefore',
  'ImportantChoicesMade',
  'EthicalStance'
];

// In-memory storage (could be moved to game state)
const npcMemories: Map<string, NPCMemoryState> = new Map();

/**
 * Initialize memory for an NPC
 */
export function initializeNPCMemory(npcId: string): NPCMemoryState {
  const memory: NPCMemoryState = {
    npcId,
    conversationBuffer: [],
    episodicMemories: [],
    semanticMemory: {},
    lastInteraction: 0,
    totalInteractions: 0,
    relationshipLevel: 0,
    playerPreferences: {
      likes_hints: true,
      impatient: false,
      explores_thoroughly: true,
      asks_for_help: false
    }
  };
  
  npcMemories.set(npcId, memory);
  return memory;
}

/**
 * Get memory state for an NPC
 */
export function getNPCMemory(npcId: string): NPCMemoryState {
  if (!npcMemories.has(npcId)) {
    return initializeNPCMemory(npcId);
  }
  return npcMemories.get(npcId)!;
}

/**
 * Add a conversation turn to the buffer
 */
export function addConversationTurn(
  npcId: string,
  speaker: 'player' | 'npc',
  message: string,
  context?: ConversationTurn['context']
): void {
  const memory = getNPCMemory(npcId);
  
  const turn: ConversationTurn = {
    id: `${npcId}-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    speaker,
    message,
    npcId: speaker === 'npc' ? npcId : undefined,
    context
  };
  
  memory.conversationBuffer.push(turn);
  
  // Trim buffer to size
  if (memory.conversationBuffer.length > CONVERSATION_BUFFER_SIZE) {
    memory.conversationBuffer = memory.conversationBuffer.slice(-CONVERSATION_BUFFER_SIZE);
  }
  
  // Update interaction stats
  if (speaker === 'player') {
    memory.lastInteraction = Date.now();
    memory.totalInteractions++;
  }
}

/**
 * Add an episodic memory
 */
export function addEpisodicMemory(
  npcId: string,
  eventType: string,
  description: string,
  participants: string[] = [],
  location: string = '',
  significance: number = 0.5,
  tags: string[] = []
): void {
  const memory = getNPCMemory(npcId);
  
  const episode: EpisodicMemory = {
    id: `${npcId}-${eventType}-${Date.now()}`,
    timestamp: Date.now(),
    event_type: eventType,
    description,
    participants: ['player', ...participants],
    location,
    significance,
    tags
  };
  
  memory.episodicMemories.push(episode);
  
  // Clean up old, low-significance memories
  cleanupEpisodicMemories(npcId);
}

/**
 * Set a semantic memory fact
 */
export function setSemanticMemory(npcId: string, key: string, value: any): void {
  const memory = getNPCMemory(npcId);
  memory.semanticMemory[key] = value;
}

/**
 * Get a semantic memory fact
 */
export function getSemanticMemory(npcId: string, key: string): any {
  const memory = getNPCMemory(npcId);
  return memory.semanticMemory[key];
}

/**
 * Get recent conversation context
 */
export function getRecentConversation(npcId: string, turns: number = 6): ConversationTurn[] {
  const memory = getNPCMemory(npcId);
  return memory.conversationBuffer.slice(-turns);
}

/**
 * Find relevant episodic memories by tags or event type
 */
export function findRelevantMemories(
  npcId: string,
  tags: string[] = [],
  eventTypes: string[] = [],
  maxResults: number = 5
): EpisodicMemory[] {
  const memory = getNPCMemory(npcId);
  
  return memory.episodicMemories
    .filter(episode => {
      const hasMatchingTag = tags.length === 0 || tags.some(tag => episode.tags.includes(tag));
      const hasMatchingEvent = eventTypes.length === 0 || eventTypes.includes(episode.event_type);
      return hasMatchingTag && hasMatchingEvent;
    })
    .sort((a, b) => b.significance - a.significance || b.timestamp - a.timestamp)
    .slice(0, maxResults);
}

/**
 * Update player preference based on behavior
 */
export function updatePlayerPreference(npcId: string, preference: keyof NPCMemoryState['playerPreferences'], value: boolean): void {
  const memory = getNPCMemory(npcId);
  memory.playerPreferences[preference] = value;
}

/**
 * Adjust relationship level
 */
export function adjustRelationship(npcId: string, delta: number): void {
  const memory = getNPCMemory(npcId);
  memory.relationshipLevel = Math.max(-1, Math.min(1, memory.relationshipLevel + delta));
}

/**
 * Clean up old episodic memories
 */
function cleanupEpisodicMemories(npcId: string): void {
  const memory = getNPCMemory(npcId);
  const now = Date.now();
  
  memory.episodicMemories = memory.episodicMemories.filter(episode => {
    const age = now - episode.timestamp;
    const isImportant = episode.significance > 0.7;
    const isRecent = age < EPISODIC_MEMORY_TTL;
    
    return isImportant || isRecent;
  });
}

/**
 * Serialize memory state for game save
 */
export function serializeNPCMemory(npcId: string): any {
  const memory = getNPCMemory(npcId);
  
  return {
    npcId: memory.npcId,
    conversationBuffer: memory.conversationBuffer.slice(-6), // Only recent conversations
    episodicMemories: memory.episodicMemories.filter(e => e.significance > 0.5), // Only important memories
    semanticMemory: Object.fromEntries(
      Object.entries(memory.semanticMemory).filter(([key]) => 
        SEMANTIC_MEMORY_PERSIST_KEYS.includes(key)
      )
    ),
    lastInteraction: memory.lastInteraction,
    totalInteractions: memory.totalInteractions,
    relationshipLevel: memory.relationshipLevel,
    playerPreferences: memory.playerPreferences
  };
}

/**
 * Deserialize memory state from game save
 */
export function deserializeNPCMemory(npcId: string, data: any): void {
  if (!data) {
    initializeNPCMemory(npcId);
    return;
  }
  
  const memory: NPCMemoryState = {
    npcId,
    conversationBuffer: data.conversationBuffer || [],
    episodicMemories: data.episodicMemories || [],
    semanticMemory: data.semanticMemory || {},
    lastInteraction: data.lastInteraction || 0,
    totalInteractions: data.totalInteractions || 0,
    relationshipLevel: data.relationshipLevel || 0,
    playerPreferences: {
      likes_hints: true,
      impatient: false,
      explores_thoroughly: true,
      asks_for_help: false,
      ...data.playerPreferences
    }
  };
  
  npcMemories.set(npcId, memory);
}

/**
 * Get memory summary for context
 */
export function getMemorySummary(npcId: string): {
  recentTopics: string[];
  relationshipStatus: string;
  importantFacts: Record<string, any>;
  playerStyle: string;
} {
  const memory = getNPCMemory(npcId);
  
  // Extract recent topics from conversation
  const recentTopics = memory.conversationBuffer
    .slice(-4)
    .map(turn => turn.context?.entities || [])
    .flat()
    .filter((topic, index, arr) => arr.indexOf(topic) === index)
    .slice(0, 3);
  
  // Determine relationship status
  let relationshipStatus = 'neutral';
  if (memory.relationshipLevel > 0.3) relationshipStatus = 'friendly';
  else if (memory.relationshipLevel > 0.6) relationshipStatus = 'trusted';
  else if (memory.relationshipLevel < -0.3) relationshipStatus = 'suspicious';
  else if (memory.relationshipLevel < -0.6) relationshipStatus = 'hostile';
  
  // Get important semantic facts
  const importantFacts = Object.fromEntries(
    Object.entries(memory.semanticMemory).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  // Determine player style
  const prefs = memory.playerPreferences;
  let playerStyle = 'explorer';
  if (prefs.impatient && !prefs.explores_thoroughly) playerStyle = 'rusher';
  else if (prefs.asks_for_help && prefs.likes_hints) playerStyle = 'guidance_seeker';
  else if (!prefs.likes_hints && prefs.explores_thoroughly) playerStyle = 'independent';
  
  return {
    recentTopics,
    relationshipStatus,
    importantFacts,
    playerStyle
  };
}
