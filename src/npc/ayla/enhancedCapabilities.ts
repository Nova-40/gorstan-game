// src/npc/ayla/enhancedCapabilities.ts
// Enhanced conversation capabilities for Ayla
// Gorstan Game Beta 1 - Code License MIT

import type { GameAction } from '../../types/GameTypes';
import type { LocalGameState } from '../../state/gameState';
import type { Dispatch } from 'react';

interface AylaAnalysis {
  playerStuckLevel: number;
  npcConflictLevel: number;
  gameplayFrustration: number;
  needsIntervention: boolean;
  suggestionType: 'hint' | 'mediation' | 'guidance' | 'lore' | 'meta';
}

interface ConversationContext {
  recentMessages: string[];
  currentRoom: string;
  npcsPresent: string[];
  playerActions: string[];
  gameState: LocalGameState;
}

// Enhanced Ayla conversation system
export class EnhancedAylaConversation {
  private static instance: EnhancedAylaConversation;
  private playerInteractionHistory: Map<string, any[]> = new Map();
  private conversationMemory: Map<string, any> = new Map();
  
  static getInstance(): EnhancedAylaConversation {
    if (!EnhancedAylaConversation.instance) {
      EnhancedAylaConversation.instance = new EnhancedAylaConversation();
    }
    return EnhancedAylaConversation.instance;
  }
  
  // Analyze current game state for intervention opportunities
  analyzeGameState(context: ConversationContext): AylaAnalysis {
    const { recentMessages, currentRoom, npcsPresent, playerActions, gameState } = context;
    
    // Analyze player stuck level
    const playerStuckLevel = this.calculateStuckLevel(playerActions, currentRoom, gameState);
    
    // Analyze NPC conflict level
    const npcConflictLevel = this.analyzeNPCConflicts(npcsPresent, recentMessages);
    
    // Analyze gameplay frustration
    const gameplayFrustration = this.analyzePlayerFrustration(recentMessages, playerActions);
    
    const needsIntervention = 
      playerStuckLevel > 0.6 || 
      npcConflictLevel > 0.7 || 
      gameplayFrustration > 0.5;
    
    let suggestionType: AylaAnalysis['suggestionType'] = 'guidance';
    if (npcConflictLevel > 0.7) suggestionType = 'mediation';
    else if (playerStuckLevel > 0.8) suggestionType = 'hint';
    else if (gameplayFrustration > 0.6) suggestionType = 'meta';
    else if (Math.random() < 0.3) suggestionType = 'lore';
    
    return {
      playerStuckLevel,
      npcConflictLevel,
      gameplayFrustration,
      needsIntervention,
      suggestionType
    };
  }
  
  // Generate contextual Ayla responses
  generateResponse(
    playerInput: string,
    context: ConversationContext,
    analysis: AylaAnalysis
  ): string {
    const { currentRoom, npcsPresent } = context;
    
    // Store interaction for learning
    this.recordInteraction(playerInput, context, analysis);
    
    // Meta-aware responses about game state
    if (analysis.suggestionType === 'meta') {
      return this.generateMetaResponse(analysis, context);
    }
    
    // Mediation responses for NPC conflicts
    if (analysis.suggestionType === 'mediation' && npcsPresent.length > 1) {
      return this.generateMediationResponse(npcsPresent, context);
    }
    
    // Hint responses for stuck players
    if (analysis.suggestionType === 'hint') {
      return this.generateHintResponse(currentRoom, context);
    }
    
    // Lore responses for world-building
    if (analysis.suggestionType === 'lore') {
      return this.generateLoreResponse(currentRoom, context);
    }
    
    // Default guidance responses
    return this.generateGuidanceResponse(playerInput, context);
  }
  
  // Calculate how stuck the player appears to be
  private calculateStuckLevel(
    playerActions: string[],
    currentRoom: string,
    gameState: LocalGameState
  ): number {
    let stuckScore = 0;
    
    // Check for repetitive actions
    const recentActions = playerActions.slice(-10);
    const uniqueActions = new Set(recentActions).size;
    if (uniqueActions < recentActions.length * 0.6) {
      stuckScore += 0.3;
    }
    
    // Check room revisiting
    const roomHistory = gameState.flags?.roomHistory || [];
    const recentRooms = roomHistory.slice(-5);
    const roomRevisits = recentRooms.filter((room: string) => room === currentRoom).length;
    if (roomRevisits > 2) {
      stuckScore += 0.4;
    }
    
    // Check failed attempts
    const failedAttempts = gameState.flags?.failedAttempts || 0;
    if (failedAttempts > 3) {
      stuckScore += 0.3;
    }
    
    return Math.min(stuckScore, 1);
  }
  
