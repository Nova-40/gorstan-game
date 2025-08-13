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

// src/npc/errorHandling.ts

/**
 * Comprehensive error handling and graceful degradation system
 */

// ===== ERROR TYPES =====

export enum NPCErrorType {
  MOVEMENT_FAILED = 'MOVEMENT_FAILED',
  PATHFINDING_ERROR = 'PATHFINDING_ERROR',
  ZONE_VALIDATION_ERROR = 'ZONE_VALIDATION_ERROR',
  PRESENCE_TRACKING_ERROR = 'PRESENCE_TRACKING_ERROR',
  SCHEDULER_ERROR = 'SCHEDULER_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  PERFORMANCE_DEGRADATION = 'PERFORMANCE_DEGRADATION',
  MEMORY_OVERFLOW = 'MEMORY_OVERFLOW',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum NPCErrorSeverity {
  LOW = 'LOW',           // Minor issues, system continues normally
  MEDIUM = 'MEDIUM',     // Noticeable issues, some degradation
  HIGH = 'HIGH',         // Significant issues, major degradation
  CRITICAL = 'CRITICAL'  // System failure, emergency fallback
}

export interface NPCError {
  id: string;
  type: NPCErrorType;
  severity: NPCErrorSeverity;
  message: string;
  context: Record<string, any>;
  timestamp: number;
  stackTrace?: string;
  npcId?: string;
  roomId?: string;
  attemptCount: number;
  isRecoverable: boolean;
}

export interface ErrorRecoveryStrategy {
  type: NPCErrorType;
  maxRetries: number;
  retryDelayMs: number;
  fallbackAction: (error: NPCError) => Promise<boolean>;
  shouldRetry: (error: NPCError) => boolean;
}

export interface DegradationLevel {
  level: number;
  name: string;
  description: string;
  disabledFeatures: string[];
  performanceMultiplier: number;
}

// ===== ERROR RECOVERY STRATEGIES =====

const DEFAULT_RECOVERY_STRATEGIES: ErrorRecoveryStrategy[] = [
  {
    type: NPCErrorType.MOVEMENT_FAILED,
    maxRetries: 3,
    retryDelayMs: 1000,
    shouldRetry: (error) => error.attemptCount < 3 && error.isRecoverable,
    fallbackAction: async (error) => {
      console.log(`[ErrorRecovery] Fallback: Keeping NPC ${error.npcId} in current room`);
      return true;
    }
  },
  {
    type: NPCErrorType.PATHFINDING_ERROR,
    maxRetries: 2,
    retryDelayMs: 500,
    shouldRetry: (error) => error.attemptCount < 2,
    fallbackAction: async (error) => {
      console.log(`[ErrorRecovery] Fallback: Using random adjacent room for ${error.npcId}`);
      return true;
    }
  },
  {
    type: NPCErrorType.ZONE_VALIDATION_ERROR,
    maxRetries: 1,
    retryDelayMs: 100,
    shouldRetry: (error) => error.attemptCount < 1,
    fallbackAction: async (error) => {
      console.log(`[ErrorRecovery] Fallback: Bypassing zone validation for ${error.npcId}`);
      return true;
    }
  },
  {
    type: NPCErrorType.SCHEDULER_ERROR,
    maxRetries: 5,
    retryDelayMs: 2000,
    shouldRetry: (error) => error.attemptCount < 5,
    fallbackAction: async (error) => {
      console.log(`[ErrorRecovery] Fallback: Restarting scheduler with reduced frequency`);
      return true;
    }
  },
  {
    type: NPCErrorType.PERFORMANCE_DEGRADATION,
    maxRetries: 0,
    retryDelayMs: 0,
    shouldRetry: () => false,
    fallbackAction: async (error) => {
      console.log(`[ErrorRecovery] Fallback: Applying performance degradation`);
      return true;
    }
  }
];

// ===== DEGRADATION LEVELS =====

const DEGRADATION_LEVELS: DegradationLevel[] = [
  {
    level: 0,
    name: 'Normal',
    description: 'All features enabled, full performance',
    disabledFeatures: [],
    performanceMultiplier: 1.0
  },
  {
    level: 1,
    name: 'Light Degradation',
    description: 'Minor optimizations, slight feature reduction',
    disabledFeatures: ['zone-preferences', 'complex-pathfinding'],
    performanceMultiplier: 0.8
  },
  {
    level: 2,
    name: 'Medium Degradation', 
    description: 'Noticeable performance reduction, some features disabled',
    disabledFeatures: ['zone-preferences', 'complex-pathfinding', 'batch-processing', 'detailed-logging'],
    performanceMultiplier: 0.6
  },
  {
    level: 3,
    name: 'Heavy Degradation',
    description: 'Significant feature reduction, basic functionality only',
    disabledFeatures: ['zone-awareness', 'pathfinding', 'batch-processing', 'detailed-logging', 'performance-monitoring'],
    performanceMultiplier: 0.4
  },
  {
    level: 4,
    name: 'Emergency Mode',
    description: 'Minimal functionality, emergency fallback only',
    disabledFeatures: ['zone-awareness', 'pathfinding', 'batch-processing', 'detailed-logging', 'performance-monitoring', 'random-movement'],
    performanceMultiplier: 0.2
  },
  {
    level: 5,
    name: 'System Disabled',
    description: 'NPC wandering system completely disabled',
    disabledFeatures: ['all'],
    performanceMultiplier: 0.0
  }
];

// ===== CIRCUIT BREAKER =====

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        console.log('[CircuitBreaker] Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker] Circuit opened after ${this.failureCount} failures`);
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
    console.log('[CircuitBreaker] Circuit reset to CLOSED state');
  }

