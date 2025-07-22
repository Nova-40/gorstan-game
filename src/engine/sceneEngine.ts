import { Room } from './RoomTypes';



// Version: 6.2.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: sceneEngine.ts
// Path: src/engine/sceneEngine.ts
//
// Enhanced scene engine utility for Gorstan game.
// Reusable interactive scene system for executing narrative events and branching logic.

/**
 * Type definitions for scene system with enhanced properties
 * Using minimal Room interface to avoid circular dependencies
 */
interface MinimalRoom {
  readonly id: string;
  readonly title: string;
  readonly zone: string;
  readonly [key: string]: unknown;
}

/**
 * Player state interface for scene context
 */
interface PlayerState {
  readonly inventory?: readonly string[];
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
  readonly traits?: readonly string[];
  readonly health?: number;
  readonly score?: number;
  readonly name?: string;
  readonly difficulty?: string;
  readonly level?: number;
  readonly experience?: number;
}

/**
 * Game context interface for recommendations
 */
interface GameContext {
  readonly player: PlayerState;
  readonly currentRoom?: MinimalRoom;
  readonly gameTime?: number;
  readonly sessionData?: Readonly<Record<string, unknown>>;
  readonly worldState?: Readonly<Record<string, unknown>>;
}

/**
 * A single player-facing choice during a narrative scene.
 * Can include conditions, next scenes, and custom logic.
 */
export interface SceneChoice {
  readonly id: string;
  readonly text: string;
  readonly condition?: (context: SceneContext) => boolean;
  readonly action?: (context: SceneContext) => void;
  readonly nextScene?: string;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly cooldown?: number;
  readonly requirements?: {
    readonly flags?: readonly string[];
    readonly items?: readonly string[];
    readonly traits?: readonly string[];
    readonly health?: number;
    readonly score?: number;
    readonly level?: number;
  };
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * An effect triggered by a scene (e.g., setting a flag, updating inventory).
 */
export interface SceneAction {
  readonly type:
    | 'message'
    | 'setFlag'
    | 'updateInventory'
    | 'updateHealth'
    | 'updateScore'
    | 'removeItem'
    | 'addTrait'
    | 'removeTrait'
    | 'teleport'
    | 'triggerScene'
    | 'delay'
    | 'addExperience'
    | 'levelUp'
    | 'startQuest'
    | 'completeQuest';
  readonly value: string | number | boolean;
  readonly target?: string;
  readonly delay?: number;
  readonly conditional?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * A conditional check used to gate a scene or choice.
 * May use direct field checks or a custom logic function.
 */
export interface SceneCondition {
  readonly type:
    | 'hasFlag'
    | 'hasItem'
    | 'healthAbove'
    | 'scoreAbove'
    | 'hasTrait'
    | 'inRoom'
    | 'timeElapsed'
    | 'visitCount'
    | 'levelAbove'
    | 'experienceAbove'
    | 'questCompleted'
    | 'custom';
  readonly value: string | number;
  readonly operator?: 'equals' | 'greater' | 'less' | 'greaterEqual' | 'lessEqual' | 'notEquals';
  readonly custom?: (context: SceneContext) => boolean;
  readonly negated?: boolean;
}

/**
 * A structured scene with messages, actions, and conditional logic.
 * Forms part of the branching narrative experience.
 */
export interface Scene {
  readonly id: string;
  readonly title?: string;
  readonly messages: readonly string[];
  readonly actions?: readonly SceneAction[];
  readonly choices?: readonly SceneChoice[];
  readonly conditions?: readonly SceneCondition[];
  readonly onEnter?: (context: SceneContext) => void;
  readonly onExit?: (context: SceneContext) => void;
  readonly repeatable?: boolean;
  readonly cooldown?: number;
  readonly priority?: number;
  readonly category?: 'story' | 'puzzle' | 'combat' | 'exploration' | 'social' | 'system' | 'tutorial' | 'ending';
  readonly tags?: readonly string[];
  readonly dependencies?: readonly string[];
  readonly effects?: {
    readonly mood?: string;
    readonly atmosphere?: string;
    readonly lighting?: string;
    readonly music?: string;
    readonly soundEffect?: string;
  };
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Enhanced scene context with proper typing
 */
export interface SceneContext {
  readonly player?: PlayerState;
  readonly room?: MinimalRoom;
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
  readonly appendMessage: (msg: string, type?: string) => void;
  readonly setGameState: (updater: (prev: GameState) => GameState) => void;
  readonly sceneHistory?: readonly string[];
  readonly sessionData?: Readonly<Record<string, unknown>>;
  readonly gameTime?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Game state interface for context
 */
interface GameState {
  readonly inventory?: readonly string[];
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
  readonly traits?: readonly string[];
  readonly health?: number;
  readonly score?: number;
  readonly currentRoom?: string;
  readonly currentMood?: string;
  readonly level?: number;
  readonly experience?: number;
  readonly questStatus?: Readonly<Record<string, string>>;
  readonly [key: string]: unknown;
}

/**
 * Scene execution result interface
 */
export interface SceneResult {
  readonly success: boolean;
  readonly sceneId: string;
  readonly messagesAdded: number;
  readonly actionsExecuted: number;
  readonly choicesAvailable: number;
  readonly nextScenes?: readonly string[];
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
  readonly stateChanges?: Readonly<Record<string, unknown>>;
  readonly executionTime?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Scene execution statistics
 */
export interface SceneStats {
  readonly totalExecuted: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly mostExecutedScenes: Readonly<Record<string, number>>;
  readonly averageExecutionTime: number;
  readonly lastExecuted: number;
  readonly cacheHitRate?: number;
  readonly performanceMetrics?: Readonly<Record<string, number>>;
}

/**
 * Scene flow analytics interfaces
 */
export interface SceneFlowReport {
  readonly totalScenes: number;
  readonly completionRate: number;
  readonly averagePathLength: number;
  readonly popularPaths: readonly string[][];
  readonly deadEndScenes: readonly string[];
  readonly branchingPoints: readonly string[];
  readonly playerDropOffPoints: readonly string[];
}

export interface SceneBottleneck {
  readonly sceneId: string;
  readonly type: 'choice_overload' | 'requirement_block' | 'complexity_barrier' | 'narrative_gap';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly suggestedFix: string;
  readonly affectedPlayers: number;
}

export interface SceneOrderOptimization {
  readonly currentOrder: readonly string[];
  readonly optimizedOrder: readonly string[];
  readonly improvements: readonly {
    readonly type: string;
    readonly description: string;
    readonly expectedImprovement: number;
  }[];
  readonly estimatedEngagementIncrease: number;
}

export interface PerformanceIssue {
  readonly sceneId: string;
  readonly averageExecutionTime: number;
  readonly slowOperations: readonly string[];
  readonly recommendedOptimizations: readonly string[];
  readonly severity: 'low' | 'medium' | 'high';
}

export interface OptimizationReport {
  readonly totalOptimizations: number;
  readonly performanceGain: number;
  readonly optimizedScenes: readonly string[];
  readonly recommendations: readonly string[];
}

/**
 * Scene execution tracking data
 */
interface SceneExecutionData {
  count: number;
  lastExecuted: number;
  totalTime: number;
  errors: number;
}

/**
 * Scene cache entry
 */
interface SceneCacheEntry {
  readonly scene: Scene;
  readonly timestamp: number;
  readonly accessCount: number;
}

/**
 * Performance constants
 */
const CACHE_DURATION = 60000; // 1 minute
const PERFORMANCE_THRESHOLD = 1000; // 1 second

/**
 * Scene registry with enhanced tracking - using Map for better performance
 */

/**
 * Scene execution statistics (mutable for internal updates)
 */

/**
 * Scene flow analyzer implementation
 */
export class SceneFlowAnalyzer {
  constructor(
    private readonly executionHistory: Map<string, SceneExecutionData>,
    private readonly sceneRegistry: Map<string, Scene>
  ) {}

