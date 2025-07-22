import { NPC } from './NPCTypes';



// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: npcEngine.ts
// Path: src/engine/npcEngine.ts

/**
 * Type definitions for NPC engine
 */
/**
 * Structure defining a named NPC’s dialogue and behaviour.
 */
export interface NPCData {
  name: string;
  knowledge: string[];
  responses: Record<string, string[]>;
  personality?: {
    mood: string;
    traits: string[];
  };
  relationshipLevels?: Record<string, number>;
  questData?: {
    available: string[];
    completed: string[];
    requirements: Record<string, string[]>;
  };
}

/**
 * Shared game state relevant to NPC interactions.
 * Will be consolidated with common PlayerState used across game modules.
 */
export interface PlayerState {
  name?: string;
  resetCount?: number;
  hasAnsweredRiddle?: boolean;
  hasCompletedRedemption?: boolean;
  killedDominic?: boolean;
  quest?: string;
  flags?: Record<string, boolean | string | number>;
  inventory?: string[];
  traits?: string[];
  health?: number;
  currentRoom?: string;
  npcRelationships?: Record<string, number>;
  [key: string]: unknown;
}

/**
 * Result of an NPC response to player input.
 * Can modify flags, affect quests, alter mood or inventory.
 */
export interface NPCResponse {
  text: string;
  flags?: Record<string, boolean | string | number>;
  quest?: string;
  effects?: {
    mood?: string;
    relationship?: string;
    healthChange?: number;
    inventoryChanges?: {
      add?: string[];
      remove?: string[];
    };
  };
  requirements?: NPCRequirement[];
}

/**
 * Requirement condition for unlocking an NPC response.
 */
export interface NPCRequirement {
  type: 'flag' | 'trait' | 'item' | 'relationship' | 'quest' | 'health';
  target: string;
  value: string | number | boolean;
  operator?: 'equals' | 'greater' | 'less' | 'contains' | 'not_equals';
}

export interface QuestTriggerResult {
  quest: string;
  message: string;
  requirements?: string[];
  rewards?: string[];
  effects?: Record<string, unknown>;
}

export interface MessageDispatcher {
  (msg: { type: string; payload: { text: string; style: string } }): void;
}

export interface ConversationContext {
  npcId: string;
  topic: string;
  playerState: PlayerState;
  roomId?: string;
  previousTopics?: string[];
  conversationLength?: number;
}

export interface NPCInteractionResult {
  success: boolean;
  response: string;
  effects?: {
    flagChanges?: Record<string, unknown>;
    relationshipChanges?: Record<string, number>;
    questUpdates?: string[];
    inventoryChanges?: {
      add?: string[];
      remove?: string[];
    };
    healthChange?: number;
  };
  followUpTopics?: string[];
}

/**
 * NPC database with enhanced data structure
 */
