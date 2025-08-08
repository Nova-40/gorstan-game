// src/npc/__tests__/npcPresence.test.ts
// Tests for real-time NPC presence tracking system

import { 
  NPCPresenceProvider, 
  getNPCPresenceProvider, 
  resetNPCPresenceProvider,
  NPCPresenceUpdate,
  NPCPresenceListener
} from '../npcPresence';

describe('NPCPresenceProvider', () => {
  let provider: NPCPresenceProvider;
  let mockListener: jest.Mock<void, [NPCPresenceUpdate]>;

  beforeEach(() => {
    resetNPCPresenceProvider();
    provider = getNPCPresenceProvider();
    mockListener = jest.fn();
  });

  afterEach(() => {
    provider.stop();
    provider.clear();
  });

  describe('Basic Operations', () => {
    test('should start and stop tracking', () => {
      expect(provider.getStats().isActive).toBe(false);
      
      provider.start();
      expect(provider.getStats().isActive).toBe(true);
      
      provider.stop();
      expect(provider.getStats().isActive).toBe(false);
    });

    test('should register and unregister NPCs', () => {
      provider.start();
      
      provider.registerNPC('npc1', 'room1');
      expect(provider.getStats().totalNPCs).toBe(1);
      
      const state = provider.getNPCState('npc1');
      expect(state).toBeTruthy();
      expect(state!.npcId).toBe('npc1');
      expect(state!.currentRoom).toBe('room1');
      expect(state!.isMoving).toBe(false);
      
      provider.unregisterNPC('npc1');
      expect(provider.getStats().totalNPCs).toBe(0);
      expect(provider.getNPCState('npc1')).toBeNull();
    });

    test('should not register NPCs when inactive', () => {
      provider.registerNPC('npc1', 'room1');
      expect(provider.getStats().totalNPCs).toBe(0);
    });
  });

  describe('Room Occupancy', () => {
    beforeEach(() => {
      provider.start();
    });

    test('should track room occupancy', () => {
      provider.registerNPC('npc1', 'room1');
      provider.registerNPC('npc2', 'room1');
      provider.registerNPC('npc3', 'room2');

      const room1Occupancy = provider.getRoomOccupancy('room1');
      expect(room1Occupancy.npcIds).toEqual(expect.arrayContaining(['npc1', 'npc2']));
      expect(room1Occupancy.npcIds).toHaveLength(2);

      const room2Occupancy = provider.getRoomOccupancy('room2');
      expect(room2Occupancy.npcIds).toEqual(['npc3']);

      const emptyRoomOccupancy = provider.getRoomOccupancy('empty-room');
      expect(emptyRoomOccupancy.npcIds).toEqual([]);
    });

    test('should get NPCs in room', () => {
      provider.registerNPC('npc1', 'room1');
      provider.registerNPC('npc2', 'room1');

      const npcsInRoom = provider.getNPCsInRoom('room1');
      expect(npcsInRoom).toEqual(expect.arrayContaining(['npc1', 'npc2']));
      expect(npcsInRoom).toHaveLength(2);

      const npcsInEmptyRoom = provider.getNPCsInRoom('empty-room');
      expect(npcsInEmptyRoom).toEqual([]);
    });

    test('should handle room capacity', () => {
      provider.setRoomCapacity('small-room', 2);
      
      provider.registerNPC('npc1', 'small-room');
      expect(provider.isRoomFull('small-room')).toBe(false);
      
      provider.registerNPC('npc2', 'small-room');
      expect(provider.isRoomFull('small-room')).toBe(true);

      const occupancy = provider.getRoomOccupancy('small-room');
      expect(occupancy.capacity).toBe(2);
      expect(occupancy.isFull).toBe(true);
    });

    test('should get all room occupancy', () => {
      provider.setRoomCapacity('room1', 3);
      provider.registerNPC('npc1', 'room1');
      provider.registerNPC('npc2', 'room2');

      const allOccupancy = provider.getAllRoomOccupancy();
      expect(allOccupancy.size).toBe(2);
      expect(allOccupancy.get('room1')!.npcIds).toEqual(['npc1']);
      expect(allOccupancy.get('room1')!.capacity).toBe(3);
      expect(allOccupancy.get('room2')!.npcIds).toEqual(['npc2']);
    });
  });

  describe('Movement Tracking', () => {
    beforeEach(() => {
      provider.start();
      provider.addListener(mockListener);
    });

    test('should start and complete moves', () => {
      provider.registerNPC('npc1', 'room1');
      
      const startSuccess = provider.startMove('npc1', 'room1', 'room2');
      expect(startSuccess).toBe(true);

      const state = provider.getNPCState('npc1');
      expect(state!.isMoving).toBe(true);
      expect(state!.targetRoom).toBe('room2');
      expect(state!.moveStartTime).toBeTruthy();

      // Should have emitted moving event
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc_moving',
        npcId: 'npc1',
        roomId: 'room2',
        previousRoom: 'room1'
      }));

      mockListener.mockClear();

      const completeSuccess = provider.completeMove('npc1');
      expect(completeSuccess).toBe(true);

      const finalState = provider.getNPCState('npc1');
      expect(finalState!.currentRoom).toBe('room2');
      expect(finalState!.isMoving).toBe(false);
      expect(finalState!.targetRoom).toBeUndefined();

      // Should have emitted entered and left events
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc_entered',
        npcId: 'npc1',
        roomId: 'room2',
        previousRoom: 'room1'
      }));

      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc_left',
        npcId: 'npc1',
        roomId: 'room1'
      }));

      // Check occupancy updated
      expect(provider.getNPCsInRoom('room1')).toEqual([]);
      expect(provider.getNPCsInRoom('room2')).toEqual(['npc1']);
    });

    test('should prevent moves to full rooms', () => {
      provider.setRoomCapacity('small-room', 1);
      provider.registerNPC('npc1', 'small-room');
      provider.registerNPC('npc2', 'room1');

      const startSuccess = provider.startMove('npc2', 'room1', 'small-room');
      expect(startSuccess).toBe(false);

      const state = provider.getNPCState('npc2');
      expect(state!.isMoving).toBe(false);
      expect(state!.currentRoom).toBe('room1');
    });

    test('should prevent duplicate moves', () => {
      provider.registerNPC('npc1', 'room1');
      
      provider.startMove('npc1', 'room1', 'room2');
      const secondMoveSuccess = provider.startMove('npc1', 'room1', 'room3');
      
      expect(secondMoveSuccess).toBe(false);
      
      const state = provider.getNPCState('npc1');
      expect(state!.targetRoom).toBe('room2'); // Still moving to original target
    });

    test('should cancel moves', () => {
      provider.registerNPC('npc1', 'room1');
      provider.startMove('npc1', 'room1', 'room2');

      mockListener.mockClear();

      const cancelSuccess = provider.cancelMove('npc1');
      expect(cancelSuccess).toBe(true);

      const state = provider.getNPCState('npc1');
      expect(state!.isMoving).toBe(false);
      expect(state!.targetRoom).toBeUndefined();
      expect(state!.currentRoom).toBe('room1'); // Still in original room

      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        type: 'npc_stopped',
        npcId: 'npc1',
        roomId: 'room1'
      }));
    });

    test('should handle unknown NPC moves', () => {
      const startSuccess = provider.startMove('unknown-npc', 'room1', 'room2');
      expect(startSuccess).toBe(false);

      const completeSuccess = provider.completeMove('unknown-npc');
      expect(completeSuccess).toBe(false);

      const cancelSuccess = provider.cancelMove('unknown-npc');
      expect(cancelSuccess).toBe(false);
    });

    test('should fail moves when inactive', () => {
      provider.registerNPC('npc1', 'room1');
      provider.stop();

      const startSuccess = provider.startMove('npc1', 'room1', 'room2');
      expect(startSuccess).toBe(false);

      const completeSuccess = provider.completeMove('npc1');
      expect(completeSuccess).toBe(false);
    });
  });

  describe('Listeners', () => {
    beforeEach(() => {
      provider.start();
    });

    test('should add and remove listeners', () => {
      expect(provider.getStats().listeners).toBe(0);

      provider.addListener(mockListener);
      expect(provider.getStats().listeners).toBe(1);

      const listener2 = jest.fn();
      provider.addListener(listener2);
      expect(provider.getStats().listeners).toBe(2);

      provider.removeListener(mockListener);
      expect(provider.getStats().listeners).toBe(1);

      provider.removeListener(listener2);
      expect(provider.getStats().listeners).toBe(0);
    });

    test('should handle listener errors gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      provider.addListener(errorListener);
      provider.addListener(mockListener);

      // Trigger an event that will call the listeners
      provider.registerNPC('npc1', 'room1');
      provider.startMove('npc1', 'room1', 'room2');

      // Second listener should still be called despite the error in the first listener
      expect(mockListener).toHaveBeenCalled();
    });
  });

  describe('Statistics and State', () => {
    beforeEach(() => {
      provider.start();
    });

    test('should track statistics correctly', () => {
      provider.registerNPC('npc1', 'room1');
      provider.registerNPC('npc2', 'room2');
      provider.startMove('npc1', 'room1', 'room3');

      const stats = provider.getStats();
      expect(stats.isActive).toBe(true);
      expect(stats.totalNPCs).toBe(2);
      expect(stats.movingNPCs).toBe(1);
      expect(stats.totalRooms).toBe(2); // room1 and room2 have NPCs
      expect(stats.listeners).toBe(0);

      provider.addListener(mockListener);
      expect(provider.getStats().listeners).toBe(1);
    });

    test('should get all NPC states', () => {
      provider.registerNPC('npc1', 'room1');
      provider.registerNPC('npc2', 'room2');
      provider.startMove('npc1', 'room1', 'room3');

      const allStates = provider.getAllNPCStates();
      expect(allStates.size).toBe(2);
      expect(allStates.get('npc1')!.isMoving).toBe(true);
      expect(allStates.get('npc2')!.isMoving).toBe(false);
    });

    test('should clear all data', () => {
      provider.registerNPC('npc1', 'room1');
      provider.setRoomCapacity('room1', 5);
      provider.addListener(mockListener);

      provider.clear();

      expect(provider.getStats().totalNPCs).toBe(0);
      expect(provider.getAllRoomOccupancy().size).toBe(0);
      expect(provider.getNPCState('npc1')).toBeNull();
      // Note: listeners are not cleared by clear()
      expect(provider.getStats().listeners).toBe(1);
    });
  });

  describe('Global Instance', () => {
    test('should provide singleton instance', () => {
      const provider1 = getNPCPresenceProvider();
      const provider2 = getNPCPresenceProvider();
      
      expect(provider1).toBe(provider2);
    });

    test('should reset global instance', () => {
      const provider1 = getNPCPresenceProvider();
      provider1.start();
      provider1.registerNPC('npc1', 'room1');

      resetNPCPresenceProvider();

      const provider2 = getNPCPresenceProvider();
      expect(provider2).not.toBe(provider1);
      expect(provider2.getStats().totalNPCs).toBe(0);
      expect(provider2.getStats().isActive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      provider.start();
    });

    test('should handle completing move for non-moving NPC', () => {
      provider.registerNPC('npc1', 'room1');
      
      const completeSuccess = provider.completeMove('npc1');
      expect(completeSuccess).toBe(false);
    });

    test('should handle cancelling move for non-moving NPC', () => {
      provider.registerNPC('npc1', 'room1');
      
      const cancelSuccess = provider.cancelMove('npc1');
      expect(cancelSuccess).toBe(false);
    });

    test('should handle room capacity of 0', () => {
      provider.setRoomCapacity('no-capacity-room', 0);
      
      expect(provider.isRoomFull('no-capacity-room')).toBe(false);
      
      provider.registerNPC('npc1', 'other-room');
      const startSuccess = provider.startMove('npc1', 'other-room', 'no-capacity-room');
      expect(startSuccess).toBe(true); // 0 capacity means unlimited
    });

    test('should handle duplicate NPC registration', () => {
      provider.registerNPC('npc1', 'room1');
      
      // Registering again should replace the old registration
      provider.registerNPC('npc1', 'room2');
      
      const state = provider.getNPCState('npc1');
      expect(state!.currentRoom).toBe('room2');
      
      // Should only be in room2, not room1
      expect(provider.getNPCsInRoom('room1')).toEqual([]);
      expect(provider.getNPCsInRoom('room2')).toEqual(['npc1']);
    });
  });
});
