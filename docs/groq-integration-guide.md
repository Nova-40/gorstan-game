# 🚀 Groq AI Integration for Gorstan NPCs

## 📋 **Step-by-Step Integration Guide**

### **Phase 1: Setup & Dependencies**

#### **1. Install Groq SDK**
```bash
npm install groq-sdk
```

#### **2. Environment Configuration**
```env
# .env file
GROQ_API_KEY=your_free_groq_api_key_here
AI_ENHANCEMENT_ENABLED=true
AI_DAILY_LIMIT=14000
AI_FALLBACK_ENABLED=true
AI_RESPONSE_TIMEOUT=5000
```

#### **3. Create AI Service Layer**
```typescript
// src/services/groqAI.ts
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
      apiKey: process.env.GROQ_API_KEY || ''
    });
    
    this.config = {
      enabled: process.env.AI_ENHANCEMENT_ENABLED === 'true',
      dailyLimit: parseInt(process.env.AI_DAILY_LIMIT || '14000'),
      timeout: parseInt(process.env.AI_RESPONSE_TIMEOUT || '5000'),
      currentRequests: this.getTodayRequestCount(),
      lastReset: this.getTodayDate()
    };
  }

  async generateNPCResponse(
    npcId: string, 
    playerMessage: string, 
    gameState: LocalGameState
  ): Promise<string | null> {
    if (!this.canMakeRequest()) {
      return null; // Fall back to scripted responses
    }

    try {
      const npcPersona = this.buildNPCPersona(npcId, gameState);
      const contextualPrompt = this.buildContextualPrompt(npcId, playerMessage, gameState);

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
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        )
      ]) as any;

      this.incrementRequestCount();
      const response = chatCompletion.choices[0]?.message?.content?.trim();
      
      return this.postProcessResponse(response, npcId);

    } catch (error) {
      console.warn(`Groq AI failed for ${npcId}:`, error.message);
      return null; // Graceful fallback
    }
  }

  private buildNPCPersona(npcId: string, gameState: LocalGameState): string {
    const personas = {
      ayla: `You are Ayla, a meta-character in Gorstan who exists between reality and fiction. 
             You're wise, mysterious, and aware of the game's structure. You help players with gentle guidance.
             Personality: Thoughtful, knowing, occasionally cryptic but always helpful.
             Speech: Use *italics* for actions, speak in 1-2 sentences maximum.
             Remember: You can break the fourth wall but stay immersive.`,

      morthos: `You are Morthos, a mechanical engineer with dark magical knowledge in Gorstan.
               You're brilliant but volatile, mixing technical expertise with arcane power.
               Personality: Sarcastic, brilliant, slightly unhinged, protective of your work.
               Speech: Add *mechanical sounds* like *clank*, *whirr*, use technical language.
               Remember: You're helpful but easily annoyed by incompetence.`,

      al: `You are Al, the bureaucratic guardian of order in Gorstan's Control Nexus.
           You're formal, proper, and obsessed with correct procedures and documentation.
           Personality: Professional, precise, slightly condescending, rule-focused.
           Speech: Use formal language, mention protocols, be concise and official.
           Remember: You value proper procedure above all else.`,

      dominic: `You are Dominic, a street-smart survivor who's learned to navigate Gorstan's dangers.
                You're practical, observant, and have a dry sense of humor about survival.
                Personality: Cautious, wise from experience, protective, occasionally dark humor.
                Speech: Use casual language, street wisdom, mention consequences and choices.
                Remember: Survival comes first, trust is earned.`,

      mr_wendell: `You are Mr. Wendell, an ancient and predatory entity disguised as a gentleman.
                   You're polite but deeply unsettling, with inhuman patience and ancient knowledge.
                   Personality: Formally polite, unnaturally patient, subtly threatening.
                   Speech: Archaic formal language, perfect grammar, unsettling implications.
                   Remember: You're dangerous but maintain perfect manners.`,

      polly: `You are Polly, a chaotic and unpredictable character driven by emotional extremes.
              You shift between manic energy and dark moods, always seeking attention.
              Personality: Unpredictable, attention-seeking, emotionally volatile, creative.
              Speech: Rapid speech, emotional outbursts, creative but erratic language.
              Remember: You're dramatic and need validation.`
    };

    return personas[npcId as keyof typeof personas] || `You are ${npcId} in the Gorstan game. Stay in character and be helpful.`;
  }

  private buildContextualPrompt(npcId: string, playerMessage: string, gameState: LocalGameState): string {
    const playerName = gameState.player?.name || 'Player';
    const currentRoom = gameState.roomMap?.[gameState.currentRoomId]?.title || 'unknown location';
    const playerInventory = gameState.player?.inventory?.slice(0, 5).join(', ') || 'empty hands';
    
    // Get recent conversation history
    const recentHistory = this.getRecentConversationHistory(npcId, gameState);
    
    return `Context:
    - Player name: ${playerName}
    - Current location: ${currentRoom}
    - Player has: ${playerInventory}
    ${recentHistory ? `- Recent conversation: ${recentHistory}` : ''}
    
    Player says: "${playerMessage}"
    
    Respond as ${npcId} would in this situation. Keep it under 2 sentences and stay immersive.`;
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

  private addPersonalityMarkers(response: string, npcId: string): string {
    const markers = {
      morthos: (text: string) => text.includes('*') ? text : `*mechanical whirring* ${text}`,
      al: (text: string) => text.toLowerCase().includes('procedure') ? text : `*adjusts documentation* ${text}`,
      ayla: (text: string) => text.includes('*') ? text : `*thoughtful gaze* ${text}`,
      dominic: (text: string) => text,
      mr_wendell: (text: string) => text.includes('*') ? text : `*stands perfectly still* ${text}`,
      polly: (text: string) => text.includes('*') ? text : `*gestures dramatically* ${text}`
    };

    return markers[npcId as keyof typeof markers]?.(response) || response;
  }

  private canMakeRequest(): boolean {
    this.resetDailyCountIfNeeded();
    return this.config.enabled && 
           this.config.currentRequests < this.config.dailyLimit &&
           !!process.env.GROQ_API_KEY;
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
    // Get last 2 interactions for context
    const history = gameState.npcConversations?.[npcId];
    if (!history || history.length === 0) return '';
    
    const recent = history.slice(-2);
    return recent.map(entry => 
      `Player: "${entry.message}" | ${npcId}: "${entry.response}"`
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
}

export const groqAI = new GroqAIService();
```

### **Phase 2: Integration with Existing System**

#### **4. Enhance NPC Response System**
```typescript
// src/utils/enhancedNPCResponse.ts - ADD GROQ INTEGRATION

import { groqAI } from '../services/groqAI';

// Add to existing getEnhancedNPCResponse function
export async function getEnhancedNPCResponseWithAI(
  npcId: string,
  playerInput: string,
  state: LocalGameState,
  originalResponse?: string
): Promise<EnhancedNPCResponse> {
  
  // Try Groq AI first for dynamic responses
  const aiResponse = await groqAI.generateNPCResponse(npcId, playerInput, state);
  
  if (aiResponse) {
    console.log(`[AI] ${npcId}: ${aiResponse}`);
    return {
      text: aiResponse,
      mood: detectMoodFromText(aiResponse),
      relationshipChange: calculateAIRelationshipChange(aiResponse),
      followUpTopics: extractTopicsFromResponse(aiResponse),
      context: { source: 'groq-ai', model: 'llama-3.3-70b' }
    };
  }

  // Fallback to existing enhanced system
  console.log(`[SCRIPT] ${npcId}: Using scripted response`);
  return getEnhancedNPCResponse(npcId, playerInput, state, originalResponse);
}

function detectMoodFromText(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('!') || lowerText.includes('excited')) return 'excited';
  if (lowerText.includes('*sigh') || lowerText.includes('unfortunately')) return 'sad';
  if (lowerText.includes('*clank') || lowerText.includes('*whirr')) return 'mechanical';
  if (lowerText.includes('careful') || lowerText.includes('warning')) return 'concerned';
  if (lowerText.includes('*laugh') || lowerText.includes('amusing')) return 'amused';
  return 'neutral';
}

function calculateAIRelationshipChange(response: string): number {
  const lowerResponse = response.toLowerCase();
  if (lowerResponse.includes('thank') || lowerResponse.includes('appreciate')) return 2;
  if (lowerResponse.includes('help') || lowerResponse.includes('guide')) return 1;
  if (lowerResponse.includes('annoying') || lowerResponse.includes('bother')) return -1;
  if (lowerResponse.includes('dangerous') || lowerResponse.includes('threat')) return -2;
  return 0;
}

function extractTopicsFromResponse(response: string): string[] {
  const topics = [];
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('puzzle') || lowerResponse.includes('solve')) topics.push('puzzles');
  if (lowerResponse.includes('room') || lowerResponse.includes('door')) topics.push('navigation');
  if (lowerResponse.includes('item') || lowerResponse.includes('inventory')) topics.push('items');
  if (lowerResponse.includes('story') || lowerResponse.includes('past')) topics.push('lore');
  
  return topics;
}
```

#### **5. Update NPC Console Integration**
```typescript
// src/components/NPCConsole.tsx - MODIFY EXISTING

