/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Unified AI Intelligence System
  Coordinates AI between Ayla hints, miniquest recommendations, and dynamic content generation
*/

import {
  aiMiniquestService,
  type AIMiniquestRecommendation,
  type PlayerProfile,
} from "./aiMiniquestService";
import {
  aylaHints,
  type AylaHintContext,
  type AylaHintResponse,
} from "./aylaHintSystem";
import { groqAI } from "./groqAI";
import {
  dynamicContentGenerator,
  type GeneratedContent,
} from "./dynamicContentGenerator";
import type { LocalGameState } from "../state/gameState";
import type { Room } from "../types/Room";
// Lazy-load MiniquestController where needed to keep initial bundle light

export interface UnifiedAIContext {
  gameState: LocalGameState;
  currentRoom: Room;
  recentCommands: string[];
  timeInRoom: number;
  failedAttempts: string[];
  playerProfile?: PlayerProfile;
  activeMiniquests?: any[];
  completedMiniquests?: string[];
}

export interface AIGuidanceResponse {
  type: "hint" | "miniquest" | "story" | "encouragement" | "dynamic_content";
  priority: "low" | "medium" | "high" | "urgent";
  content: string;
  source: "ayla" | "miniquest_ai" | "unified_ai" | "dynamic_generator";
  actionSuggestions?: string[];
  followUp?: string;
  metadata?: {
    confidence: number;
    reasoning: string;
    category: string;
    dynamicContent?: GeneratedContent;
  };
}

export interface DynamicContent {
  type:
    | "room_description"
    | "ambient_event"
    | "contextual_story"
    | "adaptive_dialogue";
  content: string;
  triggers: string[];
  conditions: (gameState: LocalGameState) => boolean;
  cooldown: number;
  lastTriggered?: number;
}

export class UnifiedAIIntelligence {
  private static instance: UnifiedAIIntelligence;
  private lastGuidanceTime: number = 0;
  private guidanceCooldown: number = 20000; // 20 seconds between unified guidance
  private dynamicContent: Map<string, DynamicContent[]> = new Map();
  private aiEnabled: boolean = true;
  private crossSystemLearning: Map<string, any> = new Map();

  public static getInstance(): UnifiedAIIntelligence {
    if (!UnifiedAIIntelligence.instance) {
      UnifiedAIIntelligence.instance = new UnifiedAIIntelligence();
    }
    return UnifiedAIIntelligence.instance;
  }

  /**
   * Main AI guidance orchestrator - coordinates all AI systems
   */
  async getUnifiedGuidance(
    context: UnifiedAIContext,
  ): Promise<AIGuidanceResponse | null> {
    if (
      !this.aiEnabled ||
      Date.now() - this.lastGuidanceTime < this.guidanceCooldown
    ) {
      return null;
    }

    try {
      // Get insights from all AI systems
      const [aylaResponse, miniquestInsights, dynamicOpportunities] =
        await Promise.all([
          this.getAylaGuidance(context),
          this.getMiniquestGuidance(context),
          this.analyzeDynamicOpportunities(context),
        ]);

      // Prioritize responses based on player needs
      const prioritizedResponse = this.prioritizeGuidance(
        aylaResponse,
        miniquestInsights,
        dynamicOpportunities,
        context,
      );

      if (prioritizedResponse) {
        this.lastGuidanceTime = Date.now();
        this.recordCrossSystemLearning(context, prioritizedResponse);
        return prioritizedResponse;
      }

      return null;
    } catch (error) {
      console.warn("[Unified AI] Guidance generation failed:", error);
      return null;
    }
  }

