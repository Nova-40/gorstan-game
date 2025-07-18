// FrameWrapper.tsx
// Visual container for main UI with dynamic border styling
// (c) 2025 Geoffrey Alan Webster
// MIT License

import React from 'react';

interface FrameWrapperProps {
  children: React.ReactNode;
  variant?: 'intro' | 'game' | 'alert';
  isWaiting?: boolean;
  isTrapActive?: boolean;
}

const FrameWrapper: React.FC<FrameWrapperProps> = ({
  children,
  variant = 'game',
  isWaiting = false,
  isTrapActive = false,
}) => {
  let borderClass = 'border-gray-500';

  if (variant === 'intro') {
    borderClass = 'border-green-500';
  } else if (variant === 'game') {
    borderClass = isTrapActive ? 'border-red-600 animate-pulse' : 'border-blue-500';
  }

  const waitingClass = isWaiting ? 'opacity-60 blur-sm' : '';

  return (
    <div className={`frame-wrapper border-4 ${borderClass} m-2 p-2 rounded-xl shadow-lg ${waitingClass}`}>
      {children}
    </div>
  );
};

export default FrameWrapper;



