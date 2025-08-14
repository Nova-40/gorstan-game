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

// Gorstan and characters (c) Geoff Webster 2025
// Intent recognition and entity extraction

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: string[];
  context_clues: string[];
}

// Intent definitions with keyword patterns
const INTENT_PATTERNS: Record<
  string,
  {
    keywords: string[];
    negative_keywords: string[];
    confidence_boost: number;
    requires_context?: string[];
  }
> = {
  greeting: {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good day"],
    negative_keywords: ["goodbye", "bye", "farewell"],
    confidence_boost: 0.8,
  },
  help: {
    keywords: [
      "help",
      "assist",
      "stuck",
      "lost",
      "confused",
      "guidance",
      "hint",
      "clue",
    ],
    negative_keywords: [],
    confidence_boost: 0.9,
  },
  location: {
    keywords: [
      "where",
      "location",
      "room",
      "place",
      "zone",
      "area",
      "go to",
      "find",
      "reach",
    ],
    negative_keywords: ["reset location", "save location"], // Avoid confusion with save mechanics
    confidence_boost: 0.7,
  },
  inventory: {
    keywords: [
      "inventory",
      "items",
      "carrying",
      "have",
      "possess",
      "belongings",
    ],
    negative_keywords: [],
    confidence_boost: 0.8,
  },
  puzzle_hint: {
    keywords: [
      "puzzle",
      "solution",
      "solve",
      "answer",
      "how do i",
      "what should i do",
    ],
    negative_keywords: [],
    confidence_boost: 0.6,
  },
  lore: {
    keywords: [
      "story",
      "history",
      "background",
      "lore",
      "why",
      "explain",
      "tell me about",
    ],
    negative_keywords: [],
    confidence_boost: 0.5,
  },
  ethics: {
    keywords: [
      "should i",
      "is it wrong",
      "ethical",
      "moral",
      "right thing",
      "consequences",
    ],
    negative_keywords: [],
    confidence_boost: 0.7,
  },
  insult: {
    keywords: ["stupid", "dumb", "useless", "terrible", "hate", "awful"],
    negative_keywords: [],
    confidence_boost: 0.8,
  },
  meta: {
    keywords: [
      "game",
      "developer",
      "fourth wall",
      "real",
      "ai",
      "program",
      "code",
    ],
    negative_keywords: [],
    confidence_boost: 0.6,
  },
  time_pressure: {
    keywords: [
      "timer",
      "time",
      "hurry",
      "quick",
      "fast",
      "urgent",
      "polly",
      "takeover",
    ],
    negative_keywords: [],
    confidence_boost: 0.8,
    requires_context: ["timer_active"],
  },
  farewell: {
    keywords: ["goodbye", "bye", "farewell", "see you", "talk later", "thanks"],
    negative_keywords: ["hello", "hi"],
    confidence_boost: 0.8,
  },
};

// Entity patterns for extraction
const ENTITY_PATTERNS: Record<string, RegExp[]> = {
  room_names: [
    /\b(control(?:nexus|room)|crossing|hiddenlab|resetroom|library|cafe|maze)\b/gi,
    /\b(gorstan|lattice|glitch|intro|london|maze)(?:zone|hub|village)?\b/gi,
  ],
  item_names: [
    /\b(coin|napkin|schrodinger|blue\s*(?:switch|button)|extrapolator)\b/gi,
    /\b(coffee|cup|book|key|note|paper)\b/gi,
  ],
  npc_names: [
    /\b(ayla|polly|dominic|wendell|chef|albie|morthos|al|librarian)\b/gi,
    /\bmr\.?\s*wendell\b/gi,
  ],
  game_mechanics: [
    /\b(timer|takeover|reset|teleport|save|load|flag|achievement)\b/gi,
    /\b(lives|death|respawn|inventory|command)\b/gi,
  ],
  directions: [/\b(north|south|east|west|up|down|jump|sit|back|out)\b/gi],
};

/**
 * Classify the intent of a player utterance
 */
export function classifyIntent(
  utterance: string,
  context: any = {},
): IntentResult {
  const normalizedUtterance = utterance.toLowerCase().trim();

  const results: Array<{ intent: string; confidence: number }> = [];

  // Check each intent pattern
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    let confidence = 0;

    // Check for positive keywords
    const positiveMatches = pattern.keywords.filter((keyword) =>
      normalizedUtterance.includes(keyword.toLowerCase()),
    ).length;

    // Check for negative keywords (reduce confidence)
    const negativeMatches = pattern.negative_keywords.filter((keyword) =>
      normalizedUtterance.includes(keyword.toLowerCase()),
    ).length;

    // Calculate base confidence
    if (positiveMatches > 0) {
      confidence =
        (positiveMatches / pattern.keywords.length) * pattern.confidence_boost;
      confidence -= negativeMatches * 0.3; // Reduce for negative matches
    }

    // Context requirements
    if (pattern.requires_context) {
      const hasRequiredContext = pattern.requires_context.every((ctx) => {
        switch (ctx) {
          case "timer_active":
            return context.timers?.pollyTakeover?.active;
          default:
            return true;
        }
      });

      if (!hasRequiredContext) {
        confidence *= 0.5; // Reduce confidence if context not met
      }
    }

    if (confidence > 0.1) {
      results.push({ intent, confidence });
    }
  }

  // Sort by confidence and get best match
  results.sort((a, b) => b.confidence - a.confidence);

  // Extract entities
  const entities = extractEntities(utterance);

  // Get context clues
  const contextClues = getContextClues(normalizedUtterance, context);

  // Return best intent or default to 'general' if no good match
  const bestMatch = results[0];
  if (!bestMatch || bestMatch.confidence < 0.3) {
    return {
      intent: "general",
      confidence: 0.2,
      entities,
      context_clues: contextClues,
    };
  }

  return {
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    entities,
    context_clues: contextClues,
  };
}

