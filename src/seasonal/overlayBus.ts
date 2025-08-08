// src/seasonal/overlayBus.ts
// Gorstan Game Beta 1
// Event bus for coordinating seasonal overlay display

type OverlayEventHandler = (overlayType: string) => void;

/**
 * Simple event bus for seasonal overlay coordination
 * 
 * Provides a decoupled way for the seasonal controller to request
 * overlay display without direct component coupling.
 */
class OverlayBus {
  private handlers: Map<string, OverlayEventHandler[]> = new Map();

  /**
   * Subscribe to overlay events
   * @param event - Event type ('show', 'hide')
   * @param handler - Callback function
   */
  on(event: string, handler: OverlayEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  /**
   * Unsubscribe from overlay events
   * @param event - Event type
   * @param handler - Callback function to remove
   */
  off(event: string, handler: OverlayEventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit overlay event
   * @param event - Event type
   * @param overlayType - Type of overlay to show/hide
   */
  emit(event: string, overlayType: string): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(overlayType));
    }
  }

  /**
   * Request to show a seasonal overlay
   * @param overlayType - Type of overlay ('christmas', 'easter', 'may13')
   */
  showOverlay(overlayType: string): void {
    console.log('[OverlayBus] Requesting overlay:', overlayType);
    this.emit('show', overlayType);
  }
}

// Export singleton instance
export const overlayBus = new OverlayBus();
