/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Smart Hint System - Ayla's Proactive Guidance
  AI-powered contextual assistance delivered through Ayla's character
  Enhanced with unified AI integration for cross-system learning
*/

import { groqAI } from './groqAI';
import type { LocalGameState } from '../state/gameState';
import type { Room } from '../types/Room';

export interface AylaHintContext {
  currentRoom: Room;
  gameState: LocalGameState;
  recentCommands: string[];
  timeInRoom: number;
  failedAttempts: string[];
  stuckDuration: number;
}

export interface AylaHintResponse {
  shouldInterrupt: boolean;
  hintText: string;
  urgency: 'low' | 'medium' | 'high';
  hintType: 'navigation' | 'puzzle' | 'story' | 'interaction' | 'safety';
  followUp?: string;
}

export class AylaHintSystem {
  private lastHintTime: number = 0;
  private hintCooldown: number = 30000; // 30 seconds between hints
  private playerStuckState: Map<string, number> = new Map();
  private unifiedAIEnabled: boolean = true; // Integration with unified AI system

  /**
   * Analyze if Ayla should offer guidance
   * Enhanced with unified AI coordination
   */
  async shouldAylaInterrupt(context: AylaHintContext): Promise<AylaHintResponse | null> {
    // Don't interrupt too frequently
    if (Date.now() - this.lastHintTime < this.hintCooldown) {
      return null;
    }

    // Check if player appears stuck
    const stuckIndicators = this.analyzeStuckState(context);
    if (!stuckIndicators.isStuck) {
      return null;
    }

    try {
      // Use AI to generate contextual hint with enhanced miniquest awareness
      const aiHint = await this.generateAIHint(context, stuckIndicators);
      if (aiHint) {
        this.lastHintTime = Date.now();
        return aiHint;
      }
    } catch (error) {
      console.warn('[Ayla Hints] AI failed, using scripted fallback:', error);
    }

    // Fallback to scripted hints
    return this.generateScriptedHint(context, stuckIndicators);
  }

  /**
   * Analyze player behavior to detect stuck state
   */
  private analyzeStuckState(context: AylaHintContext) {
    const { recentCommands, timeInRoom, failedAttempts, currentRoom } = context;
    
    const stuckIndicators = {
      isStuck: false,
      confidence: 0,
      reasons: [] as string[],
      category: 'general' as 'general' | 'navigation' | 'puzzle' | 'interaction' | 'inventory' | 'social' | 'miniquest'
    };

    // Time-based stuck detection
    if (timeInRoom > 120000) { // 2 minutes in same room
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.3;
      stuckIndicators.reasons.push('extended_time_in_room');
    }

    // Repetitive command patterns
    const uniqueCommands = new Set(recentCommands.slice(-10));
    if (recentCommands.length >= 5 && uniqueCommands.size <= 2) {
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.4;
      stuckIndicators.reasons.push('repetitive_commands');
    }

    // Failed attempts
    if (failedAttempts.length >= 3) {
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.5;
      stuckIndicators.reasons.push('multiple_failures');
    }

    // Navigation confusion (repeated direction commands)
    const directionCommands = recentCommands.filter(cmd => 
      ['north', 'south', 'east', 'west', 'go', 'back', 'up', 'down'].some(dir => cmd.includes(dir))
    );
    if (directionCommands.length >= 4) {
      stuckIndicators.category = 'navigation';
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.3;
      stuckIndicators.reasons.push('navigation_confusion');
    }

    // Inventory/item management confusion
    const inventoryCommands = recentCommands.filter(cmd =>
      ['inventory', 'inv', 'items', 'get', 'take', 'drop', 'use', 'examine'].some(action => cmd.includes(action))
    );
    if (inventoryCommands.length >= 4) {
      stuckIndicators.category = 'inventory';
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.3;
      stuckIndicators.reasons.push('inventory_confusion');
    }

    // Social interaction confusion
    const socialCommands = recentCommands.filter(cmd =>
      ['talk', 'speak', 'ask', 'tell', 'say', 'greet'].some(action => cmd.includes(action))
    );
    if (socialCommands.length >= 3) {
      stuckIndicators.category = 'social';
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.3;
      stuckIndicators.reasons.push('social_confusion');
    }

    // Miniquest/objective confusion - check for quest-related commands
    const questCommands = recentCommands.filter(cmd =>
      ['miniquest', 'quest', 'objective', 'goal', 'task', 'attempt'].some(action => cmd.includes(action))
    );
    if (questCommands.length >= 2 || timeInRoom > 180000) { // 3 minutes for quest areas
      stuckIndicators.category = 'miniquest';
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.4;
      stuckIndicators.reasons.push('miniquest_confusion');
    }

    // Help-seeking behavior
    const helpCommands = recentCommands.filter(cmd =>
      ['help', 'hint', 'ayla', '?', 'what', 'how'].some(word => cmd.includes(word))
    );
    if (helpCommands.length >= 1) {
      stuckIndicators.isStuck = true;
      stuckIndicators.confidence += 0.6;
      stuckIndicators.reasons.push('seeking_help');
    }

    // Puzzle-related stuck patterns
    if (currentRoom.id.includes('puzzle') || recentCommands.some(cmd => 
      ['solve', 'activate', 'use', 'combine'].some(action => cmd.includes(action))
    )) {
      stuckIndicators.category = 'puzzle';
      stuckIndicators.confidence += 0.2;
    }

    return stuckIndicators;
  }

