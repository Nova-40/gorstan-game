/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  AI Usage Monitor and Gameplay Analytics
  Real-time tracking of AI interactions, player behavior, and game statistics
*/

import { dynamicContentGenerator } from './dynamicContentGenerator';
import { unifiedAI } from './unifiedAI';
import type { LocalGameState } from '../state/gameState';
import type { Room } from '../types/Room';

export interface AIUsageEvent {
  id: string;
  timestamp: number;
  type: 'ayla_hint' | 'miniquest_ai' | 'dynamic_content' | 'unified_guidance' | 'npc_ai';
  context: {
    roomId: string;
    playerName: string;
    gameTime: number;
    trigger: string;
  };
  details: {
    content: string;
    confidence: number;
    source: string;
    metadata?: Record<string, any>;
  };
  playerResponse?: {
    action: string;
    helpfulness: 'positive' | 'negative' | 'neutral';
    timestamp: number;
  };
}

export interface GameplayMetrics {
  totalPlayTime: number;
  roomsVisited: number;
  commandsExecuted: number;
  aiInteractions: number;
  hintsRequested: number;
  miniquestsCompleted: number;
  currentStreak: number;
  explorationScore: number;
}

export interface AIPerformanceStats {
  totalRequests: number;
  successfulResponses: number;
  averageResponseTime: number;
  playerSatisfactionScore: number;
  mostUsefulFeature: string;
  commonTriggers: string[];
}

export class AIUsageMonitor {
  private static instance: AIUsageMonitor;
  private events: AIUsageEvent[] = [];
  private metrics: GameplayMetrics;
  private aiStats: AIPerformanceStats;
  private sessionStartTime: number;
  private updateCallbacks: ((update: GameplayUpdate) => void)[] = [];

  private constructor() {
    this.sessionStartTime = Date.now();
    this.metrics = {
      totalPlayTime: 0,
      roomsVisited: 0,
      commandsExecuted: 0,
      aiInteractions: 0,
      hintsRequested: 0,
      miniquestsCompleted: 0,
      currentStreak: 0,
      explorationScore: 0
    };
    this.aiStats = {
      totalRequests: 0,
      successfulResponses: 0,
      averageResponseTime: 0,
      playerSatisfactionScore: 0,
      mostUsefulFeature: 'ayla_hints',
      commonTriggers: []
    };
  }

  public static getInstance(): AIUsageMonitor {
    if (!AIUsageMonitor.instance) {
      AIUsageMonitor.instance = new AIUsageMonitor();
    }
    return AIUsageMonitor.instance;
  }

  /**
   * Record an AI usage event
   */
  public recordAIUsage(
    type: AIUsageEvent['type'],
    context: AIUsageEvent['context'],
    details: AIUsageEvent['details']
  ): string {
    const eventId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: AIUsageEvent = {
      id: eventId,
      timestamp: Date.now(),
      type,
      context,
      details
    };

    this.events.push(event);
    
    // Update stats
    this.aiStats.totalRequests++;
    if (details.confidence > 0.5) {
      this.aiStats.successfulResponses++;
    }
    this.metrics.aiInteractions++;

    // Limit event history
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }

    // Notify listeners
    this.notifyUpdate({
      type: 'ai_interaction',
      data: { event, currentStats: this.getAIStats() }
    });

