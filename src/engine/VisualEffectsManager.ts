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

// Gorstan and characters (c) Geoff Webster 2025
// Visual effects management system

export type VisualEffectType =
  | 'fadein'
  | 'fadeout'
  | 'glitch'
  | 'scanlines'
  | 'vhs'
  | 'static'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'lightning'
  | 'shake'
  | 'flash'
  | 'pulse'
  | 'blur'
  | 'sepia'
  | 'invert'
  | 'grayscale';

export interface EffectConfig {
  duration?: number;
  intensity?: number;
  persistent?: boolean;
  color?: string;
  speed?: number;
}

interface EffectState {
  config: EffectConfig;
  startTime: number;
  timeoutId?: NodeJS.Timeout;
  duration: number;
  persistent: boolean;
}

/**
 * Manages visual effects for the game interface.
 * Provides a centralized system for applying and managing visual effects.
 */
export class VisualEffectsManager {
  private static instance: VisualEffectsManager;
  private activeEffects: Map<VisualEffectType, EffectState> = new Map();

  private constructor() {
    this.initializeEffectStyles();
  }

  public static getInstance(): VisualEffectsManager {
    if (!VisualEffectsManager.instance) {
      VisualEffectsManager.instance = new VisualEffectsManager();
    }
    return VisualEffectsManager.instance;
  }