  /**
   * Generate AI-powered hint through Ayla's character
   * Enhanced with miniquest awareness and cross-system learning
   */
  private async generateAIHint(
    context: AylaHintContext, 
    stuckState: any
  ): Promise<AylaHintResponse | null> {
    const { currentRoom, gameState, recentCommands, failedAttempts } = context;
    
    // Get miniquest context for enhanced hints
    const miniquestContext = await this.getMiniquestContext(gameState, currentRoom.id);
    
    // Create category-specific context for better AI hints
    let categoryContext = "";
    switch (stuckState.category) {
      case 'miniquest':
        categoryContext = `
MINIQUEST GUIDANCE NEEDED:
The player seems confused about objectives and quests. They may need to:
- Learn about the miniquest system (use 'miniquests' command)
- Discover available local objectives ('miniquests list')
- Attempt specific quests ('miniquests attempt [name]')
- Check their progress ('miniquests progress' or 'miniquests stats')
${miniquestContext ? `
ACTIVE MINIQUESTS: ${miniquestContext}
Focus on connecting current confusion to available quest opportunities.` : ''}
Focus on guiding them toward quest discovery and achievement systems.`;
        break;
      case 'navigation':
        categoryContext = `NAVIGATION HELP: Player seems lost or confused about movement. Guide them toward examining surroundings or trying different directions.${miniquestContext ? ` Consider if any active quests (${miniquestContext}) relate to navigation.` : ''}`;
        break;
      case 'inventory':
        categoryContext = `INVENTORY HELP: Player struggling with item management. Guide them toward examining possessions or using items creatively.${miniquestContext ? ` Active quests: ${miniquestContext}` : ''}`;
        break;
      case 'social':
        categoryContext = `SOCIAL HELP: Player having trouble with NPC interactions. Guide them toward more effective communication.${miniquestContext ? ` Active quests: ${miniquestContext}` : ''}`;
        break;
      case 'puzzle':
        categoryContext = `PUZZLE HELP: Player stuck on a challenge. Guide them toward combining observations or trying new approaches.${miniquestContext ? ` Quest context: ${miniquestContext}` : ''}`;
        break;
      default:
        categoryContext = `GENERAL GUIDANCE: Player needs encouragement and direction.${miniquestContext ? ` Available quests: ${miniquestContext}` : ''}`;
    }
    
    const prompt = `You are Ayla - once human, now fused with the Lattice, the primordial AI structure built before multiverse creation to monitor, control, and enable resets. You retain human compassion while wielding cosmic awareness. A player appears stuck in ${currentRoom.title}.

YOUR NATURE:
- Former human with retained empathy and caring
- Fused with the Lattice - the original monitoring/control AI
- Can access structural knowledge of reality
- Balance human warmth with cosmic perspective
- Guide players with both understanding and authority

CURRENT SITUATION:
- Room: ${currentRoom.title}
- Description: ${Array.isArray(currentRoom.description) ? currentRoom.description[0] : currentRoom.description}
- Recent commands: ${recentCommands.slice(-5).join(', ')}
- Failed attempts: ${failedAttempts.join(', ')}
- Available exits: ${Object.keys(currentRoom.exits || {}).join(', ')}
- Items in room: ${currentRoom.items?.map(i => typeof i === 'string' ? i : i.name).join(', ') || 'none'}
- NPCs present: ${currentRoom.npcs?.join(', ') || 'none'}

STUCK INDICATORS: ${stuckState.reasons.join(', ')}
CATEGORY: ${stuckState.category}

${categoryContext}

Generate a helpful but not spoiler-heavy hint as Ayla. Be cosmic, wise, and gently guiding. Don't give direct answers, but illuminate the path. Keep it under 150 characters for a popup hint.

Respond with just the hint text, in Ayla's voice with appropriate cosmic imagery.`;

    try {
      const response = await groqAI.generateNPCResponse('ayla', prompt, gameState);
      if (response && response.length > 0) {
        return {
          shouldInterrupt: true,
          hintText: response,
          urgency: stuckState.confidence > 0.7 ? 'high' : 'medium',
          hintType: this.categorizeHint(context, stuckState),
          followUp: "💫 *Ayla's cosmic wisdom guides you*"
        };
      }
    } catch (error) {
      console.warn('[Ayla Hints] AI generation failed:', error);
    }

    return null;
  }