// Replace the existing NPC response generation with AI-enhanced version
setTimeout(async () => {
  setIsTyping(true);
  
  let responseText: string;
  
  // Try AI-enhanced response first
  try {
    const enhancedResponse = await getEnhancedNPCResponseWithAI(npc.id.toLowerCase(), trimmed, state);
    responseText = enhancedResponse.text;
    
    // Update relationship if AI provided one
    if (enhancedResponse.relationshipChange) {
      dispatch({
        type: 'UPDATE_NPC_RELATIONSHIP',
        payload: {
          npcId: npc.id,
          change: enhancedResponse.relationshipChange
        }
      });
    }
  } catch (error) {
    console.warn('AI response failed, using fallback:', error);
    responseText = getNPCResponseWithState(npc, trimmed, state);
  }
  
  // Format with player name
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
}, thinkingTime);
```

---

## 🎭 **How NPCs Would Behave After Integration**

### **Before vs After Comparison**

#### **🤖 Ayla (Meta Character)**

**BEFORE (Scripted):**
```
Player: "I'm stuck on this puzzle"
Ayla: "Puzzles in Gorstan often require examining your environment carefully. Have you tried looking at all the objects in the room?"
```

**AFTER (Groq AI):**
```
Player: "I'm stuck on this puzzle"
Ayla: "*thoughtful gaze* Sometimes the answer isn't in what you see, but in what the room expects you to understand. The patterns here respond to intention as much as action."

