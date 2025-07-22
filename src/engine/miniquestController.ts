import { GameAction } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import { MiniquestData, MiniquestProgress } from '../components/MiniquestInterface';

import { MiniquestEngine } from '../engine/miniquestInitializer';



// miniquestController.ts — engine/miniquestController.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Controller for managing miniquest interface interactions


/**
 * Controller for managing miniquest interface interactions
 */

export interface MiniquestControllerResult {
  showMiniquestModal: boolean;
  miniquests: MiniquestData[];
  progress: { [questId: string]: MiniquestProgress };
  roomName: string;
  totalScore: number;
  completedCount: number;
  availableCount: number;
}

export interface MiniquestSession extends MiniquestControllerResult {
  onAttemptQuest: (questId: string) => void;
  onClose: () => void;
}

class MiniquestController {
  private static instance: MiniquestController;
  private dispatch: React.Dispatch<GameAction> | null = null;

  public static getInstance(): MiniquestController {
    if (!MiniquestController.instance) {
      MiniquestController.instance = new MiniquestController();
    }
    return MiniquestController.instance;
  }

  public setDispatch(dispatch: React.Dispatch<GameAction>) {
    this.dispatch = dispatch;
  }

  /**
   * Open the miniquest interface for the current room
   */
  public async openMiniquestInterface(
    roomId: string,
    gameState: LocalGameState
  ): Promise<MiniquestControllerResult> {
    const engine = MiniquestEngine.getInstance();

    // Get all quests for this room
    const availableQuests = engine.getAvailableQuests(roomId, gameState as any);
    const allRoomQuests = this.getAllRoomQuests(roomId);

    // Convert to interface format
    const miniquests: MiniquestData[] = allRoomQuests.map(quest => ({
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
    }));

    // Calculate progress for each quest
    const progress: { [questId: string]: MiniquestProgress } = {};
    const miniquestState = (gameState as any).miniquestState || {};
    const roomState = miniquestState[roomId];
    const completedQuests = roomState?.completedQuests || [];

    miniquests.forEach(quest => {
      const isCompleted = completedQuests.includes(quest.id);
      const isAvailable = availableQuests.find(q => q.id === quest.id) !== undefined;
      const questProgress = roomState?.questProgress?.[quest.id];

      progress[quest.id] = {
        completed: isCompleted,
        attempts: questProgress?.attempts || 0,
        available: isAvailable || isCompleted,
        locked: !isAvailable && !isCompleted,
        lockReason: this.getLockReason(quest, gameState)
      };
    });

    // Calculate stats
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    const availableCount = Object.values(progress).filter(p => p.available && !p.completed).length;
    const totalScore = this.calculateRoomScore(roomId, gameState);

    // Get room display name
    const roomName = this.getRoomDisplayName(roomId, gameState);

    return {
      showMiniquestModal: true,
      miniquests,
      progress,
      roomName,
      totalScore,
      completedCount,
      availableCount
    };
  }

  /**
   * Attempt a quest from the interface
   */
  public async attemptQuest(
    questId: string,
    roomId: string,
    gameState: LocalGameState
  ): Promise<{ success: boolean; message: string; scoreAwarded?: number }> {
    const engine = MiniquestEngine.getInstance();

    try {
      const result = engine.attemptQuest(questId, roomId, gameState as any);

      if (result.success && this.dispatch) {
        // Update game state
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

        // Add score if awarded
        if (result.scoreAwarded) {
          this.dispatch({
            type: 'UPDATE_SCORE',
            payload: { score: (gameState.player.score || 0) + result.scoreAwarded }
          } as any);
        }

        // Send success message
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
      }

      return {
        success: result.success,
        message: result.message,
        scoreAwarded: result.scoreAwarded
      };

    } catch (error) {
      console.error('Error attempting quest:', error);
      return {
        success: false,
        message: 'An error occurred while attempting the quest.'
      };
    }
  }

