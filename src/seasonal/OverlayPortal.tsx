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

// src/seasonal/OverlayPortal.tsx
// Gorstan Game Beta 1
// Modal portal for seasonal overlays with accessibility and motion preferences

import React, { useEffect, useState } from 'react';
import { overlayBus } from './overlayBus';
import { ChristmasOverlay } from './overlays/ChristmasOverlay';
import { EasterOverlay } from './overlays/EasterOverlay';
import { May13Overlay } from './overlays/May13Overlay';

export interface SeasonalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * OverlayPortal - Manages seasonal overlay display and modal state
 * 
 * Features:
 * - Event bus integration for overlay triggers
 * - Accessibility compliance with focus management
 * - Motion preference respecting animations
 * - React portal for proper z-index layering
 */
export const OverlayPortal: React.FC = () => {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  useEffect(() => {
    const handleOverlayRequest = (overlayType: string) => {
      console.log('[OverlayPortal] Showing overlay:', overlayType);
      setActiveOverlay(overlayType);
    };

    // Subscribe to overlay bus events
    overlayBus.on('show', handleOverlayRequest);

    // Cleanup subscription
    return () => {
      overlayBus.off('show', handleOverlayRequest);
    };
  }, []);

  const handleClose = () => {
    console.log('[OverlayPortal] Closing overlay:', activeOverlay);
    setActiveOverlay(null);
  };

  // Render appropriate overlay component
  const renderOverlay = () => {
    const commonProps = {
      isOpen: Boolean(activeOverlay),
      onClose: handleClose
    };

    switch (activeOverlay) {
      case 'christmas':
        return <ChristmasOverlay {...commonProps} />;
      case 'easter':
        return <EasterOverlay {...commonProps} />;
      case 'may13':
        return <May13Overlay {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {activeOverlay && renderOverlay()}
    </>
  );
};
