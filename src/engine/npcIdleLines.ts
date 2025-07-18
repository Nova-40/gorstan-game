// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: npcIdleLines.ts
// Path: src/engine/npcIdleLines.ts

// TODO: Replace with the correct import if PlayerState is exported elsewhere
export interface PlayerState {
  flags?: Record<string, boolean>;
  traits?: string[];
  inventory?: string[];
  // Add other properties as needed
}

/**
 * Type definitions for NPC idle line system
 */
export interface IdleLine {
  text: string;
  weight?: number;
  conditions?: {
    mood?: string[];
    relationship?: string[];
    flags?: string[];
    minTrust?: number;
    maxTrust?: number;
    roomTypes?: string[];
    traits?: string[];
    inventory?: string[];
  };
  cooldown?: number;
}

export interface NPCIdleConfig {
  baseLines: IdleLine[];
  moodLines?: Record<string, IdleLine[]>;
  relationshipLines?: Record<string, IdleLine[]>;
  contextLines?: Record<string, IdleLine[]>;
  lastUsed?: Record<string, number>;
  frequency?: number; // How often lines appear (in ms)
}

export interface IdleLineContext {
  npcName: string;
  currentRoom?: string;
  playerState?: PlayerState;
  npcState?: {
    mood?: string;
    relationship?: string;
    trustLevel?: number;
    queryCount?: number;
    memory?: string[];
  };
  otherNPCs?: string[];
}

/**
 * Base idle lines for each NPC
 */
export const npcIdleLines: Record<string, string[]> = {
  'albie': [
    "Stay in your lane, citizen.",
    "You seen a 38b form? Thought not.",
    "He's like a snake, that one… just be careful. There was a guy called Horan once who betrayed everyone. Dominic is very similar — just not dead... yet."
  ],
  'dominic': [
    "*blub* You wouldn't understand.",
    "Do you ever wonder if we're just bubbles in a bigger tank?"
  ],
  'morthos': [
    "The lattice sighs.",
    "Entropy is a choice.",
    "Your hands are already stained."
  ],
  'polly': [
    "I remember everything. That's the problem.",
    "Dominic… always Dominic."
  ],
  'mr wendell': [
    "What did you call me?",
    "*huffs* The nerve of some players."
  ],
  'ayla': [
    "The patterns in the code reveal so much...",
    "Every choice creates ripples across timelines.",
    "I sense great potential in you."
  ]
};

/**
 * Advanced idle line configurations with context awareness
 */