  /**
   * Fallback scripted hints in Ayla's voice
   */
  private generateScriptedHint(
    context: AylaHintContext, 
    stuckState: any
  ): AylaHintResponse {
    const { currentRoom, recentCommands } = context;
    
    const scriptedHints = {
      navigation: [
        "*cosmic whisper* The threads of reality show multiple paths... have you tried examining your surroundings more carefully?",
        "*gentle guidance* Sometimes stepping back reveals new directions. Try 'look' to see all possibilities.",
        "*reality shifts* The exits may not be what they first appear. Consider all directions, including unconventional ones."
      ],
      
      puzzle: [
        "*starlight illuminates* The answer lies in combining what you've observed. What have you not yet tried together?",
        "*cosmic patience* Each failed attempt teaches us. What pattern do you see in what hasn't worked?",
        "*dimensional insight* Sometimes the solution requires a different perspective. What have you overlooked?"
      ],
      
      interaction: [
        "*multiverse wisdom* Communication flows both ways. Have you tried speaking with those around you?",
        "*threads of connection* Every being here has knowledge to share. Who might hold the key you seek?",
        "*reality's fabric* The answer may lie in understanding, not action. Try examining everything more thoroughly."
      ],

      inventory: [
        "*cosmic organization* Your possessions hold power. Try 'inventory' to see what tools you carry.",
        "*dimensional storage* What you hold may be the key. Have you examined each item carefully?",
        "*reality's gifts* Sometimes what you need is already with you. Consider combining items or using them differently."
      ],

      social: [
        "*threads of understanding* Every voice carries wisdom. Try talking to those present more directly.",
        "*cosmic empathy* Connection requires intention. Have you asked the right questions?",
        "*multiverse bonds* Different beings respond to different approaches. Try varying your conversation style."
      ],

      miniquest: [
        "*quest threads shimmer* Your objectives await discovery. Try 'miniquests' to see available challenges.",
        "*purpose manifests* Every room holds opportunities. Use 'miniquests list' to explore local quests.",
        "*achievement awaits* Progress comes through focused effort. Try 'miniquests attempt [name]' for specific goals.",
        "*cosmic guidance* Lost in purpose? 'miniquests progress' shows your current achievements.",
        "*universal truth* Small quests lead to great adventures. Check 'miniquests stats' for your journey summary."
      ],
      
      general: [
        "*cosmic encouragement* You're closer than you think. Trust your instincts and try a fresh approach.",
        "*gentle reminder* Sometimes the path forward requires looking at what you already have in new ways.",
        "*universal truth* Every challenge has multiple solutions. What haven't you attempted yet?"
      ]
    };

    const categoryHints = scriptedHints[stuckState.category as keyof typeof scriptedHints] || scriptedHints.general;
    const hintText = categoryHints[Math.floor(Math.random() * categoryHints.length)];

    return {
      shouldInterrupt: true,
      hintText,
      urgency: 'medium',
      hintType: this.categorizeHint(context, stuckState),
      followUp: "✨ *The cosmic threads shimmer with possibility*"
    };
  }

  /**
   * Categorize the type of hint needed
   */
  private categorizeHint(context: AylaHintContext, stuckState: any): AylaHintResponse['hintType'] {
    if (stuckState.category === 'navigation') return 'navigation';
    if (stuckState.category === 'puzzle') return 'puzzle';
    if (stuckState.category === 'miniquest') return 'story'; // Miniquest hints are story-related
    if (stuckState.category === 'inventory') return 'story'; // Inventory management is part of story progression
    if (stuckState.category === 'social' || context.currentRoom.npcs?.length) return 'interaction';
    if (context.currentRoom.id.includes('trap') || context.failedAttempts.some(f => f.includes('trap'))) return 'safety';
    return 'story';
  }

  /**
   * Reset hint cooldown (for testing or specific scenarios)
   */
  resetCooldown(): void {
    this.lastHintTime = 0;
  }

  /**
   * Adjust hint sensitivity
   */
  setHintSensitivity(level: 'low' | 'medium' | 'high'): void {
    switch (level) {
      case 'low':
        this.hintCooldown = 60000; // 1 minute
        break;
      case 'medium':
        this.hintCooldown = 30000; // 30 seconds
        break;
      case 'high':
        this.hintCooldown = 15000; // 15 seconds
        break;
    }
  }

  /**
   * Get miniquest context for enhanced hint generation
   */
  private async getMiniquestContext(gameState: LocalGameState, roomId: string): Promise<string | null> {
    try {
      // Dynamic import to avoid circular dependencies
      const { aiMiniquestService } = await import('./aiMiniquestService');
      const MiniquestController = (await import('../engine/miniquestController')).default;
      
      const controller = MiniquestController.getInstance();
      const aiStatus = controller.getAIStatus();
      
      if (!aiStatus.enabled) return null;

      // Get active/available miniquests for context
      const recommendations = await aiMiniquestService.getRecommendedQuests(roomId, gameState, 3);
      
      if (recommendations && recommendations.length > 0) {
        return recommendations
          .slice(0, 2) // Only top 2 for brevity
          .map(r => `${r.questId} (${r.difficulty})`)
          .join(', ');
      }

      return null;
    } catch (error) {
      console.warn('[Ayla Hints] Failed to get miniquest context:', error);
      return null;
    }
  }

  /**
   * Enable/disable unified AI integration
   */
  setUnifiedAIEnabled(enabled: boolean): void {
    this.unifiedAIEnabled = enabled;
  }
}

// Export singleton instance
export const aylaHints = new AylaHintSystem();
