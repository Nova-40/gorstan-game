// src/npc/__tests__/movementExecution.test.ts
// Tests for the movement execution layer

import { 
  MovementExecutor, 
  getMovementExecutor, 
  resetMovementExecutor,
  setupNPCMovement,
  shutdownNPCMovement,
  NPCMovementConfig 
} from '../movementExecution';
import { resetNPCPresenceProvider } from '../npcPresence';

// Mock the timer functions
jest.useFakeTimers();

describe('MovementExecutor', () => {
  let executor: MovementExecutor;

  beforeEach(() => {
    resetMovementExecutor();
    resetNPCPresenceProvider();
    executor = getMovementExecutor();
    jest.clearAllTimers();
  });

  afterEach(() => {
    executor.stop();
    executor.clear();
    jest.clearAllTimers();
  });

  describe('Basic Operations', () => {
    test('should start and stop correctly', () => {
      expect(executor.getStats().totalNPCs).toBe(0);
      
      executor.start();
      // System should be running but no NPCs yet
      expect(executor.getStats().totalNPCs).toBe(0);
      
      executor.stop();
      // Should still remember NPCs after stop
      expect(executor.getStats().totalNPCs).toBe(0);
    });

    test('should register and unregister NPCs', () => {
      executor.start();
      
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'home',
        roamRadius: 2
      };

      executor.registerNPC(config);
      expect(executor.getStats().totalNPCs).toBe(1);
      expect(executor.getStats().activeNPCs).toBe(1);
      
      const retrievedConfig = executor.getNPCConfig('test-npc');
      expect(retrievedConfig).toBeTruthy();
      expect(retrievedConfig!.npcType).toBe('wanderer');
      expect(retrievedConfig!.homeRoom).toBe('home');
      
      executor.unregisterNPC('test-npc');
      expect(executor.getStats().totalNPCs).toBe(0);
      expect(executor.getNPCConfig('test-npc')).toBeNull();
    });

    test('should not register NPCs when stopped', () => {
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'home'
      };

      executor.registerNPC(config);
      expect(executor.getStats().totalNPCs).toBe(0);
    });
  });

  describe('NPC Configuration', () => {
    beforeEach(() => {
      executor.start();
    });

    test('should handle different NPC types', () => {
      const configs: NPCMovementConfig[] = [
        { npcId: 'wanderer1', npcType: 'wanderer', homeRoom: 'room1' },
        { npcId: 'guard1', npcType: 'guard', homeRoom: 'room2' },
        { npcId: 'seeker1', npcType: 'seeker', homeRoom: 'room3' },
        { npcId: 'hermit1', npcType: 'hermit', homeRoom: 'room4' }
      ];

      configs.forEach(config => executor.registerNPC(config));
      
      expect(executor.getStats().totalNPCs).toBe(4);
      expect(executor.getStats().activeNPCs).toBe(4);
      
      configs.forEach(config => {
        const retrieved = executor.getNPCConfig(config.npcId);
        expect(retrieved!.npcType).toBe(config.npcType);
      });
    });

    test('should update NPC configuration', () => {
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'home',
        roamRadius: 2
      };

      executor.registerNPC(config);
      
      executor.updateNPCConfig('test-npc', {
        roamRadius: 5,
        preferRooms: ['preferred1', 'preferred2']
      });
      
      const updated = executor.getNPCConfig('test-npc');
      expect(updated!.roamRadius).toBe(5);
      expect(updated!.preferRooms).toEqual(['preferred1', 'preferred2']);
      expect(updated!.npcType).toBe('wanderer'); // Unchanged
    });

    test('should handle NPC activation state', () => {
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'home',
        isActive: true
      };

      executor.registerNPC(config);
      expect(executor.getStats().activeNPCs).toBe(1);
      
      executor.setNPCActive('test-npc', false);
      expect(executor.getStats().activeNPCs).toBe(0);
      
      executor.setNPCActive('test-npc', true);
      expect(executor.getStats().activeNPCs).toBe(1);
    });

    test('should handle default active state', () => {
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'home'
        // isActive not specified, should default to true
      };

      executor.registerNPC(config);
      expect(executor.getStats().activeNPCs).toBe(1);
    });
  });

  describe('Room Registry', () => {
    beforeEach(() => {
      executor.start();
    });

    test('should set room adjacency', () => {
      executor.setRoomAdjacency('room1', ['room2', 'room3']);
      executor.setRoomAdjacency('room2', ['room1', 'room3']);
      executor.setRoomAdjacency('room3', ['room1', 'room2']);
      
      // No direct way to test this, but it should not throw
      expect(() => {
        executor.registerNPC({
          npcId: 'test-npc',
          npcType: 'wanderer',
          homeRoom: 'room1'
        });
      }).not.toThrow();
    });

    test('should set bulk room registry', () => {
      const registry = {
        'room1': ['room2', 'room3'],
        'room2': ['room1', 'room3'],
        'room3': ['room1', 'room2'],
        'room4': ['room5'],
        'room5': ['room4']
      };

      executor.setRoomRegistry(registry);
      
      // Should be able to register NPCs in these rooms
      executor.registerNPC({
        npcId: 'npc1',
        npcType: 'wanderer',
        homeRoom: 'room1'
      });
      
      executor.registerNPC({
        npcId: 'npc2',
        npcType: 'guard',
        homeRoom: 'room4'
      });
      
      expect(executor.getStats().totalNPCs).toBe(2);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      executor.start();
    });

    test('should track basic statistics', () => {
      expect(executor.getStats().totalNPCs).toBe(0);
      expect(executor.getStats().activeNPCs).toBe(0);
      expect(executor.getStats().successfulMoves).toBe(0);
      expect(executor.getStats().failedMoves).toBe(0);
      
      executor.registerNPC({
        npcId: 'npc1',
        npcType: 'wanderer',
        homeRoom: 'room1',
        isActive: true
      });
      
      executor.registerNPC({
        npcId: 'npc2',
        npcType: 'guard',
        homeRoom: 'room2',
        isActive: false
      });
      
      const stats = executor.getStats();
      expect(stats.totalNPCs).toBe(2);
      expect(stats.activeNPCs).toBe(1);
      expect(stats.lastUpdateTime).toBeGreaterThan(0);
    });

    test('should list registered NPCs', () => {
      executor.registerNPC({
        npcId: 'npc1',
        npcType: 'wanderer',
        homeRoom: 'room1'
      });
      
      executor.registerNPC({
        npcId: 'npc2',
        npcType: 'guard',
        homeRoom: 'room2'
      });
      
      const registeredNPCs = executor.getRegisteredNPCs();
      expect(registeredNPCs).toEqual(expect.arrayContaining(['npc1', 'npc2']));
      expect(registeredNPCs).toHaveLength(2);
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      executor.start();
    });

    test('should clear all data', () => {
      executor.setRoomRegistry({
        'room1': ['room2'],
        'room2': ['room1']
      });
      
      executor.registerNPC({
        npcId: 'npc1',
        npcType: 'wanderer',
        homeRoom: 'room1'
      });
      
      expect(executor.getStats().totalNPCs).toBe(1);
      
      executor.clear();
      
      expect(executor.getStats().totalNPCs).toBe(0);
      expect(executor.getRegisteredNPCs()).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      executor.start();
    });

    test('should handle unknown NPC updates', () => {
      expect(() => {
        executor.updateNPCConfig('unknown-npc', { roamRadius: 5 });
      }).not.toThrow();
      
      expect(() => {
        executor.setNPCActive('unknown-npc', false);
      }).not.toThrow();
    });

    test('should handle duplicate NPC registration', () => {
      const config: NPCMovementConfig = {
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'room1'
      };

      executor.registerNPC(config);
      expect(executor.getStats().totalNPCs).toBe(1);
      
      // Register again with different config
      executor.registerNPC({
        ...config,
        npcType: 'guard',
        homeRoom: 'room2'
      });
      
      // Should replace the old one
      expect(executor.getStats().totalNPCs).toBe(1);
      const finalConfig = executor.getNPCConfig('test-npc');
      expect(finalConfig!.npcType).toBe('guard');
      expect(finalConfig!.homeRoom).toBe('room2');
    });
  });

  describe('Global Instance Management', () => {
    test('should provide singleton instance', () => {
      const executor1 = getMovementExecutor();
      const executor2 = getMovementExecutor();
      
      expect(executor1).toBe(executor2);
    });

    test('should reset global instance', () => {
      const executor1 = getMovementExecutor();
      executor1.start();
      executor1.registerNPC({
        npcId: 'test-npc',
        npcType: 'wanderer',
        homeRoom: 'room1'
      });

      resetMovementExecutor();

      const executor2 = getMovementExecutor();
      expect(executor2).not.toBe(executor1);
      expect(executor2.getStats().totalNPCs).toBe(0);
    });
  });

  describe('High-level Setup Functions', () => {
    test('should set up complete movement system', () => {
      const roomRegistry = {
        'room1': ['room2', 'room3'],
        'room2': ['room1', 'room3'],
        'room3': ['room1', 'room2']
      };

      const npcs: NPCMovementConfig[] = [
        {
          npcId: 'wanderer1',
          npcType: 'wanderer',
          homeRoom: 'room1',
          roamRadius: 2
        },
        {
          npcId: 'guard1',
          npcType: 'guard',
          homeRoom: 'room2',
          preferRooms: ['room2', 'room3']
        }
      ];

      const roomCapacities = {
        'room1': 3,
        'room2': 2,
        'room3': 4
      };

      setupNPCMovement({
        roomRegistry,
        npcs,
        roomCapacities
      });

      const executor = getMovementExecutor();
      expect(executor.getStats().totalNPCs).toBe(2);
      expect(executor.getStats().activeNPCs).toBe(2);
      
      expect(executor.getNPCConfig('wanderer1')).toBeTruthy();
      expect(executor.getNPCConfig('guard1')).toBeTruthy();
    });

    test('should shutdown movement system', () => {
      setupNPCMovement({
        roomRegistry: { 'room1': ['room2'] },
        npcs: [{ npcId: 'npc1', npcType: 'wanderer', homeRoom: 'room1' }]
      });

      let executor = getMovementExecutor();
      expect(executor.getStats().totalNPCs).toBe(1);

      shutdownNPCMovement();

      // Should get a fresh instance after shutdown
      executor = getMovementExecutor();
      expect(executor.getStats().totalNPCs).toBe(0);
    });
  });
});