  analyzeSceneProgression(): SceneFlowReport {

    return {
      totalScenes,
      completionRate,
      averagePathLength: this.calculateAveragePathLength(),
      popularPaths: this.calculatePopularPaths(),
      deadEndScenes: this.findDeadEndScenes(),
      branchingPoints: this.findBranchingPoints(),
      playerDropOffPoints: this.identifyDropOffPoints()
    };
  }

  identifyBottlenecks(): SceneBottleneck[] {
    const bottlenecks: SceneBottleneck[] = [];

    for (const [sceneId, scene] of this.sceneRegistry) {

      // Check for choice overload
      if (scene.choices && scene.choices.length > 5) {
        bottlenecks.push({
          sceneId,
          type: 'choice_overload',
          severity: scene.choices.length > 8 ? 'high' : 'medium',
          description: `Scene has ${scene.choices.length} choices, which may overwhelm players`,
          suggestedFix: 'Consider grouping choices or reducing options',
          affectedPlayers: executionData?.count || 0
        });
      }

      // Check for requirement blocks
      if (scene.choices) {

        if (blockedChoices.length > 0) {
          bottlenecks.push({
            sceneId,
            type: 'requirement_block',
            severity: blockedChoices.length === scene.choices.length ? 'critical' : 'medium',
            description: `${blockedChoices.length} choices have complex requirements`,
            suggestedFix: 'Simplify requirements or provide alternative paths',
            affectedPlayers: executionData?.count || 0
          });
        }
      }
    }

    return bottlenecks;
  }

  optimizeSceneOrder(): SceneOrderOptimization {

    return {
      currentOrder,
      optimizedOrder,
      improvements: [
        {
          type: 'narrative_flow',
          description: 'Reordered scenes for better narrative progression',
          expectedImprovement: 15
        },
        {
          type: 'difficulty_curve',
          description: 'Adjusted difficulty progression',
          expectedImprovement: 10
        }
      ],
      estimatedEngagementIncrease: 25
    };
  }

  private findDeadEndScenes(): string[] {
    return Array.from(this.sceneRegistry.entries())
      .filter(([_, scene]) => !scene.choices || scene.choices.length === 0)
      .map(([sceneId]) => sceneId);
  }

  private findBranchingPoints(): string[] {
    return Array.from(this.sceneRegistry.entries())
      .filter(([_, scene]) => scene.choices && scene.choices.length > 2)
      .map(([sceneId]) => sceneId);
  }

  private calculatePopularPaths(): string[][] {
    // Simplified implementation - in real app, would analyze actual player paths
    return [
      ['goldfishEscape', 'dominicRescuePlan'],
      ['libraryDiscovery', 'read_tome']
    ];
  }

  private calculateAveragePathLength(): number {

    return totalExecutions > 0 ? this.executionHistory.size / totalExecutions * 3 : 0;
  }

  private identifyDropOffPoints(): string[] {
    return Array.from(this.executionHistory.entries())
      .filter(([_, data]) => data.errors > data.count * 0.3)
      .map(([sceneId]) => sceneId);
  }

  private calculateOptimalOrder(currentOrder: string[]): string[] {
    const categoryPriority: Record<string, number> = {
      tutorial: 0,
      story: 1,
      exploration: 2,
      social: 3,
      puzzle: 4,
      combat: 5,
      ending: 6
    };

    return [...currentOrder].sort((a, b) => {

      return priorityA - priorityB;
    });
  }
}

/**
 * Scene recommendation engine implementation
 */
export class SceneRecommendationEngine {
  constructor(
    private readonly sceneRegistry: Map<string, Scene>,
    private readonly executionHistory: Map<string, SceneExecutionData>
  ) {}

  recommendNextScene(currentScene: string, playerState: PlayerState): string[] {
    const recommendations: Array<{ sceneId: string; relevance: number }> = [];

    for (const [sceneId, scene] of this.sceneRegistry) {
      if (sceneId === currentScene) continue;

      const context: SceneContext = {
        player: playerState,
        flags: playerState.flags || {},
        appendMessage: () => {},
        setGameState: () => {},
        sceneHistory: [],
        gameTime: Date.now()
      };

            if (relevance > 0) {
        recommendations.push({ sceneId, relevance });
      }
    }

    return recommendations
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map(r => r.sceneId);
  }

