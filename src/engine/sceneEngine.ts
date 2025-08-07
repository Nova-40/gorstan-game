// src/engine/sceneEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import { Room } from '../types/Room';

// Global state for scene management
const sceneExecutionHistory = new Map<string, { count: number; lastExecuted: number; totalTime: number; errors: number }>();
const choiceCooldowns = new Map<string, number>();
const MAX_HISTORY_SIZE = 1000;

// Scene caching infrastructure
const sceneCache = new Map<string, { scene: Scene; timestamp: number; accessCount: number }>();
const sceneStats = { 
  cacheHits: 0, 
  cacheMisses: 0, 
  mostExecutedScenes: {} as Record<string, number>,
  totalExecuted: 0,
  successfulExecutions: 0,
  failedExecutions: 0,
  averageExecutionTime: 0,
  lastExecuted: 0
};
const MAX_CACHE_SIZE = 100;

// Global scene registry
const scenes = new Map<string, Scene>();













interface MinimalRoom {
  readonly id: string;
  readonly title: string;
  readonly zone: string;
  readonly [key: string]: unknown;
}


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
  readonly currentRoom?: string;
  readonly visitedRooms?: readonly string[];
}


interface GameContext {
  readonly player: PlayerState;
  readonly currentRoom?: MinimalRoom;
  readonly gameTime?: number;
  readonly sessionData?: Readonly<Record<string, unknown>>;
  readonly worldState?: Readonly<Record<string, unknown>>;
}

export interface SceneStats {
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly mostExecutedScenes: Record<string, number>;
  readonly totalExecuted: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly averageExecutionTime: number;
  readonly lastExecuted: number;
}


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


export interface SceneStats {
  readonly totalExecuted: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly mostExecutedScenes: Record<string, number>;
  readonly averageExecutionTime: number;
  readonly lastExecuted: number;
  readonly cacheHitRate?: number;
  readonly performanceMetrics?: Readonly<Record<string, number>>;
}


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


interface SceneExecutionData {
  count: number;
  lastExecuted: number;
  totalTime: number;
  errors: number;
}


interface SceneCacheEntry {
  readonly scene: Scene;
  readonly timestamp: number;
  readonly accessCount: number;
}


// Variable declaration
const CACHE_DURATION = 60000; 
// Variable declaration
const PERFORMANCE_THRESHOLD = 1000; 






export class SceneFlowAnalyzer {
  constructor(
    private readonly executionHistory: Map<string, SceneExecutionData>,
    private readonly sceneRegistry: Map<string, Scene>
  ) {}

  private calculateCompletionRate(): number {
    const totalScenes = this.sceneRegistry.size;
    const completedScenes = Array.from(this.executionHistory.values())
      .filter(data => data.count > 0).length;
    return totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;
  }

  private hasComplexRequirements(requirements: any): boolean {
    return !!(requirements?.flags?.length > 2 || 
              requirements?.items?.length > 1 || 
              requirements?.traits?.length > 1);
  }

  analyzeSceneProgression(): SceneFlowReport {
    const totalScenes = this.sceneRegistry.size;
    const completionRate = this.calculateCompletionRate();

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
      const executionData = this.executionHistory.get(sceneId);
      
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

      
      if (scene.choices) {
        const blockedChoices = scene.choices.filter(choice => 
          choice.requirements && this.hasComplexRequirements(choice.requirements)
        );

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
    const currentOrder = Array.from(this.sceneRegistry.keys());
    const optimizedOrder = this.calculateOptimalOrder(currentOrder);

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
    
    return [
      ['goldfishEscape', 'dominicRescuePlan'],
      ['libraryDiscovery', 'read_tome']
    ];
  }

  private calculateAveragePathLength(): number {
    const totalExecutions = Array.from(this.executionHistory.values())
      .reduce((sum, data) => sum + data.count, 0);

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
      const sceneA = this.sceneRegistry.get(a);
      const sceneB = this.sceneRegistry.get(b);
      const priorityA = sceneA ? categoryPriority[sceneA.category || 'exploration'] || 2 : 10;
      const priorityB = sceneB ? categoryPriority[sceneB.category || 'exploration'] || 2 : 10;

      return priorityA - priorityB;
    });
  }
}


