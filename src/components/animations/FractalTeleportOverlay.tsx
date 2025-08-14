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

import React, { useEffect, useState } from "react";

const FractalTeleportOverlay: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
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