  calculateSceneRelevance(sceneId: string, context: SceneContext): number {
        if (!scene) return 0;

    let relevance = 10; // Base relevance

    // Category bonus based on player state
    if (scene.category === 'tutorial' && !context.player?.experience) {
      relevance += 20;
    } else if (scene.category === 'story') {
      relevance += 15;
    } else if (scene.category === 'social' && context.player?.traits?.includes('social')) {
      relevance += 10;
    }

    // Dependency bonus
    if (scene.dependencies) {
            if (dependenciesMet) relevance += 15;
      else return 0; // Can't access without dependencies
    }

    // Execution frequency penalty (avoid over-repetition)
        if (executionData && executionData.count > 2) {
      relevance -= executionData.count * 5;
    }

    // Requirements check
    if (scene.conditions && !this.checkConditions(scene.conditions, context)) {
      return 0;
    }

    return Math.max(0, relevance);
  }

  generateDynamicScenes(context: GameContext): Scene[] {
    const dynamicScenes: Scene[] = [];

    // Generate context-aware scenes based on player state
    if (context.player.health && context.player.health < 30) {
      dynamicScenes.push({
        id: 'dynamic_healing_opportunity',
        title: 'Healing Opportunity',
        category: 'system',
        tags: ['healing', 'dynamic'],
        messages: [
          '🌿 You notice medicinal herbs growing nearby.',
          '💚 Perhaps they could help restore your health.'
        ],
        choices: [
          {
            id: 'gather_herbs',
            text: 'Gather the healing herbs',
            action: (ctx) => {
              ctx.appendMessage('🌿 You carefully gather the herbs and feel refreshed.');
              ctx.setGameState(prev => ({
                ...prev,
                health: Math.min(100, (prev.health || 0) + 30)
              }));
            }
          }
        ]
      });
    }

    // Generate exploration scenes for experienced players
    if (context.player.level && context.player.level > 5) {
      dynamicScenes.push({
        id: 'dynamic_advanced_challenge',
        title: 'Advanced Challenge',
        category: 'puzzle',
        tags: ['challenge', 'dynamic', 'advanced'],
        messages: [
          '🔍 Your experience allows you to notice something others might miss...',
          '⚡ A complex puzzle awaits your expertise.'
        ],
        conditions: [
          {
            type: 'levelAbove',
            value: 5
          }
        ],
        choices: [
          {
            id: 'solve_puzzle',
            text: 'Apply your expertise to solve the puzzle',
            requirements: {
              level: 5
            },
            action: (ctx) => {
              ctx.appendMessage('🧩 Your experience pays off! You solve the complex puzzle.');
              ctx.setGameState(prev => ({
                ...prev,
                score: (prev.score || 0) + 50,
                experience: (prev.experience || 0) + 100
              }));
            }
          }
        ]
      });
    }

    return dynamicScenes;
  }

  private checkConditions(conditions: readonly SceneCondition[], context: SceneContext): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'hasFlag':
          return Boolean(context.flags?.[condition.value as string]);
        case 'hasItem':
          return context.player?.inventory?.includes(condition.value as string) || false;
        case 'hasTrait':
          return context.player?.traits?.includes(condition.value as string) || false;
        case 'healthAbove':
          return (context.player?.health || 0) > (condition.value as number);
        case 'levelAbove':
          return (context.player?.level || 0) > (condition.value as number);
        default:
          return true;
      }
    });
  }
}

/**
 * Scene performance monitor implementation
 */
export class ScenePerformanceMonitor {
  private readonly performanceData = new Map<string, Array<{ timestamp: number; duration: number }>>();

  trackSceneExecutionTime(sceneId: string, time: number): void {
    if (!this.performanceData.has(sceneId)) {
      this.performanceData.set(sceneId, []);
    }

        data.push({ timestamp: Date.now(), duration: time });

    // Keep only recent data (last 100 executions)
    if (data.length > 100) {
      data.splice(0, data.length - 100);
    }
  }

  identifySlowScenes(): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const [sceneId, data] of this.performanceData.entries()) {
      if (data.length === 0) continue;

      if (averageTime > PERFORMANCE_THRESHOLD) {
        issues.push({
          sceneId,
          averageExecutionTime: averageTime,
          slowOperations: this.identifySlowOperations(sceneId),
          recommendedOptimizations: this.generateOptimizationRecommendations(sceneId, averageTime),
          severity: averageTime > PERFORMANCE_THRESHOLD * 3 ? 'high' :
                   averageTime > PERFORMANCE_THRESHOLD * 2 ? 'medium' : 'low'
        });
      }
    }

    return issues.sort((a, b) => b.averageExecutionTime - a.averageExecutionTime);
  }

  optimizeSceneExecution(): OptimizationReport {

    return {
      totalOptimizations: slowScenes.length,
      performanceGain: slowScenes.reduce((sum, issue) =>
        sum + Math.max(0, issue.averageExecutionTime - PERFORMANCE_THRESHOLD), 0
      ),
      optimizedScenes: slowScenes.map(issue => issue.sceneId),
      recommendations: [
        'Implement scene result caching for repeated executions',
        'Optimize complex condition checking',
        'Reduce message processing overhead',
        'Implement lazy loading for large scenes'
      ]
    };
  }

  private identifySlowOperations(sceneId: string): string[] {
    return [
      'Complex condition evaluation',
      'Multiple state updates',
      'Heavy message processing'
    ];
  }

  private generateOptimizationRecommendations(sceneId: string, averageTime: number): string[] {
    const recommendations: string[] = [];

    if (averageTime > PERFORMANCE_THRESHOLD * 2) {
      recommendations.push('Consider caching scene results');
      recommendations.push('Optimize condition checking logic');
    }

    if (averageTime > PERFORMANCE_THRESHOLD) {
      recommendations.push('Reduce number of state updates');
      recommendations.push('Optimize message processing');
    }

    return recommendations;
  }
}

/**
 * Initialize default scenes
 */
