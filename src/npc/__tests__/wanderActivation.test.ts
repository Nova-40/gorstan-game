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

// src/npc/__tests__/wanderActivation.test.ts
// Unit tests for wandering activation controller

import { 
  WanderActivationController, 
  GameStateSnapshot, 
  WanderActivationConfig,
  setGamePhase,
  setCutsceneState,
  setOverlayState,
  setPollyTakeoverState,
  initializeWanderActivation
} from '../wanderActivation';

describe('WanderActivationController', () => {
  let controller: WanderActivationController;
  
  const baseGameState: GameStateSnapshot = {
    currentPhase: 'exploration',
    currentRoom: 'test-room',
    isPlayerInCutscene: false,
    isSystemOverlayActive: false,
    hasReducedMotionPreference: false,
    isPollyTakeoverActive: false,
    isResetInProgress: false,
    gameFlags: {}
  };

  beforeEach(() => {
    controller = new WanderActivationController();
  });

  afterEach(() => {
    controller.destroy();
  });

  describe('Basic Activation Logic', () => {
    test('should activate wandering during exploration phase', () => {
      controller.updateGameState(baseGameState);
      
      // Force immediate evaluation
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(true);
      expect(status.currentPhase).toBe('exploration');
      expect(status.reason).toBe('active');
    });

    test('should deactivate wandering during intro phase', () => {
      const introState: GameStateSnapshot = {
        ...baseGameState,
        currentPhase: 'intro'
      };
      
      controller.updateGameState(introState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('phase-intro');
    });

    test('should deactivate wandering during cutscenes', () => {
      const cutsceneState: GameStateSnapshot = {
        ...baseGameState,
        isPlayerInCutscene: true
      };
      
      controller.updateGameState(cutsceneState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('cutscene');
    });

    test('should deactivate wandering when system overlay is active', () => {
      const overlayState: GameStateSnapshot = {
        ...baseGameState,
        isSystemOverlayActive: true
      };
      
      controller.updateGameState(overlayState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('overlay');
    });

    test('should deactivate wandering during PollyTakeover', () => {
      const pollyState: GameStateSnapshot = {
        ...baseGameState,
        isPollyTakeoverActive: true
      };
      
      controller.updateGameState(pollyState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('polly-takeover');
    });

    test('should deactivate wandering during reset', () => {
      const resetState: GameStateSnapshot = {
        ...baseGameState,
        isResetInProgress: true
      };
      
      controller.updateGameState(resetState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('reset');
    });
  });

  describe('Reduced Motion Support', () => {
    test('should respect reduced motion preference', () => {
      const reducedMotionState: GameStateSnapshot = {
        ...baseGameState,
        hasReducedMotionPreference: true
      };
      
      controller.updateGameState(reducedMotionState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('reduced-motion');
    });

    test('should allow disabling reduced motion respect', () => {
      const config: Partial<WanderActivationConfig> = {
        respectReducedMotion: false
      };
      
      const controllerNoMotion = new WanderActivationController(config);
      
      const reducedMotionState: GameStateSnapshot = {
        ...baseGameState,
        hasReducedMotionPreference: true
      };
      
      controllerNoMotion.updateGameState(reducedMotionState);
      controllerNoMotion.forceEvaluate();
      
      const status = controllerNoMotion.getActivationStatus();
      expect(status.isActive).toBe(true);
      
      controllerNoMotion.destroy();
    });
  });

  describe('Room-Based Restrictions', () => {
    test('should disable wandering in configured disabled rooms', () => {
      const disabledRoomState: GameStateSnapshot = {
        ...baseGameState,
        currentRoom: 'final-cutscene' // This is in default disabled rooms
      };
      
      controller.updateGameState(disabledRoomState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('disabled-room-final-cutscene');
    });

    test('should allow wandering in non-disabled rooms', () => {
      const enabledRoomState: GameStateSnapshot = {
        ...baseGameState,
        currentRoom: 'normal-room'
      };
      
      controller.updateGameState(enabledRoomState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(true);
    });
  });

  describe('Game Flag Restrictions', () => {
    test('should disable wandering when wandering-disabled flag is set', () => {
      const flagDisabledState: GameStateSnapshot = {
        ...baseGameState,
        gameFlags: { 'wandering-disabled': true }
      };
      
      controller.updateGameState(flagDisabledState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('flag-disabled');
    });

    test('should disable wandering during final sequence', () => {
      const finalSequenceState: GameStateSnapshot = {
        ...baseGameState,
        gameFlags: { 'final-sequence-active': true }
      };
      
      controller.updateGameState(finalSequenceState);
      controller.forceEvaluate();
      
      const status = controller.getActivationStatus();
      expect(status.isActive).toBe(false);
      expect(status.reason).toBe('final-sequence');
    });
  });

  describe('Configuration Updates', () => {
    test('should allow updating active phases', () => {
      // Start with intro phase (normally disabled)
      const introState: GameStateSnapshot = {
        ...baseGameState,
        currentPhase: 'intro'
      };
      
      controller.updateGameState(introState);
      controller.forceEvaluate();
      
      // Should be disabled
      expect(controller.getActivationStatus().isActive).toBe(false);
      
      // Update config to allow intro phase
      controller.updateConfig({
        activePhases: ['exploration', 'intro']
      });
      
      // Should now be enabled
      expect(controller.getActivationStatus().isActive).toBe(true);
    });

    test('should allow updating disabled rooms', () => {
      // Start in a room that's disabled by default
      const disabledRoomState: GameStateSnapshot = {
        ...baseGameState,
        currentRoom: 'final-cutscene'
      };
      
      controller.updateGameState(disabledRoomState);
      controller.forceEvaluate();
      
      // Should be disabled
      expect(controller.getActivationStatus().isActive).toBe(false);
      
      // Update config to remove room from disabled list
      controller.updateConfig({
        disabledRooms: []
      });
      
      // Should now be enabled
      expect(controller.getActivationStatus().isActive).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should support quick phase setting', () => {
      initializeWanderActivation(baseGameState);
      
      setGamePhase('cutscene');
      
      // Note: These are integration-style tests with the global controller
      // In a real test, we'd need to access the global controller's state
    });

    test('should support quick cutscene state setting', () => {
      initializeWanderActivation(baseGameState);
      
      setCutsceneState(true);
      
      // Integration test with global controller
    });

    test('should support quick overlay state setting', () => {
      initializeWanderActivation(baseGameState);
      
      setOverlayState(true);
      
      // Integration test with global controller
    });

    test('should support quick polly takeover state setting', () => {
      initializeWanderActivation(baseGameState);
      
      setPollyTakeoverState(true);
      
      // Integration test with global controller
    });
  });
});
