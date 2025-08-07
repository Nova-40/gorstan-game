// src/engine/puzzleCommands.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Parses and processes player commands.

import PuzzleController, { PuzzleControllerResult } from '../engine/puzzleController';

import { GameAction, GameMessage } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import type { Puzzle } from '../types/GameTypes';











export interface PuzzleCommandResult {
  messages: GameMessage[];
  puzzleModal?: PuzzleControllerResult;
  updates?: Partial<LocalGameState>;
}



// --- Function: createGameMessage ---
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


export async function processPuzzleCommand(
  command: string,
  gameState: LocalGameState,
  currentRoomId: string,
  dispatch: React.Dispatch<GameAction>
): Promise<PuzzleCommandResult | null> {
// Variable declaration
  const commandWords = command.toLowerCase().trim().split(/\s+/);
// Variable declaration
  const verb = commandWords[0];
// Variable declaration
  const noun = commandWords.slice(1).join(' ');

// Variable declaration
  const puzzleController = PuzzleController.getInstance();
  puzzleController.setDispatch(dispatch);

  switch (verb) {
    case 'puzzle':
    case 'puzzles': {
      if (!noun || noun === 'list') {
        
// Variable declaration
        const puzzleMessages = puzzleController.listRoomPuzzles(currentRoomId, gameState);
        return {
          messages: puzzleMessages.map(msg => createGameMessage(msg))
        };
      }

      if (noun.startsWith('solve ')) {
        
// Variable declaration
        const puzzleId = noun.substring(6).trim();
        return await handlePuzzleSolve(puzzleId, currentRoomId, gameState, puzzleController);
      }

      if (noun.startsWith('progress')) {
        
// Variable declaration
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
      
// Variable declaration
      const puzzles = puzzleController.listRoomPuzzles(currentRoomId, gameState);

      if (puzzles.length > 1) { 
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

      return null; 
    }

    default:
      return null; 
  }
}


async function handlePuzzleSolve(
  puzzleId: string,
  currentRoomId: string,
  gameState: LocalGameState,
  puzzleController: PuzzleController
): Promise<PuzzleCommandResult> {
  
// Variable declaration
  const canStart = puzzleController.canStartPuzzle(puzzleId, currentRoomId, gameState);

  if (!canStart.canStart) {
    return {
      messages: [
        createGameMessage(`Cannot start puzzle: ${canStart.reason}`, 'error')
      ]
    };
  }

  try {
    
// Variable declaration
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



// --- Function: isPuzzleCommand ---
export function isPuzzleCommand(command: string): boolean {
// Variable declaration
  const commandWords = command.toLowerCase().trim().split(/\s+/);
// Variable declaration
  const verb = commandWords[0];

  return ['puzzle', 'puzzles', 'solve'].includes(verb);
}



// --- Function: getPuzzleContextualInfo ---
export function getPuzzleContextualInfo(roomId: string, gameState: LocalGameState): string[] {
// Variable declaration
  const puzzleController = PuzzleController.getInstance();
// Variable declaration
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



// --- Function: getPuzzleHelpMessages ---
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