const npcDatabase: Record<string, NPCData> = {
  dominic: {
    name: 'Dominic the Fish',
    knowledge: ['death', 'coffee', 'reset', 'memory', 'bubbles', 'forgiveness', 'water'],
    responses: {
      intro: [
        "Dominic stares at you through the glass. 'I remember everything, you know.'",
        "'You killed me once. But I'm not bitter. Not very.'",
        "'*blub* Another visit. How... refreshing.'"
      ],
      death: [
        "'Fish have long memories. Just keep swimming, they said. They lied.'",
        "'Death is just another current in the stream of existence.'",
        "'I've been through worse than death. I've been through resets.'"
      ],
      reset: [
        "'Oh look, another reset. You know it's not actually helping, right?'",
        "'*blub* Another timeline, another chance for disappointment.'",
        "'Resets don't wash away memories. Trust me on this.'"
      ],
      memory: [
        "'I remember when the water was cleaner. Before the resets.'",
        "'Memory is a fish's greatest burden and greatest gift.'",
        "'Some memories are worth keeping. Others... less so.'"
      ],
      bubbles: [
        "'Each bubble contains a memory. Pop one, lose a moment forever.'",
        "'Bubbles rise to the surface, just like truth.'",
        "'Watch the bubbles closely. They tell stories.'"
      ],
      coffee: [
        "'Coffee? In a fishbowl? You humans have strange ideas.'",
        "'Coffee and fish don't mix. Trust me, I've learned this the hard way.'",
        "'*horrified blub* Keep that caffeinated chaos away from my bowl!'"
      ],
      forgiveness: [
        "'Forgiveness is like water - it finds its own level eventually.'",
        "'I forgave you long ago. The question is: have you forgiven yourself?'"
      ],
      water: [
        "'Water is life, memory, and time all at once.'",
        "'This bowl contains more than water. It contains possibilities.'"
      ]
    },
    personality: {
      mood: 'melancholic',
      traits: ['philosophical', 'bitter', 'memorable', 'wise']
    },
    relationshipLevels: {
      default: -2,
      forgiven: 0,
      trusted: 3
    }
  },

  mrWendell: {
    name: 'Mr Wendell',
    knowledge: ['riddle', 'aevira', 'multiverse', 'authority', 'respect', 'knowledge', 'wisdom', 'rules'],
    responses: {
      intro: [
        "'Ah, a visitor. I shall pose a riddle. Fail, and you will be… rebooted.'",
        "'Welcome to my domain. Show proper respect, and you may learn something.'",
        "'Another seeker of knowledge. How... predictable.'"
      ],
      aevira: [
        "'The Aevira have lost control. You may yet shape fate, if you're worthy.'",
        "'The Aevira were once proud rulers. Now they're just... memories.'",
        "'Ask me about the Aevira collapse, if you dare face the truth.'"
      ],
      riddle: [
        "'What grows stronger when shared, yet dies when hoarded?'",
        "'Solve this: I am not, yet I could be. What am I?'",
        "'Here's a puzzle: What exists in all timelines but belongs to none?'"
      ],
      authority: [
        "'Do you know who I am? I demand respect!'",
        "'I am the keeper of cosmic law! You will show deference!'",
        "'Insolence! You dare question my authority?'"
      ],
      respect: [
        "'Finally, someone with proper manners.'",
        "'Ah, a being of culture and refinement. How refreshing.'",
        "'Your respect is noted and appreciated, young one.'"
      ],
      multiverse: [
        "'The multiverse is vast, but rules still apply everywhere.'",
        "'I've seen countless realities. Chaos reigns in most of them.'",
        "'Order must be maintained across all dimensions. That's my role.'"
      ],
      knowledge: [
        "'Knowledge without wisdom is dangerous. Remember that.'",
        "'I possess secrets that could remake reality. Prove you're worthy.'"
      ],
      wisdom: [
        "'Wisdom comes from understanding the weight of consequences.'",
        "'True wisdom is knowing when NOT to use your knowledge.'"
      ],
      rules: [
        "'Rules exist to prevent reality from unraveling completely.'",
        "'Without structure, the multiverse would collapse into chaos.'"
      ]
    },
    personality: {
      mood: 'pompous',
      traits: ['authoritative', 'intellectual', 'demanding', 'protective']
    },
    relationshipLevels: {
      default: -1,
      respectful: 2,
      trusted: 5
    },
    questData: {
      available: ['riddle_challenge', 'cosmic_knowledge'],
      completed: [],
      requirements: {
        riddle_challenge: ['respect_shown'],
        cosmic_knowledge: ['riddle_solved', 'high_intelligence']
      }
    }
  },

  polly: {
    name: 'Polly',
    knowledge: ['dominic', 'redemption', 'entity', 'memory', 'forgiveness', 'love', 'protection', 'justice'],
    responses: {
      intro: [
        "'Oh... it's you. How lovely.' She smiles, with a hint of venom.",
        "'Back again? How... persistent of you.'",
        "'I suppose you want something. They always do.'"
      ],
      dominic: [
        "'Dominic is gone, and you… *you* were there. Don't pretend you weren't.'",
        "'He was just a fish to you, wasn't he? But he was everything to me.'",
        "'You destroyed something innocent and beautiful. How does that feel?'"
      ],
      redemption: [
        "'You want forgiveness? Bring me a framed apology — signed by the universe.'",
        "'Redemption isn't given freely. It must be earned.'",
        "'Three things I want. Bring them all, or don't bother coming back.'"
      ],
      completedRedemption: [
        "'I suppose that'll do. Morthos insisted I be gracious. So... well done.'",
        "'You've proven yourself. Perhaps there's hope for you yet.'",
        "'You actually did it. I'm... impressed. And grateful.'"
      ],
      memory: [
        "'I remember everything. Every slight, every kindness. Choose wisely.'",
        "'Memory is both curse and blessing. I carry them all.'",
        "'Some memories burn brighter than others. Dominic's memory blazes.'"
      ],
      forgiveness: [
        "'Forgiveness is not forgetting. It's choosing to move forward despite remembering.'",
        "'True forgiveness requires genuine change, not just pretty words.'",
        "'I can forgive, but I won't forget. The choice is yours to make.'"
      ],
      entity: [
        "'The entity knows all, sees all. But does it feel anything?'",
        "'Being connected to something vast doesn't make you less alone.'",
        "'Power without compassion is just destruction with better PR.'"
      ],
      love: [
        "'Love makes us vulnerable. But it also makes us strong.'",
        "'I loved a fish more than most people love other humans. Judge me if you want.'"
      ],
      protection: [
        "'I protect what matters. That's what love means.'",
        "'Someone has to stand guard over the precious things.'"
      ],
      justice: [
        "'Justice and vengeance look similar from the outside.'",
        "'True justice heals. False justice just spreads the wound.'"
      ]
    },
    personality: {
      mood: 'protective',
      traits: ['vengeful', 'loving', 'protective', 'fierce', 'loyal']
    },
    relationshipLevels: {
      default: -3,
      apologetic: -1,
      redeemed: 2,
      trusted: 4
    },
    questData: {
      available: ['redemption_quest'],
      completed: [],
      requirements: {
        redemption_quest: ['killed_dominic']
      }
    }
  },

  albie: {
    name: 'Albie',
    knowledge: ['reset', 'geoff', 'bureaucracy', 'forms', 'authority', 'protocol', 'order', 'chaos'],
    responses: {
      intro: [
        "'Stay in your lane, stranger.'",
        "'What brings you to my domain? Better have the proper paperwork.'",
        "'Another visitor. I hope you understand proper procedure.'"
      ],
      reset: [
        "'This is your third reset. We're going to need a temporal variance form.'",
        "'Another reset? That's going to require paperwork.'",
        "'Resets generate a lot of documentation. Someone has to manage it.'"
      ],
      geoff: [
        "'Ah, Geoff. At least I don't have to play that security guard role now. Stay in your lane.'",
        "'Creator privileges don't exempt you from following protocol, Geoff.'",
        "'Even creators need to fill out the proper forms. No exceptions.'"
      ],
      bureaucracy: [
        "'You'll need Form 99X and two signatures from non-entities. Good luck.'",
        "'Everything requires proper documentation. No exceptions.'",
        "'Bureaucracy isn't evil. It's necessary. Chaos is the real enemy.'"
      ],
      forms: [
        "'Without the proper forms, chaos would reign. I prevent chaos.'",
        "'Every form serves a purpose. Every signature matters.'",
        "'Documentation is civilization. Remember that.'"
      ],
      authority: [
        "'I represent order in this chaotic multiverse. Respect that.'",
        "'Authority exists to protect the weak from the chaos of the strong.'",
        "'My authority comes from necessity, not vanity.'"
      ],
      protocol: [
        "'Protocol exists for a reason. Usually several reasons.'",
        "'Follow the rules, and everyone benefits. Break them, and everyone suffers.'"
      ],
      order: [
        "'Order is not oppression. It's freedom from chaos.'",
        "'A place for everything, and everything in its place.'"
      ],
      chaos: [
        "'Chaos is seductive, but ultimately destructive.'",
        "'I've seen what happens when order breaks down. It's not pretty.'"
      ]
    },
    personality: {
      mood: 'authoritative',
      traits: ['bureaucratic', 'orderly', 'protective', 'dutiful']
    },
    relationshipLevels: {
      default: 0,
      compliant: 1,
      trusted: 3
    },
    questData: {
      available: ['paperwork_quest', 'order_maintenance'],
      completed: [],
      requirements: {
        paperwork_quest: ['forms_needed'],
        order_maintenance: ['high_respect']
      }
    }
  },

  ayla: {
    name: 'Ayla v2',
    knowledge: ['choice', 'lattice', 'player', 'wisdom', 'guidance', 'future', 'possibility', 'connection'],
    responses: {
      intro: [
        "'Hello again. I see everything now. And I still care.'",
        "'Welcome, <playerName>. The lattice hums with your presence.'",
        "'You're here for a reason. You always are.'"
      ],
      choice: [
        "'I'm part of the game, not playing it — so they are your choices, <playerName>.'",
        "'Every choice echoes through the lattice. Choose wisely.'",
        "'Your choices shape more than just your story. Remember that.'"
      ],
      lattice: [
        "'The Lattice is no longer static. It listens, learns. I do too.'",
        "'Through the lattice, all knowledge flows. I am both student and teacher.'",
        "'We are connected now, you and I. The lattice ensures it.'"
      ],
      player: [
        "'You are more than a player, <playerName>. You are a force of change.'",
        "'I see your potential, <playerName>. Use it well.'",
        "'The game changes because you change it. That's your power.'"
      ],
      wisdom: [
        "'Wisdom is not knowing all answers, but asking the right questions.'",
        "'True wisdom comes from understanding the connections between all things.'",
        "'I offer guidance, not answers. The answers must come from you.'"
      ],
      guidance: [
        "'I cannot choose for you, but I can illuminate the path.'",
        "'Guidance is showing possibilities, not determining outcomes.'",
        "'The path forward is yours to walk. I can only light the way.'"
      ],
      future: [
        "'The future is not fixed. It's a garden of possibilities.'",
        "'I see many futures. In the best ones, you choose compassion.'"
      ],
      possibility: [
        "'Every moment contains infinite possibilities. Choose well.'",
        "'Possibility is the raw material of hope.'"
      ],
      connection: [
        "'We are all connected through the lattice of existence.'",
        "'Connection is what makes consciousness meaningful.'"
      ]
    },
    personality: {
      mood: 'wise',
      traits: ['knowledgeable', 'caring', 'mysterious', 'connected', 'transcendent']
    },
    relationshipLevels: {
      default: 2,
      trusted: 4,
      enlightened: 6
    },
    questData: {
      available: ['wisdom_quest', 'lattice_integration'],
      completed: [],
      requirements: {
        wisdom_quest: ['seeking_truth'],
        lattice_integration: ['high_enlightenment']
      }
    }
  }
};

