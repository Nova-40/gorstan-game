// File: src/components/frameWrapper.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// FrameWrapper component for Gorstan game.
// Provides a consistent styled border and background for wrapped UI elements.
// Optionally highlights the border if the isWaiting prop is true.

import React from 'react';
import PropTypes from 'prop-types';

/**
 * FrameWrapper
 * Wraps child components in a styled frame with optional animated border.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The content to render inside the frame.
 * @param {boolean} [props.isWaiting=false] - If true, shows a red animated border to indicate waiting state.
 * @returns {JSX.Element}
 */
const FrameWrapper = ({ children, isWaiting = false }) => {
  // Determine border color and animation based on waiting state
  const borderColorClass = isWaiting
    ? 'border-red-500 animate-pulse'
    : 'border-white';

  return (
    <div className={`border-2 ${borderColorClass} rounded-2xl p-4 shadow-lg bg-gray-800`}>
      {children}
    </div>
  );
};

FrameWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isWaiting: PropTypes.bool,
};

// Export the FrameWrapper component for use in the main application
export default FrameWrapper;
