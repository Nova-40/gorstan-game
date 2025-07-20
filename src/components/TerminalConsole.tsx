// TerminalConsole.tsx — components/TerminalConsole.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: TerminalConsole

// Filename: TerminalConsole.tsx
// Location: components/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import React, { useEffect, useRef } from 'react';
import { GameMessage } from '../types/GameTypes';

export interface TerminalMessage {
  text: string;
  type: 'info' | 'error' | 'system' | 'lore';
}

interface TerminalConsoleProps {
  messages?: GameMessage[];
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({ messages = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Map GameMessage types to TerminalMessage types
  const mapMessageType = (type: GameMessage['type']): TerminalMessage['type'] => {
    switch (type) {
      case 'narrative':
      case 'dialogue':
        return 'lore';
      case 'action':
      case 'success':
        return 'info';
      case 'error':
      case 'warning':
        return 'error';
      case 'achievement':
        return 'info';
      case 'system':
      default:
        return 'system';
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="bg-black text-green-400 font-mono text-sm p-2 h-full overflow-y-auto border border-green-600 rounded"
    >
      {messages.map((msg) => (
        <div key={msg.id} className={`terminal-line terminal-${mapMessageType(msg.type)}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default TerminalConsole;
