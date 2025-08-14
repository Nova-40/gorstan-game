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

// src/npc/accessibilityProvider.ts

/**
 * Accessibility features and inclusive design for NPC systems
 */

// ===== ACCESSIBILITY TYPES =====

export interface AccessibilitySettings {
  // Visual accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;

  // Audio accessibility
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  spatialAudio: boolean;

  // Cognitive accessibility
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  confirmationPrompts: boolean;

  // Motor accessibility
  pauseOnFocus: boolean;
  slowMovement: boolean;
  clickToMove: boolean;

  // Screen reader support
  screenReaderEnabled: boolean;
  verboseDescriptions: boolean;
  liveRegionUpdates: boolean;

  // Text accessibility
  textScaling: boolean; // Enable or disable text scaling
}

export interface NPCMovementAnnouncement {
  npcId: string;
  npcName: string;
  fromRoom: string;
  toRoom: string;
  movementType: "arrival" | "departure" | "transit";
  priority: "low" | "medium" | "high";
  description: string;
  screenReaderText: string;
}

export interface AccessibilityMetrics {
  announcementCount: number;
  averageAnnouncementLength: number;
  screenReaderInteractions: number;
  pauseEvents: number;
  timeoutExtensions: number;
}

// ===== SCREEN READER SUPPORT =====

