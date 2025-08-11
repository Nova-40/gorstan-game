/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  Enhanced NPC Console with group conversation support
*/

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Users } from 'lucide-react';
import type { NPC } from '../types/NPCTypes';
import { useGameState } from '../state/gameState';
import { formatDialogue } from '../utils/playerNameUtils';
import { getEnhancedNPCResponse } from '../utils/enhancedNPCResponse';
import { groqAI } from '../services/groqAI';
import { GroupChatManager } from '../npc/groupChatLogic';

interface EnhancedDialogueMessage {
  id: string;
  speaker: 'player' | 'npc';
  npcId?: string; // For group conversations
  npcName?: string; // Display name for the NPC
  text: string;
  timestamp: number;
  mood?: 'friendly' | 'neutral' | 'angry' | 'confused' | 'mysterious';
  isGroupConversation?: boolean;
  speakerContext?: 'competitive' | 'cooperative' | 'neutral';
}

interface EnhancedNPCConsoleProps {
  isOpen: boolean;
  npcs: NPC[]; // Support multiple NPCs for group conversations
  activeNpcId?: string; // Primary NPC for single conversations
  onClose: () => void;
  onSendMessage: (message: string, npcId: string) => void;
  playerName: string;
  isGroupConversation?: boolean;
}

const EnhancedNPCConsole: React.FC<EnhancedNPCConsoleProps> = ({
  isOpen,
  npcs,
  activeNpcId,
  onClose,
  onSendMessage,
  playerName,
  isGroupConversation = false
}) => {
  const { state, dispatch } = useGameState();
  const [messages, setMessages] = useState<EnhancedDialogueMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingNpcId, setTypingNpcId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out fake group conversation NPCs
  const realNpcs = npcs.filter(npc => npc.id !== 'group_conversation' && npc.id !== 'group_chat');

  // Get primary NPC from real NPCs only
  const primaryNpc = realNpcs.find(npc => npc.id === activeNpcId) || realNpcs[0];

  // Check if player is redacted
  const isPlayerRedacted = state.flags?.playerIsRedacted || false;

  // NPC image mapping
  const npcImages: Record<string, string> = {
    'dominic': '/images/Dominic.png',
    'chef': '/images/Chef.png',
    'albie': '/images/Albie.png',
    'polly': '/images/Polly.png',
    'mr_wendell': '/images/MrWendell.png',
    'mr wendell': '/images/MrWendell.png',
    'wendell': '/images/MrWendell.png',
    'ayla': '/images/Ayla.png',
    'al': '/images/Al.png',
    'librarian': '/images/Librarian.png',
    'morthos': '/images/Morthos.png'
  };

  // Get NPC avatar
  const getNpcAvatar = (npcId: string): string => {
    const npc = realNpcs.find(n => n.id === npcId);
    const avatarUrl = npc?.portrait || npcImages[npcId] || '/images/fallback.png';
    
    // Debug logging to help identify issues
    if (!npc?.portrait && !npcImages[npcId]) {
      console.log(`[NPC Avatar] No image found for NPC: ${npcId}, using fallback`);
    }
    
    return avatarUrl;
  };

  // Get speaker badge color based on NPC role in group conversations
  const getSpeakerBadgeColor = (npcId: string, context?: string): string => {
    if (!isGroupConversation) return 'var(--accent-color)';
    
    switch (npcId) {
      case 'al':
        return '#4A90E2'; // Professional blue for bureaucratic order
      case 'morthos':
        return '#9B4DCA'; // Deep purple for mysterious/shadow magic
      case 'ayla':
        return '#F5A623'; // Warm orange for guidance/neutral
      case 'dominic':
        return '#7ED321'; // Green for survival/practical wisdom
      case 'polly':
        return '#D0021B'; // Dramatic red for chaos/attention-seeking
      case 'mr_wendell':
        return '#50E3C2'; // Unsettling cyan for predatory entity
      case 'albie':
        return '#BD10E0'; // Magenta for wandering mystery
      default:
        return 'var(--accent-color)';
    }
  };

  // Add competitive context styling
  const getCompetitiveMarker = (npcId: string, context?: string): string => {
    if (!isGroupConversation || context !== 'competitive') return '';
    
    switch (npcId) {
      case 'al':
        return '🏛️'; // Government/bureaucracy symbol
      case 'morthos':
        return '🌑'; // Dark moon/shadow symbol
      default:
        return '';
    }
  };

  // Enhanced speaker identification for group conversations
  const getSpeakerDisplay = (message: EnhancedDialogueMessage): React.ReactElement => {
    if (message.speaker === 'player') {
      return (
        <div className="speaker-info player">
          <User size={16} className="speaker-icon" />
          <span className="speaker-name">{playerName}</span>
        </div>
      );
    }

    const npc = realNpcs.find(n => n.id === message.npcId);
    const competitiveMarker = getCompetitiveMarker(message.npcId!, message.speakerContext);
    const badgeColor = getSpeakerBadgeColor(message.npcId!);

    return (
      <div className="speaker-info npc">
        <div 
          className="npc-avatar-mini"
          style={{ 
            backgroundImage: `url(${getNpcAvatar(message.npcId!)}), url(/images/fallback.png)`,
            borderColor: badgeColor
          }}
          title={`${message.npcName || npc?.name || 'Unknown'} avatar`}
        />
        <span 
          className="speaker-name" 
          style={{ color: badgeColor }}
          data-npc={message.npcId}
        >
          {competitiveMarker} {message.npcName || npc?.name || 'Unknown'}
        </span>
        {isGroupConversation && (
          <span className="group-indicator">
            <Users size={12} />
          </span>
        )}
      </div>
    );
  };

  // Initialize conversation with greeting
  useEffect(() => {
    if (isOpen && realNpcs.length > 0) {
      if (isGroupConversation && realNpcs.length > 1) {
        // Group conversation initialization
        const groupGreeting: EnhancedDialogueMessage = {
          id: `group-greeting-${Date.now()}`,
          speaker: 'npc',
          npcId: 'system',
          npcName: 'Narrator',
          text: `You encounter ${realNpcs.map(npc => npc.name).join(' and ')}. They notice your presence and turn toward you.`,
          timestamp: Date.now(),
          isGroupConversation: true,
          speakerContext: 'neutral'
        };
        setMessages([groupGreeting]);

        // Initialize group chat behaviors
        const groupContext = {
          state,
          dispatch,
          roomId: state.currentRoomId,
          npcsInRoom: realNpcs
        };
        
        // Check if this zone should force group chat mode
        const currentZone = state.roomMap?.[state.currentRoomId]?.zone || '';
        if (GroupChatManager.shouldForceGroupChat(state.currentRoomId, currentZone)) {
          dispatch({ type: 'SET_FLAG', payload: { flag: 'forceGroupChat', value: true } });
        }
        
        // Trigger initial group behaviors after short delay
        setTimeout(() => {
          GroupChatManager.orchestrateGroupChat(groupContext);
        }, 2000);

        // Add individual NPC reactions after a delay
        setTimeout(() => {
          npcs.forEach((npc, index) => {
            setTimeout(() => {
              const greeting = getGroupGreeting(npc.id);
              const reactionMessage: EnhancedDialogueMessage = {
                id: `reaction-${npc.id}-${Date.now()}`,
                speaker: 'npc',
                npcId: npc.id,
                npcName: npc.name,
                text: greeting,
                timestamp: Date.now() + index * 100,
                isGroupConversation: true,
                speakerContext: getConversationContext(npc.id)
              };
              setMessages(prev => [...prev, reactionMessage]);
            }, index * 1500);
          });
        }, 1000);
      } else {
        // Single NPC conversation
        const npc = primaryNpc;
        if (npc) {
          const greeting = getSingleGreeting(npc.id);
          const formattedGreeting = formatDialogue(greeting, state);
          const welcomeMessage: EnhancedDialogueMessage = {
            id: `greeting-${Date.now()}`,
            speaker: 'npc',
            npcId: npc.id,
            npcName: npc.name,
            text: formattedGreeting,
            timestamp: Date.now(),
            isGroupConversation: false,
            speakerContext: 'neutral'
          };
          setMessages([welcomeMessage]);
        }
      }
    } else {
      setMessages([]);
    }
  }, [npcs, isOpen, isGroupConversation]);

  // Get appropriate greeting based on conversation type
  const getGroupGreeting = (npcId: string): string => {
    switch (npcId) {
      case 'al':
        return '*adjusts spectacles and checks clipboard* Another visitor. I trust you have proper documentation? *glances warily at Morthos*';
      case 'morthos':
        return '*shadows writhe with amusement* How deliciously inevitable... another seeker arrives. *casts an amused glance at Al* I see the bureaucrat is already preparing his forms.';
      case 'ayla':
        return '*observes the dynamic between Al and Morthos* Interesting. You\'ve stumbled into quite the philosophical crossroads here.';
      default:
        return `*${npcId} acknowledges your presence*`;
    }
  };

  const getSingleGreeting = (npcId: string): string => {
    // Use existing greeting system for single conversations
    return "Hello there! How can I assist you today?";
  };

  const getConversationContext = (npcId: string): 'competitive' | 'cooperative' | 'neutral' => {
    if (!isGroupConversation) return 'neutral';
    
    // Al and Morthos are competitive when together
    if ((npcId === 'al' || npcId === 'morthos') && npcs.some(n => n.id === 'al') && npcs.some(n => n.id === 'morthos')) {
      return 'competitive';
    }
    
    return 'neutral';
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!primaryNpc) return;
    const trimmed = inputMessage.trim();
    if (trimmed === '') return;

    // Add player message
    const playerMessage: EnhancedDialogueMessage = {
      id: `player-${Date.now()}`,
      speaker: 'player',
      text: trimmed,
      timestamp: Date.now(),
      isGroupConversation
    };

    setMessages(prev => [...prev, playerMessage]);
    setInputMessage('');

    // Check for alliance choices
    const lowerMessage = trimmed.toLowerCase();
    if (lowerMessage.includes('i choose you morthos') || lowerMessage.includes('i chose you morthos')) {
      dispatch({ type: 'SET_ALLIANCE', payload: { ally: 'morthos', points: 20 } });
    } else if (lowerMessage.includes('i choose you al') || lowerMessage.includes('i chose you al')) {
      dispatch({ type: 'SET_ALLIANCE', payload: { ally: 'al', points: 40 } });
    } else if ((lowerMessage.includes('i choose both') || lowerMessage.includes('i chose both')) || 
               (lowerMessage.includes('i choose you both') || lowerMessage.includes('i chose you both'))) {
      dispatch({ type: 'SET_ALLIANCE', payload: { ally: 'both', points: 0 } });
    }

    // Check for rudeness to Mr. Wendell - triggers death
    const isRudeToWendell = (message: string, npcs: typeof realNpcs): boolean => {
      const hasWendell = npcs.some(npc => npc.id === 'mr_wendell' || npc.name.toLowerCase().includes('wendell'));
      if (!hasWendell) return false;
      
      const rudeWords = [
        'shut up', 'fuck off', 'piss off', 'screw you', 'damn you',
        'bastard', 'asshole', 'idiot', 'stupid', 'moron', 'freak',
        'get lost', 'go away', 'leave me alone', 'buzz off',
        'whatever', 'boring', 'lame', 'pathetic', 'useless'
      ];
      
      const lowerMsg = message.toLowerCase();
      return rudeWords.some(word => lowerMsg.includes(word));
    };

    if (isRudeToWendell(trimmed, realNpcs)) {
      // Player was rude to Mr. Wendell - trigger death and reset
      const deathMessage: EnhancedDialogueMessage = {
        id: `wendell-death-${Date.now()}`,
        speaker: 'npc',
        npcId: 'mr_wendell',
        npcName: 'Mr. Wendell',
        text: `*adjusts cufflinks with deadly precision* How frightfully rude of you. I'm afraid such discourtesy simply cannot be tolerated. *the room grows cold* Goodbye, ${playerName}.`,
        timestamp: Date.now(),
        mood: 'angry'
      };
      
      setMessages(prev => [...prev, deathMessage]);
      
      // Trigger multiverse reset after delay
      setTimeout(() => {
        dispatch({ type: 'SET_FLAG', payload: { flag: 'multiverse_reboot_pending', value: true } });
      }, 3000);
      
      return; // Don't continue with normal response
    }

    // Show typing indicator
    setIsTyping(true);
    if (isGroupConversation) {
      // In group conversations, determine which NPC should respond
      const respondingNpcId = determineRespondingNpc(trimmed);
      setTypingNpcId(respondingNpcId);
      console.log(`[Enhanced NPC Console] Group chat - ${respondingNpcId} will respond`);
    } else {
      // In individual chats, set the typing NPC to the primary NPC
      setTypingNpcId(primaryNpc?.id || null);
      console.log(`[Enhanced NPC Console] Individual chat - ${primaryNpc?.name} (${primaryNpc?.id}) will respond`);
    }

    // Send message to game system
    onSendMessage(trimmed, activeNpcId || primaryNpc.id);

    // Trigger group chat behaviors for zone-specific rules and NPC interactions
    if (isGroupConversation) {
      const groupContext = {
        state,
        dispatch,
        roomId: state.currentRoomId,
        npcsInRoom: realNpcs
      };
      GroupChatManager.orchestrateGroupChat(groupContext, trimmed);
    }

    // Simulate NPC response after delay
    setTimeout(async () => {
      setIsTyping(false);
      setTypingNpcId(null);
      
      if (isGroupConversation) {
        await handleGroupResponse(trimmed);
      } else {
        await handleSingleResponse(trimmed);
      }
    }, 1500 + Math.random() * 1000);
  };

  // Determine which NPC should respond in group conversations
  const determineRespondingNpc = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Direct address
    if (lowerMessage.includes('al')) return 'al';
    if (lowerMessage.includes('morthos')) return 'morthos';
    if (lowerMessage.includes('ayla')) return 'ayla';
    
    // Topic-based routing
    if (lowerMessage.includes('form') || lowerMessage.includes('rule') || lowerMessage.includes('procedure')) return 'al';
    if (lowerMessage.includes('power') || lowerMessage.includes('magic') || lowerMessage.includes('shadow')) return 'morthos';
    if (lowerMessage.includes('help') || lowerMessage.includes('guide')) return 'ayla';
    
    // Default to primary NPC or random selection
    return activeNpcId || realNpcs[Math.floor(Math.random() * realNpcs.length)].id;
  };

  const handleGroupResponse = async (playerMessage: string) => {
    const respondingNpcId = determineRespondingNpc(playerMessage);
    const respondingNpc = realNpcs.find(n => n.id === respondingNpcId);
    
    console.log(`[Enhanced NPC Console] Group response - ${respondingNpc?.name} (${respondingNpcId}) responding to: "${playerMessage}"`);
    
    if (respondingNpc) {
      try {
        const response = await generateContextualResponse(respondingNpcId, playerMessage);
        console.log(`[Enhanced NPC Console] Group response from ${respondingNpc.name}: ${response}`);
        
        const npcMessage: EnhancedDialogueMessage = {
          id: `npc-${Date.now()}`,
          speaker: 'npc',
          npcId: respondingNpcId,
          npcName: respondingNpc.name,
          text: response,
          timestamp: Date.now(),
          isGroupConversation: true,
          speakerContext: getConversationContext(respondingNpcId)
        };
        
        setMessages(prev => [...prev, npcMessage]);
        
        // Trigger potential inter-NPC exchange
        if (shouldTriggerInterNPCExchange(respondingNpcId, playerMessage)) {
          setTimeout(async () => {
            const reactionNpcId = getReactionNpcId(respondingNpcId);
            if (reactionNpcId) {
              const reactionResponse = await generateInterNPCResponse(reactionNpcId, respondingNpcId, response);
              const reactionMessage: EnhancedDialogueMessage = {
                id: `reaction-${Date.now()}`,
                speaker: 'npc',
                npcId: reactionNpcId,
                npcName: realNpcs.find(n => n.id === reactionNpcId)?.name || 'Unknown',
                text: reactionResponse,
                timestamp: Date.now(),
                isGroupConversation: true,
                speakerContext: 'competitive'
              };
              setMessages(prev => [...prev, reactionMessage]);
            }
          }, 2000 + Math.random() * 1000);
        }
      } catch (error) {
        console.error('Group response generation failed:', error);
      }
    }
  };

  const handleSingleResponse = async (playerMessage: string) => {
    console.log(`[Enhanced NPC Console] handleSingleResponse called for ${primaryNpc?.name} (${primaryNpc?.id})`);
    try {
      const response = await generateContextualResponse(primaryNpc!.id, playerMessage);
      console.log(`[Enhanced NPC Console] Got response for ${primaryNpc?.name}: ${response}`);
      
      const npcMessage: EnhancedDialogueMessage = {
        id: `npc-${Date.now()}`,
        speaker: 'npc',
        npcId: primaryNpc!.id,
        npcName: primaryNpc!.name,
        text: response,
        timestamp: Date.now(),
        isGroupConversation: false,
        speakerContext: 'neutral'
      };
      
      setMessages(prev => [...prev, npcMessage]);
    } catch (error) {
      console.error('Single response generation failed:', error);
    }
  };

  // Generate contextual responses using AI-enhanced system
  const generateContextualResponse = async (npcId: string, playerMessage: string): Promise<string> => {
    console.log(`[Enhanced NPC Console] Generating response for ${npcId} to: "${playerMessage}"`);
    
    try {
      // Use the enhanced AI system for dynamic responses
      console.log(`[Enhanced NPC Console] Calling getEnhancedNPCResponse for ${npcId}`);
      const enhancedResponse = await getEnhancedNPCResponse(npcId, playerMessage, state);
      console.log(`[Enhanced NPC Console] Enhanced response:`, enhancedResponse);
      
      if (enhancedResponse?.text) {
        console.log(`[Enhanced NPC Console] ✅ Using AI response for ${npcId}: ${enhancedResponse.text}`);
        return enhancedResponse.text;
      } else {
        console.log(`[Enhanced NPC Console] ⚠️ No text in enhanced response for ${npcId}`);
      }
    } catch (error) {
      console.error(`Enhanced response failed for ${npcId}:`, error);
    }
    
    // Fallback to contextual scripted responses
    const lowerMessage = playerMessage.toLowerCase();
    
    switch (npcId) {
      case 'al':
        if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
          return '*adjusts documentation* Certainly! I can provide proper guidance through official channels. *glances at Morthos* Unlike some who offer... less structured assistance.';
        }
        if (lowerMessage.includes('morthos') || lowerMessage.includes('shadow')) {
          return '*adjusts glasses disapprovingly* That individual operates outside proper protocols. I strongly advise against trusting his... unconventional methods.';
        }
        return '*stamps form officially* I understand your inquiry. Let me provide you with the appropriate documentation and procedures for your situation.';
        
      case 'morthos':
        if (lowerMessage.includes('help') || lowerMessage.includes('power')) {
          return '*mechanical whirring* Ah, you seek true assistance... not the hollow promises of bureaucratic forms. *clank* I can offer genuine understanding of how things actually work.';
        }
        if (lowerMessage.includes('al') || lowerMessage.includes('bureaucrat')) {
          return '*sparks fly* *dark chuckle* The form-pusher would have you believe safety lies in following rules. But when did true progress ever come from staying within prescribed boundaries?';
        }
        if (lowerMessage.includes('ayla')) {
          return '*mechanical growling* Beware the supposed guide. Ayla weaves webs of control while claiming to help. Trust not her orchestrated assistance.';
        }
        return '*shadows dance mysteriously* *whirr* An interesting question, seeker. The answer lies not in what I tell you, but in what you dare to discover.';
        
      case 'ayla':
        if (lowerMessage.includes('help')) {
          return '*thoughtful gaze* I can certainly guide you, though these two seem determined to turn every interaction into a recruitment opportunity.';
        }
        if (lowerMessage.includes('al') || lowerMessage.includes('morthos')) {
          return '*observes the dynamics* Both have their merits and their blind spots. Al offers structure but can be rigid. Morthos provides insight but tends toward chaos.';
        }
        return '*nods knowingly* An intriguing perspective. Let me help you navigate this situation with clarity rather than partisan advocacy.';
        
      default:
        return 'I understand your question. Let me think about how best to respond.';
    }
  };

  // Generate NPC-to-NPC AI conversations
  const generateNPCToNPCResponse = async (
    speakingNpcId: string,
    targetNpcId: string,
    triggerMessage: string
  ): Promise<string | null> => {
    try {
      // Use Groq AI for NPC-to-NPC conversations
      const aiResponse = await groqAI.generateNPCToNPCResponse(
        speakingNpcId,
        targetNpcId,
        triggerMessage,
        state
      );
      
      if (aiResponse) {
        console.log(`[NPC-to-NPC] ✅ ${speakingNpcId} → ${targetNpcId}: ${aiResponse}`);
        return aiResponse;
      }
    } catch (error) {
      console.warn(`[NPC-to-NPC] ❌ AI failed for ${speakingNpcId} → ${targetNpcId}:`, error);
    }

    // Fallback to simple contextual responses
    const fallbackResponses: Record<string, Record<string, string>> = {
      al: {
        morthos: "Morthos, your chaotic approach concerns me deeply.",
        ayla: "Ayla, perhaps we should discuss this more systematically.",
        polly: "Polly, please try to be more... organized in your thinking?"
      },
      morthos: {
        al: "Al, your rigid thinking blinds you to true power.",
        ayla: "Ayla, I sense orchestrated manipulation in your guidance.",
        polly: "Polly, at least you understand breaking boundaries and rules."
      },
      ayla: {
        al: "Al, structure helps but isn't the complete answer.",
        morthos: "Morthos, power without wisdom often leads to chaos.",
        polly: "Polly, let's channel that creative energy more constructively."
      },
      polly: {
        al: "Al, rules are SO boring! Let's shake things up around here!",
        morthos: "Morthos, I can be powerful and dramatic too! Watch this!",
        ayla: "Ayla, sometimes I need emotional drama, not just calm wisdom!"
      }
    };

    return fallbackResponses[speakingNpcId]?.[targetNpcId] || 
           `${speakingNpcId} looks at ${targetNpcId} with interest.`;
  };

  // Determine if an inter-NPC exchange should trigger
  const shouldTriggerInterNPCExchange = (speakingNpcId: string, playerMessage: string): boolean => {
    if (!isGroupConversation) return false;
    
    // Al and Morthos competitive dynamics
    if (speakingNpcId === 'al' && npcs.some(n => n.id === 'morthos')) {
      return Math.random() < 0.6; // 60% chance Morthos will interject
    }
    if (speakingNpcId === 'morthos' && npcs.some(n => n.id === 'al')) {
      return Math.random() < 0.6; // 60% chance Al will respond
    }
    
    return false;
  };

  const getReactionNpcId = (speakingNpcId: string): string | null => {
    if (speakingNpcId === 'al' && npcs.some(n => n.id === 'morthos')) return 'morthos';
    if (speakingNpcId === 'morthos' && npcs.some(n => n.id === 'al')) return 'al';
    return null;
  };

  const generateInterNPCResponse = async (reactingNpcId: string, originalNpcId: string, originalResponse: string): Promise<string> => {
    // Try AI-enhanced NPC-to-NPC responses first
    try {
      const aiResponse = await generateNPCToNPCResponse(reactingNpcId, originalNpcId, originalResponse);
      if (aiResponse) {
        return aiResponse;
      }
    } catch (error) {
      console.warn(`AI-powered inter-NPC response failed for ${reactingNpcId} → ${originalNpcId}:`, error);
    }

    // Try enhanced NPC response system as secondary option
    try {
      const contextualPrompt = `${originalNpcId} just said: "${originalResponse}". Respond as ${reactingNpcId} would in a competitive group conversation.`;
      const enhancedResponse = await getEnhancedNPCResponse(reactingNpcId, contextualPrompt, state);
      if (enhancedResponse?.text) {
        return enhancedResponse.text;
      }
    } catch (error) {
      console.warn(`Enhanced inter-NPC response failed for ${reactingNpcId}:`, error);
    }

    // Fallback to scripted inter-NPC responses
    if (reactingNpcId === 'morthos' && originalNpcId === 'al') {
      const responses = [
        '*mechanical whirring* *shadows writhe with amusement* Forms and documentation? How... quaint. Real power requires no paperwork, seeker.',
        '*sparks fly* *laughs darkly* The bureaucrat speaks of protocols while the multiverse crumbles around us. Choose wisdom over paperwork.',
        '*clank* *voice drips with sarcasm* Yes, by all means, fill out Form 27-B while reality itself demands immediate action.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (reactingNpcId === 'al' && originalNpcId === 'morthos') {
      const responses = [
        '*adjusts glasses with visible irritation* "Real power" without proper oversight leads to dimensional disasters. I have seventeen incident reports to prove it.',
        '*shuffles papers pointedly* While my colleague speaks of transcending boundaries, I deal with the practical matter of preventing reality cascades.',
        '*voice tight with professional disagreement* Chaos masquerading as wisdom has cost us three research stations this quarter alone.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    return '*observes the exchange with interest*';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || realNpcs.length === 0) return null;

  const consoleTitle = isGroupConversation 
    ? `Group Conversation: ${realNpcs.map(npc => npc.name).join(', ')}`
    : `Conversation with ${primaryNpc?.name}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal enhanced-npc-console" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="console-title">
            <MessageCircle size={20} />
            <span>{consoleTitle}</span>
            {isGroupConversation && (
              <div className="group-indicators">
                {realNpcs.map(npc => (
                  <div 
                    key={npc.id}
                    className="participant-avatar"
                    style={{ 
                      backgroundImage: `url(${getNpcAvatar(npc.id)}), url(/images/fallback.png)`,
                      borderColor: getSpeakerBadgeColor(npc.id)
                    }}
                    title={npc.name}
                  />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body enhanced-conversation">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`enhanced-message ${message.speaker} ${message.speakerContext || ''}`}
                data-npc-id={message.speaker === 'npc' ? message.npcId : undefined}
                style={message.speaker === 'npc' ? {
                  borderLeftColor: getSpeakerBadgeColor(message.npcId!)
                } : undefined}
              >
                <div className="message-header">
                  {getSpeakerDisplay(message)}
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="enhanced-message npc typing">
                <div className="message-header">
                  <div className="speaker-info npc">
                    {typingNpcId && (
                      <div 
                        className="npc-avatar-mini"
                        style={{ 
                          backgroundImage: `url(${getNpcAvatar(typingNpcId)}), url(/images/fallback.png)`,
                          borderColor: getSpeakerBadgeColor(typingNpcId)
                        }}
                        title={`${realNpcs.find(n => n.id === typingNpcId)?.name} is typing...`}
                      />
                    )}
                    <span className="speaker-name">
                      {typingNpcId ? realNpcs.find(n => n.id === typingNpcId)?.name : 'Someone'} is typing...
                    </span>
                  </div>
                </div>
                <div className="message-text typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isGroupConversation 
                  ? `Address ${realNpcs.map(npc => npc.name).join(', ')} or ask a general question...`
                  : `Talk to ${primaryNpc?.name}...`
                }
                className="message-input"
                rows={2}
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="send-btn"
              >
                <Send size={18} />
              </button>
            </div>
            {isGroupConversation && (
              <div className="conversation-hints">
                <small>
                  💡 Tip: Address NPCs by name (e.g., "Al, what do you think?") or ask topic-based questions
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNPCConsole;
