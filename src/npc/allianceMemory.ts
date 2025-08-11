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

// src/npc/allianceMemory.ts
// Alliance memory system for NPCs to remember cross-run alliances
// Step 5: Alliance Memory Model (Morthos & Al)

import { getGameState } from '../state/gameState';

/**
 * Types of alliance interactions that can be remembered
 */
export type AllianceInteractionType =
  | 'cooperation'     // Helped each other
  | 'betrayal'        // One betrayed the other
  | 'rescue'          // One rescued the other
  | 'sacrifice'       // One sacrificed for the other
  | 'shared-secret'   // Shared confidential information
  | 'mutual-support'  // Provided mutual support
  | 'conflict'        // Had a conflict
  | 'reconciliation'; // Made up after conflict

/**
 * Context for where an alliance event occurred
 */
export interface AllianceContext {
  location: string;
  gamePhase: string;
  otherNPCsPresent: string[];
  playerActions: string[];
  timeOfDay?: string;
  emotionalState?: 'positive' | 'negative' | 'neutral';
}

/**
 * A specific alliance event that occurred
 */
export interface AllianceEvent {
  id: string;
  runId: string; // Which run this happened in
  timestamp: number;
  type: AllianceInteractionType;
  npcA: string; // First NPC involved
  npcB: string; // Second NPC involved (often the player)
  context: AllianceContext;
  intensity: number; // 0-1, how significant this event was
  description: string; // Human-readable description
  consequences: string[]; // What this led to
}

/**
 * Alliance relationship summary between two entities
 */
export interface AllianceRelationship {
  npcA: string;
  npcB: string;
  overallTrustLevel: number; // -1 to 1, negative = distrust
  cooperationCount: number;
  betrayalCount: number;
  recentInteractionType: AllianceInteractionType | null;
  lastInteractionTimestamp: number;
  relationshipTrajectory: 'improving' | 'stable' | 'declining';
  significantEvents: AllianceEvent[]; // Most important events
  currentRunEvents: AllianceEvent[]; // Events from current run
}

/**
 * Conditions that can trigger alliance memory recall
 */
export interface MemoryTrigger {
  condition: 'location' | 'npc-present' | 'player-action' | 'keyword' | 'emotional-state';
  value: string;
  threshold?: number; // For relevance scoring
}

/**
 * A recalled memory that can influence current behavior
 */
export interface RecalledMemory {
  sourceEvent: AllianceEvent;
  relevanceScore: number; // 0-1, how relevant to current situation
  triggerReason: string;
  emotionalImpact: 'positive' | 'negative' | 'mixed' | 'neutral';
  suggestedDialogue?: string[];
  suggestedBehaviorChange?: string;
}

/**
 * Configuration for alliance memory system
 */
export interface AllianceMemoryConfig {
  maxEventsPerRelationship: number;
  memoryDecayRate: number; // How much older memories fade
  recallThreshold: number; // Minimum relevance to trigger recall
  trustUpdateRate: number; // How quickly trust levels change
  significanceThreshold: number; // Minimum intensity to store long-term
}

// Default configuration
const DEFAULT_MEMORY_CONFIG: AllianceMemoryConfig = {
  maxEventsPerRelationship: 20,
  memoryDecayRate: 0.05, // 5% decay per game session
  recallThreshold: 0.3,
  trustUpdateRate: 0.1,
  significanceThreshold: 0.6
};

/**
 * Main alliance memory system
 */
export class AllianceMemorySystem {
  private config: AllianceMemoryConfig;
  private relationships: Map<string, AllianceRelationship> = new Map();
  private allEvents: AllianceEvent[] = [];
  private currentRunId: string;