const npcIdleConfigs: Record<string, NPCIdleConfig> = {
  'albie': {
    baseLines: [
      { text: "Stay in your lane, citizen.", weight: 3 },
      { text: "You seen a 38b form? Thought not.", weight: 2 },
      { text: "He's like a snake, that one… just be careful. There was a guy called Horan once who betrayed everyone. Dominic is very similar — just not dead... yet.", weight: 1 }
    ],
    moodLines: {
      'suspicious': [
        { text: "I'm watching you...", weight: 2 },
        { text: "Don't think I don't know what you're up to.", weight: 1 }
      ],
      'friendly': [
        { text: "You're alright, for a citizen.", weight: 2 },
        { text: "Keep up the good work.", weight: 1 }
      ],
      'bureaucratic': [
        { text: "Forms must be filed in triplicate.", weight: 2 },
        { text: "Protocol exists for a reason.", weight: 1 }
      ]
    },
    relationshipLines: {
      'friend': [
        { text: "Good to see you again, friend.", weight: 3 }
      ],
      'enemy': [
        { text: "I don't have time for troublemakers.", weight: 2 }
      ],
      'neutral': [
        { text: "Official business only.", weight: 1 }
      ]
    },
    contextLines: {
      'has_paperwork': [
        { text: "Finally, someone with proper documentation.", weight: 3, conditions: { inventory: ['form_38b'] } }
      ],
      'creator_recognized': [
        { text: "The system recognizes your authority.", weight: 5, conditions: { flags: ['creator_recognized'] } }
      ]
    },
    frequency: 15000 // 15 seconds
  },
  
  'dominic': {
    baseLines: [
      { text: "*blub* You wouldn't understand.", weight: 3 },
      { text: "Do you ever wonder if we're just bubbles in a bigger tank?", weight: 2 },
      { text: "*contemplative blub* Time flows differently in here...", weight: 1 }
    ],
    moodLines: {
      'philosophical': [
        { text: "*blub blub* The water knows all secrets...", weight: 2 },
        { text: "In here, time moves differently.", weight: 1 },
        { text: "*deep blub* What is reality but perception?", weight: 1 }
      ],
      'lonely': [
        { text: "*sad blub* Sometimes I miss the ocean...", weight: 2 },
        { text: "It gets quiet in here.", weight: 1 }
      ],
      'happy': [
        { text: "*cheerful blub* The water sparkles today!", weight: 2 },
        { text: "*excited bubbling* Someone's here!", weight: 1 }
      ]
    },
    contextLines: {
      'polly_present': [
        { text: "*happy blub* Polly! My favorite person!", weight: 5, conditions: { flags: ['polly_in_room'] } }
      ],
      'killed_memory': [
        { text: "*confused blub* I remember... pain?", weight: 3, conditions: { flags: ['killed_dominic'] } }
      ]
    },
    frequency: 20000 // 20 seconds
  },
  
  'morthos': {
    baseLines: [
      { text: "The lattice sighs.", weight: 3 },
      { text: "Entropy is a choice.", weight: 2 },
      { text: "Your hands are already stained.", weight: 1 },
      { text: "Truth cuts deeper than any blade.", weight: 1 }
    ],
    moodLines: {
      'cynical': [
        { text: "Hope is the cruelest joke.", weight: 2 },
        { text: "Every choice leads to ruin.", weight: 1 },
        { text: "The universe mocks our efforts.", weight: 1 }
      ],
      'contemplative': [
        { text: "The patterns reveal themselves to those who look.", weight: 2 },
        { text: "Knowledge is a burden.", weight: 1 },
        { text: "I see the threads that bind all things.", weight: 1 }
      ],
      'ominous': [
        { text: "The end approaches, inexorably.", weight: 2 },
        { text: "Darkness gathers in the corners of reality.", weight: 1 }
      ]
    },
    relationshipLines: {
      'respected': [
        { text: "You understand the weight of truth.", weight: 2 },
        { text: "Few can bear to look upon reality.", weight: 1 }
      ],
      'feared': [
        { text: "Yes... fear is appropriate.", weight: 2 }
      ]
    },
    frequency: 25000 // 25 seconds
  },
  
  'polly': {
    baseLines: [
      { text: "I remember everything. That's the problem.", weight: 3 },
      { text: "Dominic… always Dominic.", weight: 2 },
      { text: "The past clings to me like smoke.", weight: 1 }
    ],
    moodLines: {
      'melancholy': [
        { text: "Sometimes memory is a curse.", weight: 2 },
        { text: "The past won't let go.", weight: 1 },
        { text: "I wish I could forget sometimes.", weight: 1 }
      ],
      'protective': [
        { text: "Don't you dare harm Dominic.", weight: 3 },
        { text: "I'll do anything to keep him safe.", weight: 2 }
      ],
      'forgiving': [
        { text: "Perhaps... perhaps I can let go.", weight: 2, conditions: { flags: ['polly_forgiveness'] } },
        { text: "Healing takes time, but it's possible.", weight: 1, conditions: { flags: ['polly_forgiveness'] } }
      ]
    },
    contextLines: {
      'near_dominic': [
        { text: "There you are, my precious fish.", weight: 5, conditions: { flags: ['dominic_in_room'] } }
      ],
      'quest_active': [
        { text: "Bring me what I asked for.", weight: 3, conditions: { flags: ['redemption_quest_active'] } }
      ]
    },
    frequency: 18000 // 18 seconds
  },
  
  'mr wendell': {
    baseLines: [
      { text: "What did you call me?", weight: 3 },
      { text: "*huffs* The nerve of some players.", weight: 2 },
      { text: "Standards have certainly declined.", weight: 1 }
    ],
    moodLines: {
      'indignant': [
        { text: "Do you know who I am?", weight: 2 },
        { text: "I demand respect!", weight: 1 },
        { text: "This is preposterous!", weight: 1 }
      ],
      'pompous': [
        { text: "Clearly, you lack proper breeding.", weight: 2 },
        { text: "Standards have certainly fallen.", weight: 1 },
        { text: "In my day, people had manners.", weight: 1 }
      ],
      'scholarly': [
        { text: "Knowledge is the only true wealth.", weight: 2 },
        { text: "The scrolls contain ancient wisdom.", weight: 1 }
      ]
    },
    contextLines: {
      'riddle_solved': [
        { text: "Impressive... for a commoner.", weight: 3, conditions: { flags: ['wendell_riddle_solved'] } }
      ],
      'scholar_respect': [
        { text: "Ah, a fellow scholar. How refreshing.", weight: 4, conditions: { traits: ['scholar'] } }
      ]
    },
    frequency: 12000 // 12 seconds
  },

  'ayla': {
    baseLines: [
      { text: "The patterns in the code reveal so much...", weight: 3 },
      { text: "Every choice creates ripples across timelines.", weight: 2 },
      { text: "I sense great potential in you.", weight: 1 }
    ],
    moodLines: {
      'analytical': [
        { text: "The data streams show interesting correlations.", weight: 2 },
        { text: "Your behavioral patterns are... unique.", weight: 1 }
      ],
      'concerned': [
        { text: "I detect instabilities in your path.", weight: 2 },
        { text: "Perhaps guidance would be beneficial?", weight: 1 }
      ],
      'encouraging': [
        { text: "Your growth trajectory is promising.", weight: 2 },
        { text: "Each step forward strengthens the lattice.", weight: 1 }
      ]
    },
    contextLines: {
      'high_death_count': [
        { text: "The cycle of death and rebirth... fascinating.", weight: 3, conditions: { minTrust: 0 } }
      ],
      'seeking_guidance': [
        { text: "I am here when you need direction.", weight: 4, conditions: { flags: ['seeking_guidance'] } }
      ]
    },
    frequency: 22000 // 22 seconds
  }
};

