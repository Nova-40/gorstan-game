/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';










interface SipTransitionProps {
  onComplete: () => void;
}

const SipTransition: React.FC<SipTransitionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'sipping' | 'warmth' | 'ripple' | 'dissolve'>('sipping');

// React effect hook
  useEffect(() => {
// Variable declaration
    const timers = [
      setTimeout(() => setPhase('warmth'), 600),
      setTimeout(() => setPhase('ripple'), 1400),
      setTimeout(() => setPhase('dissolve'), 2200),
      setTimeout(() => onComplete(), 3200),
    ];
// JSX return block or main return
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

// JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="sip-transition fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'linear-gradient(135deg, #2c1810, #8b4513, #d2691e)',
        }}
      >
        {}
        {phase === 'sipping' && (
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-8 bg-white opacity-30 rounded-full"
                initial={{
                  x: '50%',
                  y: '60%',
                  scaleY: 0,
                  opacity: 0,
                }}
                animate={{
                  y: ['60%', '30%', '10%'],
                  scaleY: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  x: `${50 + (i - 4) * 3}%`,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                style={{
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </div>
        )}

        {}
        {(phase === 'warmth' || phase === 'ripple' || phase === 'dissolve') && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === 'warmth' ? [0, 1.5] : [1.5, 3],
              opacity: phase === 'warmth' ? [0, 0.8] : [0.8, 0.4],
            }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'radial-gradient(circle, #ffcc80 0%, #ff8a65 20%, #d2691e 40%, transparent 70%)',
              transformOrigin: 'center 60%',
            }}
          />
        )}

        {}
        {(phase === 'ripple' || phase === 'dissolve') && (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border-2 border-orange-300 rounded-full"
                initial={{
                  width: '20px',
                  height: '20px',
                  x: 'calc(50% - 10px)',
                  y: 'calc(60% - 10px)',
                  opacity: 0,
                }}
                animate={{
                  width: ['20px', '400px', '800px'],
                  height: ['20px', '400px', '800px'],
                  x: ['calc(50% - 10px)', 'calc(50% - 200px)', 'calc(50% - 400px)'],
                  y: ['calc(60% - 10px)', 'calc(60% - 200px)', 'calc(60% - 400px)'],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  ease: 'easeOut',
                }}
                style={{
                  borderWidth: '2px',
                  borderColor: `rgba(255, 204, 128, ${0.8 - i * 0.15})`,
                }}
              />
            ))}
          </div>
        )}

        {}
        {phase === 'dissolve' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
            style={{
              background: 'linear-gradient(45deg, transparent 0%, #ffcc80 25%, #ff8a65 50%, #d2691e 75%, transparent 100%)',
              backgroundSize: '100px 100px',
              animation: 'dissolve 1s ease-in-out',
            }}
          />
        )}

        {}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            className="text-center font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {phase === 'sipping' && (
              <motion.span
                className="text-2xl text-amber-100"
                style={{ textShadow: '0 0 10px #ffcc80' }}
              >
                ☕ Taking a sip...
              </motion.span>
            )}
            {phase === 'warmth' && (
              <motion.span
                className="text-3xl text-orange-200"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
                style={{ textShadow: '0 0 15px #ff8a65' }}
              >
                ◉ Warmth floods your chest ◉
              </motion.span>
            )}
            {phase === 'ripple' && (
              <motion.span
                className="text-4xl text-yellow-200"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ textShadow: '0 0 20px #ffcc80' }}
              >
                ∿ Reality ripples outward ∿
              </motion.span>
            )}
            {phase === 'dissolve' && (
              <motion.span
                className="text-2xl text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ textShadow: '0 0 10px #ffffff' }}
              >
                ◈ The universe blurs and shifts ◈
              </motion.span>
            )}
          </motion.div>
        </div>

        {}
        {(phase === 'warmth' || phase === 'ripple') && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{
                  x: `${50 + (Math.random() - 0.5) * 20}%`,
                  y: '60%',
                  scale: 0,
                }}
                animate={{
                  y: `${60 + (Math.random() - 0.5) * 80}%`,
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  boxShadow: '0 0 8px #ffcc80',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SipTransition;
