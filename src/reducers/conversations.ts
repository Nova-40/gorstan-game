// src/reducers/conversations.ts
// Conversation reducer for inter-NPC dialogue system
// Gorstan Game Beta 1

import { LocalGameState } from "../state/gameState";
import { ConversationThread } from "../types/dialogue";

export function conversationsReducer(state: LocalGameState, action: any): LocalGameState {
  switch (action.type) {
    case "UPSERT_CONVERSATION": {
      const thread = action.thread as ConversationThread;
      return { 
        ...state, 
        conversations: { 
          ...state.conversations, 
          [thread.id]: thread 
        } 
      };
    }
    
    case "SET_OVERHEAR": {
      return { 
        ...state, 
        overhearNPCBanter: !!action.payload 
      };
    }
    
    case "CLEAR_CONVERSATION": {
      const { threadId } = action;
      const newConversations = { ...state.conversations };
      delete newConversations[threadId];
      return {
        ...state,
        conversations: newConversations
      };
    }
    
    case "MUTE_CONVERSATION": {
      const { threadId, muted } = action;
      const thread = state.conversations[threadId];
      if (!thread) return state;
      
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [threadId]: {
            ...thread,
            mutedForPlayer: muted
          }
        }
      };
    }
    
    default:
      return state;
  }
}