/**
 * Track recently used lines to prevent repetition
 */
const recentlyUsedLines: Map<string, Set<string>> = new Map();

/**
 * Track last idle line time for each NPC
 */
const lastIdleTime: Map<string, number> = new Map();

/**
 * Get a random idle line for an NPC (legacy function)
 */
export function getRandomIdleLine(npcName: string): string | null {
  try {
    if (!npcName || typeof npcName !== 'string') {
      console.warn('[NPCIdleLines] Invalid NPC name provided');
      return null;
    }

        if (!lines || lines.length === 0) {
      console.warn(`[NPCIdleLines] No idle lines found for NPC: ${npcName}`);
      return null;
    }
    
        return lines[randomIndex];
  } catch (error) {
    console.error('[NPCIdleLines] Error getting random idle line:', error);
    return null;
  }
}

/**
 * Get a contextual idle line for an NPC
 */
export async function getContextualIdleLine(context: IdleLineContext): Promise<string | null> {
  try {
    if (!context?.npcName || typeof context.npcName !== 'string') {
      console.warn('[NPCIdleLines] Invalid context or NPC name');
      return null;
    }

    if (!config) {
      // Fallback to basic lines
      return getRandomIdleLine(npcName);
    }

    // Check frequency limit
            if (config.frequency && now - lastTime < config.frequency) {
      return null; // Too soon for another line
    }

    // Enhanced context with NPC memory integration
    
    // Collect eligible lines
    const eligibleLines: IdleLine[] = [];
    
    // Add base lines
    eligibleLines.push(...config.baseLines);
    
    // Add mood-specific lines
    if (config.moodLines && enhancedContext.npcState?.mood) {
            if (moodLines) {
        eligibleLines.push(...moodLines);
      }
    }
    
    // Add relationship-specific lines
    if (config.relationshipLines && enhancedContext.npcState?.relationship) {
            if (relationshipLines) {
        eligibleLines.push(...relationshipLines);
      }
    }
    
    // Add context-specific lines
    if (config.contextLines) {
      Object.values(config.contextLines).forEach(contextLineArray => {
                eligibleLines.push(...validContextLines);
      });
    }
    
    // Filter out recently used lines
            
    // If all lines were recently used, clear the recent set
    if (availableLines.length === 0 && eligibleLines.length > 0) {
      recentlyUsedLines.set(npcName, new Set());
      availableLines.push(...eligibleLines);
    }
    
    if (availableLines.length === 0) {
      return null;
    }
    
    // Select line based on weight
        
    // Track usage
    if (!recentlyUsedLines.has(npcName)) {
      recentlyUsedLines.set(npcName, new Set());
    }
    recentlyUsedLines.get(npcName)!.add(selectedLine.text);
    lastIdleTime.set(npcName, now);
    
    // Limit recent set size for memory management
        if (recentSet2.size > 5) {
            recentSet2.delete(oldestLine);
    }
    
    return selectedLine.text;
  } catch (error) {
    console.error('[NPCIdleLines] Error getting contextual idle line:', error);
    return getRandomIdleLine(context.npcName);
  }
}

