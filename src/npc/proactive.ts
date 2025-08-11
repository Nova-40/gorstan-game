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
// Proactive NPC awareness and prompting system

import { ContextSnapshot } from './context';
import { NPCMemoryState } from './memory';
import { getPersona } from './personas';

export interface ProactivePrompt {
  npcId: string;
  type: 'visual_flash' | 'thought_bubble' | 'urgent_flash';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  triggers: string[];
  cooldown_ms: number;
  accessibility: {
    screen_reader_text: string;
    keyboard_hint?: string;
  };
}

export interface ProactiveState {
  activePrompts: Map<string, ProactivePrompt>;
  lastPromptTime: Map<string, number>;
  suppressionFlags: Set<string>;
}

let proactiveState: ProactiveState = {
  activePrompts: new Map(),
  lastPromptTime: new Map(),
  suppressionFlags: new Set()
};

/**
 * Check if any NPCs should show proactive prompts
 */
export function checkProactivePrompts(
  context: ContextSnapshot,
  npcMemoryStates: Record<string, NPCMemoryState>
): ProactivePrompt[] {
  const currentTime = Date.now();
  const activePrompts: ProactivePrompt[] = [];
  
  // Check each NPC for proactive opportunities
  const availableNPCs = context.nearbyNPCs;
  
  for (const npcId of availableNPCs) {
    const lastPrompt = proactiveState.lastPromptTime.get(npcId) || 0;
    const suppressionKey = `${npcId}_${context.roomId}`;
    
    // Skip if recently prompted or suppressed
    if (currentTime - lastPrompt < 15000 || proactiveState.suppressionFlags.has(suppressionKey)) {
      continue;
    }
    
    const prompt = evaluateNPCPrompt(npcId, context, npcMemoryStates[npcId] || createEmptyMemory());
    
    if (prompt) {
      activePrompts.push(prompt);
      proactiveState.lastPromptTime.set(npcId, currentTime);
    }
  }
  
  return activePrompts.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
}

/**
 * Evaluate if an NPC should show a proactive prompt
 */
function evaluateNPCPrompt(
  npcId: string,
  context: ContextSnapshot,
  memory: NPCMemoryState
): ProactivePrompt | null {
  const persona = getPersona(npcId);
  
  // Ayla's specialized proactive behaviors
  if (npcId === 'ayla') {
    return evaluateAylaPrompts(context, memory);
  }
  
  // Polly's takeover urgency
  if (npcId === 'polly' && context.timers.pollyTakeover?.active) {
    return evaluatePollyUrgency(context, memory);
  }
  
  // Wendell's puzzle observations
  if (npcId === 'wendell' && context.roomId.includes('library')) {
    return evaluateWendellLibraryPrompts(context, memory);
  }
  
  // Chef's cooking context
  if (npcId === 'chef' && context.roomId.includes('kitchen')) {
    return evaluateChefPrompts(context, memory);
  }
  
  // Dominic's system observations
  if (npcId === 'dominic') {
    return evaluateDominicPrompts(context, memory);
  }
  
  return null;
}

/**
 * Ayla's proactive prompts - she's very aware and helpful
 */
function evaluateAylaPrompts(context: ContextSnapshot, memory: NPCMemoryState): ProactivePrompt | null {
  // Flash when player seems stuck (checking session info for stuck indicators)
  if (context.sessionInfo.roomVisitCount > 5 && 
      context.sessionInfo.idleTime > 30000) {
    return {
      npcId: 'ayla',
      type: 'visual_flash',
      message: "I might have some ideas...",
      priority: 'medium',
      triggers: ['stuck_behavior'],
      cooldown_ms: 30000,
      accessibility: {
        screen_reader_text: "Ayla seems to have noticed you're having trouble and might have suggestions",
        keyboard_hint: "Press Tab to focus on Ayla's talk button"
      }
    };
  }
  
  // Urgent flash during Polly takeover
  if (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 60000) {
    return {
      npcId: 'ayla',
      type: 'urgent_flash',
      message: "Time's running out!",
      priority: 'urgent',
      triggers: ['time_pressure'],
      cooldown_ms: 10000,
      accessibility: {
        screen_reader_text: "Ayla is urgently trying to get your attention - time is running out!",
        keyboard_hint: "Press Tab to focus on Ayla's talk button immediately"
      }
    };
  }
  
  // Flash when player discovers new lore
  if (context.recentConsoleEvents.includes('lore_discovered') && memory.relationshipLevel > 0.5) {
    return {
      npcId: 'ayla',
      type: 'visual_flash',
      message: "That reminds me of something...",
      priority: 'low',
      triggers: ['lore_discovery'],
      cooldown_ms: 45000,
      accessibility: {
        screen_reader_text: "Ayla seems to have connected what you just learned to something else"
      }
    };
  }
  
  // Flash when puzzle solution items are present
  if (context.inventory.includes('coin') && context.roomId.includes('library')) {
    return {
      npcId: 'ayla',
      type: 'visual_flash',
      message: "About that coin...",
      priority: 'medium',
      triggers: ['puzzle_opportunity'],
      cooldown_ms: 20000,
      accessibility: {
        screen_reader_text: "Ayla has noticed you have the coin and seems to want to discuss it"
      }
    };
  }
  
  return null;
}

/**
 * Polly's urgent prompts during takeover
 */
