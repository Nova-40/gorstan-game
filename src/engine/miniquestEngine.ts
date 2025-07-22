import { GameState } from '../types/GameTypes';

import { Miniquest } from './GameTypes';

import { Miniquest, MiniquestState, MiniquestResult, MiniquestProgress } from '../types/MiniquestTypes';

import { Room } from '../types.d';

import { Room } from './RoomTypes';



// miniquestEngine.ts — engine/miniquestEngine.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Core miniquest engine for handling optional challenges and flavor content

// Module: src/engine/miniquestEngine.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


// Extended GameState interface for miniquest functionality
type GameStateWithMiniquests = GameState & {
  miniquestState?: MiniquestState;
};

/**
 * Core miniquest engine for handling optional challenges and flavor content
 */

class MiniquestEngine {
  private static instance: MiniquestEngine;
  private roomQuests: Map<string, Miniquest[]> = new Map();

  public static getInstance(): MiniquestEngine {
    if (!MiniquestEngine.instance) {
      MiniquestEngine.instance = new MiniquestEngine();
    }
    return MiniquestEngine.instance;
  }

  /**
   * Register miniquests for a room
   */
  public registerRoomQuests(roomId: string, quests: readonly Miniquest[]): void {
    this.roomQuests.set(roomId, [...quests]);
  }

  /**
   * Get available miniquests for a room
   */
  public getAvailableQuests(roomId: string, gameState: GameStateWithMiniquests): Miniquest[] {
    const roomQuests = this.roomQuests.get(roomId) || [];
    const miniquestState = gameState.miniquestState || {};
    const roomState = miniquestState[roomId];
    const completedQuests = roomState?.completedQuests || [];

    return roomQuests.filter(quest => {
      // Skip completed non-repeatable quests
      if (completedQuests.includes(quest.id) && !quest.repeatable) {
        return false;
      }

      // Check required items
      if (quest.requiredItems) {
        const hasAllItems = quest.requiredItems.every(item =>
          gameState.player.inventory.includes(item)
        );
        if (!hasAllItems) return false;
      }

      // Check required conditions
      if (quest.requiredConditions) {
        const meetsConditions = quest.requiredConditions.every(condition => {
          // Simple flag checking - can be expanded
          return gameState.flags[condition] === true;
        });
        if (!meetsConditions) return false;
      }

      return true;
    });
  }

  /**
   * Attempt to complete a miniquest
   */
  public attemptQuest(
    questId: string,
    roomId: string,
    gameState: GameStateWithMiniquests,
    triggerAction?: string
  ): MiniquestResult {
    const quest = this.findQuest(questId, roomId);
    if (!quest) {
      return {
        success: false,
        message: `Quest ${questId} not found in ${roomId}.`
      };
    }

    // Check if quest can be attempted
    const availableQuests = this.getAvailableQuests(roomId, gameState);
    if (!availableQuests.find(q => q.id === quest.id)) {
      return {
        success: false,
        message: "You cannot attempt this quest right now."
      };
    }

    // Check trigger action if specified
    if (quest.triggerAction && triggerAction !== quest.triggerAction) {
      return {
        success: false,
        message: quest.triggerText || `Try: ${quest.triggerAction}`
      };
    }

    // Calculate success based on quest type and difficulty
    const success = this.calculateSuccess(quest, gameState);

    if (success) {
      return this.completeQuest(quest, roomId, gameState);
    } else {
      return this.failQuest(quest, roomId, gameState);
    }
  }

  /**
   * Complete a miniquest
   */
  private completeQuest(quest: Miniquest, roomId: string, gameState: GameStateWithMiniquests): MiniquestResult {
    // Award score
    const { applyScoreForEvent } = require('../state/scoreEffects');

    // Different score events based on quest type
    switch (quest.type) {
      case 'puzzle':
        applyScoreForEvent('solve.puzzle.simple');
        break;
      case 'exploration':
        applyScoreForEvent('discover.location');
        break;
      case 'social':
        applyScoreForEvent('conversation.meaningful');
        break;
      default:
        applyScoreForEvent('miniquest.completed');
    }

    // Record completion in codex
    const { recordMiniquestCompletion } = require('../logic/codexTracker');
    recordMiniquestCompletion(quest.id, quest.title, roomId);

    return {
      success: true,
      message: `🎯 Miniquest completed: ${quest.title}!`,
      scoreAwarded: quest.rewardPoints,
      flagsSet: [quest.flagOnCompletion],
      completed: true
    };
  }

