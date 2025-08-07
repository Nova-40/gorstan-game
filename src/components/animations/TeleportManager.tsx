import React, { useState } from "react";
import FractalTeleportOverlay from "./FractalTeleportOverlay";
import TrekTeleportOverlay from "./TrekTeleportOverlay";

type TeleportType = "fractal" | "trek" | null;
import { useEffect } from 'react';

const TeleportManager: React.FC<{
  teleportType: TeleportType;
  onComplete: () => void;
}> = ({ teleportType, onComplete }) => {
  if (!teleportType) return null;
  if (teleportType === "fractal")
    return <FractalTeleportOverlay onComplete={onComplete} />;
  return <TrekTeleportOverlay onComplete={onComplete} />;
};

export default TeleportManager;
