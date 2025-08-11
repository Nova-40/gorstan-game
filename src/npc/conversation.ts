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
// Conversation orchestration and natural dialogue features

import { generateNPCReply } from './respond';
import { classifyIntent } from './intent';
import { getContextSnapshot } from './context';
import { 
  getNPCMemory, 
  addConversationTurn, 
  updatePlayerPreference, 
  NPCMemoryState 
} from './memory';
import { getPersona } from './personas';
import { 
  checkProactivePrompts, 
  clearPrompt, 
  ProactivePrompt 
} from './proactive';

export interface ConversationFeatures {
  microHedges: boolean;
  selfCorrection: boolean;
  memoryHooks: boolean;
  emotionalTemperature: boolean;
  contextualPrompting: boolean;
}

export interface ConversationResponse {
  message: string;
  features: {
    hasHedging: boolean;
    hasCorrection: boolean;
    hasMemoryReference: boolean;
    emotionalTone: string;
    confidence: number;
  };
  followUpPrompts?: string[];
  proactiveUpdate?: ProactivePrompt[];
}

// Default conversation features - AI-like natural dialogue
const DEFAULT_FEATURES: ConversationFeatures = {
  microHedges: true,
  selfCorrection: true,
  memoryHooks: true,
  emotionalTemperature: true,
  contextualPrompting: true
};

/**
 * Main conversation handler with AI-like features
 */
export async function handleNPCConversation(
  npcId: string,
  playerMessage: string,
  gameState: any,
  features: ConversationFeatures = DEFAULT_FEATURES
): Promise<ConversationResponse> {
  // Clear any active prompts for this NPC
  clearPrompt(npcId);
  
  // Get current context
  const context = getContextSnapshot(gameState);
  const persona = getPersona(npcId);
  const memory = getNPCMemory(npcId);
  
  // Classify player intent
  const intentResult = classifyIntent(playerMessage, context);
  
  // Generate base response
  let response = generateNPCReply(npcId, playerMessage, intentResult, context, memory);
  
  // Apply AI-like conversation features
  const conversationFeatures = applyConversationFeatures(
    response,
    persona,
    memory,
    context,
    features
  );
  
  // Update memory with conversation turn
  addConversationTurn(npcId, 'player', playerMessage, {
    intent: intentResult.intent,
    entities: intentResult.entities,
    emotional_state: memory.relationshipLevel > 0.5 ? 'friendly' : 'neutral'
  });
  
  addConversationTurn(npcId, 'npc', conversationFeatures.message);
  
  // Update player preferences based on interaction  
  updatePlayerPreference(npcId, 'asks_for_help', intentResult.intent === 'help');
  updatePlayerPreference(npcId, 'likes_hints', intentResult.intent === 'puzzle_hint');
  
  // Check for new proactive prompts from other NPCs
  const npcMemories = { [npcId]: memory };
  const newPrompts = checkProactivePrompts(context, npcMemories);
  
  return {
    message: conversationFeatures.message,
    features: conversationFeatures.features,
    followUpPrompts: generateFollowUpPrompts(npcId, intentResult, context, memory),
    proactiveUpdate: newPrompts
  };
}

/**
 * Apply AI-like conversation features to make dialogue feel natural
 */
function applyConversationFeatures(
  baseResponse: string,
  persona: any,
  memory: NPCMemoryState,
  context: any,
  features: ConversationFeatures
): { message: string; features: any } {
  let enhancedResponse = baseResponse;
  let confidence = 0.8; // Base confidence
  
  const appliedFeatures = {
    hasHedging: false,
    hasCorrection: false,
    hasMemoryReference: false,
    emotionalTone: 'neutral',
    confidence: confidence
  };
  
  // Micro-hedges for uncertainty (AI-like behavior)
  if (features.microHedges && shouldAddHedging(persona, memory, confidence)) {
    enhancedResponse = addMicroHedging(enhancedResponse, persona);
    appliedFeatures.hasHedging = true;
    confidence *= 0.9;
  }
  
  // Self-correction for natural feel
  if (features.selfCorrection && shouldAddCorrection(persona, memory)) {
    enhancedResponse = addSelfCorrection(enhancedResponse, persona);
    appliedFeatures.hasCorrection = true;
  }
  
  // Memory hooks for continuity
  if (features.memoryHooks && shouldAddMemoryHook(memory)) {
    enhancedResponse = addMemoryHook(enhancedResponse, memory, persona);
    appliedFeatures.hasMemoryReference = true;
  }
  
  // Emotional temperature adjustment
  if (features.emotionalTemperature) {
    const emotionalContext = getEmotionalContext(context, memory);
    enhancedResponse = adjustEmotionalTemperature(enhancedResponse, emotionalContext, persona);
    appliedFeatures.emotionalTone = emotionalContext.tone;
  }
  
  appliedFeatures.confidence = confidence;
  
  return {
    message: enhancedResponse,
    features: appliedFeatures
  };
}

/**
 * Determine if hedging should be added
 */
function shouldAddHedging(persona: any, memory: NPCMemoryState, confidence: number): boolean {
  // More hedging for uncertain situations or cautious personalities
  if (persona.tone.caution > 0.6) return Math.random() < 0.4;
  if (confidence < 0.7) return Math.random() < 0.3;
  if (memory.relationshipLevel < 0.2) return Math.random() < 0.2;
  return false;
}

/**
 * Add micro-hedging for uncertainty
 */
