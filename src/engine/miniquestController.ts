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
// Core game engine module.

import type { Miniquest, GameAction } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import { MiniquestData, MiniquestProgress } from '../components/MiniquestInterface';

import { MiniquestEngine } from '../engine/miniquestInitializer';

import { aiMiniquestService, AIMiniquestRecommendation } from '../services/aiMiniquestService';











export interface MiniquestControllerResult {
  showMiniquestModal: boolean;
  miniquests: MiniquestData[];
  progress: { [questId: string]: MiniquestProgress };
  roomName: string;
  totalScore: number;
  completedCount: number;
  availableCount: number;
  aiRecommendations?: AIMiniquestRecommendation[]; // AI-enhanced recommendations
  aiAnalysis?: {
    playerFrustrationLevel: number;
    shouldOfferHelp: boolean;
    personalizedEncouragement: string;
    recommendedActions: string[];
  };
}

export interface MiniquestSession extends MiniquestControllerResult {
  onAttemptQuest: (questId: string) => void;
  onClose: () => void;
}

class MiniquestController {
  private static instance: MiniquestController;
  private dispatch: React.Dispatch<GameAction> | null = null;
  private aiEnabled: boolean = true; // AI enhancement toggle
  private lastAIUpdate: Date | null = null; // Track last AI update
  private aiRecommendations: AIMiniquestRecommendation[] = []; // Store current AI recommendations

  public static getInstance(): MiniquestController {
    if (!MiniquestController.instance) {
      MiniquestController.instance = new MiniquestController();
    }
    return MiniquestController.instance;
  }

  public setDispatch(dispatch: React.Dispatch<GameAction>) {
    this.dispatch = dispatch;
  }

