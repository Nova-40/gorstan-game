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

// src/npc/controlRoomEncounter.ts
// Control Room encounter orchestrator using alliance memory
// Step 6: Control Room Encounter Orchestrator

import { getAllianceMemory, AllianceRelationship, RecalledMemory, MemoryTrigger } from './allianceMemory';
import { getGameState } from '../state/gameState';

/**
 * Types of Control Room encounters that can occur
 */
export type EncounterType = 
  | 'first-meeting'     // First time both NPCs meet in control room
  | 'reunion'           // Meeting again after previous alliance
  | 'confrontation'     // Meeting after betrayal or conflict
  | 'reconciliation'    // Attempting to make amends
  | 'mutual-recognition'// Both remember past cooperation
  | 'wary-alliance'     // Cautious cooperation despite past issues
  | 'trusted-partnership'; // Strong alliance based on history

/**
 * Dialogue options for an encounter
 */
export interface DialogueOption {
  speaker: 'morthos' | 'al' | 'system';
  text: string;
  emotionalTone: 'positive' | 'negative' | 'neutral' | 'mixed';
  references?: string; // What memory this references
  followUpOptions?: string[]; // Possible responses
}

/**
 * A complete Control Room encounter script
 */
export interface ControlRoomEncounter {
  id: string;
  type: EncounterType;
  triggerConditions: string[];
  requiredMemories: RecalledMemory[];
  participantRelationship: AllianceRelationship | null;
  dialogue: DialogueOption[];
  outcomes: EncounterOutcome[];
  trustImpact: number; // How this encounter affects trust (-1 to 1)
}

/**
 * Possible outcomes from an encounter
 */
export interface EncounterOutcome {
  type: 'alliance-formed' | 'alliance-broken' | 'trust-increased' | 'trust-decreased' | 'new-memory' | 'flag-set';
  description: string;
  gameStateChanges?: Record<string, any>;
  memoryToRecord?: {
    type: string;
    intensity: number;
    description: string;
  };
}

/**
 * Context for the Control Room encounter
 */
export interface ControlRoomContext {
  playerPresent: boolean;
  playerActions: string[];
  roomState: {
    terminalActive: boolean;
    securityLevel: 'low' | 'medium' | 'high';
    dataAccessed: string[];
  };
  timeOfDay: string;
  gamePhase: string;
}

/**
 * Configuration for Control Room encounters
 */
export interface ControlRoomConfig {
  memoryRecallThreshold: number;
  maxDialogueLines: number;
  enableEmergentBehavior: boolean; // Allow NPCs to create new dynamics
  respectPlayerPresence: boolean;  // Change behavior when player is watching
}

// Default configuration
const DEFAULT_CONTROL_ROOM_CONFIG: ControlRoomConfig = {
  memoryRecallThreshold: 0.4,
  maxDialogueLines: 8,
  enableEmergentBehavior: true,
  respectPlayerPresence: true
};

/**
 * Orchestrates meaningful encounters between Morthos and Al in the Control Room
 */
export class ControlRoomEncounterOrchestrator {
  private config: ControlRoomConfig;
  private encounterHistory: ControlRoomEncounter[] = [];
  
  constructor(config?: Partial<ControlRoomConfig>) {
    this.config = { ...DEFAULT_CONTROL_ROOM_CONFIG, ...config };
  }

  /**
   * Generate an encounter when both NPCs are in the Control Room
   */
  generateEncounter(context: ControlRoomContext): ControlRoomEncounter | null {
    const allianceMemory = getAllianceMemory();
    
    // Get relationship between Morthos and Al
    const relationship = allianceMemory.getRelationship('morthos', 'al');
    
    // Recall relevant memories for this context
    const memories = this.recallRelevantMemories(context);
    
    // Determine encounter type based on relationship and memories
    const encounterType = this.determineEncounterType(relationship, memories, context);
    
    // Generate the encounter
    const encounter = this.createEncounter(encounterType, relationship, memories, context);
    
    if (encounter) {
      this.encounterHistory.push(encounter);
      console.log(`[ControlRoom] Generated ${encounterType} encounter with ${encounter.dialogue.length} dialogue lines`);
    }
    
    return encounter;
  }

