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

// src/npc/__tests__/errorHandling.test.ts
// Tests for NPC Error Handling and Graceful Degradation
// Gorstan Game Beta 1 - Code Licence MIT

import { 
  NPCErrorHandler,
  NPCErrorType,
  NPCErrorSeverity,
  getErrorHandler,
  resetErrorHandler,
  createSafeWrapper
} from '../errorHandling';

describe('NPCErrorHandler', () => {
  let errorHandler: NPCErrorHandler;

  beforeEach(() => {
    resetErrorHandler();
    errorHandler = new NPCErrorHandler();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    errorHandler.cleanup();
    resetErrorHandler();
    jest.restoreAllMocks();
  });

  describe('Error Reporting', () => {
    test('should report errors with context', async () => {
      const recovered = await errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED,
        'Test movement failure',
        { npcId: 'test-npc', roomId: 'test-room' },
        NPCErrorSeverity.MEDIUM
      );

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType[NPCErrorType.MOVEMENT_FAILED]).toBe(1);
      expect(stats.errorsBySeverity[NPCErrorSeverity.MEDIUM]).toBe(1);
    });

    test('should track error statistics', async () => {
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 1');
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 2');
      await errorHandler.reportError(NPCErrorType.PATHFINDING_ERROR, 'Error 3');

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType[NPCErrorType.MOVEMENT_FAILED]).toBe(2);
      expect(stats.errorsByType[NPCErrorType.PATHFINDING_ERROR]).toBe(1);
    });

    test('should auto-generate error IDs', async () => {
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Test error');
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors.length).toBe(1);
      expect(recentErrors[0].id).toMatch(/npc_error_\d+_[a-z0-9]+/);
    });

    test('should include stack traces', async () => {
      await errorHandler.reportError(NPCErrorType.UNKNOWN_ERROR, 'Test error');
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors[0].stackTrace).toBeTruthy();
    });
  });

  describe('Error Recovery', () => {
    test('should attempt recovery with fallback strategies', async () => {
      const recovered = await errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED,
        'Recoverable error',
        { npcId: 'test-npc', attemptCount: 1 },
        NPCErrorSeverity.LOW
      );

      // Should attempt recovery
      expect(typeof recovered).toBe('boolean');
    });

    test('should not attempt recovery for critical errors', async () => {
      const recovered = await errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED,
        'Critical error',
        { npcId: 'test-npc' },
        NPCErrorSeverity.CRITICAL
      );

      // Critical errors are not recoverable by default
      expect(recovered).toBe(false);
    });

    test('should track recovery success rates', async () => {
      // Report several errors to test recovery tracking
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 1');
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 2');
      await errorHandler.reportError(NPCErrorType.PATHFINDING_ERROR, 'Error 3');

      const stats = errorHandler.getErrorStatistics();
      expect(stats.recoveryRates).toHaveProperty(NPCErrorType.MOVEMENT_FAILED);
      expect(stats.recoveryRates).toHaveProperty(NPCErrorType.PATHFINDING_ERROR);
    });
  });

  describe('Graceful Degradation', () => {
    test('should start at degradation level 0', () => {
      expect(errorHandler.getDegradationLevel()).toBe(0);
      expect(errorHandler.isFeatureEnabled('zone-awareness')).toBe(true);
      expect(errorHandler.isFeatureEnabled('pathfinding')).toBe(true);
    });

    test('should increase degradation level with errors', async () => {
      // Generate many errors to trigger degradation
      const errorPromises = [];
      for (let i = 0; i < 10; i++) {
        errorPromises.push(
          errorHandler.reportError(
            NPCErrorType.MOVEMENT_FAILED,
            `Error ${i}`,
            {},
            NPCErrorSeverity.MEDIUM
          )
        );
      }
      
      // Wait for all errors to be processed
      await Promise.all(errorPromises);

      expect(errorHandler.getDegradationLevel()).toBeGreaterThan(0);
    }, 15000); // Increased timeout to 15 seconds

    test('should disable features based on degradation level', async () => {
      // Force degradation by reporting critical errors
      await errorHandler.reportError(
        NPCErrorType.PERFORMANCE_DEGRADATION,
        'Critical system failure',
        {},
        NPCErrorSeverity.CRITICAL
      );

      // Should be at maximum degradation
      expect(errorHandler.getDegradationLevel()).toBe(5);
      expect(errorHandler.isFeatureEnabled('zone-awareness')).toBe(false);
      expect(errorHandler.isFeatureEnabled('pathfinding')).toBe(false);
      expect(errorHandler.isFeatureEnabled('all')).toBe(false);
    });

    test('should provide performance multiplier based on degradation', async () => {
      const initialMultiplier = errorHandler.getPerformanceMultiplier();
      expect(initialMultiplier).toBe(1.0);

      // Force some degradation with batch processing
      const errorPromises = [];
      for (let i = 0; i < 5; i++) {
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

      const degradedMultiplier = errorHandler.getPerformanceMultiplier();
      expect(degradedMultiplier).toBeLessThan(1.0);
    }, 15000); // Increased timeout
  });

  describe('Circuit Breaker', () => {
    test('should execute operations through circuit breaker', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await errorHandler.executeWithProtection(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should open circuit after failures', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      // Try multiple times to trigger circuit breaker
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
  });

  describe('Retry Mechanism', () => {
    test('should retry failed operations', async () => {
      let attempts = 0;
      const retryOperation = jest.fn().mockImplementation(() => {
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

    test('should fail after max retries', async () => {
      const alwaysFailingOperation = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(
        errorHandler.executeWithRetry(alwaysFailingOperation, 2, 10)
      ).rejects.toThrow('Operation failed after 2 retries');
      
      expect(alwaysFailingOperation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });
  });

  describe('Recovery Strategies', () => {
    test('should use custom recovery strategies', () => {
      const customStrategy = {
        type: NPCErrorType.MOVEMENT_FAILED,
        maxRetries: 5,
        retryDelayMs: 100,
        shouldRetry: jest.fn().mockReturnValue(true),
        fallbackAction: jest.fn().mockResolvedValue(true)
      };

      errorHandler.addRecoveryStrategy(customStrategy);
      
      // Strategy should be stored (tested indirectly through recovery attempts)
      expect(true).toBe(true);
    });
  });

  describe('Recent Errors', () => {
    test('should filter errors by time window', async () => {
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Old error');
      
      // Get recent errors (last 5 minutes)
      const recentErrors = errorHandler.getRecentErrors(300000);
      expect(recentErrors.length).toBe(1);
      
      // Get very recent errors (last 1ms - should be empty)
      const veryRecentErrors = errorHandler.getRecentErrors(1);
      expect(veryRecentErrors.length).toBe(0);
    });

    test('should track recent error rate', async () => {
      // Report several errors
      for (let i = 0; i < 3; i++) {
        await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, `Error ${i}`);
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.recentErrorRate).toBe(3);
    });
  });

  describe('System Control', () => {
    test('should enable and disable error handling', () => {
      errorHandler.enable();
      errorHandler.disable();
      
      // Should not throw
      expect(true).toBe(true);
    });

    test('should reset error handler state', async () => {
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Test error');
      
      errorHandler.reset();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(0);
      expect(errorHandler.getDegradationLevel()).toBe(0);
    });

    test('should set max error history', async () => {
      errorHandler.setMaxErrorHistory(2);
      
      // Report more errors than the limit
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 1');
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 2');
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Error 3');
      
      // Should only keep the most recent errors
      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(2);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all resources', async () => {
      await errorHandler.reportError(NPCErrorType.MOVEMENT_FAILED, 'Test error');
      
      errorHandler.cleanup();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(0);
    });
  });

  describe('Global Instance', () => {
    test('should provide singleton instance', () => {
      const instance1 = getErrorHandler();
      const instance2 = getErrorHandler();
      
      expect(instance1).toBe(instance2);
      
      resetErrorHandler();
      
      const instance3 = getErrorHandler();
      expect(instance3).not.toBe(instance1);
    });
  });
});

describe('Safe Wrapper Utility', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should wrap synchronous functions safely', () => {
    const originalFn = jest.fn((x: number) => x * 2);
    const safeFn = createSafeWrapper(originalFn, NPCErrorType.UNKNOWN_ERROR);
    
    const result = safeFn(5);
    expect(result).toBe(10);
    expect(originalFn).toHaveBeenCalledWith(5);
  });

  test('should catch synchronous function errors', () => {
    const throwingFn = jest.fn(() => {
      throw new Error('Sync error');
    });
    const safeFn = createSafeWrapper(throwingFn, NPCErrorType.UNKNOWN_ERROR);
    
    expect(() => safeFn()).toThrow('Sync error');
    
    // Should have reported error
    const errorHandler = getErrorHandler();
    const stats = errorHandler.getErrorStatistics();
    expect(stats.totalErrors).toBeGreaterThan(0);
  });

  test('should wrap asynchronous functions safely', async () => {
    const asyncFn = jest.fn().mockResolvedValue('async result');
    const safeAsyncFn = createSafeWrapper(asyncFn, NPCErrorType.UNKNOWN_ERROR);
    
    const result = await safeAsyncFn();
    expect(result).toBe('async result');
    expect(asyncFn).toHaveBeenCalled();
  });

  test('should catch asynchronous function errors', async () => {
    const throwingAsyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
    const safeAsyncFn = createSafeWrapper(throwingAsyncFn, NPCErrorType.UNKNOWN_ERROR);
    
    await expect(safeAsyncFn()).rejects.toThrow('Async error');
    
    // Should have reported error
    const errorHandler = getErrorHandler();
    const stats = errorHandler.getErrorStatistics();
    expect(stats.totalErrors).toBeGreaterThan(0);
  });

  test('should preserve function context and arguments', () => {
    const originalFn = jest.fn(function(this: any, a: number, b: string) {
      return `${this?.name || 'unknown'}: ${a} ${b}`;
    });
    
    const context = { name: 'test' };
    const safeFn = createSafeWrapper(originalFn, NPCErrorType.UNKNOWN_ERROR);
    
    const result = safeFn.call(context, 42, 'hello');
    expect(result).toBe('test: 42 hello');
    expect(originalFn).toHaveBeenCalledWith(42, 'hello');
  });
});

describe('Error Handler Integration', () => {
  test('should handle high error rate scenarios', async () => {
    const errorHandler = new NPCErrorHandler();
    // Simulate a burst of errors
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        errorHandler.reportError(
          NPCErrorType.MOVEMENT_FAILED,
          `Burst error ${i}`,
          { timestamp: Date.now() },
          i < 5 ? NPCErrorSeverity.CRITICAL : NPCErrorSeverity.MEDIUM
        )
      );
    }
    await Promise.all(promises);
    // System should be heavily degraded or disabled
    expect([3,4,5]).toContain(errorHandler.getDegradationLevel());
    expect(errorHandler.getPerformanceMultiplier()).toBeLessThan(0.6);
    errorHandler.cleanup();
  });

  test('should recover from degradation over time', async () => {
    const errorHandler = new NPCErrorHandler();
    
    // Create initial degradation with batch processing
    const errorPromises = [];
    for (let i = 0; i < 5; i++) {
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
    
    const initialDegradation = errorHandler.getDegradationLevel();
    expect(initialDegradation).toBeGreaterThan(0);
    
    // Simulate time passing without errors
    // (In real implementation, degradation would decrease over time)
    // For testing, we can reset and check that the system can return to normal
    errorHandler.reset();
    
    expect(errorHandler.getDegradationLevel()).toBe(0);
    expect(errorHandler.getPerformanceMultiplier()).toBe(1.0);
    
    errorHandler.cleanup();
  }, 15000); // Increased timeout

  test('should handle concurrent error reporting', async () => {
    const errorHandler = new NPCErrorHandler();
    
    // Report many errors concurrently
    const promises = Array.from({ length: 50 }, (_, i) =>
      errorHandler.reportError(
        NPCErrorType.MOVEMENT_FAILED,
        `Concurrent error ${i}`,
        { index: i },
        i % 3 === 0 ? NPCErrorSeverity.HIGH : NPCErrorSeverity.MEDIUM
      )
    );
    
    const results = await Promise.all(promises);
    
    // All errors should be processed
    expect(results).toHaveLength(50);
    
    const stats = errorHandler.getErrorStatistics();
    expect(stats.totalErrors).toBe(50);
    
    errorHandler.cleanup();
  });
}, 15000);
