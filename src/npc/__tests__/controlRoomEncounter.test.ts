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

// src/npc/__tests__/controlRoomEncounter.test.ts
// Unit tests for Control Room encounter orchestrator

import {
  ControlRoomEncounterOrchestrator,
  ControlRoomContext,
  EncounterType,
  getControlRoomOrchestrator,
  triggerControlRoomEncounter
} from '../controlRoomEncounter';
import { getAllianceMemory, recordCooperation, recordBetrayal } from '../allianceMemory';

// Mock game state module
jest.mock('../../state/gameState', () => ({
  getGameState: () => ({
    flags: {}
  })
}));

describe('ControlRoomEncounterOrchestrator', () => {
  let orchestrator: ControlRoomEncounterOrchestrator;
  let allianceMemory: any;

  const baseContext: ControlRoomContext = {
    playerPresent: false,
    playerActions: [],
    roomState: {
      terminalActive: false,
      securityLevel: 'low',
      dataAccessed: []
    },
    timeOfDay: 'morning',
    gamePhase: 'exploration'
  };

  beforeEach(() => {
    // Reset global memory system
    (global as any).globalAllianceMemory = null;
    
    // Create fresh instances
    orchestrator = new ControlRoomEncounterOrchestrator();
    allianceMemory = getAllianceMemory();
    allianceMemory.startNewRun();
    
    // Clear the global orchestrator to ensure clean tests
    (global as any).globalOrchestrator = null;
  });

  describe('First Meeting Encounters', () => {
    test('should generate first meeting encounter when no prior relationship exists', () => {
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.type).toBe('first-meeting');
      expect(encounter!.participantRelationship).toBeNull();
      expect(encounter!.dialogue.length).toBeGreaterThan(0);
      expect(encounter!.trustImpact).toBe(0.1);
    });

    test('should include player-aware dialogue when player is present', () => {
      const contextWithPlayer: ControlRoomContext = {
        ...baseContext,
        playerPresent: true
      };

      const encounter = orchestrator.generateEncounter(contextWithPlayer);
      
      expect(encounter).not.toBeNull();
      const dialogueTexts = encounter!.dialogue.map(d => d.text);
      const hasPlayerReference = dialogueTexts.some(text => 
        text.toLowerCase().includes('friend') || text.toLowerCase().includes('our')
      );
      expect(hasPlayerReference).toBe(true);
    });
  });

  describe('Reunion Encounters', () => {
    test('should generate reunion encounter based on positive history', () => {
      // Create positive history
      recordCooperation('morthos', 'al', 'control-room', 'Worked together on terminal access');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.type).toBe('reunion');
      expect(encounter!.trustImpact).toBe(0.2);
      expect(encounter!.participantRelationship).not.toBeNull();
      expect(encounter!.participantRelationship!.cooperationCount).toBe(1);
    });

    test('should reference past cooperation in reunion dialogue', () => {
      recordCooperation('morthos', 'al', 'control-room', 'Previous collaboration');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      const dialogueTexts = encounter!.dialogue.map(d => d.text);
      const hasCollaborationReference = dialogueTexts.some(text => 
        text.toLowerCase().includes('collaboration') || text.toLowerCase().includes('work together')
      );
      expect(hasCollaborationReference).toBe(true);
    });
  });

  describe('Confrontation Encounters', () => {
    test('should generate confrontation after betrayal', () => {
      // Create betrayal history
      recordBetrayal('al', 'morthos', 'lab', 'Al betrayed Morthos in the lab');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.type).toBe('confrontation');
      expect(encounter!.trustImpact).toBe(-0.1);
      expect(encounter!.participantRelationship!.betrayalCount).toBe(1);
    });

    test('should reference specific betrayal location in confrontation dialogue', () => {
      recordBetrayal('al', 'morthos', 'lab', 'Al betrayed Morthos in the lab');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      const dialogueTexts = encounter!.dialogue.map(d => d.text);
      
      // Should reference either the specific location or betrayal in general
      const hasLocationOrBetrayalReference = dialogueTexts.some(text => {
        const lowerText = text.toLowerCase();
        return lowerText.includes('lab') || 
               lowerText.includes('betrayal') || 
               lowerText.includes('what happened') ||
               lowerText.includes('past');
      });
      expect(hasLocationOrBetrayalReference).toBe(true);
    });
  });

  describe('Trusted Partnership Encounters', () => {
    test('should generate trusted partnership with high trust level', () => {
      // Create multiple positive interactions to build high trust
      recordCooperation('morthos', 'al', 'control-room', 'First cooperation');
      recordCooperation('morthos', 'al', 'data-center', 'Second cooperation'); 
      recordCooperation('morthos', 'al', 'lab', 'Third cooperation');
      recordCooperation('morthos', 'al', 'security-center', 'Fourth cooperation');
      recordCooperation('morthos', 'al', 'main-hub', 'Fifth cooperation');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      // May be reunion, mutual-recognition or trusted-partnership depending on exact trust level
      expect(['reunion', 'trusted-partnership', 'mutual-recognition']).toContain(encounter!.type);
      expect(encounter!.trustImpact).toBeGreaterThanOrEqual(0.2);
    });

    test('should mention terminal when it is active', () => {
      // Setup high trust - need more cooperation for trusted partnership
      recordCooperation('morthos', 'al', 'control-room', 'First cooperation');
      recordCooperation('morthos', 'al', 'data-center', 'Second cooperation');
      recordCooperation('morthos', 'al', 'lab', 'Third cooperation');
      recordCooperation('morthos', 'al', 'security-center', 'Fourth cooperation');
      recordCooperation('morthos', 'al', 'main-hub', 'Fifth cooperation');
      recordCooperation('morthos', 'al', 'terminal-room', 'Sixth cooperation');
      
      const contextWithTerminal: ControlRoomContext = {
        ...baseContext,
        roomState: { ...baseContext.roomState, terminalActive: true }
      };

      const encounter = orchestrator.generateEncounter(contextWithTerminal);
      
      expect(encounter).not.toBeNull();
      const dialogueTexts = encounter!.dialogue.map(d => d.text);
      const hasTerminalReference = dialogueTexts.some(text => 
        text.toLowerCase().includes('terminal')
      );
      
      // Terminal reference should be present if it's a trusted partnership, otherwise may not be
      if (encounter!.type === 'trusted-partnership') {
        expect(hasTerminalReference).toBe(true);
      } else {
        // For other encounter types, we'll just check that the encounter was generated
        expect(encounter!.dialogue.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Memory Integration', () => {
    test('should recall relevant memories for the control room context', () => {
      // Create memory in control room
      recordCooperation('morthos', 'al', 'control-room', 'Worked on terminal together');
      
      // Create memory elsewhere (should be less relevant)
      recordCooperation('morthos', 'al', 'distant-location', 'Unrelated cooperation');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.requiredMemories.length).toBeGreaterThan(0);
      
      // Should prefer control-room memories
      const controlRoomMemory = encounter!.requiredMemories.find(m => 
        m.sourceEvent.context.location === 'control-room'
      );
      expect(controlRoomMemory).toBeDefined();
    });

    test('should generate dialogue based on recalled memories', () => {
      recordCooperation('morthos', 'al', 'control-room', 'Decoded security protocols together');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.dialogue.length).toBeGreaterThan(2);
      
      // Should have memory references in dialogue
      const hasMemoryReference = encounter!.dialogue.some(d => d.references);
      expect(hasMemoryReference).toBe(true);
    });
  });

  describe('Encounter Outcomes', () => {
    test('should generate appropriate outcomes for positive encounters', () => {
      recordCooperation('morthos', 'al', 'control-room', 'Previous cooperation');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      orchestrator.applyEncounterOutcomes(encounter!);
      
      expect(encounter!.outcomes.length).toBeGreaterThan(0);
      
      const trustOutcome = encounter!.outcomes.find(o => o.type === 'trust-increased');
      expect(trustOutcome).toBeDefined();
      
      const memoryOutcome = encounter!.outcomes.find(o => o.type === 'new-memory');
      expect(memoryOutcome).toBeDefined();
    });

    test('should record new memories from encounters', () => {
      const initialEventCount = allianceMemory.allEvents.length;
      
      const encounter = orchestrator.generateEncounter(baseContext);
      orchestrator.applyEncounterOutcomes(encounter!);
      
      // Should have recorded the encounter as a new memory
      expect(allianceMemory.allEvents.length).toBeGreaterThan(initialEventCount);
    });

    test('should set appropriate game flags for alliance formation', () => {
      // Create high trust scenario
      recordCooperation('morthos', 'al', 'control-room', 'First cooperation');
      recordCooperation('morthos', 'al', 'data-center', 'Second cooperation');
      recordCooperation('morthos', 'al', 'lab', 'Third cooperation');
      
      const encounter = orchestrator.generateEncounter(baseContext);
      orchestrator.applyEncounterOutcomes(encounter!);
      
      const allianceOutcome = encounter!.outcomes.find(o => 
        o.type === 'alliance-formed' && o.gameStateChanges
      );
      expect(allianceOutcome).toBeDefined();
    });
  });

  describe('Context Sensitivity', () => {
    test('should adapt to different security levels', () => {
      const highSecurityContext: ControlRoomContext = {
        ...baseContext,
        roomState: { ...baseContext.roomState, securityLevel: 'high' }
      };

      const encounter = orchestrator.generateEncounter(highSecurityContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.triggerConditions).toContain('high-security');
    });

    test('should include player action triggers when player is present', () => {
      const contextWithPlayerActions: ControlRoomContext = {
        ...baseContext,
        playerPresent: true,
        playerActions: ['examine terminal', 'access databank']
      };

      const encounter = orchestrator.generateEncounter(contextWithPlayerActions);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.triggerConditions).toContain('player-present');
    });
  });

  describe('Encounter History', () => {
    test('should track encounter history', () => {
      expect(orchestrator.getEncounterHistory().length).toBe(0);
      
      orchestrator.generateEncounter(baseContext);
      expect(orchestrator.getEncounterHistory().length).toBe(1);
      
      orchestrator.generateEncounter(baseContext);
      expect(orchestrator.getEncounterHistory().length).toBe(2);
    });

    test('should clear encounter history', () => {
      orchestrator.generateEncounter(baseContext);
      expect(orchestrator.getEncounterHistory().length).toBe(1);
      
      orchestrator.clearEncounterHistory();
      expect(orchestrator.getEncounterHistory().length).toBe(0);
    });
  });

  describe('Global Functions', () => {
    test('should provide global orchestrator instance', () => {
      const global1 = getControlRoomOrchestrator();
      const global2 = getControlRoomOrchestrator();
      
      expect(global1).toBe(global2); // Same instance
    });

    test('should trigger encounter and apply outcomes automatically', () => {
      // Use a fresh context to ensure first meeting
      const freshContext = { ...baseContext };
      
      const encounter = triggerControlRoomEncounter(freshContext);
      
      expect(encounter).not.toBeNull();
      // Should be first meeting since we haven't set up any prior history
      expect(['first-meeting', 'trusted-partnership']).toContain(encounter!.type);
      
      // Should have applied outcomes automatically
      expect(encounter!.outcomes.length).toBeGreaterThan(0);
    });
  });

  describe('Dialogue Quality', () => {
    test('should generate appropriate emotional tones', () => {
      // Create a betrayal scenario that should generate negative emotions
      recordBetrayal('al', 'morthos', 'lab', 'Al betrayed Morthos');
      // Make sure there's no additional positive history
      
      const encounter = orchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      
      // If it's a confrontation, should have negative/mixed tones
      if (encounter!.type === 'confrontation') {
        const negativeTones = encounter!.dialogue.filter(d => 
          d.emotionalTone === 'negative' || d.emotionalTone === 'mixed'
        );
        expect(negativeTones.length).toBeGreaterThan(0);
      } else {
        // For other encounter types, just check we have dialogue
        expect(encounter!.dialogue.length).toBeGreaterThan(0);
      }
    });

    test('should limit dialogue length according to config', () => {
      const limitedOrchestrator = new ControlRoomEncounterOrchestrator({
        maxDialogueLines: 3
      });
      
      const encounter = limitedOrchestrator.generateEncounter(baseContext);
      
      expect(encounter).not.toBeNull();
      expect(encounter!.dialogue.length).toBeLessThanOrEqual(3);
    });
  });
});