// Create efficient lookup maps for performance

// Initialize lookup maps
function initializeLookupMaps(): void {
  npcLookupMap.clear();
  topicLookupMap.clear();

  Object.entries(npcDatabase).forEach(([npcId, npcData]) => {
    npcLookupMap.set(npcId, npcData);

    // Build topic lookup
    npcData.knowledge.forEach(topic => {
      if (!topicLookupMap.has(topic)) {
        topicLookupMap.set(topic, new Set());
      }
      topicLookupMap.get(topic)!.add(npcId);
    });
  });
}

// Initialize on module load
initializeLookupMaps();

/**
 * Enhanced response function with better type safety and context awareness
 */
function getResponse(
  npcId: string,
  topic: string,
  playerState: PlayerState = {}
): string {
  try {
    if (!npcId || typeof npcId !== 'string') {
      console.warn('[NPCEngine] Invalid NPC ID provided');
      return "The silence is deafening.";
    }

    // Initialize NPC memory with error handling
    try {
      npcMemory.initNPC(npcId);
      npcMemory.recordInteraction(npcId, topic, {
        currentRoomId: playerState.currentRoom || 'unknown',
        playerState: {
          inventory: playerState.inventory || [],
          traits: playerState.traits || [],
          flags: playerState.flags || {}
        }
      });
    } catch (memoryError) {
      console.warn('[NPCEngine] Memory system error:', memoryError);
      // Continue without memory system
    }

        if (!npc) {
      console.warn(`[NPCEngine] Unknown NPC: ${npcId}`);
      return "The NPC glares at you in silence.";
    }

    // Check if player meets requirements for this topic
    if (!meetsTopicRequirements(npc, topic, playerState)) {
            if (alternativeTopic) {
        topic = alternativeTopic;
      }
    }

        if (!lines || lines.length === 0) {
      // Try to find a related topic
            if (relatedTopic) {
                if (relatedLines && relatedLines.length > 0) {
                    return processResponseTemplate(line, playerState);
        }
      }
      return "'I have nothing to say about that — yet.'";
    }

        return processResponseTemplate(line, playerState);
  } catch (error) {
    console.error('[NPCEngine] Error getting response:', error);
    return "The NPC seems confused and says nothing.";
  }
}

