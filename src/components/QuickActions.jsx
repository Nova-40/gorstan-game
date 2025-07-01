// File: src/components/QuickActions.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// QuickActions component for Gorstan game.
// Provides a panel of quick-access buttons for movement and common actions.
// Buttons are grouped into directional controls and context-sensitive actions.

import React from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftCircle,
  ArrowRightCircle,
  Backpack,
  Eye,
  Hand,
  HelpCircle,
  Move3D,
  Undo,
  Armchair,
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * IconButton
 * Renders a single icon button with a tooltip label.
 *
 * @param {Object} props - Component props.
 * @param {React.Component} props.Icon - Lucide icon component to render.
 * @param {string} props.label - Tooltip label for the button.
 * @param {Function} props.onClick - Click handler for the button.
 * @param {boolean} [props.active=true] - Whether the button is active.
 * @param {boolean} [props.animate=false] - Whether to animate the button.
 * @returns {JSX.Element}
 */
const IconButton = ({ Icon, label, onClick, active = true, animate = false }) => (
  <div className={`group relative m-1 transition-opacity ${animate ? 'animate-fade-in' : ''}`}>
    <button
      onClick={onClick}
      className={`p-1 ${active ? 'text-green-400' : 'text-gray-500 opacity-40'} hover:scale-110 transition-transform`}
      aria-label={label}
      type="button"
    >
      <Icon className="w-6 h-6" />
    </button>
    <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 hidden group-hover:block text-[10px] text-white bg-black bg-opacity-80 px-1.5 py-0.5 rounded whitespace-nowrap z-50">
      {label}
    </span>
  </div>
);

IconButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  animate: PropTypes.bool,
};

/**
 * QuickActions
 * Renders a panel of quick-access buttons for movement and common actions.
 * Directional controls are always shown; action buttons may be context-sensitive.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onDirection - Callback for directional movement actions.
 * @param {Function} props.onQuickAction - Callback for quick toolbar actions.
 * @param {Function} props.onSlip - Callback for the "Slip" action.
 * @param {Function} props.onRewind - Callback for the "Rewind" action.
 * @param {Function} props.onSit - Callback for the "Sit Down" action.
 * @param {boolean} [props.canSit=false] - Whether the "Sit Down" action is available.
 * @returns {JSX.Element}
 */
export default function QuickActions({
  onDirection,
  onQuickAction,
  onSlip,
  onRewind,
  onSit,
  canSit = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 mt-4">
      {/* Row 1 – Directional controls */}
      <div className="flex flex-row flex-wrap justify-center gap-2">
        <IconButton Icon={ArrowUpCircle} label="North" onClick={() => onDirection('north')} />
        <IconButton Icon={ArrowDownCircle} label="South" onClick={() => onDirection('south')} />
        <IconButton Icon={ArrowLeftCircle} label="West" onClick={() => onDirection('west')} />
        <IconButton Icon={ArrowRightCircle} label="East" onClick={() => onDirection('east')} />
        <IconButton Icon={Move3D} label="Slip" onClick={onSlip} />
        <IconButton Icon={Undo} label="Rewind" onClick={onRewind} />
      </div>

      {/* Row 2 – Action buttons */}
      <div className="flex flex-row flex-wrap justify-center gap-2">
        <IconButton Icon={Backpack} label="Inventory" onClick={() => onQuickAction('inv')} />
        <IconButton Icon={Eye} label="Look" onClick={() => onQuickAction('look')} />
        <IconButton Icon={Hand} label="Use" onClick={() => onQuickAction('use')} />
        <IconButton Icon={HelpCircle} label="Help" onClick={() => onQuickAction('help')} />
        {/* Sit Down button is only shown if canSit is true */}
        {canSit && <IconButton Icon={Armchair} label="Sit Down" onClick={onSit} animate={true} />}
      </div>
    </div>
  );
}

// Exported as default for use in the main application.
// TODO: Add more context-sensitive actions if game design expands.
