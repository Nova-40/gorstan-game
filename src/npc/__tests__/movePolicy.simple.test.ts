// src/npc/__tests__/movePolicy.simple.test.ts
// Simplified unit tests for NPC movement policy

import { decideMove, createDefaultPolicy, NPCMoveContext, MovePolicyConfig } from '../movePolicy';

describe('MovePolicy - Core Functionality', () => {
  const basicContext: NPCMoveContext = {
    currentRoom: 'room1',
    npcId: 'test-npc',
    allowedAdjacency: ['room2', 'room3'],
    avoidRooms: [],
    preferRooms: [],
    playerRoomId: 'playerRoom'
  };

  test('should make valid adjacent moves', () => {
    const policy: MovePolicyConfig = {
      mode: 'random-adjacent',
      respectCapacity: false,
      allowTeleportFallback: false
    };

    const decision = decideMove(basicContext, policy);

    expect(decision.isLegal).toBe(true);
    expect(decision.requiresTeleport).toBe(false);
    expect(['room2', 'room3']).toContain(decision.targetRoom);
    expect(decision.confidence).toBeGreaterThan(0);
  });

  test('should respect avoid rooms', () => {
    const context: NPCMoveContext = {
      ...basicContext,
      avoidRooms: ['room2']
    };

    const policy: MovePolicyConfig = {
      mode: 'random-adjacent',
      respectCapacity: false,
      allowTeleportFallback: false
    };

    const decision = decideMove(context, policy);

    expect(decision.targetRoom).toBe('room3');
    expect(decision.isLegal).toBe(true);
  });

  test('should prefer preferred rooms', () => {
    const context: NPCMoveContext = {
      ...basicContext,
      preferRooms: ['room3']
    };

    const policy: MovePolicyConfig = {
      mode: 'random-adjacent',
      respectCapacity: false,
      allowTeleportFallback: false
    };

    const decision = decideMove(context, policy);

    expect(decision.targetRoom).toBe('room3');
    expect(decision.reason).toContain('preferred');
  });

  test('should handle no valid moves', () => {
    const context: NPCMoveContext = {
      ...basicContext,
      allowedAdjacency: [],
      avoidRooms: ['room2', 'room3']
    };

    const policy: MovePolicyConfig = {
      mode: 'random-adjacent',
      respectCapacity: false,
      allowTeleportFallback: false
    };

    const decision = decideMove(context, policy);

    expect(decision.targetRoom).toBeNull();
    expect(decision.isLegal).toBe(false);
    expect(decision.reason).toContain('No valid adjacent moves');
  });

  test('should follow patrol route', () => {
    const context: NPCMoveContext = {
      ...basicContext,
      currentRoom: 'patrol1',
      allowedAdjacency: ['patrol2', 'patrol3', 'other']
    };

    const policy: MovePolicyConfig = {
      mode: 'patrol',
      patrolRoute: ['patrol1', 'patrol2', 'patrol3'],
      respectCapacity: false,
      allowTeleportFallback: false
    };

    const decision = decideMove(context, policy);

    expect(decision.targetRoom).toBe('patrol2');
    expect(decision.reason).toContain('Patrol to point 2/3');
    expect(decision.confidence).toBeGreaterThan(0.8);
  });

  test('should create appropriate default policies', () => {
    const wandererPolicy = createDefaultPolicy('wanderer');
    expect(wandererPolicy.mode).toBe('random-adjacent');
    expect(wandererPolicy.respectCapacity).toBe(true);

    const guardPolicy = createDefaultPolicy('guard');
    expect(guardPolicy.mode).toBe('patrol');
    expect(guardPolicy.respectCapacity).toBe(true);

    const seekerPolicy = createDefaultPolicy('seeker');
    expect(seekerPolicy.mode).toBe('player-seek');
    expect(seekerPolicy.seekChance).toBe(0.2);

    const hermitPolicy = createDefaultPolicy('hermit');
    expect(hermitPolicy.mode).toBe('home-bias');
    expect(hermitPolicy.homeReturnChance).toBe(0.7);
  });
});