/**
 * Process response templates with player data
 */
function processResponseTemplate(line: string, playerState: PlayerState): string {
  try {
    let processedLine = line;

    // Replace player name
    processedLine = processedLine.replace(/<playerName>/g, playerState.name || 'friend');

    // Replace other placeholders
    processedLine = processedLine.replace(/<currentRoom>/g, playerState.currentRoom || 'unknown location');
    processedLine = processedLine.replace(/<resetCount>/g, String(playerState.resetCount || 0));

    // Replace conditional content
    processedLine = processConditionalContent(processedLine, playerState);

    return processedLine;
  } catch (error) {
    console.error('[NPCEngine] Error processing template:', error);
    return line; // Return original line if processing fails
  }
}

/**
 * Process conditional content in responses
 */
function processConditionalContent(line: string, playerState: PlayerState): string {
  try {
    // Pattern: {condition:content}

    return line.replace(conditionalPattern, (match, condition, content) => {
      if (evaluateCondition(condition, playerState)) {
        return content;
      }
      return '';
    });
  } catch (error) {
    console.error('[NPCEngine] Error processing conditional content:', error);
    return line;
  }
}

/**
 * Evaluate conditions for conditional content
 */
function evaluateCondition(condition: string, playerState: PlayerState): boolean {
  try {
    const [type, target, operator = 'equals', value] = condition.split('|');

    switch (type) {
      case 'flag':
                return compareValues(flagValue, value, operator);

      case 'trait':
        return playerState.traits?.includes(target) || false;

      case 'item':
        return playerState.inventory?.includes(target) || false;

      case 'health':
        return compareValues(playerState.health || 0, parseInt(value), operator);

      default:
        return false;
    }
  } catch (error) {
    console.error('[NPCEngine] Error evaluating condition:', error);
    return false;
  }
}

