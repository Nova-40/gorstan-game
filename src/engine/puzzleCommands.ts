// puzzleCommands.ts — engine/puzzleCommands.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Enhanced puzzle commands integration for the command processor

import { LocalGameState } from '../state/gameState';
import { GameAction, GameMessage } from '../types/GameTypes';
import PuzzleController, { PuzzleControllerResult } from '../engine/puzzleController';

/**
 * Enhanced puzzle commands integration for the command processor
 */

export interface PuzzleCommandResult {
  messages: GameMessage[];
  puzzleModal?: PuzzleControllerResult;
  updates?: Partial<LocalGameState>;
}

/**
 * Create a properly formatted GameMessage
 */
function createGameMessage(
  text: string, 
  type: GameMessage['type'] = 'system',
  speaker?: string
): GameMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    type,
    timestamp: Date.now(),
    speaker
  };
}

/**
 * Handle puzzle-related commands
 */
export async function processPuzzleCommand(
  command: string,
  gameState: LocalGameState,
  currentRoomId: string,
  dispatch: React.Dispatch<GameAction>
): Promise<PuzzleCommandResult | null> {
  const commandWords = command.toLowerCase().trim().split(/\s+/);
  const verb = commandWords[0];
  const noun = commandWords.slice(1).join(' ');

  const puzzleController = PuzzleController.getInstance();
  puzzleController.setDispatch(dispatch);

  switch (verb) {
    case 'puzzle':
    case 'puzzles': {
      if (!noun || noun === 'list') {
        // List available puzzles
        const puzzleMessages = puzzleController.listRoomPuzzles(currentRoomId, gameState);
        return {
          messages: puzzleMessages.map(msg => createGameMessage(msg))
        };
      }

      if (noun.startsWith('solve ')) {
        // Start puzzle solving
        const puzzleId = noun.substring(6).trim();
        return await handlePuzzleSolve(puzzleId, currentRoomId, gameState, puzzleController);
      }

      if (noun.startsWith('progress')) {
        // Show puzzle progress
        const progress = puzzleController.getRoomPuzzleProgress(currentRoomId, gameState);
        return {
          messages: [
            createGameMessage(`🧩 **Puzzle Progress for ${currentRoomId}:**`),
            createGameMessage(`Solved: ${progress.solved}/${progress.total}`),
            createGameMessage(`Available: ${progress.available}`),
            createGameMessage(`Completion: ${progress.total > 0 ? Math.round((progress.solved / progress.total) * 100) : 0}%`)
          ]
        };
      }

      return {
        messages: [
          createGameMessage('Puzzle commands:'),
          createGameMessage('  puzzle list - List available puzzles'),
          createGameMessage('  puzzle solve [name] - Start solving a puzzle'),
          createGameMessage('  puzzle progress - Show completion progress')
        ]
      };
    }

    case 'solve': {
      if (!noun) {
        return {
          messages: [createGameMessage('What puzzle do you want to solve? Use "puzzle list" to see available puzzles.', 'error')]
        };
      }

      return await handlePuzzleSolve(noun, currentRoomId, gameState, puzzleController);
    }

    case 'hint': {
      // Contextual hints - could be expanded to include puzzle-specific hints
      const puzzles = puzzleController.listRoomPuzzles(currentRoomId, gameState);
      
      if (puzzles.length > 1) { // More than just the "no puzzles" message
        return {
          messages: [
            createGameMessage('💡 **Puzzle Hints:**'),
            createGameMessage('• Use "puzzle list" to see all available puzzles in this area'),
            createGameMessage('• Check puzzle requirements - you might need specific items or traits'),
            createGameMessage('• Some puzzles have limited attempts, so think carefully!'),
            createGameMessage('• The puzzle interface will provide hints once you start solving'),
            createGameMessage('• Different puzzle types require different approaches - logic, pattern, sequence, etc.')
          ]
        };
      }

      return null; // Let the regular hint command handle this
    }

    default:
      return null; // Not a puzzle command
  }
}

/**
 * Handle starting a puzzle solving session
 */
async function handlePuzzleSolve(
  puzzleId: string,
  currentRoomId: string,
  gameState: LocalGameState,
  puzzleController: PuzzleController
): Promise<PuzzleCommandResult> {
  // Check if puzzle can be started
  const canStart = puzzleController.canStartPuzzle(puzzleId, currentRoomId, gameState);
  
  if (!canStart.canStart) {
    return {
      messages: [
        createGameMessage(`Cannot start puzzle: ${canStart.reason}`, 'error')
      ]
    };
  }

  try {
    // Start the puzzle session
    const puzzleSession = await puzzleController.startPuzzle(puzzleId, currentRoomId, gameState);
    
    if (!puzzleSession.showPuzzleModal || !puzzleSession.puzzle) {
      return {
        messages: [
          createGameMessage(`Puzzle "${puzzleId}" not found in this area.`, 'error'),
          createGameMessage('Use "puzzle list" to see available puzzles.')
        ]
      };
    }

    return {
      messages: [
        createGameMessage(`🧩 Starting puzzle: ${puzzleSession.puzzle.name}`),
        createGameMessage(`Difficulty: ${puzzleSession.puzzle.difficulty.toUpperCase()}`),
        createGameMessage('The puzzle interface is now opening...')
      ],
      puzzleModal: puzzleSession
    };

  } catch (error) {
    console.error('Error starting puzzle:', error);
    return {
      messages: [
        createGameMessage('An error occurred while starting the puzzle.', 'error')
      ]
    };
  }
}

/**
 * Check if a command is puzzle-related
 */
export function isPuzzleCommand(command: string): boolean {
  const commandWords = command.toLowerCase().trim().split(/\s+/);
  const verb = commandWords[0];
  
  return ['puzzle', 'puzzles', 'solve'].includes(verb);
}

/**
 * Get puzzle integration suggestions for room descriptions
 */
export function getPuzzleContextualInfo(roomId: string, gameState: LocalGameState): string[] {
  const puzzleController = PuzzleController.getInstance();
  const progress = puzzleController.getRoomPuzzleProgress(roomId, gameState);
  
  const messages: string[] = [];
  
  if (progress.total > 0) {
    if (progress.available > 0) {
      messages.push(`🧩 ${progress.available} puzzle${progress.available !== 1 ? 's' : ''} available (type "puzzle list" to see them)`);
    }
    
    if (progress.solved > 0) {
      messages.push(`✅ ${progress.solved}/${progress.total} puzzles completed in this area`);
    }
  }
  
  return messages;
}

/**
 * Enhanced help for puzzle commands
 */
export function getPuzzleHelpMessages(): GameMessage[] {
  return [
    createGameMessage('--- Puzzle Commands ---'),
    createGameMessage('puzzle list - Show available puzzles in current area'),
    createGameMessage('puzzle solve [name] - Start solving a specific puzzle'),
    createGameMessage('puzzle progress - Show your puzzle completion progress'),
    createGameMessage('solve [name] - Quick command to start solving a puzzle'),
    createGameMessage(''),
    createGameMessage('💡 Puzzle Tips:'),
    createGameMessage('• Different puzzle types: logic, pattern, navigation, sequence'),
    createGameMessage('• Some puzzles require specific items or traits'),
    createGameMessage('• Failed attempts count against maximum attempts'),
    createGameMessage('• Use hints wisely - they can guide you to the solution'),
    createGameMessage('• Completing puzzles rewards score, items, and achievements')
  ];
}