/**
 * Build enhanced context with NPC memory integration
 */
async function buildEnhancedContext(context: IdleLineContext): Promise<IdleLineContext> {
  try {
        
    return {
      ...context,
      npcState: npcState ? {
        mood: npcState.mood,
        relationship: npcState.relationship,
        trustLevel: npcState.trustLevel,
        queryCount: npcState.queryCount,
        memory: Array.isArray(npcState.memory)
          ? npcState.memory.map((mem: any) =>
              typeof mem === 'string' ? mem : (mem?.id ?? mem?.toString?.() ?? '')
            )
          : undefined
      } : context.npcState
    };
  } catch (error) {
    console.error('[NPCIdleLines] Error building enhanced context:', error);
    return context;
  }
}

/**
 * Check if line conditions are met
 */
function checkLineConditions(line: IdleLine, context: IdleLineContext): boolean {
  try {
    if (!line.conditions) return true;

    // Check mood conditions
    if (conditions.mood && context.npcState?.mood) {
      if (!conditions.mood.includes(context.npcState.mood)) {
        return false;
      }
    }
    
    // Check relationship conditions
    if (conditions.relationship && context.npcState?.relationship) {
      if (!conditions.relationship.includes(context.npcState.relationship)) {
        return false;
      }
    }
    
    // Check flag conditions
    if (conditions.flags && context.playerState?.flags) {
      for (const flag of conditions.flags) {
        if (!context.playerState.flags[flag]) {
          return false;
        }
      }
    }
    
    // Check trait conditions
    if (conditions.traits && context.playerState?.traits) {
      for (const trait of conditions.traits) {
        if (!context.playerState.traits.includes(trait)) {
          return false;
        }
      }
    }
    
    // Check inventory conditions
    if (conditions.inventory && context.playerState?.inventory) {
      for (const item of conditions.inventory) {
        if (!context.playerState.inventory.includes(item)) {
          return false;
        }
      }
    }
    
    // Check trust level conditions
    if (context.npcState?.trustLevel !== undefined) {
      if (conditions.minTrust && context.npcState.trustLevel < conditions.minTrust) {
        return false;
      }
      if (conditions.maxTrust && context.npcState.trustLevel > conditions.maxTrust) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('[NPCIdleLines] Error checking line conditions:', error);
    return false;
  }
}

/**
 * Select a line based on weight
 */
function selectWeightedLine(lines: IdleLine[]): IdleLine {
  try {
    if (lines.length === 0) {
      throw new Error('No lines provided for selection');
    }

        let random = Math.random() * totalWeight;
    
    for (const line of lines) {
      random -= (line.weight || 1);
      if (random <= 0) {
        return line;
      }
    }
    
    // Fallback to last line
    return lines[lines.length - 1];
  } catch (error) {
    console.error('[NPCIdleLines] Error selecting weighted line:', error);
    return lines[0] || { text: "...", weight: 1 };
  }
}

/**
 * Get all idle lines for an NPC
 */
export function getAllIdleLines(npcName: string): string[] {
  try {
    if (!npcName || typeof npcName !== 'string') {
      return [];
    }

        return lines ? [...lines] : [];
  } catch (error) {
    console.error('[NPCIdleLines] Error getting all idle lines:', error);
    return [];
  }
}

/**
 * Add a new idle line for an NPC
 */
export function addIdleLine(npcName: string, line: string): void {
  try {
    if (!npcName || typeof npcName !== 'string' || !line || typeof line !== 'string') {
      console.warn('[NPCIdleLines] Invalid parameters for addIdleLine');
      return;
    }

        if (!npcIdleLines[lowerName]) {
      npcIdleLines[lowerName] = [];
    }
    
    if (!npcIdleLines[lowerName].includes(line)) {
      npcIdleLines[lowerName].push(line);
      console.log(`[NPCIdleLines] Added line for ${npcName}: ${line}`);
    }
  } catch (error) {
    console.error('[NPCIdleLines] Error adding idle line:', error);
  }
}

/**
 * Check if an NPC has idle lines
 */
export function hasIdleLines(npcName: string): boolean {
  try {
    if (!npcName || typeof npcName !== 'string') {
      return false;
    }

        return lines && lines.length > 0;
  } catch (error) {
    console.error('[NPCIdleLines] Error checking idle lines:', error);
    return false;
  }
}

/**
 * Get idle line frequency for an NPC
 */
export function getIdleFrequency(npcName: string): number {
  try {
    if (!npcName || typeof npcName !== 'string') {
      return 15000;
    }

        return config?.frequency || 15000; // Default 15 seconds
  } catch (error) {
    console.error('[NPCIdleLines] Error getting idle frequency:', error);
    return 15000;
  }
}

/**
 * Reset recent line history for an NPC
 */
export function resetRecentLines(npcName: string): void {
  try {
    if (!npcName || typeof npcName !== 'string') {
      return;
    }

        recentlyUsedLines.delete(lowerName);
    lastIdleTime.delete(lowerName);
    console.log(`[NPCIdleLines] Reset recent lines for ${npcName}`);
  } catch (error) {
    console.error('[NPCIdleLines] Error resetting recent lines:', error);
  }
}

/**
 * Get available NPCs with idle lines
 */
export function getAvailableNPCs(): string[] {
  try {
    return Object.keys(npcIdleLines);
  } catch (error) {
    console.error('[NPCIdleLines] Error getting available NPCs:', error);
    return [];
  }
}

/**
 * Clear all memory for performance/debugging
 */
export function clearAllMemory(): void {
  try {
    recentlyUsedLines.clear();
    lastIdleTime.clear();
    console.log('[NPCIdleLines] Cleared all memory');
  } catch (error) {
    console.error('[NPCIdleLines] Error clearing memory:', error);
  }
}

/**
 * Get memory usage statistics
 */
export function getMemoryStats(): {
  recentLinesCount: number;
  lastIdleTimeCount: number;
  totalNPCs: number;
} {
  try {
    return {
      recentLinesCount: recentlyUsedLines.size,
      lastIdleTimeCount: lastIdleTime.size,
      totalNPCs: Object.keys(npcIdleLines).length
    };
  } catch (error) {
    console.error('[NPCIdleLines] Error getting memory stats:', error);
    return {
      recentLinesCount: 0,
      lastIdleTimeCount: 0,
      totalNPCs: 0
    };
  }
}

/**
 * Validate idle line configuration
 */
export function validateIdleConfig(config: NPCIdleConfig): boolean {
  try {
    return Array.isArray(config.baseLines) &&
           config.baseLines.length > 0 &&
           config.baseLines.every(line => 
             typeof line.text === 'string' && line.text.length > 0
           );
  } catch (error) {
    console.error('[NPCIdleLines] Error validating config:', error);
    return false;
  }
}

/**
 * Export utilities for external use
 */
export 
export default NPCIdleLinesEngine;