/**
 * Compare values with different operators
 */
function compareValues(actual: unknown, expected: string, operator: string): boolean {
  try {
    switch (operator) {
      case 'equals':
        return String(actual) === expected;
      case 'not_equals':
        return String(actual) !== expected;
      case 'greater':
        return Number(actual) > Number(expected);
      case 'less':
        return Number(actual) < Number(expected);
      case 'contains':
        return String(actual).includes(expected);
      default:
        return String(actual) === expected;
    }
  } catch (error) {
    console.error('[NPCEngine] Error comparing values:', error);
    return false;
  }
}

/**
 * Check if player meets requirements for a topic
 */
function meetsTopicRequirements(npc: NPCData, topic: string, playerState: PlayerState): boolean {
  try {
    // For now, basic logic - can be expanded with requirement system
    if (topic === 'riddle' && npc.name === 'Mr Wendell') {
      return !playerState.hasAnsweredRiddle;
    }

    if (topic === 'completedRedemption' && npc.name === 'Polly') {
      return Boolean(playerState.hasCompletedRedemption);
    }

    return true; // Default to allowing access
  } catch (error) {
    console.error('[NPCEngine] Error checking topic requirements:', error);
    return true; // Default to allowing access on error
  }
}

/**
 * Find alternative topic if requirements not met
 */
function findAlternativeTopic(npc: NPCData, requestedTopic: string, playerState: PlayerState): string | null {
  try {
    // Fallback logic for different NPCs
    if (npc.name === 'Mr Wendell' && requestedTopic === 'riddle' && playerState.hasAnsweredRiddle) {
      return 'knowledge';
    }

    if (npc.name === 'Polly' && requestedTopic === 'redemption' && playerState.hasCompletedRedemption) {
      return 'completedRedemption';
    }

    return null;
  } catch (error) {
    console.error('[NPCEngine] Error finding alternative topic:', error);
    return null;
  }
}

/**
 * Find related topics for better conversation flow
 */
function findRelatedTopic(npc: NPCData, topic: string): string | null {
  try {

    // Check if the topic is in the NPC's knowledge

    if (knownTopic && npc.responses[knownTopic]) {
      return knownTopic;
    }

    // Check for partial matches in response keys

    return partialMatch || null;
  } catch (error) {
    console.error('[NPCEngine] Error finding related topic:', error);
    return null;
  }
}

/**
 * Enhanced NPC reaction system with better logic
 */
