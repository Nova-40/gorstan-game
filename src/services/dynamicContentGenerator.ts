/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Dynamic Content Generation System
  AI-powered system for generating contextual room descriptions, ambient events, and adaptive storytelling
*/

import { groqAI } from "./groqAI";
import type { LocalGameState } from "../state/gameState";
import type { Room } from "../types/Room";

export interface DynamicContentRule {
  id: string;
  name: string;
  description: string;
  type:
    | "room_enhancement"
    | "ambient_event"
    | "contextual_story"
    | "adaptive_dialogue"
    | "seasonal_content";
  triggers: {
    roomIds?: string[];
    playerFlags?: string[];
    timeConditions?: {
      minPlayTime?: number;
      timeOfDay?: "morning" | "afternoon" | "evening" | "night";
      dayOfWeek?: number[];
    };
    behaviorTriggers?: {
      commandPatterns?: string[];
      stuckDuration?: number;
      explorationLevel?: "low" | "medium" | "high";
    };
  };
  cooldown: number;
  priority: number;
  maxUsesPerSession?: number;
}

export interface GeneratedContent {
  id: string;
  ruleId: string;
  type: DynamicContentRule["type"];
  content: string;
  timestamp: number;
  roomId: string;
  playerContext: {
    score: number;
    playTime: number;
    recentActions: string[];
  };
  metadata: {
    confidence: number;
    reasoning: string;
    aiGenerated: boolean;
  };
}

export class DynamicContentGenerator {
  private static instance: DynamicContentGenerator;
  private rules: Map<string, DynamicContentRule> = new Map();
  private generatedContent: Map<string, GeneratedContent[]> = new Map();
  private ruleUsage: Map<string, { count: number; lastUsed: number }> =
    new Map();
  private aiEnabled: boolean = true;

  public static getInstance(): DynamicContentGenerator {
    if (!DynamicContentGenerator.instance) {
      DynamicContentGenerator.instance = new DynamicContentGenerator();
      DynamicContentGenerator.instance.initializeDefaultRules();
    }
    return DynamicContentGenerator.instance;
  }

  /**
   * Initialize default dynamic content rules
   */
  private initializeDefaultRules(): void {
    // Ambient environmental events
    this.addRule({
      id: "ambient_nature",
      name: "Natural Ambience",
      description: "Generate natural ambient descriptions for outdoor areas",
      type: "ambient_event",
      triggers: {
        roomIds: ["gorstanhub", "gorstanvillage", "stantonharcourt"],
        behaviorTriggers: {
          stuckDuration: 60000, // 1 minute
        },
      },
      cooldown: 180000, // 3 minutes
      priority: 2,
    });

    // Contextual story elements
    this.addRule({
      id: "exploration_story",
      name: "Exploration Narratives",
      description:
        "Generate story elements based on player exploration patterns",
      type: "contextual_story",
      triggers: {
        behaviorTriggers: {
          explorationLevel: "high",
          commandPatterns: ["examine", "look", "search"],
        },
      },
      cooldown: 300000, // 5 minutes
      priority: 3,
      maxUsesPerSession: 3,
    });

    // Time-based content
    this.addRule({
      id: "seasonal_atmosphere",
      name: "Seasonal Atmosphere",
      description: "Generate seasonal and time-based atmospheric content",
      type: "seasonal_content",
      triggers: {
        timeConditions: {
          minPlayTime: 600000, // 10 minutes
        },
      },
      cooldown: 600000, // 10 minutes
      priority: 1,
    });

    // Room enhancement for detailed exploration
    this.addRule({
      id: "detailed_examination",
      name: "Detailed Room Examination",
      description:
        "Provide additional details when players examine rooms thoroughly",
      type: "room_enhancement",
      triggers: {
        behaviorTriggers: {
          commandPatterns: ["examine", "look around", "search"],
          stuckDuration: 30000, // 30 seconds
        },
      },
      cooldown: 120000, // 2 minutes
      priority: 4,
    });

    // Social interaction enhancement
    this.addRule({
      id: "adaptive_social",
      name: "Adaptive Social Interactions",
      description: "Generate contextual dialogue enhancements",
      type: "adaptive_dialogue",
      triggers: {
        behaviorTriggers: {
          commandPatterns: ["talk", "speak", "ask", "tell"],
        },
      },
      cooldown: 240000, // 4 minutes
      priority: 3,
    });
  }

