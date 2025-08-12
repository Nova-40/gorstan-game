/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  AI-Enhanced Miniquest Service
  Provides intelligent quest recommendations and adaptive difficulty while maintaining fallback to current system
*/

import { groqAI } from './groqAI';
import type { LocalGameState } from '../state/gameState';
import type { Miniquest } from '../types/GameTypes';
import { MiniquestEngine } from '../engine/miniquestInitializer';

export interface PlayerProfile {
  skillLevels: {
    puzzle: number;        // 0-1 scale
    exploration: number;   // 0-1 scale
    social: number;        // 0-1 scale
    combat: number;        // 0-1 scale
    story: number;         // 0-1 scale
  };
  preferences: {
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
    preferredTypes: string[];
    playStyle: 'careful' | 'bold' | 'methodical' | 'creative';
  };
  currentProgress: {
    questsCompleted: number;
    averageCompletionTime: number;
    failureRate: number;
    lastPlaySession: number;
  };
  strugglingAreas: string[];
  strengths: string[];
}

export interface AIMiniquestRecommendation {
  questId: string;
  confidence: number;        // 0-1 how confident AI is in this recommendation
  reasoning: string;         // Why this quest was recommended
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard';
  estimatedCompletionTime: number; // minutes
  prerequisites: string[];
  hints: string[];
  adaptedDescription?: string; // AI-generated personalized description
}

export interface AIMiniquestAnalysis {
  playerFrustrationLevel: number;  // 0-1 scale
  suggestedBreak: boolean;
  shouldOfferHelp: boolean;
  recommendedActions: string[];
  personalizedEncouragement: string;
}

export class AIMiniquestService {
  private playerProfiles: Map<string, PlayerProfile> = new Map();
  private fallbackEngine: MiniquestEngine;
  private aiEnabled: boolean = true;
  private requestCooldown: Map<string, number> = new Map();

  constructor() {
    this.fallbackEngine = MiniquestEngine.getInstance();
  }

  /**
   * Get AI-powered quest recommendations for a player
   */
  async getRecommendedQuests(
    roomId: string,
    gameState: LocalGameState,
    maxRecommendations: number = 3
  ): Promise<AIMiniquestRecommendation[]> {
    try {
      // Always get fallback recommendations first
      const fallbackQuests = this.fallbackEngine.getAvailableQuests(roomId, gameState as any);
      
      if (!this.aiEnabled || !this.canMakeAIRequest(gameState.player.name)) {
        return this.convertToAIRecommendations(fallbackQuests);
      }

      const playerProfile = this.getPlayerProfile(gameState);
      const aiRecommendations = await this.generateAIRecommendations(
        roomId,
        fallbackQuests,
        playerProfile,
        gameState,
        maxRecommendations
      );

      return aiRecommendations.length > 0 ? aiRecommendations : this.convertToAIRecommendations(fallbackQuests);

    } catch (error) {
      console.warn('AI quest recommendation failed, using fallback:', error);
      const fallbackQuests = this.fallbackEngine.getAvailableQuests(roomId, gameState as any);
      return this.convertToAIRecommendations(fallbackQuests);
    }
  }

