// Gorstan (c) Geoffrey Alan Webster. Code MIT Licence
// Module: VisualEffectsManager.ts
// Version: 6.1.0
// Handles one-time and persistent visual effects triggered by room entry or game events
// Enhanced for full TypeScript compliance and game engine integration

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Available visual effect types in the Gorstan game engine
 */
export type VisualEffectType = 
  | 'fog'           // Atmospheric fog effect
  | 'glitch'        // Digital corruption/glitch effect
  | 'fadein'        // Fade-in transition effect
  | 'vhs'           // VHS tape distortion effect (persistent)
  | 'rain'          // Rain overlay effect
  | 'snow'          // Snow particle effect
  | 'lightning'     // Lightning flash effect
  | 'static'        // TV static effect
  | 'scanlines'     // CRT scanline effect
  | 'chromatic'     // Chromatic aberration effect
  | string;         // Allow custom effects while providing common ones

/**
 * Effect configuration interface for advanced effect control
 */
export interface EffectConfig {
  readonly name: VisualEffectType;
  readonly duration?: number;      // Duration in milliseconds (0 = permanent)
  readonly intensity?: number;     // Effect intensity (0.0 to 1.0)
  readonly persistent?: boolean;   // Whether effect survives room changes
  readonly cssClass?: string;      // Custom CSS class override
  readonly zIndex?: number;        // Z-index for layering effects
}

/**
 * Effect state tracking for the visual effects system
 */
interface EffectState {
  readonly name: VisualEffectType;
  readonly startTime: number;
  readonly duration: number;
  readonly persistent: boolean;
  timeoutId?: number;
}

/**
 * Visual Effects Manager class for comprehensive effect control
 */
class VisualEffectsManagerClass {
  private activeEffects: Map<string, EffectState> = new Map();
  private rootElement: HTMLElement | null = null;

  /**
   * Initialize the visual effects manager
   */
  public initialize(): void {
    this.rootElement = document.getElementById('game-root');
    if (!this.rootElement) {
      console.warn('[VisualEffectsManager] Game root element not found - effects will be disabled');
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[VisualEffectsManager] Initialized with root element:', this.rootElement.id);
    }
  }

  /**
   * Apply a visual effect with enhanced configuration options
   */
  public applyEffect(effectName: VisualEffectType, config?: Partial<EffectConfig>): boolean {
    if (!this.rootElement) {
      console.warn('[VisualEffectsManager] Cannot apply effect - manager not initialized');
      return false;
    }

    const effectConfig: EffectConfig = {
      name: effectName,
      duration: this.getDefaultDuration(effectName),
      intensity: 1.0,
      persistent: this.isEffectPersistent(effectName),
      cssClass: `effect-${effectName}`,
      zIndex: 1000,
      ...config
    };

    // Validate effect type
    if (!this.isValidEffect(effectName)) {
      console.warn(`[VisualEffectsManager] Unknown effect: ${effectName}`);
      return false;
    }

    // Remove existing instance of this effect
    this.removeEffect(effectName);

    // Apply the CSS class
        this.rootElement.classList.add(cssClass);

    // Set up intensity if specified
    if (typeof effectConfig.intensity === 'number' && effectConfig.intensity !== 1.0) {
      this.rootElement.style.setProperty(`--effect-${effectName}-intensity`, effectConfig.intensity.toString());
    }

    // Set up z-index if specified
    if (effectConfig.zIndex) {
      this.rootElement.style.setProperty(`--effect-${effectName}-z-index`, effectConfig.zIndex.toString());
    }

    // Track the effect state
    const effectState: EffectState = {
      name: effectName,
      startTime: Date.now(),
      duration: effectConfig.duration || 0,
      persistent: effectConfig.persistent || false
    };

    // Set up auto-removal for non-permanent effects
    if (effectConfig.duration && effectConfig.duration > 0) {
            }, effectConfig.duration);

