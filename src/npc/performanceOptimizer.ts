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

// src/npc/performanceOptimizer.ts

/**
 * Performance optimization strategies for NPC systems
 */

// ===== PERFORMANCE MONITORING =====

export interface PerformanceMetrics {
  // Memory usage
  memoryUsageMB: number;
  npcCount: number;
  activeMovements: number;
  
  // Timing metrics
  averageMovementTimeMs: number;
  worstMovementTimeMs: number;
  totalMovements: number;
  
  // Resource efficiency
  cacheHitRate: number;
  garbageCollectionCount: number;
  
  // System health
  errorCount: number;
  warningCount: number;
  systemLoad: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceThresholds {
  maxMemoryMB: number;
  maxMovementTimeMs: number;
  minCacheHitRate: number;
  maxErrorsPerMinute: number;
  maxNPCCount: number;
}

export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  maxMemoryMB: 50,          // Maximum memory usage for NPC system
  maxMovementTimeMs: 100,   // Maximum time for a single movement calculation
  minCacheHitRate: 0.8,     // Minimum cache efficiency
  maxErrorsPerMinute: 5,    // Maximum errors before degradation
  maxNPCCount: 20           // Maximum active NPCs
};

// ===== MEMORY MANAGEMENT =====

class MemoryPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      utilization: 1 - (this.pool.length / this.maxSize)
    };
  }
}

// ===== EFFICIENT CACHING SYSTEM =====

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: (this.cache.size / this.maxSize) * 100
    };
  }
}

// ===== BATCH PROCESSING =====

export class BatchProcessor<T> {
  private queue: T[] = [];
  private processFn: (items: T[]) => Promise<void>;
  private batchSize: number;
  private intervalMs: number;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    processFn: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    intervalMs: number = 100
  ) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.intervalMs = intervalMs;
  }

  add(item: T): void {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.intervalMs);
    }
  }

  async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    try {
      await this.processFn(batch);
    } catch (error) {
      console.error('[BatchProcessor] Error processing batch:', error);
      // Re-queue failed items (up to 3 retries)
      batch.forEach(item => {
        if ((item as any)._retries < 3) {
          (item as any)._retries = ((item as any)._retries || 0) + 1;
          this.queue.unshift(item);
        }
      });
    }
  }

  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.queue.length = 0;
  }

  getStats() {
    return {
      queueSize: this.queue.length,
      batchSize: this.batchSize,
      intervalMs: this.intervalMs,
      isScheduled: this.timeoutId !== null
    };
  }
}

// ===== PERFORMANCE OPTIMIZER =====

export class NPCPerformanceOptimizer {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private movementCache: LRUCache<string, string[]>;
  private errorLog: Array<{ timestamp: number; error: string }> = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Memory pools
  private movementDataPool: MemoryPool<any>;
  
