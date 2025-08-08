import React, { useState, useEffect } from "react";
import FractalTeleportOverlay from "./FractalTeleportOverlay";
import TrekTeleportOverlay from "./TrekTeleportOverlay";

type TeleportType = "fractal" | "trek" | null;

const TeleportManager: React.FC<{
  teleportType: TeleportType;
  onComplete: () => void;
}> = ({ teleportType, onComplete }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!teleportType) return null;
  
  // If user prefers reduced motion, skip animation
  if (prefersReducedMotion) {
    console.log('[TeleportManager] Skipping animation due to prefers-reduced-motion');
    useEffect(() => {
      const timeout = setTimeout(onComplete, 100);
      return () => clearTimeout(timeout);
    }, [onComplete]);
    
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white text-xl">
        Transitioning...
      </div>
    );
  }
  
  console.log('[TeleportManager] Rendering teleport animation:', teleportType);
  if (teleportType === "fractal")
    return <FractalTeleportOverlay onComplete={onComplete} />;
  return <TrekTeleportOverlay onComplete={onComplete} />;
};

export default TeleportManager;
