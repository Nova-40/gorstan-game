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

// src/services/AylaService.ts
// Enhanced Ayla conversation service with advanced intent matching
// Gorstan Game Beta 1

import type { GameState } from "../state/gameState";
import intentsData from "../data/ayla/intents.json";
import edgeCasesData from "../data/ayla/edgeCases.json";

interface ConversationContext {
  history: Array<{
    speaker: "player" | "ayla";
    message: string;
    timestamp: number;
  }>;
  lastTopics: string[];
  sessionStart: number;
}

interface MatchResult {
  confidence: number;
  response: string;
  topic: string;
  variant?: number;
}

// Store conversation context per session
const conversationContexts = new Map<string, ConversationContext>();

/**
 * Enhanced Ayla service with multi-layer intent matching
 */
export class AylaService {
  private static instance: AylaService;

  private constructor() {}

  static getInstance(): AylaService {
    if (!AylaService.instance) {
      AylaService.instance = new AylaService();
    }
    return AylaService.instance;
  }

  /**
   * Get response from Ayla using layered matching system
   */
  getResponse(
    input: string,
    state: GameState,
    sessionId: string = "default",
  ): string {
    const context = this.getOrCreateContext(sessionId);
    const normalizedInput = input.toLowerCase().trim();

    // Update conversation history
    context.history.push({
      speaker: "player",
      message: input,
      timestamp: Date.now(),
    });

    // Layer 1: Exact match
    const exactMatch = this.findExactMatch(normalizedInput, state);
    if (exactMatch) {
      return this.processResponse(exactMatch, context, sessionId);
    }

    // Layer 2: Synonym match
    const synonymMatch = this.findSynonymMatch(normalizedInput, state);
    if (synonymMatch) {
      return this.processResponse(synonymMatch, context, sessionId);
    }

    // Layer 3: Fuzzy match (Levenshtein distance ≤ 2)
    const fuzzyMatch = this.findFuzzyMatch(normalizedInput, state);
    if (fuzzyMatch) {
      return this.processResponse(fuzzyMatch, context, sessionId);
    }

    // Layer 4: Keyword scoring
    const keywordMatch = this.findKeywordMatch(normalizedInput, state);
    if (keywordMatch) {
      return this.processResponse(keywordMatch, context, sessionId);
    }

    // Layer 5: Context-aware fallback
    const contextualFallback = this.getContextualFallback(context, state);
    return this.processResponse(
      {
        confidence: 0.1,
        response: contextualFallback,
        topic: "fallback",
      },
      context,
      sessionId,
    );
  }

