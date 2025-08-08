// src/seasonal/overlays/ChristmasOverlay.tsx
// Gorstan Game Beta 1
// Christmas seasonal overlay with accessibility

import React from 'react';
import BaseDialog from '../a11y/BaseDialog';

export interface ChristmasOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChristmasOverlay - Festive Christmas Day overlay
 * 
 * Features:
 * - Accessible dialog with focus management
 * - Motion-safe animations
 * - Christmas themed content
 * - ESC key handling
 */
export const ChristmasOverlay: React.FC<ChristmasOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <BaseDialog
      onClose={onClose}
      title="🎄 Christmas Day"
    >
      <div className="seasonal-content">
        <div className="seasonal-icon text-3xl mb-4">🎄🎁🎅</div>
        <h2 className="text-xl font-bold mb-4">Merry Christmas!</h2>
        <p className="mb-4">
          The author wishes you joy, wonder, and the magic of discovery this Christmas Day.
          May your adventures in Gorstan be filled with as much mystery and delight
          as the season itself.
        </p>
        <p className="mb-6 italic">
          From the author's desk to your screen - Happy Christmas! 🎄
        </p>
        <button 
          className="seasonal-close-btn px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
          onClick={onClose}
          autoFocus
        >
          Continue Adventure
        </button>
      </div>
    </BaseDialog>
  );
};
