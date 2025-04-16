/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Shared modal component for overlays.
 */

// Modal.jsx – Simple Modal Component (no dependencies)
// (c) Geoff Webster – Gorstan Game Engine

import React from 'react';

export default function Modal({ show, onClose, children }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="bg-gray-900 border border-indigo-600 rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-white text-lg hover:text-red-400"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
