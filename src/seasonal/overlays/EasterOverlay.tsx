// src/seasonal/overlays/EasterOverlay.tsx
// Gorstan Game Beta 1
// Easter seasonal overlay with accessibility

import React from 'react';
import BaseDialog from '../a11y/BaseDialog';

export interface EasterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * EasterOverlay - Spring Easter celebration overlay
 * 
 * Features:
 * - Accessible dialog with focus management
 * - Motion-safe animations
 * - Easter themed content
 * - ESC key handling
 */
export const EasterOverlay: React.FC<EasterOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <BaseDialog
      onClose={onClose}
      title="🐰 Easter Celebration"
    >
      <div className="seasonal-content">
        <div className="seasonal-icon text-3xl mb-4">🐰🥚🌷</div>
        <h2 className="text-xl font-bold mb-4">Happy Easter!</h2>
        <p className="mb-4">
          Spring has arrived in Gorstan! A time of renewal, discovery, and new beginnings.
          Like hidden Easter eggs waiting to be found, mysteries await your discovery
          throughout the game world.
        </p>
        <p className="mb-6 italic">
          May your journey be filled with wonder and surprise! 🌸
        </p>
        <button 
          className="seasonal-close-btn px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
          onClick={onClose}
          autoFocus
        >
          Continue Adventure
        </button>
      </div>
    </BaseDialog>
  );
};