  /**
   * Get Ayla-specific guidance with miniquest awareness
   */
  private async getAylaGuidance(
    context: UnifiedAIContext,
  ): Promise<AIGuidanceResponse | null> {
    const aylaContext: AylaHintContext = {
      currentRoom: context.currentRoom,
      gameState: context.gameState,
      recentCommands: context.recentCommands,
      timeInRoom: context.timeInRoom,
      failedAttempts: context.failedAttempts,
      stuckDuration: context.timeInRoom,
    };

    const aylaHint = await aylaHints.shouldAylaInterrupt(aylaContext);
    if (!aylaHint) {return null;}

    // Enhance Ayla's hint with miniquest awareness
    if (context.activeMiniquests && context.activeMiniquests.length > 0) {
      const enhancedHint = await this.enhanceAylaHintWithMiniquests(
        aylaHint,
        context.activeMiniquests,
        context.gameState,
      );
      if (enhancedHint) {
        return {
          type: "hint",
          priority: aylaHint.urgency as any,
          content: enhancedHint,
          source: "ayla",
          followUp: aylaHint.followUp,
          metadata: {
            confidence: 0.8,
            reasoning: "Ayla guidance enhanced with miniquest awareness",
            category: aylaHint.hintType,
          },
        };
      }
    }

    return {
      type: "hint",
      priority: aylaHint.urgency as any,
      content: aylaHint.hintText,
      source: "ayla",
      followUp: aylaHint.followUp,
      metadata: {
        confidence: 0.7,
        reasoning: "Standard Ayla guidance",
        category: aylaHint.hintType,
      },
    };
  }

  /**
   * Get miniquest-specific guidance with Ayla personality
   */
  private async getMiniquestGuidance(
    context: UnifiedAIContext,
  ): Promise<AIGuidanceResponse | null> {
    try {
      const MiniquestController = (
        await import("../engine/miniquestController")
      ).default;
      const miniquestController = MiniquestController.getInstance();
      const miniquestStatus = miniquestController.getAIStatus();

      if (!miniquestStatus.enabled) {return null;}

      // Get AI miniquest recommendations
      const recommendations = await aiMiniquestService.getRecommendedQuests(
        context.currentRoom.id,
        context.gameState,
        2,
      );

      if (recommendations && recommendations.length > 0) {
        const topRecommendation = recommendations[0];

        // Frame miniquest guidance through Ayla's personality
        const aylaFramedGuidance = await this.frameMiniquestInAylaVoice(
          topRecommendation,
          context,
        );

        return {
          type: "miniquest",
          priority: topRecommendation.confidence > 0.8 ? "high" : "medium",
          content: aylaFramedGuidance,
          source: "miniquest_ai",
          actionSuggestions: [
            `miniquests attempt ${topRecommendation.questId}`,
            "miniquests list",
          ],
          metadata: {
            confidence: topRecommendation.confidence,
            reasoning: topRecommendation.reasoning,
            category: "quest_guidance",
          },
        };
      }

      return null;
    } catch (error) {
      console.warn("[Unified AI] Miniquest guidance failed:", error);
      return null;
    }
  }

  /**
   * Enhance Ayla's hints with miniquest context
   */
  private async enhanceAylaHintWithMiniquests(
    aylaHint: AylaHintResponse,
    activeMiniquests: any[],
    gameState: LocalGameState,
  ): Promise<string | null> {
    const questContext = activeMiniquests
      .map((q) => `${q.title}: ${q.description}`)
      .join("; ");

    const prompt = `Enhance this Ayla hint with awareness of active miniquests:

ORIGINAL HINT: "${aylaHint.hintText}"
ACTIVE QUESTS: ${questContext}
PLAYER LOCATION: ${gameState.currentRoomId}

Rewrite the hint to subtly reference relevant quests without being heavy-handed. Keep Ayla's cosmic, wise voice. Stay under 150 characters.

Enhanced hint:`;

    try {
      const enhancedHint = await groqAI.generateAIResponse(
        prompt,
        "hint_enhancement",
        gameState,
        200,
      );
      return enhancedHint && enhancedHint.length > 20 ? enhancedHint : null;
    } catch (error) {
      console.warn("[Unified AI] Hint enhancement failed:", error);
      return null;
    }
  }