class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;
  private politeRegion: HTMLElement | null = null;
  private announceQueue: NPCMovementAnnouncement[] = [];
  private isProcessing = false;

  constructor() {
    this.createLiveRegions();
  }

  private createLiveRegions(): void {
    if (typeof document === "undefined") {return;}

    // Assertive region for important announcements
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "assertive");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.setAttribute("class", "sr-only");
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.liveRegion);

    // Polite region for less urgent announcements
    this.politeRegion = document.createElement("div");
    this.politeRegion.setAttribute("aria-live", "polite");
    this.politeRegion.setAttribute("aria-atomic", "true");
    this.politeRegion.setAttribute("class", "sr-only");
    this.politeRegion.style.cssText = this.liveRegion.style.cssText;
    document.body.appendChild(this.politeRegion);
  }

  announce(announcement: NPCMovementAnnouncement): void {
    this.announceQueue.push(announcement);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.announceQueue.length === 0) {return;}

    this.isProcessing = true;

    while (this.announceQueue.length > 0) {
      const announcement = this.announceQueue.shift()!;
      await this.speakAnnouncement(announcement);

      // Wait between announcements to avoid overwhelming
      await this.delay(500);
    }

    this.isProcessing = false;
  }

  private async speakAnnouncement(
    announcement: NPCMovementAnnouncement,
  ): Promise<void> {
    const region =
      announcement.priority === "high" ? this.liveRegion : this.politeRegion;
    if (!region) {return;}

    // Clear previous content
    region.textContent = "";

    // Wait a frame to ensure clearing is processed
    await this.delay(50);

    // Set new content
    region.textContent = announcement.screenReaderText;

    console.log(`[ScreenReader] Announced: ${announcement.screenReaderText}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clear(): void {
    this.announceQueue.length = 0;
    if (this.liveRegion) {this.liveRegion.textContent = "";}
    if (this.politeRegion) {this.politeRegion.textContent = "";}
  }

  cleanup(): void {
    this.clear();
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
  }
}

// ===== REDUCED MOTION SUPPORT =====

class MotionReducer {
  private originalAnimationSpeed = 1.0;

  applyReducedMotion(enabled: boolean): void {
    if (typeof document === "undefined") {return;}

    const root = document.documentElement;

    if (enabled) {
      // Reduce or disable animations
      root.style.setProperty("--animation-duration-scale", "0.1");
      root.style.setProperty("--transition-duration-scale", "0.1");

      // Add reduced motion class for CSS targeting
      document.body.classList.add("reduced-motion");

      console.log("[MotionReducer] Reduced motion enabled");
    } else {
      // Restore normal animations
      root.style.removeProperty("--animation-duration-scale");
      root.style.removeProperty("--transition-duration-scale");

      document.body.classList.remove("reduced-motion");

      console.log("[MotionReducer] Normal motion restored");
    }
  }

  getAnimationDurationMultiplier(): number {
    return document.body.classList.contains("reduced-motion") ? 0.1 : 1.0;
  }
}

// ===== TIMEOUT EXTENSION SYSTEM =====

class TimeoutExtender {
  private extensions: Map<string, number> = new Map();
  private defaultExtensionMs = 10000; // 10 seconds

  extendTimeout(timeoutId: string, additionalMs?: number): number {
    const extension = additionalMs || this.defaultExtensionMs;
    const currentExtension = this.extensions.get(timeoutId) || 0;
    const newExtension = currentExtension + extension;

    this.extensions.set(timeoutId, newExtension);

    console.log(
      `[TimeoutExtender] Extended timeout ${timeoutId} by ${extension}ms (total: ${newExtension}ms)`,
    );

    return newExtension;
  }

  getTimeoutExtension(timeoutId: string): number {
    return this.extensions.get(timeoutId) || 0;
  }

  clearExtension(timeoutId: string): void {
    this.extensions.delete(timeoutId);
  }

  clearAllExtensions(): void {
    this.extensions.clear();
  }
}

// ===== FOCUS MANAGEMENT =====

class FocusManager {
  private pausedElements: Set<string> = new Set();
  private originalTabIndices: Map<Element, string> = new Map();
  private eventRemovals: Array<() => void> = [];

  pauseInteractiveElements(): void {
    if (typeof document === "undefined") {return;}

    const interactiveElements = document.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
    );

    interactiveElements.forEach((element) => {
      // Store original tabindex
      const currentTabIndex = element.getAttribute("tabindex");
      this.originalTabIndices.set(element, currentTabIndex || "");

      // Disable tab navigation
      element.setAttribute("tabindex", "-1");
      element.classList.add("accessibility-paused");
    });

    console.log(
      `[FocusManager] Paused ${interactiveElements.length} interactive elements`,
    );
  }

  resumeInteractiveElements(): void {
    if (typeof document === "undefined") {return;}

    this.originalTabIndices.forEach((originalTabIndex, element) => {
      if (originalTabIndex === "") {
        element.removeAttribute("tabindex");
      } else {
        element.setAttribute("tabindex", originalTabIndex);
      }
      element.classList.remove("accessibility-paused");
    });

    this.originalTabIndices.clear();
    console.log("[FocusManager] Resumed interactive elements");
  }

  trapFocus(container: Element): void {
    if (typeof document === "undefined") {return;}

    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) {return;}

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key !== "Tab") {return;}

      if (keyboardEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          keyboardEvent.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          keyboardEvent.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    // Store cleanup function instead of returning it
    this.eventRemovals.push(() => {
      container.removeEventListener("keydown", handleTabKey);
    });
  }

  cleanup(): void {
    // Remove all event listeners
    this.eventRemovals.forEach((cleanup) => cleanup());
    this.eventRemovals = [];

    // Clear other data
    this.pausedElements.clear();
    this.originalTabIndices.clear();
  }
}

// ===== MAIN ACCESSIBILITY PROVIDER =====

export class NPCAccessibilityProvider {
  private settings: AccessibilitySettings;
  private metrics: AccessibilityMetrics;
  private screenReader: ScreenReaderAnnouncer;
  private motionReducer: MotionReducer;
  private timeoutExtender: TimeoutExtender;
  private focusManager: FocusManager;
  private isEnabled = false;

  constructor(settings: Partial<AccessibilitySettings> = {}) {
    this.settings = {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      soundEnabled: true,
      soundVolume: 0.7,
      spatialAudio: false,
      simplifiedInterface: false,
      extendedTimeouts: false,
      confirmationPrompts: false,
      pauseOnFocus: true,
      slowMovement: false,
      clickToMove: false,
      screenReaderEnabled: false,
      verboseDescriptions: false,
      liveRegionUpdates: true,
      textScaling: false, // Default value for text scaling
      ...settings,
    };

    this.metrics = {
      announcementCount: 0,
      averageAnnouncementLength: 0,
      screenReaderInteractions: 0,
      pauseEvents: 0,
      timeoutExtensions: 0,
    };

    this.screenReader = new ScreenReaderAnnouncer();
    this.motionReducer = new MotionReducer();
    this.timeoutExtender = new TimeoutExtender();
    this.focusManager = new FocusManager();

    this.detectSystemPreferences();
  }

  // ===== INITIALIZATION =====

  enable(): void {
    if (this.isEnabled) {return;}

    this.isEnabled = true;
    this.applySettings();

    console.log("[AccessibilityProvider] Accessibility features enabled");
  }

  disable(): void {
    if (!this.isEnabled) {return;}

    this.isEnabled = false;
    this.screenReader.clear();
    this.motionReducer.applyReducedMotion(false);
    this.focusManager.resumeInteractiveElements();

    console.log("[AccessibilityProvider] Accessibility features disabled");
  }

  // ===== SETTINGS MANAGEMENT =====

  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (this.isEnabled) {
      this.applySettings();
    }
  }

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  private applySettings(): void {
    this.motionReducer.applyReducedMotion(this.settings.reduceMotion);

    if (typeof document !== "undefined") {
      document.body.classList.toggle(
        "high-contrast",
        this.settings.highContrast,
      );
      document.body.classList.toggle("large-text", this.settings.largeText);
      document.body.classList.toggle(
        "simplified-interface",
        this.settings.simplifiedInterface,
      );
    }
  }

  private detectSystemPreferences(): void {
    if (typeof window === "undefined") {return;}

    // Detect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.settings.reduceMotion = true;
    }

    // Detect prefers-contrast
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      this.settings.highContrast = true;
    }

    // Detect screen reader
    if (
      window.speechSynthesis ||
      (window as any).navigator?.userAgent?.includes("NVDA")
    ) {
      this.settings.screenReaderEnabled = true;
    }
  }

  // ===== NPC MOVEMENT ANNOUNCEMENTS =====

  announceNPCMovement(
    npcId: string,
    npcName: string,
    fromRoom: string,
    toRoom: string,
    movementType: "arrival" | "departure" | "transit",
  ): void {
    if (!this.isEnabled || !this.settings.liveRegionUpdates) {return;}

    const announcement: NPCMovementAnnouncement = {
      npcId,
      npcName,
      fromRoom,
      toRoom,
      movementType,
      priority: this.determineAnnouncementPriority(npcId, movementType),
      description: this.createMovementDescription(
        npcName,
        fromRoom,
        toRoom,
        movementType,
      ),
      screenReaderText: this.createScreenReaderText(
        npcName,
        fromRoom,
        toRoom,
        movementType,
      ),
    };

    this.screenReader.announce(announcement);
    this.updateAnnouncementMetrics(announcement);
  }

  private determineAnnouncementPriority(
    npcId: string,
    movementType: string,
  ): "low" | "medium" | "high" {
    // Important NPCs get higher priority
    const importantNPCs = ["morthos", "al_escape_artist", "polly"];
    if (importantNPCs.includes(npcId)) {return "high";}

    // Arrivals are more important than departures
    if (movementType === "arrival") {return "medium";}

    return "low";
  }

  private createMovementDescription(
    npcName: string,
    fromRoom: string,
    toRoom: string,
    movementType: string,
  ): string {
    switch (movementType) {
      case "arrival":
        return `${npcName} has arrived`;
      case "departure":
        return `${npcName} has left for ${toRoom}`;
      case "transit":
        return `${npcName} is moving from ${fromRoom} to ${toRoom}`;
      default:
        return `${npcName} has moved`;
    }
  }

  private createScreenReaderText(
    npcName: string,
    fromRoom: string,
    toRoom: string,
    movementType: string,
  ): string {
    if (!this.settings.verboseDescriptions) {
      return this.createMovementDescription(
        npcName,
        fromRoom,
        toRoom,
        movementType,
      );
    }

    switch (movementType) {
      case "arrival":
        return `Non-player character ${npcName} has arrived in your current location. You may interact with them.`;
      case "departure":
        return `Non-player character ${npcName} has departed from your location and moved to ${toRoom}.`;
      case "transit":
        return `Non-player character ${npcName} is traveling from ${fromRoom} to ${toRoom}.`;
      default:
        return `Non-player character ${npcName} has changed location.`;
    }
  }

  private updateAnnouncementMetrics(
    announcement: NPCMovementAnnouncement,
  ): void {
    this.metrics.announcementCount++;

    const length = announcement.screenReaderText.length;
    this.metrics.averageAnnouncementLength =
      (this.metrics.averageAnnouncementLength *
        (this.metrics.announcementCount - 1) +
        length) /
      this.metrics.announcementCount;
  }

  // ===== PAUSE/RESUME FUNCTIONALITY =====

  pauseOnFocus(): void {
    if (!this.settings.pauseOnFocus) {return;}

    this.focusManager.pauseInteractiveElements();
    this.metrics.pauseEvents++;

    console.log("[AccessibilityProvider] Paused on focus");
  }

  resumeFromFocus(): void {
    this.focusManager.resumeInteractiveElements();
    console.log("[AccessibilityProvider] Resumed from focus");
  }

  // ===== TIMEOUT EXTENSIONS =====

  requestTimeoutExtension(timeoutId: string, additionalMs?: number): number {
    if (!this.settings.extendedTimeouts) {return 0;}

    const extension = this.timeoutExtender.extendTimeout(
      timeoutId,
      additionalMs,
    );
    this.metrics.timeoutExtensions++;

    return extension;
  }

  // ===== MOVEMENT SPEED ADJUSTMENT =====

  getMovementSpeedMultiplier(): number {
    if (!this.isEnabled) {return 1.0;}

    let multiplier = 1.0;

    if (this.settings.slowMovement) {
      multiplier *= 0.5; // 50% slower
    }

    if (this.settings.reduceMotion) {
      multiplier *= 0.3; // Much slower for reduced motion
    }

    return multiplier;
  }

  // ===== AUDIO ACCESSIBILITY =====

  playMovementSound(soundType: "arrival" | "departure", volume?: number): void {
    if (!this.settings.soundEnabled) {return;}

    const effectiveVolume = (volume || 1.0) * this.settings.soundVolume;

    // This would integrate with your audio system
    console.log(
      `[AccessibilityProvider] Playing ${soundType} sound at volume ${effectiveVolume}`,
    );
  }

  // ===== METRICS AND MONITORING =====

  getMetrics(): AccessibilityMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      announcementCount: 0,
      averageAnnouncementLength: 0,
      screenReaderInteractions: 0,
      pauseEvents: 0,
      timeoutExtensions: 0,
    };
  }

  // ===== CLEANUP =====

  cleanup(): void {
    this.disable();
    this.screenReader.cleanup();
    this.timeoutExtender.clearAllExtensions();
    this.resetMetrics();

    console.log("[AccessibilityProvider] Cleanup completed");
  }

  // ===== UTILITY METHODS =====

  isScreenReaderDetected(): boolean {
    return this.settings.screenReaderEnabled;
  }

  shouldPauseOnFocus(): boolean {
    return this.settings.pauseOnFocus;
  }

  shouldUseExtendedTimeouts(): boolean {
    return this.settings.extendedTimeouts;
  }

  getAccessibilityStatus(): string {
    const activeFeatures = [];

    if (this.settings.reduceMotion) {activeFeatures.push("Reduced Motion");}
    if (this.settings.highContrast) {activeFeatures.push("High Contrast");}
    if (this.settings.screenReaderEnabled) {activeFeatures.push("Screen Reader");}
    if (this.settings.extendedTimeouts)
      {activeFeatures.push("Extended Timeouts");}
    if (this.settings.pauseOnFocus) {activeFeatures.push("Pause on Focus");}

    return activeFeatures.length > 0
      ? `Accessibility enabled: ${activeFeatures.join(", ")}`
      : "Standard accessibility";
  }
}

// ===== GLOBAL INSTANCE =====

let globalAccessibilityProvider: NPCAccessibilityProvider | null = null;

export function getAccessibilityProvider(): NPCAccessibilityProvider {
  if (!globalAccessibilityProvider) {
    globalAccessibilityProvider = new NPCAccessibilityProvider();
    globalAccessibilityProvider.enable();
  }
  return globalAccessibilityProvider;
}

export function resetAccessibilityProvider(): void {
  if (globalAccessibilityProvider) {
    globalAccessibilityProvider.cleanup();
    globalAccessibilityProvider = null;
  }
}