  /**
   * Analyze player state and provide guidance
   */
  async analyzePlayerState(gameState: LocalGameState): Promise<AIMiniquestAnalysis> {
    try {
      if (!this.aiEnabled || !this.canMakeAIRequest(gameState.player.name)) {
        return this.getFallbackAnalysis(gameState);
      }

      const playerProfile = this.getPlayerProfile(gameState);
      const aiAnalysis = await this.generateAIAnalysis(playerProfile, gameState);

      return aiAnalysis || this.getFallbackAnalysis(gameState);

    } catch (error) {
      console.warn('AI player analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(gameState);
    }
  }

  /**
   * Get personalized quest difficulty adjustment
   */
  async getAdaptedDifficulty(
    quest: Miniquest,
    gameState: LocalGameState
  ): Promise<{ difficulty: string; adaptedHints: string[]; reasoning: string }> {
    try {
      if (!this.aiEnabled || !this.canMakeAIRequest(gameState.player.name)) {
        return this.getFallbackDifficulty(quest);
      }

      const playerProfile = this.getPlayerProfile(gameState);
      const aiAdaptation = await this.generateDifficultyAdaptation(quest, playerProfile, gameState);

      return aiAdaptation || this.getFallbackDifficulty(quest);

    } catch (error) {
      console.warn('AI difficulty adaptation failed, using fallback:', error);
      return this.getFallbackDifficulty(quest);
    }
  }

  /**
   * Generate AI recommendations using Groq
   */
  private async generateAIRecommendations(
    roomId: string,
    availableQuests: Miniquest[],
    playerProfile: PlayerProfile,
    gameState: LocalGameState,
    maxRecommendations: number
  ): Promise<AIMiniquestRecommendation[]> {
    const prompt = `You are an intelligent quest recommendation system for a text adventure game called Gorstan. 

CURRENT CONTEXT:
- Room: ${roomId}
- Available Quests: ${availableQuests.length}
- Player Skill Levels: ${JSON.stringify(playerProfile.skillLevels)}
- Player Preferences: ${JSON.stringify(playerProfile.preferences)}
- Player Progress: ${JSON.stringify(playerProfile.currentProgress)}
- Current Inventory: ${gameState.player.inventory?.join(', ') || 'empty'}
- Current Flags: ${Object.keys(gameState.flags || {}).length} active

AVAILABLE QUESTS:
${availableQuests.map(q => `- ${q.id}: ${q.title} (${q.type}, ${q.difficulty}) - ${q.description}`).join('\n')}

TASK: Recommend the ${maxRecommendations} most suitable quests for this player based on:
1. Player's demonstrated skill levels and preferences
2. Natural progression from completed quests
3. Player's current struggling areas vs strengths
4. Optimal challenge level (not too easy, not frustratingly hard)
5. Variety to keep gameplay interesting

Respond with JSON array of recommendations:
[{
  "questId": "quest_id",
  "confidence": 0.85,
  "reasoning": "Brief explanation why this quest suits the player",
  "difficulty": "medium",
  "estimatedCompletionTime": 5,
  "prerequisites": ["item1", "flag1"],
  "hints": ["Helpful hint 1", "Helpful hint 2"],
  "adaptedDescription": "Personalized description for this player"
}]

Focus on creating a smooth, engaging experience that builds player confidence while providing appropriate challenge.`;

    try {
      this.recordAIRequest(gameState.player.name);
      const response = await groqAI.generateAIResponse(prompt, 'miniquests', gameState);
      
      if (response) {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed) ? parsed.slice(0, maxRecommendations) : [];
      }
    } catch (error) {
      console.warn('Failed to parse AI quest recommendations:', error);
    }

    return [];
  }

  /**
   * Generate AI player state analysis
   */
  private async generateAIAnalysis(
    playerProfile: PlayerProfile,
    gameState: LocalGameState
  ): Promise<AIMiniquestAnalysis | null> {
    const recentMessages = gameState.messages?.slice(-10) || [];
    const recentCommands = (gameState as any).recentCommands?.slice(-5) || [];
    
    const prompt = `Analyze this player's current state in the text adventure game Gorstan:

PLAYER PROFILE:
- Skill Levels: ${JSON.stringify(playerProfile.skillLevels)}
- Completion Stats: ${JSON.stringify(playerProfile.currentProgress)}
- Struggling Areas: ${playerProfile.strugglingAreas.join(', ')}
- Play Style: ${playerProfile.preferences.playStyle}

RECENT ACTIVITY:
- Recent Commands: ${recentCommands.join(', ')}
- Recent Messages: ${recentMessages.map(m => m.text).slice(-3).join(' | ')}
- Session Length: ${Math.floor((Date.now() - (gameState as any).sessionStart || Date.now()) / 60000)} minutes

TASK: Provide psychological analysis and guidance recommendations.

Respond with JSON:
{
  "playerFrustrationLevel": 0.3,
  "suggestedBreak": false,
  "shouldOfferHelp": true,
  "recommendedActions": ["Try examining objects more carefully", "Talk to NPCs for hints"],
  "personalizedEncouragement": "You're making great progress! Your methodical approach is paying off."
}

Be encouraging and supportive while providing actionable guidance.`;

    try {
      this.recordAIRequest(gameState.player.name);
      const response = await groqAI.generateAIResponse(prompt, 'analysis', gameState);
      
      if (response) {
        return JSON.parse(response);
      }
    } catch (error) {
      console.warn('Failed to parse AI player analysis:', error);
    }

    return null;
  }

