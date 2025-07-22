import MiniquestController, { MiniquestControllerResult } from '../engine/miniquestController';

import { GameAction, GameMessage } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import { Miniquest } from './GameTypes';



// miniquestCommands.ts — engine/miniquestCommands.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Enhanced miniquest commands integration


/**
 * Enhanced miniquest commands integration
 */

export interface MiniquestCommandResult {
  messages: GameMessage[];
  miniquestModal?: MiniquestControllerResult;
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
 * Handle miniquest-related commands with enhanced interface
 */
export async function processMiniquestCommand(
  command: string,
  gameState: LocalGameState,
  currentRoomId: string,
  dispatch: React.Dispatch<GameAction>
): Promise<MiniquestCommandResult | null> {
  const commandWords = command.toLowerCase().trim().split(/\s+/);
  const verb = commandWords[0];
  const noun = commandWords.slice(1).join(' ');

  const miniquestController = MiniquestController.getInstance();
  miniquestController.setDispatch(dispatch);

  switch (verb) {
    case 'miniquest':
    case 'miniquests': {
      if (!noun || noun === 'list') {
        // Open the enhanced miniquest interface
        const interfaceData = await miniquestController.openMiniquestInterface(currentRoomId, gameState);

        return {
          messages: [
            createGameMessage('🎯 **Opening Miniquest Interface...**'),
            createGameMessage(`Found ${interfaceData.miniquests.length} quests in this area`),
            createGameMessage(`${interfaceData.availableCount} available, ${interfaceData.completedCount} completed`)
          ],
          miniquestModal: interfaceData
        };
      }

      if (noun.startsWith('attempt ')) {
        const questId = noun.substring(8).trim();
        return await handleMiniquestAttempt(questId, currentRoomId, gameState, miniquestController);
      }

      if (noun === 'stats' || noun === 'statistics') {
        const globalStats = miniquestController.getGlobalStats(gameState);
        return {
          messages: [
            createGameMessage('🏆 **Global Miniquest Statistics:**'),
            createGameMessage(`Total Completed: ${globalStats.totalCompleted}`),
            createGameMessage(`Total Score: ${globalStats.totalScore} points`),
            createGameMessage(`Rooms Explored: ${globalStats.roomsWithQuests}`),
            createGameMessage(`Available Quests: ${globalStats.totalAvailable}`)
          ]
        };
      }

      if (noun === 'progress') {
        const roomProgress = miniquestController.getRoomProgress(currentRoomId, gameState);
        return {
          messages: [
            createGameMessage(`🎯 **Miniquest Progress for ${currentRoomId}:**`),
            createGameMessage(`Completed: ${roomProgress.completed}/${roomProgress.total}`),
            createGameMessage(`Available: ${roomProgress.available}`),
            createGameMessage(`Completion: ${roomProgress.total > 0 ? Math.round((roomProgress.completed / roomProgress.total) * 100) : 0}%`)
          ]
        };
      }

      return {
        messages: [
          createGameMessage('🎯 **Miniquest Commands:**'),
          createGameMessage('  miniquests - Open enhanced quest interface'),
          createGameMessage('  miniquests list - Same as above'),
          createGameMessage('  miniquests attempt [name] - Try a specific quest'),
          createGameMessage('  miniquests progress - Show room completion'),
          createGameMessage('  miniquests stats - Show global statistics')
        ]
      };
    }

    case 'attempt': {
      if (!noun) {
        return {
          messages: [createGameMessage('What miniquest do you want to attempt? Use "miniquests" to see available options.', 'error')]
        };
      }

      return await handleMiniquestAttempt(noun, currentRoomId, gameState, miniquestController);
    }

    case 'quests': {
      // Alias for miniquests command
      const interfaceData = await miniquestController.openMiniquestInterface(currentRoomId, gameState);

      return {
        messages: [
          createGameMessage('🎯 **Opening Quest Interface...**'),
          createGameMessage('Enhanced miniquest browser with filtering and details')
        ],
        miniquestModal: interfaceData
      };
    }

    case 'hint': {
      // Contextual hints for miniquests
      const roomProgress = miniquestController.getRoomProgress(currentRoomId, gameState);

      if (roomProgress.total > 0) {
        return {
          messages: [
            createGameMessage('💡 **Miniquest Hints:**'),
            createGameMessage('• Use "miniquests" to open the enhanced quest browser'),
            createGameMessage('• Check quest requirements - you might need specific items'),
            createGameMessage('• Look for environmental cues in room descriptions'),
            createGameMessage('• Some quests become available after story progression'),
            createGameMessage('• Completed quests award score and may unlock new areas'),
            createGameMessage('• Try examining, listening, or interacting with objects')
          ]
        };
      }

      return null; // Let the regular hint command handle this
    }

    case 'objectives': {
      // Show objectives in a more narrative way
      const interfaceData = await miniquestController.openMiniquestInterface(currentRoomId, gameState);
      const availableQuests = interfaceData.miniquests.filter(q =>
        interfaceData.progress[q.id]?.available && !interfaceData.progress[q.id]?.completed
      );

      if (availableQuests.length === 0) {
        return {
          messages: [
            createGameMessage('🎯 No immediate objectives in this area.'),
            createGameMessage('Explore other locations or progress the main story to unlock new quests.')
          ]
        };
      }

      const messages = [createGameMessage('🎯 **Current Objectives:**')];
      availableQuests.slice(0, 3).forEach(quest => {
        messages.push(createGameMessage(`• ${quest.title} - ${quest.description}`));
        if (quest.triggerAction) {
          messages.push(createGameMessage(`  Try: ${quest.triggerAction}`));
        }
      });

      if (availableQuests.length > 3) {
        messages.push(createGameMessage(`...and ${availableQuests.length - 3} more. Use "miniquests" to see all.`));
      }

      return { messages };
    }

    default:
      return null; // Not a miniquest command
  }
}

/**
 * Handle attempting a specific miniquest
 */
async function handleMiniquestAttempt(
  questId: string,
  currentRoomId: string,
  gameState: LocalGameState,
  miniquestController: MiniquestController
): Promise<MiniquestCommandResult> {
  try {
    const result = await miniquestController.attemptQuest(questId, currentRoomId, gameState);

    const messages = [
      createGameMessage(result.message, result.success ? 'system' : 'error')
    ];

    if (result.success && result.scoreAwarded) {
      messages.push(createGameMessage(`🏆 Quest completed! +${result.scoreAwarded} points`, 'achievement'));
    }

    return { messages };

  } catch (error) {
    console.error('Error attempting miniquest:', error);
    return {
      messages: [
        createGameMessage(`Miniquest "${questId}" not found in this area.`, 'error'),
        createGameMessage('Use "miniquests" to see available quests.', 'system')
      ]
    };
  }
}

/**
 * Check if a command is miniquest-related
 */
export function isMiniquestCommand(command: string): boolean {
  const commandWords = command.toLowerCase().trim().split(/\s+/);
  const verb = commandWords[0];

  return ['miniquest', 'miniquests', 'attempt', 'quests', 'objectives'].includes(verb);
}

/**
 * Get miniquest integration suggestions for room descriptions
 */
export function getMiniquestContextualInfo(roomId: string, gameState: LocalGameState): string[] {
  const miniquestController = MiniquestController.getInstance();
  const progress = miniquestController.getRoomProgress(roomId, gameState);

  const messages: string[] = [];

  if (progress.total > 0) {
    if (progress.available > 0) {
      messages.push(`🎯 ${progress.available} miniquest${progress.available !== 1 ? 's' : ''} available (type "miniquests" to explore)`);
    }

    if (progress.completed > 0) {
      messages.push(`✅ ${progress.completed}/${progress.total} miniquests completed in this area`);
    }

    // Add contextual hints for specific room types
    if (progress.available > 0 && progress.completed === 0) {
      messages.push(`💡 Look around carefully - this area holds secrets waiting to be discovered`);
    }
  }

  return messages;
}

/**
 * Enhanced help for miniquest commands
 */
export function getMiniquestHelpMessages(): GameMessage[] {
  return [
    createGameMessage('--- Miniquest Commands ---'),
    createGameMessage('miniquests - Open enhanced quest interface with filtering'),
    createGameMessage('miniquests attempt [name] - Try a specific miniquest'),
    createGameMessage('miniquests progress - Show room completion statistics'),
    createGameMessage('miniquests stats - Show global quest statistics'),
    createGameMessage('attempt [name] - Quick command to try a miniquest'),
    createGameMessage('quests - Alias for miniquests command'),
    createGameMessage('objectives - Show current available objectives'),
    createGameMessage(''),
    createGameMessage('💡 Miniquest Tips:'),
    createGameMessage('• Quest types: dynamic, structured, puzzle, social, exploration'),
    createGameMessage('• Check environmental details and room descriptions'),
    createGameMessage('• Some quests require specific items or story progress'),
    createGameMessage('• Repeatable quests can be completed multiple times'),
    createGameMessage('• Use the interface to track progress and view hints'),
    createGameMessage('• Completed quests award score and may unlock new content')
  ];
}
