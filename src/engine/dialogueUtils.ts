import { NPC } from './NPCTypes';



// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: dialogueUtils.ts
// Path: src/engine/dialogueUtils.ts

/**
 * Type definitions for dialogue utilities
 */
export interface DialogueProbabilities {
  rare: number;
  uncommon: number;
  common: number;
  guaranteed: number;
}

export interface DialogueVariation {
  text: string;
  weight: number;
  conditions?: DialogueCondition[];
}

export interface DialogueContext {
  npc: string;
  playerState: DialogueState;
  conversationTurn: number;
  lastPlayerAction?: string;
  mood?: 'friendly' | 'neutral' | 'hostile' | 'suspicious' | 'caring';
}

export interface TextTemplate {
  template: string;
  variables: Record<string, string | number>;
}

/**
 * Default probability thresholds for various dialogue branches
 */
export const DIALOGUE_PROBABILITIES: DialogueProbabilities = {
  rare: 0.01,      // 1% - Very rare special dialogue
  uncommon: 0.05,  // 5% - Uncommon variations
  common: 0.25,    // 25% - Common variations
  guaranteed: 1.0  // 100% - Always triggers
};

/**
 * isRareBranchActive
 * Returns true with a 1% probability, used for rare narrative branches.
 *
 * @returns {boolean}
 */
export function isRareBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.rare;
}

/**
 * isUncommonBranchActive
 * Returns true with a 5% probability, used for uncommon narrative branches.
 *
 * @returns {boolean}
 */
export function isUncommonBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.uncommon;
}

/**
 * isCommonBranchActive
 * Returns true with a 25% probability, used for common narrative variations.
 *
 * @returns {boolean}
 */
export function isCommonBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.common;
}

/**
 * checkProbability
 * Generic probability checker with custom threshold.
 *
 * @param threshold - Probability threshold (0-1)
 * @returns {boolean}
 */
export function checkProbability(threshold: number): boolean {
  if (threshold < 0 || threshold > 1) {
    console.warn('[DialogueUtils] Probability threshold must be between 0 and 1');
    return false;
  }
  return Math.random() < threshold;
}

/**
 * selectWeightedDialogue
 * Selects dialogue from an array based on weighted probability.
 *
 * @param variations - Array of dialogue variations with weights
 * @param playerState - Current player state for condition checking
 * @returns {string} - Selected dialogue text
 */
export function selectWeightedDialogue(
  variations: DialogueVariation[],
  playerState?: DialogueState
): string {
  // Filter variations by conditions if player state is provided

  if (validVariations.length === 0) {
    return variations[0]?.text || "...";
  }

  // Calculate total weight

  if (totalWeight === 0) {
    return validVariations[0].text;
  }

  // Select based on weighted probability
  let random = Math.random() * totalWeight;

  for (const variation of validVariations) {
    random -= variation.weight;
    if (random <= 0) {
      return variation.text;
    }
  }

  return validVariations[validVariations.length - 1].text;
}

/**
 * interpolateDialogue
 * Replaces variables in dialogue templates with actual values.
 *
 * @param template - Template with variables like {playerName}, {itemName}
 * @param variables - Object containing variable values
 * @returns {string} - Interpolated dialogue
 */
export function interpolateDialogue(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, varName) => {
        return value !== undefined ? String(value) : match;
  });
}

/**
 * formatDialogueWithContext
 * Formats dialogue using player state context.
 *
 * @param template - Template string
 * @param context - Dialogue context including player state
 * @returns {string} - Formatted dialogue
 */
export function formatDialogueWithContext(
  template: string,
  context: DialogueContext
): string {
  const variables: Record<string, string | number> = {
    playerName: context.playerState.playerName || 'Traveler',
    currentRoom: context.playerState.currentRoom || 'somewhere',
    deathCount: context.playerState.deathCount || 0,
    resetCount: context.playerState.resetCount || 0,
    inventoryCount: context.playerState.inventory?.length || 0,
    trustLevel: context.playerState.trust || 0,
    conversationTurn: context.conversationTurn,
    npcName: context.npc
  };

  return interpolateDialogue(template, variables);
}

/**
 * checkDialogueConditions
 * Helper function to check if dialogue conditions are met.
 *
 * @param conditions - Array of conditions to check
 * @param playerState - Current player state
 * @returns {boolean} - True if all conditions are met
 */
export function checkDialogueConditions(
  conditions: DialogueCondition[],
  playerState: DialogueState
): boolean {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'flag':
        return playerState.flags?.[condition.key] === condition.value;

      case 'trait':
                if (condition.operator === 'contains') {
          return traits.includes(condition.value);
        }
        return false;

      case 'item':
                if (condition.operator === 'contains') {
          return inventory.includes(condition.value);
        }
        return false;

      case 'trust':
                return compareValues(trust, condition.value, condition.operator || 'equals');

      case 'stat':
                return compareValues(statValue, condition.value, condition.operator || 'equals');

      case 'room':
        return playerState.currentRoom === condition.value;

      case 'quest':
        return playerState.questState === condition.value;

      default:
        return true;
    }
  });
}

/**
 * compareValues
 * Helper function to compare values based on operator.
 *
 * @param actual - Actual value
 * @param expected - Expected value
 * @param operator - Comparison operator
 * @returns {boolean} - Comparison result
 */
