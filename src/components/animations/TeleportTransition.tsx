// src/components/animations/TeleportTransition.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';









interface TeleportTransitionProps {
  isActive: boolean;
  destinationName?: string;
  onComplete: () => void;
}

const TeleportTransition: React.FC<TeleportTransitionProps> = ({
  isActive,
  destinationName,
  onComplete
}) => {
  const [phase, setPhase] = useState<'start' | 'dissolve' | 'transport' | 'materialize' | 'complete'>('start');

// React effect hook
  useEffect(() => {
    if (!isActive) {
      setPhase('complete');
      return;
    }

    
// Variable declaration
    const timer1 = setTimeout(() => setPhase('dissolve'), 200);
// Variable declaration
    const timer2 = setTimeout(() => setPhase('transport'), 1600);
// Variable declaration
    const timer3 = setTimeout(() => setPhase('materialize'), 3000);
// Variable declaration
    const timer4 = setTimeout(() => {
      setPhase('complete');
      onComplete();
    }, 4400);

// JSX return block or main return
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isActive, onComplete]);

  if (!isActive || phase === 'complete') return null;

// Variable declaration
  const getAnimationProps = () => {
    switch (phase) {

      case 'dissolve':
        return {
          opacity: [1, 0.3, 0],
          scale: [1, 1.1, 0.9],
          filter: ['blur(0px)', 'blur(2px)', 'blur(4px)'],
          transition: { duration: 1.4, ease: "easeInOut" as const }
        };

      case 'transport':
        return {
          opacity: [0, 0.5, 0],
          scale: [0.5, 2, 0.5],
          rotate: [0, 180, 360],
          filter: ['blur(8px)', 'blur(4px)', 'blur(8px)'],
          transition: { duration: 1.4, ease: "easeInOut" as const }
        };

      case 'materialize':
        return {
          opacity: [0, 0.3, 1],
          scale: [1.2, 0.9, 1],
          filter: ['blur(4px)', 'blur(2px)', 'blur(0px)'],
          transition: { duration: 1.4, ease: "easeOut" as const }
        };

      default:
        return {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.1 }
        };
    }
  };

// Variable declaration
  const getBackgroundStyle = () => {
    switch (phase) {
      case 'dissolve':
        return 'linear-gradient(45deg, #4a00e0, #8e2de2, #da00ff)';
      case 'transport':
        return 'radial-gradient(circle, #00d4aa, #4a00e0, #8e2de2, #da00ff)';
      case 'materialize':
        return 'linear-gradient(45deg, #00d4aa, #00a0b0, #005f73)';
      default:
        return 'transparent';
    }
  };

// JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {}
        <motion.div
          className="w-64 h-64 rounded-full flex items-center justify-center"
          animate={getAnimationProps()}
          style={{
            boxShadow: '0 0 50px rgba(74, 0, 224, 0.6), 0 0 100px rgba(142, 45, 226, 0.4)',
            background: getBackgroundStyle(),
          }}
        >
          {}
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600"
            animate={{
              scale: phase === 'transport' ? [1, 1.5, 1] : [1, 1.2, 1],
              opacity: phase === 'dissolve' ? [1, 0.5, 0] : phase === 'materialize' ? [0, 0.5, 1] : [0.8, 1, 0.8],
              rotate: [0, 360],
            }}
            transition={{
              duration: phase === 'transport' ? 0.5 : 1,
              repeat: phase === 'transport' ? Infinity : 0,
              ease: "linear" as const
            }}
            style={{
              filter: 'blur(2px)',
              boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.3)',
            }}
          />
        </motion.div>

        {}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos(i * Math.PI / 4) * (phase === 'transport' ? 150 : 80),
              y: Math.sin(i * Math.PI / 4) * (phase === 'transport' ? 150 : 80),
              opacity: phase === 'dissolve' ? [1, 0] : phase === 'materialize' ? [0, 1] : [0.5, 1, 0.5],
              scale: phase === 'transport' ? [1, 2, 1] : [1, 1.5, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: phase === 'transport' ? Infinity : 0,
              ease: "easeInOut" as const
            }}
          />
        ))}

        {}
        {destinationName && (
          <motion.div
            className="absolute bottom-1/3 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase === 'transport' || phase === 'materialize' ? 1 : 0,
              y: phase === 'transport' || phase === 'materialize' ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-cyan-300 text-xl font-bold tracking-wide">
              Teleporting to
            </div>
            <div className="text-white text-2xl font-bold mt-2 glow">
              {destinationName}
            </div>
          </motion.div>
        )}

        {}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute border-2 border-cyan-400 rounded-full"
            style={{
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
              left: `calc(50% - ${(i + 1) * 40}px)`,
              top: `calc(50% - ${(i + 1) * 40}px)`,
              opacity: 0.3,
            }}
            animate={{
              scale: phase === 'transport' ? [1, 1.5, 1] : [1, 1.1, 1],
              opacity: phase === 'dissolve' ? [0.3, 0] : phase === 'materialize' ? [0, 0.3] : [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 1 + i * 0.2,
              repeat: phase === 'transport' ? Infinity : 0,
              ease: "linear" as const,
              delay: i * 0.1,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default TeleportTransition;
