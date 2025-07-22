import PuzzleEngine, { PuzzleResult } from '../engine/puzzleEngine';

import React from 'react';

import { Achievement, Puzzle } from './GameTypes';

import { GameAction } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import { PuzzleData } from '../components/PuzzleInterface';



// puzzleController.ts — engine/puzzleController.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Enhanced puzzle controller that manages puzzle UI and state


export interface PuzzleControllerResult {
  showPuzzleModal: boolean;
  puzzle?: PuzzleData;
  onSubmit?: (solution: any) => Promise<PuzzleResult>;
  onClose?: () => void;
  onHint?: (hintIndex: number) => void;
  currentAttempt?: number;
  timeRemaining?: number;
}

/**
 * Enhanced puzzle controller that manages puzzle UI and state
 */
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

  /**
   * Set the dispatch function for updating game state
   */
  public setDispatch(dispatch: React.Dispatch<GameAction>): void {
    this.dispatch = dispatch;
  }

  /**
   * List available puzzles in current room
   */
  public listRoomPuzzles(roomId: string, gameState: LocalGameState): string[] {
    const puzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);

    if (puzzles.length === 0) {
      return ['No puzzles available in this area.'];
    }

    const messages: string[] = [
      '🧩 **Puzzles in this area:**',
      ''
    ];

    puzzles.forEach((puzzle: PuzzleData) => {
      const puzzleState = (gameState as any).puzzleState?.[puzzle.id];
      const solved = puzzleState?.solved;
      const attempts = puzzleState?.attempts || 0;
      const maxAttempts = puzzle.maxAttempts || 5;

      const status = solved ? '✅ SOLVED' :
                    attempts >= maxAttempts ? '❌ EXHAUSTED' :
                    attempts > 0 ? `🔄 ${maxAttempts - attempts} attempts left` : '🆕 NEW';

      messages.push(`• ${puzzle.name} [${puzzle.difficulty.toUpperCase()}] - ${status}`);

      if (puzzle.description) {
        messages.push(`  ${puzzle.description}`);
      }

      // Show requirements
      const requirements: string[] = [];

      if (puzzle.requiredItems?.length) {
        const hasItems = puzzle.requiredItems.every((item: string) =>
          gameState.player.inventory.includes(item)
        );
        const itemStatus = hasItems ? '✅' : '❌';
        requirements.push(`Items: ${puzzle.requiredItems.join(', ')} ${itemStatus}`);
      }

      if (puzzle.requiredTraits?.length) {
        const playerTraits = gameState.player.traits || [];
        const hasTraits = puzzle.requiredTraits.every((trait: string) =>
          playerTraits.includes(trait)
        );
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

  /**
   * Start a puzzle solving session
   */
  public async startPuzzle(
    puzzleId: string,
    roomId: string,
    gameState: LocalGameState
  ): Promise<PuzzleControllerResult> {
    // Find the puzzle by ID or name
    const availablePuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
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

    // Get current attempt count
    const puzzleState = (gameState as any).puzzleState?.[puzzle.id];
    const currentAttempt = puzzleState?.attempts || 0;

    // Calculate time remaining if there's a time limit
    let timeRemaining: number | undefined;
    if (puzzle.timeLimit && puzzleState?.timeStarted) {
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

  /**
   * Create submit handler for puzzle solutions
   */
  private createSubmitHandler(
    puzzle: PuzzleData,
    gameState: LocalGameState
  ) {
    return async (solution: any): Promise<PuzzleResult> => {
      try {
        const result = await this.puzzleEngine.solvePuzzle(puzzle.id, solution, gameState);

        if (this.dispatch) {
          // Add feedback message
          this.dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: result.feedback,
              type: result.success ? 'system' : 'error',
              timestamp: Date.now()
            }
          });

          // Handle rewards
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

  /**
   * Create close handler for puzzle modal
   */
  private createCloseHandler() {
    return () => {
      this.currentPuzzle = null;
    };
  }

  /**
   * Create hint handler for puzzle hints
   */
  private createHintHandler(puzzle: PuzzleData) {
    return (hintIndex: number) => {
      if (!this.dispatch || !puzzle.hints || hintIndex >= puzzle.hints.length) {
        return;
      }

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

  /**
   * Handle puzzle completion rewards
   */
  private handlePuzzleRewards(
    rewards: NonNullable<PuzzleResult['rewards']>,
    gameState: LocalGameState
  ): void {
    if (!this.dispatch) return;

    // Award score
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

    // Award items
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

    // Unlock achievements
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

    // Display story rewards
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

    // Handle teleportation
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

  /**
   * Check if a puzzle can be started
   */
  public canStartPuzzle(
    puzzleId: string,
    roomId: string,
    gameState: LocalGameState
  ): { canStart: boolean; reason?: string } {
    const availablePuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
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

    const puzzleState = (gameState as any).puzzleState?.[puzzle.id];

    // Check if already solved
    if (puzzleState?.solved && !puzzle.type.includes('repeatable')) {
      return {
        canStart: false,
        reason: 'This puzzle has already been solved.'
      };
    }

    // Check max attempts
    if (puzzle.maxAttempts && puzzleState?.attempts >= puzzle.maxAttempts) {
      return {
        canStart: false,
        reason: 'You have reached the maximum number of attempts for this puzzle.'
      };
    }

    // Check required items
    if (puzzle.requiredItems?.length) {
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

    // Check required traits
    if (puzzle.requiredTraits?.length) {
      const playerTraits = gameState.player.traits || [];
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

  /**
   * Get puzzle progress for a room
   */
  public getRoomPuzzleProgress(roomId: string, gameState: LocalGameState): {
    total: number;
    solved: number;
    available: number;
  } {
    const allPuzzles = this.puzzleEngine.getRoomPuzzles(roomId, gameState);
    const availablePuzzles = allPuzzles; // getRoomPuzzles already filters for availability

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
