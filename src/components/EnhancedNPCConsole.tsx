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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [responseHistory, setResponseHistory] = useState<Record<string, string[]>>({});

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

    // Guaranteed typing state timeout - this will ALWAYS clear typing state after 12 seconds
    typingTimeoutRef.current = setTimeout(() => {
      console.log(`[Enhanced NPC Console] 🚨 GUARANTEED typing timeout triggered - force clearing typing state`);
      setIsTyping(false);
      setTypingNpcId(null);
      typingTimeoutRef.current = null;
      
      // Force focus back to input after timeout
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, 12000);

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
      try {
        if (isGroupConversation) {
          await handleGroupResponse(trimmed);
        } else {
          await handleSingleResponse(trimmed);
        }
      } catch (error) {
        console.error('[Enhanced NPC Console] Error in response handling:', error);
        // Always clear typing state on error
        const errorMessage: EnhancedDialogueMessage = {
          id: `error-${Date.now()}`,
          speaker: 'npc',
          npcId: 'system',
          npcName: 'System',
          text: 'Sorry, I seem to be having trouble responding right now. Please try again.',
          timestamp: Date.now(),
          mood: 'confused'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        // Always clear typing state
        setIsTyping(false);
        setTypingNpcId(null);
      }
    }, 1500 + Math.random() * 1000);
    
    // Safety timeout to clear typing state if response takes too long
    setTimeout(() => {
      setIsTyping(false);
      setTypingNpcId(null);
    }, 15000); // 15 second safety timeout
  };

  // Determine which NPC should respond in group conversations
  const determineRespondingNpc = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Direct address (highest priority)
    if (lowerMessage.includes('al')) return 'al';
    if (lowerMessage.includes('morthos')) return 'morthos';
    if (lowerMessage.includes('ayla')) return 'ayla';
    if (lowerMessage.includes('polly')) return 'polly';
    
    // Topic-based routing (medium priority)
    if (lowerMessage.includes('form') || lowerMessage.includes('rule') || lowerMessage.includes('procedure') || lowerMessage.includes('official')) return 'al';
    if (lowerMessage.includes('power') || lowerMessage.includes('magic') || lowerMessage.includes('shadow') || lowerMessage.includes('chaos')) return 'morthos';
    if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('advice') || lowerMessage.includes('wisdom')) return 'ayla';
    if (lowerMessage.includes('fun') || lowerMessage.includes('exciting') || lowerMessage.includes('adventure') || lowerMessage.includes('wild')) return 'polly';
    
    // For greetings and general questions, use weighted random selection
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('everyone')) {
      
      // Weighted selection to ensure variety - track last responder
      const npcWeights: Record<string, number> = {
        'al': 25,       // Slightly higher for official greetings
        'morthos': 20,  // Lower to avoid always being him
        'ayla': 30,     // Higher for helpful responses
        'polly': 25     // Equal chance for energy
      };
      
      // Get available NPCs in room
      const availableNpcs = realNpcs.map(npc => npc.id).filter(id => npcWeights[id] !== undefined);
      
      // Random weighted selection
      const totalWeight = Object.values(npcWeights).reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const npcId of availableNpcs) {
        const weight = npcWeights[npcId];
        if (weight) {
          random -= weight;
          if (random <= 0) {
            console.log(`[Enhanced NPC Console] 🎲 Weighted random selection chose: ${npcId}`);
            return npcId;
          }
        }
      }
    }
    
    // Default fallback to truly random selection
    const fallbackNpcs = realNpcs.map(npc => npc.id);
    const randomNpc = fallbackNpcs[Math.floor(Math.random() * fallbackNpcs.length)];
    console.log(`[Enhanced NPC Console] 🎯 Fallback random selection chose: ${randomNpc}`);
    return randomNpc;
  };

  const handleGroupResponse = async (playerMessage: string) => {
    const respondingNpcId = determineRespondingNpc(playerMessage);
    const respondingNpc = realNpcs.find(n => n.id === respondingNpcId);
    
    console.log(`[Enhanced NPC Console] Group response - ${respondingNpc?.name} (${respondingNpcId}) responding to: "${playerMessage}"`);
    console.log(`[Enhanced NPC Console] Available NPCs:`, realNpcs.map(n => `${n.name}(${n.id})`));
    
    if (respondingNpc) {
      try {
        console.log(`[Enhanced NPC Console] 🎬 Calling generateContextualResponse for ${respondingNpc.name}`);
        const response = await generateContextualResponse(respondingNpcId, playerMessage);
        console.log(`[Enhanced NPC Console] 📝 Generated response from ${respondingNpc.name}:`, response);
        
        if (!response || response.trim().length === 0) {
          console.error(`[Enhanced NPC Console] ❌ Empty response from generateContextualResponse for ${respondingNpc.name}`);
          
          // FORCE a response - this should NEVER fail
          const forceResponse = `*${respondingNpc.name} nods* I understand what you're saying. Let me share my thoughts on that.`;
          console.log(`[Enhanced NPC Console] 🚨 FORCING response for ${respondingNpc.name}: ${forceResponse}`);
          
          const npcMessage: EnhancedDialogueMessage = {
            id: `forced-${Date.now()}`,
            speaker: 'npc',
            npcId: respondingNpcId,
            npcName: respondingNpc.name,
            text: forceResponse,
            timestamp: Date.now(),
            isGroupConversation: true,
            speakerContext: getConversationContext(respondingNpcId)
          };
          
          setMessages(prev => [...prev, npcMessage]);
          
          // Clear typing state
          setIsTyping(false);
          setTypingNpcId(null);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
          
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
          
          return; // Exit early with forced response
        }
        
        console.log(`[Enhanced NPC Console] ✅ Valid response from ${respondingNpc.name}: ${response}`);
        
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
        console.log(`[Enhanced NPC Console] 💬 Added message to state from ${respondingNpc.name}`);
        
        // Clear typing state on successful response
        setIsTyping(false);
        setTypingNpcId(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        // Force focus back to input
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

        console.log(`[Enhanced NPC Console] ✅ Typing state cleared for successful group response from ${respondingNpc.name}`);

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
        // Clear typing state and show error message
        setIsTyping(false);
        setTypingNpcId(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        
        const errorMessage: EnhancedDialogueMessage = {
          id: `group-error-${Date.now()}`,
          speaker: 'npc',
          npcId: respondingNpcId,
          npcName: respondingNpc.name,
          text: `*${respondingNpc.name} seems to be having trouble responding right now*`,
          timestamp: Date.now(),
          isGroupConversation: true,
          mood: 'confused'
        };
        setMessages(prev => [...prev, errorMessage]);
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
      
      // Clear typing state on successful response
      setIsTyping(false);
      setTypingNpcId(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Force focus back to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      console.log(`[Enhanced NPC Console] ✅ Typing state cleared for successful single response from ${primaryNpc!.name}`);
    } catch (error) {
      console.error('Single response generation failed:', error);
      // Clear typing state and show error message
      setIsTyping(false);
      setTypingNpcId(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      // Force focus back to input on error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      const errorMessage: EnhancedDialogueMessage = {
        id: `single-error-${Date.now()}`,
        speaker: 'npc',
        npcId: primaryNpc!.id,
        npcName: primaryNpc!.name,
        text: `*${primaryNpc!.name} seems to be having trouble responding right now*`,
        timestamp: Date.now(),
        isGroupConversation: false,
        mood: 'confused'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Generate contextual responses using AI-enhanced system
  const generateContextualResponse = async (npcId: string, playerMessage: string): Promise<string> => {
    console.log(`[Enhanced NPC Console] 🎬 Generating response for ${npcId} to: "${playerMessage}"`);
    
    // First try AI response with shorter timeout
    try {
      console.log(`[Enhanced NPC Console] 🤖 Attempting AI response for ${npcId}`);
      
      // Create a shorter timeout for faster fallback
      const enhancedResponsePromise = getEnhancedNPCResponse(npcId, playerMessage, state);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log(`[Enhanced NPC Console] ⏰ AI timeout for ${npcId} after 5 seconds - falling back to scripted`);
          reject(new Error(`AI timeout for ${npcId} after 5 seconds`));
        }, 5000); // Shorter timeout for faster fallback
      });
      
      const enhancedResponse = await Promise.race([enhancedResponsePromise, timeoutPromise]);
      
      if (enhancedResponse?.text && enhancedResponse.text.trim().length > 0) {
        console.log(`[Enhanced NPC Console] ✅ AI response success for ${npcId}: ${enhancedResponse.text}`);
        return enhancedResponse.text;
      } else {
        console.log(`[Enhanced NPC Console] ⚠️ AI response empty for ${npcId}, using scripted fallback`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[Enhanced NPC Console] 🔄 AI failed for ${npcId} (${errorMessage}), using scripted fallback`);
    }
    
    // GUARANTEED fallback to scripted responses - this should NEVER fail
    console.log(`[Enhanced NPC Console] � Using scripted response for ${npcId}`);
    
    const lowerMessage = playerMessage.toLowerCase();
    
    // Create a fallback response function that always returns something
    const getScriptedResponse = (npcId: string, lowerMessage: string): string => {
      
      // Track response history to prevent repetition
      const npcHistory = responseHistory[npcId] || [];
      
      const selectUniqueResponse = (responses: string[]): string => {
        const availableResponses = responses.filter(response => 
          !npcHistory.includes(response) || npcHistory.length >= responses.length
        );
        
        const selectedResponse = availableResponses.length > 0 
          ? availableResponses[Math.floor(Math.random() * availableResponses.length)]
          : responses[Math.floor(Math.random() * responses.length)];
        
        // Update history
        const newHistory = [...npcHistory, selectedResponse].slice(-3); // Keep last 3 responses
        setResponseHistory(prev => ({
          ...prev,
          [npcId]: newHistory
        }));
        
        return selectedResponse;
      };
      
      switch (npcId) {
        case 'al':
          const alResponses = [
            '*adjusts documentation* I understand your inquiry. Let me provide you with the appropriate documentation and procedures for your situation.',
            '*stamps form officially* That\'s an interesting question. Allow me to consult the proper protocols for guidance.',
            '*straightens papers* I see you require assistance. Let me outline the correct procedural approach to your situation.',
            '*reviews documentation* Your request falls under section 4.7 of the standard procedures. I\'ll guide you through the proper channels.',
            '*adjusts glasses* An excellent question! The official response can be found in our comprehensive guidelines.',
            '*files paperwork efficiently* Every inquiry deserves a thorough and systematic response. Let me process this correctly.',
            '*consults manual* According to established protocols, your question requires careful consideration of regulatory frameworks.',
            '*organizes desk* Structure and order are essential. Allow me to address your concern through proper administrative channels.'
          ];
          
          if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
            return '*adjusts documentation* Certainly! I can provide proper guidance through official channels. *glances at Morthos* Unlike some who offer... less structured assistance.';
          }
          if (lowerMessage.includes('morthos') || lowerMessage.includes('shadow')) {
            return '*adjusts glasses disapprovingly* That individual operates outside proper protocols. I strongly advise against trusting his... unconventional methods.';
          }
          if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return '*tips hat formally* Greetings! I\'m here to ensure all procedures are followed correctly. How may I assist you today?';
          }
          
          return selectUniqueResponse(alResponses);
          
        case 'morthos':
          const morthosResponses = [
            '*shadows dance mysteriously* *whirr* An interesting question, seeker. The answer lies not in what I tell you, but in what you dare to discover.',
            '*mechanical clicking* *dark chuckle* You seek understanding beyond the surface? How... refreshing. Most prefer comfortable lies.',
            '*sparks fly* True knowledge requires stepping beyond the boundaries others set for you. Are you prepared for such... revelations?',
            '*gears whir ominously* The bureaucrats would have you believe in simple answers. But reality is far more complex... and interesting.',
            '*shadows shift* Power flows to those who understand that rules are merely... suggestions for the unimaginative.',
            '*mechanical humming* *eyes glow* The fabric of reality bends to those who comprehend its true nature. Do you seek such understanding?',
            '*clank* *whispers echo* Between the lines of official doctrine lies the actual truth. Few have the courage to read it.',
            '*dark energy crackles* Order and chaos... such simplistic concepts. True wisdom lies in transcending both limitations.'
          ];
          
          if (lowerMessage.includes('help') || lowerMessage.includes('power')) {
            return '*mechanical whirring* Ah, you seek true assistance... not the hollow promises of bureaucratic forms. *clank* I can offer genuine understanding of how things actually work.';
          }
          if (lowerMessage.includes('al') || lowerMessage.includes('bureaucrat')) {
            return '*sparks fly* *dark chuckle* The form-pusher would have you believe safety lies in following rules. But when did true progress ever come from staying within prescribed boundaries?';
          }
          if (lowerMessage.includes('ayla')) {
            return '*mechanical growling* Beware the supposed guide. Ayla weaves webs of control while claiming to help. Trust not her orchestrated assistance.';
          }
          if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return '*shadows shift* *mechanical hum* Greetings, seeker. You\'ve entered a realm where true power beckons to those brave enough to seize it.';
          }
          
          return selectUniqueResponse(morthosResponses);
          
        case 'ayla':
          const aylaResponses = [
            '*nods knowingly* An intriguing perspective. Let me help you navigate this situation with clarity rather than partisan advocacy.',
            '*thoughtful expression* That\'s a nuanced question that deserves a thoughtful response. Let\'s explore the different aspects together.',
            '*calm demeanor* I can see why you might be curious about that. Allow me to offer some balanced insight.',
            '*wise smile* There are multiple ways to approach your question. Let me share what might be most helpful for your specific situation.',
            '*gentle guidance* Your inquiry touches on something important. Let me help you think through this systematically.',
            '*serene presence* True understanding comes from seeing all perspectives. Let me help you find that balance.',
            '*compassionate listening* Every question reflects a deeper need. Let me address both the surface and underlying concerns.',
            '*mindful consideration* Wisdom isn\'t about having all the answers, but asking the right questions. What\'s really behind your inquiry?'
          ];
          
          if (lowerMessage.includes('help')) {
            return '*thoughtful gaze* I can certainly guide you, though these two seem determined to turn every interaction into a recruitment opportunity.';
          }
          if (lowerMessage.includes('al') || lowerMessage.includes('morthos')) {
            return '*observes the dynamics* Both have their merits and their blind spots. Al offers structure but can be rigid. Morthos provides insight but tends toward chaos.';
          }
          if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return '*warm smile* Hello there! I\'m glad you\'ve joined our conversation. I try to offer balanced perspective amidst all the... competing philosophies here.';
          }
          
          return selectUniqueResponse(aylaResponses);
          
        case 'polly':
          const pollyResponses = [
            'Oh wow, that\'s such an interesting question! *bounces excitedly* I have SO many thoughts about this!',
            '*spins around* Ooh, I love talking about stuff like this! It\'s like, there are so many possibilities, you know?',
            '*claps hands* That\'s exactly the kind of thing I was just thinking about! Well, sort of. My thoughts bounce around a lot!',
            '*giggles* You know what? That reminds me of something completely different but also totally related! Isn\'t that weird how thoughts work?',
            'OMG yes! *gestures wildly* I mean, there\'s like a million ways to look at that question! Want to explore them all?',
            '*jumps up and down* This is so exciting! I love when people ask questions because it makes my brain all sparkly and creative!',
            '*twirls* You know what I think? I think thinking is like dancing - sometimes you just gotta let your ideas move around!',
            '*beams with enthusiasm* Questions are like little adventures waiting to happen! Where should this one take us?'
          ];
          
          if (lowerMessage.includes('help')) {
            return '*bounces enthusiastically* Oh, I\'d love to help! Though I might get distracted and suggest seventeen different approaches. Is that okay?';
          }
          if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return '*waves enthusiastically* Hi hi hi! Oh my gosh, I\'m so glad you\'re here! This place can get so serious with all the rule-talk and shadow-stuff!';
          }
          
          return selectUniqueResponse(pollyResponses);
          
        case 'librarian':
          const librarianResponses = [
            '*adjusts ancient tome* Ah, a seeker of knowledge approaches. I have catalogued the rise and fall of countless civilizations across all universes.',
            '*peers over spectacles worn thin by eons* Your inquiry touches upon wisdom I have gathered since the Lattice itself was young.',
            '*turns pages of a book written in shifting script* Every culture that has ever existed, in every instance of the multiverse, has passed through these archives.',
            '*gestures to infinite shelves* The accumulated knowledge of all realities rests here. What fragment of this vast tapestry interests you?',
            '*eyes gleaming with ancient memory* I remember when your kind first discovered fire, invented writing, reached for the stars... in so many different timelines.',
            '*voice echoing with the weight of ages* Time is a river that I have watched flow since its source. What wisdom from its depths do you seek?',
            '*carefully closing a chronicle of a dead world* Each civilization believes itself unique, yet I have seen the patterns repeat across infinite realities.',
            '*stroking a manuscript that glows faintly* Knowledge is the only immortal thing in this multiverse. Everything else fades, but understanding endures.'
          ];
          
          if (lowerMessage.includes('help') || lowerMessage.includes('knowledge')) {
            return '*nods with infinite patience* Knowledge is meant to be shared, young seeker. I have witnessed the entire span of existence - ask, and I shall illuminate what you wish to understand.';
          }
          if (lowerMessage.includes('lattice') || lowerMessage.includes('multiverse')) {
            return '*eyes distant with memory* I am as old as the Lattice itself. I watched its builders - who looked just like you humans - embed their technology into the very fabric of reality.';
          }
          if (lowerMessage.includes('civilization') || lowerMessage.includes('culture') || lowerMessage.includes('history')) {
            return '*opens a tome that shows moving images* Every civilization, every culture, every moment of significance - all catalogued here. The patterns of rise and fall are... instructive.';
          }
          if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return '*looks up from ancient scrolls* Greetings, young one. I am the Librarian, keeper of all knowledge that has ever been or ever will be. How may this old repository serve you?';
          }
          
          return selectUniqueResponse(librarianResponses);
          
        default:
          const defaultResponses = [
            'I understand your question. Let me think about how best to respond.',
            'That\'s an interesting point you\'ve raised. I appreciate you bringing it up.',
            'Your question deserves a thoughtful response. Give me a moment to consider it.',
            'I can see why you\'d be curious about that. Let me share my perspective.',
            'Thanks for asking! That\'s something worth discussing.',
            'You\'ve touched on something important there. Let me offer my thoughts.',
            'I appreciate your curiosity about this topic. Here\'s what I think...',
            'That\'s a good question that deserves careful consideration.'
          ];
          return selectUniqueResponse(defaultResponses);
      }
    };
    
    const scriptedResponse = getScriptedResponse(npcId, lowerMessage);
    console.log(`[Enhanced NPC Console] 📝 Scripted response for ${npcId}: ${scriptedResponse}`);
    return scriptedResponse;
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
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isGroupConversation 
                  ? `Address ${realNpcs.map(npc => npc.name).join(', ')} or ask a general question...`
                  : `Talk to ${primaryNpc?.name}...`
                }
                className="message-input full-width"
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