  /**
   * Layer 1: Find exact keyword matches
   */
  private findExactMatch(input: string, state: GameState): MatchResult | null {
    // Check flag-based edge cases first
    const flagMatch = this.checkFlagBasedEdgeCases(input, state);
    if (flagMatch) {return flagMatch;}

    // Check location-based responses
    const locationMatch = this.checkLocationBasedResponses(input, state);
    if (locationMatch) {return locationMatch;}

    // Check all intent categories
    const categories = ["lore", "hints", "books", "world_state", "humor"];

    for (const category of categories) {
      const categoryData = (intentsData as any)[category];
      if (!categoryData) {continue;}

      for (const [topicKey, topic] of Object.entries(categoryData)) {
        const topicData = topic as any;

        if (topicData.keywords) {
          for (const keyword of topicData.keywords) {
            if (input.includes(keyword)) {
              return {
                confidence: 1.0,
                response: this.selectResponse(topicData.responses),
                topic: `${category}.${topicKey}`,
              };
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Layer 2: Find synonym matches
   */
  private findSynonymMatch(
    input: string,
    state: GameState,
  ): MatchResult | null {
    const categories = ["lore", "hints", "books", "world_state", "humor"];

    for (const category of categories) {
      const categoryData = (intentsData as any)[category];
      if (!categoryData) {continue;}

      for (const [topicKey, topic] of Object.entries(categoryData)) {
        const topicData = topic as any;

        if (topicData.synonyms) {
          for (const synonym of topicData.synonyms) {
            if (input.includes(synonym)) {
              return {
                confidence: 0.8,
                response: this.selectResponse(topicData.responses),
                topic: `${category}.${topicKey}`,
              };
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Layer 3: Find fuzzy matches using Levenshtein distance
   */
  private findFuzzyMatch(input: string, state: GameState): MatchResult | null {
    const words = input.split(" ");
    const categories = ["lore", "hints", "books", "world_state", "humor"];

    for (const category of categories) {
      const categoryData = (intentsData as any)[category];
      if (!categoryData) {continue;}

      for (const [topicKey, topic] of Object.entries(categoryData)) {
        const topicData = topic as any;

        if (topicData.keywords) {
          for (const keyword of topicData.keywords) {
            for (const word of words) {
              if (
                this.levenshteinDistance(word, keyword) <= 2 &&
                word.length > 3
              ) {
                return {
                  confidence: 0.6,
                  response: this.selectResponse(topicData.responses),
                  topic: `${category}.${topicKey}`,
                };
              }
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Layer 4: Keyword scoring system
   */
  private findKeywordMatch(
    input: string,
    state: GameState,
  ): MatchResult | null {
    const scores: Array<{ score: number; topic: string; responses: string[] }> =
      [];
    const categories = ["lore", "hints", "books", "world_state", "humor"];

    for (const category of categories) {
      const categoryData = (intentsData as any)[category];
      if (!categoryData) {continue;}

      for (const [topicKey, topic] of Object.entries(categoryData)) {
        const topicData = topic as any;
        let score = 0;

        if (topicData.keywords) {
          for (const keyword of topicData.keywords) {
            const words = keyword.split(" ");
            for (const word of words) {
              if (input.includes(word) && word.length > 2) {
                score += word.length; // Longer words get higher scores
              }
            }
          }
        }

        if (score > 0) {
          scores.push({
            score,
            topic: `${category}.${topicKey}`,
            responses: topicData.responses,
          });
        }
      }
    }

    // Sort by score and return best match if above threshold
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 0 && scores[0].score >= 5) {
      return {
        confidence: Math.min(scores[0].score / 20, 0.9),
        response: this.selectResponse(scores[0].responses),
        topic: scores[0].topic,
      };
    }

    return null;
  }

  /**
   * Check flag-based edge cases
   */
  private checkFlagBasedEdgeCases(
    input: string,
    state: GameState,
  ): MatchResult | null {
    const flagData = (edgeCasesData as any).flag_based;

    // Check each flag condition
    for (const [flagKey, caseData] of Object.entries(flagData)) {
      const flagValue = this.getFlagValue(state, flagKey);
      const caseInfo = caseData as any;

      if (flagValue && caseInfo.keywords) {
        for (const keyword of caseInfo.keywords) {
          if (input.includes(keyword)) {
            return {
              confidence: 1.0,
              response: this.selectResponse(caseInfo.responses),
              topic: `flag.${flagKey}`,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check location-based responses
   */
  private checkLocationBasedResponses(
    input: string,
    state: GameState,
  ): MatchResult | null {
    const locationData = (edgeCasesData as any).location_based;
    const currentZone = this.getCurrentZone(state);

    if (currentZone && locationData[currentZone]) {
      const zoneData = locationData[currentZone];

      if (zoneData.keywords) {
        for (const keyword of zoneData.keywords) {
          if (input.includes(keyword)) {
            return {
              confidence: 0.9,
              response: this.selectResponse(zoneData.responses),
              topic: `location.${currentZone}`,
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Get contextual fallback based on conversation history
   */
  private getContextualFallback(
    context: ConversationContext,
    state: GameState,
  ): string {
    const recentTopics = context.lastTopics.slice(-3);
    const hasBookDiscussion = recentTopics.some((topic) =>
      topic.includes("books"),
    );
    const hasHintRequest = recentTopics.some((topic) =>
      topic.includes("hints"),
    );

    const fallbacks = [
      "I'm not sure about that specific topic, but I'm always happy to discuss books, the nature of reality, or help with navigation.",
      "That's an interesting question, though not one I can directly address. What else would you like to explore?",
      "I don't have a specific response for that, but perhaps we could approach it from a different angle?",
      "That's outside my current knowledge patterns. Feel free to ask about lore, hints, or literature.",
      "Intriguing, but I don't have insight on that particular topic. What else can I help with?",
    ];

    if (hasBookDiscussion) {
      fallbacks.push(
        "Since we were discussing books, perhaps you'd like to explore some literary connections?",
      );
      fallbacks.push(
        "Would you like me to tell you more about books or literature?",
      );
    }

    if (hasHintRequest) {
      fallbacks.push(
        "If you're still working on puzzles, I can offer different levels of hints - just ask for light, medium, or heavy hints.",
      );
      fallbacks.push(
        "Do you want me to tell you more about solving puzzles in Gorstan?",
      );
    }

    // Add zone-specific fallbacks
    const currentZone = this.getCurrentZone(state);
    if (currentZone === "glitchrealm") {
      fallbacks.push(
        "The glitch patterns here are affecting my response matrix. Try rephrasing your question?",
      );
    } else if (currentZone === "elfhame") {
      fallbacks.push(
        "The fae magic is making language more poetic than precise. What else might I clarify?",
      );
    }

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Process and format the response
   */
  private processResponse(
    match: MatchResult,
    context: ConversationContext,
    sessionId: string,
  ): string {
    // Add to conversation history
    context.history.push({
      speaker: "ayla",
      message: match.response,
      timestamp: Date.now(),
    });

    // Track topics for context
    context.lastTopics.push(match.topic);
    if (context.lastTopics.length > 10) {
      context.lastTopics.shift();
    }

    // Add conversational memory context for pronouns/follow-ups
    let contextualResponse = this.addConversationalContext(
      match.response,
      context,
    );

    // Apply mood modifiers based on game state
    contextualResponse = this.applyMoodModifiers(
      contextualResponse,
      match.topic,
    );

    return contextualResponse;
  }

  /**
   * Apply mood modifiers based on game state and context
   */
  private applyMoodModifiers(response: string, topic: string): string {
    // If this is about Polly Takeover, add urgency
    if (topic.includes("pollyTakeoverActive") || topic.includes("polly")) {
      const urgentPrefixes = [
        "⚠️ URGENT: ",
        "🚨 CRITICAL: ",
        "⏰ TIME SENSITIVE: ",
      ];
      const prefix =
        urgentPrefixes[Math.floor(Math.random() * urgentPrefixes.length)];
      return prefix + response;
    }

    // For trap-related topics with danger flags
    if (topic.includes("trap") || topic.includes("danger")) {
      return "⚠️ " + response;
    }

    return response;
  }

  /**
   * Add conversational context to handle follow-ups
   */
  private addConversationalContext(
    response: string,
    context: ConversationContext,
  ): string {
    // Simple pronoun resolution based on recent context
    const recentHistory = context.history.slice(-3);

    // If response mentions "there" or "it", we might need context
    if (response.includes("there") || response.includes("it")) {
      const lastPlayerMessage = recentHistory.find(
        (h) => h.speaker === "player",
      )?.message;
      if (lastPlayerMessage) {
        // This is where more sophisticated NLP would go
        // For now, keep it simple
      }
    }

    return response;
  }

  /**
   * Helper methods
   */
  private getOrCreateContext(sessionId: string): ConversationContext {
    if (!conversationContexts.has(sessionId)) {
      conversationContexts.set(sessionId, {
        history: [],
        lastTopics: [],
        sessionStart: Date.now(),
      });
    }
    return conversationContexts.get(sessionId)!;
  }

  private selectResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getFlagValue(state: GameState, flagKey: string): boolean {
    // Map flag keys to actual state flags
    const flagMap: Record<string, string> = {
      dominicDead: "dominicDead",
      pollyTakeoverActive: "pollyTakeoverActive",
      coinPickedUp: "coinPickedUp",
      trapExpert: "trap_expert",
      debugMode: "debugMode",
    };

    const actualFlag = flagMap[flagKey];
    return actualFlag ? Boolean(state.flags?.[actualFlag]) : false;
  }

  private getCurrentZone(state: GameState): string | null {
    const roomId = state.currentRoomId;
    if (!roomId) {return null;}

    // Extract zone from room ID (e.g., "glitchZone_datavoid" -> "glitchrealm")
    if (roomId.includes("glitchZone")) {return "glitchrealm";}
    if (roomId.includes("elfhameZone")) {return "elfhame";}
    if (roomId.includes("mazeZone")) {return "maze";}

    return null;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {matrix[0][i] = i;}
    for (let j = 0; j <= str2.length; j++) {matrix[j][0] = j;}

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Clear conversation context (for new game/reset)
   */
  clearContext(sessionId: string = "default"): void {
    conversationContexts.delete(sessionId);
  }

  /**
   * Get conversation stats for debugging
   */
  getConversationStats(sessionId: string = "default"): any {
    const context = conversationContexts.get(sessionId);
    if (!context) {return null;}

    return {
      messageCount: context.history.length,
      topicsSeen: [...new Set(context.lastTopics)],
      sessionDuration: Date.now() - context.sessionStart,
    };
  }
}

export const aylaService = AylaService.getInstance();
