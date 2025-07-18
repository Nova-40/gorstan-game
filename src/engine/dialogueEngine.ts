// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: dialogueEngine.ts
// Path: src/engine/dialogueEngine.ts
//
// dialogueEngine utility for Gorstan game.
// Provides a function to generate NPC dialogue based on the NPC and player state.

/**
 * Enhanced type definitions for dialogue system
 */
/**
 * Represents current state of the player relevant for dialogue logic.
 * Includes trust level, flags, inventory, room, quest state, and more.
 */
export interface DialogueState {
  trust?: number;
  flags?: Record<string, any>;
  traits?: string[];
  inventory?: string[];
  currentRoom?: string;
  playerName?: string;
  conversationHistory?: string[];
  questState?: string;
  resetCount?: number;
  deathCount?: number;
  [key: string]: unknown;
}

/**
 * One option presented in dialogue. Can include conditions, effects, and a follow-up node.
 */
export interface DialogueOption {
  text: string;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
  nextDialogue?: string;
}

/**
 * Condition required for a dialogue node or option to be available.
 */
export interface DialogueCondition {
  type: 'flag' | 'trait' | 'item' | 'trust' | 'stat' | 'room' | 'quest';
  key: string;
  value: any;
  operator?: 'equals' | 'greater' | 'less' | 'contains' | 'not_equals';
}

/**
 * Effect applied after a dialogue option is selected.
 */
export interface DialogueEffect {
  type: 'flag' | 'trait' | 'trust' | 'item' | 'quest';
  key: string;
  value: any;
  operation?: 'set' | 'add' | 'remove' | 'increment';
}

/**
 * Represents a single dialogue node. May include text, responses, conditions, and priority.
 */
export interface DialogueNode {
  id: string;
  text: string;
  conditions?: DialogueCondition[];
  responses?: DialogueOption[];
  oneTime?: boolean;
  priority?: number;
}

/**
 * Set of dialogue categories for an NPC — used to structure interaction sequences.
 */
export interface NPCDialogueSet {
  greeting: DialogueNode[];
  general: DialogueNode[];
  quest: DialogueNode[];
  special: DialogueNode[];
  farewell: DialogueNode[];
}

/**
 * Comprehensive NPC dialogue database
 */
