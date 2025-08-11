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
// Enhanced NPC response system with intelligence and context awareness

import type { LocalGameState } from '../state/gameState';
import { getPlayerName, formatDialogue } from './playerNameUtils';
import { 
  addConversationEntry, 
  getNPCConversationHistory, 
  updateNPCRelationship,
  shouldVaryResponse 
} from './npcConversationHistory';
import { 
  getKnowledgeBaseReply, 
  getContextualGreeting, 
  getIntelligentFallback 
} from './npcKnowledgeBase';
import { groqAI } from '../services/groqAI';

export interface EnhancedNPCResponse {
  text: string;
  mood?: string;
  relationshipChange?: number;
  followUpTopics?: string[];
  context?: Record<string, any>;
}

/**
 * Generate enhanced NPC response with AI and intelligence
 */
export async function getEnhancedNPCResponse(
  npcId: string,
  playerInput: string,
  state: LocalGameState,
  originalResponse?: string
): Promise<EnhancedNPCResponse> {
  
  // Try Groq AI first for dynamic, intelligent responses
  try {
    const aiResponse = await groqAI.generateNPCResponse(npcId, playerInput, state);
    if (aiResponse) {
      console.log(`[Enhanced NPC] 🤖 AI response for ${npcId}`);
      return {
        text: aiResponse,
        mood: detectMoodFromText(aiResponse),
        relationshipChange: calculateAIRelationshipChange(aiResponse),
        followUpTopics: extractTopicsFromResponse(aiResponse),
        context: { source: 'groq-ai', model: 'llama-3.3-70b' }
      };
    }
  } catch (error: any) {
    console.warn(`[Enhanced NPC] AI failed for ${npcId}, using scripted fallback:`, error?.message || 'Unknown error');
  }

  console.log(`[Enhanced NPC] 📜 Scripted response for ${npcId}`);
  
  // Fallback to existing enhanced scripted system
  const playerName = getPlayerName(state);
  const history = getNPCConversationHistory(state, npcId);
  
  // Normalize player input for analysis
  const normalizedInput = playerInput.toLowerCase().trim();
  
  // Determine topic/intent
  const topic = classifyTopic(normalizedInput);
  
  // Check if this is a greeting
  if (isGreeting(normalizedInput)) {
    const greeting = getContextualGreeting(npcId, state);
    return {
      text: greeting,
      mood: 'friendly',
      relationshipChange: 1
    };
  }

  // Try knowledge base first
  const knowledgeResponse = getKnowledgeBaseReply(playerInput, npcId, state, history);
  if (knowledgeResponse) {
    return {
      text: knowledgeResponse,
      mood: getNPCMoodFromResponse(knowledgeResponse),
      relationshipChange: calculateRelationshipChange(topic, npcId)
    };
  }

  // Use original response if provided and enhance it
  if (originalResponse) {
    const enhanced = enhanceOriginalResponse(originalResponse, state, npcId, topic);
    return enhanced;
  }

  // Fall back to intelligent default
  const fallback = getIntelligentFallback(npcId, playerInput, state);
  return {
    text: fallback,
    mood: 'neutral'
  };
}

/**
 * Classify the topic of player input
 */
function classifyTopic(input: string): string {
  const topics = {
    'greeting': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good day'],
    'help': ['help', 'assistance', 'stuck', 'problem', 'hint'],
    'personal': ['are you', 'do you', 'what do you think', 'your opinion'],
    'trust': ['trust', 'believe', 'reliable', 'honest'],
    'story': ['why', 'what happened', 'explain', 'tell me about'],
    'meta': ['game', 'where am i', 'what is this', 'gorstan'],
    'goodbye': ['bye', 'goodbye', 'see you', 'farewell'],
    'question': ['?', 'how', 'when', 'where', 'what', 'who']
  };

  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      return topic;
    }
  }

  return 'general';
}

/**
 * Check if input is a greeting
 */
function isGreeting(input: string): boolean {
  const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good day', 'howdy'];
  return greetings.some(greeting => input.includes(greeting));
}

/**
 * Enhance original response with personalization and context
 */
function enhanceOriginalResponse(
  originalResponse: string,
  state: LocalGameState,
  npcId: string,
  topic: string
): EnhancedNPCResponse {
  let enhanced = formatDialogue(originalResponse, state);
  
  // Add personalization if response doesn't already include player name
  const playerName = getPlayerName(state);
  if (!enhanced.includes(playerName) && Math.random() < 0.3) {
    enhanced = addPersonalTouch(enhanced, playerName);
  }

  // Add context-aware variations
  if (shouldVaryResponse(state, npcId, topic)) {
    enhanced = addVariation(enhanced, npcId, topic);
  }

  return {
    text: enhanced,
    mood: getNPCMoodFromResponse(enhanced),
    relationshipChange: calculateRelationshipChange(topic, npcId)
  };
}

/**
 * Add personal touch to response
 */
