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

interface DramaticWaitTransitionProps {
  onComplete: () => void;
}

const DramaticWaitTransition: React.FC<DramaticWaitTransitionProps> = ({
  onComplete,
}) => {
  const [phase, setPhase] = useState<
    | "tension"
    | "approaching"
    | "impact"
    | "aftermath"
    | "splat"
    | "void"
    | "reconstruction"
    | "awakening"
  >("tension");

  // React effect hook
  useEffect(() => {
    // Variable declaration
    const timers = [
      setTimeout(() => setPhase("approaching"), 1000),
      setTimeout(() => setPhase("impact"), 3000),
      setTimeout(() => setPhase("aftermath"), 3500),
      setTimeout(() => setPhase("splat"), 4000),
      setTimeout(() => setPhase("void"), 6000),
      setTimeout(() => setPhase("reconstruction"), 8000),
      setTimeout(() => setPhase("awakening"), 10000),
      setTimeout(() => onComplete(), 12000),
    ];
    // JSX return block or main return
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // JSX return block or main return
  return (
    <AnimatePresence>
      <motion.div
        className="dramatic-wait-transition fixed inset-0 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background:
            phase === "void"
              ? "#000000"
              : phase === "reconstruction"
                ? "linear-gradient(45deg, #001122, #003366, #001122)"
                : phase === "awakening"
                  ? "linear-gradient(180deg, #003366, #0066cc)"
                  : "linear-gradient(180deg, #1a1a1a, #000000)",
        }}
      >
        {}
        {phase === "tension" && (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, #440000 0%, transparent 60%)",
              }}
            />
            {}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.5,
                  repeat: Infinity,
                }}
                style={{
                  background: `radial-gradient(circle at ${80 + i * 5}% ${20 + i * 10}%, #660000 0%, transparent 50%)`,
                }}
              />
            ))}
          </>
        )}

        {}
        {phase === "approaching" && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 1] }}
              transition={{ duration: 2 }}
              style={{
                background:
                  "radial-gradient(ellipse at 80% 50%, #990000 0%, #440000 50%, transparent 80%)",
              }}
            />

            {}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 1, 1],
                  scale: [0.3, 1.5, 2],
                  rotate: [0, i * 5, i * 10],
                }}
                transition={{ duration: 2, delay: i * 0.2 }}
                style={{
                  background: `conic-gradient(from ${45 + i * 10}deg at ${85 + i * 2}% 50%, transparent 35%, #ffffff88 50%, transparent 65%)`,
                }}
              />
            ))}

            {}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border-4 border-red-300 opacity-60"
                  initial={{
                    width: "20px",
                    height: "20px",
                    x: "85%",
                    y: "50%",
                    borderRadius: "50%",
                  }}
                  animate={{
                    width: ["20px", "200px", "400px"],
                    height: ["20px", "200px", "400px"],
                    x: ["85%", "70%", "50%"],
                    y: ["50%", "40%", "30%"],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.15,
                    repeat: 2,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {}
        {phase === "impact" && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.8, 0] }}
              transition={{ duration: 0.5 }}
              style={{
                background: "#ffffff",
              }}
            />

            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 3, 5], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.5 }}
              style={{
                background:
                  "radial-gradient(circle, #ffffff 0%, #ff4444 20%, transparent 60%)",
                transformOrigin: "85% 50%",
              }}
            />
          </>
        )}

        {}
        {phase === "aftermath" && (
          <>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background:
                  "radial-gradient(circle at 85% 50%, #330000 0%, #110000 50%, #000000 100%)",
              }}
            />

            {}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-red-600 opacity-70"
                style={{
                  width: Math.random() * 10 + 5 + "px",
                  height: Math.random() * 10 + 5 + "px",
                  left: 80 + Math.random() * 20 + "%",
                  top: 40 + Math.random() * 20 + "%",
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0.5],
                  rotate: [0, Math.random() * 360],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200],
                }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </>
        )}

        {}
        {phase === "splat" && (
          <>
            {}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 3], opacity: [0, 1, 0.8] }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(circle, #cc0000 0%, #880000 25%, #440000 50%, #220000 75%, transparent 100%)",
                transformOrigin: "85% 50%",
              }}
            />

            {}
            {[...Array(8)].map((_, i) => {
              // Variable declaration
              const angle = i * 45 + Math.random() * 30;
              // JSX return block or main return
              return (
                <motion.div
                  key={i}
                  className="absolute bg-red-700 opacity-80"
                  style={{
                    width: "8px",
                    height: Math.random() * 100 + 50 + "px",
                    left: "85%",
                    top: "50%",
                    transformOrigin: "bottom center",
                    transform: `rotate(${angle}deg)`,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: [0, 1, 0.8] }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                />
              );
            })}

            {}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-red-600 rounded-full opacity-70"
                style={{
                  width: Math.random() * 8 + 4 + "px",
                  height: Math.random() * 8 + 4 + "px",
                  left: 80 + Math.random() * 10 + "%",
                  top: 45 + Math.random() * 10 + "%",
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0.8],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {}
        {phase === "void" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: "#000000" }}
          >
            <motion.div
              className="text-center font-mono text-white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.8], scale: [0, 1.2, 1] }}
              transition={{ duration: 1.5 }}
            >
              <div
                className="text-2xl mb-4"
                style={{ textShadow: "0 0 20px #ffffff" }}
              >
                ⚫ THE VOID ⚫
              </div>
              <div className="text-sm opacity-80">
                Consciousness fragments... reality dissolves...
              </div>
            </motion.div>
          </motion.div>
        )}

        {}
        {phase === "reconstruction" && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute border border-blue-400 opacity-30"
                  style={{
                    width: "50px",
                    height: "50px",
                    left: (i % 5) * 20 + "%",
                    top: Math.floor(i / 5) * 25 + "%",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.6, 0.3], scale: [0, 1, 1] }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
            </div>

            {}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 bg-blue-400 opacity-60"
                style={{
                  width: "100%",
                  top: i * 16.66 + "%",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1, 0.8], opacity: [0, 0.8, 0.4] }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
              />
            ))}

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center font-mono text-blue-300">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xl mb-4"
                  style={{ textShadow: "0 0 15px #66ccff" }}
                >
                  🔮 LATTICE RECONSTRUCTION PROTOCOL 🔮
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "300px" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-2 bg-blue-400 mx-auto mb-4 rounded"
                />
                <div className="text-sm animate-pulse">
                  Quantum coherence stabilizing... Reality matrix rebuilding...
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {}
        {phase === "awakening" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center font-mono text-cyan-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.1, 1] }}
                transition={{ duration: 1 }}
                className="text-3xl mb-6"
                style={{ textShadow: "0 0 20px #00ffff" }}
              >
                ☕ WELCOME TO THE LATTICE HUB ☕
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-lg mb-4"
              >
                You awaken with quantum coffee in hand...
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-sm"
              >
                A doorway to Dale's apartment shimmers before you...
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            className="text-center font-mono"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity:
                phase === "void" ||
                phase === "reconstruction" ||
                phase === "awakening"
                  ? 0
                  : 1,
              y: 0,
            }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {phase === "tension" && (
              <motion.div
                className="text-2xl text-red-300"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ textShadow: "0 0 15px #ff6666" }}
              >
                ⏳ Time runs out... something stirs...
              </motion.div>
            )}
            {phase === "approaching" && (
              <motion.div
                className="text-3xl text-red-200"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ textShadow: "0 0 20px #ff4444" }}
              >
                🚛 THE LORRY ARRIVES! Fate accelerates!
              </motion.div>
            )}
            {phase === "impact" && (
              <motion.div
                className="text-4xl text-white"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 2, 1.5] }}
                transition={{ duration: 0.5 }}
                style={{ textShadow: "0 0 30px #ffffff" }}
              >
                💥 CATASTROPHIC IMPACT! 💥
              </motion.div>
            )}
            {phase === "aftermath" && (
              <motion.div
                className="text-3xl text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.5 }}
                style={{ textShadow: "0 0 25px #ff0000" }}
              >
                🩸 Reality fragments... chaos reigns...
              </motion.div>
            )}
            {phase === "splat" && (
              <motion.div
                className="text-4xl text-red-300"
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.5, 1.2],
                  rotate: [0, 10, -5, 0],
                  y: [0, -20, 0],
                }}
                transition={{ duration: 1.5 }}
                style={{ textShadow: "0 0 30px #ff3333" }}
              >
                🩸💥 SPLAT! 💥🩸
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DramaticWaitTransition;
