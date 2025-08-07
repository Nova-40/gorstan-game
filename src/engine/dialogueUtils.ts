// src/engine/dialogueUtils.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Controls NPC dialogue trees and responses.

import { NPC } from '../types/NPCTypes';
import { 
  DialogueState, 
  DialogueCondition,
  DialogueEffect 
} from './dialogueEngine';

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


export const DIALOGUE_PROBABILITIES: DialogueProbabilities = {
  rare: 0.01,      
  uncommon: 0.05,  
  common: 0.25,    
  guaranteed: 1.0  
};



// --- Function: isRareBranchActive ---
export function isRareBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.rare;
}



// --- Function: isUncommonBranchActive ---
export function isUncommonBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.uncommon;
}



// --- Function: isCommonBranchActive ---
export function isCommonBranchActive(): boolean {
  return Math.random() < DIALOGUE_PROBABILITIES.common;
}



// --- Function: checkProbability ---
export function checkProbability(threshold: number): boolean {
  if (threshold < 0 || threshold > 1) {
    console.warn('[DialogueUtils] Probability threshold must be between 0 and 1');
    return false;
  }
  return Math.random() < threshold;
}



// --- Function: selectWeightedDialogue ---
export function selectWeightedDialogue(
  variations: DialogueVariation[],
  playerState?: DialogueState
): string {
  const validVariations = variations.filter(variation => 
    !variation.conditions || checkDialogueConditions(variation.conditions, playerState || {})
  );

  if (validVariations.length === 0) {
    return variations[0]?.text || "...";
  }

  const totalWeight = validVariations.reduce((sum, variation) => sum + variation.weight, 0);

  if (totalWeight === 0) {
    return validVariations[0].text;
  }

  
  let random = Math.random() * totalWeight;

  for (const variation of validVariations) {
    random -= variation.weight;
    if (random <= 0) {
      return variation.text;
    }
  }

  return validVariations[validVariations.length - 1].text;
}



// --- Function: interpolateDialogue ---
export function interpolateDialogue(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? String(value) : match;
  });
}



// --- Function: formatDialogueWithContext ---
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



// --- Function: checkDialogueConditions ---
export function checkDialogueConditions(
  conditions: DialogueCondition[],
  playerState: DialogueState
): boolean {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'flag':
        return playerState.flags?.[condition.key] === condition.value;

      case 'trait':
        const traits = playerState.traits || [];
        if (condition.operator === 'contains') {
          return traits.includes(condition.value);
        }
        return false;

      case 'item':
        const inventory = playerState.inventory || [];
        if (condition.operator === 'contains') {
          return inventory.includes(condition.value);
        }
        return false;

      case 'trust':
        const trust = playerState.trust || 0;
        return compareValues(trust, condition.value, condition.operator || 'equals');

      case 'stat':
        const statValue = (playerState as any)[condition.key];
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



// --- Function: compareValues ---
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



// --- Function: getDialogueVariationsByMood ---
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



// --- Function: generateContextualGreeting ---
export function generateContextualGreeting(
  npc: string,
  playerState: DialogueState
): string {
  const deathCount = playerState.deathCount || 0;
  const resetCount = playerState.resetCount || 0;
  const trust = playerState.trust || 0;
  
  const deathGreetings = [
    "Death follows you like a shadow...",
    "Back from the void again, I see.",
    "How many lives do you have left?",
    "Death and you are old friends now.",
    "The afterlife seems to be a revolving door for you."
  ];
  
  const resetGreetings = [
    "Another reset? The fabric of reality strains...",
    "Time loops around you like a river.",
    "Reality bends to your will, doesn't it?",
    "The universe reshapes itself for you again."
  ];
  
  if (deathCount > 5) {
    return deathGreetings[deathCount % deathGreetings.length];
  }

  
  if (resetCount > 3) {
    return resetGreetings[resetCount % resetGreetings.length];
  }

  
  if (trust > 7) {
    return "My trusted friend, welcome back!";
  } else if (trust > 4) {
    return "Good to see a familiar face.";
  } else if (trust < -2) {
    return "You again... what now?";
  }

  
  return "Hello there.";
}



// --- Function: sanitizeDialogueInput ---
export function sanitizeDialogueInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\s'-]/g, '') 
    .substring(0, 100); 
}



// --- Function: calculateDialogueMood ---
export function calculateDialogueMood(
  npc: string,
  playerState: DialogueState
): 'friendly' | 'neutral' | 'hostile' | 'suspicious' | 'caring' {
  const trust = playerState.trust || 0;
  const deathCount = playerState.deathCount || 0;
  const traits = playerState.traits || [];

  
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



// --- Function: buildDialogueHistory ---
export function buildDialogueHistory(
  playerState: DialogueState,
  maxEntries: number = 5
): string {
  const history = playerState.conversationHistory || [];
  return history
    .slice(-maxEntries)
    .join(' → ');
}



// --- Function: validateDialogueData ---
export function validateDialogueData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  
  if (typeof data.text !== 'string') return false;

  
  if (data.conditions && !Array.isArray(data.conditions)) return false;

  
  if (data.effects && !Array.isArray(data.effects)) return false;

  return true;
}

export default {
  isRareBranchActive,
  isUncommonBranchActive,
  isCommonBranchActive,
  checkProbability,
  selectWeightedDialogue,
  interpolateDialogue,
  formatDialogueWithContext,
  checkDialogueConditions,
  getDialogueVariationsByMood,
  generateContextualGreeting,
  sanitizeDialogueInput,
  calculateDialogueMood,
  buildDialogueHistory,
  validateDialogueData
};
