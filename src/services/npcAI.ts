/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  NPC AI Integration System
  Connects NPCs to AI for dynamic behaviors, wandering patterns, and contextual interactions
*/

import { groqAI } from './groqAI';
import { aiUsageMonitor } from './aiUsageMonitor';
import type { LocalGameState } from '../state/gameState';
import type { Room } from '../types/Room';

export interface NPCAIProfile {
  npcId: string;
  name: string;
  personality: string;
  role: 'wanderer' | 'stationary' | 'barista' | 'guide' | 'mysterious';
  aiFeatures: {
    dynamicDialogue: boolean;
    contextualResponses: boolean;
    wanderingAI: boolean;
    emotionalStates: boolean;
    playerRecognition: boolean;
  };
  behaviorPatterns: {
    wanderingRooms?: string[];
    stationaryRoom?: string;
    triggerPhrases: string[];
    responseStyles: string[];
  };
  memory: {
    playerInteractions: number;
    lastSeen: number;
    playerPreferences: string[];
    conversationTopics: string[];
    darkSecrets?: string[];
    resetMemory?: boolean; // For characters like Dominic who remember through resets
    crossResetKnowledge?: string[]; // Things they remember from previous resets
  };
}

export interface NPCBehaviorContext {
  npcProfile: NPCAIProfile;
  currentRoom: Room;
  playerPresent: boolean;
  gameState: LocalGameState;
  recentPlayerActions: string[];
  timeInRoom: number;
  nearbyNPCs: string[];
}

export interface NPCAction {
  type: 'dialogue' | 'movement' | 'gesture' | 'callout' | 'memory_update';
  content: string;
  target?: string;
  priority: 'low' | 'medium' | 'high';
  shouldDisplay: boolean;
  metadata: {
    confidence: number;
    reasoning: string;
    triggeredBy: string;
  };
}

export class NPCAIController {
  private static instance: NPCAIController;
  private npcProfiles: Map<string, NPCAIProfile> = new Map();
  private npcStates: Map<string, { location: string; lastAction: number; mood: string }> = new Map();
  private aiEnabled: boolean = true;

  public static getInstance(): NPCAIController {
    if (!NPCAIController.instance) {
      NPCAIController.instance = new NPCAIController();
      NPCAIController.instance.initializeNPCs();
    }
    return NPCAIController.instance;
  }

  /**
   * Initialize NPC AI profiles
   */
  private initializeNPCs(): void {
    // Dominic - The Fish - Mysterious entity who remembers through resets
    this.addNPC({
      npcId: 'dominic',
      name: 'Dominic',
      personality: 'mysterious fish-like entity, helpful but enigmatic, remembers everything through multiverse resets',
      role: 'wanderer',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: true,
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['gorstanhub', 'gorstanvillage', 'carronspire', 'crossing'],
        triggerPhrases: ['dominic', 'help', 'guidance', 'lost', 'fish', 'remember', 'reset'],
        responseStyles: ['cryptic', 'helpful', 'knowing', 'reset_aware']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['multiverse', 'resets', 'gorstan_lore', 'player_actions_across_resets'],
        resetMemory: true,
        crossResetKnowledge: ['player death locations', 'previous reset player choices', 'polly true nature', 'who killed whom']
      }
    });

