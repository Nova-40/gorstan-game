/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Ayla's Hint Popup - Cosmic guidance overlay
*/

import React, { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import type { AylaHintResponse } from "../services/aylaHintSystem";

interface AylaHintPopupProps {
  hint: AylaHintResponse | null;
  onDismiss: () => void;
  onTalkToAyla?: () => void;
}

const AylaHintPopup: React.FC<AylaHintPopupProps> = ({
  hint,
  onDismiss,
  onTalkToAyla,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hint) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-dismiss after 15 seconds for low urgency hints
      if (hint.urgency === "low") {
        const timer = setTimeout(() => {
          handleDismiss();
        }, 15000);

        return () => clearTimeout(timer);
      }
    }
  }, [hint]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  const getUrgencyColors = (urgency: AylaHintResponse["urgency"]) => {
    switch (urgency) {
      case "high":
        return "from-purple-900 to-indigo-900 border-purple-400";
      case "medium":
        return "from-blue-900 to-purple-900 border-blue-400";
      case "low":
        return "from-indigo-900 to-blue-900 border-indigo-400";
      default:
        return "from-blue-900 to-purple-900 border-blue-400";
    }
  };

  const getHintIcon = (hintType: AylaHintResponse["hintType"]) => {
    switch (hintType) {
      case "navigation":
        return "🧭";
      case "puzzle":
        return "🧩";
      case "interaction":
        return "💬";
      case "safety":
        return "⚠️";
      case "story":
        return "📖";
      default:
        return "✨";
    }
  };

  if (!hint || !isVisible) {return null;}

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? "bg-opacity-20" : "bg-opacity-0"
        }`}
      />

      {/* Hint Popup */}
      <div
        className={`relative pointer-events-auto max-w-md mx-4 transform transition-all duration-300 ${
          isAnimating
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 scale-95"
        }`}
      >
        <div
          className={`
          bg-gradient-to-br ${getUrgencyColors(hint.urgency)}
          border-2 rounded-lg shadow-2xl overflow-hidden
          backdrop-blur-sm bg-opacity-95
        `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-opacity-30 border-white">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Ayla's Guidance
                </h3>
                <p className="text-xs text-blue-200">
                  {getHintIcon(hint.hintType)}{" "}
                  {hint.hintType.charAt(0).toUpperCase() +
                    hint.hintType.slice(1)}{" "}
                  Hint
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Hint Content */}
          <div className="p-4">
            <p className="text-white text-sm leading-relaxed mb-3">
              {hint.hintText}
            </p>

            {hint.followUp && (
              <p className="text-blue-200 text-xs italic mb-3">
                {hint.followUp}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2 text-xs rounded bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
              >
                Thanks, Ayla
              </button>

              {onTalkToAyla && (
                <button
                  onClick={() => {
                    handleDismiss();
                    onTalkToAyla();
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  Talk to Ayla
                </button>
              )}
            </div>
          </div>

          {/* Cosmic Animation */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-ping" />
            <div className="absolute bottom-2 left-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AylaHintPopup;
