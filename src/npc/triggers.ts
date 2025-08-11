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

// src/npc/triggers.ts
// Conversation Triggers for Inter-NPC Dialogue
// Handles when NPCs should start talking to each other
// Gorstan Game Beta 1

import { LocalGameState } from "../state/gameState";
import { morthosToAl, alToMorthos, aylaSayTo, NPCTalk, ConversationContext } from "./talk";
import { NPC_IDS } from "./registry";

// Check if player appears to be stuck in a room
export function isPlayerStuck(state: LocalGameState, roomId: string): boolean {
  const roomVisits = state.roomVisitCount[roomId] || 0;
  const timeInRoom = Date.now() - (state.gameTime.currentTime || Date.now());
  
  // Consider stuck if: lots of visits to same room OR long time in room without progress
  return roomVisits > 8 || timeInRoom > 180000; // 3 minutes
}

// Trigger banter when both Morthos and Al are in the same room
export function maybeStartBanter(state: LocalGameState, dispatch: any, roomId: string): void {
  const ctx: ConversationContext = { state, dispatch, roomId };
  
  // Check if both are present
  const morthosPresent = state.npcsInRoom?.some(n => n.id === NPC_IDS.MORTHOS);
  const alPresent = state.npcsInRoom?.some(n => n.id === NPC_IDS.AL);
  
  if (!morthosPresent || !alPresent) return;

  // Room-specific banter
  const banters = getRoomBanter(roomId);
  if (banters.length === 0) return;

  const banter = banters[Math.floor(Math.random() * banters.length)];
  
  // Randomly choose who starts
  if (Math.random() < 0.5) {
    morthosToAl(banter.morthos, ctx);
  } else {
    alToMorthos(banter.al, ctx);
  }
}

// Room-specific banter content
function getRoomBanter(roomId: string): Array<{morthos: string, al: string}> {
  const roomBanters: Record<string, Array<{morthos: string, al: string}>> = {
    'controlnexus': [
      {
        morthos: "Did you move my trans-spanner again?",
        al: "Your tools are exactly where efficiency dictates."
      },
      {
        morthos: "The control matrix seems unstable today.",
        al: "Correlation does not imply causation, Morthos."
      },
      {
        morthos: "Look, the chair glows when they hesitate.",
        al: "The luminescence is timer-based, not emotion-responsive."
      }
    ],
    'resetroom': [
      {
        morthos: "Another reset cycle completed.",
        al: "Temporal mechanics are functioning within parameters."
      },
      {
        morthos: "Do you think they understand the pattern yet?",
        al: "Pattern recognition varies by individual cognitive capacity."
      }
    ],
    'offgorstan': [
      {
        morthos: "The portal stabilizers need recalibration.",
        al: "Maintenance schedules are current and optimal."
      },
      {
        morthos: "Strange readings from the dimensional sensors.",
        al: "Define 'strange' with quantifiable metrics, please."
      }
    ]
  };

  return roomBanters[roomId] || [];
}

// Trigger Ayla guidance when player is stuck
export function maybeAylaIntervention(state: LocalGameState, dispatch: any, roomId: string): void {
  if (!isPlayerStuck(state, roomId)) return;

  const ctx: ConversationContext = { state, dispatch, roomId };
  
  // Ayla guides other NPCs based on what's available
  const morthosPresent = state.npcsInRoom?.some(n => n.id === NPC_IDS.MORTHOS);
  const alPresent = state.npcsInRoom?.some(n => n.id === NPC_IDS.AL);

  if (morthosPresent && roomId === 'controlnexus') {
    aylaSayTo(NPC_IDS.MORTHOS, "Morthos, the player is circling. Suggest you hint at the pedestal pattern.", ctx);
  } else if (alPresent && roomId === 'controlnexus') {
    aylaSayTo(NPC_IDS.AL, "Al, they need precision guidance on the sequence.", ctx);
  } else if (morthosPresent) {
    aylaSayTo(NPC_IDS.MORTHOS, "Your engineering perspective might help here.", ctx);
  } else if (alPresent) {
    aylaSayTo(NPC_IDS.AL, "Systematic analysis might clarify their confusion.", ctx);
  }
}

// Trigger conversations on room entry
export function onRoomEntry(state: LocalGameState, dispatch: any, newRoomId: string, oldRoomId?: string): void {
  // Short delay to let room settle
  setTimeout(() => {
    maybeStartBanter(state, dispatch, newRoomId);
  }, 2000);
}

// Trigger conversations on game events
export function onGameEvent(eventType: string, state: LocalGameState, dispatch: any, roomId: string): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  switch (eventType) {
    case 'player_acquired_item':
      // NPCs comment on player finding things
      if (Math.random() < 0.3) { // 30% chance
        NPCTalk.morthosAndAl.morthosStarts("They found something interesting.", ctx);
      }
      break;

    case 'puzzle_attempt_failed':
      // NPCs discuss player's struggles
      if (Math.random() < 0.4) { // 40% chance
        NPCTalk.morthosAndAl.alStarts("Systematic approach would be more efficient.", ctx);
      }
      break;

    case 'player_idle_too_long':
      maybeAylaIntervention(state, dispatch, roomId);
      break;

    case 'reset_initiated':
      // NPCs discuss the reset
      NPCTalk.aylaToMorthos("Another cycle begins.", ctx);
      break;
  }
}

// Check for conversation opportunities periodically
export function periodicConversationCheck(state: LocalGameState, dispatch: any, roomId: string): void {
  // Run every 2 minutes when player is active
  const now = Date.now();
  const lastCheck = (state as any)._lastConversationCheck || 0;
  
  if (now - lastCheck < 120000) return; // 2 minute cooldown
  
  (state as any)._lastConversationCheck = now;
  
  // Various triggers
  if (isPlayerStuck(state, roomId)) {
    maybeAylaIntervention(state, dispatch, roomId);
  } else if (Math.random() < 0.2) { // 20% chance of spontaneous banter
    maybeStartBanter(state, dispatch, roomId);
  }
}

// Scripted conversation examples for specific game states
export function scriptedConversations(state: LocalGameState, dispatch: any, roomId: string): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  // Example: Reset Room meet-cute
  if (roomId === 'resetroom' && !state.flags.seenResetBanter) {
    setTimeout(() => {
      morthosToAl("Look, the chair glows when they hesitate.", ctx);
      setTimeout(() => {
        alToMorthos("Correlation is not causation. The luminescence is timer-based.", ctx);
        setTimeout(() => {
          aylaSayTo(NPC_IDS.AL, "Pedantry acknowledged. Suggest you also mention the floor pattern if asked.", ctx);
        }, 2000);
      }, 3000);
    }, 1000);

    // Mark as seen
    dispatch({
      type: 'SET_FLAG',
      payload: { key: 'seenResetBanter', value: true }
    });
  }

  // Example: Quest escalation  
  if (state.flags.hasRemote && !state.flags.triedChair && roomId === 'controlnexus') {
    // Hidden coordination
    NPCTalk.hiddenHint(NPC_IDS.AYLA, NPC_IDS.MORTHOS, "Player acquired remote but hasn't tried a chair.", ctx);
  }
}