function addMicroHedging(response: string, persona: any): string {
  const hedges = [
    "I think ",
    "It seems like ",
    "Perhaps ",
    "I believe ",
    "From what I understand, ",
    "If I'm not mistaken, "
  ];
  
  // Persona-specific hedges
  if (persona.id === 'wendell') {
    hedges.push("In my experience, ", "According to my observations, ");
  }
  
  if (persona.id === 'ayla') {
    hedges.push("Based on what I've seen, ", "From my perspective, ");
  }
  
  const hedge = hedges[Math.floor(Math.random() * hedges.length)];
  return hedge + response.toLowerCase();
}

/**
 * Determine if self-correction should be added
 */
function shouldAddCorrection(persona: any, memory: NPCMemoryState): boolean {
  // NPCs with high relationship might be more casual
  if (memory.relationshipLevel > 0.6) return Math.random() < 0.15;
  
  // Ayla is more likely to self-correct (natural speech pattern)
  if (persona.id === 'ayla') return Math.random() < 0.2;
  
  return Math.random() < 0.1;
}

/**
 * Add self-correction for natural speech
 */
function addSelfCorrection(response: string, persona: any): string {
  const corrections = [
    "Actually, ",
    "Well, ",
    "I mean, ",
    "Or rather, ",
    "Wait—"
  ];
  
  if (persona.id === 'ayla') {
    corrections.push("Sorry, let me clarify: ", "What I meant was: ");
  }
  
  const correction = corrections[Math.floor(Math.random() * corrections.length)];
  return correction + response.toLowerCase();
}

/**
 * Determine if memory hook should be added
 */
function shouldAddMemoryHook(memory: NPCMemoryState): boolean {
  return memory.conversationBuffer.length > 2 && Math.random() < 0.25;
}

/**
 * Add memory hook for continuity
 */
function addMemoryHook(response: string, memory: NPCMemoryState, persona: any): string {
  const recentConversation = memory.conversationBuffer.slice(-3);
  const playerMentioned = recentConversation.find(turn => 
    turn.speaker === 'player' && 
    (turn.message.includes('you') || turn.message.includes('said'))
  );
  
  if (playerMentioned) {
    const hooks = [
      "Like you mentioned, ",
      "As you said earlier, ",
      "Following up on what you asked, ",
      "Continuing from before, "
    ];
    
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    return hook + response.toLowerCase();
  }
  
  return response;
}

/**
 * Get emotional context from current situation
 */
function getEmotionalContext(context: any, memory: NPCMemoryState): { tone: string; intensity: number } {
  // Time pressure affects emotional tone
  if (context.timers.pollyTakeover?.active) {
    const timeRemaining = context.timers.pollyTakeover.timeRemaining;
    if (timeRemaining < 60000) {
      return { tone: 'urgent', intensity: 0.9 };
    } else if (timeRemaining < 120000) {
      return { tone: 'concerned', intensity: 0.6 };
    }
  }
  
  // Relationship affects emotional warmth
  if (memory.relationshipLevel > 0.7) {
    return { tone: 'warm', intensity: 0.7 };
  } else if (memory.relationshipLevel < -0.3) {
    return { tone: 'distant', intensity: 0.5 };
  }
  
  return { tone: 'neutral', intensity: 0.5 };
}

/**
 * Adjust response based on emotional temperature
 */
function adjustEmotionalTemperature(response: string, emotional: { tone: string; intensity: number }, persona: any): string {
  switch (emotional.tone) {
    case 'urgent':
      return response + (Math.random() < 0.5 ? ' We need to hurry!' : ' Time is running out!');
    
    case 'concerned':
      return response + (Math.random() < 0.3 ? ' I hope we can figure this out soon.' : '');
    
    case 'warm':
      if (persona.tone.warmth > 0.6) {
        return response + (Math.random() < 0.3 ? ' I\'m glad I can help!' : '');
      }
      break;
    
    case 'distant':
      // Remove warmth indicators, add formality
      return response.replace(/!/g, '.').replace(/\byou're\b/g, 'you are');
  }
  
  return response;
}

/**
 * Generate contextual follow-up prompts
 */
function generateFollowUpPrompts(
  npcId: string, 
  intentResult: any, 
  context: any, 
  memory: NPCMemoryState
): string[] {
  const prompts: string[] = [];
  
  // Intent-based follow-ups
  if (intentResult.intent === 'puzzle_hint' && intentResult.confidence < 0.8) {
    prompts.push("Can you be more specific about what you're stuck on?");
  }
  
  if (intentResult.intent === 'greeting' && memory.totalInteractions === 1) {
    prompts.push("Is this your first time here?", "What brings you to this place?");
  }
  
  // Context-based follow-ups
  if (context.inventory.length > 0 && intentResult.intent === 'help') {
    prompts.push("Want to discuss what you're carrying?");
  }
  
  // NPC-specific follow-ups
  if (npcId === 'ayla' && context.timers.pollyTakeover?.active) {
    prompts.push("Should we focus on the time pressure?");
  }
  
  return prompts.slice(0, 2); // Limit to 2 follow-ups
}

/**
 * Initialize conversation system
 */
export function initializeConversationSystem(): void {
  console.log('[Conversation] NPC conversation system with AI-like features initialized');
}

/**
 * Get conversation statistics for debugging
 */
export function getConversationStats(npcId: string): any {
  const memory = getNPCMemory(npcId);
  const recentTurns = memory.conversationBuffer.slice(-10);
  
  return {
    totalInteractions: memory.totalInteractions,
    relationshipLevel: memory.relationshipLevel,
    recentTurnCount: recentTurns.length,
    playerPreferences: memory.playerPreferences,
    lastInteraction: new Date(memory.lastInteraction).toISOString()
  };
}