  /**
   * Frame miniquest recommendations in Ayla's voice
   */
  private async frameMiniquestInAylaVoice(
    recommendation: AIMiniquestRecommendation,
    context: UnifiedAIContext,
  ): Promise<string> {
    const prompt = `Frame this miniquest recommendation in Ayla's cosmic, wise voice:

QUEST: ${recommendation.questId}
REASONING: ${recommendation.reasoning}
HINTS: ${recommendation.hints.join(", ")}
PLAYER LOCATION: ${context.currentRoom.title}

Transform this into Ayla's style - cosmic, guiding, mysterious but helpful. Reference "threads of possibility" or "cosmic purpose" naturally. Keep under 150 characters.

Ayla's guidance:`;

    try {
      const aylaVoice = await groqAI.generateAIResponse(
        prompt,
        "ayla_framing",
        context.gameState,
        200,
      );
      if (aylaVoice && aylaVoice.length > 20) {
        return aylaVoice;
      }
    } catch (error) {
      console.warn("[Unified AI] Ayla framing failed:", error);
    }

    // Fallback to template-based Ayla voice
    return `*cosmic threads shimmer* ${recommendation.reasoning} The path of ${recommendation.questId} calls to you... ✨`;
  }

  /**
   * Analyze opportunities for dynamic content generation
   */
  private async analyzeDynamicOpportunities(
    context: UnifiedAIContext,
  ): Promise<AIGuidanceResponse | null> {
    // Use the new dynamic content generator
    try {
      const dynamicContent = await dynamicContentGenerator.generateContent(
        context.gameState,
        context.currentRoom,
        context.recentCommands,
        context.timeInRoom,
      );

      if (dynamicContent) {
        return {
          type: "dynamic_content",
          priority: this.mapDynamicContentPriority(dynamicContent.type),
          content: dynamicContent.content,
          source: "dynamic_generator",
          metadata: {
            confidence: dynamicContent.metadata.confidence,
            reasoning: dynamicContent.metadata.reasoning,
            category: dynamicContent.type,
            dynamicContent,
          },
        };
      }
    } catch (error) {
      console.warn("[Unified AI] Dynamic content generation failed:", error);
    }

    return null;
  }

  /**
   * Map dynamic content type to priority
   */
  private mapDynamicContentPriority(
    contentType: string,
  ): "low" | "medium" | "high" | "urgent" {
    const priorityMap: Record<string, "low" | "medium" | "high" | "urgent"> = {
      ambient_event: "low",
      room_enhancement: "medium",
      contextual_story: "medium",
      adaptive_dialogue: "high",
      seasonal_content: "low",
    };
    return priorityMap[contentType] || "low";
  }

  /**
   * Prioritize guidance from multiple AI systems
   */
  private prioritizeGuidance(
    aylaResponse: AIGuidanceResponse | null,
    miniquestResponse: AIGuidanceResponse | null,
    dynamicResponse: AIGuidanceResponse | null,
    context: UnifiedAIContext,
  ): AIGuidanceResponse | null {
    const responses = [aylaResponse, miniquestResponse, dynamicResponse].filter(
      Boolean,
    );
    if (responses.length === 0) {return null;}

    // Prioritization logic
    const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };

    responses.sort((a, b) => {
      const aPriority = priorities[a!.priority];
      const bPriority = priorities[b!.priority];

      if (aPriority !== bPriority) {return bPriority - aPriority;}

      // If same priority, prefer based on confidence
      const aConfidence = a!.metadata?.confidence || 0.5;
      const bConfidence = b!.metadata?.confidence || 0.5;
      return bConfidence - aConfidence;
    });