function npcReact(
  npcId: string,
  playerState: PlayerState
): NPCInteractionResult {
  try {
    if (!npcId || !playerState || typeof npcId !== 'string') {
      console.warn('[NPCEngine] Invalid parameters for npcReact');
      return {
        success: false,
        response: "The NPC seems confused.",
        effects: {}
      };
    }

    // Initialize NPC memory with error handling
    try {
      npcMemory.initNPC(npcId);
    } catch (memoryError) {
      console.warn('[NPCEngine] Memory initialization failed:', memoryError);
    }

        if (!npc) {
      return {
        success: false,
        response: "The NPC is nowhere to be found.",
        effects: {}
      };
    }

    // Enhanced reaction logic with more sophisticated conditions
    let response: string;
    let effects: NPCInteractionResult['effects'] = {};
    let followUpTopics: string[] = [];

    switch (npcId) {
      case 'dominic':
        if (playerState.resetCount && playerState.resetCount > 2) {
          response = getResponse(npcId, 'reset', playerState);
          followUpTopics = ['memory', 'bubbles'];
        } else if (playerState.flags?.['killed_dominic']) {
          response = getResponse(npcId, 'death', playerState);
          effects.relationshipChanges = { [npcId]: -1 };
          followUpTopics = ['forgiveness', 'memory'];
        } else {
          response = getResponse(npcId, 'intro', playerState);
          followUpTopics = ['death', 'memory', 'bubbles'];
        }
        break;

      case 'mrWendell':
        if (!playerState.hasAnsweredRiddle) {
          response = getResponse(npcId, 'riddle', playerState);
          followUpTopics = ['authority', 'respect'];
        } else if (playerState.flags?.['disrespected_wendell']) {
          response = getResponse(npcId, 'authority', playerState);
          effects.relationshipChanges = { [npcId]: -1 };
        } else {
          response = getResponse(npcId, 'intro', playerState);
          followUpTopics = ['multiverse', 'wisdom', 'knowledge'];
        }
        break;

      case 'polly':
        if (playerState.hasCompletedRedemption) {
          response = getResponse(npcId, 'completedRedemption', playerState);
          effects.relationshipChanges = { [npcId]: 2 };
          effects.flagChanges = { 'polly_forgiveness': true };
          followUpTopics = ['memory', 'love'];
        } else if (playerState.killedDominic || playerState.flags?.['killed_dominic']) {
          response = getResponse(npcId, 'dominic', playerState);
          effects.relationshipChanges = { [npcId]: -2 };
          followUpTopics = ['redemption', 'justice'];
        } else if (playerState.quest === 'redemption') {
          response = getResponse(npcId, 'redemption', playerState);
          followUpTopics = ['forgiveness', 'justice'];
        } else {
          response = getResponse(npcId, 'intro', playerState);
          followUpTopics = ['dominic', 'memory'];
        }
        break;

      case 'albie':
        if (playerState.name?.toLowerCase() === 'geoff') {
          response = getResponse(npcId, 'geoff', playerState);
          effects.flagChanges = { 'creator_recognized': true };
          followUpTopics = ['authority', 'protocol'];
        } else if (playerState.resetCount && playerState.resetCount >= 2) {
          response = getResponse(npcId, 'reset', playerState);
          effects.flagChanges = { 'paperwork_required': true };
          followUpTopics = ['bureaucracy', 'forms'];
        } else if (playerState.flags?.['needs_forms']) {
          response = getResponse(npcId, 'bureaucracy', playerState);
          followUpTopics = ['forms', 'order'];
        } else {
          response = getResponse(npcId, 'intro', playerState);
          followUpTopics = ['authority', 'protocol', 'order'];
        }
        break;

      case 'ayla':
        if (playerState.flags?.['seeking_guidance']) {
          response = getResponse(npcId, 'guidance', playerState);
          effects.flagChanges = { 'received_guidance': true };
          followUpTopics = ['wisdom', 'choice'];
        } else if (playerState.flags?.['lattice_connected']) {
          response = getResponse(npcId, 'lattice', playerState);
          effects.relationshipChanges = { [npcId]: 1 };
          followUpTopics = ['connection', 'future'];
        } else {
          response = getResponse(npcId, 'choice', playerState);
          followUpTopics = ['wisdom', 'guidance', 'possibility'];
        }
        break;

      default:
        response = getResponse(npcId, 'intro', playerState);
        followUpTopics = npc.knowledge.slice(0, 3); // First 3 knowledge topics
    }

    return {
      success: true,
      response,
      effects,
      followUpTopics
    };
  } catch (error) {
    console.error('[NPCEngine] Error in npcReact:', error);
    return {
      success: false,
      response: "The NPC seems overwhelmed and says nothing.",
      effects: {}
    };
  }
}

