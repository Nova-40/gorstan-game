// GorstanIntro.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";

const coffeeSpill = new Howl({ src: ["/sounds/coffee-spill.mp3"] });
const truckHorn = new Howl({ src: ["/sounds/truck-horn.mp3"] });
const wormholeSound = new Howl({ src: ["/sounds/wormhole.mp3"] });

export default function GorstanIntro({ onComplete }) {
  const [stage, setStage] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (stage === 0) {
        setStage(1);
        truckHorn.play();
      } else if (stage === 1) {
        setStage(2);
        wormholeSound.play();
      } else if (stage === 2) {
        setStage(3);
        setTimeout(() => onComplete(), 2000);
      }
    }, 3000);

    return () => clearTimeout(timeoutRef.current);
  }, [stage]);

  return (
    <div className="w-full h-screen flex items-center justify-center text-center px-4">
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xl mb-4">You are crossing the road. Drinking your coffee. Everything is fine.</p>
            <img src="/images/hero-coffee.png" alt="Hero with coffee" className="mx-auto" />
          </motion.div>
        )}

        {stage === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xl mb-4">Except for the truck. The truck is... <i>problematic</i>.</p>
            <img src="/images/truck-coming.png" alt="Truck" className="mx-auto" />
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-xl mb-4">Fortunately, quantum instability has perfect timing.</p>
            <img src="/images/wormhole.png" alt="Wormhole" className="mx-auto" />
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1 className="text-4xl font-bold mb-4">Gorstan Protocols: The Simulation Begins</h1>
            <p className="italic">Welcome, player. Your coffee break just became... multiversal.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}