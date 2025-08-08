// src/engine/npcEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Handles NPC logic, memory, or rendering.


import { getGameState } from '../state/gameState';
import { npcRegistry } from '../npcs/npcMemory';
import { v4 as uuidv4 } from 'uuid';
// If dispatchToConsole is not found, define a fallback here for type safety.
// Replace this with the correct import if available.
declare function dispatchToConsole(payload: any): void;
import type { NPC } from '../types/NPCTypes';
import type { LocalGameState } from '../state/gameState';
import { getEnhancedAylaResponse } from '../npc/ayla/aylaResponder';

type Topic = {
  triggers: string[];
  response: string | ((state: LocalGameState, memory: Record<string, any>) => string);
  tone?: string;
  condition?: (state: LocalGameState, memory: Record<string, any>) => boolean;
  failMessage?: string;
  onRespond?: (state: LocalGameState, memory: Record<string, any>) => void;
};


// --- Function: npcSpeak ---
export function npcSpeak(npcId: string, message: string, tone: string = "neutral") {
  const npc: NPC | undefined = npcRegistry.get(npcId);
  if (npc) {
    npc.lastMessage = message;
    npc.emotion = tone;
    npc.interrupted = false;
  }
  dispatchToConsole({
    id: uuidv4(),
    speaker: npcId,
    text: message,
    type: 'npc',
    tone,
    timestamp: Date.now()
  });
}


// --- Function: interruptNPC ---
export function interruptNPC(npcId: string) {
  const npc: NPC | undefined = npcRegistry.get(npcId);
  if (npc) {
    npc.interrupted = true;
    npc.lastMessage = '';
    dispatchToConsole({
      id: uuidv4(),
      text: `${npc.name} pauses, eyes narrowing.`,
      type: 'system',
      tone: 'alert',
      timestamp: Date.now()
    });
  }
}


// --- Function: npcReact ---
export function npcReact(npcId: string, playerInput: string, gameState?: LocalGameState | null) {
  if (!gameState) {
    console.warn('npcReact called without gameState - functionality may be limited');
    return;
  }
  const state = gameState;
  const npcObj: NPC | undefined = npcRegistry.get(npcId);
  if (!npcObj || npcObj.interrupted) return;
  
  // Special handling for enhanced Ayla with book lore and CTAs
  if (npcId === 'ayla' || npcObj.name?.toLowerCase() === 'ayla') {
    try {
      const aylaResponse = getEnhancedAylaResponse(playerInput, state);
      npcSpeak(npcId, aylaResponse, 'mysterious');
      return;
    } catch (error) {
      console.error('[npcEngine] Error with enhanced Ayla response:', error);
      // Fall through to standard handling
    }
  }
  
  // Standard NPC topic-based handling
  const memory: Record<string, any> = npcObj.memory || {};
  const playerName: string = state.player?.name || "Player";
  const flags: Record<string, any> = state.flags || {};
  const knownTopics: Topic[] = npcObj.topics || [];
  const matched: Topic | undefined = knownTopics.find((topic: Topic) =>
    topic.triggers.some((trigger: string) =>
      playerInput.toLowerCase().includes(trigger.toLowerCase())
    )
  );
  if (!matched) {
    npcSpeak(npcId, "I don't know what you mean. Try something else.");
    return;
  }
  if (matched.condition && !matched.condition(state, memory)) {
    npcSpeak(npcId, matched.failMessage || "Now's not the time for that.");
    return;
  }
  const response = typeof matched.response === 'function'
    ? matched.response(state, memory)
    : matched.response;
  npcSpeak(npcId, response, matched.tone || "neutral");
  if (matched.onRespond) matched.onRespond(state, memory);
}