const npcDialogues: Record<string, NPCDialogueSet> = {
  ayla: {
    greeting: [
      {
        id: 'ayla_first_meeting',
        text: 'I am Ayla. I exist across all timelines, watching the lattice weave itself into new patterns. You seem... familiar.',
        conditions: [{ type: 'flag', key: 'met_ayla', value: false }],
        responses: [
          {
            text: 'Who are you exactly?',
            effects: [{ type: 'flag', key: 'asked_ayla_identity', value: true }],
            nextDialogue: 'ayla_identity_explanation'
          },
          {
            text: 'I need guidance.',
            nextDialogue: 'ayla_guidance_offer'
          }
        ],
        priority: 10
      },
      {
        id: 'ayla_return_greeting',
        text: 'You return to me. The lattice brings you back when you need guidance most.',
        conditions: [{ type: 'flag', key: 'met_ayla', value: true }],
        priority: 5
      }
    ],
    
    general: [
      {
        id: 'ayla_trust_high',
        text: 'I see wisdom growing in your choices. The multiverse responds to those who think before they act.',
        conditions: [{ type: 'trust', key: 'trust', value: 5, operator: 'greater' }],
        priority: 8
      },
      {
        id: 'ayla_trust_medium',
        text: 'You show promise. Each decision shapes not just your path, but the very fabric of possibility.',
        conditions: [{ type: 'trust', key: 'trust', value: 3, operator: 'greater' }],
        priority: 6
      },
      {
        id: 'ayla_trust_low',
        text: 'Patience. Understanding comes through experience, and experience through choices - both wise and foolish.',
        conditions: [{ type: 'trust', key: 'trust', value: 2, operator: 'less' }],
        priority: 4
      },
      {
        id: 'ayla_curious_trait',
        text: 'Your curiosity serves you well. Questions open doors that assumptions keep locked.',
        conditions: [{ type: 'trait', key: 'traits', value: 'curious', operator: 'contains' }],
        priority: 7
      },
      {
        id: 'ayla_careful_trait',
        text: 'Caution is wisdom, but paralysis is its shadow. Know when to step forward.',
        conditions: [{ type: 'trait', key: 'traits', value: 'careful', operator: 'contains' }],
        priority: 7
      }
    ],
    
    quest: [
      {
        id: 'ayla_constitution_quest',
        text: 'The Constitution Scroll contains the framework of moral reasoning. Find it, read it, understand it. The future depends on such understanding.',
        conditions: [{ type: 'flag', key: 'constitution_quest_active', value: true }],
        priority: 9
      },
      {
        id: 'ayla_redemption_path',
        text: 'Redemption is not about erasing the past, but transforming its meaning through present action. Polly holds a key to this transformation.',
        conditions: [{ type: 'quest', key: 'questState', value: 'redemption' }],
        priority: 9
      }
    ],
    
    special: [
      {
        id: 'ayla_multiple_deaths',
        text: 'Death here is... educational. Each ending teaches something new about the nature of choice and consequence.',
        conditions: [{ type: 'stat', key: 'deathCount', value: 3, operator: 'greater' }],
        priority: 8
      },
      {
        id: 'ayla_many_resets',
        text: 'I see you\'ve reset many times. Sometimes the answer isn\'t in trying harder, but in trying differently.',
        conditions: [{ type: 'stat', key: 'resetCount', value: 5, operator: 'greater' }],
        priority: 8
      }
    ],
    
    farewell: [
      {
        id: 'ayla_standard_farewell',
        text: 'Go well. Remember that every choice creates ripples across infinite possibilities.',
        priority: 1
      }
    ]
  },

  polly: {
    greeting: [
      {
        id: 'polly_first_meeting',
        text: 'Oh. You\'re new. How... refreshing. I\'m Polly. I used to care about things.',
        conditions: [{ type: 'flag', key: 'met_polly', value: false }],
        priority: 10
      },
      {
        id: 'polly_return_bitter',
        text: 'Back again? How wonderfully predictable. What do you want this time?',
        conditions: [
          { type: 'flag', key: 'met_polly', value: true },
          { type: 'flag', key: 'polly_forgiveness', value: false }
        ],
        priority: 7
      },
      {
        id: 'polly_forgiven_greeting',
        text: 'Hello again. I... I\'m glad you came back. That means something.',
        conditions: [{ type: 'flag', key: 'polly_forgiveness', value: true }],
        priority: 9
      }
    ],
    
    general: [
      {
        id: 'polly_dominic_pain',
        text: 'Dominic was everything good in this place. Then he was gone. Then he came back wrong. Some losses echo forever.',
        conditions: [{ type: 'flag', key: 'asked_about_dominic', value: true }],
        priority: 8
      },
      {
        id: 'polly_cynical_response',
        text: 'Oh, you\'re still alive. How... quaint. Most people here have the good sense to die quickly.',
        conditions: [{ type: 'trait', key: 'traits', value: 'cynical', operator: 'contains' }],
        priority: 6
      },
      {
        id: 'polly_empathy_softening',
        text: 'You... you understand loss, don\'t you? I can see it in how you listen.',
        conditions: [{ type: 'trait', key: 'traits', value: 'empathetic', operator: 'contains' }],
        priority: 7
      }
    ],
    
    quest: [
      {
        id: 'polly_redemption_arc',
        text: 'You want forgiveness? Prove you understand what was lost. Show me you\'re not just another player in this cosmic game.',
        conditions: [{ type: 'quest', key: 'questState', value: 'redemption' }],
        priority: 9
      },
      {
        id: 'polly_scroll_importance',
        text: 'The scrolls? Ha. Knowledge without wisdom is just educated ignorance. But... find them anyway. Someone should care about truth.',
        conditions: [{ type: 'flag', key: 'scroll_quest_active', value: true }],
        priority: 8
      }
    ],
    
    special: [
      {
        id: 'polly_respect_earned',
        text: 'You\'ve been through hell and kept your humanity. That\'s... rare. I respect that.',
        conditions: [
          { type: 'stat', key: 'deathCount', value: 5, operator: 'greater' },
          { type: 'trait', key: 'traits', value: 'compassionate', operator: 'contains' }
        ],
        priority: 9
      }
    ],
    
    farewell: [
      {
        id: 'polly_bitter_farewell',
        text: 'Off you go then. Try not to break anything important. The universe has enough problems.',
        conditions: [{ type: 'flag', key: 'polly_forgiveness', value: false }],
        priority: 5
      },
      {
        id: 'polly_forgiven_farewell',
        text: 'Be safe out there. And... thank you. For caring enough to try.',
        conditions: [{ type: 'flag', key: 'polly_forgiveness', value: true }],
        priority: 8
      }
    ]
  },

  dominic: {
    greeting: [
      {
        id: 'dominic_temporal_awareness',
        text: 'I remember you from seventeen different timelines. In three of them, we were friends. In one, you saved my life. Which version are you?',
        priority: 8
      }
    ],
    
    general: [
      {
        id: 'dominic_memory_burden',
        text: 'Memory is a curse when you remember every possible version of events. I know what Polly was like before the pain broke her.',
        priority: 7
      },
      {
        id: 'dominic_reset_wisdom',
        text: 'Each reset teaches something new. But be careful - some lessons come at the cost of who you used to be.',
        conditions: [{ type: 'stat', key: 'resetCount', value: 2, operator: 'greater' }],
        priority: 8
      }
    ],
    
    quest: [],
    special: [],
    farewell: [
      {
        id: 'dominic_temporal_farewell',
        text: 'Until we meet again - and we will, in one timeline or another.',
        priority: 1
      }
    ]
  },

  wendell: {
    greeting: [
      {
        id: 'wendell_academic_greeting',
        text: 'Ah, a visitor! Welcome to my sanctuary of knowledge. I am Wendell, keeper of the scrolls and guardian of academic integrity.',
        conditions: [{ type: 'flag', key: 'met_wendell', value: false }],
        priority: 10
      }
    ],
    
    general: [
      {
        id: 'wendell_scholarly_respect',
        text: 'Your scholarly pursuits are commendable. Knowledge is the only currency that appreciates through sharing.',
        conditions: [{ type: 'trait', key: 'traits', value: 'scholar', operator: 'contains' }],
        priority: 8
      },
      {
        id: 'wendell_library_pride',
        text: 'This library contains the accumulated wisdom of countless civilizations. Each scroll is a universe of thought.',
        priority: 6
      }
    ],
    
    quest: [
      {
        id: 'wendell_scroll_requirements',
        text: 'The scrolls you seek require proof of academic worth. Bring me evidence of your scholarly nature, and I shall consider your request.',
        conditions: [{ type: 'flag', key: 'scroll_quest_active', value: true }],
        priority: 9
      }
    ],
    
    special: [],
    farewell: [
      {
        id: 'wendell_academic_farewell',
        text: 'May your quest for knowledge be fruitful. Remember - wisdom is knowledge applied with compassion.',
        priority: 1
      }
    ]
  }
};