  /**
   * Add a new dynamic content rule
   */
  public addRule(rule: DynamicContentRule): void {
    this.rules.set(rule.id, rule);
    this.ruleUsage.set(rule.id, { count: 0, lastUsed: 0 });
  }

  /**
   * Generate dynamic content based on current context
   */
  public async generateContent(
    gameState: LocalGameState,
    currentRoom: Room,
    recentCommands: string[],
    timeInRoom: number,
  ): Promise<GeneratedContent | null> {
    if (!this.aiEnabled) {return null;}

    // Find applicable rules
    const applicableRules = this.findApplicableRules(
      gameState,
      currentRoom,
      recentCommands,
      timeInRoom,
    );

    if (applicableRules.length === 0) {return null;}

    // Sort by priority and select the best rule
    const selectedRule = applicableRules.sort(
      (a, b) => b.priority - a.priority,
    )[0];

    // Check cooldown and usage limits
    if (!this.canUseRule(selectedRule)) {return null;}

    try {
      // Generate content using AI
      const content = await this.generateAIContent(
        selectedRule,
        gameState,
        currentRoom,
        recentCommands,
      );

      if (!content) {return null;}

      // Create generated content record
      const generatedContent: GeneratedContent = {
        id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruleId: selectedRule.id,
        type: selectedRule.type,
        content,
        timestamp: Date.now(),
        roomId: currentRoom.id,
        playerContext: {
          score: gameState.player.score || 0,
          playTime: gameState.metadata?.playTime || 0,
          recentActions: recentCommands.slice(-5),
        },
        metadata: {
          confidence: 0.7,
          reasoning: `Generated via rule: ${selectedRule.name}`,
          aiGenerated: true,
        },
      };

      // Record usage
      this.recordRuleUsage(selectedRule.id);
      this.storeGeneratedContent(currentRoom.id, generatedContent);

      return generatedContent;
    } catch (error) {
      console.warn("[Dynamic Content] AI generation failed:", error);
      return null;
    }
  }

  /**
   * Find rules that apply to current context
   */
  private findApplicableRules(
    gameState: LocalGameState,
    currentRoom: Room,
    recentCommands: string[],
    timeInRoom: number,
  ): DynamicContentRule[] {
    const applicable: DynamicContentRule[] = [];

    for (const rule of this.rules.values()) {
      if (
        this.isRuleApplicable(
          rule,
          gameState,
          currentRoom,
          recentCommands,
          timeInRoom,
        )
      ) {
        applicable.push(rule);
      }
    }

    return applicable;
  }