  /**
   * Recall memories relevant to the Control Room context
   */
  private recallRelevantMemories(context: ControlRoomContext): RecalledMemory[] {
    const allianceMemory = getAllianceMemory();
    
    const triggers: MemoryTrigger[] = [
      { condition: 'location', value: 'control-room', threshold: 0.5 },
      { condition: 'location', value: 'control-nexus', threshold: 0.4 },
      { condition: 'keyword', value: 'terminal', threshold: 0.3 },
      { condition: 'keyword', value: 'data', threshold: 0.3 }
    ];

    // Add player action triggers if player is present
    if (context.playerPresent) {
      for (const action of context.playerActions) {
        triggers.push({ condition: 'player-action', value: action, threshold: 0.4 });
      }
    }

    // Get memories for Morthos
    const morthosMemories = allianceMemory.recallMemories('morthos', {
      location: 'control-room',
      gamePhase: context.gamePhase,
      playerActions: context.playerActions
    }, triggers);

    // Get memories for Al  
    const alMemories = allianceMemory.recallMemories('al', {
      location: 'control-room',
      gamePhase: context.gamePhase,
      playerActions: context.playerActions
    }, triggers);

    // Combine and deduplicate
    const allMemories = [...morthosMemories, ...alMemories];
    const uniqueMemories = allMemories.filter((memory, index, self) => 
      index === self.findIndex(m => m.sourceEvent.id === memory.sourceEvent.id)
    );

    return uniqueMemories.filter(memory => 
      memory.relevanceScore >= this.config.memoryRecallThreshold
    );
  }

  /**
   * Determine what type of encounter should occur
   */
  private determineEncounterType(
    relationship: AllianceRelationship | null,
    memories: RecalledMemory[],
    context: ControlRoomContext
  ): EncounterType {
    // No previous relationship
    if (!relationship) {
      return 'first-meeting';
    }

    // Check trust level and recent interactions
    const trustLevel = relationship.overallTrustLevel;
    const recentInteraction = relationship.recentInteractionType;
    
    // High trust relationships
    if (trustLevel > 0.7) {
      return 'trusted-partnership';
    }
    
    // Moderate trust with positive trajectory
    if (trustLevel > 0.3 && relationship.relationshipTrajectory === 'improving') {
      return 'mutual-recognition';
    }
    
    // Recent betrayal or conflict
    if (recentInteraction === 'betrayal' || recentInteraction === 'conflict') {
      // Check if there have been attempts at reconciliation
      const hasReconciliation = memories.some(m => m.sourceEvent.type === 'reconciliation');
      if (hasReconciliation) {
        return 'wary-alliance';
      } else {
        return 'confrontation';
      }
    }
    
    // Declining relationship but not hostile
    if (trustLevel < 0 && trustLevel > -0.5) {
      return 'wary-alliance';
    }
    
    // Very low trust
    if (trustLevel <= -0.5) {
      return 'confrontation';
    }
    
    // Moderate positive relationship - reunion
    if (trustLevel > 0 && memories.length > 0) {
      return 'reunion';
    }
    
    // Default to first meeting if no clear pattern
    return 'first-meeting';
  }

  /**
   * Create the actual encounter based on type and context
   */
  private createEncounter(
    type: EncounterType,
    relationship: AllianceRelationship | null,
    memories: RecalledMemory[],
    context: ControlRoomContext
  ): ControlRoomEncounter {
    const encounterId = this.generateEncounterId();
    
    const encounter: ControlRoomEncounter = {
      id: encounterId,
      type,
      triggerConditions: this.getTriggerConditions(context),
      requiredMemories: memories,
      participantRelationship: relationship,
      dialogue: [],
      outcomes: [],
      trustImpact: 0
    };

    // Generate dialogue based on encounter type
    switch (type) {
      case 'first-meeting':
        this.generateFirstMeetingDialogue(encounter, context);
        break;
      case 'reunion':
        this.generateReunionDialogue(encounter, memories, context);
        break;
      case 'confrontation':
        this.generateConfrontationDialogue(encounter, memories, context);
        break;
      case 'reconciliation':
        this.generateReconciliationDialogue(encounter, memories, context);
        break;
      case 'mutual-recognition':
        this.generateMutualRecognitionDialogue(encounter, memories, context);
        break;
      case 'wary-alliance':
        this.generateWaryAllianceDialogue(encounter, memories, context);
        break;
      case 'trusted-partnership':
        this.generateTrustedPartnershipDialogue(encounter, memories, context);
        break;
    }

    // Generate outcomes based on dialogue and type
    this.generateEncounterOutcomes(encounter, context);

    return encounter;
  }

