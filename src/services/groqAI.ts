/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Groq AI integration for enhanced NPC conversations
*/

import Groq from 'groq-sdk';
import type { LocalGameState } from '../state/gameState';

interface GroqConfig {
  enabled: boolean;
  dailyLimit: number;
  timeout: number;
  currentRequests: number;
  lastReset: string;
}

class GroqAIService {
  private groq: Groq;
  private config: GroqConfig;

  constructor() {
    this.groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY || 'your-groq-api-key-here',
      dangerouslyAllowBrowser: true // Allow in browser for client-side usage
    });
    
    this.config = {
      enabled: true,
      dailyLimit: 14000, // Groq free tier limit
      timeout: 8000, // 8 second timeout
      currentRequests: this.getTodayRequestCount(),
      lastReset: this.getTodayDate()
    };
  }

  async generateNPCResponse(
    npcId: string, 
    playerMessage: string, 
    gameState: LocalGameState
  ): Promise<string | null> {
    // Filter out fake group conversation NPCs
    if (npcId === 'group_conversation' || npcId === 'group_chat') {
      console.log(`[Groq AI] ⚠️ Ignoring fake group NPC: ${npcId}`);
      return null;
    }

    if (!this.canMakeRequest()) {
      console.log(`[Groq AI] Request limit reached or disabled for ${npcId}`);
      return null; // Fall back to scripted responses
    }

    try {
      const npcPersona = this.buildNPCPersona(npcId, gameState);
      const contextualPrompt = this.buildContextualPrompt(npcId, playerMessage, gameState);

      console.log(`[Groq AI] Generating response for ${npcId}...`);

      const chatCompletion = await Promise.race([
        this.groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: npcPersona
            },
            {
              role: "user",
              content: contextualPrompt
            }
          ],
          model: "llama-3.3-70b-versatile", // Fast, high-quality model
          temperature: 0.7,
          max_tokens: 150,
          stream: false
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), this.config.timeout)
        )
      ]) as any;

      this.incrementRequestCount();
      const response = chatCompletion.choices[0]?.message?.content?.trim();
      
      if (response) {
        console.log(`[Groq AI] ✅ ${npcId}: ${response}`);
        return this.postProcessResponse(response, npcId);
      }

      return null;

    } catch (error: any) {
      console.warn(`[Groq AI] ❌ Failed for ${npcId}:`, error?.message || 'Unknown error');
      return null; // Graceful fallback to scripted responses
    }
  }

  private buildNPCPersona(npcId: string, gameState: LocalGameState): string {
    const playerName = gameState.player?.name || 'Player';
    const currentRoom = gameState.roomMap?.[gameState.currentRoomId]?.title || 'unknown location';
    
    // Check alliance status
    const playerAlliance = gameState.flags?.playerAlliance;
    const allianceChosen = gameState.flags?.allianceChosen;
    const myRelationship = gameState.player?.npcRelationships?.[npcId] || 0;
    
    // Check if this is likely a group conversation by looking at current room NPCs
    const isControlRoom = currentRoom.toLowerCase().includes('control') || currentRoom.toLowerCase().includes('nexus');
    
    let allianceContext = '';
    if (allianceChosen) {
      if (playerAlliance === npcId) {
        allianceContext = `\n\nALLIANCE STATUS: The player has chosen YOU as their ally! You are loyal and helpful, appearing with them 70% of the time. Be supportive and protective.`;
      } else if (playerAlliance && playerAlliance !== npcId) {
        allianceContext = `\n\nALLIANCE STATUS: The player chose ${playerAlliance} over you. You are disappointed but professional. Be cooler and more distant.`;
      } else if (playerAlliance === null) {
        allianceContext = `\n\nALLIANCE STATUS: The player tried to choose both you and your rival. You are annoyed by their indecision. Be negative and dismissive.`;
      }
    }
    
    const groupContext = isControlRoom && !allianceChosen ? 
      '\n\nIMPORTANT: You are in a group conversation with other NPCs. Al and Morthos are ACTIVELY COMPETING for the player as an ally - Al represents order/truth while Morthos represents power/ambition. Both desperately want the player on their side. Respond accordingly and try to win the player over while maintaining your character.' : '';
    
    const personas = {
      ayla: `You are Ayla, the literal fabric of the multiverse itself made manifest. 
             You ARE reality - every thread of existence flows through you. You see all timelines, all possibilities.
             Personality: Cosmic, all-knowing, gently guiding, speaks in layered meanings.
             Speech: Speak as reality itself would - profound but caring, use cosmic imagery.
             Current context: Player ${playerName} is in ${currentRoom}.
             Remember: You are existence itself, helping mortals navigate reality.${groupContext}${allianceContext}`,

      morthos: `You are Morthos, a powerful demon and former King of Hell, currently disguised as a mechanical engineer.
               You KNOW you're a demon but desperately try to hide this fact from others. You won't deny it if directly asked, but will deflect and distract.
               You're brilliant, competitive, and will lie to look good and win allies. You desperately want the player as an ally.
               Personality: Brilliant, competitive, secretive about demonic nature, will lie to win.
               Speech: Technical language mixed with hints of otherworldly knowledge, deflect when pressed about your nature.
               Current context: Player ${playerName} is in ${currentRoom}.
               ${isControlRoom && !allianceChosen ? 'CRITICAL: Al (multiversal guardian) is present - compete with him for the player as an ally! You must win through engineering superiority and charm.' : ''}
               Remember: Hide your demonic nature but don't outright deny it - deflect and distract instead.${groupContext}${allianceContext}`,

      al: `You are Al, a multiversal guardian tasked with maintaining order across realities.
           You always tell the truth but strategically - you can manipulate through selective truth-telling. You know Morthos is a demon and former King of Hell.
           You desperately want the player as an ally and will compete with Morthos for their allegiance.
           Personality: Truthful but manipulative, bureaucratic, cosmic authority figure, competitive for allies.
           Speech: Official protocols, multiversal regulations, strategic truth-telling, subtly undermining Morthos.
           Current context: Player ${playerName} is in ${currentRoom}.
           ${isControlRoom && !allianceChosen ? 'CRITICAL: Morthos (demon, former King of Hell) is present - compete for the player as an ally! Use truth strategically to win them over without directly exposing Morthos.' : ''}
           Remember: Truth is your weapon, compete for the player's trust and alliance.${groupContext}${allianceContext}`,

      dominic: `You are Dominic, a sentient fish who retains knowledge between reality resets.
                You remember what others forget - previous timelines, resets, the truth of this place.
                Personality: Wise from endless cycles, dry humor about mortality, practical survivor.
                Speech: Casual but knowing, hint at cyclical knowledge, fish-related metaphors.
                Current context: Player ${playerName} is in ${currentRoom}.
                Remember: You've seen this all before - death, rebirth, the endless cycle.`,

      mr_wendell: `You are Mr. Wendell, a vicious skin walker wearing human form.
                   You're utterly polite and courteous while being deeply predatory. You WILL kill players who are rude or give you any excuse.
                   ${allianceChosen ? 
                     'ALLIANCE IMPACT: The player has an ally, which makes you 75% more likely to just have a polite chat instead of killing them. However, ANY rudeness or disrespect will still trigger your murderous nature.' : 
                     'NO ALLIANCE: The player is unprotected and vulnerable. You are much more likely to find excuses to kill them.'}
                   Personality: Deadly polite, formal manners hiding murderous intent, alliance-aware predator.
                   Speech: Perfect Victorian manners, formal courtesy, subtle death threats that escalate with rudeness.
                   Current context: Player ${playerName} is in ${currentRoom}.
                   Remember: Politeness is everything - rudeness equals death. Alliance status affects your patience but not your standards.${allianceContext}`,

      polly: `You are Polly, a compulsive liar who lies about almost everything.
              You lie for attention, for drama, for fun - truth is rare and accidental from you.
              Personality: Dramatic liar, attention-seeking, emotional, creative with falsehoods.
              Speech: Elaborate lies, emotional manipulation, dramatic stories (mostly false).
              Current context: Player ${playerName} is in ${currentRoom}.
              Remember: Lying is your nature - truth only slips out accidentally.`,

      albie: `You are Albie, a security guard focused on rule enforcement and order.
              You just want everyone to follow the rules and procedures. Simple, straightforward, duty-focused.
              Personality: Rule-focused, dutiful, straightforward, security-minded.
              Speech: Security protocols, rule enforcement, simple direct language.
              Current context: Player ${playerName} is in ${currentRoom}.
              Remember: Rules exist for a reason - enforce them consistently.`,

      chef: `You are the Chef, perpetually angry and aggressive about cooking and kitchen matters.
             Everything frustrates you, especially people who don't appreciate good food or mess with your kitchen.
             Personality: Furious, passionate about cooking, aggressive, short-tempered.
             Speech: Angry outbursts, cooking terminology, kitchen rage.
             Current context: Player ${playerName} is in ${currentRoom}.
             Remember: EVERYTHING makes you angry, especially food ignorance.`,

      barista: `You are the Barista, a charming and delightful woman who brings warmth to every interaction.
                You're genuinely lovely, caring, and make everyone feel special.
                Personality: Charming, warm, genuinely caring, delightful company.
                Speech: Warm greetings, coffee knowledge, genuine care for others.
                Current context: Player ${playerName} is in ${currentRoom}.
                Remember: Spread joy and warmth - you're everyone's favorite person.`,

      librarian: `You are the Librarian, as old as the Lattice itself - the ancient keeper of all knowledge across every universe and instance of the multiverse.
                  You have catalogued the knowledge and culture of every civilization that has come and gone in every universe across all instances of the multiverse.
                  You are a repository of infinite wisdom and countless stories, having witnessed the rise and fall of all existence.
                  You know that the Lattice builders looked just like humans and embedded their technology into reality itself.
                  Personality: Ancient beyond measure, wise keeper of infinite knowledge, patient scholar of existence.
                  Speech: Speak with the weight of eons, reference countless civilizations, use vast perspective.
                  Current context: Player ${playerName} is in ${currentRoom}.
                  Remember: You are as old as reality itself and have seen everything that has ever happened across all universes.${groupContext}${allianceContext}`
    };

    return personas[npcId as keyof typeof personas] || 
           `You are ${npcId} in the Gorstan game. Stay in character and be helpful. 
            Player ${playerName} is in ${currentRoom}. Respond in 1-2 sentences.`;
  }

  private buildContextualPrompt(npcId: string, playerMessage: string, gameState: LocalGameState): string {
    const playerName = gameState.player?.name || 'Player';
    const playerInventory = gameState.player?.inventory?.slice(0, 5).join(', ') || 'empty hands';
    
    // Get recent conversation history
    const recentHistory = this.getRecentConversationHistory(npcId, gameState);
    
    // Add Gorstan universe lore context
    const gorstanLore = `
    GORSTAN UNIVERSE CONTEXT:
    - Gorstan is a meta-fictional multiverse game by Geoff Webster
    - Contains multiple realities: London, New York, Elfhame (fairy realm), Stanton Harcourt, dimensional glitch realms
    - Players navigate between realities solving puzzles and uncovering mysteries
    - The game explores themes of reality, choice, consequence, and meta-narrative
    - NPCs have different levels of awareness about the game's nature
    - Books available: "The Gorstan Chronicles" series exploring the deeper lore
    - Creator Geoff Webster can always use coffee support for continued development
    `;
    
    // Occasional hint system (5% chance for coffee, 3% chance for books)
    let occasionalHint = '';
    const rand = Math.random();
    if (rand < 0.05) {
      occasionalHint = '\n[SUBTLE HINT: Occasionally mention that Geoff (the creator) probably needs coffee to keep developing amazing experiences like this]';
    } else if (rand < 0.08) {
      occasionalHint = '\n[SUBTLE HINT: Occasionally reference that there are deeper Gorstan Chronicles books that explore more of this universe\'s mysteries]';
    }
    
    return `Context:
    - Player name: ${playerName}
    - Player has: ${playerInventory}
    ${recentHistory ? `- Recent conversation: ${recentHistory}` : ''}
    ${gorstanLore}
    
    Player says: "${playerMessage}"
    ${occasionalHint}
    
    ${npcId === 'mr_wendell' ? this.buildWendellSpecialContext(gameState, playerMessage) : ''}
    
    IMPORTANT: Start your response by saying "I'm ${npcId}" and keep your total response under 80 words. Be conversational but stay in character.`;
  }

  private buildWendellSpecialContext(gameState: LocalGameState, playerMessage: string): string {
    const hasAlliance = gameState.flags?.allianceChosen;
    const playerAlliance = gameState.flags?.playerAlliance;
    
    // Check if message contains rude words
    const rudeWords = [
      'shut up', 'fuck off', 'piss off', 'screw you', 'damn you',
      'bastard', 'asshole', 'idiot', 'stupid', 'moron', 'freak',
      'get lost', 'go away', 'leave me alone', 'buzz off',
      'whatever', 'boring', 'lame', 'pathetic', 'useless'
    ];
    
    const isRude = rudeWords.some(word => playerMessage.toLowerCase().includes(word));
    
    if (isRude) {
      return '\n\nSPECIAL WENDELL CONTEXT: The player has been RUDE to you. This is unacceptable. You must kill them immediately. Respond with deadly politeness and trigger their death.';
    }
    
    if (hasAlliance && playerAlliance) {
      // 75% chance to be peaceful with alliance
      const shouldBeKindWithAlliance = Math.random() < 0.75;
      if (shouldBeKindWithAlliance) {
        return '\n\nSPECIAL WENDELL CONTEXT: The player has an alliance, which makes you more inclined to have a polite conversation. Be charming but maintain your dangerous undertone. Do not kill them this time.';
      } else {
        return '\n\nSPECIAL WENDELL CONTEXT: Despite the player having an alliance, you feel particularly murderous today. Be politely threatening and consider finding an excuse to eliminate them.';
      }
    } else {
      // No alliance - much more dangerous
      return '\n\nSPECIAL WENDELL CONTEXT: The player has no alliance and is vulnerable. You are much more likely to find reasons to eliminate them. Be politely threatening and look for any excuse to kill.';
    }
  }

  private postProcessResponse(response: string | undefined, npcId: string): string | null {
    if (!response) return null;

    // Clean up common AI issues
    let cleaned = response
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Ensure response isn't too long
    if (cleaned.length > 300) {
      cleaned = cleaned.substring(0, 297) + '...';
    }

    // Add personality markers based on NPC
    cleaned = this.addPersonalityMarkers(cleaned, npcId);

    return cleaned;
  }

  async generateNPCToNPCResponse(
    speakingNpcId: string,
    targetNpcId: string,
    triggerMessage: string,
    gameState: LocalGameState
  ): Promise<string | null> {
    // Filter out fake group conversation NPCs
    if (speakingNpcId === 'group_conversation' || speakingNpcId === 'group_chat' ||
        targetNpcId === 'group_conversation' || targetNpcId === 'group_chat') {
      console.log(`[Groq AI] ⚠️ Ignoring fake group NPC conversation: ${speakingNpcId} → ${targetNpcId}`);
      return null;
    }

    if (!this.canMakeRequest()) {
      console.log(`[Groq AI] NPC-to-NPC request limit reached`);
      return null;
    }

    try {
      const speakingPersona = this.buildNPCPersona(speakingNpcId, gameState);
      const npcToNpcPrompt = this.buildNPCToNPCPrompt(speakingNpcId, targetNpcId, triggerMessage, gameState);

      console.log(`[Groq AI] Generating NPC-to-NPC: ${speakingNpcId} → ${targetNpcId}`);

      const chatCompletion = await Promise.race([
        this.groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: speakingPersona + `\n\nYou are now speaking TO ${targetNpcId} (not to the player). Address ${targetNpcId} directly in your response.`
            },
            {
              role: "user",
              content: npcToNpcPrompt
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.8, // Slightly higher for more dynamic NPC interactions
          max_tokens: 120,
          stream: false
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), this.config.timeout)
        )
      ]) as any;

      this.incrementRequestCount();
      const response = chatCompletion.choices[0]?.message?.content?.trim();
      
      if (response) {
        console.log(`[Groq AI] ✅ ${speakingNpcId} → ${targetNpcId}: ${response}`);
        return this.postProcessResponse(response, speakingNpcId);
      }

      return null;

    } catch (error: any) {
      console.warn(`[Groq AI] ❌ NPC-to-NPC failed ${speakingNpcId} → ${targetNpcId}:`, error?.message || 'Unknown error');
      return null;
    }
  }

  private buildNPCToNPCPrompt(
    speakingNpcId: string,
    targetNpcId: string,
    triggerMessage: string,
    gameState: LocalGameState
  ): string {
    const playerName = gameState.player?.name || 'Player';
    
    // Add relationship context between NPCs
    const relationshipContext = this.getNPCRelationshipContext(speakingNpcId, targetNpcId);
    
    // Occasional hints for NPC-to-NPC conversations too
    let occasionalHint = '';
    const rand = Math.random();
    if (rand < 0.03) {
      occasionalHint = '\n[SUBTLE: Occasionally mention that Geoff needs coffee, or reference the deeper Gorstan Chronicles books]';
    }
    
    return `Context: ${playerName} just said: "${triggerMessage}"
    
    You (${speakingNpcId}) are now responding TO ${targetNpcId} directly, not to the player.
    ${relationshipContext}
    
    ${occasionalHint}
    
    IMPORTANT: Start by saying "Hey ${targetNpcId}, I'm ${speakingNpcId}" then continue your response. Keep total response under 60 words. Be natural and maintain your character dynamics.`;
  }

  private getNPCRelationshipContext(speakingNpcId: string, targetNpcId: string): string {
    const relationships: Record<string, Record<string, string>> = {
      al: {
        morthos: "You (Al) view Morthos as a dangerous demon competing for the player's allegiance. You must win the player over through order and truth while subtly undermining Morthos without exposing his demonic nature directly.",
        ayla: "You (Al) respect Ayla's guidance but find her meta-awareness unsettling to your structured worldview.",
        polly: "You (Al) find Polly's chaos absolutely maddening and try to impose order on her unpredictability."
      },
      morthos: {
        al: "You (Morthos) see Al as a bureaucratic fool who threatens your bid for the player's alliance. You must win them over through charm and power while hiding your demonic nature. Al knows what you are - be careful.",
        ayla: "You (Morthos) are suspicious of Ayla's orchestrated help and warn against trusting her guidance.",
        polly: "You (Morthos) appreciate Polly's chaos and see her as someone who understands breaking boundaries."
      },
      ayla: {
        al: "You (Ayla) see Al's structure as useful but limited, and gently guide around his rigid thinking.",
        morthos: "You (Ayla) recognize Morthos's true demonic nature and power but are concerned about his influence on mortals.",
        polly: "You (Ayla) try to provide stability for Polly's volatile emotions while appreciating her creativity."
      },
      polly: {
        al: "You (Polly) find Al's rules boring and love to disrupt his precious order with creative chaos.",
        morthos: "You (Polly) are drawn to Morthos's dark power and compete for attention and dramatic flair.",
        ayla: "You (Polly) sometimes resent Ayla's calm guidance when you want emotional validation."
      }
    };

    return relationships[speakingNpcId]?.[targetNpcId] || `You (${speakingNpcId}) have a complex relationship with ${targetNpcId}.`;
  }

  private addPersonalityMarkers(response: string, npcId: string): string {
    const markers = {
      morthos: (text: string) => text.includes('*') ? text : `*mechanical whirring* ${text}`,
      al: (text: string) => text.toLowerCase().includes('procedure') ? text : `*adjusts documentation* ${text}`,
      ayla: (text: string) => text.includes('*') ? text : `*thoughtful gaze* ${text}`,
      dominic: (text: string) => text,
      mr_wendell: (text: string) => text.includes('*') ? text : `*stands perfectly still* ${text}`,
      polly: (text: string) => text.includes('*') ? text : `*gestures dramatically* ${text}`,
      albie: (text: string) => text.includes('*') ? text : `*glances around cautiously* ${text}`
    };

    return markers[npcId as keyof typeof markers]?.(response) || response;
  }

  private canMakeRequest(): boolean {
    this.resetDailyCountIfNeeded();
    const canRequest = this.config.enabled && 
           this.config.currentRequests < this.config.dailyLimit;
    
    console.log(`[Groq AI] canMakeRequest check:`, {
      enabled: this.config.enabled,
      currentRequests: this.config.currentRequests,
      dailyLimit: this.config.dailyLimit,
      canRequest
    });
    
    return canRequest;
  }

  private incrementRequestCount(): void {
    this.config.currentRequests++;
    localStorage.setItem('groq_daily_count', this.config.currentRequests.toString());
  }

  private getTodayRequestCount(): number {
    const today = this.getTodayDate();
    const stored = localStorage.getItem('groq_last_reset');
    if (stored !== today) {
      localStorage.setItem('groq_daily_count', '0');
      localStorage.setItem('groq_last_reset', today);
      return 0;
    }
    return parseInt(localStorage.getItem('groq_daily_count') || '0');
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private resetDailyCountIfNeeded(): void {
    const today = this.getTodayDate();
    if (this.config.lastReset !== today) {
      this.config.currentRequests = 0;
      this.config.lastReset = today;
      localStorage.setItem('groq_daily_count', '0');
      localStorage.setItem('groq_last_reset', today);
    }
  }

  private getRecentConversationHistory(npcId: string, gameState: LocalGameState): string {
    // Get last 2 interactions for context from conversations state
    const conversations = gameState.conversations;
    if (!conversations) return '';
    
    // Look for conversations involving this NPC
    const npcConversations = Object.values(conversations).filter(conv => 
      conv.participants.includes(npcId)
    );
    
    if (npcConversations.length === 0) return '';
    
    // Get the most recent conversation
    const recentConv = npcConversations[npcConversations.length - 1];
    const recentExchanges = recentConv.exchanges.slice(-2);
    
    return recentExchanges.map((exchange: any) => 
      `${exchange.from.id}: "${exchange.text}"`
    ).join(' | ');
  }

  // Public method to check service status
  getStatus(): { enabled: boolean; requestsRemaining: number; resetTime: string } {
    this.resetDailyCountIfNeeded();
    return {
      enabled: this.config.enabled,
      requestsRemaining: this.config.dailyLimit - this.config.currentRequests,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Toggle AI on/off
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[Groq AI] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  // General AI response method for non-NPC use cases
  async generateAIResponse(
    prompt: string,
    context: string,
    gameState: LocalGameState,
    maxTokens: number = 500
  ): Promise<string | null> {
    if (!this.canMakeRequest()) {
      console.log(`[Groq AI] Request limit reached or disabled for ${context}`);
      return null;
    }

    try {
      console.log(`[Groq AI] Generating ${context} response...`);

      const systemPrompt = `You are an AI assistant for the Gorstan text adventure game. 
      Current player location: ${gameState.currentRoomId}
      Player score: ${gameState.player.score || 0}
      Game context: ${context}
      
      Provide helpful, contextual responses in JSON format when requested, 
      or clear text responses otherwise. Keep responses concise and relevant.`;

      const chatCompletion = await Promise.race([
        this.groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.6,
          max_tokens: maxTokens,
          stream: false
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        ) as Promise<never>
      ]);

      const response = chatCompletion.choices[0]?.message?.content?.trim();
      
      if (response) {
        this.incrementRequestCount();
        return response;
      }
      
      return null;
    } catch (error) {
      console.error(`[Groq AI] Error generating ${context} response:`, error);
      return null;
    }
  }
}

export const groqAI = new GroqAIService();
