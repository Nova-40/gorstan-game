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

import React, { useEffect } from "react";

const TrekTeleportOverlay: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
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
