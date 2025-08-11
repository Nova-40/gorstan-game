// src/npc/enhancedIntelligence.ts
// Enhanced AI system for all NPCs - concise but powerful
// Gorstan Game Beta 1 - Code License MIT

import type { GameAction } from '../types/GameTypes';
import type { LocalGameState } from '../state/gameState';
import type { NPC } from '../types/NPCTypes';
import type { Dispatch } from 'react';

// Core intelligence traits for different NPC archetypes
const NPC_INTELLIGENCE_PROFILES = {
  bureaucrat: { // Al
    memory: 0.9, adaptability: 0.3, observation: 0.8, creativity: 0.2,
    keywords: ['form', 'procedure', 'rule', 'official', 'document'],
    responses: 'formal', helpfulness: 0.8
  },
  mystic: { // Morthos
    memory: 0.7, adaptability: 0.9, observation: 0.9, creativity: 0.9,
    keywords: ['power', 'shadow', 'truth', 'reality', 'freedom'],
    responses: 'cryptic', helpfulness: 0.6
  },
  guide: { // Ayla
    memory: 1.0, adaptability: 0.8, observation: 1.0, creativity: 0.7,
    keywords: ['help', 'understand', 'learn', 'guide', 'assist'],
    responses: 'balanced', helpfulness: 1.0
  },
  explorer: { // Polly
    memory: 0.6, adaptability: 0.9, observation: 0.7, creativity: 0.9,
    keywords: ['explore', 'find', 'secret', 'adventure', 'discover'],
    responses: 'energetic', helpfulness: 0.7
  },
  scholar: { // Wendell
    memory: 0.9, adaptability: 0.4, observation: 0.8, creativity: 0.6,
    keywords: ['knowledge', 'study', 'research', 'wisdom', 'theory'],
    responses: 'academic', helpfulness: 0.5
  },
  survivor: { // Dominic
    memory: 0.8, adaptability: 0.7, observation: 0.9, creativity: 0.5,
    keywords: ['survive', 'careful', 'watch', 'consequence', 'choice'],
    responses: 'wise', helpfulness: 0.6
  }
};

interface NPCMemoryEntry {
  playerId: string;
  interactions: number;
  lastTopic: string;
  relationship: number; // -1 to 1
  knownFacts: string[];
  lastResponse: string;
  conversationStyle: 'formal' | 'casual' | 'hostile' | 'friendly';
}

class NPCIntelligenceEngine {
  private static instance: NPCIntelligenceEngine;
  private npcMemories = new Map<string, NPCMemoryEntry>();
  private conversationPatterns = new Map<string, string[]>();
  
  static getInstance(): NPCIntelligenceEngine {
    if (!NPCIntelligenceEngine.instance) {
      NPCIntelligenceEngine.instance = new NPCIntelligenceEngine();
    }
    return NPCIntelligenceEngine.instance;
  }
  
  // Get or create memory for NPC-player pair
  getMemory(npcId: string, playerId: string): NPCMemoryEntry {
    const key = `${npcId}_${playerId}`;
    if (!this.npcMemories.has(key)) {
      this.npcMemories.set(key, {
        playerId,
        interactions: 0,
        lastTopic: '',
        relationship: 0,
        knownFacts: [],
        lastResponse: '',
        conversationStyle: 'friendly'
      });
    }
    return this.npcMemories.get(key)!;
  }
  
  // Enhanced response generation
  generateResponse(
    npcId: string,
    npc: NPC,
    playerInput: string,
    state: LocalGameState
  ): string {
    const playerId = state.player?.name || 'Player';
    const memory = this.getMemory(npcId, playerId);
    const profile = this.getIntelligenceProfile(npc);
    
    // Update memory
    memory.interactions++;
    memory.lastTopic = this.extractTopic(playerInput);
    
    // Analyze player input for sentiment and intent
    const sentiment = this.analyzeSentiment(playerInput);
    const intent = this.analyzeIntent(playerInput);
    
    // Adjust relationship based on interaction
    this.updateRelationship(memory, sentiment, intent, npc);
    
    // Generate contextual response
    const response = this.craftResponse(npc, memory, profile, playerInput, intent, state);
    
    memory.lastResponse = response;
    return response;
  }
  