      effectState.timeoutId = timeoutId;
    }

    this.activeEffects.set(effectName, effectState);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[VisualEffectsManager] Applied effect: ${effectName}`, effectConfig);
    }

    return true;
  }

  /**
   * Remove a specific visual effect
   */
  public removeEffect(effectName: VisualEffectType): boolean {
    if (!this.rootElement) {
      return false;
    }

        if (!effectState) {
      return false;
    }

    // Clear timeout if it exists
    if (effectState.timeoutId) {
      clearTimeout(effectState.timeoutId);
    }

    // Remove CSS class
        this.rootElement.classList.remove(cssClass);

    // Remove CSS custom properties
    this.rootElement.style.removeProperty(`--effect-${effectName}-intensity`);
    this.rootElement.style.removeProperty(`--effect-${effectName}-z-index`);

    // Remove from tracking
    this.activeEffects.delete(effectName);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[VisualEffectsManager] Removed effect: ${effectName}`);
    }

    return true;
  }

  /**
   * Clear all active effects (typically used during room transitions)
   */
  public clearAllEffects(preservePersistent: boolean = true): void {
    const effectsToRemove: VisualEffectType[] = [];

    this.activeEffects.forEach((state, name) => {
      if (!preservePersistent || !state.persistent) {
        effectsToRemove.push(name);
      }
    });

    effectsToRemove.forEach(effectName => {
      this.removeEffect(effectName);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[VisualEffectsManager] Cleared ${effectsToRemove.length} effects (persistent preserved: ${preservePersistent})`);
    }
  }

  /**
   * Get all currently active effects
   */
  public getActiveEffects(): readonly VisualEffectType[] {
    return Array.from(this.activeEffects.keys());
  }

  /**
   * Check if a specific effect is currently active
   */
  public isEffectActive(effectName: VisualEffectType): boolean {
    return this.activeEffects.has(effectName);
  }

  /**
   * Get effect state information
   */
  public getEffectState(effectName: VisualEffectType): EffectState | null {
    return this.activeEffects.get(effectName) || null;
  }

  /**
   * Apply multiple effects in sequence with timing
   */
  public applyEffectSequence(effects: Array<{ name: VisualEffectType; delay: number; config?: Partial<EffectConfig> }>): void {
    effects.forEach(({ name, delay, config }) => {
      setTimeout(() => {
        this.applyEffect(name, config);
      }, delay);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[VisualEffectsManager] Applied effect sequence with ${effects.length} effects`);
    }
  }

  /**
   * Apply room-specific effects based on room properties
   */
  public applyRoomEffects(roomData: { moodTag?: string; special?: Record<string, unknown>; anomalies?: unknown[] }): void {
    // Clear non-persistent effects when entering new room
    this.clearAllEffects(true);

    // Apply mood-based effects
    if (roomData.moodTag) {
      this.applyMoodEffect(roomData.moodTag);
    }

    // Apply special property effects
    if (roomData.special) {
      this.applySpecialEffects(roomData.special);
    }

    // Apply anomaly effects
    if (roomData.anomalies && roomData.anomalies.length > 0) {
      this.applyEffect('glitch', { duration: 2000, intensity: 0.5 });
    }
  }

  /**
   * Get default duration for effect types
   */
  private getDefaultDuration(effectName: VisualEffectType): number {
    const durationMap: Record<string, number> = {
      'fog': 8000,
      'glitch': 3000,
      'fadein': 2000,
      'vhs': 0,        // Persistent
      'rain': 0,       // Persistent
      'snow': 0,       // Persistent
      'lightning': 500,
      'static': 1000,
      'scanlines': 0,  // Persistent
      'chromatic': 2000
    };

    return durationMap[effectName] || 5000; // Default 5 seconds
  }

  /**
   * Check if effect is persistent by default
   */
  private isEffectPersistent(effectName: VisualEffectType): boolean {
    const persistentEffects: Set<string> = new Set([
      'vhs', 'rain', 'snow', 'scanlines'
    ]);

    return persistentEffects.has(effectName);
  }

  /**
   * Validate if effect name is recognized
   */
  private isValidEffect(effectName: VisualEffectType): boolean {
    const knownEffects: Set<string> = new Set([
      'fog', 'glitch', 'fadein', 'vhs', 'rain', 'snow', 
      'lightning', 'static', 'scanlines', 'chromatic'
    ]);

    // Allow custom effects (string type) or known effects
    return typeof effectName === 'string' && effectName.length > 0;
  }

  /**
   * Apply mood-based atmospheric effects
   */
  private applyMoodEffect(moodTag: string): void {
    const moodEffectMap: Record<string, VisualEffectType> = {
      'mysterious': 'fog',
      'corrupt': 'glitch',
      'peaceful': 'fadein',
      'retro': 'vhs',
      'stormy': 'rain',
      'cold': 'snow',
      'electric': 'lightning',
      'digital': 'static',
      'vintage': 'scanlines'
    };

        if (effect) {
      this.applyEffect(effect, { intensity: 0.7 });
    }
  }

  /**
   * Apply effects based on room special properties
   */
  private applySpecialEffects(special: Record<string, unknown>): void {
    // Ending rooms get special effects
    if (special.ending_architect) {
      this.applyEffect('chromatic', { duration: 0, persistent: true });
    }
    if (special.ending_glitch || special.glitch_ending) {
      this.applyEffect('glitch', { duration: 0, persistent: true, intensity: 0.8 });
    }
    if (special.reality_corruption) {
      this.applyEffect('static', { duration: 0, persistent: true });
    }
    if (special.peaceful_ending) {
      this.applyEffect('fadein', { duration: 3000 });
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE & EXPORTS
// =============================================================================

/**
 * Singleton instance of the Visual Effects Manager
 */

/**
 * Initialize the visual effects system
 */
export function initializeVisualEffects(): void {
  VisualEffectsManager.initialize();
}

/**
 * Apply a visual effect with enhanced configuration options
 * Enhanced version of the original function with type safety
 */
export function applyVisualEffect(effectName: VisualEffectType, config?: Partial<EffectConfig>): boolean {
  return VisualEffectsManager.applyEffect(effectName, config);
}

/**
 * Remove a specific visual effect
 */
export function removeVisualEffect(effectName: VisualEffectType): boolean {
  return VisualEffectsManager.removeEffect(effectName);
}

/**
 * Clear all visual effects
 */
export function clearAllVisualEffects(preservePersistent: boolean = true): void {
  VisualEffectsManager.clearAllEffects(preservePersistent);
}

/**
 * Apply room-specific visual effects based on room data
 * Integrates with the Gorstan room engine
 */
export function applyRoomVisualEffects(roomData: { 
  moodTag?: string; 
  special?: Record<string, unknown>; 
  anomalies?: unknown[] 
}): void {
  VisualEffectsManager.applyRoomEffects(roomData);
}

/**
 * Get currently active effects
 */
export function getActiveVisualEffects(): readonly VisualEffectType[] {
  return VisualEffectsManager.getActiveEffects();
}

/**
 * Check if a specific effect is active
 */
export function isVisualEffectActive(effectName: VisualEffectType): boolean {
  return VisualEffectsManager.isEffectActive(effectName);
}

/**
 * Apply a sequence of effects with timing
 */
export function applyVisualEffectSequence(effects: Array<{ 
  name: VisualEffectType; 
  delay: number; 
  config?: Partial<EffectConfig> 
}>): void {
  VisualEffectsManager.applyEffectSequence(effects);
}

// Export the manager instance for direct access if needed
export { VisualEffectsManager };

// Export types for use in other modules
// (Types are already exported above)
