// src/components/PlayerNameCapture.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useState, useCallback, useEffect, useRef } from "react";

import { NPC } from '../types/NPCTypes';

import { useGameState } from "../state/gameState";














// Variable declaration
const GorstanIcon = () => (
  <img
    src="/images/gorstanicon.png"
    alt="Gorstan Terminal Logo"
    className="w-16 h-16 animate-pulse mb-2"
    style={{ filter: "drop-shadow(0 0 8px #00FFBC)" }}
  />
);

// Variable declaration
const instructionsScreens = [
  `Welcome to Gorstan, a text-driven adventure across reality, bureaucracy, and the multiverse.

HOW TO PLAY:
• Type commands into the terminal (e.g., "go north", "take coffee", "use blue button")
• Click direction/action buttons for quick navigation
• Interact with objects and NPCs by typing or clicking
• Some puzzles require careful reading or experimentation
• Use your codex and achievements for clues`,
  `TIPS:
• Pay attention to room descriptions and what NPCs say
• Saving is automatic; returning players resume your last session
• Certain names unlock special content (try your real one?)
• Not everything is as it seems, and resets may reveal new paths

COMMAND EXAMPLES:
• "look" or "examine" — describe the room/item
• "inventory" — see what you're carrying
• "talk to [npc]" — speak with a character
• "use [item]" — use or activate an item
• "reset" — attempt a reality reset

(If you're stuck, try the "Talk to NPC/Help" button for hints.)`,
  `NAVIGATION & SHORTCUTS:
• Use ← and → arrows to move between these help screens
• Press ESC at any time to close instructions or cheat/debug mode
• Begin your adventure by entering a name and pressing [Begin]
• If you want to see the cheat/debug menu, Ctrl+Click (or Cmd+Click) "Instructions"`,
];

// Variable declaration
const cheatInstructions = `
CHEAT/DEBUG MODE

Available commands and toggles (cheat/debug mode only):

• cheat invincible — Immune to most damage
• cheat unlockall — Unlocks all rooms
• cheat resetcount [n] — Set reset counter
• cheat additem [itemname] — Add any item to inventory
• cheat revealmap — Show all room exits
• cheat win — Instantly finish the game
• cheat npc [name] [cmd] — Directly manipulate NPC state
• cheat clear — Wipes game history/console
• cheat god — (Not even Ayla recommends this)

WARNING: Using cheat/debug mode may irreversibly alter your story state, and summon Aevira auditors or make Albie sigh pointedly.
`;

const PlayerNameCapture: React.FC<{ onNameSubmit: (name: string) => void }> = ({ onNameSubmit }) => {
  const { state, dispatch } = useGameState();
// React state declaration
  const [name, setName] = useState(state.player?.name || "");
  const [modal, setModal] = useState<null | "instructions" | "cheat">(null);
// React state declaration
  const [screen, setScreen] = useState(0);

// Variable declaration
  const closeModal = useCallback(() => {
    setModal(null);
    setScreen(0);
  }, []);

  
// React effect hook
  useEffect(() => {
    if (!modal) return;
// Variable declaration
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      } else if (modal === "instructions") {
        if (e.key === "ArrowRight") {
          setScreen((s) => Math.min(s + 1, instructionsScreens.length - 1));
        } else if (e.key === "ArrowLeft") {
          setScreen((s) => Math.max(s - 1, 0));
        }
      }
    };
    window.addEventListener("keydown", handleKey);
// JSX return block or main return
    return () => window.removeEventListener("keydown", handleKey);
  }, [modal, closeModal]);

// Variable declaration
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onNameSubmit(name.trim());
  };

  
// Variable declaration
  const handleInstructionsClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setModal("cheat");
      
      dispatch({ type: 'ENABLE_DEBUG_MODE' });
    } else {
      setModal("instructions");
    }
  };

// JSX return block or main return
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060f17]">
      <div className="rounded-2xl border border-green-400 bg-[#101B24] shadow-xl max-w-md w-full p-8 relative">
        <div className="flex flex-col items-center mb-4">
          <GorstanIcon />
          <h1 className="mt-2 mb-4 text-green-300 text-2xl font-mono text-center">
            Gorstan Terminal Access
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="playerName" className="text-green-400 font-mono mb-2">
            Enter your name:
          </label>
          <input
            id="playerName"
            type="text"
            className="bg-[#0a131e] border border-green-600 rounded px-4 py-2 text-green-300 focus:outline-none font-mono"
            value={name}
            autoFocus
            maxLength={42}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name (max 42 characters)"
          />
          <button
            type="submit"
            className="mt-2 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold font-mono text-lg transition"
            disabled={!name.trim()}
          >
            Begin
          </button>
        </form>
        <button
          className="absolute top-4 right-4 text-green-400 underline font-mono"
          type="button"
          onClick={handleInstructionsClick}
          title="Show instructions"
        >
          Instructions
        </button>
        {modal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-[#101B24] border border-green-400 p-6 rounded-xl max-w-lg w-full relative shadow-xl flex flex-col">
              <h2 className="text-green-300 text-lg font-mono mb-2">
                {modal === "instructions" ? "How to Play" : "Cheat/Debug Mode"}
              </h2>
              {modal === "instructions" ? (
                <>
                  <pre className="text-green-400 text-sm whitespace-pre-line font-mono mb-2">
                    {instructionsScreens[screen]}
                  </pre>
                  <div className="flex flex-row items-center justify-between mt-2">
                    <button
                      className={`px-2 py-1 rounded font-mono ${
                        screen === 0
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-green-700 hover:bg-green-600 text-white"
                      }`}
                      onClick={() => setScreen((s) => Math.max(s - 1, 0))}
                      disabled={screen === 0}
                      tabIndex={-1}
                    >
                      ← Prev
                    </button>
                    <div className="flex gap-1">
                      {instructionsScreens.map((_, i) => (
                        <span
                          key={i}
                          className={`inline-block w-2 h-2 rounded-full ${
                            i === screen
                              ? "bg-green-400"
                              : "bg-green-900"
                          }`}
                        ></span>
                      ))}
                    </div>
                    <button
                      className={`px-2 py-1 rounded font-mono ${
                        screen === instructionsScreens.length - 1
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-green-700 hover:bg-green-600 text-white"
                      }`}
                      onClick={() =>
                        setScreen((s) =>
                          Math.min(s + 1, instructionsScreens.length - 1)
                        )
                      }
                      disabled={screen === instructionsScreens.length - 1}
                      tabIndex={-1}
                    >
                      Next →
                    </button>
                  </div>
                  <div className="text-green-500 text-xs mt-4 font-mono">
                    [Use &larr;/&rarr; to move between screens, Esc to close]
                  </div>
                </>
              ) : (
                <>
                  <pre className="text-green-400 text-sm whitespace-pre-line font-mono mb-2">
                    {cheatInstructions}
                  </pre>
                  <div className="text-green-500 text-xs mt-2 font-mono">
                    [Press Esc to return]
                  </div>
                </>
              )}
              <button
                onClick={closeModal}
                className="mt-4 py-1 px-4 rounded bg-green-700 hover:bg-green-600 text-white font-mono"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerNameCapture;