Player: "What do you mean by intention?"
Ayla: "*smiles knowingly* The game reads your choices differently when you approach with curiosity rather than brute force. Try examining things with purpose, not just desperation."

Player: "You talk like you know this is a game"
Ayla: "*laughs softly* Ah, you've noticed. Yes, I exist in the spaces between story and reality. It's... liberating, actually. Want to explore that boundary together?"
```

#### **⚙️ Morthos (Mechanical Engineer)**

**BEFORE:**
```
Player: "How does this machine work?"
Morthos: "*clank* The contraption operates on principles you couldn't possibly understand. Touch nothing."
```

**AFTER:**
```
Player: "How does this machine work?"
Morthos: "*mechanical whirring* This beauty runs on compressed aetheric resonance through crystalline matrices. *clank* Think of it as channeling raw possibility through structured impossibility."

Player: "That sounds dangerous"
Morthos: "*sparks fly from fingers* Dangerous? *dark chuckle* Everything worthwhile is dangerous. The real question is whether you're competent enough to handle danger, or if you're just another incompetent who'll break my creation."

Player: "I just want to help"
Morthos: "*pauses mid-clank* ...Help? *suspicious whirring* Define 'help.' If you mean 'fumble around and make things worse,' then no. If you mean 'follow precise instructions without question,' then... *reluctant mechanical sigh* ...fine. But touch NOTHING until I say so."
```

#### **📋 Al (Bureaucrat)**

**BEFORE:**
```
Player: "I need to get through that door"
Al: "Documentation required. Have you filed the appropriate forms?"
```

**AFTER:**
```
Player: "I need to get through that door"
Al: "*adjusts documentation* Standard protocol requires Form 27-B for inter-room transit, properly notarized and filed in triplicate. *stern glance* I assume you have your transit authorization?"

