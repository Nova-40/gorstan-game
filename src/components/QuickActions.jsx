// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: QuickActions.jsx
// Path: src/components/QuickActions.jsx


// File: /src/components/QuickActions.jsx
// Version: v4.0.0-preprod

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
 */
const IconButton = ({ Icon, label, onClick, active = true, animate = false }) => (
  <div className={`group relative m-1 transition-opacity ${animate ? 'animate-fade-in' : ''}`}>
    <button
      onClick={onClick}
      className={`p-1 ${active ? 'text-green-400' : 'text-gray-500 opacity-40'} hover:scale-110 transition-transform`}
      aria-label={label}
      type="button"
      disabled={!active}
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
 * Renders quick-access directional and context-sensitive buttons.
 */
export default function QuickActions({
  onDirection,
  onQuickAction,
  onSlip,
  onRewind,
  onSit,
  canSit = false,
  extraActions = [],
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
        {canSit && <IconButton Icon={Armchair} label="Sit Down" onClick={onSit} animate />}
        {/* TODO: Add more context-sensitive actions if game design expands */}
        {extraActions.map(({ label, icon: Icon, onClick }, idx) => (
          <IconButton key={idx} Icon={Icon} label={label} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}

QuickActions.propTypes = {
  onDirection: PropTypes.func.isRequired,
  onQuickAction: PropTypes.func.isRequired,
  onSlip: PropTypes.func.isRequired,
  onRewind: PropTypes.func.isRequired,
  onSit: PropTypes.func.isRequired,
  canSit: PropTypes.bool,
  extraActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ),
};
