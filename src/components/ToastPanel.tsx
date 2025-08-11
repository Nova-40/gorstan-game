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

// Gorstan and characters (c) Geoff Webster 2025
// Toast notification panel component

import React, { useEffect } from 'react';

type ToastPanelProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClear: () => void;
};

const styleMap: Record<'success' | 'error' | 'info', string> = {
  success: 'bg-green-700',
  error: 'bg-red-700',
  info: 'bg-blue-700',
};

export default function ToastPanel({ message, type = 'info', onClear }: ToastPanelProps) {
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => {
        onClear();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white z-50 ${styleMap[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClear}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
