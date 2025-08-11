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

// src/npc/__tests__/allianceMemory.test.ts
// Unit tests for alliance memory system

import {
  AllianceMemorySystem,
  AllianceEvent,
  AllianceContext,
  MemoryTrigger,
  getAllianceMemory,
  recordCooperation,
  recordBetrayal,
  recordRescue
} from '../allianceMemory';

describe('AllianceMemorySystem', () => {
  let memorySystem: AllianceMemorySystem;

  beforeEach(() => {
    memorySystem = new AllianceMemorySystem();
  });

  describe('Event Recording', () => {
    test('should record basic alliance events', () => {
      const context: AllianceContext = {
        location: 'control-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: ['examine terminal']
      };

      const event = memorySystem.recordEvent(
        'cooperation',
        'morthos',
        'al',
        context,
        0.8,
        'Morthos and Al worked together to decode the terminal',
        ['gained access to restricted data']
      );

      expect(event.type).toBe('cooperation');
      expect(event.npcA).toBe('morthos');
      expect(event.npcB).toBe('al');
      expect(event.intensity).toBe(0.8);
      expect(event.description).toBe('Morthos and Al worked together to decode the terminal');
      expect(event.consequences).toContain('gained access to restricted data');
    });

    test('should clamp intensity values', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Test above 1
      const highEvent = memorySystem.recordEvent('cooperation', 'npc1', 'npc2', context, 1.5, 'test');
      expect(highEvent.intensity).toBe(1);

      // Test below 0
      const lowEvent = memorySystem.recordEvent('cooperation', 'npc1', 'npc2', context, -0.5, 'test');
      expect(lowEvent.intensity).toBe(0);
    });
  });

  describe('Relationship Management', () => {
    test('should create and update relationships', () => {
      const context: AllianceContext = {
        location: 'control-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record cooperation
      memorySystem.recordEvent('cooperation', 'morthos', 'al', context, 0.7, 'Worked together');
      
      const relationship = memorySystem.getRelationship('morthos', 'al');
      
      expect(relationship).not.toBeNull();
      expect(relationship!.cooperationCount).toBe(1);
      expect(relationship!.betrayalCount).toBe(0);
      expect(relationship!.overallTrustLevel).toBeGreaterThan(0);
      expect(relationship!.recentInteractionType).toBe('cooperation');
      expect(relationship!.relationshipTrajectory).toBe('stable');
    });

    test('should track cooperation and betrayal counts', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record multiple events
      memorySystem.recordEvent('cooperation', 'morthos', 'al', context, 0.6, 'First cooperation');
      memorySystem.recordEvent('cooperation', 'morthos', 'al', context, 0.7, 'Second cooperation');
      memorySystem.recordEvent('betrayal', 'morthos', 'al', context, 0.8, 'Betrayal event');

      const relationship = memorySystem.getRelationship('morthos', 'al');
      
      expect(relationship!.cooperationCount).toBe(2);
      expect(relationship!.betrayalCount).toBe(1);
    });

    test('should calculate relationship trajectory', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record improving relationship
      memorySystem.recordEvent('cooperation', 'npc1', 'npc2', context, 0.6, 'First cooperation');
      memorySystem.recordEvent('mutual-support', 'npc1', 'npc2', context, 0.7, 'Mutual support');
      memorySystem.recordEvent('rescue', 'npc1', 'npc2', context, 0.8, 'Rescue');

      const relationship = memorySystem.getRelationship('npc1', 'npc2');
      expect(relationship!.relationshipTrajectory).toBe('improving');
    });

    test('should maintain significant events', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record high-intensity (significant) event
      memorySystem.recordEvent('sacrifice', 'morthos', 'al', context, 0.9, 'Morthos sacrificed himself for Al');
      
      const relationship = memorySystem.getRelationship('morthos', 'al');
      expect(relationship!.significantEvents.length).toBe(1);
      expect(relationship!.significantEvents[0].type).toBe('sacrifice');
    });
  });

  describe('Trust Level Calculation', () => {
    test('should increase trust for positive events', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      memorySystem.recordEvent('cooperation', 'npc1', 'npc2', context, 0.8, 'Cooperation');
      
      const relationship = memorySystem.getRelationship('npc1', 'npc2');
      expect(relationship!.overallTrustLevel).toBeGreaterThan(0);
    });

    test('should decrease trust for negative events', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      memorySystem.recordEvent('betrayal', 'npc1', 'npc2', context, 0.8, 'Betrayal');
      
      const relationship = memorySystem.getRelationship('npc1', 'npc2');
      expect(relationship!.overallTrustLevel).toBeLessThan(0);
    });

    test('should handle reconciliation after conflict', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Conflict then reconciliation
      memorySystem.recordEvent('conflict', 'npc1', 'npc2', context, 0.6, 'Had an argument');
      const conflictTrust = memorySystem.getRelationship('npc1', 'npc2')!.overallTrustLevel;
      
      memorySystem.recordEvent('reconciliation', 'npc1', 'npc2', context, 0.8, 'Made up');
      const finalTrust = memorySystem.getRelationship('npc1', 'npc2')!.overallTrustLevel;
      
      expect(finalTrust).toBeGreaterThan(conflictTrust);
    });
  });

  describe('Memory Recall', () => {
    beforeEach(() => {
      // Set up some test events
      const context: AllianceContext = {
        location: 'control-room',
        gamePhase: 'exploration',
        otherNPCsPresent: ['al'],
        playerActions: ['examine terminal'],
        emotionalState: 'positive'
      };

      memorySystem.recordEvent('cooperation', 'morthos', 'player', context, 0.8, 'Worked together in control room');
      memorySystem.recordEvent('betrayal', 'morthos', 'player', { ...context, location: 'lab' }, 0.9, 'Player betrayed Morthos in lab');
    });

    test('should recall memories based on location trigger', () => {
      const triggers: MemoryTrigger[] = [
        { condition: 'location', value: 'control-room' }
      ];

      const memories = memorySystem.recallMemories('morthos', { location: 'control-room' }, triggers);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].sourceEvent.context.location).toBe('control-room');
      expect(memories[0].triggerReason).toContain('location: control-room');
    });

    test('should recall memories based on NPC presence trigger', () => {
      const triggers: MemoryTrigger[] = [
        { condition: 'npc-present', value: 'al' }
      ];

      const memories = memorySystem.recallMemories('morthos', {}, triggers);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].sourceEvent.context.otherNPCsPresent).toContain('al');
    });

    test('should calculate relevance scores correctly', () => {
      const triggers: MemoryTrigger[] = [
        { condition: 'location', value: 'control-room', threshold: 0.5 }
      ];

      const memories = memorySystem.recallMemories('morthos', { location: 'control-room' }, triggers);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].relevanceScore).toBeGreaterThan(0.5);
    });

    test('should generate appropriate dialogue suggestions', () => {
      const triggers: MemoryTrigger[] = [
        { condition: 'location', value: 'control-room' }
      ];

      const memories = memorySystem.recallMemories('morthos', { location: 'control-room' }, triggers);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].suggestedDialogue).toBeDefined();
      expect(memories[0].suggestedDialogue!.length).toBeGreaterThan(0);
    });

    test('should suggest behavior changes', () => {
      const triggers: MemoryTrigger[] = [
        { condition: 'location', value: 'lab' }
      ];

      const memories = memorySystem.recallMemories('morthos', { location: 'lab' }, triggers);
      
      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].suggestedBehaviorChange).toBeDefined();
      expect(memories[0].emotionalImpact).toBe('negative'); // Because of betrayal
    });
  });

  describe('Run Management', () => {
    test('should start new runs', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record event in first run (below significance threshold)
      memorySystem.recordEvent('cooperation', 'npc1', 'npc2', context, 0.5, 'First run cooperation');
      
      const firstRunId = memorySystem['currentRunId'];
      
      // Start new run
      memorySystem.startNewRun();
      
      const secondRunId = memorySystem['currentRunId'];
      expect(secondRunId).not.toBe(firstRunId);
      
      // Relationship should still exist but current run events should be cleared
      const relationship = memorySystem.getRelationship('npc1', 'npc2');
      expect(relationship!.currentRunEvents.length).toBe(0);
      expect(relationship!.significantEvents.length).toBe(0); // Wasn't significant enough (0.5 < 0.6 threshold)
    });
  });

  describe('Data Persistence', () => {
    test('should export and import memory data', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Record some events
      memorySystem.recordEvent('cooperation', 'morthos', 'al', context, 0.8, 'Test cooperation');
      memorySystem.recordEvent('betrayal', 'al', 'morthos', context, 0.7, 'Test betrayal');
      
      // Export data
      const exportedData = memorySystem.exportMemoryData();
      
      // Create new system and import
      const newMemorySystem = new AllianceMemorySystem();
      newMemorySystem.importMemoryData(exportedData);
      
      // Verify data was imported correctly
      const relationship = newMemorySystem.getRelationship('morthos', 'al');
      expect(relationship).not.toBeNull();
      expect(relationship!.cooperationCount).toBe(1);
      expect(relationship!.betrayalCount).toBe(1);
    });
  });

  describe('Helper Functions', () => {
    test('should record cooperation using helper function', () => {
      const event = recordCooperation('morthos', 'al', 'control-room', 'They worked together');
      
      expect(event.type).toBe('cooperation');
      expect(event.npcA).toBe('morthos');
      expect(event.npcB).toBe('al');
      expect(event.context.location).toBe('control-room');
    });

    test('should record betrayal using helper function', () => {
      const event = recordBetrayal('al', 'morthos', 'lab', 'Al betrayed Morthos');
      
      expect(event.type).toBe('betrayal');
      expect(event.npcA).toBe('al');
      expect(event.npcB).toBe('morthos');
      expect(event.intensity).toBe(0.9); // Betrayals are high intensity
    });

    test('should record rescue using helper function', () => {
      const event = recordRescue('morthos', 'al', 'danger-zone', 'Morthos rescued Al');
      
      expect(event.type).toBe('rescue');
      expect(event.npcA).toBe('morthos');
      expect(event.npcB).toBe('al');
      expect(event.intensity).toBe(0.8); // Rescues are high intensity
    });
  });

  describe('Relationship Queries', () => {
    test('should get all relationships for an NPC', () => {
      const context: AllianceContext = {
        location: 'test-room',
        gamePhase: 'exploration',
        otherNPCsPresent: [],
        playerActions: []
      };

      // Create relationships with multiple NPCs
      memorySystem.recordEvent('cooperation', 'morthos', 'al', context, 0.7, 'Test 1');
      memorySystem.recordEvent('cooperation', 'morthos', 'player', context, 0.6, 'Test 2');
      memorySystem.recordEvent('cooperation', 'other', 'unrelated', context, 0.5, 'Test 3');
      
      const morthosRelationships = memorySystem.getNPCRelationships('morthos');
      
      expect(morthosRelationships.length).toBe(2);
      expect(morthosRelationships.some(r => r.npcA === 'morthos' || r.npcB === 'morthos')).toBe(true);
    });
  });
});
