import React from "react";
import BaseDialog from "./a11y/BaseDialog";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

type Props = { onClose: () => void };

export default function May13Overlay({ onClose }: Props) {
  const reduce = usePrefersReducedMotion();

  return (
    <BaseDialog title="Gorstan Day" onClose={onClose}>
      <div className="relative grid gap-3">
        {/* Dominic + balloon placeholder */}
        <div className="relative h-32">
          <div
            aria-hidden
            className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle at 60% 40%, #ffd1dc, #f08080 70%, #b24b4b)",
              boxShadow: "0 8px 24px rgba(240,128,128,0.35)",
              animation: reduce ? undefined : "floaty 3.2s ease-in-out infinite"
            }}
          />
          <div
            aria-hidden
            className="absolute left-[52%] top-28 h-10 w-[1px] bg-white/70"
            style={{ transform: "translateX(-50%)" }}
          />
          {/* Party hat */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: 0, height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "20px solid #ffd84d",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
            }}
          />
        </div>
        <p className="text-sm opacity-90">
          Dominic: <em>Ah yes, Gorstan Day. I accept cake in liquid form.</em>
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
      <style>{`
        @keyframes floaty {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </BaseDialog>
  );
}
