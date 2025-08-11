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

import PuzzleEngine, { PuzzleResult } from '../engine/puzzleEngine';

import React from 'react';

import { Achievement, Puzzle } from '../types/GameTypes';

import { GameAction } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import { PuzzleData } from '../components/PuzzleInterface';









export interface PuzzleControllerResult {
  showPuzzleModal: boolean;
  puzzle?: PuzzleData;
  onSubmit?: (solution: any) => Promise<PuzzleResult>;
  onClose?: () => void;
  onHint?: (hintIndex: number) => void;
  currentAttempt?: number;
  timeRemaining?: number;
}


class PuzzleController {
  private static instance: PuzzleController;
  private puzzleEngine: PuzzleEngine;
  private currentPuzzle: PuzzleData | null = null;
  private dispatch: React.Dispatch<GameAction> | null = null;

  private constructor() {
    this.puzzleEngine = PuzzleEngine.getInstance();
    this.puzzleEngine.initialize();
  }

  public static getInstance(): PuzzleController {
    if (!PuzzleController.instance) {
      PuzzleController.instance = new PuzzleController();
    }
    return PuzzleController.instance;
  }

  
  public setDispatch(dispatch: React.Dispatch<GameAction>): void {
    this.dispatch = dispatch;
  }

  
  public listRoomPuzzles(roomId: string, gameState: LocalGameState): string[] {
// Variable declaration
    const puzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);

    if (puzzles.length === 0) {
      return ['No puzzles available in this area.'];
    }

    const messages: string[] = [
      '🧩 **Puzzles in this area:**',
      ''
    ];

    puzzles.forEach((puzzle: PuzzleData) => {
// Variable declaration
      const puzzleState = (gameState as any).puzzleState?.[puzzle.id];
// Variable declaration
      const solved = puzzleState?.solved;
// Variable declaration
      const attempts = puzzleState?.attempts || 0;
// Variable declaration
      const maxAttempts = puzzle.maxAttempts || 5;

// Variable declaration
      const status = solved ? '✅ SOLVED' :
                    attempts >= maxAttempts ? '❌ EXHAUSTED' :
                    attempts > 0 ? `🔄 ${maxAttempts - attempts} attempts left` : '🆕 NEW';

      messages.push(`• ${puzzle.name} [${puzzle.difficulty.toUpperCase()}] - ${status}`);

      if (puzzle.description) {
        messages.push(`  ${puzzle.description}`);
      }

      
      const requirements: string[] = [];

      if (puzzle.requiredItems?.length) {
// Variable declaration
        const hasItems = puzzle.requiredItems.every((item: string) =>
          gameState.player.inventory.includes(item)
        );
// Variable declaration
        const itemStatus = hasItems ? '✅' : '❌';
        requirements.push(`Items: ${puzzle.requiredItems.join(', ')} ${itemStatus}`);
      }

      if (puzzle.requiredTraits?.length) {
// Variable declaration
        const playerTraits = gameState.player.traits || [];
// Variable declaration
        const hasTraits = puzzle.requiredTraits.every((trait: string) =>
          playerTraits.includes(trait)
        );
// Variable declaration
        const traitStatus = hasTraits ? '✅' : '❌';
        requirements.push(`Traits: ${puzzle.requiredTraits.join(', ')} ${traitStatus}`);
      }

      if (requirements.length > 0) {
        messages.push(`  Requirements: ${requirements.join(', ')}`);
      }

      messages.push('');
    });

    messages.push('Use `puzzle solve [puzzle name]` to open the puzzle interface');

