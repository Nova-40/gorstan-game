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

// src/npc/talk.ts
// Public API for Inter-NPC Conversations
// High-level functions for scripted NPC dialogue
// Gorstan Game Beta 2

import { sendNPCMessage, canStartConversation, recordConversationStart } from "./conversationBus";
import { NPC_IDS } from "./registry";
import { LocalGameState } from "../state/gameState";

export interface ConversationContext {
  state: LocalGameState;
  dispatch: any;
  roomId: string;
}

type Ctx = ConversationContext;

// Ayla can talk to any NPC (meta character privilege)
export function aylaSayTo(npcId: string, text: string, ctx: Ctx): void {
  if (!canStartConversation(NPC_IDS.AYLA, npcId, ctx.roomId, ctx.state)) {
    return; // Skip if on cooldown
  }

  sendNPCMessage(
    { kind: "NPC", id: NPC_IDS.AYLA }, 
    { kind: "NPC", id: npcId }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true,
      priority: "normal"
    }
  );

  recordConversationStart(NPC_IDS.AYLA, npcId, ctx.roomId, ctx.state);
}

// Morthos to Al conversation
export function morthosToAl(text: string, ctx: Ctx): void {
  if (!canStartConversation(NPC_IDS.MORTHOS, NPC_IDS.AL, ctx.roomId, ctx.state)) {
    return;
  }

  sendNPCMessage(
    { kind: "NPC", id: NPC_IDS.MORTHOS }, 
    { kind: "NPC", id: NPC_IDS.AL }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true
    }
  );

  recordConversationStart(NPC_IDS.MORTHOS, NPC_IDS.AL, ctx.roomId, ctx.state);
}

// Al to Morthos conversation
export function alToMorthos(text: string, ctx: Ctx): void {
  if (!canStartConversation(NPC_IDS.AL, NPC_IDS.MORTHOS, ctx.roomId, ctx.state)) {
    return;
  }

  sendNPCMessage(
    { kind: "NPC", id: NPC_IDS.AL }, 
    { kind: "NPC", id: NPC_IDS.MORTHOS }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true
    }
  );

  recordConversationStart(NPC_IDS.AL, NPC_IDS.MORTHOS, ctx.roomId, ctx.state);
}

// Al to Ayla conversation
export function alToAyla(text: string, ctx: Ctx): void {
  sendNPCMessage(
    { kind: "NPC", id: NPC_IDS.AL }, 
    { kind: "NPC", id: NPC_IDS.AYLA }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true
    }
  );
}

// Morthos to Ayla conversation  
export function morthosToAyla(text: string, ctx: Ctx): void {
  sendNPCMessage(
    { kind: "NPC", id: NPC_IDS.MORTHOS }, 
    { kind: "NPC", id: NPC_IDS.AYLA }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true
    }
  );
}

// Generic NPC-to-NPC function
export function npcSayTo(fromNpcId: string, toNpcId: string, text: string, ctx: Ctx): void {
  sendNPCMessage(
    { kind: "NPC", id: fromNpcId }, 
    { kind: "NPC", id: toNpcId }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: true
    }
  );
}

// Hidden conversation (not visible to player) - for coordination
export function hiddenNPCExchange(fromNpcId: string, toNpcId: string, text: string, ctx: Ctx): void {
  sendNPCMessage(
    { kind: "NPC", id: fromNpcId }, 
    { kind: "NPC", id: toNpcId }, 
    text, 
    ctx.state, 
    ctx.dispatch, 
    ctx.roomId, 
    {
      topic: guessTopic(text),
      visibleToPlayer: false,
      priority: "low"
    }
  );
}

// Guess conversation topic from text content
function guessTopic(text: string): "hint" | "lore" | "banter" | "quest" {
  const s = text.toLowerCase();
  
  // Hint keywords
  if (s.includes("control nexus") || s.includes("where") || s.includes("pattern") || s.includes("sequence") || s.includes("suggest") || s.includes("hint")) {
    return "hint";
  }
  
  // Lore keywords
  if (s.includes("why") || s.includes("history") || s.includes("remember") || s.includes("originally") || s.includes("before")) {
    return "lore";
  }
  
  // Quest keywords
  if (s.includes("mission") || s.includes("task") || s.includes("objective") || s.includes("progress") || s.includes("complete")) {
    return "quest";
  }
  
  // Default to banter
  return "banter";
}

// Convenience functions for common scenarios
export const NPCTalk = {
  // Ayla guiding other NPCs
  aylaToMorthos: (text: string, ctx: Ctx) => aylaSayTo(NPC_IDS.MORTHOS, text, ctx),
  aylaToAl: (text: string, ctx: Ctx) => aylaSayTo(NPC_IDS.AL, text, ctx),
  
  // Engineer banter
  morthosAndAl: {
    morthosStarts: (text: string, ctx: Ctx) => morthosToAl(text, ctx),
    alStarts: (text: string, ctx: Ctx) => alToMorthos(text, ctx)
  },
  
  // Hidden coordination
  hiddenHint: (fromNpc: string, toNpc: string, hint: string, ctx: Ctx) => 
    hiddenNPCExchange(fromNpc, toNpc, hint, ctx),
    
  // Generic
  any: (from: string, to: string, text: string, ctx: Ctx) => npcSayTo(from, to, text, ctx)
};
