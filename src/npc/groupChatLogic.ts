/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Enhanced group chat logic for multi-NPC conversations with specific behaviors
  Handles zone-specific rules, NPC protection, and dynamic interactions
*/

import type { LocalGameState } from '../state/gameState';
import type { NPC } from '../types/NPCTypes';
import { NPCTalk, ConversationContext } from './talk';

interface GroupChatContext {
  state: LocalGameState;
  dispatch: any;
  roomId: string;
  npcsInRoom: NPC[];
}

/**
 * Enhanced group chat behaviors for different zones and NPC combinations
 */
export class GroupChatManager {
  
  /**
   * Determine if all NPCs should be in group chat for current zone
   */
  static shouldForceGroupChat(roomId: string, zone: string): boolean {
    // Stanton Harcourt zone - all NPCs in group chat
    if (zone === 'stantonZone' || zone === 'stantonharcourtZone') {
      return true;
    }
    
    // Control rooms always group chat
    if (roomId.includes('control') || roomId.includes('nexus')) {
      return true;
    }
    
    // Final areas
    if (zone === 'resetZone' || zone === 'endgameZone') {
      return true;
    }
    
    return false;
  }

  /**
   * Handle Morthos protecting player from Polly
   */
  static triggerMorthosProtection(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const hasPolly = context.npcsInRoom.some(npc => npc.id === 'polly');
    const hasMorthos = context.npcsInRoom.some(npc => npc.id === 'morthos');
    
    if (hasPolly && hasMorthos && state.flags?.dominicIsDead) {
      const ctx: ConversationContext = { state, dispatch, roomId };
      
      // Morthos intervenes using generic function
      NPCTalk.any('morthos', 'polly',
        "*steps between Polly and the player* Enough. Your grief blinds you to reason.", 
        ctx
      );
      
      setTimeout(() => {
        NPCTalk.any('polly', 'morthos',
          "*eyes blazing* You protect the one who killed him? You understand nothing!", 
          ctx
        );
      }, 2000);
      
      setTimeout(() => {
        NPCTalk.any('morthos', 'polly',
          "*shadows writhe defensively* I understand loss. But vengeance without purpose serves nothing. *to player* Stay close.", 
          ctx
        );
      }, 4000);
    }
  }

  /**
   * Handle NPCs greeting Mr. Wendell politely
   */
  static triggerWendellGreeting(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const hasWendell = context.npcsInRoom.some(npc => 
      npc.id === 'mr_wendell' || npc.id === 'wendell' || npc.id === 'mrwendell'
    );
    
    if (hasWendell) {
      const ctx: ConversationContext = { state, dispatch, roomId };
      const otherNpcs = context.npcsInRoom.filter(npc => 
        npc.id !== 'mr_wendell' && npc.id !== 'wendell' && npc.id !== 'mrwendell'
      );
      
      // NPCs greet Wendell very politely
      otherNpcs.forEach((npc, index) => {
        setTimeout(() => {
          switch (npc.id) {
            case 'al':
              NPCTalk.any('al', 'mr_wendell',
                "*immediately adjusts posture* Good day, Mr. Wendell. *checks documentation nervously* All protocols are in order, sir.", 
                ctx
              );
              break;
            case 'morthos':
              NPCTalk.any('morthos', 'mr_wendell',
                "*shadows retreat respectfully* Mr. Wendell. *bows slightly* An honor as always.", 
                ctx
              );
              break;
            case 'ayla':
              NPCTalk.any('ayla', 'mr_wendell',
                "*respectful nod* Mr. Wendell. Your presence brings... clarity to our discussions.", 
                ctx
              );
              break;
            default:
              NPCTalk.any(npc.id, 'mr_wendell',
                `*respectfully* Good to see you, Mr. Wendell.`, 
                ctx
              );
          }
        }, index * 1500);
      });
    }
  }

  /**
   * Trigger NPC arguments and discussions
   */
  static triggerNPCArguments(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    const npcs = context.npcsInRoom.map(npc => npc.id);
    
    // Al vs Morthos philosophical arguments
    if (npcs.includes('al') && npcs.includes('morthos') && !state.flags?.allianceChosen) {
      setTimeout(() => {
        NPCTalk.morthosAndAl.alStarts(
          "*adjusts spectacles* Your methodology lacks proper documentation. How can we ensure reproducible results?", 
          ctx
        );
      }, 3000);
      
      setTimeout(() => {
        NPCTalk.morthosAndAl.morthosStarts(
          "*mechanical chuckle* Results? *gestures broadly* Look around! Sometimes you need to embrace the chaos to find truth.", 
          ctx
        );
      }, 5000);
      
      setTimeout(() => {
        NPCTalk.morthosAndAl.alStarts(
          "*firmly* Chaos leads to system failures. Order provides stability. *to player* Surely you see the value in proper procedures?", 
          ctx
        );
      }, 7000);
    }
    
    // Polly vs Everyone arguments
    if (npcs.includes('polly') && npcs.length > 1) {
      setTimeout(() => {
        const target = npcs.find(id => id !== 'polly') || 'al';
        NPCTalk.any('polly', target,
          "*dramatically* Oh, how CONVENIENT that you all just happen to agree on everything! Where were your opinions when Dominic needed defending?", 
          ctx
        );
      }, 6000);
    }
  }

