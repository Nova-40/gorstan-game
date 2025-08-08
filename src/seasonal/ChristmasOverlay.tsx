import React, { useEffect, useMemo } from "react";
import BaseDialog from "./a11y/BaseDialog";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

type Props = { onClose: () => void };

export default function ChristmasOverlay({ onClose }: Props) {
  const reduce = usePrefersReducedMotion();

  // Optional SFX (respect your global SFX toggle elsewhere)
  useEffect(() => {
    // if (sfxEnabled) new Audio('/sfx/chime.mp3').play().catch(() => {});
  }, []);

  const snowLayer = useMemo(() => {
    const flakes = Array.from({ length: 40 }, (_, i) => i);
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {flakes.map((i) => (
          <span
            key={i}
            aria-hidden
            className="absolute block"
            style={{
              left: Math.random() * 100 + "%",
              top: -10 + "px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "white",
              opacity: 0.9,
              animation: reduce ? undefined : `flake ${6 + Math.random() * 5}s linear ${Math.random()}s infinite`
            }}
          />
        ))}
      </div>
    );
  }, [reduce]);

  return (
    <BaseDialog title="Season's Greetings" onClose={onClose}>
      <div className="relative overflow-hidden">
        {!reduce && snowLayer}
        <div className="relative grid gap-3">
          {/* Garland */}
          <div className="flex justify-center gap-2 py-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: i % 2 ? "#ff4d4f" : "#52ffa8",
                  filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                  animation: reduce ? undefined : `twinkle ${1.5 + (i % 3) * 0.2}s ease-in-out ${i * 0.07}s infinite alternate`
                }}
              />
            ))}
          </div>
          <p className="text-sm opacity-90">
            Season's greetings from across the multiverse.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              autoFocus
              className="rounded bg-cyan-600 px-3 py-1.5 text-sm hover:bg-cyan-500 focus:outline-none focus:ring focus:ring-cyan-400"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes flake {
          0% { transform: translateY(-10px); opacity: 0.9; }
          100% { transform: translateY(220px); opacity: 0.2; }
        }
        @keyframes twinkle {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </BaseDialog>
  );
}
