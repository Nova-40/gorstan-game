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
// Renders room descriptions and image logic.

import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';









interface RoomTransitionProps {
  isActive: boolean;
  transitionType: 'zone_change' | 'portal' | 'normal' | 'chair_portal';
  fromZone?: string;
  toZone?: string;
  onComplete: () => void;
}

const RoomTransition: React.FC<RoomTransitionProps> = ({
  isActive,
  transitionType,
  fromZone,
  toZone,
  onComplete
}) => {
  const [phase, setPhase] = useState<'start' | 'transition' | 'arrival' | 'complete'>('start');

// React effect hook
  useEffect(() => {
    if (!isActive) {
      setPhase('complete');
      return;
    }

// Variable declaration
    const timeline = async () => {
      
      setPhase('start');
      await new Promise(resolve => setTimeout(resolve, 200));

      
      setPhase('transition');
      await new Promise(resolve => setTimeout(resolve, getTransitionDuration()));

      
      setPhase('arrival');
      await new Promise(resolve => setTimeout(resolve, 300));

      
      setPhase('complete');
      onComplete();
    };

    timeline();
  }, [isActive, onComplete]);

// Variable declaration
  const getTransitionDuration = () => {
    switch (transitionType) {
      case 'zone_change': return 3000; // Increased from 2000ms
      case 'portal': return 2500; // Increased from 1800ms
      case 'chair_portal': return 3200; // Increased from 2200ms
      case 'normal': return 1000; // Increased from 600ms
      default: return 1200; // Increased from 800ms
    }
  };

// Variable declaration
  const getAnimationVariants = () => {
    switch (transitionType) {
      case 'zone_change':
        return {
          start: { opacity: 1, scale: 1 },
          transition: {
            opacity: 0.3,
            scale: 1.1,
            rotateY: 180,
            background: 'linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)'
          },
          arrival: { opacity: 1, scale: 1, rotateY: 0 }
        };

      case 'portal':
        return {
          start: { opacity: 1, scale: 1 },
          transition: {
            opacity: 0.2,
            scale: 0.8,
            rotate: 360,
            background: 'radial-gradient(circle, #4a00e0, #8e2de2, #da00ff)'
          },
          arrival: { opacity: 1, scale: 1, rotate: 0 }
        };

      case 'chair_portal':
        return {
          start: { opacity: 1, scale: 1 },
          transition: {
            opacity: 0.1,
            scale: 1.2,
            y: -20,
            background: 'conic-gradient(from 0deg, #00d4aa, #00a0b0, #005f73, #001219, #00d4aa)'
          },
          arrival: { opacity: 1, scale: 1, y: 0 }
        };

      default:
        return {
          start: { opacity: 1 },
          transition: { opacity: 0.3, scale: 1.02 },
          arrival: { opacity: 1, scale: 1 }
        };
    }
  };

// Variable declaration
  const getTransitionText = () => {
    if (transitionType === 'zone_change' && fromZone && toZone) {
      return `Transitioning from ${fromZone} to ${toZone}...`;
    }

    switch (transitionType) {
      case 'portal': return 'Stepping through the portal...';
      case 'chair_portal': return 'Reality shifts around you...';
      case 'zone_change': return 'Crossing dimensional boundaries...';
      default: return 'Moving...';
    }
  };

// Variable declaration
  const getBackgroundEffect = () => {
    switch (transitionType) {
      case 'zone_change':
// JSX return block or main return
        return (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'transition' ? 0.8 : 0 }}
            transition={{ duration: 0.5 }}
          />
        );

      case 'portal':
// JSX return block or main return
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(74,0,224,0.8), rgba(142,45,226,0.6), rgba(218,0,255,0.4))'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase === 'transition' ? 1 : 0,
              scale: phase === 'transition' ? 1.5 : 0.5
            }}
            transition={{ duration: 0.8 }}
          />
        );

      case 'chair_portal':
// JSX return block or main return
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0,212,170,0.8), rgba(0,160,176,0.6), rgba(0,95,115,0.4), rgba(0,18,25,0.6))'
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: phase === 'transition' ? 0.9 : 0,
              rotate: phase === 'transition' ? 360 : 0
            }}
            transition={{ duration: 1.5 }}
          />
        );

      default:
// JSX return block or main return
        return (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'transition' ? 0.2 : 0 }}
            transition={{ duration: 0.3 }}
          />
        );
    }
  };

// Variable declaration
  const getParticleEffect = () => {
    if (transitionType === 'portal' || transitionType === 'chair_portal') {
// JSX return block or main return
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={phase === 'transition' ? {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0]
              } : {}}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  if (!isActive || phase === 'complete') {
    return null;
  }

// Variable declaration
  const variants = getAnimationVariants();

// JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {getBackgroundEffect()}
        {getParticleEffect()}

        <motion.div
          className="relative z-10 text-center text-white font-mono"
          variants={variants}
          initial="start"
          animate={phase}
          transition={{
            duration: phase === 'transition' ? getTransitionDuration() / 1000 : 0.3,
            ease: "easeInOut"
          }}
        >
          <motion.h2
            className="text-2xl mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {getTransitionText()}
          </motion.h2>

          {(transitionType === 'zone_change' || transitionType === 'portal' || transitionType === 'chair_portal') && (
            <motion.div
              className="w-16 h-1 bg-white mx-auto rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: phase === 'transition' ? '100%' : '0%' }}
              transition={{ duration: getTransitionDuration() / 1000 }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomTransition;