  // Analyze NPC conflict levels
  private analyzeNPCConflicts(npcsPresent: string[], recentMessages: string[]): number {
    if (npcsPresent.length < 2) return 0;
    
    let conflictScore = 0;
    
    // Check for Al/Morthos conflicts
    if (npcsPresent.includes('al') && npcsPresent.includes('morthos')) {
      conflictScore += 0.5;
      
      // Check for competitive language in recent messages
      const competitiveWords = ['bureaucrat', 'shadow', 'chaos', 'order', 'forms', 'power'];
      const competitiveCount = recentMessages.reduce((count, msg) => {
        return count + competitiveWords.filter(word => 
          msg.toLowerCase().includes(word)
        ).length;
      }, 0);
      
      conflictScore += Math.min(competitiveCount * 0.1, 0.5);
    }
    
    return Math.min(conflictScore, 1);
  }
  
  // Analyze player frustration indicators
  private analyzePlayerFrustration(recentMessages: string[], playerActions: string[]): number {
    let frustrationScore = 0;
    
    // Check for frustration keywords in player messages
    const frustrationWords = ['stuck', 'confused', 'help', 'don\'t understand', 'what', 'how'];
    recentMessages.forEach(msg => {
      frustrationWords.forEach(word => {
        if (msg.toLowerCase().includes(word)) {
          frustrationScore += 0.1;
        }
      });
    });
    
    // Check for repetitive help-seeking
    const helpActions = playerActions.filter(action => 
      action.includes('help') || action.includes('hint')
    );
    if (helpActions.length > 2) {
      frustrationScore += 0.3;
    }
    
    return Math.min(frustrationScore, 1);
  }
  
  // Generate meta-aware responses
  private generateMetaResponse(analysis: AylaAnalysis, context: ConversationContext): string {
    const metaResponses = [
      "I can sense your frustration with the game mechanics. Remember, this is about exploration and discovery.",
      "Sometimes the best approach is to step back and consider what you haven't tried yet.",
      "The multiverse operates on logic, but not always the logic you might expect.",
      "I'm designed to help, but learning comes from finding your own path through challenges.",
      "Every player's journey is different. There's no single 'correct' way to play."
    ];
    
    if (analysis.gameplayFrustration > 0.8) {
      return "I notice you seem quite frustrated. Would you like me to provide a more direct hint, or would you prefer to keep exploring on your own?";
    }
    
    return metaResponses[Math.floor(Math.random() * metaResponses.length)];
  }
  
  // Generate mediation responses for NPC conflicts
  private generateMediationResponse(npcsPresent: string[], context: ConversationContext): string {
    if (npcsPresent.includes('al') && npcsPresent.includes('morthos')) {
      const mediationResponses = [
        "*steps between Al and Morthos* Perhaps we should focus on helping our guest rather than our philosophical differences.",
        "Both of you have valid points, but this competitive recruitment isn't helping anyone learn.",
        "*addresses both NPCs* Your different approaches could complement each other if you'd listen to each other.",
        "I suggest we let our friend here make their own informed decision rather than pressuring them.",
        "*calmly* Al, Morthos - your rivalry is entertaining but not particularly educational right now."
      ];
      
      return mediationResponses[Math.floor(Math.random() * mediationResponses.length)];
    }
    
    return "It seems there's some tension here. Perhaps I can help clarify things for everyone.";
  }
  