  constructor(config?: Partial<AllianceMemoryConfig>) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.currentRunId = this.generateRunId();
  }

  /**
   * Record a new alliance event
   */
  recordEvent(
    type: AllianceInteractionType,
    npcA: string,
    npcB: string,
    context: AllianceContext,
    intensity: number,
    description: string,
    consequences: string[] = []
  ): AllianceEvent {
    const event: AllianceEvent = {
      id: this.generateEventId(),
      runId: this.currentRunId,
      timestamp: Date.now(),
      type,
      npcA,
      npcB,
      context,
      intensity: Math.max(0, Math.min(1, intensity)),
      description,
      consequences
    };

    // Store the event
    this.allEvents.push(event);

    // Update the relationship
    this.updateRelationship(event);

    console.log(`[AllianceMemory] Recorded ${type} between ${npcA} and ${npcB} (intensity: ${intensity})`);

    return event;
  }

  /**
   * Update relationship based on new event
   */
  private updateRelationship(event: AllianceEvent): void {
    const relationshipKey = this.getRelationshipKey(event.npcA, event.npcB);
    let relationship = this.relationships.get(relationshipKey);

    if (!relationship) {
      relationship = {
        npcA: event.npcA,
        npcB: event.npcB,
        overallTrustLevel: 0,
        cooperationCount: 0,
        betrayalCount: 0,
        recentInteractionType: null,
        lastInteractionTimestamp: 0,
        relationshipTrajectory: 'stable',
        significantEvents: [],
        currentRunEvents: []
      };
    }

    // Update counters
    if (['cooperation', 'rescue', 'mutual-support', 'reconciliation'].includes(event.type)) {
      relationship.cooperationCount++;
    } else if (['betrayal', 'conflict'].includes(event.type)) {
      relationship.betrayalCount++;
    }

    // Update trust level
    const trustChange = this.calculateTrustChange(event);
    relationship.overallTrustLevel = Math.max(-1, Math.min(1, 
      relationship.overallTrustLevel + trustChange
    ));

    // Update recent interaction
    relationship.recentInteractionType = event.type;
    relationship.lastInteractionTimestamp = event.timestamp;

    // Add to current run events
    relationship.currentRunEvents.push(event);

    // Add to significant events if important enough
    if (event.intensity >= this.config.significanceThreshold) {
      relationship.significantEvents.push(event);
      
      // Keep only the most recent significant events
      if (relationship.significantEvents.length > this.config.maxEventsPerRelationship) {
        relationship.significantEvents = relationship.significantEvents
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.config.maxEventsPerRelationship);
      }
    }

    // Calculate trajectory
    relationship.relationshipTrajectory = this.calculateTrajectory(relationship);

    this.relationships.set(relationshipKey, relationship);
  }

  /**
   * Calculate how much an event should change trust
   */
  private calculateTrustChange(event: AllianceEvent): number {
    const baseChange = this.config.trustUpdateRate;
    const intensityMultiplier = event.intensity;
    
    let directionMultiplier = 1;
    switch (event.type) {
      case 'cooperation':
      case 'rescue':
      case 'mutual-support':
        directionMultiplier = 1;
        break;
      case 'betrayal':
        directionMultiplier = -2; // Betrayal hurts more than cooperation helps
        break;
      case 'conflict':
        directionMultiplier = -0.5;
        break;
      case 'reconciliation':
        directionMultiplier = 1.5; // Making up is powerful
        break;
      case 'sacrifice':
        directionMultiplier = 2; // Sacrifice is very meaningful
        break;
      default:
        directionMultiplier = 0.5;
    }

    return baseChange * intensityMultiplier * directionMultiplier;
  }

  /**
   * Calculate relationship trajectory
   */
  private calculateTrajectory(relationship: AllianceRelationship): 'improving' | 'stable' | 'declining' {
    const recentEvents = relationship.currentRunEvents.slice(-3); // Last 3 events
    
    if (recentEvents.length < 2) {
      return 'stable';
    }

    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const event of recentEvents) {
      if (['cooperation', 'rescue', 'mutual-support', 'reconciliation', 'sacrifice'].includes(event.type)) {
        positiveCount++;
      } else if (['betrayal', 'conflict'].includes(event.type)) {
        negativeCount++;
      }
    }

    if (positiveCount > negativeCount) {
      return 'improving';
    } else if (negativeCount > positiveCount) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Recall relevant memories based on current context
   */
  recallMemories(
    npcId: string,
    currentContext: Partial<AllianceContext>,
    triggers: MemoryTrigger[]
  ): RecalledMemory[] {
    const relevantEvents = this.findRelevantEvents(npcId, currentContext, triggers);
    const memories: RecalledMemory[] = [];

    for (const event of relevantEvents) {
      const relevanceScore = this.calculateRelevance(event, currentContext, triggers);
      
      if (relevanceScore >= this.config.recallThreshold) {
        const memory: RecalledMemory = {
          sourceEvent: event,
          relevanceScore,
          triggerReason: this.getTriggerReason(event, triggers),
          emotionalImpact: this.getEmotionalImpact(event),
          suggestedDialogue: this.generateDialogueSuggestions(event),
          suggestedBehaviorChange: this.generateBehaviorSuggestion(event)
        };
        
        memories.push(memory);
      }
    }

    // Sort by relevance and return top memories
    return memories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Return top 5 most relevant memories
  }

  /**
   * Find events potentially relevant to current context
   */
  private findRelevantEvents(
    npcId: string,
    currentContext: Partial<AllianceContext>,
    triggers: MemoryTrigger[]
  ): AllianceEvent[] {
    return this.allEvents.filter(event => {
      // Must involve the NPC
      if (event.npcA !== npcId && event.npcB !== npcId) {
        return false;
      }

      // Check trigger conditions
      for (const trigger of triggers) {
        if (this.eventMatchesTrigger(event, trigger)) {
          return true;
        }
      }

      // Check context similarity
      if (currentContext.location && event.context.location === currentContext.location) {
        return true;
      }

      return false;
    });
  }

  /**
   * Check if an event matches a memory trigger
   */
  private eventMatchesTrigger(event: AllianceEvent, trigger: MemoryTrigger): boolean {
    switch (trigger.condition) {
      case 'location':
        return event.context.location === trigger.value;
      case 'npc-present':
        return event.context.otherNPCsPresent.includes(trigger.value);
      case 'player-action':
        return event.context.playerActions.some(action => 
          action.toLowerCase().includes(trigger.value.toLowerCase())
        );
      case 'keyword':
        return event.description.toLowerCase().includes(trigger.value.toLowerCase());
      case 'emotional-state':
        return event.context.emotionalState === trigger.value;
      default:
        return false;
    }
  }

  /**
   * Calculate relevance score for an event
   */
  private calculateRelevance(
    event: AllianceEvent,
    currentContext: Partial<AllianceContext>,
    triggers: MemoryTrigger[]
  ): number {
    let score = 0;

    // Base intensity score
    score += event.intensity * 0.4;

    // Context similarity
    if (currentContext.location === event.context.location) {
      score += 0.3;
    }

    // Recent events are more relevant
    const daysSinceEvent = (Date.now() - event.timestamp) / (1000 * 60 * 60 * 24);
    const recencyBonus = Math.max(0, 0.3 - (daysSinceEvent * 0.01));
    score += recencyBonus;

    // Trigger matches
    for (const trigger of triggers) {
      if (this.eventMatchesTrigger(event, trigger)) {
        score += trigger.threshold || 0.2;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Get the reason why a memory was triggered
   */
  private getTriggerReason(event: AllianceEvent, triggers: MemoryTrigger[]): string {
    for (const trigger of triggers) {
      if (this.eventMatchesTrigger(event, trigger)) {
        return `${trigger.condition}: ${trigger.value}`;
      }
    }
    return 'context similarity';
  }

  /**
   * Determine emotional impact of recalled memory
   */
  private getEmotionalImpact(event: AllianceEvent): 'positive' | 'negative' | 'mixed' | 'neutral' {
    switch (event.type) {
      case 'cooperation':
      case 'rescue':
      case 'mutual-support':
      case 'sacrifice':
        return 'positive';
      case 'betrayal':
      case 'conflict':
        return 'negative';
      case 'reconciliation':
        return 'mixed'; // Complex emotions
      default:
        return 'neutral';
    }
  }

  /**
   * Generate dialogue suggestions based on memory
   */
  private generateDialogueSuggestions(event: AllianceEvent): string[] {
    const suggestions: string[] = [];
    
    switch (event.type) {
      case 'cooperation':
        suggestions.push(`Remember when we worked together in ${event.context.location}?`);
        suggestions.push("You've proven trustworthy before.");
        break;
      case 'betrayal':
        suggestions.push("Last time I trusted you, it didn't end well.");
        suggestions.push(`I haven't forgotten what happened in ${event.context.location}.`);
        break;
      case 'rescue':
        suggestions.push("You saved me before. I owe you.");
        suggestions.push("I remember your courage when I needed help.");
        break;
      case 'reconciliation':
        suggestions.push("We've had our differences, but we worked through them.");
        suggestions.push("Perhaps we can find common ground again.");
        break;
    }

    return suggestions;
  }

  /**
   * Generate behavior change suggestion
   */
  private generateBehaviorSuggestion(event: AllianceEvent): string {
    switch (event.type) {
      case 'cooperation':
      case 'rescue':
        return 'increase_cooperation_chance';
      case 'betrayal':
        return 'increase_suspicion';
      case 'mutual-support':
        return 'offer_help_first';
      case 'conflict':
        return 'be_more_cautious';
      case 'reconciliation':
        return 'attempt_diplomatic_approach';
      default:
        return 'maintain_current_stance';
    }
  }

  /**
   * Get relationship summary between two NPCs
   */
  getRelationship(npcA: string, npcB: string): AllianceRelationship | null {
    const key = this.getRelationshipKey(npcA, npcB);
    return this.relationships.get(key) || null;
  }

  /**
   * Get all relationships for a specific NPC
   */
  getNPCRelationships(npcId: string): AllianceRelationship[] {
    const results: AllianceRelationship[] = [];
    
    for (const relationship of this.relationships.values()) {
      if (relationship.npcA === npcId || relationship.npcB === npcId) {
        results.push(relationship);
      }
    }
    
    return results;
  }

  /**
   * Generate a unique relationship key
   */
  private getRelationshipKey(npcA: string, npcB: string): string {
    // Normalize order for consistent keys
    return npcA < npcB ? `${npcA}:${npcB}` : `${npcB}:${npcA}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique run ID
   */
  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start a new run (call this on game reset)
   */
  startNewRun(): void {
    // Clear current run events but keep long-term significant events
    for (const relationship of this.relationships.values()) {
      relationship.currentRunEvents = [];
    }
    
    this.currentRunId = this.generateRunId();
    console.log(`[AllianceMemory] Started new run: ${this.currentRunId}`);
  }

  /**
   * Export memory data for persistence
   */
  exportMemoryData(): any {
    return {
      relationships: Array.from(this.relationships.entries()),
      allEvents: this.allEvents,
      currentRunId: this.currentRunId,
      version: '1.0'
    };
  }

  /**
   * Import memory data from persistence
   */
  importMemoryData(data: any): void {
    if (data.version === '1.0') {
      this.relationships = new Map(data.relationships);
      this.allEvents = data.allEvents || [];
      this.currentRunId = data.currentRunId || this.generateRunId();
      
      console.log(`[AllianceMemory] Imported ${this.allEvents.length} events and ${this.relationships.size} relationships`);
    }
  }
}

// Global instance
let globalAllianceMemory: AllianceMemorySystem | null = null;

/**
 * Get the global alliance memory system
 */
export function getAllianceMemory(config?: Partial<AllianceMemoryConfig>): AllianceMemorySystem {
  if (!globalAllianceMemory) {
    globalAllianceMemory = new AllianceMemorySystem(config);
  }
  return globalAllianceMemory;
}

/**
 * Quick helper functions for common alliance events
 */

export function recordCooperation(npcA: string, npcB: string, location: string, description: string): AllianceEvent {
  return getAllianceMemory().recordEvent(
    'cooperation',
    npcA,
    npcB,
    { location, gamePhase: 'exploration', otherNPCsPresent: [], playerActions: [] },
    0.7,
    description
  );
}

export function recordBetrayal(npcA: string, npcB: string, location: string, description: string): AllianceEvent {
  return getAllianceMemory().recordEvent(
    'betrayal',
    npcA,
    npcB,
    { location, gamePhase: 'exploration', otherNPCsPresent: [], playerActions: [] },
    0.9, // Betrayals are very significant
    description
  );
}

export function recordRescue(rescuer: string, rescued: string, location: string, description: string): AllianceEvent {
  return getAllianceMemory().recordEvent(
    'rescue',
    rescuer,
    rescued,
    { location, gamePhase: 'exploration', otherNPCsPresent: [], playerActions: [] },
    0.8,
    description
  );
}
