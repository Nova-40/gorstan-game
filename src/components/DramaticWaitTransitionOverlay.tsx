// Gorstan Dramatic Wait Transition Overlay
// Version: 2.0.0
// (c) 2025 Geoffrey Alan Webster
// Module: DramaticWaitTransitionOverlay.tsx
// Description: Enhanced dramatic splat sequence with multiple stages and intense effects

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DramaticWaitTransitionOverlayProps {
  onComplete: () => void;
}

const DramaticWaitTransitionOverlay: React.FC<DramaticWaitTransitionOverlayProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'approaching' | 'warning' | 'impact' | 'splat' | 'void' | 'reconstruction'>('approaching');
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Initialize audio with better error handling and fallbacks
  const initializeAudio = () => {
    const audio = {
      truckHorn: new Audio('/audio/truckhorn.mp3'),        // ✅ Working - 107KB
      splat: new Audio('/audio/keystroke.mp3'),            // ✅ Working - 6KB (using keystroke as impact sound)
      wilhelm: new Audio('/audio/wilhelm.mp3')             // ✅ Working - 31KB
    };

    // Set volume levels
    audio.truckHorn.volume = 0.7;
    audio.splat.volume = 0.9;  // Boost volume for keystroke used as impact
    audio.wilhelm.volume = 0.6;

    // Preload audio files
    audio.truckHorn.preload = 'auto';
    audio.splat.preload = 'auto';
    audio.wilhelm.preload = 'auto';

    return audio;
  };

  // Play audio with fallback handling
  const playAudioSafely = async (audioElement: HTMLAudioElement, name: string) => {
    try {
      await audioElement.play();
      console.log(`[DramaticTransition] ${name} audio played successfully`);
    } catch (error) {
      console.warn(`[DramaticTransition] ${name} audio blocked by browser:`, error);
      setAudioBlocked(true);
    }
  };

  useEffect(() => {
    // Initialize audio on component mount
    const audio = initializeAudio();
    
    // Try to play truck horn immediately with better error handling
    const playTruckHorn = async () => {
      try {
        await playAudioSafely(audio.truckHorn, 'Truck Horn');
        setAudioInitialized(true);
      } catch (error) {
        console.warn('[DramaticTransition] Audio initialization failed:', error);
        setAudioInitialized(true);
        setAudioBlocked(true);
      }
    };

    playTruckHorn();

    const timers = [
      // Stage progression with extended dramatic timing
      setTimeout(() => setStage('warning'), 1500),
      setTimeout(() => setStage('impact'), 3000),
      setTimeout(() => {
        // Play wilhelm scream with error handling
        playAudioSafely(audio.wilhelm, 'Wilhelm Scream');
        setStage('splat');
      }, 3200),
      setTimeout(() => {
        // Play splat sound with error handling
        playAudioSafely(audio.splat, 'Impact Sound');
      }, 3400),
      setTimeout(() => setStage('void'), 4500),
      setTimeout(() => setStage('reconstruction'), 6000),
      setTimeout(() => onComplete(), 8000),
    ];
    
    return () => {
      timers.forEach(clearTimeout);
      // Stop all audio on cleanup
      try {
        audio.truckHorn.pause();
        audio.truckHorn.currentTime = 0;
        audio.splat.pause();
        audio.splat.currentTime = 0;
        audio.wilhelm.pause();
        audio.wilhelm.currentTime = 0;
      } catch (error) {
        console.warn('[DramaticTransition] Audio cleanup error:', error);
      }
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Stage 1: Approaching - Red glow with pulsing intensity */}
        {stage === 'approaching' && (
          <>
            <motion.div
              className="absolute inset-0 bg-red-900"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0.1, 0.4, 0.2, 0.5],
                scale: [1, 1.02, 1, 1.03, 1, 1.05]
              }}
              transition={{ 
                duration: 1.5,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-red-400 font-mono text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-4">🚛</div>
                <div>Something approaches...</div>
                <div className="text-lg mt-2 opacity-75">You hear the rumble of an engine...</div>
                {audioBlocked && (
                  <div className="text-sm mt-4 opacity-50 text-yellow-400">
                    🔇 Audio blocked by browser - Visual effects only
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Stage 2: Warning - Intense red with screen shake */}
        {stage === 'warning' && (
          <>
            <motion.div
              className="absolute inset-0 bg-red-800"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 0.8, 0.4, 0.9, 0.5, 1.0],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)", "blur(3px)", "blur(0px)", "blur(1px)"]
              }}
              transition={{ 
                duration: 1.5,
                repeat: 1,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{ 
                x: [-2, 2, -1, 1, 0],
                y: [-1, 1, -2, 2, 0]
              }}
              transition={{ 
                duration: 0.1,
                repeat: 15,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-red-200 font-mono text-3xl">
                <div className="text-center">
                  <div className="animate-bounce text-6xl mb-4">⚠️</div>
                  <div className="animate-pulse">DANGER! IMPACT IMMINENT!</div>
                  <div className="text-xl mt-2 animate-pulse">The lorry bears down on you!</div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Stage 3: Impact - Blinding white flash with extreme intensity */}
        {stage === 'impact' && (
          <>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0.8, 1, 0.9, 1],
                scale: [1, 1.2, 1.1, 1.3, 1.15, 1.5]
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute inset-0 bg-yellow-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.6, 0.9] }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
            />
          </>
        )}

        {/* Stage 4: Splat - Dramatic blood-red overlay with text */}
        {stage === 'splat' && (
          <>
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_#8B0000_70%,_#4B0000_100%)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 0.8, 1],
                scale: [0.5, 1.2, 1.1, 1]
              }}
              transition={{ duration: 1.2 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-red-400 font-mono"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0, 1, 0.9, 1],
                scale: [0.8, 1.2, 1.1, 1]
              }}
              transition={{ duration: 1 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-8xl mb-8"
                  animate={{ 
                    rotate: [0, -5, 5, -3, 3, 0],
                    scale: [1, 1.1, 0.9, 1.05, 0.95, 1]
                  }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  💥
                </motion.div>
                <motion.div 
                  className="text-4xl font-bold mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  SPLAT.
                </motion.div>
                <motion.div 
                  className="text-lg opacity-75"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Well, that was dramatic...
                </motion.div>
              </div>
            </motion.div>
          </>
        )}

        {/* Stage 5: Void - Complete darkness with minimal text */}
        {stage === 'void' && (
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center text-gray-600 font-mono text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.6] }}
              transition={{ duration: 1.5 }}
            >
              ...
            </motion.div>
          </motion.div>
        )}

        {/* Stage 6: Reconstruction - Reality rebuilding */}
        {stage === 'reconstruction' && (
          <>
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 2 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-green-400 font-mono text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-2xl mb-4"
                  animate={{ opacity: [0, 1, 0.8, 1] }}
                  transition={{ duration: 1 }}
                >
                  ⚡ REALITY RECONSTRUCTION INITIATED ⚡
                </motion.div>
                <motion.div
                  className="text-base opacity-75"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.75 }}
                  transition={{ delay: 1 }}
                >
                  Quantum state restored...
                </motion.div>
                <motion.div
                  className="text-sm mt-2 opacity-50"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 0.5 }}
                  transition={{ delay: 1.5 }}
                >
                  You find yourself somewhere else entirely...
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DramaticWaitTransitionOverlay;