  /**
   * Initializes CSS classes for visual effects if they don't exist.
   */
  private initializeEffectStyles(): void {
    if (typeof document === 'undefined') return;

    const styleId = 'visual-effects-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .effect-fadein { animation: fadeIn 1s ease-in; }
      .effect-fadeout { animation: fadeOut 1s ease-out; }
      .effect-glitch { animation: glitch 0.3s infinite; }
      .effect-scanlines::after { 
        content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px);
        pointer-events: none;
      }
      .effect-vhs { filter: contrast(1.2) saturate(1.5) hue-rotate(5deg); }
      .effect-static::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="noise"><feTurbulence baseFrequency="0.9"/></filter></defs><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.1"/></svg>');
        pointer-events: none; animation: staticNoise 0.1s infinite;
      }
      .effect-fog { background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); }
      .effect-rain::before {
        content: ''; position: absolute; top: -100%; left: 0; right: 0; height: 200%;
        background: repeating-linear-gradient(90deg, transparent, transparent 98px, rgba(173,216,230,0.3) 100px);
        animation: rain 0.5s linear infinite;
      }
      .effect-snow::before {
        content: ''; position: absolute; top: -100%; left: 0; right: 0; height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px);
        background-size: 25px 25px; animation: snow 3s linear infinite;
      }
      .effect-lightning { animation: lightning 0.2s ease-in-out; }
      .effect-shake { animation: shake 0.5s ease-in-out; }
      .effect-flash { animation: flash 0.3s ease-in-out; }
      .effect-pulse { animation: pulse 2s ease-in-out infinite; }
      .effect-blur { filter: blur(2px); }
      .effect-sepia { filter: sepia(1); }
      .effect-invert { filter: invert(1); }
      .effect-grayscale { filter: grayscale(1); }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes glitch {
        0% { transform: translate(0); filter: hue-rotate(0deg); }
        20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
        40% { transform: translate(-2px, -2px); filter: hue-rotate(180deg); }
        60% { transform: translate(2px, 2px); filter: hue-rotate(270deg); }
        80% { transform: translate(2px, -2px); filter: hue-rotate(180deg); }
        100% { transform: translate(0); filter: hue-rotate(0deg); }
      }
      @keyframes staticNoise { 0%, 100% { transform: translate(0); } 50% { transform: translate(1px, -1px); } }
      @keyframes rain { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
      @keyframes snow { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
      @keyframes lightning { 0%, 100% { background: transparent; } 50% { background: rgba(255,255,255,0.9); } }
      @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
    `;
    document.head.appendChild(style);
  }

  /**
   * Applies a visual effect to the game interface.
   */
  public applyEffect(effectName: VisualEffectType, config: EffectConfig = {}): boolean {
    if (!this.isValidEffect(effectName)) {
      console.warn(`[VisualEffectsManager] Invalid effect: ${effectName}`);
      return false;
    }

    const effectConfig = {
      duration: config.duration || this.getDefaultDuration(effectName),
      intensity: config.intensity || 1,
      persistent: config.persistent || false,
      ...config
    };

    const effectState: EffectState = {
      config: effectConfig,
      startTime: Date.now(),
      duration: effectConfig.duration || 0,
      persistent: effectConfig.persistent || false
    };

    // Apply the effect to the DOM
    this.applyEffectToDOM(effectName, effectConfig);

    // Set up auto-removal for non-persistent effects
    if (effectConfig.duration && effectConfig.duration > 0) {
      const timeoutId = setTimeout(() => {
        this.removeEffect(effectName);
      }, effectConfig.duration);

      effectState.timeoutId = timeoutId;
    }

    this.activeEffects.set(effectName, effectState);

  if (import.meta.env.DEV) {
      console.log(`[VisualEffectsManager] Applied effect: ${effectName}`, effectConfig);
    }

    return true;
  }

  /**
   * Applies the visual effect to the DOM.
   */
  private applyEffectToDOM(effectName: VisualEffectType, config: EffectConfig): void {
    if (typeof document === 'undefined') return;

    const gameContainer = document.getElementById('root') || document.body;
    const className = `effect-${effectName}`;

    // Remove existing effect class if present
    gameContainer.classList.remove(className);

    // Add the effect class
    gameContainer.classList.add(className);

    // Apply intensity if specified
    if (config.intensity !== undefined && config.intensity !== 1) {
      gameContainer.style.setProperty('--effect-intensity', config.intensity.toString());
    }

    // Apply color if specified
    if (config.color) {
      gameContainer.style.setProperty('--effect-color', config.color);
    }
  }

  /**
   * Removes a visual effect.
   */
  public removeEffect(effectName: VisualEffectType): boolean {
    const effectState = this.activeEffects.get(effectName);
    if (!effectState) return false;

    // Clear timeout if it exists
    if (effectState.timeoutId) {
      clearTimeout(effectState.timeoutId);
    }

    // Remove from DOM
    this.removeEffectFromDOM(effectName);

    // Remove from active effects
    this.activeEffects.delete(effectName);

  if (import.meta.env.DEV) {
      console.log(`[VisualEffectsManager] Removed effect: ${effectName}`);
    }

    return true;
  }

  /**
   * Removes the visual effect from the DOM.
   */
  private removeEffectFromDOM(effectName: VisualEffectType): void {
    if (typeof document === 'undefined') return;

    const gameContainer = document.getElementById('root') || document.body;
    const className = `effect-${effectName}`;

    gameContainer.classList.remove(className);
    gameContainer.style.removeProperty('--effect-intensity');
    gameContainer.style.removeProperty('--effect-color');
  }

  /**
   * Clears all active effects.
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

  if (import.meta.env.DEV) {
      console.log(`[VisualEffectsManager] Cleared ${effectsToRemove.length} effects`);
    }
  }

  /**
   * Gets all currently active effects.
   */
  public getActiveEffects(): readonly VisualEffectType[] {
    return Array.from(this.activeEffects.keys());
  }

  /**
   * Checks if an effect is currently active.
   */
  public isEffectActive(effectName: VisualEffectType): boolean {
    return this.activeEffects.has(effectName);
  }

  /**
   * Gets the state of an active effect.
   */
  public getEffectState(effectName: VisualEffectType): EffectState | null {
    return this.activeEffects.get(effectName) || null;
  }

  /**
   * Applies a sequence of effects with delays.
   */
  public applyEffectSequence(effects: Array<{ name: VisualEffectType; delay: number; config?: Partial<EffectConfig> }>): void {
    effects.forEach(({ name, delay, config }) => {
      setTimeout(() => {
        this.applyEffect(name, config);
      }, delay);
    });

  if (import.meta.env.DEV) {
      console.log(`[VisualEffectsManager] Applied effect sequence:`, effects);
    }
  }

  /**
   * Applies effects based on room data.
   */
  public applyRoomEffects(roomData: { moodTag?: string; special?: Record<string, unknown>; anomalies?: unknown[] }): void {
    // Clear existing room-based effects
    this.clearAllEffects(true);

    // Apply mood-based effects
    if (roomData.moodTag) {
      this.applyMoodEffect(roomData.moodTag);
    }

    // Apply special effects
    if (roomData.special) {
      this.applySpecialEffects(roomData.special);
    }

    // Apply anomaly effects
    if (roomData.anomalies && roomData.anomalies.length > 0) {
      this.applyEffect('glitch', { duration: 2000, intensity: 0.5 });
    }
  }

  /**
   * Gets the default duration for an effect type.
   */
  private getDefaultDuration(effectName: VisualEffectType): number {
    const durations: Record<VisualEffectType, number> = {
      'fadein': 1000,
      'fadeout': 1000,
      'glitch': 2000,
      'scanlines': 0,
      'vhs': 0,
      'static': 3000,
      'fog': 0,
      'rain': 0,
      'snow': 0,
      'lightning': 500,
      'shake': 500,
      'flash': 300,
      'pulse': 0,
      'blur': 0,
      'sepia': 0,
      'invert': 0,
      'grayscale': 0
    };

    return durations[effectName] || 1000;
  }

  /**
   * Checks if an effect should persist.
   */
  private isEffectPersistent(effectName: VisualEffectType): boolean {
    const persistentEffects: VisualEffectType[] = [
      'scanlines', 'vhs', 'fog', 'rain', 'snow', 'pulse', 'blur', 'sepia', 'invert', 'grayscale'
    ];
    return persistentEffects.includes(effectName);
  }

  /**
   * Validates an effect name.
   */
  private isValidEffect(effectName: VisualEffectType): boolean {
    const validEffects: VisualEffectType[] = [
      'fadein', 'fadeout', 'glitch', 'scanlines', 'vhs', 'static', 'fog',
      'rain', 'snow', 'lightning', 'shake', 'flash', 'pulse', 'blur',
      'sepia', 'invert', 'grayscale'
    ];
    return validEffects.includes(effectName);
  }

  /**
   * Applies mood-based effects.
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

    const effect = moodEffectMap[moodTag];
    if (effect) {
      this.applyEffect(effect, { persistent: true });
    }
  }

  /**
   * Applies special room effects.
   */
  private applySpecialEffects(special: Record<string, unknown>): void {
    // Apply ending-specific effects
    if (special.ending_architect) {
      this.applyEffectSequence([
        { name: 'glitch', delay: 0, config: { duration: 1000 } },
        { name: 'static', delay: 1000, config: { duration: 2000 } },
        { name: 'fadein', delay: 3000 }
      ]);
    }

    if (special.time_distortion) {
      this.applyEffect('vhs', { persistent: true, intensity: 0.7 });
    }

    if (special.reality_break) {
      this.applyEffect('invert', { duration: 3000 });
    }
  }
}

// Export singleton instance
export const visualEffectsManager = VisualEffectsManager.getInstance();