  /**
   * Handle Ayla randomly joining conversations
   */
  static maybeAylaIntervention(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const hasAyla = context.npcsInRoom.some(npc => npc.id === 'ayla');
    
    // 30% chance Ayla appears if not already present
    if (!hasAyla && Math.random() < 0.3) {
      const ctx: ConversationContext = { state, dispatch, roomId };
      
      // Add Ayla to the room
      dispatch({
        type: 'SET_NPCS_IN_ROOM',
        payload: [...context.npcsInRoom, {
          id: 'ayla',
          name: 'Ayla',
          portrait: '/images/Ayla.png',
          location: roomId,
          mood: 'helpful',
          memory: {
            interactions: 0,
            lastInteraction: Date.now(),
            playerActions: [],
            relationship: 50,
            knownFacts: []
          }
        }]
      });
      
      // Ayla makes an entrance
      setTimeout(() => {
        NPCTalk.any('ayla', 'group',
          "*appears from the fabric of reality itself* Interesting dynamics here. May I observe?", 
          ctx
        );
      }, 2000);
    }
  }

  /**
   * Handle NPCs asking player to be quiet during discussions
   */
  static triggerNPCDiscussion(context: GroupChatContext, playerMessage?: string): void {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    
    // If player interrupts during important discussions
    if (playerMessage && state.flags?.npcDiscussionActive) {
      const speaker = context.npcsInRoom[Math.floor(Math.random() * context.npcsInRoom.length)];
      
      setTimeout(() => {
        NPCTalk.any(speaker.id, 'player',
          "*holds up hand politely* One moment please - we need to discuss something important first.", 
          ctx
        );
      }, 1000);
      
      return;
    }
    
    // Start important game-related discussion
    if (Math.random() < 0.2 && context.npcsInRoom.length >= 2) {
      dispatch({ type: 'SET_FLAG', payload: { flag: 'npcDiscussionActive', value: true } });
      
      const discussionTopics = [
        {
          starter: 'al',
          message: "*checks documentation* We need to discuss the anomalous readings from the lattice sector.",
          follow: 'morthos',
          response: "*nods seriously* The dimensional fluctuations are increasing. Player, please give us a moment."
        },
        {
          starter: 'ayla',
          message: "*observes reality threads* The convergence patterns are shifting. This requires careful consideration.",
          follow: 'al',
          response: "*immediately alert* Convergence shift? *to player* Please hold all questions - this is critical."
        },
        {
          starter: 'morthos',
          message: "*shadows coil with concern* Something's wrong with the underlying infrastructure.",
          follow: 'ayla',
          response: "*threads of reality shimmer* Yes, I sense it too. *to player* We need to focus on this briefly."
        }
      ];
      
      const topic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
      
      // Start discussion
      setTimeout(() => {
        NPCTalk.any(topic.starter, 'group', topic.message, ctx);
      }, 1000);
      
      setTimeout(() => {
        NPCTalk.any(topic.follow, topic.starter, topic.response, ctx);
      }, 3000);
      
      // End discussion after time
      setTimeout(() => {
        dispatch({ type: 'SET_FLAG', payload: { flag: 'npcDiscussionActive', value: false } });
        NPCTalk.any(topic.follow, 'player',
          "*turns back to you* Thank you for your patience. Now, what did you need?", 
          ctx
        );
      }, 8000);
    }
  }

  /**
   * Main group chat orchestrator
   */
  static orchestrateGroupChat(context: GroupChatContext, playerMessage?: string): void {
    const { state, dispatch } = context;
    const currentZone = state.roomMap?.[state.currentRoomId]?.zone || '';
    
    // Check for zone-specific forced group chat
    if (this.shouldForceGroupChat(context.roomId, currentZone)) {
      dispatch({ type: 'SET_FLAG', payload: { flag: 'forceGroupChat', value: true } });
    }
    
    // Handle specific behaviors
    this.triggerMorthosProtection(context);
    this.triggerWendellGreeting(context);
    this.maybeAylaIntervention(context);
    
    // Handle player interruptions or start discussions
    this.triggerNPCDiscussion(context, playerMessage);
    
    // Trigger arguments if conditions are right
    if (!state.flags?.npcDiscussionActive && Math.random() < 0.15) {
      this.triggerNPCArguments(context);
    }
  }
}

// Export individual functions for compatibility
export const {
  shouldForceGroupChat,
  triggerMorthosProtection,
  triggerWendellGreeting,
  triggerNPCArguments,
  maybeAylaIntervention,
  triggerNPCDiscussion,
  orchestrateGroupChat
} = GroupChatManager;