  getState(): string {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      failureThreshold: this.failureThreshold
    };
  }
}

// ===== RETRY MECHANISM =====

class RetryMechanism {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    backoffMultiplier: number = 2
  ): Promise<T> {
    let lastError: Error;
    let currentDelay = delayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[RetryMechanism] Retry attempt ${attempt}/${maxRetries} after ${currentDelay}ms`);
          await this.delay(currentDelay);
          currentDelay *= backoffMultiplier;
        }

        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[RetryMechanism] Attempt ${attempt + 1} failed:`, error);
      }
    }

    throw new Error(`Operation failed after ${maxRetries} retries. Last error: ${lastError!.message}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ===== ERROR HANDLER =====

export class NPCErrorHandler {
  private errors: NPCError[] = [];
  private maxErrorHistory = 1000;
  private recoveryStrategies: Map<NPCErrorType, ErrorRecoveryStrategy> = new Map();
  private circuitBreaker: CircuitBreaker;
  private retryMechanism: RetryMechanism;
  private currentDegradationLevel = 0;
  private isEnabled = true;

  // Error statistics
  private errorCounts: Map<NPCErrorType, number> = new Map();
  private recoverySuccessRate: Map<NPCErrorType, { attempts: number; successes: number }> = new Map();

  constructor() {
    this.circuitBreaker = new CircuitBreaker();
    this.retryMechanism = new RetryMechanism();
    
    // Initialize recovery strategies
    DEFAULT_RECOVERY_STRATEGIES.forEach(strategy => {
      this.recoveryStrategies.set(strategy.type, strategy);
    });

    // Initialize error counts
    Object.values(NPCErrorType).forEach(type => {
      this.errorCounts.set(type, 0);
      this.recoverySuccessRate.set(type, { attempts: 0, successes: 0 });
    });
  }

  // ===== ERROR REPORTING =====

  async reportError(
    type: NPCErrorType,
    message: string,
    context: Record<string, any> = {},
    severity: NPCErrorSeverity = NPCErrorSeverity.MEDIUM
  ): Promise<boolean> {
    const error: NPCError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      context,
      timestamp: Date.now(),
      stackTrace: new Error().stack,
      npcId: context.npcId,
      roomId: context.roomId,
      attemptCount: context.attemptCount || 0,
      isRecoverable: severity !== NPCErrorSeverity.CRITICAL
    };

    this.addError(error);
    this.updateErrorStatistics(error);

    console.error(`[NPCErrorHandler] ${severity} ${type}: ${message}`, context);

    // Attempt recovery
    const recovered = await this.attemptRecovery(error);
    
    // Check if degradation is needed
    this.evaluateDegradation();

    return recovered;
  }

  private generateErrorId(): string {
    return `npc_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addError(error: NPCError): void {
    this.errors.push(error);
    
    // Maintain error history limit
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }
  }

  private updateErrorStatistics(error: NPCError): void {
    const currentCount = this.errorCounts.get(error.type) || 0;
    this.errorCounts.set(error.type, currentCount + 1);
  }

  // ===== ERROR RECOVERY =====

  private async attemptRecovery(error: NPCError): Promise<boolean> {
    if (!error.isRecoverable) {
      console.log(`[NPCErrorHandler] Error ${error.id} is not recoverable`);
      return false;
    }

    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) {
      console.warn(`[NPCErrorHandler] No recovery strategy for error type ${error.type}`);
      return false;
    }

    const stats = this.recoverySuccessRate.get(error.type)!;
    stats.attempts++;

    try {
      // Check if we should retry
      if (strategy.shouldRetry(error) && error.attemptCount < strategy.maxRetries) {
        console.log(`[NPCErrorHandler] Retrying operation for error ${error.id}`);
        
        // Wait before retry
        if (strategy.retryDelayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, strategy.retryDelayMs));
        }
        
        return true; // Indicate retry should happen
      }

      // Attempt fallback action
      console.log(`[NPCErrorHandler] Attempting fallback recovery for error ${error.id}`);
      const success = await strategy.fallbackAction(error);
      
      if (success) {
        stats.successes++;
        console.log(`[NPCErrorHandler] Successfully recovered from error ${error.id}`);
      }
      
      return success;
    } catch (recoveryError) {
      console.error(`[NPCErrorHandler] Recovery failed for error ${error.id}:`, recoveryError);
      return false;
    }
  }

  // ===== GRACEFUL DEGRADATION =====

  private evaluateDegradation(): void {
    const recentErrors = this.getRecentErrors(60000); // Last minute
    const criticalErrors = recentErrors.filter(e => e.severity === NPCErrorSeverity.CRITICAL).length;
    const highErrors = recentErrors.filter(e => e.severity === NPCErrorSeverity.HIGH).length;
    const totalErrors = recentErrors.length;

    let newDegradationLevel = 0;

    // Determine degradation level based on recent errors
    if (criticalErrors > 0 || totalErrors > 20) {
      newDegradationLevel = 5; // System disabled
    } else if (highErrors > 3 || totalErrors > 15) {
      newDegradationLevel = 4; // Emergency mode
    } else if (highErrors > 1 || totalErrors > 10) {
      newDegradationLevel = 3; // Heavy degradation
    } else if (totalErrors > 7) {
      newDegradationLevel = 2; // Medium degradation
    } else if (totalErrors > 3) {
      newDegradationLevel = 1; // Light degradation
    }

    if (newDegradationLevel !== this.currentDegradationLevel) {
      this.applyDegradation(newDegradationLevel);
    }
  }

  private applyDegradation(level: number): void {
    const oldLevel = this.currentDegradationLevel;
    this.currentDegradationLevel = level;
    
    const degradation = DEGRADATION_LEVELS[level];
    
    console.warn(`[NPCErrorHandler] Degradation level changed: ${oldLevel} -> ${level} (${degradation.name})`);
    console.warn(`[NPCErrorHandler] ${degradation.description}`);
    
    if (degradation.disabledFeatures.length > 0) {
      console.warn(`[NPCErrorHandler] Disabled features: ${degradation.disabledFeatures.join(', ')}`);
    }

    // Apply degradation settings
    this.broadcastDegradationChange(degradation);
  }

  private broadcastDegradationChange(degradation: DegradationLevel): void {
    // This would integrate with your event system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('npc-degradation-change', {
        detail: { degradation }
      }));
    }
  }

  // ===== CIRCUIT BREAKER INTEGRATION =====

  async executeWithProtection<T>(operation: () => Promise<T>): Promise<T> {
    return this.circuitBreaker.execute(operation);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    delayMs?: number
  ): Promise<T> {
    return this.retryMechanism.executeWithRetry(operation, maxRetries, delayMs);
  }

  // ===== MONITORING AND STATISTICS =====

  getRecentErrors(timeWindowMs: number = 300000): NPCError[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.errors.filter(error => error.timestamp > cutoff);
  }

  getErrorStatistics() {
    const stats = {
      totalErrors: this.errors.length,
      errorsByType: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>,
      recoveryRates: {} as Record<string, number>,
      recentErrorRate: 0,
      currentDegradationLevel: this.currentDegradationLevel,
      degradationInfo: DEGRADATION_LEVELS[this.currentDegradationLevel],
      circuitBreakerState: this.circuitBreaker.getState()
    };

    // Count errors by type
    this.errorCounts.forEach((count, type) => {
      stats.errorsByType[type] = count;
    });

    // Count errors by severity
    this.errors.forEach(error => {
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    // Calculate recovery rates
    this.recoverySuccessRate.forEach((rate, type) => {
      stats.recoveryRates[type] = rate.attempts > 0 ? rate.successes / rate.attempts : 0;
    });

    // Recent error rate (errors per minute)
    const recentErrors = this.getRecentErrors(60000);
    stats.recentErrorRate = recentErrors.length;

    return stats;
  }

  getDegradationLevel(): number {
    return this.currentDegradationLevel;
  }

  isFeatureEnabled(feature: string): boolean {
    const degradation = DEGRADATION_LEVELS[this.currentDegradationLevel];
    return !degradation.disabledFeatures.includes(feature) && !degradation.disabledFeatures.includes('all');
  }

  getPerformanceMultiplier(): number {
    return DEGRADATION_LEVELS[this.currentDegradationLevel].performanceMultiplier;
  }

  // ===== CONFIGURATION =====

  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.type, strategy);
    console.log(`[NPCErrorHandler] Added recovery strategy for ${strategy.type}`);
  }

  setMaxErrorHistory(max: number): void {
    this.maxErrorHistory = max;
    
    // Trim if necessary
    if (this.errors.length > max) {
      this.errors = this.errors.slice(-max);
    }
  }

  // ===== SYSTEM CONTROL =====

  enable(): void {
    this.isEnabled = true;
    console.log('[NPCErrorHandler] Error handling enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('[NPCErrorHandler] Error handling disabled');
  }

  reset(): void {
    this.errors.length = 0;
    this.errorCounts.clear();
    this.recoverySuccessRate.clear();
    this.currentDegradationLevel = 0;
    
    // Reinitialize
    Object.values(NPCErrorType).forEach(type => {
      this.errorCounts.set(type, 0);
      this.recoverySuccessRate.set(type, { attempts: 0, successes: 0 });
    });
    
    console.log('[NPCErrorHandler] System reset');
  }

  // ===== CLEANUP =====

  cleanup(): void {
    this.disable();
    this.reset();
    console.log('[NPCErrorHandler] Cleanup completed');
  }
}

// ===== GLOBAL INSTANCE =====

let globalErrorHandler: NPCErrorHandler | null = null;

export function getErrorHandler(): NPCErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new NPCErrorHandler();
  }
  return globalErrorHandler;
}

export function resetErrorHandler(): void {
  if (globalErrorHandler) {
    globalErrorHandler.cleanup();
    globalErrorHandler = null;
  }
}

// ===== UTILITY FUNCTIONS =====

export function createSafeWrapper<T extends (...args: any[]) => any>(
  fn: T,
  errorType: NPCErrorType,
  context: Record<string, any> = {}
): T {
  return (function(this: any, ...args: any[]) {
    try {
      const result = fn.apply(this, args);
      
      // Handle promises
      if (result && typeof result.catch === 'function') {
        return result.catch((error: Error) => {
          getErrorHandler().reportError(
            errorType,
            error.message,
            { ...context, args, originalError: error },
            NPCErrorSeverity.MEDIUM
          );
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      getErrorHandler().reportError(
        errorType,
        (error as Error).message,
        { ...context, args, originalError: error },
        NPCErrorSeverity.MEDIUM
      );
      throw error;
    }
  }) as T;
}