/**
 * Extract entities from utterance
 */
function extractEntities(utterance: string): string[] {
  const entities: string[] = [];

  for (const [category, patterns] of Object.entries(ENTITY_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = utterance.match(pattern);
      if (matches) {
        entities.push(...matches.map((match) => match.toLowerCase().trim()));
      }
    }
  }

  // Remove duplicates and return
  return [...new Set(entities)];
}

/**
 * Get context clues from the utterance and game state
 */
function getContextClues(utterance: string, context: any): string[] {
  const clues: string[] = [];

  // Time pressure indicators
  if (context.timers?.pollyTakeover?.active) {
    if (context.timers.pollyTakeover.timeRemaining < 60000) {
      clues.push("urgent_time_pressure");
    } else if (context.timers.pollyTakeover.timeRemaining < 180000) {
      clues.push("moderate_time_pressure");
    } else {
      clues.push("mild_time_pressure");
    }
  }

  // Location context
  if (context.roomId) {
    if (context.roomId.includes("reset")) {clues.push("in_critical_room");}
    if (context.roomId.includes("library")) {clues.push("in_knowledge_area");}
    if (context.roomId.includes("maze")) {clues.push("in_navigation_challenge");}
  }

  // Behavioral context
  if (utterance.includes("?") || utterance.includes("how"))
    {clues.push("seeking_information");}
  if (utterance.includes("!") || utterance.includes("please"))
    {clues.push("emotional_emphasis");}
  if (utterance.split(" ").length > 10) {clues.push("detailed_query");}
  if (utterance.split(" ").length < 3) {clues.push("brief_query");}

  // Question types
  if (utterance.startsWith("what")) {clues.push("what_question");}
  if (utterance.startsWith("where")) {clues.push("where_question");}
  if (utterance.startsWith("how")) {clues.push("how_question");}
  if (utterance.startsWith("why")) {clues.push("why_question");}
  if (utterance.startsWith("should")) {clues.push("decision_question");}

  return clues;
}

/**
 * Determine if a query is asking for a puzzle solution
 */
export function isPuzzleSolutionRequest(
  utterance: string,
  entities: string[],
): {
  isPuzzleRequest: boolean;
  specificPuzzle?: string;
  urgencyLevel: number;
} {
  const normalizedUtterance = utterance.toLowerCase();

  // Direct solution keywords
  const solutionKeywords = ["solution", "answer", "solve", "how do i"];
  const hasSolutionKeyword = solutionKeywords.some((keyword) =>
    normalizedUtterance.includes(keyword),
  );

  // Specific puzzle indicators
  let specificPuzzle: string | undefined;
  if (
    entities.includes("coin") ||
    normalizedUtterance.includes("schrodinger")
  ) {
    specificPuzzle = "schrodinger_coin";
  } else if (
    entities.includes("blue switch") ||
    entities.includes("blue button")
  ) {
    specificPuzzle = "blue_switch";
  } else if (entities.includes("extrapolator")) {
    specificPuzzle = "library_extrapolator";
  } else if (entities.includes("maze")) {
    specificPuzzle = "maze_navigation";
  }

  // Calculate urgency level
  let urgencyLevel = 0;
  if (
    normalizedUtterance.includes("urgent") ||
    normalizedUtterance.includes("hurry")
  ) {
    urgencyLevel += 0.5;
  }
  if (
    normalizedUtterance.includes("please") ||
    normalizedUtterance.includes("help")
  ) {
    urgencyLevel += 0.3;
  }
  if (
    normalizedUtterance.includes("stuck") ||
    normalizedUtterance.includes("lost")
  ) {
    urgencyLevel += 0.4;
  }

  return {
    isPuzzleRequest: hasSolutionKeyword && Boolean(specificPuzzle),
    specificPuzzle,
    urgencyLevel: Math.min(1, urgencyLevel),
  };
}

/**
 * Disambiguate similar intents based on context
 */
export function disambiguateIntent(
  results: IntentResult[],
  context: any,
): IntentResult {
  // If we have a clear winner, return it
  if (results.length === 1 || results[0].confidence > 0.8) {
    return results[0];
  }

  // Context-based disambiguation
  if (results.length > 1) {
    const sorted = [...results].sort((a, b) => b.confidence - a.confidence);

    // If time pressure is active, boost time_pressure intent
    if (context.timers?.pollyTakeover?.active) {
      const timePressureResult = sorted.find(
        (r) => r.intent === "time_pressure",
      );
      if (timePressureResult) {
        timePressureResult.confidence += 0.2;
      }
    }

    // If in a puzzle room, boost puzzle_hint intent
    if (
      context.roomId?.includes("maze") ||
      context.roomId?.includes("puzzle")
    ) {
      const puzzleResult = sorted.find((r) => r.intent === "puzzle_hint");
      if (puzzleResult) {
        puzzleResult.confidence += 0.2;
      }
    }

    // Re-sort and return best
    sorted.sort((a, b) => b.confidence - a.confidence);
    return sorted[0];
  }

  return results[0];
}
