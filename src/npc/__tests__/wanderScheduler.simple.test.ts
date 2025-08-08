// src/npc/__tests__/wanderScheduler.simple.test.ts
// Simplified unit tests for wandering scheduler

import { WanderScheduler, WanderSchedulerConfig } from '../wanderScheduler';

describe('WanderScheduler - Core Functionality', () => {
  let scheduler: WanderScheduler;
  let mockMoveCallback: jest.Mock;

  beforeEach(() => {
    mockMoveCallback = jest.fn().mockResolvedValue(undefined);
    scheduler = new WanderScheduler({
      baseTickMs: 1000,
      jitterRangeMs: [0, 0]
    });
  });

  afterEach(() => {
    if (scheduler && scheduler.getStats().isRunning) {
      scheduler.stop('test cleanup');
    }
  });

  test('should register and unregister NPCs', () => {
    expect(scheduler.getStats().registeredNPCs).toBe(0);

    scheduler.registerNPC('test-npc', mockMoveCallback);
    expect(scheduler.getStats().registeredNPCs).toBe(1);

    scheduler.unregisterNPC('test-npc');
    expect(scheduler.getStats().registeredNPCs).toBe(0);
  });

  test('should start and stop scheduler', () => {
    expect(scheduler.getStats().isRunning).toBe(false);

    scheduler.start();
    expect(scheduler.getStats().isRunning).toBe(true);

    scheduler.stop('test cleanup');
    expect(scheduler.getStats().isRunning).toBe(false);
  });

  test('should pause and resume NPCs', () => {
    scheduler.registerNPC('test-npc', mockMoveCallback);
    
    expect(scheduler.getStats().pausedNPCs).toBe(0);

    scheduler.pause({ npcIds: ['test-npc'], reason: 'test pause' });
    expect(scheduler.getStats().pausedNPCs).toBe(1);

    scheduler.resume({ npcIds: ['test-npc'], reason: 'test pause' });
    expect(scheduler.getStats().pausedNPCs).toBe(0);
  });

  test('should handle global pause', () => {
    scheduler.registerNPC('npc1', mockMoveCallback);
    scheduler.registerNPC('npc2', mockMoveCallback);
    
    expect(scheduler.getStats().pausedNPCs).toBe(0);

    scheduler.pause({ global: true, reason: 'global pause' });
    expect(scheduler.getStats().pausedNPCs).toBe(2);

    scheduler.resume({ global: true, reason: 'global pause' });
    expect(scheduler.getStats().pausedNPCs).toBe(0);
  });

  test('should track statistics correctly', () => {
    scheduler.registerNPC('test-npc', mockMoveCallback);
    
    const stats = scheduler.getStats();
    expect(stats.registeredNPCs).toBe(1);
    expect(stats.pausedNPCs).toBe(0);
    expect(stats.isRunning).toBe(false);
    expect(stats.totalTicks).toBe(0);
  });

  test('should handle multiple pause scopes', () => {
    scheduler.registerNPC('test-npc', mockMoveCallback);
    
    // Apply multiple pause scopes
    scheduler.pause({ npcIds: ['test-npc'], reason: 'cutscene' });
    scheduler.pause({ global: true, reason: 'overlay' });
    
    expect(scheduler.getStats().pausedNPCs).toBe(1);
    
    // Resume one scope - should still be paused
    scheduler.resume({ npcIds: ['test-npc'], reason: 'cutscene' });
    expect(scheduler.getStats().pausedNPCs).toBe(1);
    
    // Resume global scope - should be unpaused
    scheduler.resume({ global: true, reason: 'overlay' });
    expect(scheduler.getStats().pausedNPCs).toBe(0);
  });
});