    return responses[0];
  }

  /**
   * Record learning data across systems
   */
  private recordCrossSystemLearning(
    context: UnifiedAIContext,
    response: AIGuidanceResponse,
  ): void {
    const learningKey = `${context.currentRoom.id}_${response.type}`;
    const learningData = {
      timestamp: Date.now(),
      roomId: context.currentRoom.id,
      responseType: response.type,
      playerCommands: context.recentCommands.slice(-5),
      confidence: response.metadata?.confidence || 0.5,
      effectiveness: null, // Will be updated based on player response
    };

    this.crossSystemLearning.set(learningKey, learningData);
  }

  /**
   * Dynamic content generation
   */
  private async generateDynamicContent(
    content: DynamicContent,
    context: UnifiedAIContext,
  ): Promise<string | null> {
    const prompt = `Generate dynamic ${content.type} for the current context:

ROOM: ${context.currentRoom.title}
DESCRIPTION: ${Array.isArray(context.currentRoom.description) ? context.currentRoom.description[0] : context.currentRoom.description}
RECENT PLAYER ACTIONS: ${context.recentCommands.slice(-3).join(", ")}
TIME IN ROOM: ${Math.floor(context.timeInRoom / 1000)} seconds

Generate subtle, atmospheric content that enhances immersion without disrupting gameplay. Keep it under 100 characters.

Dynamic content:`;

    try {
      return await groqAI.generateAIResponse(
        prompt,
        "dynamic_content",
        context.gameState,
        150,
      );
    } catch (error) {
      console.warn("[Unified AI] Dynamic content generation failed:", error);
      return null;
    }
  }

  private shouldTriggerDynamicContent(
    content: DynamicContent,
    context: UnifiedAIContext,
  ): boolean {
    if (
      content.lastTriggered &&
      Date.now() - content.lastTriggered < content.cooldown
    ) {
      return false;
    }

    if (!content.conditions(context.gameState)) {
      return false;
    }

    return content.triggers.some((trigger) =>
      context.recentCommands.some((cmd) => cmd.includes(trigger)),
    );
  }

  private async createNewDynamicContent(
    context: UnifiedAIContext,
  ): Promise<AIGuidanceResponse | null> {
    const prompt = `Create subtle atmospheric content for this room:

ROOM: ${context.currentRoom.title}
PLAYER BEHAVIOR: ${context.recentCommands.slice(-3).join(", ")}
TIME SPENT: ${Math.floor(context.timeInRoom / 1000)} seconds

Generate a brief, atmospheric observation that adds to immersion. Could be environmental details, subtle sounds, or mood descriptions. Keep under 80 characters.

Atmospheric content:`;

    try {
      const content = await groqAI.generateAIResponse(
        prompt,
        "atmospheric",
        context.gameState,
        120,
      );
      if (content && content.length > 10) {
        return {
          type: "dynamic_content",
          priority: "low",
          content: `*${content}*`,
          source: "dynamic_generator",
          metadata: {
            confidence: 0.5,
            reasoning: "Atmospheric enhancement",
            category: "ambient",
          },
        };
      }
    } catch (error) {
      console.warn("[Unified AI] Atmospheric content failed:", error);
    }

    return null;
  }

  /**
   * Configuration methods
   */
  public setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
    aylaHints.resetCooldown();
    dynamicContentGenerator.setAIEnabled(enabled);
  }

  public setGuidanceSensitivity(level: "low" | "medium" | "high"): void {
    switch (level) {
      case "low":
        this.guidanceCooldown = 60000; // 1 minute
        aylaHints.setHintSensitivity("low");
        break;
      case "medium":
        this.guidanceCooldown = 30000; // 30 seconds
        aylaHints.setHintSensitivity("medium");
        break;
      case "high":
        this.guidanceCooldown = 15000; // 15 seconds
        aylaHints.setHintSensitivity("high");
        break;
    }
  }

  public addDynamicContent(roomId: string, content: DynamicContent): void {
    if (!this.dynamicContent.has(roomId)) {
      this.dynamicContent.set(roomId, []);
    }
    this.dynamicContent.get(roomId)!.push(content);
  }

  public getAIStats(): {
    enabled: boolean;
    lastGuidance: Date | null;
    crossSystemLearnings: number;
    dynamicContentStats: any;
  } {
    return {
      enabled: this.aiEnabled,
      lastGuidance: this.lastGuidanceTime
        ? new Date(this.lastGuidanceTime)
        : null,
      crossSystemLearnings: this.crossSystemLearning.size,
      dynamicContentStats: dynamicContentGenerator.getStats(),
    };
  }
}

// Export singleton instance
export const unifiedAI = UnifiedAIIntelligence.getInstance();
