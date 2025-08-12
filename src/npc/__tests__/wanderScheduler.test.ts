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

// src/npc/__tests__/wanderScheduler.test.ts
// Unit tests for the wandering scheduler

import { getWanderScheduler, WanderSchedulerConfig } from '../wanderScheduler';

// Mock timers
jest.useFakeTimers();

describe('WanderScheduler', () => {
  let mockMoveCallback: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    mockMoveCallback = jest.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Clean up global scheduler
    const scheduler = getWanderScheduler();
    scheduler.stop('test cleanup');
    
    // Unregister all NPCs to prevent test pollution
    const stats = scheduler.getStats();
    const registeredNPCs = (scheduler as any).npcs || new Map();
    for (const npcId of registeredNPCs.keys()) {
      scheduler.unregisterNPC(npcId);
    }
  });

  describe('Basic Operations', () => {
    test('should start and stop scheduler', () => {
      const scheduler = getWanderScheduler();
      
      expect(scheduler.getStats().isRunning).toBe(false);
      
      scheduler.start();
      expect(scheduler.getStats().isRunning).toBe(true);
      
      scheduler.stop('test');
      expect(scheduler.getStats().isRunning).toBe(false);
    });

    test('should register and unregister NPCs', () => {
      const scheduler = getWanderScheduler();
      
      scheduler.registerNPC('test-npc', mockMoveCallback);
      expect(scheduler.getStats().registeredNPCs).toBe(1);
      expect(scheduler.getNPCState('test-npc')).toBeTruthy();
      
      scheduler.unregisterNPC('test-npc');
      expect(scheduler.getStats().registeredNPCs).toBe(0);
      expect(scheduler.getNPCState('test-npc')).toBeNull();
    });
  });

  describe('Movement Scheduling', () => {
    test('should enforce one move per tick invariant', async () => {
      const config: Partial<WanderSchedulerConfig> = {
        baseTickMs: 100,
        jitterRangeMs: [0, 0] // No jitter for predictable testing
      };
      
      const scheduler = getWanderScheduler(config);
      
      // Register multiple NPCs
      scheduler.registerNPC('npc1', mockMoveCallback);
      scheduler.registerNPC('npc2', mockMoveCallback);
      scheduler.registerNPC('npc3', mockMoveCallback);
      
      scheduler.start();
      
      // Advance time by one tick
      jest.advanceTimersByTime(100);
      
      // Wait for any pending promises
      await new Promise(resolve => setImmediate(resolve));
      
      const stats = scheduler.getStats();
      expect(stats.totalTicks).toBe(1);
      
      // Should have moved each NPC once
      expect(mockMoveCallback).toHaveBeenCalledTimes(3);
      expect(mockMoveCallback).toHaveBeenCalledWith('npc1');
      expect(mockMoveCallback).toHaveBeenCalledWith('npc2');
      expect(mockMoveCallback).toHaveBeenCalledWith('npc3');
      
      // Advance another tick
      mockMoveCallback.mockClear();
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setImmediate(resolve));
      
      // Should move again
      expect(mockMoveCallback).toHaveBeenCalledTimes(3);
      
      scheduler.stop('test cleanup');
    }, 15000); // Increased timeout
  });

  describe('Pause and Resume', () => {
    test('should pause and resume global wandering', async () => {
      const config: Partial<WanderSchedulerConfig> = {
        baseTickMs: 100,
        jitterRangeMs: [0, 0]
      };
      
      const scheduler = getWanderScheduler(config);
      scheduler.registerNPC('test-npc', mockMoveCallback);
      scheduler.start();
      
      // Pause globally
      scheduler.pause({ global: true, reason: 'test pause' });
      expect(scheduler.getStats().pausedNPCs).toBe(1);
      
      // Advance time - should not move
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockMoveCallback).not.toHaveBeenCalled();
      
      // Resume
      scheduler.resume({ global: true, reason: 'test pause' });
      expect(scheduler.getStats().pausedNPCs).toBe(0);
      
      // Advance time - should move
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockMoveCallback).toHaveBeenCalledTimes(1);
    });

    test('should pause and resume specific NPCs', async () => {
      const config: Partial<WanderSchedulerConfig> = {
        baseTickMs: 100,
        jitterRangeMs: [0, 0]
      };
      
      const scheduler = getWanderScheduler(config);
      
      const callback1 = jest.fn().mockResolvedValue(undefined);
      const callback2 = jest.fn().mockResolvedValue(undefined);
      
      scheduler.registerNPC('npc1', callback1);
      scheduler.registerNPC('npc2', callback2);
      scheduler.start();
      
      // Pause only npc1
      scheduler.pause({ npcIds: ['npc1'], reason: 'test selective pause' });
      
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Only npc2 should move
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
      
      // Resume npc1
      scheduler.resume({ npcIds: ['npc1'], reason: 'test selective pause' });
      
      callback1.mockClear();
      callback2.mockClear();
      
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Both should move now
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      
      scheduler.stop('test cleanup');
    }, 10000);

    test('should handle multiple overlapping pause scopes', async () => {
      const scheduler = getWanderScheduler();
      scheduler.registerNPC('test-npc', mockMoveCallback);
      
      // Apply multiple pauses
      scheduler.pause({ global: true, reason: 'overlay' });
      scheduler.pause({ npcIds: ['test-npc'], reason: 'cutscene' });
      
      expect(scheduler.getStats().pausedNPCs).toBe(1);
      
      // Resume one scope - should still be paused
      scheduler.resume({ npcIds: ['test-npc'], reason: 'cutscene' });
      expect(scheduler.getStats().pausedNPCs).toBe(1);
      
      // Resume global - should be unpaused
      scheduler.resume({ global: true, reason: 'overlay' });
      expect(scheduler.getStats().pausedNPCs).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle move callback errors gracefully', async () => {
      const config: Partial<WanderSchedulerConfig> = {
        baseTickMs: 100,
        jitterRangeMs: [0, 0]
      };
      
      const failingCallback = jest.fn().mockRejectedValue(new Error('Move failed'));
      const scheduler = getWanderScheduler(config);
      
      scheduler.registerNPC('failing-npc', failingCallback);
      scheduler.start();
      
      // Should not throw
      jest.advanceTimersByTime(100);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(failingCallback).toHaveBeenCalledTimes(1);
      
      // Should try again on next tick (with backoff)
      failingCallback.mockClear();
      jest.advanceTimersByTime(200); // Double backoff time
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(failingCallback).toHaveBeenCalledTimes(1);
      
      scheduler.stop('test cleanup');
    }, 10000);
  });

  describe('Deterministic Behavior', () => {
    test('should produce consistent jitter with same seed', () => {
      const config: Partial<WanderSchedulerConfig> = {
        seed: 'test-seed-123',
        jitterRangeMs: [100, 300]
      };
      
      const scheduler1 = getWanderScheduler(config);
      scheduler1.registerNPC('test-npc', mockMoveCallback);
      const state1 = scheduler1.getNPCState('test-npc');
      
      // Create new scheduler with same seed
      const scheduler2 = getWanderScheduler(config);
      scheduler2.registerNPC('test-npc', mockMoveCallback);
      const state2 = scheduler2.getNPCState('test-npc');
      
      // Should have same jitter
      expect(state1?.jitterMs).toBe(state2?.jitterMs);
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should track scheduler statistics correctly', () => {
      const scheduler = getWanderScheduler();
      
      // Ensure clean state
      const registeredNPCs = (scheduler as any).npcs || new Map();
      for (const npcId of registeredNPCs.keys()) {
        scheduler.unregisterNPC(npcId);
      }
      
      const stats = scheduler.getStats();
      expect(stats.isRunning).toBe(false);
      expect(stats.registeredNPCs).toBe(0);
      expect(stats.pausedNPCs).toBe(0);
      expect(stats.totalTicks).toBe(0);
      
      scheduler.registerNPC('npc1', mockMoveCallback);
      scheduler.registerNPC('npc2', mockMoveCallback);
      scheduler.start();
      
      const runningStats = scheduler.getStats();
      expect(runningStats.isRunning).toBe(true);
      expect(runningStats.registeredNPCs).toBe(2);
      
      scheduler.pause({ global: true, reason: 'test' });
      const pausedStats = scheduler.getStats();
      expect(pausedStats.pausedNPCs).toBe(2);
      
      scheduler.stop('test cleanup');
    });
  });
});
