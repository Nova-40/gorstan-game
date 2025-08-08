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