  /**
   * Fail a miniquest attempt
   */
  private failQuest(quest: Miniquest, roomId: string, gameState: GameStateWithMiniquests): MiniquestResult {
    let message = `You attempt "${quest.title}" but don't succeed this time.`;

    if (quest.hint) {
      message += ` ${quest.hint}`;
    }

    return {
      success: false,
      message,
      completed: false
    };
  }

  /**
   * Calculate success chance based on quest properties
   */
  private calculateSuccess(quest: Miniquest, gameState: GameStateWithMiniquests): boolean {
    let baseChance = 0.7; // 70% base success rate

    // Adjust by difficulty
    switch (quest.difficulty) {
      case 'trivial': baseChance = 0.95; break;
      case 'easy': baseChance = 0.85; break;
      case 'medium': baseChance = 0.7; break;
      case 'hard': baseChance = 0.5; break;
    }

    // Adjust by quest type
    switch (quest.type) {
      case 'dynamic':
        baseChance += 0.1; // Dynamic quests are generally easier
        break;
      case 'puzzle':
        // Check player traits for puzzle bonuses
        const playerTraits = gameState.player.traits || [];
        if (playerTraits.includes('analytical') || playerTraits.includes('scholar')) {
          baseChance += 0.15;
        }
        break;
      case 'social':
        if (gameState.player.inventory.includes('dominic')) {
          baseChance += 0.1; // Dominic helps with social situations
        }
        break;
    }

    return Math.random() < baseChance;
  }

  /**
   * Find a quest by ID in a room
   */
  private findQuest(questId: string, roomId: string): Miniquest | undefined {
    const roomQuests = this.roomQuests.get(roomId) || [];
    return roomQuests.find(q => q.id === questId || q.title.toLowerCase().includes(questId.toLowerCase()));
  }

  /**
   * List all miniquests in a room with their status
   */
  public listRoomQuests(roomId: string, gameState: GameStateWithMiniquests): string[] {
    const roomQuests = this.roomQuests.get(roomId) || [];
    const miniquestState = gameState.miniquestState || {};
    const roomState = miniquestState[roomId];
    const completedQuests = roomState?.completedQuests || [];
    const availableQuests = this.getAvailableQuests(roomId, gameState);

    if (roomQuests.length === 0) {
      return ["No miniquests available in this area."];
    }

    const messages: string[] = [
      "🎯 **Miniquests in this area:**",
      ""
    ];

    roomQuests.forEach(quest => {
      const isCompleted = completedQuests.includes(quest.id);
      const isAvailable = availableQuests.find(q => q.id === quest.id);

      let status = "🔒 LOCKED";
      if (isCompleted && !quest.repeatable) {
        status = "✅ COMPLETED";
      } else if (isCompleted && quest.repeatable) {
        status = "🔄 REPEATABLE";
      } else if (isAvailable) {
        status = "🆕 AVAILABLE";
      }

      const difficultyIcon = {
        'trivial': '⭐',
        'easy': '⭐⭐',
        'medium': '⭐⭐⭐',
        'hard': '⭐⭐⭐⭐'
      }[quest.difficulty || 'easy'];

      messages.push(`• ${quest.title} [${quest.type.toUpperCase()}] ${difficultyIcon} - ${status}`);
      messages.push(`  ${quest.description}`);

      if (quest.requiredItems && quest.requiredItems.length > 0) {
        const hasItems = quest.requiredItems.every(item =>
          gameState.player.inventory.includes(item)
        );
        const itemStatus = hasItems ? '✅' : '❌';
        messages.push(`  Required items: ${quest.requiredItems.join(', ')} ${itemStatus}`);
      }

      messages.push("");
    });

    return messages;
  }

  /**
   * Initialize miniquest state for a new game
   */
  public initializeState(): MiniquestState {
    return {};
  }

  /**
   * Update miniquest state after completion
   */
  public updateStateAfterCompletion(
    gameState: GameStateWithMiniquests,
    roomId: string,
    questId: string
  ): Partial<GameStateWithMiniquests> {
    const currentState = gameState.miniquestState || {};
    const roomState = currentState[roomId] || {
      availableQuests: [],
      completedQuests: [],
      activeQuests: [],
      questProgress: {}
    };

    const newRoomState = {
      ...roomState,
      completedQuests: [...roomState.completedQuests, questId],
      activeQuests: roomState.activeQuests.filter((id: string) => id !== questId)
    };

    return {
      miniquestState: {
        ...currentState,
        [roomId]: newRoomState
      },
      flags: {
        ...gameState.flags,
        [`miniquest_${questId}_completed`]: true
      }
    };
  }
}

export default MiniquestEngine;
