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
    
    // Special case: Al vs Morthos alliance pitch in control room
    if (npcs.includes('al') && npcs.includes('morthos') && 
        (roomId === 'controlroom' || roomId === 'controlnexus') && 
        !state.flags?.allianceChosen) {
      
      this.triggerAlliancePitch(context);
      return;
    }
    
    // Al vs Morthos philosophical arguments (general)
    if (npcs.includes('al') && npcs.includes('morthos') && state.flags?.allianceChosen) {
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
   * Handle Al and Morthos alliance pitch in control room
   */
  static triggerAlliancePitch(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    
    // Flag to prevent multiple alliance pitches
    if (state.flags?.alliancePitchStarted) return;
    
    dispatch({ type: 'SET_FLAG', payload: { flag: 'alliancePitchStarted', value: true } });
    
    // Morthos starts with his pitch
    setTimeout(() => {
      NPCTalk.any('morthos', 'player',
        "*mechanical smile* Ah, perfect timing! *gestures warmly* I've been hoping to speak with you privately. " +
        "*leans in conspiratorially* I've been around... well, forever really, and I've learned a thing or two. " +
        "I'd like to offer you my assistance - my protection, my guidance through the challenges ahead.", 
        ctx
      );
    }, 2000);
    
    setTimeout(() => {
      NPCTalk.any('morthos', 'player',
        "*confident grin* There'll be a small cost, which we can discuss later, but I'll do what it takes to help you. " +
        "Think of me as your personal guardian - I can get you out of tight spots, give you advice on what to take, what to avoid... " +
        "*voice drops to a whisper* Trust me, you'll need someone like me in this place.", 
        ctx
      );
    }, 8000);
    
    // Al interrupts with suspicion
    setTimeout(() => {
      NPCTalk.any('al', 'morthos',
        "*adjusts spectacles suspiciously* 'Small cost'? *to player* ${state.player.name}, I feel compelled to share some song lyrics that seem... relevant.", 
        ctx
      );
    }, 14000);
    
    setTimeout(() => {
      NPCTalk.any('al', 'player',
        "*clears throat* 'Nothing's free, nothing's free, there's always a price to pay... " +
        "When devils make deals, they always get their way...' *smiles knowingly* Ahh, see? He isn't trustworthy. " +
        "Side with me, ${state.player.name} - I can at least promise to try my best at no cost to you.", 
        ctx
      );
    }, 20000);
    
    // Morthos deflects about the cost
    setTimeout(() => {
      NPCTalk.any('morthos', 'al',
        "*waves dismissively* Oh Al, always so paranoid! *to player* Don't listen to his doom and gloom. " +
        "The cost is... well, it's really quite reasonable. Nothing to worry about right now! " +
        "*changes subject quickly* What matters is that I can offer real power, real protection!", 
        ctx
      );
    }, 26000);
    
    // Give player choice after the pitch
    setTimeout(() => {
      this.presentAllianceChoice(context);
    }, 32000);
  }

  /**
   * Present alliance choice to player with interaction buttons
   */
  static presentAllianceChoice(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    
    // Add interactive choice message
    dispatch({
      type: 'ADD_HISTORY',
      payload: {
        id: `alliance-choice-${Date.now()}`,
        text: "🤝 **Choose Your Ally**\n\n" +
              "Morthos offers power and protection for a 'small cost' (details unclear)\n" +
              "Al promises to try his best with no cost to you\n\n" +
              "Type 'ally morthos' or 'ally al' to make your choice, or 'ally neither' to remain neutral.",
        type: 'system',
        timestamp: Date.now(),
        isChoicePrompt: true
      }
    });
    
    // Set flag to enable alliance choice processing
    dispatch({ type: 'SET_FLAG', payload: { flag: 'awaitingAllianceChoice', value: true } });
  }

  /**
   * Process player's alliance choice
   */
  static processAllianceChoice(choice: string, context: GroupChatContext): boolean {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    
    if (!state.flags?.awaitingAllianceChoice) return false;
    
    const lowerChoice = choice.toLowerCase();
    
    if (lowerChoice.includes('ally morthos') || lowerChoice.includes('choose morthos')) {
      // Player chooses Morthos
      dispatch({ type: 'SET_FLAG', payload: { flag: 'playerAlliance', value: 'morthos' } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'allianceChosen', value: true } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'awaitingAllianceChoice', value: false } });
      
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*eyes gleam with satisfaction* Excellent choice! *mechanical purr* You've aligned yourself with true power. " +
          "I promise you won't regret this... *dark smile* Welcome to the winning side.", 
          ctx
        );
      }, 1000);
      
      setTimeout(() => {
        NPCTalk.any('al', 'player',
          "*shakes head sadly* I... I understand your choice, ${state.player.name}. *adjusts spectacles nervously* " +
          "I just hope you know what you're getting yourself into. If you ever need help... *trails off*", 
          ctx
        );
      }, 5000);
      
      return true;
      
    } else if (lowerChoice.includes('ally al') || lowerChoice.includes('choose al')) {
      // Player chooses Al
      dispatch({ type: 'SET_FLAG', payload: { flag: 'playerAlliance', value: 'al' } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'allianceChosen', value: true } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'awaitingAllianceChoice', value: false } });
      
      setTimeout(() => {
        NPCTalk.any('al', 'player',
          "*beams with relief* Thank you, ${state.player.name}! *adjusts spectacles proudly* " +
          "I promise to do everything in my power to help you succeed. Together, we'll maintain order and find the truth!", 
          ctx
        );
      }, 1000);
      
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*shrugs with mechanical indifference* Your choice. *darker tone* Just remember - when the going gets tough, " +
          "you'll wish you had chosen... differently. *shadows coil* Al can't protect you like I could have.", 
          ctx
        );
      }, 5000);
      
      return true;
      
    } else if (lowerChoice.includes('ally neither') || lowerChoice.includes('stay neutral') || lowerChoice.includes('no alliance')) {
      // Player remains neutral
      dispatch({ type: 'SET_FLAG', payload: { flag: 'playerAlliance', value: 'neutral' } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'allianceChosen', value: true } });
      dispatch({ type: 'SET_FLAG', payload: { flag: 'awaitingAllianceChoice', value: false } });
      
      setTimeout(() => {
        NPCTalk.any('al', 'player',
          "*nods respectfully* I understand your caution, ${state.player.name}. *adjusts spectacles* " +
          "Sometimes the wisest choice is to remain independent. I'll still try to help when I can.", 
          ctx
        );
      }, 1000);
      
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*mechanical chuckle* Interesting... going it alone, eh? *grins darkly* " +
          "Well, that's certainly... brave of you. Just remember my offer stands if you change your mind.", 
          ctx
        );
      }, 5000);
      
      return true;
    }
    
    return false;
  }

  /**
   * Handle follow-up questions about Morthos's cost
   */
  static handleMorthosCostInquiry(context: GroupChatContext): void {
    const { state, dispatch, roomId } = context;
    const ctx: ConversationContext = { state, dispatch, roomId };
    
    // Track how many times player has asked about the cost
    const costInquiries = (state.flags?.morthosCostInquiries || 0) + 1;
    dispatch({ type: 'SET_FLAG', payload: { flag: 'morthosCostInquiries', value: costInquiries } });
    
    if (costInquiries === 1) {
      // First evasion
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*waves hand dismissively* Oh, the cost? *mechanical chuckle* Let's not worry about mundane details right now! " +
          "What's important is the protection I can offer. *quickly changes subject* Have you seen the threats lurking in this place?", 
          ctx
        );
      }, 1000);
      
    } else if (costInquiries === 2) {
      // Second evasion
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*slight mechanical stutter* The c-cost? *nervous laugh* Really, it's nothing significant! " +
          "*gestures broadly* Look around - focus on survival first! We can discuss... paperwork... later. " +
          "*tries to distract* Did I mention I can help you avoid the maze entirely?", 
          ctx
        );
      }, 1000);
      
    } else if (costInquiries >= 3) {
      // Final revelation
      setTimeout(() => {
        NPCTalk.any('morthos', 'player',
          "*mechanical sigh* You're... persistent. *shadows coil around him* Fine. *darker tone* " +
          "The small cost is... I'll take 50% of your life force and all your points, but at a time of my choosing. " +
          "*quickly defensive* But think of what you gain! Protection! Guidance! Power!", 
          ctx
        );
      }, 1000);
      
      setTimeout(() => {
        NPCTalk.any('al', 'morthos',
          "*horrified* Fifty percent of their LIFE FORCE?! *to player* ${state.player.name}, now you see what I meant! " +
          "*adjusts spectacles frantically* This is exactly why you can't trust him!", 
          ctx
        );
      }, 4000);
      
      setTimeout(() => {
        NPCTalk.any('morthos', 'al',
          "*defensive* It's a fair trade! Power has a price! *to player* At least I'm honest about it... eventually. " +
          "*mechanical grin* Besides, 50% of something is better than 100% of nothing when you're dead in the maze.", 
          ctx
        );
      }, 8000);
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
  triggerAlliancePitch,
  presentAllianceChoice,
  processAllianceChoice,
  handleMorthosCostInquiry,
  maybeAylaIntervention,
  triggerNPCDiscussion,
  orchestrateGroupChat
} = GroupChatManager;
