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
