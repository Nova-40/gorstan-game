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
