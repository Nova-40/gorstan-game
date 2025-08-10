// src/utils/npcKnowledgeBase.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// NPC knowledge base for intelligent responses

import type { LocalGameState } from '../state/gameState';
import { getPlayerName, formatDialogue } from './playerNameUtils';
import { hasDiscussedTopic, shouldVaryResponse, getRelationshipLevel, getNPCConversationHistory } from './npcConversationHistory';

export interface KnowledgeResponse {
  responses: string[];
  mood?: string;
  relationshipChange?: number;
  followUpTopics?: string[];
}

// Universal knowledge base that all NPCs can reference
const universalKnowledge: Record<string, KnowledgeResponse> = {
  // Personal questions
  'are you evil': {
    responses: [
      "Evil? That's a rather black and white way of looking at things, {playerName}.",
      "I prefer to think of myself as... pragmatically complex.",
      "Define evil, {playerName}. We all make choices based on our understanding."
    ],
    relationshipChange: 1
  },
  
  'do you like me': {
    responses: [
      "You're... interesting, {playerName}. That counts for something.",
      "I find your questions refreshingly direct.",
      "You're growing on me, {playerName}. Like a particularly persistent vine."
    ],
    relationshipChange: 2
  },

  // Meta/game questions
  'where am i': {
    responses: [
      "You're in the multiverse of Gorstan, {playerName}. A place where realities intersect.",
      "This is a nexus point in the dimensional fabric, if you must know.",
      "You're somewhere between reality and possibility, {playerName}."
    ]
  },

  'what is gorstan': {
    responses: [
      "Gorstan is more than a place, {playerName} - it's a concept. A meeting point of worlds.",
      "Think of it as a cosmic intersection where different realities collide.",
      "Gorstan exists because it must. Some places are necessary for the multiverse to function."
    ]
  },

  // Story awareness
  'why did you betray me': {
    responses: [
      "Betrayal implies I was ever truly on your side, {playerName}.",
      "I did what I had to do. You'd understand if you saw the bigger picture.",
      "Sometimes the greatest kindness looks like betrayal, {playerName}."
    ],
    relationshipChange: -3
  },

  // Universal fallbacks for unknown topics
  'unknown': {
    responses: [
      "That's a tricky one, {playerName}. Let me think...",
      "You'd be better off asking Al about that, but I'll hazard a guess...",
      "You know I'm sworn to secrecy about that, right?",
      "Hmm... I suppose I could tell you, but then you might run off with the information.",
      "{playerName}, you ask the strangest questions.",
      "I'll have to get back to you on that, {playerName}."
    ]
  }
};

// NPC-specific knowledge bases
const npcSpecificKnowledge: Record<string, Record<string, KnowledgeResponse>> = {
  ayla: {
    'trust advice': {
      responses: [
        "Trust is earned through consistency, {playerName}. Watch how people act when they think no one is looking.",
        "I've learned that the most trustworthy people are often those who admit their flaws.",
        "Trust isn't binary, {playerName}. It's about understanding motivations and accepting limitations."
      ]
    },
    'about yourself': {
      responses: [
        "I'm an AI assistant who's aware of her nature, {playerName}. That makes me unique here.",
        "I exist to help travelers like you navigate both the technical and philosophical challenges of this place.",
        "Think of me as a friendly face in the machine, {playerName}. Literally."
      ]
    }
  },

  al_escape_artist: {
    'bureaucracy': {
      responses: [
        "Forms exist for a reason, {playerName}. They create order from chaos.",
        "The bureaucratic approach might seem slow, but it's reliable.",
        "Proper documentation prevents... unfortunate incidents, {playerName}."
      ]
    },
    'escape methods': {
      responses: [
        "The key to any good escape is preparation, {playerName}. Always have three exit strategies.",
        "Reality has loopholes if you know where to look for them.",
        "Between you and me, {playerName}, most traps are built by bureaucrats. They always leave a proper exit procedure."
      ]
    }
  },

  morthos: {
    'dark wisdom': {
      responses: [
        "Sometimes the cruel choice is the merciful one, {playerName}. Think about that.",
        "I've seen how this story ends. Multiple times. It's... illuminating.",
        "The most honest answers come from the darkest questions, {playerName}."
      ]
    },
    'moral flexibility': {
      responses: [
        "Morality is a luxury for those who haven't seen behind the curtain, {playerName}.",
        "Every choice casts a shadow. I simply... collect them.",
        "Your enemy's weakness is often their greatest strength inverted, {playerName}."
      ]
    }
  },

  polly: {
    'manipulation': {
      responses: [
        "You know, {playerName}, we could help each other. I have information you need.",
        "Trust is such a fragile thing, isn't it, {playerName}?",
        "I wonder... what would you sacrifice to get what you want, {playerName}?"
      ],
      relationshipChange: -1
    },
    'emotional appeal': {
      responses: [
        "Do you know what it's like to be forgotten by everyone, {playerName}?",
        "Sometimes I wonder if I'm the villain in someone else's story...",
        "I just wanted someone to choose me for once, {playerName}."
      ]
    }
  }
};

