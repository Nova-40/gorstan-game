// src/components/Modal.tsx
// Gorstan Game Beta 1 - Modal Component
// Code Licence MIT
// (c) Geoff Webster 2025

import React, { useEffect } from "react";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  timeout?: number; // in ms
  children: React.ReactNode;
  title?: string;
  pinned?: boolean; // disable auto-close
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, timeout = 4000, children, title, pinned = false }) => {
  useEffect(() => {
    if (!visible || pinned) return;
    const timer = setTimeout(onClose, timeout);
    return () => clearTimeout(timer);
  }, [visible, timeout, onClose, pinned]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black max-w-lg w-full rounded-2xl shadow-lg p-6 relative min-w-[300px]">
        <div className="flex justify-between items-start">
          {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
          <div className="flex items-center space-x-2">
            {pinned && <span className="text-sm text-gray-500">📌 Pinned</span>}
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