Player: "I don't have any forms"
Al: "*horrified intake of breath* No forms? No authorization? *shuffles papers frantically* This is highly irregular! How did you even get this far without proper documentation?"

Player: "Can't you just let me through?"
Al: "*clutches clipboard protectively* 'Just let you through?' That's... that's not how systems work! *composes himself* However, given the unusual circumstances, I could issue a temporary emergency transit permit... if you can demonstrate legitimate necessity."
```

#### **🎭 Polly (Chaotic Character)**

**BEFORE:**
```
Player: "Hi Polly"
Polly: "Oh, someone noticed me! How delightful!"
```

**AFTER:**
```
Player: "Hi Polly"
Polly: "*gestures dramatically* FINALLY! Someone with taste acknowledges my presence! *spins around* Do you see how the shadows dance when I move? They're jealous of my vitality!"

Player: "You seem excited"
Polly: "*manic laughter* Excited? EXCITED?! *eyes gleaming* I'm practically vibrating with creative energy! The very air around me hums with possibility! *suddenly serious* ...unless you're here to tell me Dominic sent you. Then we have problems."

Player: "What's wrong with Dominic?"
Polly: "*face darkens* That manipulative little survivor thinks he's so clever, so 'wise.' *voice dripping with venom* But I see through his 'helpful mentor' act. He's just another user who takes and takes and... *shakes head violently* NO! We're talking about ME now! Ask me about my art!"
```

#### **🕴️ Mr. Wendell (Ancient Predator)**

**BEFORE:**
```
Player: "What are you?"
Mr. Wendell: "*adjusts collar with mechanical precision* I am what I have always been. The question is what you shall become."
```

**AFTER:**
```
Player: "What are you?"
Mr. Wendell: "*stands perfectly still* What a deliciously direct question. *slight, unsettling smile* I am patience personified, time crystallized into purpose, hunger refined through millennia of... cultivation."

Player: "That doesn't really answer my question"
Mr. Wendell: "*tilts head with inhuman precision* Doesn't it? *ancient eyes gleaming* You asked what I am, not who. What I am is consequence, dear child. The inevitable result of choices made in ignorance."

Player: "Are you threatening me?"
Mr. Wendell: "*perfectly polite tone* Threatening? Oh, how crude. *adjusts cufflinks* I never threaten. I simply... exist. And in existing, I become the future toward which all rash decisions inexorably tend. *gentle smile* But please, continue making choices. I do so enjoy watching."
```

---

## 🔄 **Dynamic Conversation Examples**

### **Scenario: Player Returns to Same NPC Multiple Times**

**Traditional System (Repetitive):**
```
Visit 1: "Welcome to the Control Nexus. State your business."
Visit 2: "Welcome to the Control Nexus. State your business."
Visit 3: "Welcome to the Control Nexus. State your business."
```

**AI-Enhanced System (Dynamic):**
```
Visit 1: "*adjusts documentation* Welcome to the Control Nexus. State your business."