  /**
   * Generate difficulty adaptation using AI
   */
  private async generateDifficultyAdaptation(
    quest: Miniquest,
    playerProfile: PlayerProfile,
    gameState: LocalGameState
  ): Promise<{ difficulty: string; adaptedHints: string[]; reasoning: string } | null> {
    const prompt = `Adapt the difficulty and hints for this quest based on the player's profile:

QUEST:
- ID: ${quest.id}
- Title: ${quest.title}
- Description: ${quest.description}
- Type: ${quest.type}
- Base Difficulty: ${quest.difficulty}
- Original Hint: ${quest.hint || 'None'}

PLAYER PROFILE:
- Skill in ${quest.type}: ${playerProfile.skillLevels[quest.type as keyof typeof playerProfile.skillLevels] || 0.5}
- Failure Rate: ${playerProfile.currentProgress.failureRate}
- Play Style: ${playerProfile.preferences.playStyle}
- Struggling Areas: ${playerProfile.strugglingAreas.join(', ')}

TASK: Adapt this quest to be optimally challenging for this specific player.

Respond with JSON:
{
  "difficulty": "medium",
  "adaptedHints": ["Contextual hint 1", "Progressive hint 2", "Encouraging hint 3"],
  "reasoning": "Explanation of why these adaptations suit this player"
}

Make hints progressive (start subtle, get more specific) and encouraging.`;

    try {
      this.recordAIRequest(gameState.player.name);
      const response = await groqAI.generateAIResponse(prompt, 'difficulty', gameState);
      
      if (response) {
        return JSON.parse(response);
      }
    } catch (error) {
      console.warn('Failed to parse AI difficulty adaptation:', error);
    }

    return null;
  }

  /**
   * Build or update player profile based on game state
   */
  private getPlayerProfile(gameState: LocalGameState): PlayerProfile {
    const playerName = gameState.player.name;
    let profile = this.playerProfiles.get(playerName);

    if (!profile) {
      profile = this.createDefaultProfile();
      this.playerProfiles.set(playerName, profile);
    }

    // Update profile based on recent performance
    this.updateProfileFromGameState(profile, gameState);
    
    return profile;
  }

  /**
   * Create default player profile
   */
  private createDefaultProfile(): PlayerProfile {
    return {
      skillLevels: {
        puzzle: 0.5,
        exploration: 0.5,
        social: 0.5,
        combat: 0.5,
        story: 0.5
      },
      preferences: {
        preferredDifficulty: 'adaptive',
        preferredTypes: [],
        playStyle: 'methodical'
      },
      currentProgress: {
        questsCompleted: 0,
        averageCompletionTime: 0,
        failureRate: 0,
        lastPlaySession: Date.now()
      },
      strugglingAreas: [],
      strengths: []
    };
  }

