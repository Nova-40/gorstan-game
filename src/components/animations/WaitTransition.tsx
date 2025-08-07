// src/components/animations/WaitTransition.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';










interface WaitTransitionProps {
  onComplete: () => void;
}

const WaitTransition: React.FC<WaitTransitionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'tension' | 'approaching' | 'impact' | 'reset'>('tension');

// React effect hook
  useEffect(() => {
// Variable declaration
    const timers = [
      setTimeout(() => setPhase('approaching'), 800),
      setTimeout(() => setPhase('impact'), 2500),
      setTimeout(() => setPhase('reset'), 3200),
      setTimeout(() => onComplete(), 4200),
    ];
// JSX return block or main return
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

// JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="wait-transition fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: phase === 'reset' ? '#000000' : 'linear-gradient(180deg, #1a1a1a, #000000)',
        }}
      >
        {}
        {phase === 'tension' && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              background: 'radial-gradient(circle at 80% 20%, #330000 0%, transparent 50%)',
            }}
          />
        )}

        {}
        {phase === 'approaching' && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.8] }}
              transition={{ duration: 1.7 }}
              style={{
                background: 'radial-gradient(ellipse at 80% 50%, #660000 0%, #330000 40%, transparent 70%)',
              }}
            />

            {}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1], scale: [0.5, 1.2, 1.5] }}
              transition={{ duration: 1.7 }}
              style={{
                background: 'conic-gradient(from 45deg at 85% 50%, transparent 40%, #ffff9955 50%, transparent 60%)',
              }}
            />
          </>
        )}

        {}
        {phase === 'impact' && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#ffffff',
              }}
            />

            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 2], opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                background: 'radial-gradient(circle, #990000 0%, #660000 30%, #330000 60%, transparent 100%)',
                transformOrigin: '85% 50%',
              }}
            />
          </>
        )}

        {}
        {phase === 'reset' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center font-mono text-green-400">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xl mb-4"
              >
                SYSTEM RESET INITIATED
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '200px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-1 bg-green-400 mx-auto mb-2"
              />
              <div className="text-sm animate-pulse">
                Reality matrix reconstructing...
              </div>
            </div>
          </motion.div>
        )}

        {}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            className="text-center font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === 'reset' ? 0 : 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {phase === 'tension' && (
              <motion.div
                className="text-2xl text-red-300"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ textShadow: '0 0 10px #ff6666' }}
              >
                ⏳ You hesitate...
              </motion.div>
            )}
            {phase === 'approaching' && (
              <motion.div
                className="text-3xl text-red-200"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ textShadow: '0 0 15px #ff4444' }}
              >
                🚛 Too late! Lorry approaching!
              </motion.div>
            )}
            {phase === 'impact' && (
              <motion.div
                className="text-4xl text-white"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.4 }}
                style={{ textShadow: '0 0 20px #ffffff' }}
              >
                💥 IMPACT!
              </motion.div>
            )}
          </motion.div>
        </div>

        {}
        {phase === 'approaching' && (
          <div className="absolute inset-0">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border-2 border-red-400 opacity-40"
                initial={{
                  width: '10px',
                  height: '10px',
                  x: '85%',
                  y: '50%',
                  borderRadius: '50%',
                }}
                animate={{
                  width: ['10px', '100px', '200px'],
                  height: ['10px', '100px', '200px'],
                  x: ['85%', '75%', '60%'],
                  y: ['50%', '45%', '40%'],
                  opacity: [0.4, 0.2, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.2,
                  repeat: 2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WaitTransition;
