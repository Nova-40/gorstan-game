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

// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useEffect, useRef } from "react";

import { FlagMap } from "../state/flagRegistry";

import { GameMessage } from "../types/GameTypes";

export interface TerminalMessage {
  text: string;
  type: "info" | "error" | "system" | "lore";
}

interface TerminalConsoleProps {
  messages?: GameMessage[];
  clear?: boolean;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  messages = [],
  clear = false,
}) => {
  // Variable declaration
  const scrollRef = useRef<HTMLDivElement>(null);

  // React effect hook
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Variable declaration
  const filteredMessages = clear
    ? []
    : messages.filter((msg) => msg.type === "narrative");

  // JSX return block or main return
  return (
    <div
      ref={scrollRef}
      className="bg-black text-green-400 font-mono text-sm p-2 h-full overflow-y-auto border border-green-600 rounded"
    >
      {filteredMessages.map((msg, idx) => (
        <div key={msg.id + "-" + idx} className="terminal-line terminal-lore">
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default TerminalConsole;
