// src/npc/conversationBus.ts
// Inter-NPC Conversation Orchestrator
// Manages NPC-to-NPC dialogue with cooldowns, co-location rules, and player visibility
// Gorstan Game Beta 1

import { ConversationThread, NPCExchange, SpeakerRef } from "../types/dialogue";
import { LocalGameState } from "../state/gameState";
import { getNPCMemory, getVoiceForNPC, recordConversation } from "./profiles";
import { stylize, generateNPCResponse } from "./style";
import { CO_LOCATED_ONLY, CROSS_ROOM_SPEAKERS, MAX_THREAD_EXCHANGES } from "./registry";
import { getEnhancedNPCResponse } from "../utils/enhancedNPCResponse";

type Dispatch = (action: any) => void;

export interface SendOptions {
  topic?: string;
  visibleToPlayer?: boolean;
  priority?: "low" | "normal" | "high";
}

function threadId(from: SpeakerRef, to: SpeakerRef, roomId: string): string {
  const participants = [from.id, to.id].sort();
  return `thr:${roomId}:${participants.join('-')}`;
}

// Global reply guard to prevent infinite loops
let replying = false;

export function sendNPCMessage(
  from: SpeakerRef, 
  to: SpeakerRef, 
  rawText: string,
  state: LocalGameState, 
  dispatch: Dispatch, 
  roomId: string, 
  opts: SendOptions = {}
): void {
  const id = threadId(from, to, roomId);
  const thread = state.conversations?.[id] ?? {
    id, 
    roomId, 
    participants: [from.id, to.id], 
    exchanges: [], 
    lastTs: 0,
    priority: opts.priority ?? "normal"
  } as ConversationThread;

  const exchange: NPCExchange = {
    from, 
    to,
    text: rawText,
    ts: Date.now(),
    topic: opts.topic,
    visibleToPlayer: opts.visibleToPlayer ?? (state.overhearNPCBanter ?? true)
  };

  thread.exchanges.push(exchange);
  thread.lastTs = exchange.ts;

  // Limit thread size
  if (thread.exchanges.length > MAX_THREAD_EXCHANGES) {
    thread.exchanges = thread.exchanges.slice(-MAX_THREAD_EXCHANGES);
  }

  dispatch({ type: "UPSERT_CONVERSATION", thread });

  // Show in console if visible to player
  if (exchange.visibleToPlayer && from.kind === "NPC" && to.kind === "NPC") {
    dispatch({ 
      type: "ADD_CONSOLE_LINE", 
      line: `[${from.id} → ${to.id}] ${rawText}` 
    });
  }

  // Record in NPC memory
  if (from.kind === "NPC") {
    recordConversation(from.id, to.id, opts.topic || "banter", rawText);
  }

  // Auto-reply if receiver is an NPC
  if (to.kind === "NPC") {
    scheduleNPCReply(from, to, state, dispatch, roomId, opts.topic);
  }
}

function scheduleNPCReply(
  from: SpeakerRef, 
  to: SpeakerRef, 
  state: LocalGameState, 
  dispatch: Dispatch, 
  roomId: string, 
  topic?: string
): void {
  if (replying) return;
  replying = true;

  const delay = 350 + Math.floor(Math.random() * 400); // Short, natural pause
  
  setTimeout(() => {
    try {
      // Co-location rule: unless AYLA or explicitly cross-room, require same room
      const requiresCoLocation = CO_LOCATED_ONLY.includes(from.id as any) && 
                                 CO_LOCATED_ONLY.includes(to.id as any);
      const canCrossRooms = CROSS_ROOM_SPEAKERS.includes(from.id as any) || 
                           CROSS_ROOM_SPEAKERS.includes(to.id as any);
      
      if (requiresCoLocation && !canCrossRooms) {
        const fromInRoom = state.npcsInRoom?.some(n => n.id === from.id);
        const toInRoom = state.npcsInRoom?.some(n => n.id === to.id);
        if (!fromInRoom || !toInRoom) {
          return; // Skip reply if not co-located
        }
      }

      // Generate response using enhanced NPC system or fallback
      let responseText: string;
      const promptFromNPC = buildPromptFromNPC(from.id, topic);
      
      // Try enhanced system first
      const enhancedResponse = getEnhancedNPCResponse(to.id, promptFromNPC, state);
      if (enhancedResponse) {
        responseText = enhancedResponse.text;
      } else {
        // Fallback to style-based generation
        responseText = generateNPCResponse(from.id, to.id, topic, promptFromNPC);
      }

      // Apply voice styling
      const voice = getVoiceForNPC(to.id);
      const styledResponse = stylize(responseText, voice);

      // Send the reply
      sendNPCMessage(
        { kind: "NPC", id: to.id }, 
        { kind: "NPC", id: from.id }, 
        styledResponse, 
        state, 
        dispatch, 
        roomId, 
        {
          topic, 
          visibleToPlayer: state.overhearNPCBanter ?? true
        }
      );

    } finally {
      replying = false;
    }
  }, delay);
}

// Helper functions to create contextual prompts for NPC replies
function buildPromptFromNPC(fromNpcId: string, topic?: string): string {
  if (topic === "hint") return `hint about current objective from ${fromNpcId}`;
  if (topic === "lore") return `lore question from ${fromNpcId}`;
  if (topic === "quest") return `quest discussion from ${fromNpcId}`;
  return `message from ${fromNpcId}`;
}

// Check if a conversation thread has reached its limit
export function isThreadAtLimit(thread: ConversationThread): boolean {
  return thread.exchanges.length >= MAX_THREAD_EXCHANGES;
}

// Check cooldown for NPC pair in a room
export function canStartConversation(
  npc1: string, 
  npc2: string, 
  roomId: string, 
  state: LocalGameState
): boolean {
  const key = `banter:${roomId}:${[npc1, npc2].sort().join('-')}`;
  const lastBanter = (state as any)._banterLast?.[key] ?? 0;
  const cooldown = 90000; // 90 seconds
  
  return Date.now() - lastBanter > cooldown;
}

// Record conversation start for cooldown tracking
export function recordConversationStart(
  npc1: string, 
  npc2: string, 
  roomId: string, 
  state: LocalGameState
): void {
  const key = `banter:${roomId}:${[npc1, npc2].sort().join('-')}`;
  (state as any)._banterLast = { 
    ...(state as any)._banterLast, 
    [key]: Date.now() 
  };
}
