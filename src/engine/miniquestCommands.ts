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
// Parses and processes player commands.

import MiniquestController, { MiniquestControllerResult } from '../engine/miniquestController';

import { GameAction, GameMessage } from '../types/GameTypes';

import { LocalGameState } from '../state/gameState';

import type { Miniquest } from '../types/GameTypes';











export interface MiniquestCommandResult {
  messages: GameMessage[];
  miniquestModal?: MiniquestControllerResult;
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


export async function processMiniquestCommand(
  command: string,
  gameState: LocalGameState,
  currentRoomId: string,
  dispatch: React.Dispatch<GameAction>
): Promise<MiniquestCommandResult | null> {
// Variable declaration
  const commandWords = command.toLowerCase().trim().split(/\s+/);
// Variable declaration
  const verb = commandWords[0];
// Variable declaration
  const noun = commandWords.slice(1).join(' ');

// Variable declaration
  const miniquestController = MiniquestController.getInstance();
  miniquestController.setDispatch(dispatch);

  switch (verb) {
    case 'miniquest':
    case 'miniquests': {
      if (!noun || noun === 'list') {
        
// Variable declaration
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
// Variable declaration
        const questId = noun.substring(8).trim();
        return await handleMiniquestAttempt(questId, currentRoomId, gameState, miniquestController);
      }

      if (noun === 'stats' || noun === 'statistics') {
// Variable declaration
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
// Variable declaration
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
      
// Variable declaration
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
      
// Variable declaration
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

      return null; 
    }

    case 'objectives': {
      
// Variable declaration
      const interfaceData = await miniquestController.openMiniquestInterface(currentRoomId, gameState);
// Variable declaration
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

// Variable declaration
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
      return null; 
  }
}


async function handleMiniquestAttempt(
  questId: string,
  currentRoomId: string,
  gameState: LocalGameState,
  miniquestController: MiniquestController
): Promise<MiniquestCommandResult> {
  try {
// Variable declaration
    const result = await miniquestController.attemptQuest(questId, currentRoomId, gameState);

// Variable declaration
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



// --- Function: isMiniquestCommand ---
export function isMiniquestCommand(command: string): boolean {
// Variable declaration
  const commandWords = command.toLowerCase().trim().split(/\s+/);
// Variable declaration
  const verb = commandWords[0];

  return ['miniquest', 'miniquests', 'attempt', 'quests', 'objectives'].includes(verb);
}



// --- Function: getMiniquestContextualInfo ---
export function getMiniquestContextualInfo(roomId: string, gameState: LocalGameState): string[] {
// Variable declaration
  const miniquestController = MiniquestController.getInstance();
// Variable declaration
  const progress = miniquestController.getRoomProgress(roomId, gameState);

  const messages: string[] = [];

  if (progress.total > 0) {
    if (progress.available > 0) {
      messages.push(`🎯 ${progress.available} miniquest${progress.available !== 1 ? 's' : ''} available (type "miniquests" to explore)`);
    }

    if (progress.completed > 0) {
      messages.push(`✅ ${progress.completed}/${progress.total} miniquests completed in this area`);
    }

    
    if (progress.available > 0 && progress.completed === 0) {
      messages.push(`💡 Look around carefully - this area holds secrets waiting to be discovered`);
    }
  }

  return messages;
}



// --- Function: getMiniquestHelpMessages ---
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