  /**
   * Get all quests for a room (including unavailable ones)
   */
  private getAllRoomQuests(roomId: string): any[] {
    const engine = MiniquestEngine.getInstance();
    // Access the private roomQuests map through getInstance
    return (engine as any).roomQuests.get(roomId) || [];
  }

  /**
   * Get display name for a room
   */
  private getRoomDisplayName(roomId: string, gameState: LocalGameState): string {
    const room = gameState.roomMap[roomId];
    return room?.title || roomId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  /**
   * Calculate total score from completed quests in room
   */
  private calculateRoomScore(roomId: string, gameState: LocalGameState): number {
    const miniquestState = (gameState as any).miniquestState || {};
    const roomState = miniquestState[roomId];
    const completedQuests = roomState?.completedQuests || [];
    const allQuests = this.getAllRoomQuests(roomId);

    return allQuests
      .filter(quest => completedQuests.includes(quest.id))
      .reduce((total, quest) => total + quest.rewardPoints, 0);
  }

  /**
   * Get reason why a quest is locked
   */
  private getLockReason(quest: any, gameState: LocalGameState): string | undefined {
    // Check required items
    if (quest.requiredItems && quest.requiredItems.length > 0) {
      const missingItems = quest.requiredItems.filter((item: string) =>
        !gameState.player.inventory.includes(item)
      );
      if (missingItems.length > 0) {
        return `Missing items: ${missingItems.join(', ')}`;
      }
    }

    // Check required conditions
    if (quest.requiredConditions && quest.requiredConditions.length > 0) {
      // Simple flag checking - can be expanded
      const unmetConditions = quest.requiredConditions.filter((condition: string) =>
        !gameState.flags[condition]
      );
      if (unmetConditions.length > 0) {
        return `Conditions not met: ${unmetConditions.join(', ')}`;
      }
    }

    return 'Requirements not met';
  }

  /**
   * Get global miniquest statistics
   */
  public getGlobalStats(gameState: LocalGameState): {
    totalCompleted: number;
    totalAvailable: number;
    totalScore: number;
    roomsWithQuests: number;
  } {
    const miniquestState = (gameState as any).miniquestState || {};
    let totalCompleted = 0;
    let totalScore = 0;
    let roomsWithQuests = 0;

    Object.entries(miniquestState).forEach(([roomId, roomState]: [string, any]) => {
      if (roomState.completedQuests && roomState.completedQuests.length > 0) {
        roomsWithQuests++;
        totalCompleted += roomState.completedQuests.length;

        const allQuests = this.getAllRoomQuests(roomId);
        const completedScore = allQuests
          .filter(quest => roomState.completedQuests.includes(quest.id))
          .reduce((sum, quest) => sum + quest.rewardPoints, 0);
        totalScore += completedScore;
      }
    });

    // Calculate total available across all rooms
    const engine = MiniquestEngine.getInstance();
    const allRoomIds = Object.keys(gameState.roomMap);
    let totalAvailable = 0;

    allRoomIds.forEach(roomId => {
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

  /**
   * List available miniquests for command interface
   */
  public listRoomMiniquests(roomId: string, gameState: LocalGameState): string[] {
    const engine = MiniquestEngine.getInstance();
    return engine.listRoomQuests(roomId, gameState as any);
  }

  /**
   * Get room progress summary
   */
  public getRoomProgress(roomId: string, gameState: LocalGameState): {
    completed: number;
    available: number;
    total: number;
  } {
    const engine = MiniquestEngine.getInstance();
    const allQuests = this.getAllRoomQuests(roomId);
    const availableQuests = engine.getAvailableQuests(roomId, gameState as any);

    const miniquestState = (gameState as any).miniquestState || {};
    const roomState = miniquestState[roomId];
    const completedQuests = roomState?.completedQuests || [];

    return {
      completed: completedQuests.length,
      available: availableQuests.length,
      total: allQuests.length
    };
  }
}

export default MiniquestController;