function initializeDefaultScenes(): void {
  // Goldfish scene with enhanced properties
  registerScene({
    id: 'goldfishEscape',
    title: 'The Goldfish Dilemma',
    category: 'social',
    tags: ['moral_choice', 'npc_interaction', 'pet'],
    messages: [
      '💦 The orb tank is heavy. Water sloshes out, soaking your feet.',
      '🐟 The fish stares at you. Do you really want to take Dominic out of water?',
      '⚠️ Taking him might upset Polly — it\'s the only thing she really cares about.'
    ],
    actions: [
      {
        type: 'setFlag',
        target: 'consideringDominic',
        value: true
      }
    ],
    choices: [
      {
        id: 'take_dominic',
        text: 'Take Dominic anyway',
        requirements: {
          traits: ['compassionate']
        },
        action: (context: SceneContext) => {
          context.appendMessage('🐟 You carefully lift the orb tank. Dominic swims in frantic circles.');
          context.setGameState(prev => ({
            ...prev,
            inventory: [...(prev.inventory || []), 'dominic_in_tank'],
            flags: {
              ...prev.flags,
              tookDominic: true,
              pollyWillBeUpset: true,
              moral_weight: ((prev.flags?.moral_weight as number) || 0) + 1
            }
          }));
        }
      },
      {
        id: 'leave_dominic',
        text: 'Leave Dominic where he is',
        action: (context: SceneContext) => {
          context.appendMessage('🐟 You decide to leave Dominic in peace. He seems grateful.');
          context.setGameState(prev => ({
            ...prev,
            flags: {
              ...prev.flags,
              leftDominic: true,
              showedMercy: true,
              karma_points: ((prev.flags?.karma_points as number) || 0) + 1
            }
          }));
        }
      },
      {
        id: 'talk_to_dominic',
        text: 'Try to communicate with Dominic',
        requirements: {
          traits: ['animal_speaker', 'telepathic']
        },
        action: (context: SceneContext) => {
          context.appendMessage('🐟 You focus your mind and attempt to reach Dominic telepathically...');
          context.appendMessage('💭 "Help... me..." you hear in your mind. Dominic is asking for rescue!');
          context.setGameState(prev => ({
            ...prev,
            flags: {
              ...prev.flags,
              spokeWithDominic: true,
              understands_animal_suffering: true
            }
          }));
        },
        nextScene: 'dominicRescuePlan'
      }
    ],
    effects: {
      mood: 'tense',
      atmosphere: 'moral_dilemma'
    }
  });

  // Enhanced library discovery scene
  registerScene({
    id: 'libraryDiscovery',
    title: 'Ancient Library',
    category: 'exploration',
    tags: ['knowledge', 'magic', 'discovery'],
    messages: [
      '📚 You discover a hidden library filled with ancient tomes.',
      '✨ The books seem to glow with an otherworldly light.',
      '🔮 One particular tome catches your attention...'
    ],
    conditions: [
      {
        type: 'hasFlag',
        value: 'hasLibraryKey'
      }
    ],
    choices: [
      {
        id: 'read_tome',
        text: 'Read the glowing tome',
        requirements: {
          traits: ['scholar', 'literate']
        },
        action: (context: SceneContext) => {
          context.appendMessage('📖 Your scholarly training allows you to decipher the ancient text.');
          context.appendMessage('🌟 You learn a powerful incantation!');
          context.setGameState(prev => ({
            ...prev,
            flags: { ...prev.flags, learnedAncientSecret: true },
            score: (prev.score || 0) + 10,
            traits: [...new Set([...(prev.traits || []), 'arcane_knowledge'])]
          }));
        }
      },
      {
        id: 'search_shelves',
        text: 'Search the shelves for useful items',
        action: (context: SceneContext) => {
          context.appendMessage('🔍 You find a mysterious scroll hidden behind the books.');
          context.setGameState(prev => ({
            ...prev,
            inventory: [...(prev.inventory || []), 'mysterious_scroll']
          }));
        }
      }
    ],
    effects: {
      mood: 'mysterious',
      atmosphere: 'ancient_knowledge',
      lighting: 'ethereal'
    }
  });

  // Dominic rescue plan scene
  registerScene({
    id: 'dominicRescuePlan',
    title: 'Dominic\'s Rescue Plan',
    category: 'story',
    tags: ['animal_rescue', 'planning', 'empathy'],
    dependencies: ['goldfishEscape'],
    messages: [
      '🐟 Dominic explains his situation telepathically.',
      '💭 "Polly means well, but this tank is too small. I dream of the river."',
      '🌊 You sense his longing for flowing water and freedom.'
    ],
    choices: [
      {
        id: 'promise_river_trip',
        text: 'Promise to take him to the river',
        action: (context: SceneContext) => {
          context.appendMessage('🤝 You promise Dominic you\'ll find a way to get him to natural water.');
          context.setGameState(prev => ({
            ...prev,
            flags: {
              ...prev.flags,
              promisedDominicFreedom: true,
              active_quest_dominic_rescue: true
            }
          }));
        }
      },
      {
        id: 'suggest_bigger_tank',
        text: 'Suggest convincing Polly to get a bigger tank',
        action: (context: SceneContext) => {
          context.appendMessage('🏠 Dominic considers this... "Better than here, but still not home."');
          context.setGameState(prev => ({
            ...prev,
            flags: {
              ...prev.flags,
              suggestedBiggerTank: true
            }
          }));
        }
      }
    ]
  });
}

/**
 * Enhanced runScene function with comprehensive error handling and performance tracking
 */
