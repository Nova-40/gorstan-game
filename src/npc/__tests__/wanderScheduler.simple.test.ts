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
