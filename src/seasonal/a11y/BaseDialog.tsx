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

import React, { useEffect, useRef, useCallback } from "react";

type BaseDialogProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  labelledById?: string; // optional override for aria-labelledby
};

export default function BaseDialog({ title, children, onClose, labelledById }: BaseDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const headingId = labelledById ?? "dialog-title-" + Math.random().toString(36).slice(2);

  // Focus management (trap + restore)
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab") {
        // basic focus trap
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  const onBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropClick}
      aria-hidden={false}
      className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl bg-[#0b0f14] text-[#e6f4ff] shadow-2xl outline-none ring-1 ring-white/10"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 id={headingId} className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-sm hover:bg-white/10 focus:outline-none focus:ring focus:ring-cyan-400"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