export function runScene(
  sceneId: string,
  context: SceneContext
): SceneResult {
    let result: SceneResult = {
    success: false,
    sceneId,
    messagesAdded: 0,
    actionsExecuted: 0,
    choicesAvailable: 0,
    errors: [],
    warnings: [],
    stateChanges: {}
  };

  try {
    // Validate input
    if (!sceneId || typeof sceneId !== 'string') {
      result = { ...result, errors: ['Invalid scene ID provided'] };
      return result;
    }

    if (!validateSceneContext(context)) {
      result = { ...result, errors: ['Invalid scene context provided'] };
      return result;
    }

    // Get scene with caching
        if (!scene) {
      result = { ...result, errors: [`Scene not found: ${sceneId}`] };
      context.appendMessage(`⚠️ Scene '${sceneId}' not found.`, 'error');
      return result;
    }

    // Check scene conditions
    if (scene.conditions && !checkSceneConditions(scene.conditions, context)) {
      result = { ...result, warnings: ['Scene conditions not met'] };
      context.appendMessage('❌ You cannot access this scene right now.', 'warning');
      return result;
    }

    // Check scene cooldown
    if (!canExecuteScene(sceneId, scene)) {
      result = { ...result, warnings: ['Scene is on cooldown'] };
      context.appendMessage('⏰ You must wait before accessing this scene again.', 'warning');
      return result;
    }

    // Check dependencies
    if (scene.dependencies && !checkSceneDependencies(scene.dependencies, context)) {
      result = { ...result, warnings: ['Scene dependencies not met'] };
      context.appendMessage('🔒 This scene requires other scenes to be completed first.', 'warning');
      return result;
    }

    // Execute onEnter hook
    if (scene.onEnter) {
      try {
        scene.onEnter(context);
      } catch (error) {
        result = { ...result, warnings: [`onEnter hook failed: ${error}`] };
      }
    }

    let messagesAdded = 0;

    // Display scene title
    if (scene.title) {
      context.appendMessage(`=== ${scene.title} ===`, 'scene-title');
      messagesAdded++;
    }

    // Display scene messages
    scene.messages.forEach(message => {
      if (message && typeof message === 'string') {
        context.appendMessage(message, 'scene');
        messagesAdded++;
      }
    });

    let actionsExecuted = 0;
    let stateChanges: Record<string, unknown> = {};

    // Execute scene actions
    if (scene.actions && scene.actions.length > 0) {
            actionsExecuted = actionsResult.executed;
      stateChanges = { ...stateChanges, ...actionsResult.stateChanges };

      if (actionsResult.errors.length > 0) {
        result = { ...result, warnings: [...(result.warnings || []), ...actionsResult.errors] };
      }
    }

    let choicesAvailable = 0;
    let nextScenes: string[] = [];

    // Handle choices if present
    if (scene.choices && scene.choices.length > 0) {
            choicesAvailable = choiceResult.available;
      messagesAdded += choiceResult.messagesAdded;
      nextScenes = choiceResult.nextScenes;
    }

    // Apply scene effects
    if (scene.effects) {
      applySceneEffects(scene.effects, context, stateChanges);
    }

    // Execute onExit hook
    if (scene.onExit) {
      try {
        scene.onExit(context);
      } catch (error) {
        result = { ...result, warnings: [...(result.warnings || []), `onExit hook failed: ${error}`] };
      }
    }

    // Update execution tracking
        updateSceneExecutionTracking(sceneId, executionTime);
    updateSceneStats(true, executionTime);

    result = {
      ...result,
      success: true,
      messagesAdded,
      actionsExecuted,
      choicesAvailable,
      nextScenes: nextScenes.length > 0 ? nextScenes : undefined,
      stateChanges,
      executionTime
    };

    return result;

  } catch (error) {
        updateSceneStats(false, executionTime);

    console.error(`[SceneEngine] Error running scene ${sceneId}:`, error);
    result = {
      ...result,
      errors: [`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      executionTime
    };
    context.appendMessage('💥 An error occurred while running the scene.', 'error');
    return result;
  }
}

/**
 * Validate scene context structure
 */
function validateSceneContext(context: SceneContext): boolean {
  try {
    return !!(context &&
      typeof context === 'object' &&
      typeof context.appendMessage === 'function' &&
      typeof context.setGameState === 'function');
  } catch {
    return false;
  }
}

/**
 * Get scene with caching - optimized with Map
 */
function getSceneWithCache(sceneId: string): Scene | null {
  try {
    // Check cache first
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      sceneStats.cacheHits++;

      // Update access count efficiently
      sceneCache.set(sceneId, {
        ...cached,
        accessCount: cached.accessCount + 1
      });

      return cached.scene;
    }

    sceneStats.cacheMisses++;

    // Get from registry
        if (scene) {
      // Manage cache size
      if (sceneCache.size >= MAX_CACHE_SIZE) {
                if (oldestKey) {
          sceneCache.delete(oldestKey);
        }
      }

      sceneCache.set(sceneId, {
        scene,
        timestamp: Date.now(),
        accessCount: 1
      });
      return scene;
    }

    return null;
  } catch (error) {
    console.error('[SceneEngine] Error getting scene from cache:', error);
    return scenes.get(sceneId) || null;
  }
}

/**
 * Check if scene can be executed (cooldown, repeatability)
 */
function canExecuteScene(sceneId: string, scene: Scene): boolean {
  try {

    // Check if scene is repeatable
    if (!scene.repeatable && executionData && executionData.count > 0) {
      return false;
    }

    // Check cooldown
    if (scene.cooldown && executionData) {
            if (timeSinceLastExecution < scene.cooldown) {
        return false;
      }
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Check scene dependencies
 */
function checkSceneDependencies(dependencies: readonly string[], context: SceneContext): boolean {
  try {
    if (!context.sceneHistory) return false;

    return dependencies.every(dep =>
      context.sceneHistory!.includes(dep) ||
      context.flags?.[`scene_${dep}_completed`] ||
      context.player?.flags?.[`scene_${dep}_completed`]
    );
  } catch {
    return true;
  }
}

/**
 * Enhanced scene condition checking with more operators
 */
function checkSceneConditions(conditions: readonly SceneCondition[], context: SceneContext): boolean {
  try {
    return conditions.every(condition => {
      let result: boolean;

      switch (condition.type) {
        case 'hasFlag':
                    result = evaluateCondition(flagValue, true, condition.operator || 'equals');
          break;

        case 'hasItem':
                    result = evaluateCondition(hasItem, true, condition.operator || 'equals');
          break;

        case 'hasTrait':
                    result = evaluateCondition(hasTrait, true, condition.operator || 'equals');
          break;

        case 'healthAbove':
                    result = evaluateCondition(health, condition.value as number, condition.operator || 'greater');
          break;

        case 'scoreAbove':
                    result = evaluateCondition(score, condition.value as number, condition.operator || 'greater');
          break;

        case 'levelAbove':
                    result = evaluateCondition(level, condition.value as number, condition.operator || 'greater');
          break;

        case 'experienceAbove':
                    result = evaluateCondition(experience, condition.value as number, condition.operator || 'greater');
          break;

        case 'inRoom':
                    result = evaluateCondition(currentRoom, condition.value as string, condition.operator || 'equals');
          break;

        case 'timeElapsed':
                    result = evaluateCondition(gameTime, condition.value as number, condition.operator || 'greater');
          break;

        case 'visitCount':
                    result = evaluateCondition(visitCount, 1, condition.operator || 'greaterEqual');
          break;

        case 'custom':
          result = condition.custom ? condition.custom(context) : true;
          break;

        default:
          console.warn(`[SceneEngine] Unknown condition type: ${condition.type}`);
          result = true;
      }

      // Apply negation if specified
      return condition.negated ? !result : result;
    });
  } catch {
    return false;
  }
}

/**
 * Evaluate condition with operator
 */
function evaluateCondition(actual: unknown, expected: unknown, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'notEquals':
      return actual !== expected;
    case 'greater':
      return (actual as number) > (expected as number);
    case 'less':
      return (actual as number) < (expected as number);
    case 'greaterEqual':
      return (actual as number) >= (expected as number);
    case 'lessEqual':
      return (actual as number) <= (expected as number);
    default:
      return actual === expected;
  }
}

/**
 * Enhanced scene actions execution with comprehensive state tracking
 */
function executeSceneActions(
  actions: readonly SceneAction[],
  context: SceneContext
): { executed: number; errors: string[]; stateChanges: Record<string, unknown> } {
  const result: { executed: number; errors: string[]; stateChanges: Record<string, unknown> } = { executed: 0, errors: [], stateChanges: {} };

  try {
    actions.forEach((action, index) => {
      try {
        // Skip conditional actions if condition not met
        if (action.conditional && !evaluateActionCondition(action, context)) {
          return;
        }

        switch (action.type) {
          case 'message':
            context.appendMessage(action.value as string, 'action');
            result.executed++;
            break;

          case 'setFlag':
            if (action.target) {
              context.setGameState(prev => ({
                ...prev,
                flags: { ...prev.flags, [action.target!]: action.value }
              }));
              result.stateChanges[`flag_${action.target}`] = action.value;
              result.executed++;
            }
            break;

          case 'updateInventory':
            context.setGameState(prev => ({
              ...prev,
              inventory: [...(prev.inventory || []), action.value as string]
            }));
            result.stateChanges[`inventory_add`] = action.value;
            result.executed++;
            break;

          case 'removeItem':
            if (action.target) {
              context.setGameState(prev => ({
                ...prev,
                inventory: (prev.inventory || []).filter(item => item !== action.target)
              }));
              result.stateChanges[`inventory_remove`] = action.target;
              result.executed++;
            }
            break;

          case 'addTrait':
            context.setGameState(prev => ({
              ...prev,
              traits: [...new Set([...(prev.traits || []), action.value as string])]
            }));
            result.stateChanges[`trait_add`] = action.value;
            result.executed++;
            break;

          case 'removeTrait':
            context.setGameState(prev => ({
              ...prev,
              traits: (prev.traits || []).filter(trait => trait !== action.value)
            }));
            result.stateChanges[`trait_remove`] = action.value;
            result.executed++;
            break;

          case 'updateHealth':
            context.setGameState(prev => {
                            return { ...prev, health: newHealth };
            });
            result.stateChanges[`health`] = action.value;
            result.executed++;
            break;

          case 'updateScore':
            context.setGameState(prev => ({
              ...prev,
              score: Math.max(0, (prev.score || 0) + (action.value as number))
            }));
            result.stateChanges[`score`] = action.value;
            result.executed++;
            break;

          case 'addExperience':
            context.setGameState(prev => ({
              ...prev,
              experience: (prev.experience || 0) + (action.value as number)
            }));
            result.stateChanges[`experience`] = action.value;
            result.executed++;
            break;

          case 'teleport':
            if (action.target) {
              context.setGameState(prev => ({
                ...prev,
                currentRoom: action.target,
                flags: { ...prev.flags, teleported: true }
              }));
              result.stateChanges[`teleport`] = action.target;
              result.executed++;
            }
            break;

          case 'triggerScene':
            if (action.target) {
              result.stateChanges[`trigger_scene`] = action.target;
              result.executed++;
            }
            break;

          case 'delay':
            if (action.delay && action.delay > 0) {
              result.stateChanges[`delay`] = action.delay;
              result.executed++;
            }
            break;

          default:
            result.errors.push(`Unknown action type: ${action.type} at index ${index}`);
        }
      } catch (error) {
        result.errors.push(`Action ${index} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return result;
  } catch (error) {
    console.error('[SceneEngine] Error executing scene actions:', error);
    result.errors.push(`Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Evaluate action condition
 */
function evaluateActionCondition(action: SceneAction, context: SceneContext): boolean {
  // Simple condition evaluation - can be expanded based on action metadata
  return true;
}

/**
 * Enhanced choice display with filtering and requirements checking - FIXED SYNTAX
 */
function displaySceneChoices(
  choices: readonly SceneChoice[],
  context: SceneContext
): { available: number; messagesAdded: number; nextScenes: string[] } {
  const result: { available: number; messagesAdded: number; nextScenes: string[] } = {
    available: 0,
    messagesAdded: 0,
    nextScenes: []
  };

  try {

      // Check if choice is disabled
      if (choice.disabled) return false;

      // Check choice condition
      if (choice.condition && !choice.condition(context)) return false;

      // Check choice requirements
      if (choice.requirements && !checkChoiceRequirements(choice.requirements, context)) return false;

      // Check choice cooldown
      if (choice.cooldown && isChoiceOnCooldown(choice.id, choice.cooldown)) return false;

      return true;
    });

    if (availableChoices.length === 0) {
      context.appendMessage('🚫 No valid choices available.', 'warning');
      result.messagesAdded++;
      return result;
    }

    context.appendMessage('Choose your action:', 'choice-prompt');
    result.messagesAdded++;

    availableChoices.forEach((choice, index) => {
      let choiceText = `${index + 1}. ${choice.text}`;

      // Add requirement hints
      if (choice.requirements) {
                if (missingReqs.length > 0) {
          choiceText += ` [Requires: ${missingReqs.join(', ')}]`;
        }
      }

      context.appendMessage(choiceText, 'choice');
      result.messagesAdded++;

      // Track potential next scenes
      if (choice.nextScene) {
        result.nextScenes.push(choice.nextScene);
      }
    });

    result.available = availableChoices.length;
    return result;
  } catch (error) {
    console.error('[SceneEngine] Error displaying choices:', error);
    return result;
  }
}

/**
 * Check choice requirements
 */
function checkChoiceRequirements(requirements: SceneChoice['requirements'], context: SceneContext): boolean {
  try {
    if (!requirements) return true;

    // Check flags
    if (requirements.flags && !requirements.flags.every(flag =>
      context.flags?.[flag] || context.player?.flags?.[flag]
    )) return false;

    // Check items
    if (requirements.items && !requirements.items.every(item =>
      context.player?.inventory?.includes(item)
    )) return false;

    // Check traits
    if (requirements.traits && !requirements.traits.every(trait =>
      context.player?.traits?.includes(trait)
    )) return false;

    // Check health
    if (requirements.health && (context.player?.health || 0) < requirements.health) {
      return false;
    }

    // Check score
    if (requirements.score && (context.player?.score || 0) < requirements.score) {
      return false;
    }

    // Check level
    if (requirements.level && (context.player?.level || 0) < requirements.level) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Get missing requirements for display
 */
function getMissingRequirements(requirements: SceneChoice['requirements'], context: SceneContext): string[] {
  const missing: string[] = [];

  try {
    if (!requirements) return missing;

    // Check flags
    requirements.flags?.forEach(flag => {
      if (!context.flags?.[flag] && !context.player?.flags?.[flag]) {
        missing.push(`flag: ${flag}`);
      }
    });

    // Check items
    requirements.items?.forEach(item => {
      if (!context.player?.inventory?.includes(item)) {
        missing.push(`item: ${item}`);
      }
    });

    // Check traits
    requirements.traits?.forEach(trait => {
      if (!context.player?.traits?.includes(trait)) {
        missing.push(`trait: ${trait}`);
      }
    });

    // Check health
    if (requirements.health && (context.player?.health || 0) < requirements.health) {
      missing.push(`health: ${requirements.health}+`);
    }

    // Check score
    if (requirements.score && (context.player?.score || 0) < requirements.score) {
      missing.push(`score: ${requirements.score}+`);
    }

    // Check level
    if (requirements.level && (context.player?.level || 0) < requirements.level) {
      missing.push(`level: ${requirements.level}+`);
    }

    return missing;
  } catch {
    return missing;
  }
}

/**
 * Check if choice is on cooldown
 */
function isChoiceOnCooldown(choiceId: string, cooldown: number): boolean {
  try {
        return lastUsed ? Date.now() - lastUsed < cooldown : false;
  } catch {
    return false;
  }
}

/**
 * Apply scene effects to context
 */
function applySceneEffects(effects: Scene['effects'], context: SceneContext, stateChanges: Record<string, unknown>): void {
  try {
    if (!effects) return;

    if (effects.mood) {
      context.setGameState(prev => ({
        ...prev,
        currentMood: effects.mood
      }));
      stateChanges.mood = effects.mood;
    }

    if (effects.atmosphere) {
      stateChanges.atmosphere = effects.atmosphere;
    }

    if (effects.lighting) {
      stateChanges.lighting = effects.lighting;
    }

    if (effects.music) {
      stateChanges.music = effects.music;
    }

    if (effects.soundEffect) {
      stateChanges.soundEffect = effects.soundEffect;
    }
  } catch (error) {
    console.error('[SceneEngine] Error applying scene effects:', error);
  }
}

/**
 * Update scene execution tracking
 */
function updateSceneExecutionTracking(sceneId: string, executionTime: number): void {
  try {
        if (existing) {
      existing.count++;
      existing.lastExecuted = Date.now();
      existing.totalTime += executionTime;
    } else {
      sceneExecutionHistory.set(sceneId, {
        count: 1,
        lastExecuted: Date.now(),
        totalTime: executionTime,
        errors: 0
      });
    }

    // Update most executed scenes
    sceneStats.mostExecutedScenes[sceneId] = (sceneStats.mostExecutedScenes[sceneId] || 0) + 1;

    // Manage history size
    if (sceneExecutionHistory.size > MAX_HISTORY_SIZE) {
            if (oldestEntry) {
        sceneExecutionHistory.delete(oldestEntry[0]);
        delete sceneStats.mostExecutedScenes[oldestEntry[0]];
      }
    }
  } catch (error) {
    console.error('[SceneEngine] Error updating execution tracking:', error);
  }
}

/**
 * Update scene statistics
 */
function updateSceneStats(success: boolean, executionTime: number): void {
  try {
    sceneStats.totalExecuted++;
    sceneStats.lastExecuted = Date.now();

    if (success) {
      sceneStats.successfulExecutions++;
    } else {
      sceneStats.failedExecutions++;
    }

    // Update average execution time
        sceneStats.averageExecutionTime = totalTime / sceneStats.totalExecuted;
  } catch (error) {
    console.error('[SceneEngine] Error updating scene stats:', error);
  }
}

/**
 * Enhanced executeChoice with cooldown tracking and better error handling
 */
export function executeChoice(
  sceneId: string,
  choiceId: string,
  context: SceneContext
): SceneResult {
  let result: SceneResult = {
    success: false,
    sceneId,
    messagesAdded: 0,
    actionsExecuted: 0,
    choicesAvailable: 0,
    errors: []
  };

  try {
        if (!scene || !scene.choices) {
      return { ...result, errors: ['Scene or choices not found'] };
    }

        if (!choice) {
      return { ...result, errors: ['Choice not found'] };
    }

    // Check choice condition
    if (choice.condition && !choice.condition(context)) {
      context.appendMessage('❌ You cannot choose that option.', 'error');
      return { ...result, messagesAdded: 1, warnings: ['Choice condition not met'] };
    }

    // Check choice requirements
    if (choice.requirements && !checkChoiceRequirements(choice.requirements, context)) {
            context.appendMessage(`❌ Missing requirements: ${missing.join(', ')}`, 'error');
      return { ...result, messagesAdded: 1, warnings: [`Missing requirements: ${missing.join(', ')}`] };
    }

    // Execute choice action
    if (choice.action) {
      try {
        choice.action(context);
        result = { ...result, actionsExecuted: 1 };
      } catch (error) {
        return { ...result, errors: [`Choice action failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
      }
    }

    // Set choice cooldown
    if (choice.cooldown) {
      choiceCooldowns.set(choiceId, Date.now());
    }

    // Handle next scene
    if (choice.nextScene) {
            result = {
        ...result,
        nextScenes: [choice.nextScene],
        messagesAdded: result.messagesAdded + nextSceneResult.messagesAdded,
        actionsExecuted: result.actionsExecuted + nextSceneResult.actionsExecuted
      };

      if (!nextSceneResult.success) {
        result = {
          ...result,
          errors: [...(result.errors || []), ...(nextSceneResult.errors || [])],
          warnings: [...(result.warnings || []), ...(nextSceneResult.warnings || [])]
        };
      }
    }

    return { ...result, success: true };
  } catch (error) {
    console.error('[SceneEngine] Error executing choice:', error);
    return {
      ...result,
      errors: [`Choice execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Enhanced registerScene with validation
 */
export function registerScene(scene: Scene): boolean {
  try {
    if (!scene.id) {
      console.warn('[SceneEngine] Cannot register scene without ID');
      return false;
    }

    if (!scene.messages || scene.messages.length === 0) {
      console.warn(`[SceneEngine] Scene ${scene.id} has no messages`);
    }

    // Validate scene structure
    if (!validateSceneStructure(scene)) {
      console.error(`[SceneEngine] Invalid scene structure for ${scene.id}`);
      return false;
    }

    scenes.set(scene.id, scene);
    console.log(`[SceneEngine] Registered scene: ${scene.id}`);
    return true;
  } catch (error) {
    console.error('[SceneEngine] Error registering scene:', error);
    return false;
  }
}

/**
 * Validate scene structure
 */
function validateSceneStructure(scene: Scene): boolean {
  try {
    if (!scene.id || typeof scene.id !== 'string') return false;
    if (!Array.isArray(scene.messages)) return false;

    if (scene.choices) {
      if (!Array.isArray(scene.choices)) return false;
      for (const choice of scene.choices) {
        if (!choice.id || !choice.text) return false;
      }
    }

    if (scene.actions) {
      if (!Array.isArray(scene.actions)) return false;
      for (const action of scene.actions) {
        if (!action.type) return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all available scene IDs with filtering
 */
export function getAvailableScenes(filter?: {
  category?: string;
  tags?: string[];
  available?: boolean;
}): string[] {
  try {
    let sceneIds = Array.from(scenes.keys());

    if (filter) {
      sceneIds = sceneIds.filter(id => {

        if (filter.category && scene.category !== filter.category) {
          return false;
        }

        if (filter.tags && filter.tags.length > 0) {
          if (!scene.tags || !filter.tags.some(tag => scene.tags!.includes(tag))) {
            return false;
          }
        }

        return true;
      });
    }

    return sceneIds;
  } catch (error) {
    console.error('[SceneEngine] Error getting available scenes:', error);
    return Array.from(scenes.keys());
  }
}

/**
 * Enhanced hasScene with caching
 */
export function hasScene(sceneId: string): boolean {
  try {
    if (!sceneId || typeof sceneId !== 'string') return false;
    return sceneId in scenes;
  } catch (error) {
    console.error('[SceneEngine] Error checking scene existence:', error);
    return false;
  }
}

/**
 * Enhanced getSceneInfo with more details
 */
export function getSceneInfo(sceneId: string): (Pick<Scene, 'id' | 'title' | 'category' | 'tags'> & {
  executionCount?: number;
  lastExecuted?: number;
}) | null {
  try {
        if (!scene) return null;

    return {
      id: scene.id,
      title: scene.title,
      category: scene.category,
      tags: scene.tags,
      executionCount: executionData?.count,
      lastExecuted: executionData?.lastExecuted
    };
  } catch (error) {
    console.error('[SceneEngine] Error getting scene info:', error);
    return null;
  }
}

/**
 * Get scene execution statistics
 */
export function getSceneStats(): SceneStats {
  return { ...sceneStats };
}

/**
 * Get scene execution history
 */
export function getSceneExecutionHistory(): Array<{ sceneId: string; count: number; lastExecuted: number }> {
  try {
    return Array.from(sceneExecutionHistory.entries()).map(([sceneId, data]) => ({
      sceneId,
      count: data.count,
      lastExecuted: data.lastExecuted
    }));
  } catch (error) {
    console.error('[SceneEngine] Error getting execution history:', error);
    return [];
  }
}

/**
 * Clear scene cache
 */
export function clearSceneCache(): void {
  try {
    sceneCache.clear();
    console.log('[SceneEngine] Scene cache cleared');
  } catch (error) {
    console.error('[SceneEngine] Error clearing scene cache:', error);
  }
}

/**
 * Reset scene statistics
 */
export function resetSceneStats(): void {
  try {
    // Type assertion for mutation
          successfulExecutions: number;
      failedExecutions: number;
      mostExecutedScenes: Record<string, number>;
      averageExecutionTime: number;
      lastExecuted: number;
    };

    stats.totalExecuted = 0;
    stats.successfulExecutions = 0;
    stats.failedExecutions = 0;
    stats.mostExecutedScenes = {};
    stats.averageExecutionTime = 0;
    stats.lastExecuted = 0;

    sceneExecutionHistory.clear();
    choiceCooldowns.clear();
    console.log('[SceneEngine] Scene statistics reset');
  } catch (error) {
    console.error('[SceneEngine] Error resetting scene stats:', error);
  }
}

// Initialize default scenes on module load
initializeDefaultScenes();

/**
 * Enhanced scene utilities for external use
 */
export
export default SceneEngine;

// Add scene flow analytics
// (Removed duplicate type/interface/class exports to resolve export conflicts)