    return eventId;
  }

  /**
   * Record player feedback on AI assistance
   */
  public recordPlayerFeedback(
    eventId: string,
    action: string,
    helpfulness: 'positive' | 'negative' | 'neutral'
  ): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.playerResponse = {
        action,
        helpfulness,
        timestamp: Date.now()
      };

      // Update satisfaction score
      const feedbackWeight = helpfulness === 'positive' ? 1 : helpfulness === 'negative' ? -1 : 0;
      this.aiStats.playerSatisfactionScore = 
        (this.aiStats.playerSatisfactionScore + feedbackWeight) / 2;
    }
  }

  /**
   * Update gameplay metrics
   */
  public updateMetrics(update: Partial<GameplayMetrics>): void {
    Object.assign(this.metrics, update);
    
    this.notifyUpdate({
      type: 'metrics_update',
      data: { metrics: this.metrics }
    });
  }

  /**
   * Track room visit
   */
  public trackRoomVisit(roomId: string, gameState: LocalGameState): void {
    this.metrics.roomsVisited++;
    this.metrics.totalPlayTime = Date.now() - this.sessionStartTime;
    
    // Calculate exploration score
    const uniqueRooms = new Set([...this.events.map(e => e.context.roomId), roomId]);
    this.metrics.explorationScore = uniqueRooms.size * 10;

    this.notifyUpdate({
      type: 'room_visit',
      data: { roomId, metrics: this.metrics }
    });
  }

  /**
   * Track command execution
   */
  public trackCommand(command: string, success: boolean, roomId: string): void {
    this.metrics.commandsExecuted++;
    
    if (success) {
      this.metrics.currentStreak++;
    } else {
      this.metrics.currentStreak = 0;
    }

    this.notifyUpdate({
      type: 'command_executed',
      data: { command, success, streak: this.metrics.currentStreak }
    });
  }

  /**
   * Get real-time AI statistics
   */
  public getAIStats(): AIPerformanceStats & { recentEvents: AIUsageEvent[] } {
    const recentEvents = this.events.slice(-10);
    const triggerCounts: Record<string, number> = {};
    
    this.events.forEach(event => {
      const trigger = event.context.trigger;
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    const commonTriggers = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger]) => trigger);

    return {
      ...this.aiStats,
      commonTriggers,
      recentEvents,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  /**
   * Get current gameplay metrics
   */
  public getMetrics(): GameplayMetrics {
    this.metrics.totalPlayTime = Date.now() - this.sessionStartTime;
    return { ...this.metrics };
  }

  /**
   * Generate AI usage report
   */
  public generateUsageReport(): {
    summary: string;
    recommendations: string[];
    insights: string[];
  } {
    const stats = this.getAIStats();
    const metrics = this.getMetrics();
    
    const summary = `AI Usage Report:
• Total AI interactions: ${stats.totalRequests}
• Success rate: ${Math.round((stats.successfulResponses / stats.totalRequests) * 100)}%
• Player satisfaction: ${Math.round(stats.playerSatisfactionScore * 100)}%
• Commands executed: ${metrics.commandsExecuted}
• Rooms explored: ${metrics.roomsVisited}
• Current streak: ${metrics.currentStreak}`;

    const recommendations: string[] = [];
    const insights: string[] = [];

    if (stats.playerSatisfactionScore < 0.3) {
      recommendations.push("AI assistance could be more helpful - consider adjusting hint sensitivity");
    }

    if (metrics.currentStreak > 10) {
      insights.push("Player is on a successful streak - they're mastering the game mechanics");
    }

    if (stats.commonTriggers.includes('stuck')) {
      insights.push("Player frequently gets stuck - consider improving guidance systems");
    }

    return { summary, recommendations, insights };
  }

  /**
   * Subscribe to real-time updates
   */
  public onUpdate(callback: (update: GameplayUpdate) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Reset session data
   */
  public resetSession(): void {
    this.events = [];
    this.sessionStartTime = Date.now();
    this.metrics = {
      totalPlayTime: 0,
      roomsVisited: 0,
      commandsExecuted: 0,
      aiInteractions: 0,
      hintsRequested: 0,
      miniquestsCompleted: 0,
      currentStreak: 0,
      explorationScore: 0
    };
    this.aiStats = {
      totalRequests: 0,
      successfulResponses: 0,
      averageResponseTime: 0,
      playerSatisfactionScore: 0,
      mostUsefulFeature: 'ayla_hints',
      commonTriggers: []
    };
  }

  private calculateAverageResponseTime(): number {
    const recentEvents = this.events.slice(-20);
    if (recentEvents.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < recentEvents.length; i++) {
      totalTime += recentEvents[i].timestamp - recentEvents[i-1].timestamp;
    }
    
    return totalTime / (recentEvents.length - 1);
  }

  private notifyUpdate(update: GameplayUpdate): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.warn('[AI Monitor] Update callback failed:', error);
      }
    });
  }
}

export interface GameplayUpdate {
  type: 'ai_interaction' | 'metrics_update' | 'room_visit' | 'command_executed';
  data: any;
}

// Export singleton instance
export const aiUsageMonitor = AIUsageMonitor.getInstance();

// Console integration for real-time monitoring
if (typeof window !== 'undefined') {
  (window as any).aiMonitor = {
    getStats: () => aiUsageMonitor.getAIStats(),
    getMetrics: () => aiUsageMonitor.getMetrics(),
    generateReport: () => aiUsageMonitor.generateUsageReport(),
    resetSession: () => aiUsageMonitor.resetSession()
  };
}
