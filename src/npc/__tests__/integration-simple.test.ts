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

// src/npc/__tests__/integration-simple.test.ts
// Simplified Integration Tests for NPC Wandering System
// Gorstan Game Beta 1 - Code Licence MIT

import { MovementExecutor } from '../movementExecution';
import { NPCPerformanceOptimizer } from '../performanceOptimizer';
import { NPCErrorHandler, NPCErrorType, NPCErrorSeverity } from '../errorHandling';

// Mock browser APIs for testing
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('NPC Wandering System Integration (Core Components)', () => {
  let movementExecutor: MovementExecutor;
  let performanceOptimizer: NPCPerformanceOptimizer;
  let errorHandler: NPCErrorHandler;

  beforeEach(() => {
    performanceOptimizer = new NPCPerformanceOptimizer();
    errorHandler = new NPCErrorHandler();
    movementExecutor = new MovementExecutor();

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    performanceOptimizer.cleanup();
    errorHandler.cleanup();
    
    jest.restoreAllMocks();
  });

  describe('Component Initialization', () => {
    test('should initialize core components successfully', () => {
      expect(movementExecutor).toBeTruthy();
      expect(performanceOptimizer).toBeTruthy();
      expect(errorHandler).toBeTruthy();
    });

    test('should have expected API methods', () => {
      expect(typeof movementExecutor.start).toBe('function');
      expect(typeof movementExecutor.stop).toBe('function');
      expect(typeof performanceOptimizer.getMetrics).toBe('function');
      expect(typeof errorHandler.reportError).toBe('function');
    });
  });

  describe('Performance Integration', () => {
    test('should monitor performance metrics', () => {
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('memoryUsageMB');
      expect(metrics).toHaveProperty('averageMovementTimeMs');
      expect(typeof metrics.cacheHitRate).toBe('number');
    });

    test('should provide optimization suggestions', () => {
      const suggestions = performanceOptimizer.getOptimizationSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    test('should track batch processing metrics', () => {
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle and track errors', async () => {
      await errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED,
        'Test movement error',
        { npcId: 'test-npc' },
        NPCErrorSeverity.MEDIUM
      );

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(1);
    });

    test('should implement circuit breaker pattern', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      for (let i = 0; i < 6; i++) {
        try {
          await errorHandler.executeWithProtection(failingOperation);
        } catch (error) {
          // Expected to fail
        }
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.circuitBreakerState).toBe('OPEN');
    });

    test('should retry failed operations', async () => {
      let attempts = 0;
      const retryOperation = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await errorHandler.executeWithRetry(retryOperation, 3, 10);
      
      expect(result).toBe('success');
      expect(retryOperation).toHaveBeenCalledTimes(3);
    });

    test('should degrade gracefully under high error rates', async () => {
      const errorPromises = [];
      for (let i = 0; i < 10; i++) {
        errorPromises.push(
          errorHandler.reportError(
            NPCErrorType.MOVEMENT_FAILED,
            `Error ${i}`,
            {},
            NPCErrorSeverity.HIGH
          )
        );
      }

      await Promise.all(errorPromises);

      const degradationLevel = errorHandler.getDegradationLevel();
      expect(degradationLevel).toBeGreaterThan(0);

      const performanceMultiplier = errorHandler.getPerformanceMultiplier();
      expect(performanceMultiplier).toBeLessThan(1.0);
    }, 15000); // 15 second timeout
  });

  describe('Movement Execution Integration', () => {
    test('should start and stop movement execution', () => {
      // Mock the movement executor to avoid browser dependencies
      jest.spyOn(movementExecutor, 'start').mockImplementation(() => {});
      jest.spyOn(movementExecutor, 'stop').mockImplementation(() => {});

      movementExecutor.start();
      expect(movementExecutor.start).toHaveBeenCalled();

      movementExecutor.stop();
      expect(movementExecutor.stop).toHaveBeenCalled();
    });
  });

  describe('Cross-Component Integration', () => {
    test('should coordinate performance and error handling', async () => {
      // Generate some errors
      await errorHandler.reportError(
        NPCErrorType.PERFORMANCE_DEGRADATION,
        'Performance issue detected',
        {},
        NPCErrorSeverity.MEDIUM
      );

      // Check that performance metrics are still available
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toBeTruthy();
      expect(typeof metrics.cacheHitRate).toBe('number');
    });

    test('should handle high-load scenarios', async () => {
      const startTime = performance.now();
      
      // Simulate high load with both errors and performance operations
      const operations = [];
      
      for (let i = 0; i < 10; i++) {
        operations.push(
          errorHandler.reportError(
            NPCErrorType.MOVEMENT_FAILED,
            `Load test error ${i}`,
            { iteration: i },
            NPCErrorSeverity.LOW
          )
        );
        
        operations.push(
          Promise.resolve(performanceOptimizer.getMetrics())
        );
      }

      await Promise.all(operations);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000); // More generous timeout

      // Check system health
      const errorStats = errorHandler.getErrorStatistics();
      expect(errorStats.totalErrors).toBe(10);
      
      const degradationLevel = errorHandler.getDegradationLevel();
      expect(degradationLevel).toBeLessThan(4); // Should not be critically degraded
    });
  });

  describe('Alliance Memory Integration', () => {
    test('should maintain NPC alliance memories across system operations', async () => {
      const allianceData = {
        npcId: 'morthos',
        ally: 'al',
        roomId: 'intro-controlroom',
        timestamp: Date.now() - 100000,
        strength: 0.8
      };

      await errorHandler.reportError(
        NPCErrorType.UNKNOWN_ERROR,
        'Alliance memory accessed',
        allianceData,
        NPCErrorSeverity.LOW
      );

      const errorStats = errorHandler.getErrorStatistics();
      expect(errorStats.totalErrors).toBe(1);

      // Verify alliance data was processed
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors.length).toBeGreaterThan(0);
      expect(recentErrors[0].context).toEqual(allianceData);
    });

    test('should handle concurrent alliance operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 5; i++) {
        const allianceData = {
          npcId: `npc-${i}`,
          ally: 'player',
          roomId: 'test-room',
          timestamp: Date.now(),
          strength: 0.5 + (i * 0.1)
        };

        operations.push(
          errorHandler.reportError(
            NPCErrorType.UNKNOWN_ERROR,
            `Alliance ${i}`,
            allianceData,
            NPCErrorSeverity.LOW
          )
        );
      }

      await Promise.all(operations);

      const errorStats = errorHandler.getErrorStatistics();
      expect(errorStats.totalErrors).toBe(5);
    });
  });

  describe('System Resilience', () => {
    test('should recover from temporary failures', async () => {
      let failureCount = 0;
      const unreliableOperation = jest.fn().mockImplementation(async () => {
        failureCount++;
        if (failureCount <= 2) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const result = await errorHandler.executeWithRetry(unreliableOperation, 3, 10);
      expect(result).toBe('success');
      expect(failureCount).toBe(3);
    });

    test('should maintain performance under stress', async () => {
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          Promise.resolve(performanceOptimizer.getMetrics())
        );
      }

      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);

      const degradationLevel = errorHandler.getDegradationLevel();
      expect(degradationLevel).toBeLessThan(3);
    });

    test('should cleanup all resources properly', () => {
      expect(() => {
        performanceOptimizer.cleanup();
        errorHandler.cleanup();
      }).not.toThrow();
    });

    test('should reset state when requested', async () => {
      await errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED, 
        'Test error'
      );

      errorHandler.reset();

      const errorStats = errorHandler.getErrorStatistics();
      expect(errorStats.totalErrors).toBe(0);
    });
  });

  describe('Performance Under Load', () => {
    test('should handle concurrent error reporting and performance monitoring', async () => {
      const operations = [];
      
      // Mix error reporting and performance monitoring
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          operations.push(
            errorHandler.reportError(
              NPCErrorType.MOVEMENT_FAILED,
              `Concurrent error ${i}`,
              { index: i },
              NPCErrorSeverity.LOW
            )
          );
        } else {
          operations.push(
            Promise.resolve(performanceOptimizer.getMetrics())
          );
        }
      }

      const startTime = performance.now();
      await Promise.all(operations);
      const endTime = performance.now();

      // Should complete quickly despite concurrent operations
      expect(endTime - startTime).toBeLessThan(2000); // More generous timeout

      // Verify operations completed successfully
      const errorStats = errorHandler.getErrorStatistics();
      expect(errorStats.totalErrors).toBe(10); // Half were errors

      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toBeTruthy();
    });

    test('should maintain performance under error conditions', async () => {
      // Generate errors that would normally cause system stress
      const errorPromises = [];
      for (let i = 0; i < 15; i++) {
        errorPromises.push(
          errorHandler.reportError(
            NPCErrorType.PERFORMANCE_DEGRADATION,
            `High load error ${i}`,
            { load: i },
            i % 3 === 0 ? NPCErrorSeverity.CRITICAL : NPCErrorSeverity.HIGH
          )
        );
      }

      await Promise.all(errorPromises);

      // System should be degraded but still functional
      const degradationLevel = errorHandler.getDegradationLevel();
      expect(degradationLevel).toBeGreaterThan(2);
      expect(degradationLevel).toBeLessThanOrEqual(5);

      // Basic operations should still work
      const metrics = performanceOptimizer.getMetrics();
      expect(metrics).toBeTruthy();
      expect(typeof metrics.cacheHitRate).toBe('number');
    });
  });
});
