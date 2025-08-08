// src/seasonal/overlays/May13Overlay.tsx
// Gorstan Game Beta 1
// May 13 (author's birthday) seasonal overlay with accessibility

import React from 'react';
import BaseDialog from '../a11y/BaseDialog';

export interface May13OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * May13Overlay - Author's birthday celebration overlay
 * 
 * Features:
 * - Accessible dialog with focus management
 * - Motion-safe animations
 * - Birthday themed content
 * - ESC key handling
 * - Triggers post-overlay NPC banter
 */
export const May13Overlay: React.FC<May13OverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <BaseDialog
      onClose={onClose}
      title="🎂 May 13th"
    >
      <div className="seasonal-content">
        <div className="seasonal-icon text-3xl mb-4">🎂🎉📝</div>
        <h2 className="text-xl font-bold mb-4">Author's Birthday!</h2>
        <p className="mb-4">
          Today marks another year in the life of Gorstan's creator.
          What are the odds that you'd be playing on this very day?
          Suspiciously high, one might say...
        </p>
        <p className="mb-4">
          Thank you for being part of this adventure. Every player who discovers
          these hidden moments makes the story richer and more alive.
        </p>
        <p className="mb-6 italic">
          Here's to more stories, more mysteries, and more magic! 🌟
        </p>
        <button 
          className="seasonal-close-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          onClick={onClose}
          autoFocus
        >
          Continue Adventure
        </button>
      </div>
    </BaseDialog>
  );
};
