import React, { useEffect, useRef } from 'react';

import { FlagRegistry } from '../state/flagRegistry';

import { GameMessage } from '../types/GameTypes';



// TerminalConsole.tsx — components/TerminalConsole.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: TerminalConsole

// Filename: TerminalConsole.tsx
// Location: components/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License


export interface TerminalMessage {
  text: string;
  type: 'info' | 'error' | 'system' | 'lore';
}


interface TerminalConsoleProps {
  messages?: GameMessage[];
  clear?: boolean;
}


const TerminalConsole: React.FC<TerminalConsoleProps> = ({ messages = [], clear = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Only show narrative (Description) messages
  const filteredMessages = clear ? [] : messages.filter((msg) => msg.type === 'narrative');

  return (
    <div
      ref={scrollRef}
      className="bg-black text-green-400 font-mono text-sm p-2 h-full overflow-y-auto border border-green-600 rounded"
    >
      {filteredMessages.map((msg, idx) => (
        <div key={msg.id + '-' + idx} className="terminal-line terminal-lore">
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default TerminalConsole;