function compareValues(actual: any, expected: any, operator: string): boolean {
  switch (operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'greater': return actual > expected;
    case 'less': return actual < expected;
    case 'greater_equals': return actual >= expected;
    case 'less_equals': return actual <= expected;
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : false;
    default: return actual === expected;
  }
}

/**
 * getDialogueVariationsByMood
 * Returns mood-appropriate dialogue variations.
 *
 * @param baseMood - Base mood of the NPC
 * @param playerState - Current player state
 * @returns {DialogueVariation[]} - Mood-appropriate variations
 */
export function getDialogueVariationsByMood(
  baseMood: 'friendly' | 'neutral' | 'hostile' | 'suspicious' | 'caring',
  playerState: DialogueState
): DialogueVariation[] {

  const moodVariations: Record<string, DialogueVariation[]> = {
    friendly: [
      { text: "It's wonderful to see you again!", weight: 3, conditions: [{ type: 'trust', key: 'trust', value: 5, operator: 'greater' }] },
      { text: "Hello there, friend!", weight: 2, conditions: [{ type: 'trust', key: 'trust', value: 3, operator: 'greater' }] },
      { text: "Good to see you!", weight: 1 }
    ],

    neutral: [
      { text: "Hello.", weight: 2 },
      { text: "What brings you here?", weight: 1 },
      { text: "Yes?", weight: 1 }
    ],

    hostile: [
      { text: "What do you want?", weight: 2 },
      { text: "You again...", weight: 2, conditions: [{ type: 'trust', key: 'trust', value: 0, operator: 'less' }] },
      { text: "Make it quick.", weight: 1 }
    ],

    suspicious: [
      { text: "What are you really after?", weight: 2 },
      { text: "I don't trust your motives.", weight: 2, conditions: [{ type: 'trust', key: 'trust', value: 2, operator: 'less' }] },
      { text: "Speak your business.", weight: 1 }
    ],

    caring: [
      { text: "Are you alright? You look troubled.", weight: 3, conditions: [{ type: 'stat', key: 'deathCount', value: 2, operator: 'greater' }] },
      { text: "I worry about you out there.", weight: 2, conditions: [{ type: 'trust', key: 'trust', value: 4, operator: 'greater' }] },
      { text: "Take care of yourself.", weight: 1 }
    ]
  };

  return moodVariations[baseMood] || moodVariations.neutral;
}

/**
 * generateContextualGreeting
 * Generates a contextual greeting based on player history and state.
 *
 * @param npc - NPC name
 * @param playerState - Current player state
 * @returns {string} - Contextual greeting
 */
export function generateContextualGreeting(
  npc: string,
  playerState: DialogueState
): string {

  // Death-aware greetings
  if (deathCount > 5) {
        return deathGreetings[deathCount % deathGreetings.length];
  }

  // Reset-aware greetings
  if (resetCount > 3) {
        return resetGreetings[resetCount % resetGreetings.length];
  }

  // Trust-based greetings
  if (trust > 7) {
    return "My trusted friend, welcome back!";
  } else if (trust > 4) {
    return "Good to see a familiar face.";
  } else if (trust < -2) {
    return "You again... what now?";
  }

  // Default greeting
  return "Hello there.";
}

/**
 * sanitizeDialogueInput
 * Sanitizes user input for dialogue processing.
 *
 * @param input - Raw user input
 * @returns {string} - Sanitized input
 */
export function sanitizeDialogueInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s'-]/g, '') // Remove special characters except apostrophes and hyphens
    .substring(0, 100); // Limit length
}

/**
 * calculateDialogueMood
 * Calculates appropriate NPC mood based on player state and history.
 *
 * @param npc - NPC name
 * @param playerState - Current player state
 * @returns {string} - Calculated mood
 */
export function calculateDialogueMood(
  npc: string,
  playerState: DialogueState
): 'friendly' | 'neutral' | 'hostile' | 'suspicious' | 'caring' {

  // NPC-specific mood calculations
  switch (npc.toLowerCase()) {
    case 'polly':
      if (playerState.flags?.polly_forgiveness) return 'caring';
      if (trust < 0) return 'hostile';
      return 'suspicious';

    case 'ayla':
      if (deathCount > 3) return 'caring';
      if (trust > 5) return 'friendly';
      return 'neutral';

    case 'dominic':
      return trust > 3 ? 'friendly' : 'neutral';

    case 'wendell':
      if (traits.includes('scholar')) return 'friendly';
      return 'neutral';

    default:
      if (trust > 5) return 'friendly';
      if (trust < -2) return 'hostile';
      if (trust < 2) return 'suspicious';
      return 'neutral';
  }
}

/**
 * buildDialogueHistory
 * Builds a dialogue history string for context.
 *
 * @param playerState - Current player state
 * @param maxEntries - Maximum number of history entries to include
 * @returns {string} - Formatted dialogue history
 */
export function buildDialogueHistory(
  playerState: DialogueState,
  maxEntries: number = 5
): string {
    return history
    .slice(-maxEntries)
    .join(' → ');
}

/**
 * validateDialogueData
 * Validates dialogue data structure.
 *
 * @param data - Dialogue data to validate
 * @returns {boolean} - True if valid
 */
export function validateDialogueData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  // Check required properties
  if (typeof data.text !== 'string') return false;

  // Validate conditions if present
  if (data.conditions && !Array.isArray(data.conditions)) return false;

  // Validate effects if present
  if (data.effects && !Array.isArray(data.effects)) return false;

  return true;
}

/**
 * Export utilities for external use
 */
export
export default DialogueUtils;