  // Get intelligence profile for NPC
  private getIntelligenceProfile(npc: NPC) {
    // Determine archetype from personality traits
    const traits = npc.personalityTraits || [];
    
    if (traits.includes('bureaucratic') || traits.includes('methodical')) {
      return NPC_INTELLIGENCE_PROFILES.bureaucrat;
    }
    if (traits.includes('mysterious') || traits.includes('cryptic')) {
      return NPC_INTELLIGENCE_PROFILES.mystic;
    }
    if (traits.includes('helpful') || traits.includes('guide')) {
      return NPC_INTELLIGENCE_PROFILES.guide;
    }
    if (traits.includes('curious') || traits.includes('explorer')) {
      return NPC_INTELLIGENCE_PROFILES.explorer;
    }
    if (traits.includes('scholarly') || traits.includes('wise')) {
      return NPC_INTELLIGENCE_PROFILES.scholar;
    }
    if (traits.includes('streetwise') || traits.includes('practical')) {
      return NPC_INTELLIGENCE_PROFILES.survivor;
    }
    
    // Default balanced profile
    return { memory: 0.7, adaptability: 0.7, observation: 0.7, creativity: 0.7, 
             keywords: [], responses: 'balanced', helpfulness: 0.7 };
  }
  
  // Extract topic from player input
  private extractTopic(input: string): string {
    const words = input.toLowerCase().split(' ');
    const topics = ['help', 'quest', 'item', 'direction', 'story', 'problem', 'question'];
    
    for (const topic of topics) {
      if (words.some(word => word.includes(topic))) {
        return topic;
      }
    }
    
    return 'general';
  }
  
