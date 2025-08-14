import React, { useState } from 'react';

interface Tooltip {
  id: string;
  message: string;
  targetElementId: string;
}

const initialTooltips: Tooltip[] = [
  { id: 'move', message: 'Use arrow keys or WASD to move.', targetElementId: 'game-screen' },
  { id: 'talk', message: 'Press Enter to talk to NPCs.', targetElementId: 'npc' },
  { id: 'examine', message: 'Press E to examine objects.', targetElementId: 'object' },
  { id: 'inventory', message: 'Press I to open your inventory.', targetElementId: 'inventory-button' },
  { id: 'coin', message: 'Use the Schrödinger coin to make decisions.', targetElementId: 'coin-button' },
];

const TooltipSystem: React.FC = () => {
  const [tooltips, setTooltips] = useState(initialTooltips);

  const dismissTooltip = (id: string) => {
    setTooltips((prev) => prev.filter((tooltip) => tooltip.id !== id));
  };

  return (
    <>
      {tooltips.map((tooltip) => {
        const targetElement = document.getElementById(tooltip.targetElementId);
        const rect = targetElement?.getBoundingClientRect();

        return (
          <div
            key={tooltip.id}
            style={{
              position: 'absolute',
              top: rect ? rect.top - 30 : 0,
              left: rect ? rect.left : 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              zIndex: 1000,
            }}
            onClick={() => dismissTooltip(tooltip.id)}
          >
            {tooltip.message}
          </div>
        );
      })}
    </>
  );
};

export default TooltipSystem;