function evaluatePollyUrgency(context: ContextSnapshot, memory: NPCMemoryState): ProactivePrompt | null {
  if (!context.timers.pollyTakeover?.active) return null;
  
  const timeRemaining = context.timers.pollyTakeover.timeRemaining;
  
  if (timeRemaining < 30000) {
    return {
      npcId: 'polly',
      type: 'urgent_flash',
      message: "CRITICAL: System override imminent",
      priority: 'urgent',
      triggers: ['system_takeover'],
      cooldown_ms: 5000,
      accessibility: {
        screen_reader_text: "ALERT: Polly's system takeover is imminent - less than 30 seconds remaining",
        keyboard_hint: "Press Tab to focus on Polly immediately - critical situation"
      }
    };
  }
  
  return null;
}

/**
 * Wendell's library observations
 */
function evaluateWendellLibraryPrompts(context: ContextSnapshot, memory: NPCMemoryState): ProactivePrompt | null {
  // Flash when player examines specific books
  if (context.recentConsoleEvents.includes('book_examined') && memory.totalInteractions < 3) {
    return {
      npcId: 'wendell',
      type: 'visual_flash',
      message: "Curious choice of reading...",
      priority: 'low',
      triggers: ['book_examination'],
      cooldown_ms: 25000,
      accessibility: {
        screen_reader_text: "Wendell has noticed your choice of book and seems to have thoughts about it"
      }
    };
  }
  
  return null;
}

/**
 * Chef's cooking context prompts
 */
function evaluateChefPrompts(context: ContextSnapshot, memory: NPCMemoryState): ProactivePrompt | null {
  // Flash when ingredients are combined incorrectly
  if (context.recentConsoleEvents.includes('cooking_failed')) {
    return {
      npcId: 'chef',
      type: 'visual_flash',
      message: "Perhaps a different approach?",
      priority: 'medium',
      triggers: ['cooking_failure'],
      cooldown_ms: 20000,
      accessibility: {
        screen_reader_text: "Chef has noticed your cooking attempt failed and might have advice"
      }
    };
  }
  
  return null;
}

/**
 * Dominic's system observations
 */
function evaluateDominicPrompts(context: ContextSnapshot, memory: NPCMemoryState): ProactivePrompt | null {
  // Flash when system anomalies occur
  if (context.recentConsoleEvents.includes('glitch_detected')) {
    return {
      npcId: 'dominic',
      type: 'visual_flash',
      message: "System irregularities noted. Bloop.",
      priority: 'low',
      triggers: ['system_anomaly'],
      cooldown_ms: 30000,
      accessibility: {
        screen_reader_text: "Dominic has detected system irregularities and might have technical insights"
      }
    };
  }
  
  return null;
}

/**
 * Set a prompt as active in the UI
 */
export function activatePrompt(prompt: ProactivePrompt): void {
  proactiveState.activePrompts.set(prompt.npcId, prompt);
}

/**
 * Clear a prompt (when player interacts with NPC)
 */
export function clearPrompt(npcId: string): void {
  proactiveState.activePrompts.delete(npcId);
}

/**
 * Suppress prompts for an NPC in current location
 */
export function suppressPrompts(npcId: string, location: string): void {
  const suppressionKey = `${npcId}_${location}`;
  proactiveState.suppressionFlags.add(suppressionKey);
  
  // Auto-clear suppression after 2 minutes
  setTimeout(() => {
    proactiveState.suppressionFlags.delete(suppressionKey);
  }, 120000);
}

/**
 * Get currently active prompts for UI rendering
 */
export function getActivePrompts(): ProactivePrompt[] {
  return Array.from(proactiveState.activePrompts.values());
}

/**
 * Check if an NPC has an active prompt
 */
export function hasActivePrompt(npcId: string): boolean {
  return proactiveState.activePrompts.has(npcId);
}

/**
 * Get prompt for specific NPC if active
 */
export function getPromptForNPC(npcId: string): ProactivePrompt | null {
  return proactiveState.activePrompts.get(npcId) || null;
}

/**
 * Clear all prompts (for location changes, etc.)
 */
export function clearAllPrompts(): void {
  proactiveState.activePrompts.clear();
}

/**
 * Update prompt priorities based on context changes
 */
export function updatePromptPriorities(context: ContextSnapshot): void {
  for (const [npcId, prompt] of proactiveState.activePrompts) {
    // Upgrade priority during time pressure
    if (context.timers.pollyTakeover?.active && context.timers.pollyTakeover.timeRemaining < 60000) {
      if (prompt.priority === 'medium') {
        prompt.priority = 'high';
      } else if (prompt.priority === 'low') {
        prompt.priority = 'medium';
      }
    }
    
    // Downgrade old prompts
    const age = Date.now() - (proactiveState.lastPromptTime.get(npcId) || 0);
    if (age > 45000 && prompt.priority === 'high') {
      prompt.priority = 'medium';
    }
  }
}

// Utility functions

/**
 * Get numeric weight for priority sorting
 */
function getPriorityWeight(priority: string): number {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * Create empty memory state for NPCs without existing memory
 */
function createEmptyMemory(): NPCMemoryState {
  return {
    npcId: '',
    conversationBuffer: [],
    episodicMemories: [],
    semanticMemory: {},
    lastInteraction: 0,
    totalInteractions: 0,
    relationshipLevel: 0,
    playerPreferences: {
      likes_hints: false,
      impatient: false,
      explores_thoroughly: false,
      asks_for_help: false
    }
  };
}

/**
 * Initialize proactive system
 */
export function initializeProactiveSystem(): void {
  // Clear any existing state
  proactiveState = {
    activePrompts: new Map(),
    lastPromptTime: new Map(),
    suppressionFlags: new Set()
  };
  
  console.log('[Proactive] NPC proactive awareness system initialized');
}