  /**
   * Update player profile based on current game state
   */
  private updateProfileFromGameState(profile: PlayerProfile, gameState: LocalGameState): void {
    // Update quest completion stats
    const miniquestState = (gameState as any).miniquestState || {};
    let totalCompleted = 0;
    
    Object.values(miniquestState).forEach((roomState: any) => {
      if (roomState?.completedQuests) {
        totalCompleted += roomState.completedQuests.length;
      }
    });

    profile.currentProgress.questsCompleted = totalCompleted;

    // Analyze play style from recent commands
    const recentCommands = (gameState as any).recentCommands || [];
    if (recentCommands.length > 0) {
      const examineCount = recentCommands.filter((cmd: string) => cmd.includes('examine') || cmd.includes('look')).length;
      const talkCount = recentCommands.filter((cmd: string) => cmd.includes('talk')).length;
      const rushingCommands = recentCommands.filter((cmd: string) => 
        ['go', 'north', 'south', 'east', 'west'].includes(cmd.toLowerCase())
      ).length;

      if (examineCount > rushingCommands) profile.preferences.playStyle = 'methodical';
      else if (talkCount > examineCount) profile.preferences.playStyle = 'careful';
      else if (rushingCommands > examineCount) profile.preferences.playStyle = 'bold';
    }

    // Update skill levels based on successful quest types
    // This would be expanded with more sophisticated tracking
  }

  /**
   * Convert regular quests to AI recommendation format
   */
  private convertToAIRecommendations(quests: Miniquest[]): AIMiniquestRecommendation[] {
    return quests.slice(0, 3).map(quest => ({
      questId: quest.id,
      confidence: 0.7, // Default confidence for fallback
      reasoning: `Available ${quest.type} quest with ${quest.difficulty} difficulty`,
      difficulty: quest.difficulty as any,
      estimatedCompletionTime: this.estimateCompletionTime(quest),
      prerequisites: quest.requiredItems || [],
      hints: quest.hint ? [quest.hint] : ['Try examining objects in the room', 'Look for interactive elements'],
      adaptedDescription: quest.description
    }));
  }

  /**
   * Get fallback analysis when AI is unavailable
   */
  private getFallbackAnalysis(gameState: LocalGameState): AIMiniquestAnalysis {
    const recentMessages = gameState.messages?.slice(-5) || [];
    const hasErrors = recentMessages.some(m => m.type === 'error');
    const sessionTime = Math.floor((Date.now() - (gameState as any).sessionStart || Date.now()) / 60000);

    return {
      playerFrustrationLevel: hasErrors ? 0.6 : 0.3,
      suggestedBreak: sessionTime > 45,
      shouldOfferHelp: hasErrors || sessionTime > 30,
      recommendedActions: [
        'Try "miniquests" to see available objectives',
        'Use "look" to examine your surroundings',
        'Talk to NPCs for guidance'
      ],
      personalizedEncouragement: 'Keep exploring! There are always new discoveries waiting.'
    };
  }

  /**
   * Get fallback difficulty adaptation
   */
  private getFallbackDifficulty(quest: Miniquest): { difficulty: string; adaptedHints: string[]; reasoning: string } {
    return {
      difficulty: quest.difficulty || 'medium',
      adaptedHints: quest.hint ? [quest.hint] : [
        'Look for clues in the room description',
        'Try interacting with objects mentioned in the quest',
        'Some quests require specific items or conditions'
      ],
      reasoning: 'Standard difficulty based on quest design'
    };
  }

  /**
   * Estimate completion time for a quest
   */
  private estimateCompletionTime(quest: Miniquest): number {
    const baseTime = {
      'trivial': 2,
      'easy': 5,
      'medium': 10,
      'hard': 20
    };
    
    return baseTime[quest.difficulty as keyof typeof baseTime] || 10;
  }

  /**
   * Check if AI request can be made (rate limiting)
   */
  private canMakeAIRequest(playerName: string): boolean {
    const lastRequest = this.requestCooldown.get(playerName) || 0;
    const now = Date.now();
    
    // 30 second cooldown between AI requests per player
    return (now - lastRequest) > 30000;
  }

  /**
   * Record AI request for rate limiting
   */
  private recordAIRequest(playerName: string): void {
    this.requestCooldown.set(playerName, Date.now());
  }

  /**
   * Enable or disable AI features
   */
  public setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }

  /**
   * Get current AI status
   */
  public getAIStatus(): { enabled: boolean; fallbackMode: boolean } {
    return {
      enabled: this.aiEnabled,
      fallbackMode: !this.aiEnabled
    };
  }
}

// Singleton instance
export const aiMiniquestService = new AIMiniquestService();
