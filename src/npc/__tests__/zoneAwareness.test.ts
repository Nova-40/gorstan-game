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

// src/npc/__tests__/zoneAwareness.test.ts
// Tests for the zone awareness system

import {
  ZoneAwarenessProvider,
  getZoneAwarenessProvider,
  resetZoneAwarenessProvider,
  setupZoneAwareness,
  shutdownZoneAwareness,
  ZoneInfo,
  RoomZoneMapping,
  ZoneTransitionRule,
  NPCZonePreference,
  ZoneSetupConfig
} from '../zoneAwareness';

describe('ZoneAwarenessProvider', () => {
  let provider: ZoneAwarenessProvider;

  beforeEach(() => {
    resetZoneAwarenessProvider();
    provider = getZoneAwarenessProvider();
  });

  afterEach(() => {
    provider.clear();
  });

  describe('Basic Operations', () => {
    test('should initialize correctly', () => {
      expect(() => provider.initialize()).not.toThrow();
      
      // Multiple initializations should be safe
      expect(() => provider.initialize()).not.toThrow();
    });

    test('should register zones', () => {
      const zone: ZoneInfo = {
        zoneId: 'test-zone',
        zoneName: 'Test Zone',
        biome: 'forest',
        difficulty: 3,
        allowedNPCTypes: ['wanderer', 'guard'],
        restrictedNPCTypes: ['demon'],
        environmentalFactors: {
          temperature: 'temperate',
          terrain: 'wilderness',
          danger: 'moderate',
          accessibility: 'public'
        }
      };

      provider.registerZone(zone);
      const retrieved = provider.getZoneInfo('test-zone');
      expect(retrieved).toEqual(zone);
    });

    test('should map rooms to zones', () => {
      const mapping: RoomZoneMapping = {
        roomId: 'room1',
        zoneId: 'zone1',
        isZoneBoundary: false
      };

      provider.mapRoomToZone(mapping);
      expect(provider.getRoomZone('room1')).toBe('zone1');
    });

    test('should handle unknown rooms and zones', () => {
      expect(provider.getRoomZone('unknown-room')).toBeNull();
      expect(provider.getZoneInfo('unknown-zone')).toBeNull();
    });
  });

  describe('Zone Restrictions', () => {
    beforeEach(() => {
      const forestZone: ZoneInfo = {
        zoneId: 'forest',
        zoneName: 'Enchanted Forest',
        biome: 'forest',
        difficulty: 2,
        allowedNPCTypes: ['wanderer', 'guard', 'seeker'],
        restrictedNPCTypes: ['demon', 'undead'],
        environmentalFactors: {
          temperature: 'temperate',
          terrain: 'wilderness',
          danger: 'safe',
          accessibility: 'public'
        }
      };

      const dungeonZone: ZoneInfo = {
        zoneId: 'dungeon',
        zoneName: 'Dark Dungeon',
        biome: 'underground',
        difficulty: 8,
        allowedNPCTypes: ['guard', 'seeker'],
        restrictedNPCTypes: ['wanderer'],
        environmentalFactors: {
          temperature: 'cold',
          terrain: 'underground',
          danger: 'dangerous',
          accessibility: 'restricted'
        }
      };

      provider.registerZone(forestZone);
      provider.registerZone(dungeonZone);

      provider.mapRoomToZone({ roomId: 'forest1', zoneId: 'forest', isZoneBoundary: false });
      provider.mapRoomToZone({ roomId: 'forest2', zoneId: 'forest', isZoneBoundary: true, connectedZones: ['dungeon'] });
      provider.mapRoomToZone({ roomId: 'dungeon1', zoneId: 'dungeon', isZoneBoundary: true, connectedZones: ['forest'] });
    });

    test('should check NPC type restrictions', () => {
      expect(provider.isNPCTypeAllowedInZone('wanderer', 'forest')).toBe(true);
      expect(provider.isNPCTypeAllowedInZone('demon', 'forest')).toBe(false);
      expect(provider.isNPCTypeAllowedInZone('wanderer', 'dungeon')).toBe(false);
      expect(provider.isNPCTypeAllowedInZone('guard', 'dungeon')).toBe(true);
    });

    test('should allow movement within same zone for allowed NPCs', () => {
      const result = provider.canNPCMoveToRoom('npc1', 'wanderer', 'forest1', 'forest2');
      expect(result.allowed).toBe(true);
    });

    test('should restrict movement within same zone for restricted NPCs', () => {
      const result = provider.canNPCMoveToRoom('npc1', 'demon', 'forest1', 'forest2');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed in zone');
    });

    test('should handle cross-zone movement restrictions', () => {
      // Wanderer trying to enter dungeon should be blocked
      const result = provider.canNPCMoveToRoom('npc1', 'wanderer', 'forest2', 'dungeon1');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed in destination zone');
    });

    test('should allow cross-zone movement for allowed NPCs', () => {
      // Guard can move between forest and dungeon
      const result = provider.canNPCMoveToRoom('npc1', 'guard', 'forest2', 'dungeon1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Zone Transition Rules', () => {
    beforeEach(() => {
      provider.registerZone({
        zoneId: 'town',
        zoneName: 'Town Square',
        biome: 'urban',
        difficulty: 1,
        allowedNPCTypes: ['wanderer', 'guard', 'merchant'],
        restrictedNPCTypes: [],
        environmentalFactors: { accessibility: 'public' }
      });

      provider.registerZone({
        zoneId: 'castle',
        zoneName: 'Royal Castle',
        biome: 'urban',
        difficulty: 5,
        allowedNPCTypes: ['guard', 'noble'],
        restrictedNPCTypes: ['wanderer'],
        environmentalFactors: { accessibility: 'restricted' }
      });

      provider.mapRoomToZone({ roomId: 'town1', zoneId: 'town', isZoneBoundary: true, connectedZones: ['castle'] });
      provider.mapRoomToZone({ roomId: 'castle1', zoneId: 'castle', isZoneBoundary: true, connectedZones: ['town'] });

      const transitionRule: ZoneTransitionRule = {
        fromZone: 'town',
        toZone: 'castle',
        allowedNPCTypes: ['guard'],
        transitionType: 'guarded',
        requirements: {
          minimumLevel: 3
        }
      };

      provider.addTransitionRule(transitionRule);
    });

    test('should enforce transition rules', () => {
      // Guard should be allowed due to transition rule
      const guardResult = provider.canNPCMoveToRoom('guard1', 'guard', 'town1', 'castle1');
      expect(guardResult.allowed).toBe(true);

      // Wanderer should be blocked by transition rule
      const wandererResult = provider.canNPCMoveToRoom('wanderer1', 'wanderer', 'town1', 'castle1');
      expect(wandererResult.allowed).toBe(false);
      expect(wandererResult.reason).toContain('No transition rule');
    });

    test('should provide alternatives when movement is blocked', () => {
      const result = provider.canNPCMoveToRoom('wanderer1', 'wanderer', 'town1', 'castle1');
      expect(result.allowed).toBe(false);
      expect(result.alternative).toBeDefined();
      expect(Array.isArray(result.alternative)).toBe(true);
    });
  });

  describe('NPC Zone Preferences', () => {
    beforeEach(() => {
      provider.registerZone({
        zoneId: 'home',
        zoneName: 'Home Zone',
        biome: 'urban',
        difficulty: 1,
        allowedNPCTypes: ['wanderer'],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.registerZone({
        zoneId: 'danger',
        zoneName: 'Danger Zone',
        biome: 'wilderness',
        difficulty: 9,
        allowedNPCTypes: ['wanderer'],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.mapRoomToZone({ roomId: 'home1', zoneId: 'home', isZoneBoundary: false });
      provider.mapRoomToZone({ roomId: 'home2', zoneId: 'home', isZoneBoundary: false });
      provider.mapRoomToZone({ roomId: 'danger1', zoneId: 'danger', isZoneBoundary: false });

      const preference: NPCZonePreference = {
        npcId: 'cautious-npc',
        npcType: 'wanderer',
        preferredZones: ['home'],
        avoidedZones: [],
        cannotEnterZones: ['danger'],
        homeZone: 'home',
        roamingBehavior: 'stay-home'
      };

      provider.setNPCZonePreference(preference);
    });

    test('should respect NPC zone preferences', () => {
      // NPC should be blocked from entering forbidden zone
      const result = provider.canNPCMoveToRoom('cautious-npc', 'wanderer', 'home1', 'danger1');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('cannot enter');
    });

    test('should provide preferred rooms for NPCs', () => {
      const availableRooms = ['home1', 'home2', 'danger1'];
      const preferredRooms = provider.getPreferredRoomsForNPC('cautious-npc', availableRooms);
      
      expect(preferredRooms).toContain('home1');
      expect(preferredRooms).toContain('home2');
      expect(preferredRooms).not.toContain('danger1'); // Should be excluded due to cannot enter
    });

    test('should handle NPCs without preferences', () => {
      const availableRooms = ['home1', 'danger1'];
      const preferredRooms = provider.getPreferredRoomsForNPC('unknown-npc', availableRooms);
      
      expect(preferredRooms).toEqual(availableRooms); // Should return all rooms unchanged
    });
  });

  describe('Zone Connectivity', () => {
    beforeEach(() => {
      provider.mapRoomToZone({ 
        roomId: 'hub1', 
        zoneId: 'hub', 
        isZoneBoundary: true, 
        connectedZones: ['north', 'south', 'east'] 
      });
      provider.mapRoomToZone({ 
        roomId: 'hub2', 
        zoneId: 'hub', 
        isZoneBoundary: false 
      });
    });

    test('should get connected zones', () => {
      const connectedZones = provider.getConnectedZones('hub');
      expect(connectedZones).toContain('north');
      expect(connectedZones).toContain('south');
      expect(connectedZones).toContain('east');
      expect(connectedZones).toHaveLength(3);
    });

    test('should handle zones with no connections', () => {
      const connectedZones = provider.getConnectedZones('isolated');
      expect(connectedZones).toEqual([]);
    });
  });

  describe('Configuration Options', () => {
    test('should respect disabled zone restrictions', () => {
      const disabledProvider = new ZoneAwarenessProvider({
        enableZoneRestrictions: false
      });

      // Should allow movement even without zone setup
      const result = disabledProvider.canNPCMoveToRoom('npc1', 'demon', 'room1', 'room2');
      expect(result.allowed).toBe(true);
    });

    test('should respect disabled cross-zone movement', () => {
      const restrictedProvider = new ZoneAwarenessProvider({
        allowCrossZoneMovement: false
      });

      restrictedProvider.mapRoomToZone({ roomId: 'room1', zoneId: 'zone1', isZoneBoundary: false });
      restrictedProvider.mapRoomToZone({ roomId: 'room2', zoneId: 'zone2', isZoneBoundary: false });

      const result = restrictedProvider.canNPCMoveToRoom('npc1', 'wanderer', 'room1', 'room2');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Cross-zone movement disabled');
    });

    test('should respect disabled biome affinity', () => {
      const noAffinityProvider = new ZoneAwarenessProvider({
        enableBiomeAffinity: false
      });

      noAffinityProvider.setNPCZonePreference({
        npcId: 'npc1',
        npcType: 'wanderer',
        preferredZones: ['preferred'],
        avoidedZones: [],
        cannotEnterZones: [],
        homeZone: 'home',
        roamingBehavior: 'explore-preferred'
      });

      const availableRooms = ['room1', 'room2'];
      const preferredRooms = noAffinityProvider.getPreferredRoomsForNPC('npc1', availableRooms);
      
      expect(preferredRooms).toEqual(availableRooms); // Should ignore preferences
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should track zone statistics', () => {
      provider.registerZone({
        zoneId: 'forest1',
        zoneName: 'Forest 1',
        biome: 'forest',
        difficulty: 1,
        allowedNPCTypes: [],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.registerZone({
        zoneId: 'forest2',
        zoneName: 'Forest 2',
        biome: 'forest',
        difficulty: 2,
        allowedNPCTypes: [],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.registerZone({
        zoneId: 'dungeon1',
        zoneName: 'Dungeon 1',
        biome: 'underground',
        difficulty: 5,
        allowedNPCTypes: [],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.mapRoomToZone({ roomId: 'room1', zoneId: 'forest1', isZoneBoundary: true });
      provider.mapRoomToZone({ roomId: 'room2', zoneId: 'forest2', isZoneBoundary: false });

      const stats = provider.getZoneStats();
      expect(stats.totalZones).toBe(3);
      expect(stats.mappedRooms).toBe(2);
      expect(stats.boundaryRooms).toBe(1);
      expect(stats.zonesByBiome.forest).toBe(2);
      expect(stats.zonesByBiome.underground).toBe(1);
    });
  });

  describe('Data Management', () => {
    test('should clear all data', () => {
      provider.registerZone({
        zoneId: 'test',
        zoneName: 'Test',
        biome: 'test',
        difficulty: 1,
        allowedNPCTypes: [],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      provider.mapRoomToZone({ roomId: 'room1', zoneId: 'test', isZoneBoundary: false });

      expect(provider.getZoneStats().totalZones).toBe(1);
      expect(provider.getZoneStats().mappedRooms).toBe(1);

      provider.clear();

      expect(provider.getZoneStats().totalZones).toBe(0);
      expect(provider.getZoneStats().mappedRooms).toBe(0);
    });
  });

  describe('Global Instance Management', () => {
    test('should provide singleton instance', () => {
      const provider1 = getZoneAwarenessProvider();
      const provider2 = getZoneAwarenessProvider();
      
      expect(provider1).toBe(provider2);
    });

    test('should reset global instance', () => {
      const provider1 = getZoneAwarenessProvider();
      provider1.registerZone({
        zoneId: 'test',
        zoneName: 'Test',
        biome: 'test',
        difficulty: 1,
        allowedNPCTypes: [],
        restrictedNPCTypes: [],
        environmentalFactors: {}
      });

      resetZoneAwarenessProvider();

      const provider2 = getZoneAwarenessProvider();
      expect(provider2).not.toBe(provider1);
      expect(provider2.getZoneStats().totalZones).toBe(0);
    });
  });

  describe('High-level Setup Functions', () => {
    test('should set up complete zone system', () => {
      const setupConfig: ZoneSetupConfig = {
        zones: [
          {
            zoneId: 'town',
            zoneName: 'Town',
            biome: 'urban',
            difficulty: 1,
            allowedNPCTypes: ['wanderer', 'merchant'],
            restrictedNPCTypes: [],
            environmentalFactors: { accessibility: 'public' }
          },
          {
            zoneId: 'wilderness',
            zoneName: 'Wilderness',
            biome: 'forest',
            difficulty: 3,
            allowedNPCTypes: ['wanderer', 'seeker'],
            restrictedNPCTypes: ['merchant'],
            environmentalFactors: { danger: 'moderate' }
          }
        ],
        roomMappings: [
          { roomId: 'town1', zoneId: 'town', isZoneBoundary: false },
          { roomId: 'town2', zoneId: 'town', isZoneBoundary: true, connectedZones: ['wilderness'] },
          { roomId: 'wild1', zoneId: 'wilderness', isZoneBoundary: true, connectedZones: ['town'] }
        ],
        transitionRules: [
          {
            fromZone: 'town',
            toZone: 'wilderness',
            allowedNPCTypes: ['wanderer', 'seeker'],
            transitionType: 'open'
          }
        ],
        npcPreferences: [
          {
            npcId: 'merchant1',
            npcType: 'merchant',
            preferredZones: ['town'],
            avoidedZones: ['wilderness'],
            cannotEnterZones: [],
            homeZone: 'town',
            roamingBehavior: 'stay-home'
          }
        ],
        config: {
          enableZoneRestrictions: true,
          enableBiomeAffinity: true
        }
      };

      setupZoneAwareness(setupConfig);

      const provider = getZoneAwarenessProvider();
      expect(provider.getZoneStats().totalZones).toBe(2);
      expect(provider.getZoneStats().mappedRooms).toBe(3);
      expect(provider.getZoneStats().transitionRules).toBe(1);
      expect(provider.getZoneStats().npcPreferences).toBe(1);
    });

    test('should shutdown zone system', () => {
      setupZoneAwareness({
        zones: [{ zoneId: 'test', zoneName: 'Test', biome: 'test', difficulty: 1, allowedNPCTypes: [], restrictedNPCTypes: [], environmentalFactors: {} }],
        roomMappings: [{ roomId: 'room1', zoneId: 'test', isZoneBoundary: false }]
      });

      let provider = getZoneAwarenessProvider();
      expect(provider.getZoneStats().totalZones).toBe(1);

      shutdownZoneAwareness();

      // Should get a fresh instance after shutdown
      provider = getZoneAwarenessProvider();
      expect(provider.getZoneStats().totalZones).toBe(0);
    });
  });
});
