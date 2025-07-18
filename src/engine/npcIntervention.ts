// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: npcIntervention.ts
// Path: src/engine/npcIntervention.ts

// Define PlayerState locally because it is not exported from './GameEngine'
export interface PlayerState {
  traits?: string[];
  inventory?: string[];
  npcRelationships?: Record<string, number>;
  reputation?: Record<string, number>;
  flags?: Record<string, unknown>;
}

/**
 * Type definitions for NPC intervention system
 */
export interface InterventionContext {
  npcsInRoom: string[];
  flags: Record<string, unknown>;
  currentRoom?: string;
  playerState?: PlayerState;
  appendMessage: (msg: string, type?: string) => void;
  timestamp?: number;
  roomHistory?: string[];
}

export interface InterventionRule {
  id: string;
  interventionNPC: string;
  targetNPCs: string[];
  conditions?: (context: InterventionContext) => boolean;
  priority: number;
  cooldown?: number;
  maxOccurrences?: number;
  messages: {
    intervention: string;
    suppressed: string[];
    success?: string;
    failure?: string;
  };
  requiredFlags?: string[];
  blockedFlags?: string[];
  requiredTraits?: string[];
  requiredItems?: string[];
  minReputation?: number;
  roomRestrictions?: string[];
  timeRestrictions?: {
    minInterval?: number;
    maxPerHour?: number;
  };
}

export interface InterventionResult {
  occurred: boolean;
  interventionNPC?: string;
  suppressedNPCs: string[];
  messages: string[];
  effectDuration?: number;
  ruleId?: string;
  timestamp: number;
}

export interface InterventionHistory {
  count: number;
  lastOccurrence: number;
  cooldownUntil: number;
  hourlyCount: number;
  lastHourReset: number;
}

/**
 * Track intervention history to prevent spam with enhanced tracking
 */
const interventionHistory: Map<string, InterventionHistory> = new Map();

/**
 * Track recent interventions for better pattern analysis
 */
const recentInterventions: Array<{
  ruleId: string;
  timestamp: number;
  context: string;
}> = [];

/**
 * Maximum history entries to prevent memory bloat
 */

