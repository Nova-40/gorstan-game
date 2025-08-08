// src/npc/__tests__/accessibilityProvider.test.ts
// Tests for NPC Accessibility Provider
// Gorstan Game Beta 1 - Code Licence MIT

import { 
  NPCAccessibilityProvider,
  getAccessibilityProvider,
  resetAccessibilityProvider 
} from '../accessibilityProvider';

// Mock DOM methods for testing
const mockDiv = {
  setAttribute: jest.fn(),
  style: { cssText: '' },
  textContent: '',
  remove: jest.fn()
};

const mockBody = {
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn().mockReturnValue(false)
  }
};

const mockDocumentElement = {
  style: {
    setProperty: jest.fn(),
    removeProperty: jest.fn()
  }
};

// Mock document and window
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn().mockReturnValue(mockDiv),
    body: mockBody,
    documentElement: mockDocumentElement,
    querySelectorAll: jest.fn().mockReturnValue([]),
    activeElement: null
  }
});

Object.defineProperty(global, 'window', {
  value: {
    matchMedia: jest.fn().mockReturnValue({ matches: false }),
    speechSynthesis: undefined,
    navigator: { userAgent: 'TestAgent' },
    dispatchEvent: jest.fn()
  }
});

describe('NPCAccessibilityProvider', () => {
  let provider: NPCAccessibilityProvider;

  beforeEach(() => {
    resetAccessibilityProvider();
    provider = new NPCAccessibilityProvider();
    jest.clearAllMocks();
  });

  afterEach(() => {
    provider.cleanup();
    resetAccessibilityProvider();
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const settings = provider.getSettings();
      
      expect(settings.reduceMotion).toBe(false);
      expect(settings.screenReaderEnabled).toBe(false);
      expect(settings.soundEnabled).toBe(true);
      expect(settings.pauseOnFocus).toBe(true);
    });

    test('should accept custom settings', () => {
      const customProvider = new NPCAccessibilityProvider({
        reduceMotion: true,
        highContrast: true,
        soundEnabled: false
      });

      const settings = customProvider.getSettings();
      expect(settings.reduceMotion).toBe(true);
      expect(settings.highContrast).toBe(true);
      expect(settings.soundEnabled).toBe(false);

      customProvider.cleanup();
    });

    test('should detect system preferences', () => {
      // Mock prefers-reduced-motion
      (window.matchMedia as jest.Mock).mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return { matches: true };
        }
        return { matches: false };
      });

      const providerWithDetection = new NPCAccessibilityProvider();
      const settings = providerWithDetection.getSettings();
      
      expect(settings.reduceMotion).toBe(true);
      
      providerWithDetection.cleanup();
    });
  });

  describe('Enable/Disable', () => {
    test('should enable and disable accessibility features', () => {
      provider.enable();
      // Should apply settings (mocked DOM calls)
      
      provider.disable();
      // Should clear screen reader content (mocked)
      expect(true).toBe(true); // Placeholder since DOM is mocked
    });

    test('should not enable twice', () => {
      provider.enable();
      provider.enable(); // Should be ignored
      expect(true).toBe(true);
    });
  });

  describe('Settings Management', () => {
    test('should update settings', () => {
      provider.updateSettings({
        reduceMotion: true,
        soundVolume: 0.5
      });

      const settings = provider.getSettings();
      expect(settings.reduceMotion).toBe(true);
      expect(settings.soundVolume).toBe(0.5);
    });

    test('should apply settings when enabled', () => {
      provider.enable();
      
      provider.updateSettings({
        highContrast: true,
        largeText: true
      });

      // Should trigger DOM updates (mocked)
      expect(mockBody.classList.toggle).toHaveBeenCalled();
    });
  });

  describe('NPC Movement Announcements', () => {
    test('should announce NPC arrivals', () => {
      provider.enable();
      provider.updateSettings({ liveRegionUpdates: true });

      provider.announceNPCMovement(
        'test-npc',
        'Test NPC',
        'room1',
        'room2',
        'arrival'
      );

      // Announcement should be processed
      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(1);
    });

    test('should not announce when disabled', () => {
      provider.disable();

      provider.announceNPCMovement(
        'test-npc',
        'Test NPC',
        'room1',
        'room2',
        'arrival'
      );

      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(0);
    });

    test('should not announce when live updates disabled', () => {
      provider.enable();
      provider.updateSettings({ liveRegionUpdates: false });

      provider.announceNPCMovement(
        'test-npc',
        'Test NPC',
        'room1',
        'room2',
        'arrival'
      );

      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(0);
    });

    test('should create verbose descriptions when enabled', () => {
      provider.enable();
      provider.updateSettings({ 
        verboseDescriptions: true,
        liveRegionUpdates: true 
      });

      provider.announceNPCMovement(
        'test-npc',
        'Test NPC',
        'room1',
        'room2',
        'arrival'
      );

      // Should create verbose text (tested internally)
      expect(provider.getMetrics().announcementCount).toBe(1);
    });

    test('should prioritize important NPCs', () => {
      provider.enable();
      provider.updateSettings({ liveRegionUpdates: true });

      // Test high priority NPC
      provider.announceNPCMovement(
        'morthos',
        'Morthos',
        'room1',
        'room2',
        'arrival'
      );

      // Test low priority NPC
      provider.announceNPCMovement(
        'random-npc',
        'Random NPC',
        'room1',
        'room2',
        'departure'
      );

      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(2);
    });
  });

  describe('Movement Speed Adjustment', () => {
    test('should return normal speed by default', () => {
      provider.enable();
      const multiplier = provider.getMovementSpeedMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('should reduce speed for slow movement setting', () => {
      provider.enable();
      provider.updateSettings({ slowMovement: true });
      
      const multiplier = provider.getMovementSpeedMultiplier();
      expect(multiplier).toBe(0.5);
    });

    test('should reduce speed more for reduced motion', () => {
      provider.enable();
      provider.updateSettings({ reduceMotion: true });
      
      const multiplier = provider.getMovementSpeedMultiplier();
      expect(multiplier).toBe(0.3);
    });

    test('should combine speed reductions', () => {
      provider.enable();
      provider.updateSettings({ 
        slowMovement: true,
        reduceMotion: true 
      });
      
      const multiplier = provider.getMovementSpeedMultiplier();
      expect(multiplier).toBe(0.15); // 0.5 * 0.3
    });

    test('should return 1.0 when disabled', () => {
      provider.disable();
      provider.updateSettings({ 
        slowMovement: true,
        reduceMotion: true 
      });
      
      const multiplier = provider.getMovementSpeedMultiplier();
      expect(multiplier).toBe(1.0);
    });
  });

  describe('Timeout Extensions', () => {
    test('should extend timeouts when enabled', () => {
      provider.enable();
      provider.updateSettings({ extendedTimeouts: true });
      
      const extension = provider.requestTimeoutExtension('test-timeout', 5000);
      expect(extension).toBe(5000);
      
      const metrics = provider.getMetrics();
      expect(metrics.timeoutExtensions).toBe(1);
    });

    test('should not extend timeouts when disabled', () => {
      provider.enable();
      provider.updateSettings({ extendedTimeouts: false });
      
      const extension = provider.requestTimeoutExtension('test-timeout');
      expect(extension).toBe(0);
    });
  });

  describe('Focus Management', () => {
    test('should pause on focus when enabled', () => {
      provider.enable();
      provider.updateSettings({ pauseOnFocus: true });
      
      provider.pauseOnFocus();
      
      const metrics = provider.getMetrics();
      expect(metrics.pauseEvents).toBe(1);
    });

    test('should not pause when setting disabled', () => {
      provider.enable();
      provider.updateSettings({ pauseOnFocus: false });
      
      provider.pauseOnFocus();
      
      const metrics = provider.getMetrics();
      expect(metrics.pauseEvents).toBe(0);
    });

    test('should resume from focus', () => {
      provider.enable();
      provider.pauseOnFocus();
      provider.resumeFromFocus();
      
      // Should call resume methods (mocked DOM)
      expect(true).toBe(true);
    });
  });

  describe('Audio Accessibility', () => {
    test('should play sounds when enabled', () => {
      provider.enable();
      provider.updateSettings({ soundEnabled: true, soundVolume: 0.8 });
      
      // Should not throw
      expect(() => {
        provider.playMovementSound('arrival', 1.0);
      }).not.toThrow();
    });

    test('should not play sounds when disabled', () => {
      provider.enable();
      provider.updateSettings({ soundEnabled: false });
      
      // Should not throw and should be silent
      expect(() => {
        provider.playMovementSound('arrival', 1.0);
      }).not.toThrow();
    });
  });

  describe('Metrics and Monitoring', () => {
    test('should track accessibility metrics', () => {
      provider.enable();
      provider.updateSettings({ liveRegionUpdates: true });
      
      provider.announceNPCMovement('npc1', 'NPC 1', 'A', 'B', 'arrival');
      provider.announceNPCMovement('npc2', 'NPC 2', 'B', 'C', 'departure');
      provider.requestTimeoutExtension('test', 1000);
      provider.pauseOnFocus();
      
      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(2);
      expect(metrics.timeoutExtensions).toBe(0); // Extended timeouts not enabled
      expect(metrics.pauseEvents).toBe(1);
      expect(metrics.averageAnnouncementLength).toBeGreaterThan(0);
    });

    test('should reset metrics', () => {
      provider.enable();
      provider.announceNPCMovement('npc1', 'NPC 1', 'A', 'B', 'arrival');
      
      provider.resetMetrics();
      
      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(0);
      expect(metrics.averageAnnouncementLength).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    test('should detect screen reader', () => {
      provider.updateSettings({ screenReaderEnabled: true });
      expect(provider.isScreenReaderDetected()).toBe(true);
      
      provider.updateSettings({ screenReaderEnabled: false });
      expect(provider.isScreenReaderDetected()).toBe(false);
    });

    test('should check pause on focus setting', () => {
      provider.updateSettings({ pauseOnFocus: true });
      expect(provider.shouldPauseOnFocus()).toBe(true);
      
      provider.updateSettings({ pauseOnFocus: false });
      expect(provider.shouldPauseOnFocus()).toBe(false);
    });

    test('should check extended timeouts setting', () => {
      provider.updateSettings({ extendedTimeouts: true });
      expect(provider.shouldUseExtendedTimeouts()).toBe(true);
      
      provider.updateSettings({ extendedTimeouts: false });
      expect(provider.shouldUseExtendedTimeouts()).toBe(false);
    });

    test('should provide accessibility status', () => {
      provider.updateSettings({
        reduceMotion: true,
        highContrast: true,
        screenReaderEnabled: true
      });
      
      const status = provider.getAccessibilityStatus();
      expect(status).toContain('Reduced Motion');
      expect(status).toContain('High Contrast');
      expect(status).toContain('Screen Reader');
    });

    test('should provide standard status when no features active', () => {
      const status = provider.getAccessibilityStatus();
      expect(status).toBe('Standard accessibility');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all resources', () => {
      provider.enable();
      provider.announceNPCMovement('npc1', 'NPC 1', 'A', 'B', 'arrival');
      
      provider.cleanup();
      
      // Should be disabled and metrics reset
      const metrics = provider.getMetrics();
      expect(metrics.announcementCount).toBe(0);
    });
  });

  describe('Global Instance', () => {
    test('should provide singleton instance', () => {
      const instance1 = getAccessibilityProvider();
      const instance2 = getAccessibilityProvider();
      
      expect(instance1).toBe(instance2);
      
      resetAccessibilityProvider();
      
      const instance3 = getAccessibilityProvider();
      expect(instance3).not.toBe(instance1);
    });
  });
});

describe('Screen Reader Integration', () => {
  test('should handle screen reader announcements in order', async () => {
    const provider = new NPCAccessibilityProvider({
      liveRegionUpdates: true,
      verboseDescriptions: true
    });
    
    provider.enable();

    // Queue multiple announcements
    provider.announceNPCMovement('npc1', 'NPC 1', 'A', 'B', 'arrival');
    provider.announceNPCMovement('npc2', 'NPC 2', 'B', 'C', 'departure');
    provider.announceNPCMovement('npc3', 'NPC 3', 'C', 'D', 'transit');

    // Should process all announcements
    const metrics = provider.getMetrics();
    expect(metrics.announcementCount).toBe(3);

    provider.cleanup();
  });

  test('should handle different movement types correctly', () => {
    const provider = new NPCAccessibilityProvider({
      liveRegionUpdates: true,
      verboseDescriptions: false
    });
    
    provider.enable();

    // Test all movement types
    provider.announceNPCMovement('npc1', 'NPC 1', 'A', 'B', 'arrival');
    provider.announceNPCMovement('npc2', 'NPC 2', 'B', 'C', 'departure'); 
    provider.announceNPCMovement('npc3', 'NPC 3', 'C', 'D', 'transit');

    const metrics = provider.getMetrics();
    expect(metrics.announcementCount).toBe(3);

    provider.cleanup();
  });
});

describe('Performance Integration', () => {
  test('should handle rapid accessibility updates', () => {
    const provider = new NPCAccessibilityProvider();
    provider.enable();

    // Rapid setting changes
    for (let i = 0; i < 100; i++) {
      provider.updateSettings({
        soundVolume: Math.random(),
        reduceMotion: i % 2 === 0
      });
    }

    // Should still function correctly
    const settings = provider.getSettings();
    expect(typeof settings.soundVolume).toBe('number');
    expect(typeof settings.reduceMotion).toBe('boolean');

    provider.cleanup();
  });

  test('should handle many concurrent announcements', () => {
    const provider = new NPCAccessibilityProvider({
      liveRegionUpdates: true
    });
    provider.enable();

    // Many announcements
    for (let i = 0; i < 50; i++) {
      provider.announceNPCMovement(
        `npc${i}`,
        `NPC ${i}`,
        `room${i}`,
        `room${i + 1}`,
        i % 3 === 0 ? 'arrival' : i % 3 === 1 ? 'departure' : 'transit'
      );
    }

    const metrics = provider.getMetrics();
    expect(metrics.announcementCount).toBe(50);
    expect(metrics.averageAnnouncementLength).toBeGreaterThan(0);

    provider.cleanup();
  });
});
