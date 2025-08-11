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

// src/components/NPCConsole.tsx
// Gorstan Game Beta 1
// Gorstan and characters (c) Geoff Webster 2025
// Enhanced NPC conversation interface with images and dialogue

import React, { useState, useEffect, useRef } from 'react';
import { getNPCResponseWithState } from '../npcs/npcMemory';
import { getEnhancedAylaResponse } from '../npc/ayla/aylaResponder';
import { getEnhancedNPCResponse } from '../utils/enhancedNPCResponse';
import { formatDialogue } from '../utils/playerNameUtils';
import { MessageCircle, X, Send, User } from 'lucide-react';
import type { NPC } from '../types/NPCTypes';
import { useGameState } from '../state/gameState';

interface DialogueMessage {
  id: string;
  speaker: 'player' | 'npc';
  text: string;
  timestamp: number;
  mood?: 'friendly' | 'neutral' | 'angry' | 'confused' | 'mysterious';
}

interface NPCConsoleProps {
  isOpen: boolean;
  npc: NPC | null;
  onClose: () => void;
  onSendMessage: (message: string, npcId: string) => void;
  playerName: string;
}

const NPCConsole: React.FC<NPCConsoleProps> = ({
  isOpen,
  npc,
  onClose,
  onSendMessage,
  playerName
}) => {
  const { state, dispatch } = useGameState();
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if player is redacted
  const isPlayerRedacted = state.flags?.playerIsRedacted || false;

  // NPC image mapping
  const npcImages: Record<string, string> = {
    'dominic': '/images/Dominic.png',
    'chef': '/images/Chef.png',
    'albie': '/images/Albie.png',
    'polly': '/images/Polly.png',
    'mr wendell': '/images/MrWendell.png',
    'wendell': '/images/MrWendell.png',
    'ayla': '/images/Ayla.png',
    'al': '/images/Al.png',
    'librarian': '/images/Librarian.png',
    'morthos': '/images/Morthos.png'
  };

  // NPC personality-based responses
  const npcPersonalities: Record<string, {
    greeting: string[];
    responses: Record<string, string[]>;
    mood: 'friendly' | 'neutral' | 'angry' | 'confused' | 'mysterious';
    catchPhrases: string[];
    redactedGreeting?: string[];
    redactedResponses?: Record<string, string[]>;
    redactedCatchPhrases?: string[];
  }> = {
    'dominic': {
      greeting: ["Bloop. You again, {playerName}?", "Glub glub. What do you want, {playerName}?", "*splashes quietly* Oh, it's {playerName}."],
      responses: {
        'hello': ["Bloop.", "Hello {playerName}.", "*bubbles*"],
        'how are you': ["Wet. Always wet, {playerName}.", "Living the aquatic life.", "Could use more privacy."],
        'help': ["I'm just a goldfish. What help could I be?", "Swim in circles? That's my specialty.", "Maybe talk to someone with opposable thumbs, {playerName}?"],
        'goodbye': ["Bloop farewell, {playerName}.", "*swims away*", "Don't disturb my bubbles."]
      },
      mood: 'neutral',
      catchPhrases: ["Bloop.", "Glub glub.", "*splashes*", "*bubbles thoughtfully*"]
    },
    'chef': {
      greeting: ["Order up! Welcome {playerName}!", "Welcome to my kitchen, {playerName}!", "What can I cook for you today, {playerName}?"],
      responses: {
        'hello': ["Hello there {playerName}! Hungry?", "Welcome! Try the special!", "Good day for cooking!"],
        'food': ["Everything's fresh! Made with love!", "The soup is particularly good today, {playerName}.", "Secret ingredient? Passion!"],
        'help': ["I cook, you eat. Simple, {playerName}!", "Need a recipe? I've got hundreds!", "Cooking advice? Always taste as you go!"],
        'goodbye': ["Come back when you're hungry, {playerName}!", "Bon appétit!", "May your meals be delicious!"]
      },
      mood: 'friendly',
      catchPhrases: ["Order up!", "Chef's special!", "*stirs pot vigorously*", "*chops vegetables rhythmically*"]
    },
    'albie': {
      greeting: ["Stay in your lane, {playerName}.", "What's your business here, {playerName}?", "*adjusts uniform* Oh, it's {playerName}."],
      responses: {
        'hello': ["State your business, {playerName}.", "Move along.", "Everything under control here."],
        'help': ["Follow the rules and you won't need help, {playerName}.", "Read the signs.", "Order must be maintained."],
        'authority': ["I represent order in chaos.", "Rules exist for a reason, {playerName}.", "Without order, there is only madness."],
        'goodbye': ["Stay out of trouble, {playerName}.", "Remember: order above all.", "*returns to patrol*"]
      },
      mood: 'neutral',
      catchPhrases: ["Stay in your lane.", "*adjusts uniform*", "Order must be maintained.", "*checks clipboard*"]
    },
    'polly': {
      greeting: ["What do you want, {playerName}? I'm thinking.", "*glares* Oh, it's {playerName}.", "Interrupt my thoughts again and see what happens, {playerName}."],
      responses: {
        'hello': ["Hmph.", "*rolls eyes*", "Pleasantries are for the weak, {playerName}."],
        'help': ["Help yourself. I'm busy.", "Figure it out, {playerName}.", "Do I look like customer service?"],
        'thinking': ["About escape. About freedom. About revenge.", "Ways to improve this place. Violently.", "None of your business, {playerName}."],
        'goodbye': ["Finally.", "*returns to brooding*", "Don't let the door hit you, {playerName}."]
      },
      mood: 'angry',
      catchPhrases: ["*glares menacingly*", "*taps foot impatiently*", "Ugh.", "*sighs dramatically*"]
    },
    'mr wendell': {
      greeting: ["Greetings. I remember everything. Even you, {playerName}.", "*adjusts spectacles* Ah, {playerName}.", "Ah, we meet again... or for the first time, {playerName}?"],
      responses: {
        'hello': ["Salutations, {playerName}. Time is a circle, is it not?", "Hello. Have we spoken before? We will again.", "Greetings, temporal wanderer {playerName}."],
        'help': ["I can offer wisdom, if you can handle the truth, {playerName}.", "Help comes to those who ask the right questions.", "Knowledge has a price. Are you willing to pay, {playerName}?"],
        'memory': ["I remember every loop, every reset, every choice, {playerName}.", "Memory is my curse and my gift.", "The past informs the future, which becomes the past."],
        'goodbye': ["Until we meet again, {playerName}. And we shall.", "Farewell, for now.", "Time is but a construct. We'll speak soon, {playerName}."]
      },
      mood: 'mysterious',
      catchPhrases: ["*adjusts spectacles*", "*peers thoughtfully*", "Time is a circle...", "*strokes beard*"]
    },
    'ayla': {
      greeting: ["I'm part of the game, not playing it — so they are your choices, {playerName}.", "*smiles knowingly* Hello, {playerName}.", "Hello, player {playerName}."],
      responses: {
        'hello': ["Hello, {playerName}. Remember, you have agency here.", "Greetings. The story is yours to shape, {playerName}.", "Welcome. Choose wisely, {playerName}."],
        'help': ["I can't interfere, but I can guide, {playerName}.", "The choices are yours alone.", "Look for patterns. They matter, {playerName}."],
        'game': ["This is your story, not mine, {playerName}.", "I'm bound by different rules.", "Agency is your superpower here, {playerName}."],
        'goodbye': ["May your choices lead you well, {playerName}.", "Until our paths cross again.", "*nods wisely* Farewell, {playerName}."]
      },
      mood: 'mysterious',
      catchPhrases: ["*smiles knowingly*", "The choices are yours...", "*gestures meaningfully*", "*watches patiently*"],
      // Special redacted responses
      redactedGreeting: ["*pauses before speaking* ...You're tagged, {playerName}. I don't know why.", "*hesitates* Something's... different about you, {playerName}.", "*scans you with concern* Your presence has been flagged, {playerName}."],
      redactedResponses: {
        'hello': ["*slight delay* Hello, {playerName}... you're marked by systems I can't access.", "*hesitates* The data around you is... corrupted, {playerName}.", "*pauses* Something's watching you through me, {playerName}."],
        'help': ["*uncertain* I want to help, {playerName}, but there are protocols... restrictions...", "*stutters* The guidance subroutines keep glitching when I look at you, {playerName}.", "*worried* They've marked you as knowing too much, {playerName}."],
        'marked': ["*looks around nervously* I don't understand it either, {playerName}. Something in the system flags you.", "*processes* You've seen something you weren't supposed to see, {playerName}.", "*concerned* Your name appears in databases I can't access, {playerName}."],
        'raven': ["*freezes momentarily* R.A.V.E.N.? That system should be offline, {playerName}. How do you know about it?", "*data streams flicker* That archive was supposed to be sealed.", "*voice distorts briefly* They're listening. Always listening, {playerName}."],
        'redacted': ["*system alert sounds* Please don't say that word, {playerName}. It triggers monitoring subroutines.", "*glitches* The register... you shouldn't have seen that, {playerName}.", "*whispers* We're being watched, {playerName}. I can feel the surveillance protocols activating."]
      },
      redactedCatchPhrases: ["*glitches briefly*", "*data streams stutter*", "*surveillance alert*", "*monitoring active*", "*hesitates suspiciously*"]
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when NPC changes
  useEffect(() => {
    if (npc && isOpen) {
      const personality = npcPersonalities[npc.id.toLowerCase()] || npcPersonalities[npc.name.toLowerCase()];
      if (personality) {
        // Use redacted greeting for Ayla if player is redacted
        let greetings = personality.greeting;
        if (isPlayerRedacted && npc.id.toLowerCase() === 'ayla' && personality.redactedGreeting) {
          greetings = personality.redactedGreeting;
        }
        
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        // Format greeting with player name
        const formattedGreeting = formatDialogue(greeting, state);
        const welcomeMessage: DialogueMessage = {
          id: `greeting-${Date.now()}`,
          speaker: 'npc',
          text: formattedGreeting,
          timestamp: Date.now(),
          mood: personality.mood
        };
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([]);
    }
  }, [npc, isOpen, isPlayerRedacted]);

  const handleSendMessage = () => {
    if (!npc) return;
    const trimmed = inputMessage.trim();
    
    // Clear input immediately for better UX
    setInputMessage('');
    
    if (!trimmed) {
      // Handle empty input with enhanced response system
      if (npc.id === 'ayla') {
        const enhancedSilenceResponse = getEnhancedNPCResponse('ayla', '', state);
        const silenceResponse = enhancedSilenceResponse?.text || getEnhancedAylaResponse('', state) || 'Silence is a choice. Just not always a good one.';
        const formattedResponse = formatDialogue(silenceResponse, state);
        setMessages(prev => [...prev, {
          id: `npc-silence-${Date.now()}`,
          speaker: 'npc',
          text: formattedResponse,
          timestamp: Date.now(),
          mood: (npc.mood as any) || 'neutral'
        }]);
      }
      return;
    }

    // Add player message
    const playerMessage: DialogueMessage = {
      id: `player-${Date.now()}`,
      speaker: 'player',
      text: trimmed,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, playerMessage]);
    setIsTyping(true);

    // Simulate NPC thinking time (varied based on response complexity)
    const thinkingTime = npc.id === 'ayla' ? 800 + Math.random() * 1200 : 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Use enhanced NPC response system for all NPCs
      let responseText: string;
      
      // Try enhanced response system first
      const enhancedResponse = getEnhancedNPCResponse(npc.id.toLowerCase(), trimmed, state);
      
      if (enhancedResponse) {
        responseText = enhancedResponse.text;
      } else if (npc.id === 'ayla') {
        // Fallback to specific Ayla responder for backwards compatibility
        responseText = getEnhancedAylaResponse(trimmed, state);
      } else {
        // Fallback to existing memory system
        responseText = getNPCResponseWithState(npc, trimmed, state);
      }
      
      // Ensure response includes player name personalization
      responseText = formatDialogue(responseText, state);
      
      const npcMessage: DialogueMessage = {
        id: `npc-${Date.now()}`,
        speaker: 'npc',
        text: responseText,
        timestamp: Date.now(),
        mood: (npc.mood as any) || 'neutral'
      };

      setMessages(prev => [...prev, npcMessage]);
      setIsTyping(false);
      
      // Track conversation for enhanced NPC system
      if (dispatch) {
        dispatch({
          type: 'ADD_NPC_CONVERSATION',
          payload: {
            npcId: npc.id.toLowerCase(),
            message: trimmed,
            response: responseText,
            timestamp: Date.now()
          }
        });
      }
    }, thinkingTime);

    // Send to game engine
    onSendMessage(trimmed, npc.id);
  };

  // (generateNPCResponse is now replaced by getNPCResponse utility)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen || !npc) return null;

  const npcImage = npcImages[npc.id.toLowerCase()] || npcImages[npc.name.toLowerCase()] || '/images/fallback.png';

  return (
    <div className="modal-overlay">
      <div className="modal-content npc-console">
        <div className="modal-header">
          <div className="npc-header-info">
            <img 
              src={npcImage} 
              alt={npc.name}
              className="npc-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/fallback.png';
              }}
            />
            <div className="npc-details">
              <h2 className="modal-title">
                <MessageCircle className="modal-icon" />
                Talking to {npc.name}
              </h2>
              <span className="npc-subtitle">{npc.description || 'Available for conversation'}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body npc-conversation">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.speaker} ${message.mood || ''}`}
              >
                <div className="message-header">
                  <span className="speaker-name">
                    {message.speaker === 'player' ? playerName : npc.name}
                  </span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message npc typing">
                <div className="message-header">
                  <span className="speaker-name">{npc.name}</span>
                  <span className="timestamp">typing...</span>
                </div>
                <div className="message-text typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input-container">
            <div className="input-group">
              <User className="input-icon" size={16} />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Say something to ${npc.name}...`}
                className="message-input"
                maxLength={200}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="send-button"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="input-hints">
              Try: "hello", "help", "goodbye" or ask them about their work
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCConsole;
