// File: src/components/FrameWrapper.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function FrameWrapper({ children, isWaiting = false }) {
  const borderColorClass = isWaiting
    ? 'border-red-500 animate-pulse'
    : 'border-white';

  return (
    <div className={`border-2 ${borderColorClass} rounded-2xl p-4 shadow-lg bg-gray-800`}>
      {children}
    </div>
  );
}

FrameWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isWaiting: PropTypes.bool,
};