    return messages;
  }

  
  public async startPuzzle(
    puzzleId: string,
    roomId: string,
    gameState: LocalGameState
  ): Promise<PuzzleControllerResult> {
    
// Variable declaration
    const availablePuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
// Variable declaration
    const puzzle = availablePuzzles.find((p: PuzzleData) =>
      p.id === puzzleId ||
      p.name.toLowerCase().includes(puzzleId.toLowerCase())
    );

    if (!puzzle) {
      return {
        showPuzzleModal: false
      };
    }

    this.currentPuzzle = puzzle;

    
// Variable declaration
    const puzzleState = (gameState as any).puzzleState?.[puzzle.id];
// Variable declaration
    const currentAttempt = puzzleState?.attempts || 0;

    
    let timeRemaining: number | undefined;
    if (puzzle.timeLimit && puzzleState?.timeStarted) {
// Variable declaration
      const elapsed = (Date.now() - puzzleState.timeStarted) / 1000;
      timeRemaining = Math.max(0, puzzle.timeLimit - elapsed);
    }

    return {
      showPuzzleModal: true,
      puzzle,
      onSubmit: this.createSubmitHandler(puzzle, gameState),
      onClose: this.createCloseHandler(),
      onHint: this.createHintHandler(puzzle),
      currentAttempt,
      timeRemaining
    };
  }

  
  private createSubmitHandler(
    puzzle: PuzzleData,
    gameState: LocalGameState
  ) {
    return async (solution: any): Promise<PuzzleResult> => {
      try {
// Variable declaration
        const result = await this.puzzleEngine.solvePuzzle(puzzle.id, solution, gameState);

        if (this.dispatch) {
          
          this.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: result.feedback,
              type: result.success ? 'system' : 'error',
              timestamp: Date.now()
            }
          });

          
          if (result.success && result.rewards) {
            this.handlePuzzleRewards(result.rewards, gameState);
          }
        }

        return result;
      } catch (error) {
        console.error('Error solving puzzle:', error);
        return {
          success: false,
          feedback: 'An error occurred while processing your solution.'
        };
      }
    };
  }

  
  private createCloseHandler() {
// JSX return block or main return
    return () => {
      this.currentPuzzle = null;
    };
  }

  
  private createHintHandler(puzzle: PuzzleData) {
// JSX return block or main return
    return (hintIndex: number) => {
      if (!this.dispatch || !puzzle.hints || hintIndex >= puzzle.hints.length) {
        return;
      }

// Variable declaration
      const hint = puzzle.hints[hintIndex];

      this.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: `💡 Hint ${hintIndex + 1}: ${hint}`,
          type: 'info',
          timestamp: Date.now()
        }
      });
    };
  }

  
  private handlePuzzleRewards(
    rewards: NonNullable<PuzzleResult['rewards']>,
    gameState: LocalGameState
  ): void {
    if (!this.dispatch) return;

    
    if (rewards.score) {
      this.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: `🌟 Score: +${rewards.score} points!`,
          type: 'system',
          timestamp: Date.now()
        }
      });

      this.dispatch({
        type: 'UPDATE_PLAYER',
        payload: {
          score: (gameState.player.score || 0) + rewards.score
        }
      });
    }

    
    if (rewards.items?.length) {
      rewards.items.forEach((item: string) => {
        this.dispatch!({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: `📦 Received: ${item}`,
            type: 'system',
            timestamp: Date.now()
          }
        });

        this.dispatch!({
          type: 'UPDATE_PLAYER',
          payload: {
            inventory: [...gameState.player.inventory, item]
          }
        });
      });
    }

    
    if (rewards.achievements?.length) {
      rewards.achievements.forEach((achievement: string) => {
        this.dispatch!({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: `🏆 Achievement Unlocked: ${achievement}`,
            type: 'system',
            timestamp: Date.now()
          }
        });
      });
    }

    
    if (rewards.story?.length) {
      rewards.story.forEach((story: string, index: number) => {
        setTimeout(() => {
          this.dispatch!({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: story,
              type: 'lore',
              timestamp: Date.now()
            }
          });
        }, index * 1000);
      });
    }

    
    if ((rewards as any).teleport) {
      setTimeout(() => {
        this.dispatch!({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: '🌌 Reality shifts around you as you are transported elsewhere...',
            type: 'system',
            timestamp: Date.now()
          }
        });

        this.dispatch!({
          type: 'MOVE_TO_ROOM',
          payload: (rewards as any).teleport!
        });
      }, 2000);
    }
  }

  
  public canStartPuzzle(
    puzzleId: string,
    roomId: string,
    gameState: LocalGameState
  ): { canStart: boolean; reason?: string } {
// Variable declaration
    const availablePuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
// Variable declaration
    const puzzle = availablePuzzles.find((p: PuzzleData) =>
      p.id === puzzleId ||
      p.name.toLowerCase().includes(puzzleId.toLowerCase())
    );

    if (!puzzle) {
      return {
        canStart: false,
        reason: 'Puzzle not found or not available in this area.'
      };
    }

// Variable declaration
    const puzzleState = (gameState as any).puzzleState?.[puzzle.id];

    
    if (puzzleState?.solved && !puzzle.type.includes('repeatable')) {
      return {
        canStart: false,
        reason: 'This puzzle has already been solved.'
      };
    }

    
    if (puzzle.maxAttempts && puzzleState?.attempts >= puzzle.maxAttempts) {
      return {
        canStart: false,
        reason: 'You have reached the maximum number of attempts for this puzzle.'
      };
    }

    
    if (puzzle.requiredItems?.length) {
// Variable declaration
      const missingItems = puzzle.requiredItems.filter((item: string) =>
        !gameState.player.inventory.includes(item)
      );
      if (missingItems.length > 0) {
        return {
          canStart: false,
          reason: `Missing required items: ${missingItems.join(', ')}`
        };
      }
    }

    
    if (puzzle.requiredTraits?.length) {
// Variable declaration
      const playerTraits = gameState.player.traits || [];
// Variable declaration
      const missingTraits = puzzle.requiredTraits.filter((trait: string) =>
        !playerTraits.includes(trait)
      );
      if (missingTraits.length > 0) {
        return {
          canStart: false,
          reason: `Missing required traits: ${missingTraits.join(', ')}`
        };
      }
    }

    return { canStart: true };
  }

  
  public getRoomPuzzleProgress(roomId: string, gameState: LocalGameState): {
    total: number;
    solved: number;
    available: number;
  } {
// Variable declaration
    const allPuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
// Variable declaration
    const availablePuzzles = allPuzzles; 

// Variable declaration
    const solvedCount = allPuzzles.filter((puzzle: PuzzleData) =>
      (gameState as any).puzzleState?.[puzzle.id]?.solved
    ).length;

    return {
      total: allPuzzles.length,
      solved: solvedCount,
      available: availablePuzzles.length
    };
  }
}

export default PuzzleController;
