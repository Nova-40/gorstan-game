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

// src/npc/wanderActivation.ts
// Activation conditions for wandering NPCs
// Step 4: Ensure wandering is ON when it should be

import { getWanderScheduler } from './wanderScheduler';

/**
 * Game phases that affect wandering activation
 */
export type GamePhase = 
  | 'preload'        // Before game starts
  | 'intro'          // Intro sequences, tutorial
  | 'exploration'    // Normal gameplay
  | 'cutscene'       // Story cutscenes
  | 'polly-takeover' // PollyTakeover death sequence
  | 'reset'          // Game reset in progress
  | 'final'          // Final sequences/ending
  | 'overlay';       // System overlays (pause, settings, etc.)

/**
 * Configuration for wandering activation
 */
export interface WanderActivationConfig {
  // Game phases where wandering should be active
  activePhases: GamePhase[];
  
  // Specific rooms where wandering should be disabled
  disabledRooms: string[];
  
  // Delay after phase change before activating wandering (ms)
  activationDelayMs: number;
  
  // Whether to respect reduced motion preferences
  respectReducedMotion: boolean;
}

/**
 * Current game state for activation decisions
 */
export interface GameStateSnapshot {
  currentPhase: GamePhase;
  currentRoom: string;
  isPlayerInCutscene: boolean;
  isSystemOverlayActive: boolean;
  hasReducedMotionPreference: boolean;
  isPollyTakeoverActive: boolean;
  isResetInProgress: boolean;
  gameFlags: Record<string, boolean>;
}

// Default activation configuration
const DEFAULT_ACTIVATION_CONFIG: WanderActivationConfig = {
  activePhases: ['exploration'], // Only active during normal gameplay
  disabledRooms: [
    'final-cutscene',
    'polly-death-room',
    'intro-tutorial',
    'reset-sequence'
  ],
  activationDelayMs: 500, // Half second delay after phase changes
  respectReducedMotion: true
};

/**
 * Manages when wandering NPCs should be active
 */
export class WanderActivationController {
  private config: WanderActivationConfig;
  private currentGameState: GameStateSnapshot | null = null;
  private activationTimer: NodeJS.Timeout | null = null;
  private isWanderingActive = false;

  constructor(config?: Partial<WanderActivationConfig>) {
    this.config = { ...DEFAULT_ACTIVATION_CONFIG, ...config };
  }

  /**
   * Update the current game state and evaluate activation
   */
  updateGameState(gameState: GameStateSnapshot): void {
    const previousState = this.currentGameState;
    this.currentGameState = gameState;

    // Check if this is a significant state change
    const significantChange = !previousState || 
      previousState.currentPhase !== gameState.currentPhase ||
      previousState.isPlayerInCutscene !== gameState.isPlayerInCutscene ||
      previousState.isSystemOverlayActive !== gameState.isSystemOverlayActive ||
      previousState.isPollyTakeoverActive !== gameState.isPollyTakeoverActive ||
      previousState.isResetInProgress !== gameState.isResetInProgress;

    if (significantChange) {
      this.scheduleActivationEvaluation();
    }
  }

  /**
   * Schedule evaluation of activation after a delay
   */
  private scheduleActivationEvaluation(): void {
    // Clear any existing timer
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
    }

