// src/celebrate/assets/celebrationIcons.tsx
// SVG icons and decorations for different celebrations

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Christian celebrations
export const ChristmasIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Tree */}
      <path d="M12 2l2 6h-4l2-6z" />
      <path d="M12 6l3 6H9l3-6z" />
      <path d="M12 10l4 6H8l4-6z" />
      {/* Trunk */}
      <rect x="11" y="16" width="2" height="4" />
      {/* Star */}
      <circle cx="12" cy="3" r="1" fill="#FFD700" />
    </g>
  </svg>
);

export const EasterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Cross */}
      <rect x="11" y="2" width="2" height="20" />
      <rect x="6" y="7" width="12" height="2" />
      {/* Lilies */}
      <circle cx="8" cy="16" r="2" fill="#FFFFFF" opacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="#FFFFFF" opacity="0.8" />
    </g>
  </svg>
);

// Islamic celebrations
export const EidIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Crescent moon */}
      <path d="M12 2C8 2 5 5 5 9s3 7 7 7c1 0 2-.2 3-.6C13.8 16.2 13 15.1 13 14c0-2.8 2.2-5 5-5 .4 0 .8.1 1.2.2C18.4 5.8 15.5 2 12 2z" />
      {/* Star */}
      <polygon points="19,8 20,10 22,10 20.5,11.5 21,14 19,12.5 17,14 17.5,11.5 16,10 18,10" fill="#FFD700" />
    </g>
  </svg>
);

// Jewish celebrations
export const JewishIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Star of David */}
      <path d="M12 2l2.5 4.5H19l-2.5 4.5L19 16h-4.5L12 20.5 9.5 16H5l2.5-4.5L5 7h4.5L12 2z" 
            fillRule="evenodd" />
    </g>
  </svg>
);

export const MenorahIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Menorah base */}
      <rect x="10" y="18" width="4" height="2" />
      <rect x="8" y="20" width="8" height="2" />
      {/* Center candle */}
      <rect x="11.5" y="6" width="1" height="12" />
      <ellipse cx="12" cy="6" rx="0.5" ry="1" fill="#FFD700" />
      {/* Side candles */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 6 + i * 1.5;
        if (i === 4) return null; // Skip center position
        return (
          <g key={i}>
            <rect x={x} y="8" width="1" height="10" />
            <ellipse cx={x + 0.5} cy="8" rx="0.5" ry="1" fill="#FFD700" />
          </g>
        );
      })}
    </g>
  </svg>
);

// Chinese celebrations
export const DragonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Dragon body */}
      <path d="M2 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z" />
      <path d="M8 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1.5 3-3 3-3-1.5-3-3z" />
      <path d="M14 12c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
      <circle cx="20" cy="12" r="1.5" />
      {/* Eyes */}
      <circle cx="19.5" cy="11.5" r="0.3" fill="#FFFFFF" />
    </g>
  </svg>
);

export const LanternIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Lantern body */}
      <ellipse cx="12" cy="12" rx="4" ry="6" />
      <ellipse cx="12" cy="12" rx="3" ry="5" fill="#FF4444" />
      {/* Top and bottom */}
      <rect x="10" y="5" width="4" height="1" />
      <rect x="10" y="18" width="4" height="1" />
      {/* Tassel */}
      <line x1="12" y1="19" x2="12" y2="21" stroke="currentColor" strokeWidth="1" />
    </g>
  </svg>
);

// Hindu celebrations
export const DiwalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Oil lamp (diya) */}
      <ellipse cx="12" cy="16" rx="6" ry="2" />
      <ellipse cx="12" cy="15" rx="5" ry="1.5" fill="#D4A574" />
      {/* Flame */}
      <path d="M12 15c0-3 1-5 2-5s2 2 2 5c0 1-1 2-2 2s-2-1-2-2z" fill="#FF6B35" />
      <path d="M12.5 15c0-2 0.5-3.5 1-3.5s1 1.5 1 3.5c0 0.5-0.5 1-1 1s-1-0.5-1-1z" fill="#FFD700" />
      {/* Wick */}
      <rect x="11.5" y="14" width="1" height="2" fill="#8B4513" />
    </g>
  </svg>
);

// Buddhist celebrations
export const LotusIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Lotus petals */}
      <path d="M12 4c2 0 4 2 4 6 0-4-2-6-4-6z" />
      <path d="M12 4c-2 0-4 2-4 6 0-4 2-6 4-6z" />
      <path d="M16 10c0 2-2 4-4 4 4 0 4-2 4-4z" />
      <path d="M8 10c0 2 2 4 4 4-4 0-4-2-4-4z" />
      <path d="M20 12c-2 0-4-2-4-2s2-2 4-2c0 2 0 4 0 4z" />
      <path d="M4 12c2 0 4-2 4-2s-2-2-4-2c0 2 0 4 0 4z" />
      {/* Center */}
      <circle cx="12" cy="10" r="2" fill="#FFD700" />
    </g>
  </svg>
);

// Seasonal celebrations
export const SunIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor">
      {/* Sun center */}
      <circle cx="12" cy="12" r="4" />
      {/* Rays */}
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const SnowflakeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      {/* Main lines */}
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
      {/* Decorative branches */}
      <path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2" strokeWidth="1" />
      <path d="M6 12l-2-2M6 12l-2 2M18 12l2-2M18 12l2 2" strokeWidth="1" />
    </g>
  </svg>
);

// Export icon mapping for easy lookup
export const celebrationIcons = {
  christmas: ChristmasIcon,
  easter: EasterIcon,
  eid: EidIcon,
  jewish: JewishIcon,
  menorah: MenorahIcon,
  dragon: DragonIcon,
  lantern: LanternIcon,
  diya: DiwalIcon,
  lotus: LotusIcon,
  sun: SunIcon,
  snowflake: SnowflakeIcon
};

export type CelebrationIconName = keyof typeof celebrationIcons;
