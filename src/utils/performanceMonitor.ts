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

// (c) Geoff Webster 2025

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  renderTime: number;
  npcProcessingTime: number;
  roomLoadTime: number;
  animationFrameTime: number;
  lastUpdate: number;
}

interface PerformanceThresholds {
  minFrameRate: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxNpcProcessingTime: number;
  maxRoomLoadTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private renderStartTime: number = 0;
  private warnings: string[] = [];
  private isMonitoring: boolean = false;

  constructor() {
    this.metrics = {
      frameRate: 60,
      memoryUsage: 0,
      renderTime: 0,
      npcProcessingTime: 0,
      roomLoadTime: 0,
      animationFrameTime: 0,
      lastUpdate: Date.now()
    };

    this.thresholds = {
      minFrameRate: 30,
      maxMemoryUsage: 100, // MB
      maxRenderTime: 16.67, // ~60fps
      maxNpcProcessingTime: 10, // ms
      maxRoomLoadTime: 500 // ms
    };
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('[PerformanceMonitor] Monitoring started');
    
    // Start frame rate monitoring
    this.monitorFrameRate();
    
    // Start memory monitoring
    this.monitorMemoryUsage();
    
    // Monitor render performance
    this.monitorRenderPerformance();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[PerformanceMonitor] Monitoring stopped');
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    const measureFrameRate = (timestamp: number) => {
      if (!this.isMonitoring) return;
      
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        this.frameCount++;
        
        // Calculate FPS every second
        if (this.frameCount >= 60) {
          this.metrics.frameRate = Math.round(1000 / (delta));
          this.frameCount = 0;
          
          // Check for performance issues
          if (this.metrics.frameRate < this.thresholds.minFrameRate) {
            this.addWarning(`Low frame rate: ${this.metrics.frameRate}fps`);
          }
        }
      }
      
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      if (!this.isMonitoring) return;
      
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
          this.addWarning(`High memory usage: ${this.metrics.memoryUsage}MB`);
        }
      }
      
      setTimeout(checkMemory, 5000); // Check every 5 seconds
    };
    
    checkMemory();
  }

  /**
   * Monitor render performance
   */
  private monitorRenderPerformance(): void {
    // This would be called at the start of render cycles
    performance.mark?.('render-start');
  }

  /**
   * Record render start time
   */
  public markRenderStart(): void {
    this.renderStartTime = performance.now();
  }

  /**
   * Record render end time
   */
  public markRenderEnd(): void {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      
      if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
        this.addWarning(`Slow render: ${this.metrics.renderTime.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Record NPC processing time
   */
  public recordNpcProcessingTime(processingTime: number): void {
    this.metrics.npcProcessingTime = processingTime;
    
    if (processingTime > this.thresholds.maxNpcProcessingTime) {
      this.addWarning(`Slow NPC processing: ${processingTime.toFixed(2)}ms`);
    }
  }

  /**
   * Record room load time
   */
  public recordRoomLoadTime(roomId: string, loadTime: number): void {
    this.metrics.roomLoadTime = loadTime;
    
    if (loadTime > this.thresholds.maxRoomLoadTime) {
      this.addWarning(`Slow room load (${roomId}): ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Add performance warning
   */
  private addWarning(warning: string): void {
    this.warnings.push(`[${new Date().toLocaleTimeString()}] ${warning}`);
    
    // Keep only recent warnings
    if (this.warnings.length > 20) {
      this.warnings = this.warnings.slice(-10);
    }
    
    // Log critical warnings
  if (import.meta.env.DEV) {
      console.warn('[PerformanceMonitor]', warning);
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics, lastUpdate: Date.now() };
  }

  /**
   * Get performance warnings
   */
  public getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Clear warnings
   */
  public clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * Update thresholds
   */
  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('[PerformanceMonitor] Thresholds updated:', this.thresholds);
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    status: 'good' | 'warning' | 'critical';
    metrics: PerformanceMetrics;
    issues: string[];
  } {
    const issues: string[] = [];
    let status: 'good' | 'warning' | 'critical' = 'good';

    // Check frame rate
    if (this.metrics.frameRate < this.thresholds.minFrameRate) {
      issues.push(`Low FPS: ${this.metrics.frameRate}`);
      status = this.metrics.frameRate < 15 ? 'critical' : 'warning';
    }

    // Check memory
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      issues.push(`High memory: ${this.metrics.memoryUsage}MB`);
      status = this.metrics.memoryUsage > 200 ? 'critical' : 'warning';
    }

    // Check render time
    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      issues.push(`Slow render: ${this.metrics.renderTime.toFixed(1)}ms`);
      status = this.metrics.renderTime > 33 ? 'critical' : 'warning';
    }

    return {
      status,
      metrics: this.getMetrics(),
      issues
    };
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const summary = this.getPerformanceSummary();
    const warnings = this.getWarnings();
    
    return `
=== GORSTAN PERFORMANCE REPORT ===
Status: ${summary.status.toUpperCase()}
Generated: ${new Date().toLocaleString()}

METRICS:
- Frame Rate: ${summary.metrics.frameRate} fps
- Memory Usage: ${summary.metrics.memoryUsage} MB
- Render Time: ${summary.metrics.renderTime.toFixed(2)} ms
- NPC Processing: ${summary.metrics.npcProcessingTime.toFixed(2)} ms
- Room Load Time: ${summary.metrics.roomLoadTime.toFixed(2)} ms

ISSUES:
${summary.issues.length > 0 ? summary.issues.map(issue => `- ${issue}`).join('\n') : '- None detected'}

RECENT WARNINGS:
${warnings.length > 0 ? warnings.map(warning => `- ${warning}`).join('\n') : '- None recorded'}

THRESHOLDS:
- Min FPS: ${this.thresholds.minFrameRate}
- Max Memory: ${this.thresholds.maxMemoryUsage} MB
- Max Render Time: ${this.thresholds.maxRenderTime} ms
- Max NPC Processing: ${this.thresholds.maxNpcProcessingTime} ms
- Max Room Load: ${this.thresholds.maxRoomLoadTime} ms
`;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Automatic monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.startMonitoring();
  
  // Add global performance commands for debugging
  (window as any).gorstan = {
    ...(window as any).gorstan,
    performance: {
      getMetrics: () => performanceMonitor.getMetrics(),
      getReport: () => console.log(performanceMonitor.generateReport()),
      clearWarnings: () => performanceMonitor.clearWarnings(),
      setSummary: () => console.log(performanceMonitor.getPerformanceSummary())
    }
  };
}

export default performanceMonitor;