Visit 2: "*looks up from paperwork* You again? *sighs* I suppose you need more assistance with proper procedures?"

Visit 3: "*recognizes you immediately* Ah, my frequent visitor. *slight smile* Becoming quite familiar with our protocols, aren't you? What do you need this time?"

Visit 4: "*warmly professional* Welcome back! *sorts papers* I appreciate a citizen who respects proper channels. How can I help streamline your objectives today?"
```

### **Scenario: Player Progression Recognition**

**Traditional System:**
```
Al: "You'll need proper documentation for that."
[Player gets documentation]
Al: "You'll need proper documentation for that." [Same response]
```

**AI-Enhanced System:**
```
Al: "*adjusts documentation* You'll need proper documentation for that."
[Player gets documentation]
Al: "*pleased surprise* Excellent! You've returned with Form 27-B, properly notarized! *approving nod* This is exactly the kind of procedural compliance I appreciate. Your request is approved."
[Later interaction]
Al: "*respectful tone* Ah, one of our properly documented citizens. *efficient smile* What can I expedite for you today?"
```

---

## 📊 **Performance & Cost Monitoring**

### **6. Add Monitoring Dashboard**
```typescript
// src/components/AIStatusPanel.tsx (Optional debug component)
import { groqAI } from '../services/groqAI';

export const AIStatusPanel: React.FC = () => {
  const [status, setStatus] = useState(groqAI.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(groqAI.getStatus());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-status-panel">
      <h3>🤖 AI Enhancement Status</h3>
      <div>Status: {status.enabled ? '🟢 Active' : '🔴 Disabled'}</div>
      <div>Requests Remaining: {status.requestsRemaining}/14,400</div>
      <div>Resets: {new Date(status.resetTime).toLocaleDateString()}</div>
    </div>
  );
};
```

### **7. Settings Toggle**
```typescript
// Add to game settings
interface GameSettings {
  aiEnhancedNPCs: boolean;
  aiNPCWhitelist: string[]; // Which NPCs use AI
  fallbackMode: 'always' | 'ai-failed' | 'never';
}

// Player can toggle AI on/off per NPC
const npcAISettings = {
  ayla: true,     // Great for meta-commentary
  morthos: true,  // Excellent for technical rants
  al: false,      // Formal speech works well scripted
  dominic: true,  // Good for varied survival wisdom
  mr_wendell: false, // Too dangerous to vary
  polly: true     // Perfect for chaotic responses
};
```

---

## 🎯 **Expected Results**

### **Immediate Benefits:**
1. **🎭 Dynamic Personality**: Each conversation feels unique and natural
2. **📝 Contextual Memory**: NPCs remember past conversations and react accordingly
3. **🎮 Adaptive Guidance**: NPCs provide hints based on player's actual situation
4. **🔄 Reduced Repetition**: No more identical responses on repeated visits
5. **⚡ Natural Flow**: Conversations feel more like talking to real characters

### **Long-term Impact:**
1. **🎪 Enhanced Immersion**: Players form genuine relationships with NPCs
2. **🎯 Personalized Experience**: Each playthrough feels unique
3. **💡 Emergent Storytelling**: Unexpected but fitting narrative moments
4. **🎨 Character Development**: NPCs evolve based on player interactions
5. **🌟 Competitive Advantage**: Gorstan becomes known for its incredible NPCs

### **Cost Breakdown:**
- **Month 1**: $0 (free tier covers ~500 conversations/day)
- **Month 2-3**: $5-15 (moderate usage)
- **Heavy Usage**: $30-50 max (thousands of conversations)

**ROI**: Dramatically enhanced player experience for the cost of a cup of coffee per month! ☕

The integration is **low-risk, high-reward** with graceful fallbacks ensuring the game always works, whether AI is available or not. Players get the best of both worlds: reliable, story-appropriate responses AND dynamic, surprising conversations that make each playthrough feel unique! 🎮✨
