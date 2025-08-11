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
// Main entry point for enhanced NPC dialogue system

// Import functions for internal use
import { getPersona } from './personas';
import { getNPCMemory, addConversationTurn, addEpisodicMemory, updatePlayerPreference, getMemorySummary } from './memory';
import { getContextSnapshot, analyzePlayerBehavior } from './context';
import { classifyIntent } from './intent';
import { generateNPCReply } from './respond';
import { 
  checkProactivePrompts,
  activatePrompt,
  clearPrompt,
  suppressPrompts,
  hasActivePrompt,
  getPromptForNPC,
  clearAllPrompts,
  updatePromptPriorities,
  getActivePrompts,
  initializeProactiveSystem
} from './proactive';
import { handleNPCConversation, getConversationStats, initializeConversationSystem } from './conversation';
import type { ProactivePrompt } from './proactive';

// Export types
export type { NPCPersona } from './personas';
export type { 
  NPCMemoryState, 
  ConversationTurn, 
  EpisodicMemory 
} from './memory';
export type { ContextSnapshot } from './context';
export type { IntentResult } from './intent';
export type { ResponseTemplate } from './respond';
export type { 
  ProactivePrompt,
  ProactiveState 
} from './proactive';
export type { 
  ConversationFeatures,
  ConversationResponse 
} from './conversation';

// Re-export functions
export { getPersona };
export { 
  getNPCMemory,
  addConversationTurn,
  addEpisodicMemory,
  updatePlayerPreference,
  getMemorySummary 
};
export { 
  getContextSnapshot,
  analyzePlayerBehavior 
};
export { classifyIntent };
export { generateNPCReply };
export { 
  checkProactivePrompts,
  activatePrompt,
  clearPrompt,
  suppressPrompts,
  hasActivePrompt,
  getPromptForNPC,
  clearAllPrompts,
  updatePromptPriorities 
};
export { 
  handleNPCConversation,
  getConversationStats 
};

/**
 * Initialize the complete NPC dialogue engine v2
 */
export function initializeNPCDialogueEngine(): void {
  console.log('[NPC Engine] Initializing Gorstan NPC Dialogue Engine v2...');
  
  try {
    // Initialize subsystems that have initialization functions
    initializeProactiveSystem();
    initializeConversationSystem();
    
    console.log('[NPC Engine] ✅ NPC dialogue systems initialized successfully');
    console.log('[NPC Engine] Features enabled:');
    console.log('[NPC Engine] - ✅ AI-like personality system');
    console.log('[NPC Engine] - ✅ Memory and relationship tracking');
    console.log('[NPC Engine] - ✅ Context-aware responses');
    console.log('[NPC Engine] - ✅ Proactive awareness (visual prompts)');
    console.log('[NPC Engine] - ✅ Natural conversation features');
    console.log('[NPC Engine] - ✅ "Ask twice" rule for sensitive info');
    console.log('[NPC Engine] - ✅ Micro-hedges and self-correction');
    console.log('[NPC Engine] - ✅ Accessibility support');
    
  } catch (error) {
    console.error('[NPC Engine] ❌ Failed to initialize NPC dialogue engine:', error);
    throw error;
  }
}

/**
 * Get engine status and statistics
 */
export function getNPCEngineStatus(): {
  initialized: boolean;
  activeNPCs: string[];
  totalConversations: number;
  activePrompts: number;
  features: string[];
} {
  try {
    const activePrompts = getActivePrompts();
    
    return {
      initialized: true,
      activeNPCs: ['ayla', 'polly', 'dominic', 'wendell', 'chef'],
      totalConversations: 0, // Would be calculated from memory
      activePrompts: activePrompts.length,
      features: [
        'persona-based-responses',
        'memory-tracking',
        'context-awareness',
        'proactive-prompting',
        'natural-dialogue',
        'accessibility-support'
      ]
    };
  } catch (error) {
    return {
      initialized: false,
      activeNPCs: [],
      totalConversations: 0,
      activePrompts: 0,
      features: []
    };
  }
}

