import React, { useState, useEffect, useCallback, useMemo } from "react";
import FractalTeleportOverlay from "./FractalTeleportOverlay";
import TrekTeleportOverlay from "./TrekTeleportOverlay";

type TeleportType = "fractal" | "trek" | null;

const TeleportManager: React.FC<{
  teleportType: TeleportType;
  onComplete: () => void;
}> = ({ teleportType, onComplete }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Memoized media query setup
  const mediaQuery = useMemo(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null,
    []
  );

  useEffect(() => {
    if (!mediaQuery) return;
    
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  // Optimized callback for reduced motion timeout
  const handleReducedMotionComplete = useCallback(() => {
    const timeout = setTimeout(onComplete, 100);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  if (!teleportType) return null;
  
  // If user prefers reduced motion, skip animation
  if (prefersReducedMotion) {
    console.log('[TeleportManager] Skipping animation due to prefers-reduced-motion');
    useEffect(handleReducedMotionComplete, [handleReducedMotionComplete]);
    
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white text-xl">
        Transitioning...
      </div>
    );
  }
  
  console.log('[TeleportManager] Rendering teleport animation:', teleportType);
  
  // Optimized component selection
  return teleportType === "fractal" 
    ? <FractalTeleportOverlay onComplete={onComplete} />
    : <TrekTeleportOverlay onComplete={onComplete} />;
};

export default TeleportManager;
