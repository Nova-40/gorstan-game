import React, { useEffect } from "react";

const TrekTeleportOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 3000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <div className="shimmer-lines w-full h-full animate-trek-shimmer" />
      <audio autoPlay src="/audio/teleport-trek.wav" />
    </div>
  );
};

export default TrekTeleportOverlay;
