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

import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

interface JumpTransitionProps {
  onComplete: () => void;
}

const JumpTransition: React.FC<JumpTransitionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<
    "start" | "kaleidoscope" | "portal" | "arrival"
  >("start");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // React effect hook
  useEffect(() => {
    console.log(
      "[JumpTransition] Starting animation, prefersReducedMotion:",
      prefersReducedMotion,
    );

    if (prefersReducedMotion) {
      // Skip animation phases for reduced motion
      const timer = setTimeout(() => {
        console.log(
          "[JumpTransition] Completing immediately due to reduced motion preference",
        );
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }

    // Variable declaration
    const timers = [
      setTimeout(() => {
        console.log("[JumpTransition] Phase: kaleidoscope");
        setPhase("kaleidoscope");
      }, 500),
      setTimeout(() => {
        console.log("[JumpTransition] Phase: portal");
        setPhase("portal");
      }, 1500),
      setTimeout(() => {
        console.log("[JumpTransition] Phase: arrival");
        setPhase("arrival");
      }, 2500),
      setTimeout(() => {
        console.log("[JumpTransition] Animation complete");
        onComplete();
      }, 3500),
    ];
    // JSX return block or main return
    return () => timers.forEach(clearTimeout);
  }, [onComplete, prefersReducedMotion]);

  // JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="jump-transition fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: "radial-gradient(circle at center, #000428, #004e92)",
        }}
      >
        {}
        {phase !== "start" && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.5, rotate: 0 }}
              animate={{
                scale: phase === "kaleidoscope" ? [0.5, 1.5, 1] : [1, 2],
                rotate: phase === "kaleidoscope" ? [0, 360, 720] : [720, 1080],
              }}
              transition={{
                duration: phase === "kaleidoscope" ? 1 : 1,
                ease: "easeInOut",
              }}
              style={{
                background: `conic-gradient(from 0deg,
                  #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b, #fb5607, #ff006e)`,
                clipPath:
                  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                transformOrigin: "center",
              }}
            />

            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.3, rotate: 180 }}
              animate={{
                scale: phase === "kaleidoscope" ? [0.3, 1.2, 0.8] : [0.8, 1.8],
                rotate:
                  phase === "kaleidoscope" ? [180, -180, -540] : [-540, -900],
              }}
              transition={{
                duration: phase === "kaleidoscope" ? 1 : 1,
                ease: "easeInOut",
                delay: 0.1,
              }}
              style={{
                background: `conic-gradient(from 45deg,
                  #ff9a00, #c77dff, #7209b7, #560bad, #480ca8, #3f37c9, #ff9a00)`,
                clipPath:
                  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                transformOrigin: "center",
                opacity: 0.8,
              }}
            />

            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.1, rotate: -90 }}
              animate={{
                scale: phase === "kaleidoscope" ? [0.1, 0.9, 0.6] : [0.6, 1.4],
                rotate: phase === "kaleidoscope" ? [-90, 270, 630] : [630, 990],
              }}
              transition={{
                duration: phase === "kaleidoscope" ? 1 : 1,
                ease: "easeInOut",
                delay: 0.2,
              }}
              style={{
                background: `repeating-conic-gradient(from 0deg,
                  transparent 0deg, #00f5ff 15deg, transparent 30deg, #ff0080 45deg, transparent 60deg)`,
                transformOrigin: "center",
                opacity: 0.6,
              }}
            />

            {}
            {phase === "portal" && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.8 }}
                  style={{
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, transparent 30%, #ffffff22 35%, transparent 40%, #00f5ff44 45%, transparent 50%)",
                    border: "3px solid #00f5ff",
                    boxShadow: "0 0 100px #00f5ff, inset 0 0 50px #ff006e",
                  }}
                />
              </motion.div>
            )}

            {}
            {phase === "arrival" && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
                style={{
                  background:
                    "radial-gradient(circle, #ffffff 0%, transparent 70%)",
                }}
              />
            )}
          </>
        )}

        {}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            className="text-center font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {phase === "start" && (
              <motion.span
                className="text-2xl text-white"
                style={{ textShadow: "0 0 10px #00f5ff" }}
              >
                ⧉ Initiating jump...
              </motion.span>
            )}
            {phase === "kaleidoscope" && (
              <motion.span
                className="text-3xl text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ textShadow: "0 0 15px #ff006e" }}
              >
                ◊ Reality fracturing ◊
              </motion.span>
            )}
            {phase === "portal" && (
              <motion.span
                className="text-4xl text-cyan-300"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.4, repeat: Infinity }}
                style={{ textShadow: "0 0 20px #00f5ff" }}
              >
                ⟐ Dimensional breach detected ⟐
              </motion.span>
            )}
            {phase === "arrival" && (
              <motion.span
                className="text-2xl text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ textShadow: "0 0 10px #ffffff" }}
              >
                ◈ Landing in new reality ◈
              </motion.span>
            )}
          </motion.div>
        </div>

        {}
        {phase !== "start" && (
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                }}
                animate={{
                  x: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 45}%`,
                  y: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 45}%`,
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                style={{
                  boxShadow: "0 0 10px #00f5ff",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default JumpTransition;