  // Batch processors
  private movementBatchProcessor: BatchProcessor<any>;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_PERFORMANCE_THRESHOLDS, ...thresholds };
    this.movementCache = new LRUCache<string, string[]>(500);
    
    this.metrics = {
      memoryUsageMB: 0,
      npcCount: 0,
      activeMovements: 0,
      averageMovementTimeMs: 0,
      worstMovementTimeMs: 0,
      totalMovements: 0,
      cacheHitRate: 1.0,
      garbageCollectionCount: 0,
      errorCount: 0,
      warningCount: 0,
      systemLoad: 'low'
    };

    // Initialize memory pools
    this.movementDataPool = new MemoryPool(
      () => ({ npcId: '', fromRoom: '', toRoom: '', timestamp: 0, metadata: {} }),
      (obj) => { 
        obj.npcId = ''; 
        obj.fromRoom = ''; 
        obj.toRoom = ''; 
        obj.timestamp = 0; 
        obj.metadata = {}; 
      },
      50
    );

    // Initialize batch processors
    this.movementBatchProcessor = new BatchProcessor(
      async (movements) => {
        console.log(`[PerformanceOptimizer] Processing ${movements.length} movements`);
        // Process movements in batch for efficiency
      },
      5,  // Process in batches of 5
      200 // Process every 200ms
    );
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkPerformanceThresholds();
    }, 5000); // Monitor every 5 seconds

    console.log('[PerformanceOptimizer] Started performance monitoring');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('[PerformanceOptimizer] Stopped performance monitoring');
  }

  // ===== MOVEMENT OPTIMIZATION =====

  getOptimizedRoomPath(fromRoom: string, toRoom: string, roomRegistry: Record<string, string[]>): string[] | null {
    const cacheKey = `${fromRoom}->${toRoom}`;
    
    // Check cache first
    const cached = this.movementCache.get(cacheKey);
    if (cached) {
      this.updateCacheHitRate(true);
      return cached;
    }

    this.updateCacheHitRate(false);

    // Calculate path (simple BFS for now)
    const path = this.calculateShortestPath(fromRoom, toRoom, roomRegistry);
    
    // Cache the result
    if (path) {
      this.movementCache.set(cacheKey, path);
    }

    return path;
  }

  private calculateShortestPath(fromRoom: string, toRoom: string, roomRegistry: Record<string, string[]>): string[] | null {
    if (fromRoom === toRoom) return [fromRoom];
    
    const visited = new Set<string>();
    const queue: Array<{ room: string; path: string[] }> = [{ room: fromRoom, path: [fromRoom] }];
    
    while (queue.length > 0) {
      const { room, path } = queue.shift()!;
      
      if (visited.has(room)) continue;
      visited.add(room);
      
      const adjacent = roomRegistry[room] || [];
      for (const nextRoom of adjacent) {
        if (nextRoom === toRoom) {
          return [...path, nextRoom];
        }
        
        if (!visited.has(nextRoom)) {
          queue.push({ room: nextRoom, path: [...path, nextRoom] });
        }
      }
    }
    
    return null; // No path found
  }

  // ===== BATCH OPERATIONS =====

  batchMovement(movementData: any): void {
    this.movementBatchProcessor.add(movementData);
  }

  // ===== MEMORY MANAGEMENT =====

  acquireMovementData(): any {
    return this.movementDataPool.acquire();
  }

  releaseMovementData(data: any): void {
    this.movementDataPool.release(data);
  }

  // ===== PERFORMANCE MONITORING =====

  private updateMetrics(): void {
    // Update memory usage
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsageMB = memInfo.usedJSHeapSize / (1024 * 1024);
    }

    // Clean old errors (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.errorLog = this.errorLog.filter(entry => entry.timestamp > oneMinuteAgo);
    this.metrics.errorCount = this.errorLog.length;

    // Calculate system load
    this.metrics.systemLoad = this.calculateSystemLoad();
  }

  private calculateSystemLoad(): 'low' | 'medium' | 'high' | 'critical' {
    const factors = [
      this.metrics.memoryUsageMB / this.thresholds.maxMemoryMB,
      this.metrics.averageMovementTimeMs / this.thresholds.maxMovementTimeMs,
      this.metrics.errorCount / this.thresholds.maxErrorsPerMinute,
      this.metrics.npcCount / this.thresholds.maxNPCCount
    ];

    const maxFactor = Math.max(...factors);
    
    if (maxFactor > 1.5) return 'critical';
    if (maxFactor > 1.0) return 'high';
    if (maxFactor > 0.7) return 'medium';
    return 'low';
  }

  private checkPerformanceThresholds(): void {
    const issues: string[] = [];

    if (this.metrics.memoryUsageMB > this.thresholds.maxMemoryMB) {
      issues.push(`Memory usage exceeded: ${this.metrics.memoryUsageMB.toFixed(1)}MB > ${this.thresholds.maxMemoryMB}MB`);
    }

    if (this.metrics.averageMovementTimeMs > this.thresholds.maxMovementTimeMs) {
      issues.push(`Movement time exceeded: ${this.metrics.averageMovementTimeMs.toFixed(1)}ms > ${this.thresholds.maxMovementTimeMs}ms`);
    }

    if (this.metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      issues.push(`Cache hit rate low: ${(this.metrics.cacheHitRate * 100).toFixed(1)}% < ${(this.thresholds.minCacheHitRate * 100)}%`);
    }

    if (issues.length > 0) {
      console.warn('[PerformanceOptimizer] Performance issues detected:', issues);
      this.metrics.warningCount++;
    }
  }

  private updateCacheHitRate(hit: boolean): void {
    // Simple moving average
    const weight = 0.95;
    this.metrics.cacheHitRate = this.metrics.cacheHitRate * weight + (hit ? 1 : 0) * (1 - weight);
  }

  // ===== ERROR HANDLING =====

  recordError(error: string): void {
    this.errorLog.push({ timestamp: Date.now(), error });
    console.error('[PerformanceOptimizer] Error recorded:', error);
  }

  // ===== CLEANUP =====

  cleanup(): void {
    this.stopMonitoring();
    this.movementCache.clear();
    this.movementDataPool.clear();
    this.movementBatchProcessor.clear();
    this.errorLog.length = 0;
    
    console.log('[PerformanceOptimizer] Cleanup completed');
  }

  // ===== METRICS ACCESS =====

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getDetailedStats() {
    return {
      metrics: this.getMetrics(),
      thresholds: this.thresholds,
      cache: this.movementCache.getStats(),
      memoryPool: this.movementDataPool.getStats(),
      batchProcessor: this.movementBatchProcessor.getStats(),
      isMonitoring: this.isMonitoring
    };
  }

  // ===== OPTIMIZATION SUGGESTIONS =====

  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.metrics.memoryUsageMB > this.thresholds.maxMemoryMB * 0.8) {
      suggestions.push('Consider reducing NPC count or implementing more aggressive cleanup');
    }

    if (this.metrics.cacheHitRate < 0.6) {
      suggestions.push('Cache hit rate is low - consider adjusting cache size or movement patterns');
    }

    if (this.metrics.averageMovementTimeMs > this.thresholds.maxMovementTimeMs * 0.8) {
      suggestions.push('Movement calculations are slow - consider optimizing pathfinding algorithms');
    }

    if (this.metrics.errorCount > this.thresholds.maxErrorsPerMinute * 0.5) {
      suggestions.push('Error rate is high - review error handling and input validation');
    }

    return suggestions;
  }
}

// ===== GLOBAL INSTANCE =====

let globalOptimizer: NPCPerformanceOptimizer | null = null;

export function getPerformanceOptimizer(): NPCPerformanceOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new NPCPerformanceOptimizer();
    globalOptimizer.startMonitoring();
  }
  return globalOptimizer;
}

export function resetPerformanceOptimizer(): void {
  if (globalOptimizer) {
    globalOptimizer.cleanup();
    globalOptimizer = null;
  }
}