  /**
   * Generate dialogue for first meeting
   */
  private generateFirstMeetingDialogue(encounter: ControlRoomEncounter, context: ControlRoomContext): void {
    encounter.dialogue = [
      {
        speaker: 'morthos',
        text: "Al? I didn't expect to find you here in the Control Room.",
        emotionalTone: 'neutral'
      },
      {
        speaker: 'al',
        text: "Morthos. I could say the same. The terminal access logs show unusual activity.",
        emotionalTone: 'neutral'
      }
    ];

    if (context.playerPresent) {
      encounter.dialogue.push({
        speaker: 'morthos',
        text: "With our friend here, perhaps we can uncover what's been happening.",
        emotionalTone: 'positive'
      });
    } else {
      encounter.dialogue.push({
        speaker: 'al',
        text: "We should be careful. Someone has been accessing restricted data.",
        emotionalTone: 'neutral'
      });
    }

    encounter.trustImpact = 0.1; // Small positive impact for civil first meeting
  }

  /**
   * Generate dialogue for reunion based on positive memories
   */
  private generateReunionDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    const mostRelevantMemory = memories[0];
    
    encounter.dialogue = [
      {
        speaker: 'al',
        text: `Morthos! It's good to see you again.`,
        emotionalTone: 'positive'
      },
      {
        speaker: 'morthos',
        text: `Likewise, Al. I've been thinking about our last collaboration.`,
        emotionalTone: 'positive',
        references: mostRelevantMemory?.sourceEvent.id
      }
    ];

    if (mostRelevantMemory) {
      const memoryDialogue = this.generateMemoryBasedDialogue(mostRelevantMemory);
      encounter.dialogue.push(...memoryDialogue);
    }

    encounter.dialogue.push({
      speaker: 'al',
      text: "Perhaps we can work together again here in the Control Room.",
      emotionalTone: 'positive'
    });

