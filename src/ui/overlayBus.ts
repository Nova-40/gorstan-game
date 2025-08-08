// src/ui/overlayBus.ts
// Simple overlay management system for Gorstan Game Beta 1

import React from 'react';

type OverlayComponent = React.ReactElement;

interface OverlayState {
  current: OverlayComponent | null;
  listeners: Array<(overlay: OverlayComponent | null) => void>;
}

const overlayState: OverlayState = {
  current: null,
  listeners: []
};

/**
 * Show an overlay component
 */
export function showOverlay(component: OverlayComponent): void {
  overlayState.current = component;
  overlayState.listeners.forEach(listener => listener(component));
}

/**
 * Hide the current overlay
 */
export function hideOverlay(): void {
  overlayState.current = null;
  overlayState.listeners.forEach(listener => listener(null));
}

/**
 * Subscribe to overlay changes
 */
export function subscribeToOverlay(listener: (overlay: OverlayComponent | null) => void): () => void {
  overlayState.listeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = overlayState.listeners.indexOf(listener);
    if (index > -1) {
      overlayState.listeners.splice(index, 1);
    }
  };
}

/**
 * Get current overlay (for debugging)
 */
export function getCurrentOverlay(): OverlayComponent | null {
  return overlayState.current;
}