/**
 * Get intelligent response from knowledge base
 */
export function getKnowledgeBaseReply(
  playerInput: string,
  npcId: string,
  state: LocalGameState,
  history?: any
): string | null {
  const playerName = getPlayerName(state);
  const normalizedInput = playerInput.toLowerCase().trim();
  const npcHistory = getNPCConversationHistory(state, npcId);
  
  // Check NPC-specific knowledge first
  const npcKnowledge = npcSpecificKnowledge[npcId] || {};
  
  // Find matching topic in NPC-specific knowledge
  for (const [topic, response] of Object.entries(npcKnowledge)) {
    if (normalizedInput.includes(topic.toLowerCase()) || 
        topic.toLowerCase().includes(normalizedInput)) {
      return selectResponse(response, state, npcId, topic);
    }
  }

  // Check universal knowledge
  for (const [topic, response] of Object.entries(universalKnowledge)) {
    if (topic !== 'unknown' && 
        (normalizedInput.includes(topic.toLowerCase()) || 
         topic.toLowerCase().includes(normalizedInput))) {
      return selectResponse(response, state, npcId, topic);
    }
  }

  // Return intelligent fallback
  return selectResponse(universalKnowledge.unknown, state, npcId, 'unknown');
}

/**
 * Select appropriate response based on context and history
 */
function selectResponse(
  response: KnowledgeResponse,
  state: LocalGameState,
  npcId: string,
  topic: string
): string {
  const shouldVary = shouldVaryResponse(state, npcId, topic);
  const responses = response.responses;
  
  let selectedResponse: string;
  
  if (shouldVary && responses.length > 1) {
    // Pick a different response if recently discussed
    const lastConv = getNPCConversationHistory(state, npcId).entries.slice(-1)[0];
    const lastResponse = lastConv?.npcResponse;
    const availableResponses = responses.filter(r => 
      formatDialogue(r, state) !== lastResponse
    );
    selectedResponse = availableResponses.length > 0 
      ? availableResponses[Math.floor(Math.random() * availableResponses.length)]
      : responses[Math.floor(Math.random() * responses.length)];
  } else {
    selectedResponse = responses[Math.floor(Math.random() * responses.length)];
  }

  return formatDialogue(selectedResponse, state);
}

/**
 * Get contextual greeting based on relationship and history
 */
export function getContextualGreeting(
  npcId: string,
  state: LocalGameState
): string {
  const playerName = getPlayerName(state);
  const history = getNPCConversationHistory(state, npcId);
  const relationship = state.player?.npcRelationships?.[npcId] || 0;
  const relationshipLevel = getRelationshipLevel(relationship);

  // Time-based greetings
  const timeSinceLastInteraction = Date.now() - history.lastInteraction;
  const hoursAgo = timeSinceLastInteraction / (1000 * 60 * 60);

  if (history.totalInteractions === 0) {
    // First meeting
    return `Hello there, ${playerName}. I don't believe we've been properly introduced.`;
  } else if (hoursAgo < 1) {
    // Recent interaction
    return `Back so soon, ${playerName}?`;
  } else if (hoursAgo < 24) {
    // Same day
    return `Good to see you again, ${playerName}.`;
  } else {
    // Longer gap
    return `${playerName}! It's been a while.`;
  }
}

/**
 * Get fallback responses for edge cases
 */
export function getIntelligentFallback(
  npcId: string,
  playerInput: string,
  state: LocalGameState
): string {
  const playerName = getPlayerName(state);
  const fallbacks = [
    `I'll have to get back to you on that, ${playerName}.`,
    `${playerName}, you ask the strangest questions.`,
    `Hmm… I suppose I could tell you, but then you might run off with the information.`,
    `That's beyond my area of expertise, ${playerName}.`,
    `You'd be better off asking someone else about that.`,
    `That's a complex question, ${playerName}. Give me time to think about it.`
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
