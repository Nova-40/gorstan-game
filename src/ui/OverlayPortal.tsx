// src/ui/OverlayPortal.tsx
// Overlay portal component for rendering modals/overlays - Gorstan Game Beta 1

import React, { useEffect, useState } from 'react';
import { subscribeToOverlay } from './overlayBus';

export function OverlayPortal() {
  const [currentOverlay, setCurrentOverlay] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToOverlay((overlay) => {
      setCurrentOverlay(overlay);
    });

    return unsubscribe;
  }, []);

  if (!currentOverlay) return null;

  return currentOverlay;
}

export default OverlayPortal;