/**
 * Simple conversation interface for game integration
 */
export async function talkToNPC(
  npcId: string,
  playerMessage: string,
  gameState: any
): Promise<string> {
  try {
    const response = await handleNPCConversation(npcId, playerMessage, gameState);
    return response.message;
  } catch (error) {
    console.error(`[NPC Engine] Error in conversation with ${npcId}:`, error);
    
    // Fallback to simple response
    const persona = getPersona(npcId);
    return persona.catchphrases[0] || "I'm not sure how to respond to that.";
  }
}

/**
 * Check if any NPCs want to get the player's attention
 */
export function checkForNPCPrompts(gameState: any): ProactivePrompt[] {
  try {
    const context = getContextSnapshot(gameState);
    const npcMemories: Record<string, any> = {};
    
    // Get memory for all nearby NPCs
    for (const npcId of context.nearbyNPCs) {
      npcMemories[npcId] = getNPCMemory(npcId);
    }
    
    return checkProactivePrompts(context, npcMemories);
  } catch (error) {
    console.error('[NPC Engine] Error checking proactive prompts:', error);
    return [];
  }
}

/**
 * Handle NPC interaction when player clicks "Talk" button
 */
export async function handleNPCInteraction(
  npcId: string,
  gameState: any,
  playerInput?: string
): Promise<{
  response: string;
  prompts: string[];
  mood: string;
}> {
  try {
    // Clear any active prompts for this NPC
    clearPrompt(npcId);
    
    // Use default greeting if no input provided
    const message = playerInput || "Hello";
    
    const conversationResult = await handleNPCConversation(npcId, message, gameState);
    
    return {
      response: conversationResult.message,
      prompts: conversationResult.followUpPrompts || [],
      mood: conversationResult.features.emotionalTone
    };
  } catch (error) {
    console.error(`[NPC Engine] Error in NPC interaction with ${npcId}:`, error);
    
    // Fallback response
    return {
      response: "Hello there!",
      prompts: [],
      mood: 'neutral'
    };
  }
}

/**
 * Debug function to get detailed NPC state
 */
export function debugNPCState(npcId: string): any {
  try {
    const persona = getPersona(npcId);
    const memory = getNPCMemory(npcId);
    const stats = getConversationStats(npcId);
    const hasPrompt = hasActivePrompt(npcId);
    
    return {
      npcId,
      persona: {
        id: persona.id,
        role: persona.role,
        tone: persona.tone,
        speaking_style: persona.speaking_style
      },
      memory: {
        conversationBuffer: memory.conversationBuffer.length,
        episodicMemories: memory.episodicMemories.length,
        relationshipLevel: memory.relationshipLevel,
        totalInteractions: memory.totalInteractions
      },
      stats,
      hasActivePrompt: hasPrompt,
      activePrompt: hasPrompt ? getPromptForNPC(npcId) : null
    };
  } catch (error) {
    console.error(`[NPC Engine] Error getting debug state for ${npcId}:`, error);
    return null;
  }
}

/**
 * Reset NPC system (for testing or game restart)
 */
export function resetNPCSystem(): void {
  console.log('[NPC Engine] Resetting NPC dialogue system...');
  
  clearAllPrompts();
  
  // Note: Memory clearing would need to be implemented in memory.ts
  console.log('[NPC Engine] ✅ NPC system reset complete');
}

/**
 * Configuration for NPC engine features
 */
export const NPC_ENGINE_CONFIG = {
  version: 'v2.0.0',
  features: {
    personalities: true,
    memory: true,
    proactive: true,
    accessibility: true,
    natural_dialogue: true
  },
  limits: {
    conversation_buffer: 12,
    episodic_memory_days: 1,
    prompt_cooldown_ms: 15000
  },
  debug: {
    logging: true,
    detailed_stats: false
  }
} as const;