  public setAIEnabled(enabled: boolean) {
    this.aiEnabled = enabled;
    aiMiniquestService.setAIEnabled(enabled);
  }

  
  public async openMiniquestInterface(
    roomId: string,
    gameState: LocalGameState
  ): Promise<MiniquestControllerResult> {
// Variable declaration
    const engine = MiniquestEngine.getInstance();

    
// Variable declaration
    const availableQuests = engine.getAvailableQuests(roomId, gameState as any);
// Variable declaration
    const allRoomQuests = this.getAllRoomQuests(roomId);

    // Get AI recommendations and analysis if enabled
    let aiRecommendations: AIMiniquestRecommendation[] | undefined;
    let aiAnalysis: any;

    if (this.aiEnabled) {
      try {
        [aiRecommendations, aiAnalysis] = await Promise.all([
          aiMiniquestService.getRecommendedQuests(roomId, gameState, 3),
          aiMiniquestService.analyzePlayerState(gameState)
        ]);
        
        // Store AI recommendations and update timestamp
        if (aiRecommendations) {
          this.aiRecommendations = aiRecommendations;
          this.lastAIUpdate = new Date();
        }
      } catch (error) {
        console.warn('AI miniquest enhancement failed, using fallback:', error);
        // AI failed, continue with standard system
      }
    }

    
    const miniquests: MiniquestData[] = allRoomQuests.map(quest => {
      const baseQuest = {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        rewardPoints: quest.rewardPoints,
        flagOnCompletion: quest.flagOnCompletion,
        requiredItems: quest.requiredItems,
        requiredConditions: quest.requiredConditions,
        triggerAction: quest.triggerAction,
        triggerText: quest.triggerText,
        hint: quest.hint,
        repeatable: quest.repeatable,
        timeLimit: quest.timeLimit,
        difficulty: quest.difficulty
      };

      // Enhance with AI recommendations if available
      const aiRec = aiRecommendations?.find(rec => rec.questId === quest.id);
      if (aiRec) {
        return {
          ...baseQuest,
          description: aiRec.adaptedDescription || baseQuest.description,
          hint: aiRec.hints.join(' | ') || baseQuest.hint,
          difficulty: aiRec.difficulty,
          aiConfidence: aiRec.confidence,
          aiReasoning: aiRec.reasoning,
          estimatedTime: aiRec.estimatedCompletionTime
        };
      }

      return baseQuest;
    });

    
    const progress: { [questId: string]: MiniquestProgress } = {};
// Variable declaration
    const miniquestState = (gameState as any).miniquestState || {};
// Variable declaration
    const roomState = miniquestState[roomId];
// Variable declaration
    const completedQuests = roomState?.completedQuests || [];

    miniquests.forEach(quest => {
// Variable declaration
      const isCompleted = completedQuests.includes(quest.id);
// Variable declaration
      const isAvailable = availableQuests.find(q => q.id === quest.id) !== undefined;
// Variable declaration
      const questProgress = roomState?.questProgress?.[quest.id];

      progress[quest.id] = {
        completed: isCompleted,
        attempts: questProgress?.attempts || 0,
        available: isAvailable || isCompleted,
        locked: !isAvailable && !isCompleted,
        lockReason: this.getLockReason(quest, gameState)
      };
    });

    
// Variable declaration
    const completedCount = Object.values(progress).filter(p => p.completed).length;
// Variable declaration
    const availableCount = Object.values(progress).filter(p => p.available && !p.completed).length;
// Variable declaration
    const totalScore = this.calculateRoomScore(roomId, gameState);

    
// Variable declaration
    const roomName = this.getRoomDisplayName(roomId, gameState);

    return {
      showMiniquestModal: true,
      miniquests,
      progress,
      roomName,
      totalScore,
      completedCount,
      availableCount,
      aiRecommendations,
      aiAnalysis
    };
  }

  
  public async attemptQuest(
    questId: string,
    roomId: string,
    gameState: LocalGameState
  ): Promise<{ success: boolean; message: string; scoreAwarded?: number; aiGuidance?: string }> {
// Variable declaration
    const engine = MiniquestEngine.getInstance();

    try {
      // Get AI difficulty adaptation if enabled
      let aiGuidance: string | undefined;
      
      if (this.aiEnabled) {
        try {
          const quest = this.getAllRoomQuests(roomId).find(q => q.id === questId);
          if (quest) {
            const adaptation = await aiMiniquestService.getAdaptedDifficulty(quest, gameState);
            aiGuidance = adaptation.reasoning;
            
            // Note: Future enhancement could modify quest difficulty based on AI recommendation
          }
        } catch (error) {
          console.warn('AI difficulty adaptation failed:', error);
        }
      }

// Variable declaration
      const result = engine.attemptQuest(questId, roomId, gameState as any);

      if (result.success && this.dispatch) {
        
// Variable declaration
        const stateUpdate = engine.updateStateAfterCompletion(
          gameState as any,
          roomId,
          questId
        );

        if (Object.keys(stateUpdate).length > 0) {
          this.dispatch({
            type: 'UPDATE_GAME_STATE',
            payload: stateUpdate
          } as any);
        }

        
        if (result.scoreAwarded) {
          this.dispatch({
            type: 'UPDATE_SCORE',
            payload: { score: (gameState.player.score || 0) + result.scoreAwarded }
          } as any);
        }

        
        this.dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: result.message,
            type: 'achievement'
          }
        } as any);