export class SceneRecommendationEngine {
  constructor(
    private readonly sceneRegistry: Map<string, Scene>,
    private readonly executionHistory: Map<string, SceneExecutionData>
  ) {}

  private checkDependencies(dependencies: readonly string[], context: SceneContext): boolean {
    if (!context.sceneHistory) return false;
    return dependencies.every(dep =>
      context.sceneHistory!.includes(dep) ||
      context.flags?.[`scene_${dep}_completed`]
    );
  }

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

      const relevance = this.calculateSceneRelevance(sceneId, context);

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
    const scene = this.sceneRegistry.get(sceneId);
        if (!scene) return 0;

    let relevance = 10; 

    
    if (scene.category === 'tutorial' && !context.player?.experience) {
      relevance += 20;
    } else if (scene.category === 'story') {
      relevance += 15;
    } else if (scene.category === 'social' && context.player?.traits?.includes('social')) {
      relevance += 10;
    }

    
    if (scene.dependencies) {
      const dependenciesMet = this.checkDependencies(scene.dependencies, context);
            if (dependenciesMet) relevance += 15;
      else return 0; 
    }

    
    const executionData = this.executionHistory.get(sceneId);
        if (executionData && executionData.count > 2) {
      relevance -= executionData.count * 5;
    }

    
    if (scene.conditions && !this.checkConditions(scene.conditions, context)) {
      return 0;
    }

    return Math.max(0, relevance);
  }

  generateDynamicScenes(context: GameContext): Scene[] {
    const dynamicScenes: Scene[] = [];

    
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
// JSX return block or main return
          return (context.player?.health || 0) > (condition.value as number);
        case 'levelAbove':
// JSX return block or main return
          return (context.player?.level || 0) > (condition.value as number);
        default:
          return true;
      }
    });
  }
}


export class ScenePerformanceMonitor {
  private readonly performanceData = new Map<string, Array<{ timestamp: number; duration: number }>>();

  trackSceneExecutionTime(sceneId: string, time: number): void {
    if (!this.performanceData.has(sceneId)) {
      this.performanceData.set(sceneId, []);
    }

    const data = this.performanceData.get(sceneId)!;
        data.push({ timestamp: Date.now(), duration: time });

    
    if (data.length > 100) {
      data.splice(0, data.length - 100);
    }
  }