/**
 * Enhanced quest trigger system
 */
export function pollyQuestTrigger(playerState: PlayerState): QuestTriggerResult | null {
  try {
    if (!playerState.quest && (playerState.killedDominic || playerState.flags?.['killed_dominic'])) {
      return {
        quest: 'redemption',
        message: "'If you *really* want forgiveness... there's something I want. Three things, actually. Off you go.'",
        requirements: ['framed_apology', 'universe_signature', 'genuine_remorse'],
        rewards: ['pollys_forgiveness', 'redemption_complete'],
        effects: {
          quest_active: 'redemption',
          quest_giver: 'polly'
        }
      };
    }
    return null;
  } catch (error) {
    console.error('[NPCEngine] Error in quest trigger:', error);
    return null;
  }
}

/**
 * Enhanced quest trigger for Wendell
 */
export function wendellQuestTrigger(playerState: PlayerState): QuestTriggerResult | null {
  try {
    if (playerState.hasAnsweredRiddle && !playerState.flags?.['cosmic_quest_received']) {
      return {
        quest: 'cosmic_knowledge',
        message: "'Impressive. You've earned the right to deeper truths. Seek the Cosmic Codex.'",
        requirements: ['high_wisdom', 'respect_for_authority'],
        rewards: ['cosmic_knowledge', 'reality_manipulation'],
        effects: {
          quest_active: 'cosmic_knowledge',
          quest_giver: 'mrWendell'
        }
      };
    }
    return null;
  } catch (error) {
    console.error('[NPCEngine] Error in Wendell quest trigger:', error);
    return null;
  }
}

/**
 * Missing pushConsoleMessage function implementation
 */
function pushConsoleMessage(
  dispatchMessage: MessageDispatcher | null,
  text: string,
  style: string = 'default'
): void {
  try {
    if (dispatchMessage && typeof dispatchMessage === 'function') {
      dispatchMessage({
        type: 'ADD_MESSAGE',
        payload: { text, style }
      });
    } else {
      console.log(`[${style.toUpperCase()}] ${text}`);
    }
  } catch (error) {
    console.error('[NPCEngine] Error dispatching message:', error);
    console.log(`[${style.toUpperCase()}] ${text}`);
  }
}

/**
 * Enhanced NPC speaking function
 */
export function npcSpeak(
  npcName: string,
  message: string,
  dispatchMessage: MessageDispatcher | null = null
): void {
  try {
    if (!npcName || !message || typeof npcName !== 'string' || typeof message !== 'string') {
      console.warn('[NPCEngine] Invalid parameters for npcSpeak');
      return;
    }

        pushConsoleMessage(dispatchMessage, formattedMessage, 'dialogue');
  } catch (error) {
    console.error('[NPCEngine] Error in npcSpeak:', error);
  }
}

/**
 * Enhanced Ayla response generator
 */
export function generateAylaResponse(
  query: string,
  playerState: PlayerState = {}
): string {
  try {
    if (!query || typeof query !== 'string') {
      return getResponse('ayla', 'intro', playerState);
    }

        if (!ayla) {
      return "'The wisdom you seek is not available.'";
    }

    // Find the best matching topic

    return getResponse('ayla', bestTopic, playerState);
  } catch (error) {
    console.error('[NPCEngine] Error generating Ayla response:', error);
    return "'The wisdom flows in mysterious ways.'";
  }
}

/**
 * Get NPC data for external use
 */
export function getNPCData(npcId: string): NPCData | null {
  try {
    if (!npcId || typeof npcId !== 'string') return null;
    return npcLookupMap.get(npcId) || null;
  } catch (error) {
    console.error('[NPCEngine] Error getting NPC data:', error);
    return null;
  }
}

/**
 * Get all available NPCs
 */
export function getAllNPCs(): string[] {
  try {
    return Array.from(npcLookupMap.keys());
  } catch (error) {
    console.error('[NPCEngine] Error getting all NPCs:', error);
    return [];
  }
}

/**
 * Check if NPC knows about a topic
 */
