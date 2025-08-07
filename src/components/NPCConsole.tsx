// src/components/NPCConsole.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Enhanced NPC conversation interface with images and dialogue

import React, { useState, useEffect, useRef } from 'react';
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
  const { state } = useGameState();
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
      greeting: ["Bloop. You again?", "Glub glub. What do you want?", "*splashes quietly*"],
      responses: {
        'hello': ["Bloop.", "Hello human.", "*bubbles*"],
        'how are you': ["Wet. Always wet.", "Living the aquatic life.", "Could use more privacy."],
        'help': ["I'm just a goldfish. What help could I be?", "Swim in circles? That's my specialty.", "Maybe talk to someone with opposable thumbs?"],
        'goodbye': ["Bloop farewell.", "*swims away*", "Don't disturb my bubbles."]
      },
      mood: 'neutral',
      catchPhrases: ["Bloop.", "Glub glub.", "*splashes*", "*bubbles thoughtfully*"]
    },
    'chef': {
      greeting: ["Order up!", "Welcome to my kitchen!", "What can I cook for you today?"],
      responses: {
        'hello': ["Hello there! Hungry?", "Welcome! Try the special!", "Good day for cooking!"],
        'food': ["Everything's fresh! Made with love!", "The soup is particularly good today.", "Secret ingredient? Passion!"],
        'help': ["I cook, you eat. Simple!", "Need a recipe? I've got hundreds!", "Cooking advice? Always taste as you go!"],
        'goodbye': ["Come back when you're hungry!", "Bon appétit!", "May your meals be delicious!"]
      },
      mood: 'friendly',
      catchPhrases: ["Order up!", "Chef's special!", "*stirs pot vigorously*", "*chops vegetables rhythmically*"]
    },
    'albie': {
      greeting: ["Stay in your lane, citizen.", "What's your business here?", "*adjusts uniform*"],
      responses: {
        'hello': ["State your business.", "Move along.", "Everything under control here."],
        'help': ["Follow the rules and you won't need help.", "Read the signs.", "Order must be maintained."],
        'authority': ["I represent order in chaos.", "Rules exist for a reason.", "Without order, there is only madness."],
        'goodbye': ["Stay out of trouble.", "Remember: order above all.", "*returns to patrol*"]
      },
      mood: 'neutral',
      catchPhrases: ["Stay in your lane.", "*adjusts uniform*", "Order must be maintained.", "*checks clipboard*"]
    },
    'polly': {
      greeting: ["What do you want? I'm thinking.", "*glares*", "Interrupt my thoughts again and see what happens."],
      responses: {
        'hello': ["Hmph.", "*rolls eyes*", "Pleasantries are for the weak."],
        'help': ["Help yourself. I'm busy.", "Figure it out.", "Do I look like customer service?"],
        'thinking': ["About escape. About freedom. About revenge.", "Ways to improve this place. Violently.", "None of your business."],
        'goodbye': ["Finally.", "*returns to brooding*", "Don't let the door hit you."]
      },
      mood: 'angry',
      catchPhrases: ["*glares menacingly*", "*taps foot impatiently*", "Ugh.", "*sighs dramatically*"]
    },
    'mr wendell': {
      greeting: ["Greetings. I remember everything. Even you.", "*adjusts spectacles*", "Ah, we meet again... or for the first time?"],
      responses: {
        'hello': ["Salutations. Time is a circle, is it not?", "Hello. Have we spoken before? We will again.", "Greetings, temporal wanderer."],
        'help': ["I can offer wisdom, if you can handle the truth.", "Help comes to those who ask the right questions.", "Knowledge has a price. Are you willing to pay?"],
        'memory': ["I remember every loop, every reset, every choice.", "Memory is my curse and my gift.", "The past informs the future, which becomes the past."],
        'goodbye': ["Until we meet again. And we shall.", "Farewell, for now.", "Time is but a construct. We'll speak soon."]
      },
      mood: 'mysterious',
      catchPhrases: ["*adjusts spectacles*", "*peers thoughtfully*", "Time is a circle...", "*strokes beard*"]
    },
    'ayla': {
      greeting: ["I'm part of the game, not playing it — so they are your choices.", "*smiles knowingly*", "Hello, player."],
      responses: {
        'hello': ["Hello. Remember, you have agency here.", "Greetings. The story is yours to shape.", "Welcome. Choose wisely."],
        'help': ["I can't interfere, but I can guide.", "The choices are yours alone.", "Look for patterns. They matter."],
        'game': ["This is your story, not mine.", "I'm bound by different rules.", "Agency is your superpower here."],
        'goodbye': ["May your choices lead you well.", "Until our paths cross again.", "*nods wisely*"]
      },
      mood: 'mysterious',
      catchPhrases: ["*smiles knowingly*", "The choices are yours...", "*gestures meaningfully*", "*watches patiently*"],
      // Special redacted responses
      redactedGreeting: ["*pauses before speaking* ...You're tagged. I don't know why.", "*hesitates* Something's... different about you.", "*scans you with concern* Your presence has been flagged."],
      redactedResponses: {
        'hello': ["*slight delay* Hello... you're marked by systems I can't access.", "*hesitates* The data around you is... corrupted.", "*pauses* Something's watching you through me."],
        'help': ["*uncertain* I want to help, but there are protocols... restrictions...", "*stutters* The guidance subroutines keep glitching when I look at you.", "*worried* They've marked you as knowing too much."],
        'marked': ["*looks around nervously* I don't understand it either. Something in the system flags you.", "*processes* You've seen something you weren't supposed to see.", "*concerned* Your name appears in databases I can't access."],
        'raven': ["*freezes momentarily* R.A.V.E.N.? That system should be offline. How do you know about it?", "*data streams flicker* That archive was supposed to be sealed.", "*voice distorts briefly* They're listening. Always listening."],
        'redacted': ["*system alert sounds* Please don't say that word. It triggers monitoring subroutines.", "*glitches* The register... you shouldn't have seen that.", "*whispers* We're being watched. I can feel the surveillance protocols activating."]
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
        const welcomeMessage: DialogueMessage = {
          id: `greeting-${Date.now()}`,
          speaker: 'npc',
          text: greeting,
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
    if (!inputMessage.trim() || !npc) return;

    // Add player message
    const playerMessage: DialogueMessage = {
      id: `player-${Date.now()}`,
      speaker: 'player',
      text: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, playerMessage]);
    setIsTyping(true);

    // Simulate NPC thinking time
    setTimeout(() => {
      const response = generateNPCResponse(inputMessage, npc);
      const npcMessage: DialogueMessage = {
        id: `npc-${Date.now()}`,
        speaker: 'npc',
        text: response.text,
        timestamp: Date.now(),
        mood: response.mood
      };

      setMessages(prev => [...prev, npcMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);

    // Send to game engine
    onSendMessage(inputMessage, npc.id);
    setInputMessage('');
  };

  const generateNPCResponse = (playerInput: string, npc: NPC): { text: string; mood: 'friendly' | 'neutral' | 'angry' | 'confused' | 'mysterious' } => {
    const personality = npcPersonalities[npc.id.toLowerCase()] || npcPersonalities[npc.name.toLowerCase()];
    
    if (!personality) {
      return { text: "...", mood: 'neutral' };
    }

    const input = playerInput.toLowerCase();
    
    // Use redacted responses for Ayla if player is redacted
    const responses = (isPlayerRedacted && npc.id.toLowerCase() === 'ayla' && personality.redactedResponses) 
      ? { ...personality.responses, ...personality.redactedResponses }
      : personality.responses;
    
    const catchPhrases = (isPlayerRedacted && npc.id.toLowerCase() === 'ayla' && personality.redactedCatchPhrases)
      ? personality.redactedCatchPhrases
      : personality.catchPhrases;
    
    // Check for specific response patterns
    for (const [key, responseArray] of Object.entries(responses)) {
      if (input.includes(key)) {
        const response = responseArray[Math.floor(Math.random() * responseArray.length)];
        return { text: response, mood: personality.mood };
      }
    }

    // Fallback to catch phrases
    const catchPhrase = catchPhrases[Math.floor(Math.random() * catchPhrases.length)];
    return { text: catchPhrase, mood: personality.mood };
  };

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