    // Schedule new evaluation
    this.activationTimer = setTimeout(() => {
      this.evaluateActivation();
    }, this.config.activationDelayMs);
  }

  /**
   * Evaluate whether wandering should be active and apply changes
   */
  private evaluateActivation(): void {
    if (!this.currentGameState) {
      return;
    }

    const shouldBeActive = this.shouldWanderingBeActive(this.currentGameState);
    
    if (shouldBeActive !== this.isWanderingActive) {
      this.isWanderingActive = shouldBeActive;
      
      if (shouldBeActive) {
        this.activateWandering();
      } else {
        this.deactivateWandering();
      }
    }
  }

  /**
   * Determine if wandering should be active based on game state
   */
  private shouldWanderingBeActive(state: GameStateSnapshot): boolean {
    // Check reduced motion preference
    if (this.config.respectReducedMotion && state.hasReducedMotionPreference) {
      return false;
    }

    // Check if current phase allows wandering
    if (!this.config.activePhases.includes(state.currentPhase)) {
      return false;
    }

    // Check specific blocking conditions
    if (state.isPlayerInCutscene) {
      return false;
    }

    if (state.isSystemOverlayActive) {
      return false;
    }

    if (state.isPollyTakeoverActive) {
      return false;
    }

    if (state.isResetInProgress) {
      return false;
    }

    // Check disabled rooms
    if (this.config.disabledRooms.includes(state.currentRoom)) {
      return false;
    }

    // Check specific game flags that might disable wandering
    if (state.gameFlags['wandering-disabled']) {
      return false;
    }

    if (state.gameFlags['final-sequence-active']) {
      return false;
    }

    return true;
  }

  /**
   * Activate wandering
   */
  private activateWandering(): void {
    console.log('[WanderActivation] Activating wandering');
    
    const scheduler = getWanderScheduler();
    
    // Resume any global pauses that we may have applied
    scheduler.resume({ global: true, reason: 'activation-controller' });
    
    // Start the scheduler if it's not running
    if (!scheduler.getStats().isRunning) {
      scheduler.start();
    }
  }

  /**
   * Deactivate wandering
   */
  private deactivateWandering(): void {
    const state = this.currentGameState;
    const reason = state ? this.getDeactivationReason(state) : 'unknown';
    
    console.log(`[WanderActivation] Deactivating wandering: ${reason}`);
    
    const scheduler = getWanderScheduler();
    
    // Pause wandering globally
    scheduler.pause({ global: true, reason: 'activation-controller' });
  }

  /**
   * Get human-readable reason for deactivation
   */
  private getDeactivationReason(state: GameStateSnapshot): string {
    if (state.hasReducedMotionPreference) return 'reduced-motion';
    if (!this.config.activePhases.includes(state.currentPhase)) return `phase-${state.currentPhase}`;
    if (state.isPlayerInCutscene) return 'cutscene';
    if (state.isSystemOverlayActive) return 'overlay';
    if (state.isPollyTakeoverActive) return 'polly-takeover';
    if (state.isResetInProgress) return 'reset';
    if (this.config.disabledRooms.includes(state.currentRoom)) return `disabled-room-${state.currentRoom}`;
    if (state.gameFlags['wandering-disabled']) return 'flag-disabled';
    if (state.gameFlags['final-sequence-active']) return 'final-sequence';
    return 'unknown';
  }

  /**
   * Force immediate activation evaluation
   */
  forceEvaluate(): void {
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
      this.activationTimer = null;
    }
    this.evaluateActivation();
  }

  /**
   * Get current activation status
   */
  getActivationStatus(): {
    isActive: boolean;
    currentPhase: GamePhase | null;
    reason: string;
  } {
    const state = this.currentGameState;
    return {
      isActive: this.isWanderingActive,
      currentPhase: state?.currentPhase || null,
      reason: state ? (this.isWanderingActive ? 'active' : this.getDeactivationReason(state)) : 'no-state'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WanderActivationConfig>): void {
    this.config = { ...this.config, ...config };
    // Re-evaluate after config change
    this.forceEvaluate();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.activationTimer) {
      clearTimeout(this.activationTimer);
      this.activationTimer = null;
    }
  }
}

// Global instance for easy access
let globalActivationController: WanderActivationController | null = null;

/**
 * Get the global activation controller
 */
export function getWanderActivationController(config?: Partial<WanderActivationConfig>): WanderActivationController {
  if (!globalActivationController) {
    globalActivationController = new WanderActivationController(config);
  }
  return globalActivationController;
}

/**
 * Quick functions for common game state updates
 */

export function setGamePhase(phase: GamePhase): void {
  const controller = getWanderActivationController();
  const currentState = controller['currentGameState'];
  
  if (currentState) {
    controller.updateGameState({
      ...currentState,
      currentPhase: phase
    });
  }
}

export function setCutsceneState(isInCutscene: boolean): void {
  const controller = getWanderActivationController();
  const currentState = controller['currentGameState'];
  
  if (currentState) {
    controller.updateGameState({
      ...currentState,
      isPlayerInCutscene: isInCutscene
    });
  }
}

export function setOverlayState(isOverlayActive: boolean): void {
  const controller = getWanderActivationController();
  const currentState = controller['currentGameState'];
  
  if (currentState) {
    controller.updateGameState({
      ...currentState,
      isSystemOverlayActive: isOverlayActive
    });
  }
}

export function setPollyTakeoverState(isActive: boolean): void {
  const controller = getWanderActivationController();
  const currentState = controller['currentGameState'];
  
  if (currentState) {
    controller.updateGameState({
      ...currentState,
      isPollyTakeoverActive: isActive
    });
  }
}

/**
 * Initialize wandering activation with current game state
 */
export function initializeWanderActivation(initialState: GameStateSnapshot): void {
  const controller = getWanderActivationController();
  controller.updateGameState(initialState);
  
  console.log('[WanderActivation] Initialized with state:', initialState);
}
