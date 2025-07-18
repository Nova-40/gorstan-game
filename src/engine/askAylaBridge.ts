// src/engine/askAylaBridge.ts
// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: askAylaBridge.ts
// Path: src/engine/askAylaBridge.ts

/**
 * AskAylaBridge
 * Provides context-aware hints using Ayla's memory and NPC state.
 * Uses deterministic logic — no LLM.
 */

/**
 * Type definitions for enhanced hint system
 */
export interface PlayerState {
  traits?: string[];
  flags?: Record<string, boolean>;
  inventory?: string[];
  currentRoom?: string;
  health?: number;
  quest?: string;
  resetCount?: number;
  [key: string]: unknown;
}

export interface AylaHintContext {
  playerState: PlayerState;
  recentTopics: string[];
  roomContext?: string;
  questContext?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface HintResult {
  text: string;
  type: 'guidance' | 'warning' | 'encouragement' | 'lore' | 'practical';
  confidence: number;
  followUpSuggestions?: string[];
}

/**
 * Enhanced hint categories for better organization
 */

/**
 * askAylaHint
 * Generates a helpful hint based on recent memory and player traits.
 */
export function askAylaHint(playerState: PlayerState): string {
  try {
            
    // Record this interaction with Ayla
    recordAylaInteraction(playerState, result);
    
    return result.text;
  } catch (error) {
    console.warn('[AskAylaBridge] Error generating hint:', error);
    return getDefaultHint(playerState);
  }
}

/**
 * Enhanced hint generation with full context awareness
 */
export function askAylaAdvancedHint(
  playerState: PlayerState,
  query?: string
): HintResult {
    return generateContextualHint(hintContext);
}

/**
 * Build comprehensive hint context
 */
function buildHintContext(
  playerState: PlayerState,
  query?: string
): AylaHintContext {
    const memory: string[] = status?.recentTopics || [];
  
  // Determine urgency based on player state
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (playerState.health !== undefined && playerState.health < 20) {
    urgencyLevel = 'critical';
  } else if (playerState.resetCount && playerState.resetCount > 5) {
    urgencyLevel = 'high';
  } else if (playerState.quest && !playerState.flags?.['making_progress']) {
    urgencyLevel = 'medium';
  }
  
  return {
    playerState,
    recentTopics: memory,
    roomContext: playerState.currentRoom,
    questContext: playerState.quest,
    urgencyLevel
  };
}

/**
 * Generate contextual hint based on comprehensive analysis
 */
function generateContextualHint(context: AylaHintContext): HintResult {
  const { playerState, recentTopics, urgencyLevel } = context;
  
  // Handle critical situations first
  if (urgencyLevel === 'critical') {
    return handleCriticalSituation(playerState);
  }
  
  // Analyze recent conversation topics
  if (recentTopics.length > 0) {
            if (topicHint) return topicHint;
  }
  
  // Analyze player traits for personalized guidance
    if (traitHint) return traitHint;
  
  // Analyze current flags and progress
    if (progressHint) return progressHint;
  
  // Fallback to general guidance
  return generateGeneralGuidance(playerState);
}

/**
 * Handle critical situations requiring immediate attention
 */
function handleCriticalSituation(playerState: PlayerState): HintResult {
  if (playerState.health !== undefined && playerState.health < 20) {
    return {
      text: "Your wellbeing concerns me deeply. Seek healing immediately — check your inventory for restorative items, or find a safe place to recover.",
      type: 'warning',
      confidence: 0.95,
      followUpSuggestions: ['look for first aid kit', 'find healing location', 'avoid dangerous areas']
    };
  }
  
  if (playerState.resetCount && playerState.resetCount > 10) {
    return {
      text: "The pattern of resets suggests you're caught in a loop. Sometimes the answer isn't trying harder — it's trying differently. Consider approaching your current challenge from an entirely new angle.",
      type: 'guidance',
      confidence: 0.9,
      followUpSuggestions: ['try unconventional approaches', 'examine previous attempts', 'seek alternative paths']
    };
  }
  
  return generateGeneralGuidance(playerState);
}

/**
 * Generate hints based on recent conversation topics
 */
function generateTopicSpecificHint(topic: string, playerState: PlayerState): HintResult | null {
        
  // Trap-related guidance
  if (topic.includes('trap')) {
    if (!traits.includes('careful')) {
      return {
        text: "You keep encountering traps. The lattice suggests developing a more cautious approach — it's a mindset as much as a skill.",
        type: 'guidance',
        confidence: 0.8,
        followUpSuggestions: ['examine surroundings carefully', 'look before acting', 'consider consequences']
      };
    }
    return {
      text: "Your careful nature serves you well with traps. Trust your instincts, but remember — some traps are meant to be triggered by the right person at the right time.",
      type: 'encouragement',
      confidence: 0.7
    };
  }
  
  // Reset mechanics
  if (topic.includes('reset')) {
    if (!flags.pressed_blue_button) {
      return {
        text: "Reset mechanisms often involve clear, deliberate choices. Look for something obviously interactive — buttons have a way of calling attention to themselves, especially blue ones.",
        type: 'practical',
        confidence: 0.85,
        followUpSuggestions: ['look for buttons', 'examine control interfaces', 'check obvious interaction points']
      };
    }
    return {
      text: "You understand reset mechanics. Use this knowledge wisely — sometimes moving forward requires going back, but not always to where you started.",
      type: 'lore',
      confidence: 0.75
    };
  }
  
  // Character-specific guidance
  if (topic.includes('polly')) {
    return {
      text: "Polly carries deep pain but also deep wisdom. Her relationship with Dominic colors everything she does. Approach her with empathy — she reveals more to those who understand loss.",
      type: 'guidance',
      confidence: 0.8,
      followUpSuggestions: ['show empathy', 'ask about Dominic', 'be patient']
    };
  }
  
  if (topic.includes('dominic')) {
    return {
      text: "Dominic remembers everything, including things that happened to other versions of himself. His perspective transcends individual timelines — he may know answers about patterns you haven't noticed.",
      type: 'lore',
      confidence: 0.85,
      followUpSuggestions: ['ask about memories', 'discuss reset experiences', 'explore temporal themes']
    };
  }
  
  // Scroll and library mechanics
  if (topic.includes('scroll')) {
    if (!flags.found_library) {
      return {
        text: "Knowledge seeks knowledge. The scrolls you need are protected by someone who values learning above all else. Find the keeper of knowledge first — they may require proof of your scholarly intentions.",
        type: 'practical',
        confidence: 0.9,
        followUpSuggestions: ['find the librarian', 'prove scholarly worth', 'look for academic credentials']
      };
    }
    return {
      text: "Scrolls contain more than words — they contain possibility. Reading them changes not just your knowledge but your relationship with the lattice itself.",
      type: 'lore',
      confidence: 0.7
    };
  }
  
  return null;
}

/**
 * Generate hints based on player traits
 */
function generateTraitBasedHint(playerState: PlayerState): HintResult | null {
    
  if (traits.includes('curious')) {
    return {
      text: "Your curiosity is a gift. The lattice responds to those who ask questions, especially questions others are afraid to ask. Don't lose that sense of wonder.",
      type: 'encouragement',
      confidence: 0.7,
      followUpSuggestions: ['explore unusual options', 'ask unexpected questions', 'investigate anomalies']
    };
  }
  
  if (traits.includes('careful')) {
    return {
      text: "Your caution has served you well. But remember — some opportunities require calculated risks. The lattice rewards those who can balance prudence with courage.",
      type: 'guidance',
      confidence: 0.75,
      followUpSuggestions: ['assess risks vs rewards', 'trust your preparation', 'act when ready']
    };
  }
  
  if (traits.includes('cynical')) {
    return {
      text: "Your skepticism cuts through illusion, but don't let it blind you to genuine magic. Some things in this multiverse are exactly what they appear to be — wonderfully, impossibly real.",
      type: 'guidance',
      confidence: 0.7,
      followUpSuggestions: ['remain open to wonder', 'question your questions', 'allow for genuine mystery']
    };
  }
  
  return null;
}

/**
 * Generate hints based on player progress and flags
 */
function generateProgressBasedHint(playerState: PlayerState): HintResult | null {
      
  if (quest === 'redemption' && !flags.polly_forgiveness) {
    return {
      text: "Redemption is a journey, not a destination. Polly's forgiveness cannot be earned through grand gestures alone — it requires understanding what was truly lost and why it mattered.",
      type: 'guidance',
      confidence: 0.85,
      followUpSuggestions: ['understand the loss', 'show genuine remorse', 'demonstrate change']
    };
  }
  
  if (flags.multiple_resets && !flags.understanding_patterns) {
    return {
      text: "You've experienced multiple resets. Each one teaches something new about the nature of choice and consequence. The patterns you're seeing aren't random — they're trying to tell you something.",
      type: 'lore',
      confidence: 0.8,
      followUpSuggestions: ['analyze reset patterns', 'look for consistent elements', 'identify what changes vs what stays the same']
    };
  }
  
  return null;
}

/**
 * Generate general guidance when no specific context applies
 */
function generateGeneralGuidance(playerState: PlayerState): HintResult {
    
    return {
    ...randomHint,
    followUpSuggestions: ['explore thoroughly', 'interact with everything', 'question assumptions']
  };
}

/**
 * Record interaction with Ayla for memory tracking
 */
function recordAylaInteraction(playerState: PlayerState, result: HintResult): void {
  try {
    npcMemory.initNPC('ayla');
    npcMemory.recordInteraction('ayla', 'hint_request', {
      currentRoomId: playerState.currentRoom || 'unknown',
      playerState: {
        inventory: playerState.inventory,
        traits: playerState.traits,
        flags: playerState.flags
      }
    });
  } catch (error) {
    console.warn('[AskAylaBridge] Failed to record interaction:', error);
  }
}

/**
 * Fallback hint for error conditions
 */
function getDefaultHint(playerState: PlayerState): string {
    
  return defaultHints[Math.floor(Math.random() * defaultHints.length)];
}

/**
 * Get available hint categories for UI/help systems
 */
export function getHintCategories(): Record<string, { keywords: string[]; description: string }> {
  return Object.entries(hintCategories).reduce((acc, [key, value]) => {
    acc[key] = {
      keywords: value.keywords,
      description: `Guidance related to ${key}`
    };
    return acc;
  }, {} as Record<string, { keywords: string[]; description: string }>);
}

/**
 * Validate player state for hint generation
 */
export function validatePlayerState(state: any): state is PlayerState {
  return typeof state === 'object' && state !== null;
}

/**
 * Export utilities for external use
 */
export 
export default AskAylaBridge;