        if (result.scoreAwarded) {
          this.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: `🏆 Quest completed! +${result.scoreAwarded} points`,
              type: 'system'
            }
          } as any);
        }

        // Add AI guidance message if available
        if (aiGuidance) {
          this.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              text: `💡 AI Insight: ${aiGuidance}`,
              type: 'system'
            }
          } as any);
        }
      }

      return {
        success: result.success,
        message: result.message,
        scoreAwarded: result.scoreAwarded,
        aiGuidance
      };

    } catch (error) {
      console.error('Error attempting quest:', error);
      return {
        success: false,
        message: 'An error occurred while attempting the quest.'
      };
    }
  }

  
  private getAllRoomQuests(roomId: string): any[] {
// Variable declaration
    const engine = MiniquestEngine.getInstance();
    
// JSX return block or main return
    return (engine as any).roomQuests.get(roomId) || [];
  }

  
  public getAIStatus(): { enabled: boolean; lastUpdate: Date | null; recommendations: number } {
// JSX return block or main return
    return {
      enabled: this.aiEnabled,
      lastUpdate: this.lastAIUpdate,
      recommendations: this.aiRecommendations.length
    };
  }
  private getRoomDisplayName(roomId: string, gameState: LocalGameState): string {
// Variable declaration
    const room = gameState.roomMap[roomId];
    return room?.title || roomId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  
  private calculateRoomScore(roomId: string, gameState: LocalGameState): number {
// Variable declaration
    const miniquestState = (gameState as any).miniquestState || {};
// Variable declaration
    const roomState = miniquestState[roomId];
// Variable declaration
    const completedQuests = roomState?.completedQuests || [];
// Variable declaration
    const allQuests = this.getAllRoomQuests(roomId);

    return allQuests
      .filter(quest => completedQuests.includes(quest.id))
      .reduce((total, quest) => total + quest.rewardPoints, 0);
  }

  
  private getLockReason(quest: any, gameState: LocalGameState): string | undefined {
    
    if (quest.requiredItems && quest.requiredItems.length > 0) {
// Variable declaration
      const missingItems = quest.requiredItems.filter((item: string) =>
        !gameState.player.inventory.includes(item)
      );
      if (missingItems.length > 0) {
        return `Missing items: ${missingItems.join(', ')}`;
      }
    }

    
    if (quest.requiredConditions && quest.requiredConditions.length > 0) {
      
// Variable declaration
      const unmetConditions = quest.requiredConditions.filter((condition: string) =>
        !gameState.flags[condition]
      );
      if (unmetConditions.length > 0) {
        return `Conditions not met: ${unmetConditions.join(', ')}`;
      }
    }

    return 'Requirements not met';
  }

  
  public getGlobalStats(gameState: LocalGameState): {
    totalCompleted: number;
    totalAvailable: number;
    totalScore: number;
    roomsWithQuests: number;
  } {
// Variable declaration
    const miniquestState = (gameState as any).miniquestState || {};
    let totalCompleted = 0;
    let totalScore = 0;
    let roomsWithQuests = 0;

    Object.entries(miniquestState).forEach(([roomId, roomState]: [string, any]) => {
      if (roomState.completedQuests && roomState.completedQuests.length > 0) {
        roomsWithQuests++;
        totalCompleted += roomState.completedQuests.length;

// Variable declaration
        const allQuests = this.getAllRoomQuests(roomId);
// Variable declaration
        const completedScore = allQuests
          .filter(quest => roomState.completedQuests.includes(quest.id))
          .reduce((sum, quest) => sum + quest.rewardPoints, 0);
        totalScore += completedScore;
      }
    });

    
// Variable declaration
    const engine = MiniquestEngine.getInstance();
// Variable declaration
    const allRoomIds = Object.keys(gameState.roomMap);
    let totalAvailable = 0;

    allRoomIds.forEach(roomId => {
// Variable declaration
      const availableQuests = engine.getAvailableQuests(roomId, gameState as any);
      totalAvailable += availableQuests.length;
    });

    return {
      totalCompleted,
      totalAvailable,
      totalScore,
      roomsWithQuests
    };
  }

  
  public listRoomMiniquests(roomId: string, gameState: LocalGameState): string[] {
// Variable declaration
    const engine = MiniquestEngine.getInstance();
    return engine.listRoomQuests(roomId, gameState as any);
  }

  
  public getRoomProgress(roomId: string, gameState: LocalGameState): {
    completed: number;
    available: number;
    total: number;
  } {
// Variable declaration
    const engine = MiniquestEngine.getInstance();
// Variable declaration
    const allQuests = this.getAllRoomQuests(roomId);
// Variable declaration
    const availableQuests = engine.getAvailableQuests(roomId, gameState as any);

// Variable declaration
    const miniquestState = (gameState as any).miniquestState || {};
// Variable declaration
    const roomState = miniquestState[roomId];
// Variable declaration
    const completedQuests = roomState?.completedQuests || [];

    return {
      completed: completedQuests.length,
      available: availableQuests.length,
      total: allQuests.length
    };
  }
}

export default MiniquestController;
