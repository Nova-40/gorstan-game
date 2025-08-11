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
import BaseDialog from "./a11y/BaseDialog";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

type Props = { onClose: () => void };

export default function EasterEggOverlay({ onClose }: Props) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    // Optional confetti hook here; skip if reduce is true.
    // Example placeholder: // if (!reduce) fireConfetti();
  }, [reduce]);

  return (
    <BaseDialog title="A Seasonal Surprise" onClose={onClose}>
      <div className="grid gap-3">
        {}
        <div
          aria-hidden
          className="mx-auto h-28 w-20"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, #ffe08a, #ffb347 60%, #d98c2e 100%)",
            borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
            animation: reduce ? undefined : "egg-bounce 1.6s ease-in-out infinite"
          }}
        />
        <p className="text-sm opacity-90">
          Ayla: <em>Please don't tap — it's not boiled.</em>
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            autoFocus
            className="rounded bg-cyan-600 px-3 py-1.5 text-sm hover:bg-cyan-500 focus:outline-none focus:ring focus:ring-cyan-400"
          >
            Continue
          </button>
        </div>
      </div>
      <style>{`
        @keyframes egg-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .egg { animation: none !important; }
        }
      `}</style>
    </BaseDialog>
  );
}
