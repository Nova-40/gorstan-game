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


import type { GameState } from '../types/GameTypes';
import type { Miniquest, MiniquestState, MiniquestResult, MiniquestProgress } from '../types/GameTypes';














type GameStateWithMiniquests = GameState & {
  miniquestState?: MiniquestState;
};



class MiniquestEngine {
  private static instance: MiniquestEngine;
  private roomQuests: Map<string, Miniquest[]> = new Map();

  public static getInstance(): MiniquestEngine {
    if (!MiniquestEngine.instance) {
      MiniquestEngine.instance = new MiniquestEngine();
    }
    return MiniquestEngine.instance;
  }

  
  public registerRoomQuests(roomId: string, quests: readonly Miniquest[]): void {
    this.roomQuests.set(roomId, [...quests]);
  }

  
  public getAvailableQuests(roomId: string, gameState: GameStateWithMiniquests): Miniquest[] {
// Variable declaration
    const roomQuests = this.roomQuests.get(roomId) || [];
// Variable declaration
    const miniquestState = gameState.miniquestState || {};
// Variable declaration
    const roomState = miniquestState[roomId];
// Variable declaration
    const completedQuests = roomState?.completedQuests || [];

    return roomQuests.filter((quest: Miniquest) => {
      if (completedQuests.includes(quest.id) && !quest.repeatable) {
        return false;
      }
      if (quest.requiredItems) {
        const hasAllItems = quest.requiredItems.every((item: string) =>
          gameState.player.inventory.includes(item)
        );
        if (!hasAllItems) return false;
      }
      if (quest.requiredConditions) {
        const meetsConditions = quest.requiredConditions.every((condition: string) => {
          return gameState.flags[condition] === true;
        });
        if (!meetsConditions) return false;
      }
      return true;
    });
  }

  
  public attemptQuest(
    questId: string,
    roomId: string,
    gameState: GameStateWithMiniquests,
    triggerAction?: string
  ): MiniquestResult {
// Variable declaration
    const quest = this.findQuest(questId, roomId);
    if (!quest) {
      return {
        success: false,
        message: `Quest ${questId} not found in ${roomId}.`
      };
    }

    
// Variable declaration
    const availableQuests = this.getAvailableQuests(roomId, gameState);
    if (!availableQuests.find(q => q.id === quest.id)) {
      return {
        success: false,
        message: "You cannot attempt this quest right now."
      };
    }

    
    if (quest.triggerAction && triggerAction !== quest.triggerAction) {
      return {
        success: false,
        message: quest.triggerText || `Try: ${quest.triggerAction}`
      };
    }

    
// Variable declaration
    const success = this.calculateSuccess(quest, gameState);

    if (success) {
      return this.completeQuest(quest, roomId, gameState);
    } else {
      return this.failQuest(quest, roomId, gameState);
    }
  }

  
  private completeQuest(quest: Miniquest, roomId: string, gameState: GameStateWithMiniquests): MiniquestResult {
    
    const { applyScoreForEvent } = require('../state/scoreEffects');

    
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

  
  private calculateSuccess(quest: Miniquest, gameState: GameStateWithMiniquests): boolean {
    let baseChance = 0.7; 

    
    switch (quest.difficulty as 'trivial' | 'easy' | 'medium' | 'hard' | undefined) {
      case 'trivial': baseChance = 0.95; break;
      case 'easy': baseChance = 0.85; break;
      case 'medium': baseChance = 0.7; break;
      case 'hard': baseChance = 0.5; break;
    }

    
    switch (quest.type) {
      case 'dynamic':
        baseChance += 0.1; 
        break;
      case 'puzzle':
        
// Variable declaration
        const playerTraits = gameState.player.traits || [];
        if (playerTraits.includes('analytical') || playerTraits.includes('scholar')) {
          baseChance += 0.15;
        }
        break;
      case 'social':
        if (gameState.player.inventory.includes('dominic')) {
          baseChance += 0.1; 
        }
        break;
    }

    return Math.random() < baseChance;
  }

  
  private findQuest(questId: string, roomId: string): Miniquest | undefined {
// Variable declaration
    const roomQuests = this.roomQuests.get(roomId) || [];
    return roomQuests.find((q: Miniquest) => q.id === questId || q.title.toLowerCase().includes(questId.toLowerCase()));
  }

  
  public listRoomQuests(roomId: string, gameState: GameStateWithMiniquests): string[] {
// Variable declaration
    const roomQuests = this.roomQuests.get(roomId) || [];
// Variable declaration
    const miniquestState = gameState.miniquestState || {};
// Variable declaration
    const roomState = miniquestState[roomId];
// Variable declaration
    const completedQuests = roomState?.completedQuests || [];
// Variable declaration
    const availableQuests = this.getAvailableQuests(roomId, gameState);

    if (roomQuests.length === 0) {
      return ["No miniquests available in this area."];
    }

    const messages: string[] = [
      "🎯 **Miniquests in this area:**",
      ""
    ];

    roomQuests.forEach((quest: Miniquest) => {
      const isCompleted = completedQuests.includes(quest.id);
      const isAvailable = availableQuests.find((q: Miniquest) => q.id === quest.id);
      let status = "🔒 LOCKED";
      if (isCompleted && !quest.repeatable) {
        status = "✅ COMPLETED";
      } else if (isCompleted && quest.repeatable) {
        status = "🔄 REPEATABLE";
      } else if (isAvailable) {
        status = "🆕 AVAILABLE";
      }
      const difficultyIconMap: Record<'trivial' | 'easy' | 'medium' | 'hard', string> = {
        'trivial': '⭐',
        'easy': '⭐⭐',
        'medium': '⭐⭐⭐',
        'hard': '⭐⭐⭐⭐'
      };
      const difficultyIcon = difficultyIconMap[(quest.difficulty as 'trivial' | 'easy' | 'medium' | 'hard') || 'easy'];
      messages.push(`• ${quest.title} [${quest.type.toUpperCase()}] ${difficultyIcon} - ${status}`);
      messages.push(`  ${quest.description}`);
      if (quest.requiredItems && quest.requiredItems.length > 0) {
        const hasItems = quest.requiredItems.every((item: string) =>
          gameState.player.inventory.includes(item)
        );
        const itemStatus = hasItems ? '✅' : '❌';
        messages.push(`  Required items: ${quest.requiredItems.join(', ')} ${itemStatus}`);
      }
      messages.push("");
    });

    return messages;
  }

  
  public initializeState(): MiniquestState {
    return {};
  }

  
  public updateStateAfterCompletion(
    gameState: GameStateWithMiniquests,
    roomId: string,
    questId: string
  ): Partial<GameStateWithMiniquests> {
// Variable declaration
    const currentState = gameState.miniquestState || {};
// Variable declaration
    const roomState = currentState[roomId] || {
      availableQuests: [],
      completedQuests: [],
      activeQuests: [],
      questProgress: {}
    };

// Variable declaration
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