/**
 * Enhanced getDialogue function with comprehensive context awareness
 */
export function getDialogue(npc: string, state: DialogueState): string {
  try {
            
    if (!dialogueSet) {
      return handleUnknownNPC(npc, state);
    }

    // Try to find appropriate dialogue in order of priority
        
    for (const context of contexts) {
            if (dialogue) {
        // Mark as used if it's a one-time dialogue
        if (dialogue.oneTime) {
          markDialogueAsUsed(npc, dialogue.id, state);
        }
        
        // Apply any effects
        if (dialogue.responses && dialogue.responses.length === 1) {
          applyDialogueEffects(dialogue.responses[0].effects || [], state);
        }
        
        return dialogue.text;
      }
    }

    // Fallback to basic dialogue
    return getFallbackDialogue(npcKey, state);
    
  } catch (error) {
    console.error('[DialogueEngine] Error generating dialogue:', error);
    return `${npc} seems lost in thought.`;
  }
}

/**
 * Find matching dialogue based on conditions and priority
 */
function findMatchingDialogue(
  dialogues: DialogueNode[],
  state: DialogueState
): DialogueNode | null {
  // Filter by conditions first
    
  if (validDialogues.length === 0) return null;
  
  // Sort by priority (higher first) and return the best match
  validDialogues.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return validDialogues[0];
}

/**
 * Check if dialogue conditions are met
 */
function checkDialogueConditions(
  conditions: DialogueCondition[],
  state: DialogueState
): boolean {
  return conditions.every(condition => {
        
    switch (condition.type) {
      case 'flag':
        return state.flags?.[condition.key] === condition.value;
      
      case 'trait':
                if (condition.operator === 'contains') {
          return traits.includes(condition.value);
        }
        return traits === condition.value;
      
      case 'item':
                if (condition.operator === 'contains') {
          return inventory.includes(condition.value);
        }
        return inventory === condition.value;
      
      case 'trust':
                return compareValues(trust, condition.value, condition.operator || 'equals');
      
      case 'stat':
                return compareValues(statValue, condition.value, condition.operator || 'equals');
      
      case 'room':
        return state.currentRoom === condition.value;
      
      case 'quest':
        return state.questState === condition.value;
      
      default:
        return true;
    }
  });
}