  identifySlowScenes(): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const [sceneId, data] of this.performanceData.entries()) {
      if (data.length === 0) continue;

      const averageTime = data.reduce((sum, entry) => sum + entry.duration, 0) / data.length;

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
    const slowScenes = this.identifySlowScenes();

    return {
      totalOptimizations: slowScenes.length,
      performanceGain: slowScenes.reduce((sum: number, issue: PerformanceIssue) =>
        sum + Math.max(0, issue.averageExecutionTime - PERFORMANCE_THRESHOLD), 0
      ),
      optimizedScenes: slowScenes.map((issue: PerformanceIssue) => issue.sceneId),
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



// --- Function: initializeDefaultScenes ---
function initializeDefaultScenes(): void {
  
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



// --- Function: runScene ---
export function runScene(
  sceneId: string,
  context: SceneContext,
  sceneRegistry: Map<string, Scene> = new Map()
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
    const startTime = Date.now();
    
    if (!sceneId || typeof sceneId !== 'string') {
      result = { ...result, errors: ['Invalid scene ID provided'] };
      return result;
    }

    if (!validateSceneContext(context)) {
      result = { ...result, errors: ['Invalid scene context provided'] };
      return result;
    }

    
    const scene = sceneRegistry.get(sceneId);
        if (!scene) {
      result = { ...result, errors: [`Scene not found: ${sceneId}`] };
      context.appendMessage(`⚠️ Scene '${sceneId}' not found.`, 'error');
      return result;
    }

    
    if (scene.conditions && !checkSceneConditions(scene.conditions, context)) {
      result = { ...result, warnings: ['Scene conditions not met'] };
      context.appendMessage('❌ You cannot access this scene right now.', 'warning');
      return result;
    }

    
    if (!canExecuteScene(sceneId, scene)) {
      result = { ...result, warnings: ['Scene is on cooldown'] };
      context.appendMessage('⏰ You must wait before accessing this scene again.', 'warning');
      return result;
    }

    
    if (scene.dependencies && !checkSceneDependencies(scene.dependencies, context)) {
      result = { ...result, warnings: ['Scene dependencies not met'] };
      context.appendMessage('🔒 This scene requires other scenes to be completed first.', 'warning');
      return result;
    }

    
    if (scene.onEnter) {
      try {
        scene.onEnter(context);
      } catch (error) {
        result = { ...result, warnings: [`onEnter hook failed: ${error}`] };
      }
    }

    let messagesAdded = 0;

    
    if (scene.title) {
      context.appendMessage(`=== ${scene.title} ===`, 'scene-title');
      messagesAdded++;
    }

    
    scene.messages.forEach((message: any) => {
      if (message && typeof message === 'string') {
        context.appendMessage(message, 'scene');
        messagesAdded++;
      }
    });

    let actionsExecuted = 0;
    let stateChanges: Record<string, unknown> = {};

    
    if (scene.actions && scene.actions.length > 0) {
      const actionsResult = executeSceneActions(scene.actions, context);
            actionsExecuted = actionsResult.executed;
      stateChanges = { ...stateChanges, ...actionsResult.stateChanges };

      if (actionsResult.errors.length > 0) {
        result = { ...result, warnings: [...(result.warnings || []), ...actionsResult.errors] };
      }
    }

    let choicesAvailable = 0;
    let nextScenes: string[] = [];

    
    if (scene.choices && scene.choices.length > 0) {
      const choiceResult = processSceneChoices(scene.choices, context);
            choicesAvailable = choiceResult.available;
      messagesAdded += choiceResult.messagesAdded;
      nextScenes = choiceResult.nextScenes;
    }

    
    if (scene.effects) {
      applySceneEffects(scene.effects, context, stateChanges);
    }

    
    if (scene.onExit) {
      try {
        scene.onExit(context);
      } catch (error) {
        result = { ...result, warnings: [...(result.warnings || []), `onExit hook failed: ${error}`] };
      }
    }

    
    const executionTime = Date.now() - startTime;
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
    const executionTime = 0; // Default value for error case
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



// --- Function: validateSceneContext ---
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



// --- Function: getSceneWithCache ---
function getSceneWithCache(sceneId: string): Scene | null {
  try {
    const cached = sceneCache.get(sceneId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      sceneStats.cacheHits++;

      
      sceneCache.set(sceneId, {
        ...cached,
        accessCount: cached.accessCount + 1
      });

      return cached.scene;
    }

    sceneStats.cacheMisses++;

    const scenes = new Map<string, Scene>(); // This would typically be injected
    const scene = scenes.get(sceneId);
        if (scene) {
      
      if (sceneCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = Array.from(sceneCache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]?.[0];
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
    return null;
  }
}



// --- Function: canExecuteScene ---
function canExecuteScene(sceneId: string, scene: Scene): boolean {
  try {
    const executionData = sceneExecutionHistory.get(sceneId);

    
    if (!scene.repeatable && executionData && executionData.count > 0) {
      return false;
    }

    
    if (scene.cooldown && executionData) {
      const timeSinceLastExecution = Date.now() - executionData.lastExecuted;
            if (timeSinceLastExecution < scene.cooldown) {
        return false;
      }
    }

    return true;
  } catch {
    return true;
  }
}



// --- Function: checkSceneDependencies ---
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



// --- Function: checkSceneConditions ---
function checkSceneConditions(conditions: readonly SceneCondition[], context: SceneContext): boolean {
  try {
    return conditions.every(condition => {
      let result: boolean;

      switch (condition.type) {
        case 'hasFlag':
          const flagValue = context.flags?.[condition.value as string] || context.player?.flags?.[condition.value as string];
                    result = evaluateCondition(flagValue, true, condition.operator || 'equals');
          break;

        case 'hasItem':
          const hasItem = context.player?.inventory?.includes(condition.value as string) || false;
                    result = evaluateCondition(hasItem, true, condition.operator || 'equals');
          break;

        case 'hasTrait':
          const hasTrait = context.player?.traits?.includes(condition.value as string) || false;
                    result = evaluateCondition(hasTrait, true, condition.operator || 'equals');
          break;

        case 'healthAbove':
          const health = context.player?.health || 0;
                    result = evaluateCondition(health, condition.value as number, condition.operator || 'greater');
          break;

        case 'scoreAbove':
          const score = context.player?.score || 0;
                    result = evaluateCondition(score, condition.value as number, condition.operator || 'greater');
          break;

        case 'levelAbove':
          const level = context.player?.level || 0;
                    result = evaluateCondition(level, condition.value as number, condition.operator || 'greater');
          break;

        case 'experienceAbove':
          const experience = context.player?.experience || 0;
                    result = evaluateCondition(experience, condition.value as number, condition.operator || 'greater');
          break;

        case 'inRoom':
          const currentRoom = context.player?.currentRoom || '';
                    result = evaluateCondition(currentRoom, condition.value as string, condition.operator || 'equals');
          break;

        case 'timeElapsed':
          const gameTime = context.gameTime || Date.now();
                    result = evaluateCondition(gameTime, condition.value as number, condition.operator || 'greater');
          break;

        case 'visitCount':
          const visitCount = context.player?.visitedRooms?.length || 0;
                    result = evaluateCondition(visitCount, 1, condition.operator || 'greaterEqual');
          break;

        case 'custom':
          result = condition.custom ? condition.custom(context) : true;
          break;

        default:
          console.warn(`[SceneEngine] Unknown condition type: ${condition.type}`);
          result = true;
      }

      
      return condition.negated ? !result : result;
    });
  } catch {
    return false;
  }
}



// --- Function: evaluateCondition ---
function evaluateCondition(actual: unknown, expected: unknown, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'notEquals':
      return actual !== expected;
    case 'greater':
// JSX return block or main return
      return (actual as number) > (expected as number);
    case 'less':
// JSX return block or main return
      return (actual as number) < (expected as number);
    case 'greaterEqual':
// JSX return block or main return
      return (actual as number) >= (expected as number);
    case 'lessEqual':
// JSX return block or main return
      return (actual as number) <= (expected as number);
    default:
      return actual === expected;
  }
}



// --- Function: executeSceneActions ---
function executeSceneActions(
  actions: readonly SceneAction[],
  context: SceneContext
): { executed: number; errors: string[]; stateChanges: Record<string, unknown> } {
  const result: { executed: number; errors: string[]; stateChanges: Record<string, unknown> } = { executed: 0, errors: [], stateChanges: {} };

  try {
    actions.forEach((action, index) => {
      try {
        
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
              const newHealth = Math.max(0, (prev.health || 100) + (action.value as number));
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



// --- Function: evaluateActionCondition ---
function evaluateActionCondition(action: SceneAction, context: SceneContext): boolean {
  
  return true;
}



// --- Function: displaySceneChoices ---
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
    // Filter choices to only show available ones
    const availableChoices = choices.filter(choice => {
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

      // Add requirement hints for disabled choices
      if (choice.requirements) {
        const missingReqs = getMissingRequirements(choice.requirements, context);
        if (missingReqs.length > 0) {
          choiceText += ` [Requires: ${missingReqs.join(', ')}]`;
        }
      }

      context.appendMessage(choiceText, 'choice');
      result.messagesAdded++;

      // Track next scenes for navigation
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



// --- Function: checkChoiceRequirements ---
function checkChoiceRequirements(requirements: SceneChoice['requirements'], context: SceneContext): boolean {
  try {
    if (!requirements) return true;

    
    if (requirements.flags && !requirements.flags.every(flag =>
      context.flags?.[flag] || context.player?.flags?.[flag]
    )) return false;

    
    if (requirements.items && !requirements.items.every(item =>
      context.player?.inventory?.includes(item)
    )) return false;

    
    if (requirements.traits && !requirements.traits.every(trait =>
      context.player?.traits?.includes(trait)
    )) return false;

    
    if (requirements.health && (context.player?.health || 0) < requirements.health) {
      return false;
    }

    
    if (requirements.score && (context.player?.score || 0) < requirements.score) {
      return false;
    }

    
    if (requirements.level && (context.player?.level || 0) < requirements.level) {
      return false;
    }

    return true;
  } catch {
    return true;
  }
}



// --- Function: getMissingRequirements ---
function getMissingRequirements(requirements: SceneChoice['requirements'], context: SceneContext): string[] {
  const missing: string[] = [];

  try {
    if (!requirements) return missing;

    
    requirements.flags?.forEach(flag => {
      if (!context.flags?.[flag] && !context.player?.flags?.[flag]) {
        missing.push(`flag: ${flag}`);
      }
    });

    
    requirements.items?.forEach(item => {
      if (!context.player?.inventory?.includes(item)) {
        missing.push(`item: ${item}`);
      }
    });

    
    requirements.traits?.forEach(trait => {
      if (!context.player?.traits?.includes(trait)) {
        missing.push(`trait: ${trait}`);
      }
    });

    
    if (requirements.health && (context.player?.health || 0) < requirements.health) {
      missing.push(`health: ${requirements.health}+`);
    }

    
    if (requirements.score && (context.player?.score || 0) < requirements.score) {
      missing.push(`score: ${requirements.score}+`);
    }

    
    if (requirements.level && (context.player?.level || 0) < requirements.level) {
      missing.push(`level: ${requirements.level}+`);
    }

    return missing;
  } catch {
    return missing;
  }
}



// --- Function: isChoiceOnCooldown ---
function isChoiceOnCooldown(choiceId: string, cooldown: number): boolean {
  try {
    const lastUsed = choiceCooldowns.get(choiceId);
        return lastUsed ? Date.now() - lastUsed < cooldown : false;
  } catch {
    return false;
  }
}



// --- Function: applySceneEffects ---
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



// --- Function: updateSceneExecutionTracking ---
function updateSceneExecutionTracking(sceneId: string, executionTime: number): void {
  try {
    const existing = sceneExecutionHistory.get(sceneId);
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

    
    sceneStats.mostExecutedScenes[sceneId] = (sceneStats.mostExecutedScenes[sceneId] || 0) + 1;

    
    if (sceneExecutionHistory.size > MAX_HISTORY_SIZE) {
      const oldestEntry = Array.from(sceneExecutionHistory.entries())
        .sort(([, a], [, b]) => a.lastExecuted - b.lastExecuted)[0];
            if (oldestEntry) {
        sceneExecutionHistory.delete(oldestEntry[0]);
        delete sceneStats.mostExecutedScenes[oldestEntry[0]];
      }
    }
  } catch (error) {
    console.error('[SceneEngine] Error updating execution tracking:', error);
  }
}



// --- Function: updateSceneStats ---
function updateSceneStats(success: boolean, executionTime: number): void {
  try {
    sceneStats.totalExecuted++;
    sceneStats.lastExecuted = Date.now();

    if (success) {
      sceneStats.successfulExecutions++;
    } else {
      sceneStats.failedExecutions++;
    }

    
    const totalTime = Array.from(sceneExecutionHistory.values())
      .reduce((sum, data) => sum + data.totalTime, 0);
        sceneStats.averageExecutionTime = totalTime / sceneStats.totalExecuted;
  } catch (error) {
    console.error('[SceneEngine] Error updating scene stats:', error);
  }
}



// --- Function: processSceneChoices ---
function processSceneChoices(choices: readonly SceneChoice[], context: SceneContext): {
  available: number;
  messagesAdded: number;
  nextScenes: string[];
} {
  let available = 0;
  let messagesAdded = 0;
  const nextScenes: string[] = [];

  for (const choice of choices) {
    if (!choice.hidden && (!choice.condition || choice.condition(context))) {
      available++;
    }
  }

  return { available, messagesAdded, nextScenes };
}



// --- Function: getChoiceRequirementsMissing ---
function getChoiceRequirementsMissing(requirements: any, context: SceneContext): string[] {
  const missing: string[] = [];
  
  if (requirements.flags) {
    requirements.flags.forEach((flag: string) => {
      if (!context.flags?.[flag] && !context.player?.flags?.[flag]) {
        missing.push(`flag: ${flag}`);
      }
    });
  }
  
  if (requirements.items) {
    requirements.items.forEach((item: string) => {
      if (!context.player?.inventory?.includes(item)) {
        missing.push(`item: ${item}`);
      }
    });
  }
  
  return missing;
}



// --- Function: executeChoice ---
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
    const scenes = new Map<string, Scene>(); // This would typically be injected
    const scene = scenes.get(sceneId);
        if (!scene || !scene.choices) {
      return { ...result, errors: ['Scene or choices not found'] };
    }

    const choice = scene.choices.find(c => c.id === choiceId);
        if (!choice) {
      return { ...result, errors: ['Choice not found'] };
    }

    
    if (choice.condition && !choice.condition(context)) {
      context.appendMessage('❌ You cannot choose that option.', 'error');
      return { ...result, messagesAdded: 1, warnings: ['Choice condition not met'] };
    }

    
    if (choice.requirements && !checkChoiceRequirements(choice.requirements, context)) {
      const missing = getChoiceRequirementsMissing(choice.requirements, context);
            context.appendMessage(`❌ Missing requirements: ${missing.join(', ')}`, 'error');
      return { ...result, messagesAdded: 1, warnings: [`Missing requirements: ${missing.join(', ')}`] };
    }

    
    if (choice.action) {
      try {
        choice.action(context);
        result = { ...result, actionsExecuted: 1 };
      } catch (error) {
        return { ...result, errors: [`Choice action failed: ${error instanceof Error ? error.message : 'Unknown error'}`] };
      }
    }

    
    if (choice.cooldown) {
      choiceCooldowns.set(choiceId, Date.now());
    }

    
    if (choice.nextScene) {
      const nextSceneResult = { success: true, messagesAdded: 0, actionsExecuted: 0, errors: [], warnings: [] }; // Simplified
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



// --- Function: registerScene ---
export function registerScene(scene: Scene): boolean {
  try {
    if (!scene.id) {
      console.warn('[SceneEngine] Cannot register scene without ID');
      return false;
    }

    if (!scene.messages || scene.messages.length === 0) {
      console.warn(`[SceneEngine] Scene ${scene.id} has no messages`);
    }

    
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



// --- Function: validateSceneStructure ---
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



// --- Function: getAvailableScenes ---
export function getAvailableScenes(filter?: {
  category?: string;
  tags?: string[];
  available?: boolean;
}): string[] {
  try {
    let sceneIds = Array.from(scenes.keys());

    if (filter) {
      sceneIds = sceneIds.filter(id => {
        const scene = scenes.get(id);
        if (!scene) return false;

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

    return sceneIds as string[];
  } catch (error) {
    console.error('[SceneEngine] Error getting available scenes:', error);
    return Array.from(scenes.keys());
  }
}



// --- Function: hasScene ---
export function hasScene(sceneId: string): boolean {
  try {
    if (!sceneId || typeof sceneId !== 'string') return false;
    return scenes.has(sceneId);
  } catch (error) {
    console.error('[SceneEngine] Error checking scene existence:', error);
    return false;
  }
}



// --- Function: getSceneInfo ---
export function getSceneInfo(sceneId: string): (Pick<Scene, 'id' | 'title' | 'category' | 'tags'> & {
  executionCount?: number;
  lastExecuted?: number;
}) | null {
  try {
    const scene = scenes.get(sceneId);
    const executionData = sceneExecutionHistory.get(sceneId);
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



// --- Function: getSceneStats ---
export function getSceneStats(): SceneStats {
  return { ...sceneStats };
}



// --- Function: getSceneExecutionHistory ---
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



// --- Function: clearSceneCache ---
export function clearSceneCache(): void {
  try {
    sceneCache.clear();
    console.log('[SceneEngine] Scene cache cleared');
  } catch (error) {
    console.error('[SceneEngine] Error clearing scene cache:', error);
  }
}



// --- Function: resetSceneStats ---
export function resetSceneStats(): void {
  try {
    // Reset scene execution statistics
    const stats = {
      totalExecuted: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      mostExecutedScenes: {} as Record<string, number>,
      averageExecutionTime: 0,
      lastExecuted: 0
    };

    sceneExecutionHistory.clear();
    choiceCooldowns.clear();
    console.log('[SceneEngine] Scene statistics reset');
  } catch (error) {
    console.error('[SceneEngine] Error resetting scene stats:', error);
  }
}

initializeDefaultScenes();