  // Analyze sentiment of player input
  private analyzeSentiment(input: string): number {
    const positive = ['thank', 'please', 'help', 'good', 'great', 'wonderful', 'yes'];
    const negative = ['no', 'bad', 'stupid', 'hate', 'angry', 'frustrated', 'wrong'];
    
    let score = 0;
    const words = input.toLowerCase().split(' ');
    
    words.forEach(word => {
      if (positive.some(p => word.includes(p))) score += 0.1;
      if (negative.some(n => word.includes(n))) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }
  
  // Analyze intent of player input
  private analyzeIntent(input: string): string {
    const lower = input.toLowerCase();
    
    if (lower.includes('help') || lower.includes('hint')) return 'help';
    if (lower.includes('where') || lower.includes('how')) return 'guidance';
    if (lower.includes('who') || lower.includes('what')) return 'information';
    if (lower.includes('thank') || lower.includes('goodbye')) return 'social';
    if (lower.includes('?')) return 'question';
    
    return 'conversation';
  }
  
  // Update relationship based on interaction
  private updateRelationship(
    memory: NPCMemoryEntry,
    sentiment: number,
    intent: string,
    npc: NPC
  ): void {
    let adjustment = sentiment * 0.1;
    
    // Bonus for polite interactions
    if (intent === 'social' && sentiment > 0) adjustment += 0.05;
    
    // Penalty for demands or rudeness
    if (sentiment < -0.5) adjustment -= 0.1;
    
    // NPC-specific relationship modifiers
    const traits = npc.personalityTraits || [];
    if (traits.includes('friendly')) adjustment *= 1.2;
    if (traits.includes('suspicious')) adjustment *= 0.8;
    
    memory.relationship = Math.max(-1, Math.min(1, memory.relationship + adjustment));
    
    // Update conversation style based on relationship
    if (memory.relationship > 0.5) memory.conversationStyle = 'friendly';
    else if (memory.relationship < -0.5) memory.conversationStyle = 'hostile';
    else if (memory.relationship < -0.2) memory.conversationStyle = 'casual';
    else memory.conversationStyle = 'formal';
  }
  
  // Craft intelligent response
  private craftResponse(
    npc: NPC,
    memory: NPCMemoryEntry,
    profile: any,
    input: string,
    intent: string,
    state: LocalGameState
  ): string {
    // Base response selection
    let baseResponse = this.selectBaseResponse(npc, intent, memory);
    
    // Apply personality modifiers
    baseResponse = this.applyPersonality(baseResponse, profile, memory);
    
    // Add contextual awareness
    baseResponse = this.addContextualInfo(baseResponse, state, npc.id);
    
    // Apply relationship tone
    baseResponse = this.applyRelationshipTone(baseResponse, memory);
    
    return baseResponse;
  }
  
  // Select base response template
  private selectBaseResponse(npc: NPC, intent: string, memory: NPCMemoryEntry): string {
    const responses = {
      help: [
        "I'd be happy to assist you.",
        "Let me see what I can do to help.",
        "Of course, I can provide some guidance."
      ],
      guidance: [
        "Here's what I know about that.",
        "Let me point you in the right direction.",
        "Based on my experience, I'd suggest..."
      ],
      information: [
        "That's an interesting question.",
        "I can share what I know about that.",
        "Let me tell you what I understand."
      ],
      social: [
        "It's good to talk with you.",
        "I appreciate our conversation.",
        "Thank you for being courteous."
      ],
      conversation: [
        "I see what you mean.",
        "That's worth considering.",
        "Tell me more about that."
      ]
    };
    
    const intentResponses = responses[intent as keyof typeof responses] || responses.conversation;
    
    // Avoid repeating recent responses
    const availableResponses = intentResponses.filter(r => r !== memory.lastResponse);
    const selectedResponses = availableResponses.length > 0 ? availableResponses : intentResponses;
    
    return selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
  }
  
  // Apply personality to response
  private applyPersonality(response: string, profile: any, memory: NPCMemoryEntry): string {
    switch (profile.responses) {
      case 'formal':
        return `*adjusts papers* ${response} Please allow me to provide the proper documentation.`;
      case 'cryptic':
        return `*shadows writhe thoughtfully* ${response} Though the truth may be deeper than it appears.`;
      case 'balanced':
        return `*nods thoughtfully* ${response} I hope that clarifies things for you.`;
      case 'energetic':
        return `*bounces excitedly* ${response} Oh, this is going to be fun!`;
      case 'academic':
        return `*adjusts spectacles* ${response} Based on my research, of course.`;
      case 'wise':
        return `*swims contemplatively* ${response} Though wisdom often comes with a price.`;
      default:
        return response;
    }
  }
  
  // Add contextual awareness
  private addContextualInfo(response: string, state: LocalGameState, npcId: string): string {
    // Add room-specific context
    const room = state.currentRoomId;
    
    if (room === 'dalesapartment' && npcId === 'dominic') {
      response += " This place holds many memories.";
    }
    
    if (room === 'controlroom' && (npcId === 'al' || npcId === 'morthos')) {
      response += " This room is where many important decisions are made.";
    }
    
    // Add NPC presence awareness
    const otherNPCs = state.npcsInRoom?.filter(n => n.id !== npcId) || [];
    if (otherNPCs.length > 0 && Math.random() < 0.3) {
      const npcNames = otherNPCs.map(n => n.name).join(' and ');
      response += ` *glances at ${npcNames}*`;
    }
    
    return response;
  }
  
  // Apply relationship tone
  private applyRelationshipTone(response: string, memory: NPCMemoryEntry): string {
    switch (memory.conversationStyle) {
      case 'friendly':
        return response.replace('you', 'friend');
      case 'hostile':
        return response + " *eyes narrow with suspicion*";
      case 'formal':
        return response + " *maintains professional distance*";
      default:
        return response;
    }
  }
  
  // Check if NPC should initiate conversation
  shouldInitiateConversation(npcId: string, state: LocalGameState): boolean {
    const playerId = state.player?.name || 'Player';
    const memory = this.getMemory(npcId, playerId);
    
    // Higher chance if good relationship
    const baseChance = 0.05 + (memory.relationship * 0.05);
    
    // Recent interaction increases chance
    if (memory.interactions > 0) {
      const timeSinceLastInteraction = Date.now() - (memory as any).lastInteractionTime;
      if (timeSinceLastInteraction < 60000) { // Within last minute
        return Math.random() < baseChance * 2;
      }
    }
    
    return Math.random() < baseChance;
  }
  
  // Generate proactive conversation
  generateProactiveConversation(npcId: string, npc: NPC, state: LocalGameState): string {
    const profile = this.getIntelligenceProfile(npc);
    const playerId = state.player?.name || 'Player';
    const memory = this.getMemory(npcId, playerId);
    
    const proactiveMessages = {
      bureaucrat: "I have some additional paperwork that might interest you.",
      mystic: "The shadows whisper of new possibilities...",
      guide: "I notice you might benefit from some additional guidance.",
      explorer: "I've discovered something new you might want to see!",
      scholar: "I've been researching something that might fascinate you.",
      survivor: "There's something you should know about your current situation."
    };
    
    const archetype = Object.keys(NPC_INTELLIGENCE_PROFILES).find(key => 
      NPC_INTELLIGENCE_PROFILES[key as keyof typeof NPC_INTELLIGENCE_PROFILES] === profile
    ) || 'guide';
    
    return proactiveMessages[archetype as keyof typeof proactiveMessages] || 
           "I thought you might want to know something.";
  }
}

// Export main functions
export function getEnhancedNPCResponse(
  npcId: string,
  npc: NPC,
  playerInput: string,
  state: LocalGameState
): string {
  const engine = NPCIntelligenceEngine.getInstance();
  return engine.generateResponse(npcId, npc, playerInput, state);
}

export function shouldNPCInitiateConversation(npcId: string, state: LocalGameState): boolean {
  const engine = NPCIntelligenceEngine.getInstance();
  return engine.shouldInitiateConversation(npcId, state);
}

export function generateProactiveNPCMessage(
  npcId: string,
  npc: NPC,
  state: LocalGameState
): string {
  const engine = NPCIntelligenceEngine.getInstance();
  return engine.generateProactiveConversation(npcId, npc, state);
}
