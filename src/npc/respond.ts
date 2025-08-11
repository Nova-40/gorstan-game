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
// NPC response generation system

import { NPCPersona, getPersona } from './personas';
import { ContextSnapshot } from './context';
import { NPCMemoryState, getMemorySummary } from './memory';
import { IntentResult } from './intent';

export interface ResponseTemplate {
  base: string;
  variants: string[];
  conditions?: {
    relationship_min?: number;
    relationship_max?: number;
    context_required?: string[];
    forbidden_if?: string[];
  };
  style_modifiers: {
    warmth_high?: string;
    warmth_low?: string;
    humour_high?: string;
    formality_high?: string;
    caution_high?: string;
  };
}

/**
 * Generate an NPC reply based on intent, context, and personality
 */
export function generateNPCReply(
  npcId: string,
  playerUtterance: string,
  intentResult: IntentResult,
  contextSnapshot: ContextSnapshot,
  memoryState: NPCMemoryState
): string {
  const persona = getPersona(npcId);
  const memorySummary = getMemorySummary(npcId);
  
  // Check for forbidden topics first
  if (isForbiddenTopic(intentResult, persona, contextSnapshot)) {
    return generateDeflection(persona, intentResult, contextSnapshot);
  }
  
  // Check for "ask twice" rule
  const askTwiceOverride = checkAskTwiceRule(playerUtterance, memoryState, persona);
  if (askTwiceOverride) {
    return askTwiceOverride;
  }
  
  // Get base response template
  const template = getResponseTemplate(npcId, intentResult.intent, contextSnapshot);
  
  // Apply persona and context modifications
  let response = applyPersonaToTemplate(template, persona, memorySummary, contextSnapshot);
  
  // Add variability and personality touches
  response = addPersonalityTouches(response, persona, contextSnapshot, memorySummary);
  
  // Add memory references if appropriate
  response = addMemoryReferences(response, memorySummary, persona);
  
  return response.trim();
}

/**
 * Check if the topic is forbidden for this NPC
 */