/**
 * Utility functions for safer condition checking
 */
    } catch (error) {
      console.error(`[NPCIntervention] Error checking flag ${flagName}:`, error);
      return false;
    }
  },

  /**
   * Safely check if player has a trait
   */
  hasTrait: (playerState: PlayerState | undefined, traitName: string): boolean => {
    try {
      return Boolean(playerState?.traits?.includes(traitName));
    } catch (error) {
      console.error(`[NPCIntervention] Error checking trait ${traitName}:`, error);
      return false;
    }
  },

  /**
   * Safely check if player has an item
   */
  hasItem: (playerState: PlayerState | undefined, itemName: string): boolean => {
    try {
      return Boolean(playerState?.inventory?.includes(itemName));
    } catch (error) {
      console.error(`[NPCIntervention] Error checking item ${itemName}:`, error);
      return false;
    }
  },

  /**
   * Safely check room location
   */
  inRoom: (currentRoom: string | undefined, roomPattern: string): boolean => {
    try {
      return Boolean(currentRoom && 
        currentRoom.toLowerCase().includes(roomPattern.toLowerCase()));
    } catch (error) {
      console.error(`[NPCIntervention] Error checking room ${roomPattern}:`, error);
      return false;
    }
  },

  /**
   * Safely check NPC presence
   */
  hasNPC: (npcsInRoom: string[], npcName: string): boolean => {
    try {
      return npcsInRoom.some(npc => 
        npc.toLowerCase().trim() === npcName.toLowerCase().trim()
      );
    } catch (error) {
      console.error(`[NPCIntervention] Error checking NPC ${npcName}:`, error);
      return false;
    }
  },

  /**
   * Safely get player reputation
   */
  getReputation: (playerState: PlayerState | undefined): number => {
    try {
      if (!playerState) return 0;
      
      // Check npcRelationships (new format)
      if (playerState.npcRelationships) {
                if (reputationValues.length > 0) {
          return Math.max(...reputationValues);
        }
      }
      
      // Check legacy reputation format
      if (playerState.reputation) {
                if (reputationValues.length > 0) {
          return Math.max(...reputationValues);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('[NPCIntervention] Error getting reputation:', error);
      return 0;
    }
  }
};

/**
 * Predefined intervention rules with enhanced and fixed conditions
 */
const interventionRules: InterventionRule[] = [
  {
    id: 'albie_peacekeeper',
    interventionNPC: 'albie',
    targetNPCs: ['mr wendell', 'morthos', 'polly', 'dominic'],
    conditions: (context: InterventionContext) => {
      try {
        // Albie intervenes when:
        // 1. There's tension (conflict flags)
        // 2. Multiple NPCs are present for potential conflict
        // 3. No recent peace-keeping occurred
        return (
          ConditionHelpers.hasFlag(context.flags, 'tension_rising') ||
          ConditionHelpers.hasFlag(context.flags, 'argument_detected') ||
          ConditionHelpers.hasFlag(context.flags, 'violence_threatened') ||
          context.npcsInRoom.length >= 3 // Multiple NPCs = potential conflict
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in albie_peacekeeper condition:', error);
        return false;
      }
    },
    priority: 10,
    cooldown: 30000, // 30 seconds
    maxOccurrences: 3,
    timeRestrictions: {
      maxPerHour: 5
    },
    messages: {
      intervention: "Albie steps in: 'Let's all remain civil, shall we?'",
      suppressed: [
        "nods and steps back reluctantly.",
        "grumbles but complies with Albie's request.",
        "looks annoyed but respects Albie's authority.",
        "maintains composure under Albie's watchful eye."
      ],
      success: "The tension in the room dissipates under Albie's authority.",
      failure: "Albie's intervention seems to have little effect."
    }
  },
  {
    id: 'ayla_scholar_mediation',
    interventionNPC: 'ayla',
    targetNPCs: ['morthos', 'mr wendell'],
    conditions: (context: InterventionContext) => {
      try {
        // Ayla intervenes when:
        // 1. In academic/library settings
        // 2. During scholarly discussions
        // 3. Player shows scholarly traits
        // 4. Intellectual conflict is detected
        return (
          ConditionHelpers.inRoom(context.currentRoom, 'library') ||
          ConditionHelpers.inRoom(context.currentRoom, 'study') ||
          ConditionHelpers.inRoom(context.currentRoom, 'academy') ||
          ConditionHelpers.hasFlag(context.flags, 'scholarly_discussion') ||
          ConditionHelpers.hasFlag(context.flags, 'intellectual_debate') ||
          ConditionHelpers.hasTrait(context.playerState, 'scholar') ||
          ConditionHelpers.hasTrait(context.playerState, 'intellectual') ||
          ConditionHelpers.hasFlag(context.flags, 'knowledge_disputed')
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in ayla_scholar_mediation condition:', error);
        return false;
      }
    },
    priority: 8,
    cooldown: 45000,
    messages: {
      intervention: "Ayla raises her hand: 'Perhaps we should approach this with scholarly discourse.'",
      suppressed: [
        "considers Ayla's words and moderates their tone.",
        "respects Ayla's wisdom and steps back.",
        "acknowledges the merit in Ayla's suggestion.",
        "adopts a more academic approach to the discussion."
      ],
      success: "The discussion becomes more academic and less heated.",
      failure: "The scholarly approach doesn't seem to resonate."
    }
  },
  {
    id: 'al_earth_calming',
    interventionNPC: 'al',
    targetNPCs: ['morthos', 'polly', 'dominic'],
    conditions: (context: InterventionContext) => {
      try {
        // Al intervenes when:
        // 1. In natural settings
        // 2. Player has nature connection
        // 3. Emotional tension needs grounding
        // 4. Environmental harmony is disrupted
        return (
          ConditionHelpers.hasTrait(context.playerState, 'nature_lover') ||
          ConditionHelpers.hasTrait(context.playerState, 'druid') ||
          ConditionHelpers.hasTrait(context.playerState, 'earth_connected') ||
          ConditionHelpers.hasFlag(context.flags, 'earth_connection') ||
          ConditionHelpers.hasFlag(context.flags, 'natural_harmony') ||
          ConditionHelpers.inRoom(context.currentRoom, 'grove') ||
          ConditionHelpers.inRoom(context.currentRoom, 'garden') ||
          ConditionHelpers.inRoom(context.currentRoom, 'forest') ||
          ConditionHelpers.inRoom(context.currentRoom, 'meadow') ||
          ConditionHelpers.hasFlag(context.flags, 'emotional_turmoil')
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in al_earth_calming condition:', error);
        return false;
      }
    },
    priority: 7,
    cooldown: 60000,
    messages: {
      intervention: "Al hums softly: 'The earth calls for harmony, friends.'",
      suppressed: [
        "feels the earth's calming influence and relaxes.",
        "is soothed by Al's earthbound presence.",
        "connects with the natural harmony Al represents.",
        "takes a deep breath and finds inner peace."
      ],
      success: "A sense of natural calm settles over the group.",
      failure: "The natural harmony doesn't quite take hold."
    }
  },
  {
    id: 'player_reputation_intervention',
    interventionNPC: 'player',
    targetNPCs: ['morthos', 'mr wendell', 'polly'],
    conditions: (context: InterventionContext) => {
      try {
        // Player intervenes when:
        // 1. Has high reputation with NPCs
        // 2. Has leadership traits
        // 3. Has achieved hero status
        // 4. Has proven themselves worthy of respect
                
        return (
          reputation >= 15 ||
          ConditionHelpers.hasTrait(context.playerState, 'respected') ||
          ConditionHelpers.hasTrait(context.playerState, 'leader') ||
          ConditionHelpers.hasTrait(context.playerState, 'hero') ||
          ConditionHelpers.hasTrait(context.playerState, 'charismatic') ||
          ConditionHelpers.hasFlag(context.flags, 'hero_status') ||
          ConditionHelpers.hasFlag(context.flags, 'respected_leader') ||
          ConditionHelpers.hasFlag(context.flags, 'proven_worthy')
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in player_reputation_intervention condition:', error);
        return false;
      }
    },
    priority: 5,
    minReputation: 15,
    messages: {
      intervention: "Your reputation precedes you, and the NPCs show you respect.",
      suppressed: [
        "acknowledges your standing and moderates their behavior.",
        "shows deference to your established reputation.",
        "respects your proven worth and steps back.",
        "recognizes your authority and complies."
      ],
      success: "Your influence brings calm to the situation.",
      failure: "Despite your reputation, tensions remain high."
    }
  },
  {
    id: 'polly_dominic_protection',
    interventionNPC: 'polly',
    targetNPCs: ['morthos', 'mr wendell', 'player'],
    conditions: (context: InterventionContext) => {
      try {
        // Polly intervenes when:
        // 1. Dominic is present and threatened
        // 2. Violence is threatened against anyone she cares about
        // 3. Dominic is in danger
        // 4. She detects hostility toward Dominic
        return (
          ConditionHelpers.hasNPC(context.npcsInRoom, 'dominic') &&
          (
            ConditionHelpers.hasFlag(context.flags, 'dominic_threatened') ||
            ConditionHelpers.hasFlag(context.flags, 'violence_threatened') ||
            ConditionHelpers.hasFlag(context.flags, 'dominic_in_danger') ||
            ConditionHelpers.hasFlag(context.flags, 'hostility_detected') ||
            ConditionHelpers.hasFlag(context.flags, 'protective_instinct')
          )
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in polly_dominic_protection condition:', error);
        return false;
      }
    },
    priority: 9, // High priority when protecting Dominic
    cooldown: 20000,
    maxOccurrences: 5,
    blockedFlags: ['polly_defeated', 'polly_incapacitated'],
    messages: {
      intervention: "Polly steps protectively in front of Dominic: 'Don't you dare!'",
      suppressed: [
        "backs away from Polly's fierce protection.",
        "recognizes Polly's determination and retreats.",
        "respects the bond between Polly and Dominic.",
        "is intimidated by Polly's protective stance."
      ],
      success: "Polly's protective stance successfully defuses the threat.",
      failure: "Polly's intervention only increases the tension."
    }
  },
  {
    id: 'wendell_authority_assertion',
    interventionNPC: 'mr wendell',
    targetNPCs: ['morthos', 'polly', 'player'],
    conditions: (context: InterventionContext) => {
      try {
        // Wendell intervenes when:
        // 1. His authority has been challenged
        // 2. Academic protocol is being violated
        // 3. He feels disrespected
        // 4. Player failed his tests but hasn't been forgiven
        return (
          ConditionHelpers.hasFlag(context.flags, 'disrespected_wendell') ||
          ConditionHelpers.hasFlag(context.flags, 'academic_protocol_violated') ||
          ConditionHelpers.hasFlag(context.flags, 'authority_challenged') ||
          ConditionHelpers.hasFlag(context.flags, 'wendell_offended') ||
          (
            ConditionHelpers.hasFlag(context.flags, 'wendell_riddle_failed') &&
            !ConditionHelpers.hasFlag(context.flags, 'wendell_forgiveness')
          )
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in wendell_authority_assertion condition:', error);
        return false;
      }
    },
    priority: 6,
    cooldown: 40000,
    maxOccurrences: 2,
    blockedFlags: ['wendell_humbled', 'wendell_defeated'],
    messages: {
      intervention: "Mr Wendell draws himself up imperiously: 'I will not tolerate such insubordination!'",
      suppressed: [
        "grudgingly acknowledges Wendell's authority.",
        "shows reluctant respect for Wendell's position.",
        "defers to Wendell's academic standing.",
        "is cowed by Wendell's imperious manner."
      ],
      success: "Wendell's authority brings order to the situation.",
      failure: "Wendell's pompous display falls flat."
    }
  },
  {
    id: 'morthos_cynical_observation',
    interventionNPC: 'morthos',
    targetNPCs: ['ayla', 'mr wendell', 'polly'],
    conditions: (context: InterventionContext) => {
      try {
        // Morthos intervenes when:
        // 1. Philosophical discussions are happening
        // 2. Hope or optimism is being expressed
        // 3. Player shows optimistic traits
        // 4. Idealistic concepts are being discussed
        // 5. Reality needs a cynical perspective
        return (
          ConditionHelpers.hasFlag(context.flags, 'philosophical_discussion') ||
          ConditionHelpers.hasFlag(context.flags, 'hope_expressed') ||
          ConditionHelpers.hasFlag(context.flags, 'optimism_displayed') ||
          ConditionHelpers.hasFlag(context.flags, 'idealistic_speech') ||
          ConditionHelpers.hasFlag(context.flags, 'naive_belief') ||
          ConditionHelpers.hasTrait(context.playerState, 'optimistic') ||
          ConditionHelpers.hasTrait(context.playerState, 'idealistic') ||
          ConditionHelpers.hasTrait(context.playerState, 'hopeful') ||
          ConditionHelpers.hasFlag(context.flags, 'reality_check_needed')
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in morthos_cynical_observation condition:', error);
        return false;
      }
    },
    priority: 4,
    cooldown: 50000,
    messages: {
      intervention: "Morthos interjects with dark wisdom: 'How... optimistic. Reality has a way of correcting such notions.'",
      suppressed: [
        "considers Morthos's cynical perspective soberly.",
        "is given pause by Morthos's dark wisdom.",
        "reluctantly acknowledges the truth in Morthos's words.",
        "finds their optimism tempered by harsh reality."
      ],
      success: "Morthos's grim reality check tempers the discussion.",
      failure: "Morthos's cynicism is dismissed as mere pessimism."
    }
  },
  {
    id: 'dominic_innocent_defusion',
    interventionNPC: 'dominic',
    targetNPCs: ['morthos', 'mr wendell', 'polly'],
    conditions: (context: InterventionContext) => {
      try {
        // Dominic intervenes when:
        // 1. Tension is rising but not violent
        // 2. His innocent nature can defuse the situation
        // 3. People are arguing about him
        // 4. Simple questions can redirect conflict
        return (
          ConditionHelpers.hasFlag(context.flags, 'tension_rising') &&
          !ConditionHelpers.hasFlag(context.flags, 'violence_threatened') &&
          !ConditionHelpers.hasFlag(context.flags, 'dominic_scared') &&
          (
            ConditionHelpers.hasFlag(context.flags, 'argument_about_dominic') ||
            ConditionHelpers.hasFlag(context.flags, 'mild_disagreement') ||
            ConditionHelpers.hasFlag(context.flags, 'confusion_detected')
          )
        );
      } catch (error) {
        console.error('[NPCIntervention] Error in dominic_innocent_defusion condition:', error);
        return false;
      }
    },
    priority: 3,
    cooldown: 25000,
    maxOccurrences: 4,
    blockedFlags: ['dominic_scared', 'dominic_upset'],
    messages: {
      intervention: "Dominic asks innocently: 'Are we playing a game? Can I play too?'",
      suppressed: [
        "is disarmed by Dominic's innocent question.",
        "can't help but smile at Dominic's childlike wonder.",
        "finds their anger melting away at Dominic's innocence.",
        "is reminded of what's truly important by Dominic's presence."
      ],
      success: "Dominic's innocent charm defuses the tension naturally.",
      failure: "Even Dominic's innocence can't lighten the mood."
    }
  }
];

/**
 * Main intervention check function - enhanced version of checkAlbieIntervention
 */
export function checkAlbieIntervention(
  npcsInRoom: string[],
  flags: Record<string, unknown>,
  appendMessage: (msg: string) => void
): boolean {
  try {
    if (!validateBasicParameters(npcsInRoom, flags, appendMessage)) {
      return false;
    }

    const context: InterventionContext = {
      npcsInRoom: [...npcsInRoom], // Create copy to prevent mutation
      flags: { ...flags }, // Create copy to prevent mutation
      appendMessage,
      timestamp: Date.now()
    };

        return result.occurred;
  } catch (error) {
    console.error('[NPCIntervention] Error in checkAlbieIntervention:', error);
    return false;
  }
}

/**
 * Comprehensive NPC intervention system with enhanced logic
 */
export function checkNPCInterventions(context: InterventionContext): InterventionResult {
  try {
    if (!validateInterventionContext(context)) {
      return createEmptyResult();
    }

    if (availableRules.length === 0) {
      return createEmptyResult();
    }

    // Sort by priority (higher = more important)
    availableRules.sort((a, b) => b.priority - a.priority);

    for (const rule of availableRules) {
      try {
        if (canTriggerIntervention(rule, context)) {
                    
          if (suppressedNPCs.length > 0) {
            // Check additional conditions with enhanced error handling
            if (rule.conditions) {
              try {
                if (!rule.conditions(context)) {
                  continue;
                }
              } catch (conditionError) {
                console.error(`[NPCIntervention] Error in condition for rule ${rule.id}:`, conditionError);
                continue;
              }
            }

            return executeIntervention(rule, suppressedNPCs, context);
          }
        }
      } catch (ruleError) {
        console.error(`[NPCIntervention] Error processing rule ${rule.id}:`, ruleError);
        continue;
      }
    }

    return createEmptyResult();
  } catch (error) {
    console.error('[NPCIntervention] Error in checkNPCInterventions:', error);
    return createEmptyResult();
  }
}

/**
 * Validate basic parameters
 */
function validateBasicParameters(
  npcsInRoom: unknown,
  flags: unknown,
  appendMessage: unknown
): boolean {
  return Array.isArray(npcsInRoom) &&
         npcsInRoom.length > 0 &&
         typeof flags === 'object' &&
         flags !== null &&
         typeof appendMessage === 'function';
}

/**
 * Validate intervention context
 */
function validateInterventionContext(context: InterventionContext): boolean {
  try {
    return context &&
           Array.isArray(context.npcsInRoom) &&
           context.npcsInRoom.length > 0 &&
           typeof context.flags === 'object' &&
           context.flags !== null &&
           typeof context.appendMessage === 'function';
  } catch (error) {
    console.error('[NPCIntervention] Error validating context:', error);
    return false;
  }
}

/**
 * Create empty intervention result
 */
function createEmptyResult(): InterventionResult {
  return {
    occurred: false,
    suppressedNPCs: [],
    messages: [],
    timestamp: Date.now()
  };
}

/**
 * Check if an intervention can be triggered based on enhanced conditions
 */
function canTriggerIntervention(rule: InterventionRule, context: InterventionContext): boolean {
  try {
        let history = interventionHistory.get(rule.id);
    
    // Initialize history if it doesn't exist
    if (!history) {
      history = {
        count: 0,
        lastOccurrence: 0,
        cooldownUntil: 0,
        hourlyCount: 0,
        lastHourReset: now
      };
      interventionHistory.set(rule.id, history);
    }

    // Reset hourly count if needed
    if (now - history.lastHourReset > 3600000) { // 1 hour
      history.hourlyCount = 0;
      history.lastHourReset = now;
    }

    // Check cooldown
    if (rule.cooldown && now < history.cooldownUntil) {
      return false;
    }

    // Check max occurrences
    if (rule.maxOccurrences && history.count >= rule.maxOccurrences) {
      return false;
    }

    // Check time restrictions
    if (rule.timeRestrictions?.maxPerHour && 
        history.hourlyCount >= rule.timeRestrictions.maxPerHour) {
      return false;
    }

    // Check required flags using helper
    if (rule.requiredFlags) {
      for (const flag of rule.requiredFlags) {
        if (!ConditionHelpers.hasFlag(context.flags, flag)) {
          return false;
        }
      }
    }

    // Check blocked flags using helper
    if (rule.blockedFlags) {
      for (const flag of rule.blockedFlags) {
        if (ConditionHelpers.hasFlag(context.flags, flag)) {
          return false;
        }
      }
    }

    // Check required traits using helper
    if (rule.requiredTraits) {
      for (const trait of rule.requiredTraits) {
        if (!ConditionHelpers.hasTrait(context.playerState, trait)) {
          return false;
        }
      }
    }

    // Check required items using helper
    if (rule.requiredItems) {
      for (const item of rule.requiredItems) {
        if (!ConditionHelpers.hasItem(context.playerState, item)) {
          return false;
        }
      }
    }

    // Check minimum reputation using helper
    if (rule.minReputation) {
            if (reputation < rule.minReputation) {
        return false;
      }
    }

    // Check room restrictions using helper
    if (rule.roomRestrictions && rule.roomRestrictions.length > 0) {
            if (!roomAllowed) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[NPCIntervention] Error checking intervention trigger:', error);
    return false;
  }
}

/**
 * Get player reputation from various sources (moved to ConditionHelpers)
 */
function getPlayerReputation(playerState: PlayerState): number {
  return ConditionHelpers.getReputation(playerState);
}

/**
 * Find NPCs that would be suppressed by this intervention
 */
function findSuppressedNPCs(rule: InterventionRule, lowerNpcs: string[]): string[] {
  try {
            
    return lowerNpcs.filter(npc => 
      targetNPCsLower.includes(npc) && npc !== interventionNPCLower
    );
  } catch (error) {
    console.error('[NPCIntervention] Error finding suppressed NPCs:', error);
    return [];
  }
}

/**
 * Execute the intervention and update history with enhanced tracking
 */
function executeIntervention(
  rule: InterventionRule,
  suppressedNPCs: string[],
  context: InterventionContext
): InterventionResult {
  try {
    const messages: string[] = [];
    
    // Send intervention message
    messages.push(rule.messages.intervention);
    context.appendMessage(rule.messages.intervention, 'intervention');

    // Send suppression messages with better variation
    suppressedNPCs.forEach((npc, index) => {
                                    
      messages.push(fullMessage);
      context.appendMessage(fullMessage, 'suppression');
    });

    // Add success message if defined
    if (rule.messages.success) {
      messages.push(rule.messages.success);
      context.appendMessage(rule.messages.success, 'intervention_success');
    }

    // Update intervention history
    updateInterventionHistory(rule, now);

    // Track recent intervention
    trackRecentIntervention(rule.id, context);

    console.log(`[NPCIntervention] ${rule.interventionNPC} intervened (${rule.id}) - suppressed: ${suppressedNPCs.join(', ')}`);

    return {
      occurred: true,
      interventionNPC: rule.interventionNPC,
      suppressedNPCs,
      messages,
      effectDuration: rule.cooldown,
      ruleId: rule.id,
      timestamp: now
    };
  } catch (error) {
    console.error('[NPCIntervention] Error executing intervention:', error);
    return createEmptyResult();
  }
}

/**
 * Capitalize NPC name properly
 */
function capitalizeNPCName(npc: string): string {
  try {
    // Handle special cases
    const specialCases: Record<string, string> = {
      'mr wendell': 'Mr Wendell',
      'al': 'Al',
      'ayla': 'Ayla',
      'morthos': 'Morthos',
      'polly': 'Polly',
      'dominic': 'Dominic',
      'albie': 'Albie'
    };

        if (specialCases[lowerNpc]) {
      return specialCases[lowerNpc];
    }

    return npc.charAt(0).toUpperCase() + npc.slice(1);
  } catch (error) {
    console.error('[NPCIntervention] Error capitalizing NPC name:', error);
    return npc;
  }
}

/**
 * Update intervention history with enhanced tracking
 */
function updateInterventionHistory(rule: InterventionRule, now: number): void {
  try {
    let history = interventionHistory.get(rule.id);
    if (!history) {
      history = {
        count: 0,
        lastOccurrence: 0,
        cooldownUntil: 0,
        hourlyCount: 0,
        lastHourReset: now
      };
    }

    history.count += 1;
    history.hourlyCount += 1;
    history.lastOccurrence = now;
    history.cooldownUntil = now + (rule.cooldown || 0);

    interventionHistory.set(rule.id, history);
  } catch (error) {
    console.error('[NPCIntervention] Error updating intervention history:', error);
  }
}

/**
 * Track recent intervention for pattern analysis
 */
function trackRecentIntervention(ruleId: string, context: InterventionContext): void {
  try {
    recentInterventions.push({
      ruleId,
      timestamp: Date.now(),
      context: `${context.currentRoom || 'unknown'}_${context.npcsInRoom.length}npcs`
    });

    // Trim to prevent memory bloat
    if (recentInterventions.length > MAX_RECENT_INTERVENTIONS) {
      recentInterventions.splice(0, recentInterventions.length - MAX_RECENT_INTERVENTIONS);
    }
  } catch (error) {
    console.error('[NPCIntervention] Error tracking recent intervention:', error);
  }
}

/**
 * Add a custom intervention rule with enhanced validation
 */
export function addInterventionRule(rule: InterventionRule): boolean {
  try {
    if (!validateInterventionRule(rule)) {
      console.warn('[NPCIntervention] Invalid intervention rule provided');
      return false;
    }

    // Check if rule already exists
        if (existingIndex >= 0) {
      interventionRules[existingIndex] = rule;
      console.log(`[NPCIntervention] Updated intervention rule: ${rule.id}`);
    } else {
      interventionRules.push(rule);
      console.log(`[NPCIntervention] Added intervention rule: ${rule.id}`);
    }
    
    return true;
  } catch (error) {
    console.error('[NPCIntervention] Error adding intervention rule:', error);
    return false;
  }
}

/**
 * Validate intervention rule structure
 */
function validateInterventionRule(rule: InterventionRule): boolean {
  try {
    return typeof rule === 'object' &&
           rule !== null &&
           typeof rule.id === 'string' &&
           rule.id.length > 0 &&
           typeof rule.interventionNPC === 'string' &&
           rule.interventionNPC.length > 0 &&
           Array.isArray(rule.targetNPCs) &&
           rule.targetNPCs.length > 0 &&
           typeof rule.priority === 'number' &&
           rule.priority >= 0 &&
           typeof rule.messages === 'object' &&
           rule.messages !== null &&
           typeof rule.messages.intervention === 'string' &&
           Array.isArray(rule.messages.suppressed) &&
           rule.messages.suppressed.length > 0;
  } catch (error) {
    console.error('[NPCIntervention] Error validating rule:', error);
    return false;
  }
}

/**
 * Remove an intervention rule with cleanup
 */
export function removeInterventionRule(ruleId: string): boolean {
  try {
    if (!ruleId || typeof ruleId !== 'string') {
      return false;
    }

        if (index >= 0) {
      interventionRules.splice(index, 1);
      interventionHistory.delete(ruleId);
      
      // Clean up recent interventions
            recentInterventions.splice(0, recentInterventions.length, ...filteredRecent);
      
      console.log(`[NPCIntervention] Removed intervention rule: ${ruleId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[NPCIntervention] Error removing intervention rule:', error);
    return false;
  }
}

/**
 * Get all active intervention rules (deep copy for safety)
 */
export function getInterventionRules(): InterventionRule[] {
  try {
    return JSON.parse(JSON.stringify(interventionRules));
  } catch (error) {
    console.error('[NPCIntervention] Error getting intervention rules:', error);
    return [];
  }
}

/**
 * Get intervention history for debugging (safe copy)
 */
export function getInterventionHistory(): Record<string, InterventionHistory> {
  try {
    const result: Record<string, InterventionHistory> = {};
    interventionHistory.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  } catch (error) {
    console.error('[NPCIntervention] Error getting intervention history:', error);
    return {};
  }
}

/**
 * Reset intervention history with enhanced cleanup
 */
export function resetInterventionHistory(): void {
  try {
    interventionHistory.clear();
    recentInterventions.splice(0, recentInterventions.length);
    console.log('[NPCIntervention] Intervention history reset');
  } catch (error) {
    console.error('[NPCIntervention] Error resetting intervention history:', error);
  }
}

/**
 * Check if a specific NPC can intervene in the current context
 */
export function canNPCIntervene(
  npcName: string,
  context: InterventionContext
): boolean {
  try {
    if (!npcName || typeof npcName !== 'string' || !validateInterventionContext(context)) {
      return false;
    }

        if (!lowerNpcs.includes(npcName.toLowerCase())) {
      return false;
    }

    return applicableRules.some(rule => {
            return suppressedNPCs.length > 0 && 
             canTriggerIntervention(rule, context) &&
             (!rule.conditions || rule.conditions(context));
    });
  } catch (error) {
    console.error('[NPCIntervention] Error checking if NPC can intervene:', error);
    return false;
  }
}

/**
 * Get potential interventions for current context (enhanced for UI/debugging)
 */
export function getPotentialInterventions(
  context: InterventionContext
): Array<{
  rule: InterventionRule;
  canTrigger: boolean;
  suppressedCount: number;
  reason?: string;
  priority: number;
}> {
  try {
    if (!validateInterventionContext(context)) {
      return [];
    }

    return interventionRules.map(rule => {
                        
      let conditionsMet = true;
      let conditionError = '';
      
      if (rule.conditions) {
        try {
          conditionsMet = rule.conditions(context);
        } catch (error) {
          conditionsMet = false;
          conditionError = ' (condition error)';
        }
      }

      let reason: string | undefined;
      if (!isNPCPresent) reason = 'NPC not present';
      else if (suppressedNPCs.length === 0) reason = 'No targets to suppress';
      else if (!canTrigger) reason = 'Cooldown/limit reached';
      else if (!conditionsMet) reason = `Conditions not met${conditionError}`;

      return {
        rule,
        canTrigger: isNPCPresent && suppressedNPCs.length > 0 && canTrigger && conditionsMet,
        suppressedCount: suppressedNPCs.length,
        reason,
        priority: rule.priority
      };
    }).sort((a, b) => b.priority - a.priority); // Sort by priority
  } catch (error) {
    console.error('[NPCIntervention] Error getting potential interventions:', error);
    return [];
  }
}

/**
 * Get recent intervention patterns for analysis
 */
export function getRecentInterventionPatterns(): Array<{
  ruleId: string;
  timestamp: number;
  context: string;
}> {
  try {
    return [...recentInterventions];
  } catch (error) {
    console.error('[NPCIntervention] Error getting recent patterns:', error);
    return [];
  }
}

/**
 * Get intervention statistics for monitoring
 */
export function getInterventionStats(): {
  totalRules: number;
  activeHistory: number;
  recentInterventions: number;
  mostActiveRule?: string;
  averageInterval?: number;
} {
  try {
    
    // Find most active rule
    let maxCount = 0;
    interventionHistory.forEach((history, ruleId) => {
      if (history.count > maxCount) {
        maxCount = history.count;
        stats.mostActiveRule = ruleId;
      }
    });

    // Calculate average interval
    if (recentInterventions.length > 1) {
            for (let i = 1; i < recentInterventions.length; i++) {
        intervals.push(recentInterventions[i].timestamp - recentInterventions[i - 1].timestamp);
      }
      stats.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    return stats;
  } catch (error) {
    console.error('[NPCIntervention] Error getting intervention stats:', error);
    return {
      totalRules: 0,
      activeHistory: 0,
      recentInterventions: 0
    };
  }
}

/**
 * Export utilities for external use
 */
export 
export default NPCInterventionEngine;
