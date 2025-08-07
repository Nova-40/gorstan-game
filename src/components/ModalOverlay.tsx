// src/components/ModalOverlay.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect } from 'react';
import { XCircle } from 'lucide-react';
import '../styles/ModalOverlay.css';

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ isOpen, onClose, children }) => {
// React effect hook
  useEffect(() => {
// Variable declaration
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

// JSX return block or main return
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

// JSX return block or main return
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose} aria-label="Close">
          <XCircle size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalOverlay;