    encounter.trustImpact = 0.2;
  }

  /**
   * Generate dialogue for confrontation based on negative memories
   */
  private generateConfrontationDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    const betrayalMemory = memories.find(m => m.sourceEvent.type === 'betrayal');
    
    encounter.dialogue = [
      {
        speaker: 'morthos',
        text: "Al. I wasn't sure I'd see you again after what happened.",
        emotionalTone: 'negative'
      },
      {
        speaker: 'al',
        text: "Morthos. I suppose we need to address the past before we can move forward.",
        emotionalTone: 'mixed'
      }
    ];

    if (betrayalMemory) {
      encounter.dialogue.push({
        speaker: 'morthos',
        text: `I haven't forgotten what happened in ${betrayalMemory.sourceEvent.context.location}.`,
        emotionalTone: 'negative',
        references: betrayalMemory.sourceEvent.id
      });
      
      encounter.dialogue.push({
        speaker: 'al',
        text: "I had my reasons. But perhaps this isn't the time or place.",
        emotionalTone: 'mixed'
      });
    }

    if (context.playerPresent) {
      encounter.dialogue.push({
        speaker: 'system',
        text: "The tension in the room is palpable. Both NPCs seem wary of each other.",
        emotionalTone: 'neutral'
      });
    }

    encounter.trustImpact = -0.1;
  }

  /**
   * Generate dialogue for trusted partnership
   */
  private generateTrustedPartnershipDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    encounter.dialogue = [
      {
        speaker: 'al',
        text: "Morthos, my friend. Ready to tackle another challenge together?",
        emotionalTone: 'positive'
      },
      {
        speaker: 'morthos',
        text: "Always, Al. Your technical expertise and my... unique perspective make a formidable team.",
        emotionalTone: 'positive'
      }
    ];

    const cooperationMemories = memories.filter(m => 
      ['cooperation', 'mutual-support', 'rescue'].includes(m.sourceEvent.type)
    );

    if (cooperationMemories.length > 0) {
      encounter.dialogue.push({
        speaker: 'al',
        text: "We've overcome so much together. I trust your judgment completely.",
        emotionalTone: 'positive',
        references: cooperationMemories[0].sourceEvent.id
      });
    }

    if (context.roomState.terminalActive) {
      encounter.dialogue.push({
        speaker: 'morthos',
        text: "The terminal is active. Shall we see what secrets it holds?",
        emotionalTone: 'positive'
      });
    }

    encounter.trustImpact = 0.3;
  }

  /**
   * Generate dialogue for mutual recognition
   */
  private generateMutualRecognitionDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    encounter.dialogue = [
      {
        speaker: 'morthos',
        text: "Al, it's been a while. I remember our work together fondly.",
        emotionalTone: 'positive'
      },
      {
        speaker: 'al',
        text: "As do I, Morthos. You proved to be a reliable ally.",
        emotionalTone: 'positive'
      }
    ];

    // Reference specific positive memories
    const positiveMemories = memories.filter(m => m.emotionalImpact === 'positive');
    if (positiveMemories.length > 0) {
      const memory = positiveMemories[0];
      encounter.dialogue.push({
        speaker: 'al',
        text: `I particularly remember ${memory.sourceEvent.description.toLowerCase()}.`,
        emotionalTone: 'positive',
        references: memory.sourceEvent.id
      });
    }

    encounter.dialogue.push({
      speaker: 'morthos',
      text: "Perhaps we can build on that foundation here.",
      emotionalTone: 'positive'
    });

    encounter.trustImpact = 0.25;
  }

  /**
   * Generate dialogue for wary alliance
   */
  private generateWaryAllianceDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    encounter.dialogue = [
      {
        speaker: 'al',
        text: "Morthos. I suppose circumstances bring us together again.",
        emotionalTone: 'neutral'
      },
      {
        speaker: 'morthos',
        text: "Indeed. Our past has been... complicated.",
        emotionalTone: 'mixed'
      }
    ];

    const conflictMemory = memories.find(m => 
      ['betrayal', 'conflict'].includes(m.sourceEvent.type)
    );

    if (conflictMemory) {
      encounter.dialogue.push({
        speaker: 'al',
        text: "I know we've had our differences, but perhaps we can set them aside for now.",
        emotionalTone: 'mixed',
        references: conflictMemory.sourceEvent.id
      });
    }

    encounter.dialogue.push({
      speaker: 'morthos',
      text: "A temporary truce, then. For mutual benefit.",
      emotionalTone: 'neutral'
    });

    if (context.playerPresent) {
      encounter.dialogue.push({
        speaker: 'al',
        text: "With a witness present, I suppose we should maintain civility.",
        emotionalTone: 'neutral'
      });
    }

    encounter.trustImpact = 0.05; // Very small positive impact
  }

  /**
   * Generate reconciliation dialogue
   */
  private generateReconciliationDialogue(encounter: ControlRoomEncounter, memories: RecalledMemory[], context: ControlRoomContext): void {
    encounter.dialogue = [
      {
        speaker: 'morthos',
        text: "Al, I've been thinking about our past conflicts.",
        emotionalTone: 'mixed'
      },
      {
        speaker: 'al',
        text: "As have I, Morthos. Perhaps it's time we addressed them directly.",
        emotionalTone: 'mixed'
      },
      {
        speaker: 'morthos',
        text: "I may have been too quick to judge. Your actions, while unexpected, had merit.",
        emotionalTone: 'positive'
      },
      {
        speaker: 'al',
        text: "And I could have been more transparent about my intentions. Shall we try again?",
        emotionalTone: 'positive'
      }
    ];

    encounter.trustImpact = 0.4; // Reconciliation has high impact
  }

  /**
   * Generate dialogue based on specific memories
   */
  private generateMemoryBasedDialogue(memory: RecalledMemory): DialogueOption[] {
    const dialogue: DialogueOption[] = [];
    
    if (memory.suggestedDialogue && memory.suggestedDialogue.length > 0) {
      dialogue.push({
        speaker: 'morthos',
        text: memory.suggestedDialogue[0],
        emotionalTone: memory.emotionalImpact,
        references: memory.sourceEvent.id
      });
      
      if (memory.suggestedDialogue.length > 1) {
        dialogue.push({
          speaker: 'al',
          text: memory.suggestedDialogue[1],
          emotionalTone: memory.emotionalImpact,
          references: memory.sourceEvent.id
        });
      }
    }
    
    return dialogue;
  }

  /**
   * Generate outcomes based on the encounter
   */
  private generateEncounterOutcomes(encounter: ControlRoomEncounter, context: ControlRoomContext): void {
    // Trust impact outcome
    if (encounter.trustImpact > 0) {
      encounter.outcomes.push({
        type: 'trust-increased',
        description: `Trust between Morthos and Al increased by ${encounter.trustImpact.toFixed(2)}`
      });
    } else if (encounter.trustImpact < 0) {
      encounter.outcomes.push({
        type: 'trust-decreased',
        description: `Trust between Morthos and Al decreased by ${Math.abs(encounter.trustImpact).toFixed(2)}`
      });
    }

    // Record this encounter as a memory
    encounter.outcomes.push({
      type: 'new-memory',
      description: `Control Room encounter of type ${encounter.type}`,
      memoryToRecord: {
        type: 'shared-secret',
        intensity: Math.min(0.8, 0.5 + Math.abs(encounter.trustImpact)),
        description: `Morthos and Al had a ${encounter.type.replace('-', ' ')} in the Control Room`
      }
    });

    // Type-specific outcomes
    switch (encounter.type) {
      case 'trusted-partnership':
        encounter.outcomes.push({
          type: 'alliance-formed',
          description: 'Strong alliance confirmed between Morthos and Al',
          gameStateChanges: { 'morthos-al-alliance': 'strong' }
        });
        break;
      case 'confrontation':
        encounter.outcomes.push({
          type: 'flag-set',
          description: 'Tension flag set between Morthos and Al',
          gameStateChanges: { 'morthos-al-tension': true }
        });
        break;
      case 'reconciliation':
        encounter.outcomes.push({
          type: 'alliance-formed',
          description: 'Reconciliation achieved between Morthos and Al',
          gameStateChanges: { 'morthos-al-reconciled': true }
        });
        break;
    }
  }

  /**
   * Apply encounter outcomes to the game state
   */
  applyEncounterOutcomes(encounter: ControlRoomEncounter): void {
    const allianceMemory = getAllianceMemory();
    
    for (const outcome of encounter.outcomes) {
      switch (outcome.type) {
        case 'new-memory':
          if (outcome.memoryToRecord) {
            allianceMemory.recordEvent(
              outcome.memoryToRecord.type as any,
              'morthos',
              'al',
              {
                location: 'control-room',
                gamePhase: 'exploration',
                otherNPCsPresent: [],
                playerActions: []
              },
              outcome.memoryToRecord.intensity,
              outcome.memoryToRecord.description
            );
          }
          break;
        case 'alliance-formed':
        case 'alliance-broken':
        case 'trust-increased':
        case 'trust-decreased':
        case 'flag-set':
          // Apply game state changes
          if (outcome.gameStateChanges) {
            const gameState = getGameState();
            if (gameState && gameState.flags) {
              Object.assign(gameState.flags, outcome.gameStateChanges);
            } else {
              console.warn('Could not apply game state changes - game state not available');
            }
          }
          break;
      }
      
      console.log(`[ControlRoom] Applied outcome: ${outcome.description}`);
    }
  }

  /**
   * Get trigger conditions for the encounter
   */
  private getTriggerConditions(context: ControlRoomContext): string[] {
    const conditions = ['both-npcs-in-control-room'];
    
    if (context.playerPresent) conditions.push('player-present');
    if (context.roomState.terminalActive) conditions.push('terminal-active');
    if (context.roomState.securityLevel === 'high') conditions.push('high-security');
    
    return conditions;
  }

  /**
   * Generate unique encounter ID
   */
  private generateEncounterId(): string {
    return `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get encounter history
   */
  getEncounterHistory(): ControlRoomEncounter[] {
    return [...this.encounterHistory];
  }

  /**
   * Clear encounter history (for new game runs)
   */
  clearEncounterHistory(): void {
    this.encounterHistory = [];
    console.log('[ControlRoom] Encounter history cleared');
  }
}

// Global instance
let globalOrchestrator: ControlRoomEncounterOrchestrator | null = null;

/**
 * Get the global Control Room encounter orchestrator
 */
export function getControlRoomOrchestrator(config?: Partial<ControlRoomConfig>): ControlRoomEncounterOrchestrator {
  if (!globalOrchestrator) {
    globalOrchestrator = new ControlRoomEncounterOrchestrator(config);
  }
  return globalOrchestrator;
}

/**
 * Quick function to trigger an encounter when both NPCs are present
 */
export function triggerControlRoomEncounter(context: ControlRoomContext): ControlRoomEncounter | null {
  const orchestrator = getControlRoomOrchestrator();
  const encounter = orchestrator.generateEncounter(context);
  
  if (encounter) {
    orchestrator.applyEncounterOutcomes(encounter);
  }
  
  return encounter;
}