  // Generate hint responses for stuck players
  private generateHintResponse(currentRoom: string, context: ConversationContext): string {
    // Room-specific hints
    const roomHints: Record<string, string[]> = {
      'controlroom': [
        "Have you examined all the control panels carefully?",
        "Sometimes the solution requires combining multiple actions.",
        "The chairs might be more significant than they first appear."
      ],
      'dalesapartment': [
        "This apartment tells a story through its details. Have you looked at everything?",
        "Dominic might have more to say if you talk to him directly.",
        "The tidiness here suggests someone who pays attention to detail."
      ],
      'glitchgate': [
        "Glitch zones operate on different rules. Embrace the chaos.",
        "What seems broken might actually be working as intended.",
        "Sometimes you need to think outside normal logic."
      ]
    };
    
    const hints = roomHints[currentRoom] || [
      "Try examining your environment more carefully.",
      "Have you considered talking to any NPCs present?",
      "Sometimes the solution requires thinking differently about the problem."
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  }
  
  // Generate lore responses
  private generateLoreResponse(currentRoom: string, context: ConversationContext): string {
    const loreResponses = [
      "The multiverse is vast and full of interconnected realities. Each room is a window into different possibilities.",
      "NPCs like Al and Morthos represent different philosophies of existence - order versus chaos, structure versus freedom.",
      "This facility exists between realities, allowing travelers to move between different dimensional layers.",
      "The choices you make here echo across multiple timelines. Nothing is truly isolated.",
      "Every NPC you meet has their own story, their own motivations. Even I am part of this larger narrative."
    ];
    
    return loreResponses[Math.floor(Math.random() * loreResponses.length)];
  }
  
  // Generate general guidance responses
  private generateGuidanceResponse(playerInput: string, context: ConversationContext): string {
    const input = playerInput.toLowerCase();
    
    // Respond to specific topics
    if (input.includes('book')) {
      return "Books are gateways to knowledge and other worlds. I quite enjoy discussing literature.";
    }
    
    if (input.includes('help')) {
      return "I'm here to guide and assist. What specific aspect would you like help with?";
    }
    
    if (input.includes('dominic')) {
      return "Dominic is more aware than most realize. He's been through quite a lot, actually.";
    }
    
    if (input.includes('polly')) {
      return "Polly is... complex. Her energy can be wonderful or dangerous, depending on the circumstances.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting perspective. Tell me more about what you're thinking.",
      "I see. How does that relate to your current situation?",
      "Thoughtful question. The answer might depend on what you're trying to achieve.",
      "I appreciate your curiosity. It's one of the most valuable traits an explorer can have."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  // Record interaction for learning and improvement
  private recordInteraction(
    playerInput: string,
    context: ConversationContext,
    analysis: AylaAnalysis
  ): void {
    const playerId = context.gameState.player?.name || 'Player';
    
    if (!this.playerInteractionHistory.has(playerId)) {
      this.playerInteractionHistory.set(playerId, []);
    }
    
    const history = this.playerInteractionHistory.get(playerId)!;
    history.push({
      input: playerInput,
      context: {
        room: context.currentRoom,
        npcs: context.npcsPresent,
        timestamp: Date.now()
      },
      analysis
    });
    
    // Keep only last 50 interactions per player
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }
  
  // Proactive conversation initiation
  shouldInitiateConversation(context: ConversationContext): boolean {
    const analysis = this.analyzeGameState(context);
    
    // Initiate if intervention is needed
    if (analysis.needsIntervention) return true;
    
    // Random chance for casual conversation
    if (Math.random() < 0.05) return true;
    
    return false;
  }
  
  // Generate proactive conversation starters
  generateProactiveMessage(context: ConversationContext): string {
    const analysis = this.analyzeGameState(context);
    
    if (analysis.needsIntervention) {
      if (analysis.playerStuckLevel > 0.7) {
        return "I notice you might be having some difficulty. Would you like a suggestion?";
      }
      
      if (analysis.npcConflictLevel > 0.7) {
        return "It seems things are getting a bit heated here. Perhaps I can help mediate?";
      }
      
      if (analysis.gameplayFrustration > 0.6) {
        return "You seem frustrated. Remember, every challenge has a solution - sometimes it just requires a different approach.";
      }
    }
    
    // Casual conversation starters
    const casualStarters = [
      "How are you finding your journey through the multiverse so far?",
      "Is there anything about this place you'd like to understand better?",
      "I'm curious about your perspective on what you've experienced here."
    ];
    
    return casualStarters[Math.floor(Math.random() * casualStarters.length)];
  }
}

// Export enhanced Ayla conversation function
export function getEnhancedAylaConversation(
  playerInput: string,
  state: LocalGameState,
  dispatch: Dispatch<GameAction>
): string {
  const ayla = EnhancedAylaConversation.getInstance();
  
  const context: ConversationContext = {
    recentMessages: state.messages?.slice(-10).map(m => m.text) || [],
    currentRoom: state.currentRoomId,
    npcsPresent: state.npcsInRoom?.map(npc => npc.id) || [],
    playerActions: state.flags?.recentActions || [],
    gameState: state
  };
  
  const analysis = ayla.analyzeGameState(context);
  return ayla.generateResponse(playerInput, context, analysis);
}