/**
 * Compare values based on operator
 */
function compareValues(actual: any, expected: any, operator: string): boolean {
  switch (operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'greater': return actual > expected;
    case 'less': return actual < expected;
    case 'contains': return Array.isArray(actual) ? actual.includes(expected) : false;
    default: return actual === expected;
  }
}

/**
 * Get state value by key path
 */
function getStateValue(state: DialogueState, key: string): any {
  return (state as any)[key];
}

/**
 * Apply dialogue effects to state
 */
function applyDialogueEffects(effects: DialogueEffect[], state: DialogueState): void {
  effects.forEach(effect => {
    switch (effect.type) {
      case 'flag':
        if (!state.flags) state.flags = {};
        state.flags[effect.key] = effect.value;
        break;
      
      case 'trait':
        if (!state.traits) state.traits = [];
        if (effect.operation === 'add' && !state.traits.includes(effect.value)) {
          state.traits.push(effect.value);
        } else if (effect.operation === 'remove') {
          state.traits = state.traits.filter(trait => trait !== effect.value);
        }
        break;
      
      case 'trust':
                if (effect.operation === 'increment') {
          state.trust = currentTrust + (effect.value as number);
        } else {
          state.trust = effect.value as number;
        }
        break;
    }
  });
}

/**
 * Mark dialogue as used (for one-time dialogues)
 */
function markDialogueAsUsed(npc: string, dialogueId: string, state: DialogueState): void {
  if (!state.flags) state.flags = {};
  if (!state.flags.usedDialogues) state.flags.usedDialogues = {};
  
    if (!usedDialogues[npc]) usedDialogues[npc] = [];
  
  if (!usedDialogues[npc].includes(dialogueId)) {
    usedDialogues[npc].push(dialogueId);
  }
}

/**
 * Handle unknown NPCs
 */
function handleUnknownNPC(npc: string, state: DialogueState): string {
    
    return unknownResponses[responseIndex];
}

/**
 * Get fallback dialogue for known NPCs
 */
function getFallbackDialogue(npc: string, state: DialogueState): string {
  const fallbackDialogues: Record<string, string[]> = {
    ayla: [
      'The lattice flows in mysterious ways.',
      'Every choice creates new possibilities.',
      'Wisdom comes through experience, both pleasant and painful.'
    ],
    polly: [
      'What now?',
      'Still here, I see.',
      'Life continues, unfortunately.'
    ],
    dominic: [
      'Time moves strangely here.',
      'I remember this conversation from another timeline.',
      'The past and future blur together.'
    ],
    wendell: [
      'Knowledge is power, but wisdom is knowing how to use it.',
      'The library holds many secrets.',
      'Academic pursuit is its own reward.'
    ]
  };
  
      return responses[responseIndex];
}

/**
 * Get dialogue options for interactive conversations
 */
export function getDialogueOptions(
  npc: string,
  state: DialogueState
): DialogueOption[] {
      
  if (!dialogueSet) return [];
  
  // Find current dialogue node
    
  for (const context of contexts) {
        if (dialogue?.responses) {
      return dialogue.responses.filter(option =>
        checkDialogueConditions(option.conditions || [], state)
      );
    }
  }
  
  return [];
}

/**
 * Process dialogue choice and return result
 */
export function processDialogueChoice(
  npc: string,
  choiceIndex: number,
  state: DialogueState
): { response: string; effects: DialogueEffect[] } {
      
  if (!choice) {
    return {
      response: `${npc} doesn't understand your choice.`,
      effects: []
    };
  }
  
  // Apply effects
    applyDialogueEffects(effects, state);
  
  return {
    response: choice.text,
    effects
  };
}

/**
 * Add new dialogue to an NPC
 */
export function addDialogue(
  npc: string,
  context: keyof NPCDialogueSet,
  dialogue: DialogueNode
): boolean {
    
  if (!npcDialogues[npcKey]) {
    npcDialogues[npcKey] = {
      greeting: [],
      general: [],
      quest: [],
      special: [],
      farewell: []
    };
  }
  
  npcDialogues[npcKey][context].push(dialogue);
  return true;
}

/**
 * Validate dialogue state
 */
export function validateDialogueState(state: any): state is DialogueState {
  return typeof state === 'object' && state !== null;
}

/**
 * Export utilities for external use
 */
export 
export default DialogueEngine;

// Exported as a named export for use in NPC interaction logic
