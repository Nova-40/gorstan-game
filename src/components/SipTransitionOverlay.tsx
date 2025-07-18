// Gorstan Sip Transition Overlay
// Version: 1.0.0
// (c) 2025 Geoffrey Alan Webster
// Module: SipTransitionOverlay.tsx
// Description: Surreal ripple and spatial twist effect triggered by 'sip'

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SipTransitionOverlayProps {
  onComplete: () => void;
}

const SipTransitionOverlay: React.FC<SipTransitionOverlayProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // Trigger room change after animation
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
        {/* Coffee ripple effect */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: 8,
            opacity: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #c6b497 10%, transparent 60%)',
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />

        {/* Text / fallback */}
        <div className="absolute inset-0 flex items-center justify-center text-amber-200 font-mono text-xl">
          <span className="animate-pulse">Sipping the coffee…</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SipTransitionOverlay;