function addPersonalTouch(response: string, playerName: string): string {
  const personalTouches = [
    `, ${playerName}`,
    `, ${playerName}.`,
    `. Don't you think, ${playerName}?`,
    `. What do you think, ${playerName}?`,
    `, wouldn't you agree, ${playerName}?`
  ];

  const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
  
  // Add at end of sentence
  if (response.endsWith('.') || response.endsWith('!') || response.endsWith('?')) {
    return response.slice(0, -1) + touch;
  } else {
    return response + touch;
  }
}

/**
 * Add variation to prevent repetitive responses
 */
function addVariation(response: string, npcId: string, topic: string): string {
  const variations = {
    prefix: [
      "As I was saying, ",
      "Like I mentioned before, ",
      "Again, ",
      "To reiterate, ",
      "As I've said, "
    ],
    suffix: [
      " ...or so I believe.",
      " ...at least, that's my view.",
      " ...though you might see it differently.",
      " ...but what do I know?",
      " ...that's just my experience."
    ]
  };

  if (Math.random() < 0.5) {
    const prefix = variations.prefix[Math.floor(Math.random() * variations.prefix.length)];
    return prefix + response.charAt(0).toLowerCase() + response.slice(1);
  } else {
    const suffix = variations.suffix[Math.floor(Math.random() * variations.suffix.length)];
    return response + suffix;
  }
}

/**
 * Determine NPC mood from response content
 */
function getNPCMoodFromResponse(response: string): string {
  const moodIndicators = {
    'friendly': ['hello', 'welcome', 'glad', 'pleased', 'good', 'nice'],
    'helpful': ['help', 'try', 'suggest', 'advice', 'hint'],
    'mysterious': ['secret', 'hidden', 'mystery', 'perhaps', 'maybe'],
    'suspicious': ['careful', 'watch', 'beware', 'danger', 'warning'],
    'amused': ['amusing', 'funny', 'interesting', 'curious', 'strange'],
    'serious': ['important', 'serious', 'must', 'need', 'critical']
  };

  const lowercaseResponse = response.toLowerCase();
  
  for (const [mood, keywords] of Object.entries(moodIndicators)) {
    if (keywords.some(keyword => lowercaseResponse.includes(keyword))) {
      return mood;
    }
  }

  return 'neutral';
}

/**
 * Calculate relationship change based on topic and NPC
 */
function calculateRelationshipChange(topic: string, npcId: string): number {
  const baseChanges: Record<string, number> = {
    'greeting': 1,
    'help': 2,
    'personal': 1,
    'trust': 0,
    'story': 0,
    'meta': -1,
    'goodbye': 0
  };

  const npcModifiers: Record<string, Record<string, number>> = {
    'ayla': {
      'help': 3,
      'trust': 2,
      'personal': 2
    },
    'al_escape_artist': {
      'help': 2,
      'meta': 0,
      'trust': 1
    },
    'morthos': {
      'trust': -1,
      'personal': 2,
      'story': 1
    },
    'polly': {
      'trust': -2,
      'personal': 1,
      'help': -1
    }
  };

  const baseChange = baseChanges[topic] || 0;
  const npcModifier = npcModifiers[npcId]?.[topic] || 0;
  
  return baseChange + npcModifier;
}

/**
 * Detect mood from AI-generated text
 */
function detectMoodFromText(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('!') || lowerText.includes('excited')) return 'excited';
  if (lowerText.includes('*sigh') || lowerText.includes('unfortunately')) return 'sad';
  if (lowerText.includes('*clank') || lowerText.includes('*whirr')) return 'mechanical';
  if (lowerText.includes('careful') || lowerText.includes('warning')) return 'concerned';
  if (lowerText.includes('*laugh') || lowerText.includes('amusing')) return 'amused';
  if (lowerText.includes('formal') || lowerText.includes('procedure')) return 'professional';
  if (lowerText.includes('*gaze') || lowerText.includes('thoughtful')) return 'mysterious';
  return 'neutral';
}

/**
 * Calculate relationship change from AI response content
 */
function calculateAIRelationshipChange(response: string): number {
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes('thank') || lowerResponse.includes('appreciate')) return 2;
  if (lowerResponse.includes('help') || lowerResponse.includes('guide')) return 1;
  if (lowerResponse.includes('welcome') || lowerResponse.includes('glad')) return 1;
  if (lowerResponse.includes('annoying') || lowerResponse.includes('bother')) return -1;
  if (lowerResponse.includes('dangerous') || lowerResponse.includes('threat')) return -2;
  return 0;
}

/**
 * Extract follow-up topics from AI response
 */
function extractTopicsFromResponse(response: string): string[] {
  const topics = [];
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('puzzle') || lowerResponse.includes('solve')) topics.push('puzzles');
  if (lowerResponse.includes('room') || lowerResponse.includes('door')) topics.push('navigation');
  if (lowerResponse.includes('item') || lowerResponse.includes('inventory')) topics.push('items');
  if (lowerResponse.includes('story') || lowerResponse.includes('past')) topics.push('lore');
  if (lowerResponse.includes('help') || lowerResponse.includes('assist')) topics.push('help');
  if (lowerResponse.includes('procedure') || lowerResponse.includes('form')) topics.push('bureaucracy');
  if (lowerResponse.includes('power') || lowerResponse.includes('magic')) topics.push('magic');
  
  return topics;
}
