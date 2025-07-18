// Gorstan Jump Transition Overlay
// Version: 1.0.0
// Module: JumpTransitionOverlay.tsx
// (c) 2025 Geoffrey Alan Webster
// Description: Zigzag migraine effect animation triggered by 'Jump' choice

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JumpTransitionOverlayProps {
  onComplete: () => void;
}

const JumpTransitionOverlay: React.FC<JumpTransitionOverlayProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // Trigger next stage after animation finishes
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Zigzag aura effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #00ff99 0px, #00ff99 2px, transparent 2px, transparent 6px)',
            backgroundSize: '40px 40px',
            mixBlendMode: 'screen',
          }}
          initial={{ scale: 1, filter: 'blur(0px)' }}
          animate={{ scale: 1.3, filter: 'blur(4px)' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-green-300 font-mono text-xl">
          <span className="animate-pulse">Jumping...</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JumpTransitionOverlay;