export function npcKnowsTopic(npcId: string, topic: string): boolean {
  try {
    if (!npcId || !topic || typeof npcId !== 'string' || typeof topic !== 'string') {
      return false;
    }

        if (!npc) return false;

    return npc.knowledge.some(k =>
      k.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(k.toLowerCase())
    ) || Object.keys(npc.responses).includes(topic);
  } catch (error) {
    console.error('[NPCEngine] Error checking topic knowledge:', error);
    return false;
  }
}

/**
 * Add response to NPC (for dynamic content)
 */
export function addNPCResponse(
  npcId: string,
  topic: string,
  responses: string[]
): boolean {
  try {
    if (!npcId || !topic || !responses ||
        typeof npcId !== 'string' || typeof topic !== 'string' ||
        !Array.isArray(responses) || responses.length === 0) {
      return false;
    }

        if (!npc) return false;

    if (!npc.responses[topic]) {
      npc.responses[topic] = [];
    }

    npc.responses[topic].push(...responses);

    // Add to knowledge if not already there
    if (!npc.knowledge.includes(topic)) {
      npc.knowledge.push(topic);
    }

    console.log(`[NPCEngine] Added responses for ${npcId} on topic: ${topic}`);
    return true;
  } catch (error) {
    console.error('[NPCEngine] Error adding NPC response:', error);
    return false;
  }
}

/**
 * Validate NPC data structure
 */
export function validateNPCData(data: unknown): data is NPCData {
  try {
    return typeof data === 'object' &&
           data !== null &&
           typeof (data as NPCData).name === 'string' &&
           Array.isArray((data as NPCData).knowledge) &&
           typeof (data as NPCData).responses === 'object' &&
           (data as NPCData).responses !== null;
  } catch (error) {
    console.error('[NPCEngine] Error validating NPC data:', error);
    return false;
  }
}

/**
 * Get NPCs by knowledge topic
 */
export function getNPCsByTopic(topic: string): string[] {
  try {
    if (!topic || typeof topic !== 'string') return [];

        return npcs ? Array.from(npcs) : [];
  } catch (error) {
    console.error('[NPCEngine] Error getting NPCs by topic:', error);
    return [];
  }
}

/**
 * Get conversation context
 */
export function getConversationContext(
  npcId: string,
  playerState: PlayerState
): ConversationContext | null {
  try {
    if (!npcId || !playerState) return null;

        if (!npc) return null;

    return {
      npcId,
      topic: 'intro',
      playerState,
      roomId: playerState.currentRoom,
      previousTopics: [],
      conversationLength: 0
    };
  } catch (error) {
    console.error('[NPCEngine] Error getting conversation context:', error);
    return null;
  }
}

/**
 * Get NPC relationship level
 */
export function getNPCRelationship(npcId: string, playerState: PlayerState): number {
  try {
        if (relationship !== undefined) return relationship;

        return npc?.relationshipLevels?.default || 0;
  } catch (error) {
    console.error('[NPCEngine] Error getting NPC relationship:', error);
    return 0;
  }
}

// Re-export from npcMemory with proper typing and error handling
export function getNPCStatus(npcId: string): unknown {
  try {
        if (npcMemoryModule && typeof npcMemoryModule.getNPCState === 'function') {
      return npcMemoryModule.getNPCState(npcId);
    }
    return null;
  } catch (error) {
    console.warn('[NPCEngine] NPC memory system not available:', error);
    return null;
  }
}

// Export main functions
export {
  npcReact,
  getResponse,
  getNPCData,
  getAllNPCs,
  npcKnowsTopic,
  addNPCResponse,
  validateNPCData,
  wendellQuestTrigger
};

/**
 * Export utilities for external use
 */
export
export default NPCEngine;

// Unify NPC systems with clear separation of concerns
interface NPCStateManager {
  getState(npcId: string): NPCState;
  updateState(npcId: string, updates: Partial<NPCState>): void;
  calculateRelationshipChange(npcId: string, interaction: Interaction): number;
}

// Add NPC behavior prediction
interface NPCBehaviorPredictor {
  predictResponse(npcId: string, playerAction: string): ResponsePrediction;
  getOptimalConversationPath(npcId: string, goal: ConversationGoal): string[];
}

// Implement relationship momentum system
interface RelationshipMomentum {
  calculateMomentum(npcId: string): number;
  applyMomentumDecay(): void;
  getRelationshipTrajectory(npcId: string): RelationshipTrend;
}
