import React, { useEffect, useState } from "react";

const FractalTeleportOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 3000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black animate-fractal-blink flex items-center justify-center text-white text-xl">
      <div className="fractal-tunnel">✨ Glitching the fabric…</div>
      <audio autoPlay src="/audio/teleport-fractal.wav" />
    </div>
  );
};

export default FractalTeleportOverlay;
