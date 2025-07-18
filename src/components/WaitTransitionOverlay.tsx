// Gorstan Wait Transition Overlay
// Version: 1.0.0
// (c) 2025 Geoffrey Alan Webster
// Module: WaitTransitionOverlay.tsx
// Description: Red glow, horn, and splat death leading to fake reset screen

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitTransitionOverlayProps {
  onComplete: () => void;
}

const WaitTransitionOverlay: React.FC<WaitTransitionOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'glow' | 'impact' | 'splat'>('glow');

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('impact'), 1200),
      setTimeout(() => setStage('splat'), 1800),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Red glow before the lorry hits */}
        {stage === 'glow' && (
          <motion.div
            className="absolute inset-0 bg-red-900 opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
          />
        )}

        {/* Bright flash for impact */}
        {stage === 'impact' && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Splat overlay with red vignette */}
        {stage === 'splat' && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_60%,_red_100%)] opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-mono text-xl">
              <span className="animate-pulse">Splat.</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WaitTransitionOverlay;
