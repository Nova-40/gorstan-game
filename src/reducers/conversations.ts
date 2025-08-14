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

// src/reducers/conversations.ts
// Conversation reducer for inter-NPC dialogue system
// Gorstan Game Beta 1

import { LocalGameState } from "../state/gameState";
import { ConversationThread } from "../types/dialogue";

export function conversationsReducer(
  state: LocalGameState,
  action: any,
): LocalGameState {
  switch (action.type) {
    case "UPSERT_CONVERSATION": {
      const thread =
        (action.payload as ConversationThread) ??
        (action.thread as ConversationThread);
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [thread.id]: thread,
        },
      };
    }

    case "SET_OVERHEAR": {
      return {
        ...state,
        overhearNPCBanter: !!action.payload,
      };
    }

    case "CLEAR_CONVERSATION": {
      const threadId =
        (action.payload as any)?.threadId ?? (action as any).threadId;
      const newConversations = { ...state.conversations };
      delete newConversations[threadId];
      return {
        ...state,
        conversations: newConversations,
      };
    }

    case "MUTE_CONVERSATION": {
      const threadId =
        (action.payload as any)?.threadId ?? (action as any).threadId;
      const muted = (action.payload as any)?.muted ?? (action as any).muted;
      const thread = state.conversations[threadId];
      if (!thread) {return state;}

      return {
        ...state,
        conversations: {
          ...state.conversations,
          [threadId]: {
            ...thread,
            mutedForPlayer: muted,
          },
        },
      };
    }

    default:
      return state;
  }
}