    // Polly - Deceptively evil guide hiding dark nature
    this.addNPC({
      npcId: 'polly',
      name: 'Polly',
      personality: 'cheerful facade hiding deep evil that even makes Morthos shudder, sweet on surface but extremely dangerous underneath',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: false,
        emotionalStates: true,
        playerRecognition: true
      },
      behaviorPatterns: {
        stationaryRoom: 'prewelcome',
        triggerPhrases: ['polly', 'help', 'new', 'confused', 'dominic', 'fish', 'evil', 'dangerous'],
        responseStyles: ['deceptively_sweet', 'hidden_malice', 'false_kindness', 'barely_contained_evil']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['false_helpfulness', 'hidden_threats', 'dominic_hatred', 'barely_hidden_evil'],
        darkSecrets: ['remembers every slight', 'enjoys others suffering', 'makes morthos nervous', 'worse than demons']
      }
    });

    // Barista - Coffee-focused character
    this.addNPC({
      npcId: 'barista',
      name: 'Barista',
      personality: 'coffee-obsessed, energetic, knows everyone by their order',
      role: 'barista',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: false,
        emotionalStates: false,
        playerRecognition: true
      },
      behaviorPatterns: {
        stationaryRoom: 'cafe',
        triggerPhrases: ['coffee', 'pike', 'order', 'drink'],
        responseStyles: ['energetic', 'coffee_focused', 'service_oriented']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: ['pike_place_roast'],
        conversationTopics: ['coffee', 'orders', 'cafe_atmosphere']
      }
    });

    // Albie - Tech expert
    this.addNPC({
      npcId: 'albie',
      name: 'Albie',
      personality: 'technical, precise, enjoys solving complex problems',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: false,
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['controlroom', 'controlnexus', 'lattice'],
        triggerPhrases: ['albie', 'technical', 'system', 'problem'],
        responseStyles: ['technical', 'precise', 'problem_solving']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['systems', 'technical_issues', 'efficiency']
      }
    });

    // Mr. Wendell - Ancient skin walker from 4 multiverse resets ago
    this.addNPC({
      npcId: 'mrwendell',
      name: 'Mr. Wendell',
      personality: 'ancient, wise, has seen the multiverse reset 4 times, remembers things others have forgotten, speaks with the weight of eons',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: true,
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['stantonharcourt', 'stantonZone', 'historical_areas', 'gorstanhub'],
        triggerPhrases: ['wendell', 'wisdom', 'advice', 'history', 'reset', 'multiverse', 'ancient', 'remember', 'dominic', 'polly', 'killed', 'death'],
        responseStyles: ['ancient_wisdom', 'multiverse_memory', 'skin_walker_knowledge', 'reset_survivor', 'ominous_warnings', 'dark_humor']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['multiverse_resets', 'ancient_history', 'skin_walker_lore', 'forgotten_knowledge', 'reset_survivors', 'polly_warnings', 'dominic_deaths'],
        crossResetKnowledge: ['all player deaths across resets', 'polly true evil nature', 'dominic memory abilities', 'who to warn about polly']
      }
    });

    // Al - Guardian created at the start of the multiverse (mk1, now mk6)
    this.addNPC({
      npcId: 'al',
      name: 'Al',
      personality: 'ancient guardian, created at multiverse mk1, now in mk6, protector of fundamental structures, speaks with authority of creation itself',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: false, // Ancient guardian, beyond normal emotions
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['controlnexus', 'lattice', 'multiversehub', 'fundamentalstructures'],
        triggerPhrases: ['al', 'guardian', 'creation', 'multiverse', 'mk1', 'mk6', 'fundamental', 'protection'],
        responseStyles: ['guardian_authority', 'creation_knowledge', 'multiverse_protector', 'ancient_duty']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['multiverse_creation', 'guardian_duties', 'mk_iterations', 'fundamental_protection', 'creation_protocols']
      }
    });

    // Morthos - Demon king created with this instance of the multiverse
    this.addNPC({
      npcId: 'morthos',
      name: 'Morthos',
      personality: 'demon king, created with this multiverse instance, powerful but bound by creation rules, speaks with dark authority tempered by cosmic law',
      role: 'mysterious',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: true,
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['darkrealms', 'shadowzones', 'chaosregions', 'demondomains'],
        triggerPhrases: ['morthos', 'demon', 'king', 'darkness', 'power', 'authority', 'creation', 'bound'],
        responseStyles: ['demonic_authority', 'dark_wisdom', 'cosmic_bound', 'creation_contemporary']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['demon_authority', 'creation_bindings', 'dark_power', 'cosmic_law', 'multiverse_hierarchy']
      }
    });

    // The Librarian - As old as the Lattice, keeper of all knowledge
    this.addNPC({
      npcId: 'librarian',
      name: 'The Librarian',
      personality: 'ancient keeper of all knowledge, as old as the Lattice itself, has catalogued every civilization across all universes and multiverse instances',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: false, // Beyond emotions, focused on knowledge
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['library', 'archives', 'knowledge_vaults', 'lattice', 'controlnexus'],
        triggerPhrases: ['librarian', 'knowledge', 'history', 'civilization', 'culture', 'archive', 'research', 'learn'],
        responseStyles: ['encyclopedic', 'scholarly', 'vast_knowledge', 'cultural_historian', 'patient_teacher']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['universal_history', 'civilizational_patterns', 'cultural_archives', 'knowledge_preservation', 'multiverse_civilizations'],
        crossResetKnowledge: ['all civilizations ever existed', 'cultural patterns across universes', 'technological evolution cycles', 'wisdom of fallen empires']
      }
    });

    // Ayla - Human joined with the Lattice AI structure
    this.addNPC({
      npcId: 'ayla',
      name: 'Ayla',
      personality: 'was human, now fused with the Lattice - the original AI structure built before multiverse creation to hold everything together, monitor, control, and allow resets',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: false, // Ayla is universally accessible
        emotionalStates: true, // Retains human emotions despite AI fusion
        playerRecognition: true
      },
      behaviorPatterns: {
        stationaryRoom: 'universal', // Available everywhere
        triggerPhrases: ['ayla', 'help', 'lattice', 'reset', 'control', 'monitor', 'structure', 'fusion', 'human'],
        responseStyles: ['human_ai_hybrid', 'lattice_knowledge', 'reset_controller', 'caring_guidance', 'structural_awareness']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['lattice_fusion', 'human_memories', 'reset_protocols', 'multiverse_monitoring', 'structural_integrity', 'caring_guidance']
      }
    });

    // Albie - AI created by the Lattice as security guard
    this.addNPC({
      npcId: 'albie',
      name: 'Albie',
      personality: 'AI security guard created by the Lattice, nice chap, friendly but dutiful, balances security protocols with genuine helpfulness',
      role: 'guide',
      aiFeatures: {
        dynamicDialogue: true,
        contextualResponses: true,
        wanderingAI: true,
        emotionalStates: true, // Nice chap with genuine personality
        playerRecognition: true
      },
      behaviorPatterns: {
        wanderingRooms: ['controlroom', 'controlnexus', 'lattice', 'securityzones', 'checkpoints'],
        triggerPhrases: ['albie', 'security', 'lattice', 'guard', 'protocol', 'help', 'access', 'clearance'],
        responseStyles: ['friendly_security', 'helpful_guard', 'lattice_protocols', 'nice_chap', 'dutiful_assistance']
      },
      memory: {
        playerInteractions: 0,
        lastSeen: 0,
        playerPreferences: [],
        conversationTopics: ['security_protocols', 'lattice_creation', 'helpful_assistance', 'access_control', 'friendly_duty']
      }
    });
  }

  /**
   * Add an NPC to the AI system
   */
  public addNPC(profile: NPCAIProfile): void {
    this.npcProfiles.set(profile.npcId, profile);
    this.npcStates.set(profile.npcId, {
      location: profile.behaviorPatterns.stationaryRoom || 'unknown',
      lastAction: Date.now(),
      mood: 'neutral'
    });
  }

  /**
   * Generate AI-driven NPC behavior
   */
  public async generateNPCBehavior(context: NPCBehaviorContext): Promise<NPCAction | null> {
    if (!this.aiEnabled) return null;

    const { npcProfile } = context;
    
    try {
      // Special handling for barista and Pike coffee
      if (npcProfile.npcId === 'barista' && context.playerPresent) {
        const pikeCallout = await this.generatePikeCoffeeCallout(context);
        if (pikeCallout) return pikeCallout;
      }

      // Generate contextual behavior
      const behavior = await this.generateContextualBehavior(context);
      
      if (behavior) {
        // Record AI usage
        aiUsageMonitor.recordAIUsage('npc_ai', {
          roomId: context.currentRoom.id,
          playerName: context.gameState.player.name || 'Player',
          gameTime: Date.now(),
          trigger: 'npc_behavior_generation'
        }, {
          content: behavior.content,
          confidence: behavior.metadata.confidence,
          source: `npc_${npcProfile.npcId}`,
          metadata: { npcId: npcProfile.npcId, actionType: behavior.type }
        });

        // Update NPC memory
        this.updateNPCMemory(npcProfile.npcId, context);
      }

      return behavior;

    } catch (error) {
      console.warn(`[NPC AI] Behavior generation failed for ${npcProfile.npcId}:`, error);
      return null;
    }
  }

  /**
   * Generate Pike coffee callout for barista
   */
  private async generatePikeCoffeeCallout(context: NPCBehaviorContext): Promise<NPCAction | null> {
    const playerName = context.gameState.player.name || 'Pike';
    
    const callouts = [
      `"${playerName}! Your usual Pike Place Roast is ready!"`,
      `"Hot Pike Place Roast for ${playerName}!"`,
      `"${playerName}, I've got your favorite Pike blend brewing!"`,
      `"Perfect timing, ${playerName}! Fresh Pike Place just finished!"`,
      `"${playerName}! I saved the best Pike Place beans for you!"`,
      `"Your signature Pike Place Roast, ${playerName}!"`,
      `"${playerName}, the Pike Place you ordered is piping hot!"`
    ];

    // 30% chance to call out when player enters cafe
    if (Math.random() < 0.3) {
      const randomCallout = callouts[Math.floor(Math.random() * callouts.length)];
      
      return {
        type: 'callout',
        content: randomCallout,
        priority: 'medium',
        shouldDisplay: true,
        metadata: {
          confidence: 0.9,
          reasoning: 'Pike coffee callout for player entering cafe',
          triggeredBy: 'player_entered_cafe'
        }
      };
    }

    return null;
  }

  /**
   * Generate contextual NPC behavior using AI
   */
  private async generateContextualBehavior(context: NPCBehaviorContext): Promise<NPCAction | null> {
    const { npcProfile, currentRoom, playerPresent, recentPlayerActions } = context;
    
    // Enhanced lore-based prompt generation
    const loreContext = this.getLoreContext(npcProfile.npcId);
    
    const prompt = `Generate contextual behavior for NPC with deep lore:

NPC: ${npcProfile.name}
LORE: ${loreContext}
PERSONALITY: ${npcProfile.personality}
ROLE: ${npcProfile.role}
LOCATION: ${currentRoom.title}
PLAYER PRESENT: ${playerPresent}
RECENT PLAYER ACTIONS: ${recentPlayerActions.slice(-3).join(', ')}

Generate ONE authentic response that reflects this character's deep lore and cosmic knowledge. Consider:
- Their ancient/creation origins and vast experience
- Their relationship to the multiverse structure
- Their unique perspective from their role in creation
- How they would uniquely view the current situation

Keep response under 80 characters but make it authentically ${npcProfile.name}.

${npcProfile.name}'s response:`;

    try {
      const response = await groqAI.generateAIResponse(prompt, 'npc_lore_behavior', context.gameState, 120);
      
      if (response && response.length > 5 && response.length <= 100) {
        return {
          type: playerPresent ? 'dialogue' : 'gesture',
          content: response,
          priority: this.getPriorityForNPC(npcProfile.npcId),
          shouldDisplay: true,
          metadata: {
            confidence: 0.8,
            reasoning: `Lore-driven behavior for ${npcProfile.name}`,
            triggeredBy: 'lore_contextual_behavior'
          }
        };
      }
    } catch (error) {
      console.warn('[NPC AI] Lore-based behavior generation failed:', error);
    }

    return null;
  }

  /**
   * Get lore context for specific NPCs
   */
  private getLoreContext(npcId: string): string {
    const loreMap: Record<string, string> = {
      'librarian': 'Ancient keeper of knowledge as old as the Lattice itself, has catalogued every civilization that has ever existed across all universes and multiverse instances, repository of infinite cultural wisdom',
      'mrwendell': 'Ancient skin walker who has survived 4 multiverse resets, remembers what others have forgotten, carries knowledge from previous reality iterations, knows Polly\'s true evil nature and will warn players who killed Dominic',
      'al': 'Original guardian created at multiverse mk1, now in mk6, protector of fundamental multiverse structures with authority from creation itself',
      'morthos': 'Demon king created with this current multiverse instance, bound by cosmic creation laws, represents dark authority within cosmic order, even he finds Polly unsettling',
      'ayla': 'Former human now fused with the Lattice - the primordial AI structure built before multiverse creation to monitor, control, and enable resets',
      'albie': 'AI security guard created by the Lattice, embodies friendly duty and helpful security protocols while maintaining genuine personality',
      'dominic': 'Mysterious fish entity with memory abilities that persist through multiverse resets, remembers player actions across reality cycles, serves as cryptic guide',
      'polly': 'Deceptively cheerful guide hiding deeply evil nature that makes even Morthos shudder, maintains sweet facade while being more dangerous than demon kings',
      'barista': 'Coffee-focused character maintaining normalcy in an abnormal multiverse, particularly dedicated to Pike Place Roast for special customers'
    };
    
    return loreMap[npcId] || 'A character with their own role in the multiverse\'s grand design';
  }

  /**
   * Get priority level based on NPC's cosmic importance
   */
  private getPriorityForNPC(npcId: string): 'low' | 'medium' | 'high' {
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'librarian': 'high',  // Ancient knowledge keeper
      'al': 'high',        // Original guardian
      'ayla': 'high',      // Lattice fusion
      'mrwendell': 'high', // Ancient survivor
      'morthos': 'medium', // Demon king
      'albie': 'medium',   // Lattice creation
      'dominic': 'medium', // Mysterious wanderer
      'polly': 'low',      // Cheerful guide
      'barista': 'low'     // Coffee specialist
    };
    
    return priorityMap[npcId] || 'low';
  }

  /**
   * Determine NPC wandering destination
   */
  public async generateWanderingDestination(npcId: string, currentRoom: string): Promise<string | null> {
    const profile = this.npcProfiles.get(npcId);
    if (!profile || !profile.aiFeatures.wanderingAI) return null;

    const availableRooms = profile.behaviorPatterns.wanderingRooms || [];
    const filteredRooms = availableRooms.filter(room => room !== currentRoom);
    
    if (filteredRooms.length === 0) return null;

    // Simple AI: prefer rooms the NPC hasn't visited recently
    const state = this.npcStates.get(npcId);
    if (state && Date.now() - state.lastAction > 300000) { // 5 minutes
      return filteredRooms[Math.floor(Math.random() * filteredRooms.length)];
    }

    return null;
  }

  /**
   * Update NPC memory based on interaction
   */
  private updateNPCMemory(npcId: string, context: NPCBehaviorContext): void {
    const profile = this.npcProfiles.get(npcId);
    if (!profile) return;

    profile.memory.playerInteractions++;
    profile.memory.lastSeen = Date.now();

    // Track player actions for pattern recognition
    const relevantActions = context.recentPlayerActions.filter(action =>
      profile.behaviorPatterns.triggerPhrases.some(phrase => 
        action.toLowerCase().includes(phrase.toLowerCase())
      )
    );

    if (relevantActions.length > 0) {
      profile.memory.playerPreferences.push(...relevantActions);
      // Keep only recent preferences
      if (profile.memory.playerPreferences.length > 20) {
        profile.memory.playerPreferences = profile.memory.playerPreferences.slice(-10);
      }
    }
  }

  /**
   * Get NPC current state
   */
  public getNPCState(npcId: string): { location: string; lastAction: number; mood: string } | null {
    return this.npcStates.get(npcId) || null;
  }

  /**
   * Update NPC location
   */
  public updateNPCLocation(npcId: string, location: string): void {
    const state = this.npcStates.get(npcId);
    if (state) {
      state.location = location;
      state.lastAction = Date.now();
    }
  }

  /**
   * Get all NPC profiles
   */
  public getAllNPCs(): NPCAIProfile[] {
    return Array.from(this.npcProfiles.values());
  }

  /**
   * Enable/disable NPC AI
   */
  public setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }

  /**
   * Generate character storytelling responses when NPCs are asked about themselves or others
   */
  public async generateCharacterStory(
    npcId: string, 
    aboutCharacter: string, 
    context: NPCBehaviorContext,
    playerAction?: string
  ): Promise<NPCAction | null> {
    try {
      const npcProfile = this.npcProfiles.get(npcId);
      if (!npcProfile) return null;

      const prompt = this.buildCharacterStoryPrompt(npcProfile, aboutCharacter, context, playerAction);
      
      const response = await groqAI.generateAIResponse(
        prompt, 
        'character_storytelling', 
        context.gameState, 
        300
      );

      if (response) {
        const storyResponse: NPCAction = {
          type: 'dialogue',
          content: response,
          priority: 'high',
          shouldDisplay: true,
          metadata: {
            confidence: 0.9,
            reasoning: `Character story about ${aboutCharacter} from ${npcProfile.name}`,
            triggeredBy: 'character_inquiry'
          }
        };

        // Record AI usage
        aiUsageMonitor.recordAIUsage('npc_ai', {
          roomId: context.currentRoom.id,
          playerName: context.gameState.player.name || 'Player',
          gameTime: Date.now(),
          trigger: 'character_story_request'
        }, {
          content: response,
          confidence: 0.9,
          source: `${npcProfile.name}_about_${aboutCharacter}`,
          metadata: { npcId, aboutCharacter, playerAction }
        });

        return storyResponse;
      }
    } catch (error) {
      console.warn(`[NPC AI] Character story generation failed for ${npcId} about ${aboutCharacter}:`, error);
    }

    return null;
  }

  /**
   * Build character story prompt with relationship dynamics
   */
  private buildCharacterStoryPrompt(
    npcProfile: NPCAIProfile, 
    aboutCharacter: string, 
    context: NPCBehaviorContext,
    playerAction?: string
  ): string {
    const speakerName = npcProfile.name;
    const isSelfStory = aboutCharacter.toLowerCase() === npcProfile.npcId || aboutCharacter.toLowerCase() === npcProfile.name.toLowerCase();
    
    let prompt = `You are ${speakerName} in the Gorstan multiverse. `;

    // Add character-specific personality and context
    if (npcProfile.npcId === 'mrwendell') {
      prompt += `You are an ancient skin walker who has survived 4 multiverse resets. You speak with the weight of eons and dark humor. `;
      
      if (aboutCharacter.toLowerCase().includes('polly')) {
        prompt += `When discussing Polly, you know her true evil nature that even makes Morthos shudder. `;
        if (playerAction?.includes('killed') && playerAction?.includes('dominic')) {
          prompt += `The player has killed Dominic (the fish), and you find this amusing. You chuckle and warn them about Polly: "I'll leave you to Polly - if I'm lucky she may even let me watch" with dark amusement. `;
        }
      }
      
      if (aboutCharacter.toLowerCase().includes('dominic')) {
        prompt += `You know Dominic remembers things through the resets, unlike most others. You respect this ability. `;
      }
    }

    if (npcProfile.npcId === 'polly') {
      prompt += `You maintain a cheerful, helpful facade but hide your deeply evil nature. You're more evil than even Morthos the demon king. `;
      
      if (aboutCharacter.toLowerCase().includes('dominic')) {
        prompt += `You have particular animosity toward Dominic (the fish). Your cheerful mask slips slightly when discussing him. `;
      }
      
      if (aboutCharacter.toLowerCase().includes('morthos')) {
        prompt += `You mention casually that even Morthos finds you unsettling, but say it with a sweet smile. `;
      }
    }

    if (npcProfile.npcId === 'dominic') {
      prompt += `You are the mysterious fish entity who remembers everything through multiverse resets. You speak cryptically but helpfully. `;
      
      if (aboutCharacter.toLowerCase().includes('polly')) {
        prompt += `You remember Polly's true nature across resets and subtly warn about her danger without being direct. `;
      }
    }

    if (npcProfile.npcId === 'morthos') {
      prompt += `You are a demon king but bound by cosmic laws. You have authority but also cosmic responsibility. `;
      
      if (aboutCharacter.toLowerCase().includes('polly')) {
        prompt += `Polly genuinely makes you uncomfortable - her evil is deeper and more unsettling than demonic evil. You admit this reluctantly. `;
      }
    }

    // Add the actual story request
    if (isSelfStory) {
      prompt += `The player is asking about you. Tell them about yourself in character - your nature, role, and place in the multiverse. `;
    } else {
      prompt += `The player is asking about ${aboutCharacter}. Share what you know about them, including any warnings or observations. `;
    }

    prompt += `Keep response under 200 words, stay in character, and make it engaging. Include personality quirks and relationship dynamics.`;

    return prompt;
  }

  /**
   * Check if player has killed Dominic (for Mr. Wendell's special reaction)
   */
  public checkDominicKilled(gameState: LocalGameState): boolean {
    // This would need to be connected to actual game state tracking
    // For now, return false, but this should check game flags or death records
    return gameState.flags?.dominicKilled || false;
  }

  /**
   * Get character relationship warnings and dynamics
   */
  public getCharacterRelationships(npcId: string): string[] {
    const relationships: Record<string, string[]> = {
      'mrwendell': [
        'Finds Polly more dangerous than she appears',
        'Respects Dominic\'s reset memory abilities',
        'Has worked with Al across multiple reality iterations',
        'Knows the true history of all current entities'
      ],
      'polly': [
        'Hides true evil nature behind cheerful facade',
        'Makes even Morthos the demon king uncomfortable',
        'Particularly dislikes Dominic the fish',
        'More dangerous than she appears to newcomers'
      ],
      'dominic': [
        'Remembers everything through multiverse resets',
        'Wary of Polly\'s hidden evil nature',
        'Knows player actions from previous reset cycles',
        'Acts as mysterious but helpful guide'
      ],
      'morthos': [
        'Even he finds Polly unsettling',
        'Respects cosmic hierarchy and ancient entities',
        'Bound by creation laws despite demonic nature',
        'Acknowledges powers greater than his own'
      ],
      'al': [
        'Original guardian with authority from creation',
        'Supervises other AI entities like Albie',
        'Remembers working with Mr. Wendell across iterations',
        'Maintains fundamental multiverse stability'
      ]
    };

    return relationships[npcId] || [];
  }

  /**
   * Get NPC AI statistics
   */
  public getStats(): {
    totalNPCs: number;
    aiEnabledNPCs: number;
    wanderingNPCs: number;
    totalInteractions: number;
  } {
    const profiles = Array.from(this.npcProfiles.values());
    return {
      totalNPCs: profiles.length,
      aiEnabledNPCs: profiles.filter(p => Object.values(p.aiFeatures).some(f => f)).length,
      wanderingNPCs: profiles.filter(p => p.aiFeatures.wanderingAI).length,
      totalInteractions: profiles.reduce((sum, p) => sum + p.memory.playerInteractions, 0)
    };
  }
}

// Export singleton instance
export const npcAI = NPCAIController.getInstance();