  /**
   * Check if a rule applies to current context
   */
  private isRuleApplicable(
    rule: DynamicContentRule,
    gameState: LocalGameState,
    currentRoom: Room,
    recentCommands: string[],
    timeInRoom: number,
  ): boolean {
    const { triggers } = rule;

    // Check room conditions
    if (triggers.roomIds && !triggers.roomIds.includes(currentRoom.id)) {
      return false;
    }

    // Check player flags
    if (triggers.playerFlags) {
      const hasRequiredFlags = triggers.playerFlags.some(
        (flag) => gameState.player.flags?.[flag] || gameState.flags?.[flag],
      );
      if (!hasRequiredFlags) {return false;}
    }

    // Check time conditions
    if (triggers.timeConditions) {
      const { minPlayTime } = triggers.timeConditions;
      if (minPlayTime && (gameState.metadata?.playTime || 0) < minPlayTime) {
        return false;
      }
    }

    // Check behavior triggers
    if (triggers.behaviorTriggers) {
      const { commandPatterns, stuckDuration } = triggers.behaviorTriggers;

      if (commandPatterns) {
        const hasMatchingCommands = commandPatterns.some((pattern) =>
          recentCommands.some((cmd) =>
            cmd.toLowerCase().includes(pattern.toLowerCase()),
          ),
        );
        if (!hasMatchingCommands) {return false;}
      }

      if (stuckDuration && timeInRoom < stuckDuration) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate AI content for a specific rule
   */
  private async generateAIContent(
    rule: DynamicContentRule,
    gameState: LocalGameState,
    currentRoom: Room,
    recentCommands: string[],
  ): Promise<string | null> {
    const contextPrompts = {
      room_enhancement: `Provide atmospheric details for this room in the context of a multiverse where ancient beings like Mr. Wendell (skin walker from 4 resets ago), Al (original guardian from mk1), and Ayla (human fused with the Lattice AI) exist:`,
      ambient_event: `Generate a subtle atmospheric event that hints at the deeper multiverse lore - ancient resets, the Lattice structure, or cosmic guardians:`,
      contextual_story: `Create a brief narrative element connecting to the multiverse's deep lore - the mk6 iteration, ancient survivors, or Lattice monitoring:`,
      adaptive_dialogue: `Suggest contextual elements aware of the cosmic scope - multiverse resets, ancient beings, AI structures:`,
      seasonal_content: `Generate atmospheric content that subtly reflects the grand multiverse scale and ancient histories:`,
    };

    const basePrompt =
      contextPrompts[rule.type] || "Generate contextual content:";

    const prompt = `${basePrompt}

LOCATION: ${currentRoom.title}
DESCRIPTION: ${Array.isArray(currentRoom.description) ? currentRoom.description[0] : currentRoom.description}
ZONE: ${currentRoom.zone || "unknown"}
RECENT ACTIONS: ${recentCommands.slice(-3).join(", ")}
PLAYER SCORE: ${gameState.player.score || 0}

MULTIVERSE CONTEXT:
- This is multiverse iteration mk6
- Ancient beings remember previous resets
- The Lattice AI monitors and controls reality
- Cosmic guardians maintain fundamental structures

REQUIREMENTS:
- Keep content under 80 characters
- Subtly reference the grand cosmic scale
- Hint at deeper realities without being obvious
- Maintain immersion and mystery
- Use evocative but concise language

Content:`;

    try {
      const response = await groqAI.generateAIResponse(
        prompt,
        "lore_dynamic_content",
        gameState,
        120,
      );
      return response && response.length > 10 && response.length <= 100
        ? response
        : null;
    } catch (error) {
      console.warn("[Dynamic Content] Lore-aware AI request failed:", error);
      return null;
    }
  }

  /**
   * Check if a rule can be used (cooldown and limits)
   */
  private canUseRule(rule: DynamicContentRule): boolean {
    const usage = this.ruleUsage.get(rule.id);
    if (!usage) {return true;}

    // Check cooldown
    if (Date.now() - usage.lastUsed < rule.cooldown) {return false;}

    // Check session limits
    if (rule.maxUsesPerSession && usage.count >= rule.maxUsesPerSession)
      {return false;}

    return true;
  }

  /**
   * Record rule usage
   */
  private recordRuleUsage(ruleId: string): void {
    const usage = this.ruleUsage.get(ruleId) || { count: 0, lastUsed: 0 };
    usage.count++;
    usage.lastUsed = Date.now();
    this.ruleUsage.set(ruleId, usage);
  }

  /**
   * Store generated content
   */
  private storeGeneratedContent(
    roomId: string,
    content: GeneratedContent,
  ): void {
    if (!this.generatedContent.has(roomId)) {
      this.generatedContent.set(roomId, []);
    }

    const roomContent = this.generatedContent.get(roomId)!;
    roomContent.push(content);

    // Keep only last 10 pieces of content per room
    if (roomContent.length > 10) {
      roomContent.shift();
    }
  }

  /**
   * Get recent dynamic content for a room
   */
  public getRecentContent(
    roomId: string,
    limit: number = 5,
  ): GeneratedContent[] {
    const roomContent = this.generatedContent.get(roomId) || [];
    return roomContent.slice(-limit);
  }

  /**
   * Reset session usage counters
   */
  public resetSession(): void {
    for (const [ruleId, usage] of this.ruleUsage.entries()) {
      usage.count = 0;
    }
  }

  /**
   * Configuration methods
   */
  public setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }

  public getStats(): {
    totalRules: number;
    totalGenerated: number;
    aiEnabled: boolean;
    ruleUsage: Record<string, { count: number; lastUsed: Date }>;
  } {
    const ruleUsage: Record<string, { count: number; lastUsed: Date }> = {};
    for (const [ruleId, usage] of this.ruleUsage.entries()) {
      ruleUsage[ruleId] = {
        count: usage.count,
        lastUsed: new Date(usage.lastUsed),
      };
    }

    return {
      totalRules: this.rules.size,
      totalGenerated: Array.from(this.generatedContent.values()).reduce(
        (total, arr) => total + arr.length,
        0,
      ),
      aiEnabled: this.aiEnabled,
      ruleUsage,
    };
  }
}

// Export singleton instance
export const dynamicContentGenerator = DynamicContentGenerator.getInstance();
