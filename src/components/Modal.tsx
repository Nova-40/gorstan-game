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

// (c) Geoff Webster 2025

import React, { useEffect, useCallback, useMemo } from "react";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  timeout?: number; // in ms
  children: React.ReactNode;
  title?: string;
  pinned?: boolean; // disable auto-close
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  timeout = 4000,
  children,
  title,
  pinned = false,
}) => {
  // Memoized auto-close logic
  const handleAutoClose = useCallback(() => {
    if (!visible || pinned) {return;}
    const timer = setTimeout(onClose, timeout);
    return () => clearTimeout(timer);
  }, [visible, timeout, onClose, pinned]);

  useEffect(handleAutoClose, [handleAutoClose]);

  // Memoized modal content to prevent unnecessary re-renders
  const modalContent = useMemo(
    () => (
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
    ),
    [title, pinned, onClose, children],
  );

  if (!visible) {return null;}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {modalContent}
    </div>
  );
};

export default React.memo(Modal);