function isForbiddenTopic(intentResult: IntentResult, persona: NPCPersona, context: ContextSnapshot): boolean {
  const { intent, entities } = intentResult;
  
  for (const forbiddenTopic of persona.forbidden_topics) {
    if (forbiddenTopic.includes('puzzle solutions') && intent === 'puzzle_hint') {
      // Allow puzzle hints under time pressure
      if (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 30000) {
        return false;
      }
      return true;
    }
    
    if (forbiddenTopic.includes('spoilers') && (intent === 'lore' || intent === 'meta')) {
      const spoilerEntities = ['polly', 'takeover', 'ending', 'secret'];
      if (entities.some(entity => spoilerEntities.includes(entity))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Generate a deflection response for forbidden topics
 */
function generateDeflection(persona: NPCPersona, intentResult: IntentResult, context: ContextSnapshot): string {
  const deflections = [
    "I can guide, but I won't override your discovery.",
    "Some things are better experienced than explained.",
    "That's something you'll need to figure out yourself.",
    "I'd rather not spoil the surprise.",
    "Let's focus on what you can do right now."
  ];
  
  // Persona-specific deflections
  if (persona.id === 'ayla') {
    const aylaDeflections = [
      "I can't break the rules... I just know where they bend.",
      "Trust me, the journey is better than the shortcut.",
      "Let's think through this step by step instead.",
      "I believe you can figure this out with a little guidance."
    ];
    deflections.push(...aylaDeflections);
  }
  
  if (persona.id === 'wendell') {
    deflections.push(
      "The particulars are... complex.",
      "Some knowledge carries consequences.",
      "That information is not for me to share."
    );
  }
  
  // Add urgency acknowledgment if under time pressure
  let deflection = chooseSynonym(deflections);
  if (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 60000) {
    deflection += " Though given the time pressure, ask me again if you're really stuck.";
  }
  
  return deflection;
}

/**
 * Check for the "ask twice" rule for sensitive information
 */
function checkAskTwiceRule(utterance: string, memory: NPCMemoryState, persona: NPCPersona): string | null {
  if (persona.id !== 'ayla') return null; // Only Ayla implements this rule
  
  const recentConversation = memory.conversationBuffer.slice(-4);
  const playerMessages = recentConversation.filter(turn => turn.speaker === 'player');
  
  // Check if player has asked similar question recently
  const currentQuery = utterance.toLowerCase();
  const similarPreviousQuery = playerMessages.find(msg => {
    const prevQuery = msg.message.toLowerCase();
    return similarity(currentQuery, prevQuery) > 0.7;
  });
  
  if (similarPreviousQuery) {
    // This is the second ask - provide more direct help
    if (currentQuery.includes('solution') || currentQuery.includes('answer')) {
      return generateDirectSolution(currentQuery, memory);
    }
  }
  
  return null;
}

/**
 * Generate a direct solution when asked twice
 */
function generateDirectSolution(query: string, memory: NPCMemoryState): string {
  // This would contain specific puzzle solutions
  if (query.includes('coin') || query.includes('schrodinger')) {
    return "Alright, since you asked twice: The Schrödinger coin exists in two states. Pick it up to collapse it into being unusable, or leave it to keep it usable for the extrapolator. The choice affects what you can do in the library.";
  }
  
  if (query.includes('blue') && (query.includes('switch') || query.includes('button'))) {
    return "The blue switch resets everything to the beginning. Only press it if you're certain you want to start over completely, or if Polly has taken control and it's your only option.";
  }
  
  return "I've given you all the help I can. Sometimes the answer becomes clear when you try different approaches.";
}

/**
 * Get response template for intent and NPC
 */
function getResponseTemplate(npcId: string, intent: string, context: ContextSnapshot): ResponseTemplate {
  // Load NPC-specific templates (simplified for now)
  const templates = getTemplatesForNPC(npcId);
  
  return templates[intent] || {
    base: "I'm not sure how to respond to that.",
    variants: [
      "Could you rephrase that?",
      "I'm not following.",
      "What do you mean?"
    ],
    style_modifiers: {}
  };
}

/**
 * Get templates for a specific NPC (simplified implementation)
 */
function getTemplatesForNPC(npcId: string): Record<string, ResponseTemplate> {
  // This would be expanded with full template libraries
  const commonTemplates: Record<string, ResponseTemplate> = {
    greeting: {
      base: "Hello there!",
      variants: ["Hi!", "Good to see you!", "Greetings!"],
      style_modifiers: {
        warmth_high: "It's wonderful to see you!",
        formality_high: "Good day to you.",
        humour_high: "Well, look who it is!"
      }
    },
    help: {
      base: "I'd be happy to help.",
      variants: [
        "What can I do for you?",
        "How can I assist?",
        "Let's figure this out together."
      ],
      style_modifiers: {
        warmth_high: "Of course! I'm here for you.",
        caution_high: "I'll help, but be careful about what you choose."
      }
    },
    location: {
      base: "Let me think about where you need to go.",
      variants: [
        "Navigation can be tricky here.",
        "The paths aren't always obvious.",
        "Where are you trying to reach?"
      ],
      style_modifiers: {
        caution_high: "Make sure you're prepared before moving on."
      }
    }
  };
  
  return commonTemplates;
}

/**
 * Apply persona characteristics to the template
 */
function applyPersonaToTemplate(
  template: ResponseTemplate,
  persona: NPCPersona,
  memorySummary: any,
  context: ContextSnapshot
): string {
  let response = template.base;
  
  // Apply style modifiers based on persona tone
  if (persona.tone.warmth > 0.7 && template.style_modifiers.warmth_high) {
    response = template.style_modifiers.warmth_high;
  } else if (persona.tone.warmth < 0.3 && template.style_modifiers.warmth_low) {
    response = template.style_modifiers.warmth_low;
  }
  
  if (persona.tone.formality > 0.7 && template.style_modifiers.formality_high) {
    response = template.style_modifiers.formality_high;
  }
  
  if (persona.tone.caution > 0.7 && template.style_modifiers.caution_high) {
    response = template.style_modifiers.caution_high;
  }
  
  // Sometimes use variants for variety
  if (Math.random() < 0.3 && template.variants.length > 0) {
    response = chooseSynonym(template.variants);
  }
  
  return response;
}

/**
 * Add personality touches to the response
 */
function addPersonalityTouches(
  response: string,
  persona: NPCPersona,
  context: ContextSnapshot,
  memorySummary: any
): string {
  // Add contractions or expand them based on speaking style
  if (persona.speaking_style.use_contractions) {
    response = addContractions(response);
  } else {
    response = removeContractions(response);
  }
  
  // Add humour if appropriate
  if (persona.tone.humour > 0.6 && Math.random() < 0.4) {
    response = humourInsert(response, persona);
  }
  
  // Add hedging for cautious personalities
  if (persona.tone.caution > 0.6 && Math.random() < 0.3) {
    response = hedge(response);
  }
  
  // Add fourth-wall awareness for appropriate NPCs
  if (persona.speaking_style.fourth_wall_awareness && Math.random() < 0.1) {
    response = addFourthWallTouch(response, persona);
  }
  
  // Add interruptions/self-correction for natural feel
  if (persona.speaking_style.interruptions && Math.random() < 0.2) {
    response = addSelfCorrection(response);
  }
  
  return response;
}

/**
 * Add memory references to make responses feel continuous
 */
function addMemoryReferences(response: string, memorySummary: any, persona: NPCPersona): string {
  if (memorySummary.relationshipStatus === 'trusted' && Math.random() < 0.3) {
    const memoryTouches = [
      "As we discussed before,",
      "Remember when you",
      "Like last time,",
      "You mentioned earlier that"
    ];
    
    const touch = chooseSynonym(memoryTouches);
    response = `${touch} ${response.toLowerCase()}`;
  }
  
  return response;
}

// Utility functions for text variation

/**
 * Choose a random synonym from a list
 */
function chooseSynonym(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Add contractions to make speech more casual
 */
function addContractions(text: string): string {
  return text
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bwill not\b/g, "won't")
    .replace(/\bcannot\b/g, "can't")
    .replace(/\bit is\b/g, "it's")
    .replace(/\bthat is\b/g, "that's")
    .replace(/\byou are\b/g, "you're")
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bwe are\b/g, "we're");
}

/**
 * Remove contractions for formal speech
 */
function removeContractions(text: string): string {
  return text
    .replace(/\bdon't\b/g, "do not")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\byou're\b/g, "you are")
    .replace(/\bI'm\b/g, "I am")
    .replace(/\bwe're\b/g, "we are");
}

/**
 * Add hedging words for uncertainty
 */
function hedge(text: string): string {
  const hedges = [
    "I might be wrong, but ",
    "I think ",
    "Perhaps ",
    "It seems like ",
    "I believe "
  ];
  
  if (Math.random() < 0.5) {
    return chooseSynonym(hedges) + text.toLowerCase();
  }
  
  return text;
}

/**
 * Insert humour appropriate to the persona
 */
function humourInsert(text: string, persona: NPCPersona): string {
  if (persona.id === 'dominic') {
    const sarcasm = [" Bloop.", " How surprising.", " The excitement never ends."];
    return text + chooseSynonym(sarcasm);
  }
  
  if (persona.id === 'ayla') {
    const quips = [" Trust me on this one.", " (I've seen this before.)", " - been there!"];
    return text + chooseSynonym(quips);
  }
  
  return text;
}

/**
 * Add fourth-wall awareness touches
 */
function addFourthWallTouch(response: string, persona: NPCPersona): string {
  if (persona.id === 'ayla') {
    const touches = [
      " (Don't tell the developer I said that.)",
      " - though I probably shouldn't mention that.",
      " (The rules say I shouldn't help, but...)"
    ];
    return response + chooseSynonym(touches);
  }
  
  return response;
}

/**
 * Add self-corrections for natural speech
 */
function addSelfCorrection(text: string): string {
  const corrections = [
    "Wait—actually, ",
    "Let me rephrase: ",
    "I mean, ",
    "Or rather, "
  ];
  
  if (Math.random() < 0.3) {
    return chooseSynonym(corrections) + text.toLowerCase();
  }
  
  return text;
}

/**
 * Calculate similarity between two strings (simple implementation)
 */
function similarity(str1: string, str2: string): number {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return commonWords.length / totalWords;
}
