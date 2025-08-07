// src/components/CommandInput.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Parses and processes player commands.

import React, { useState } from 'react';










type CommandInputProps = {
  onCommand: (command: string) => void;
  playerName: string;
};

const CommandInput: React.FC<CommandInputProps> = ({ onCommand, playerName }) => {
// React state declaration
  const [input, setInput] = useState('');

// Variable declaration
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setInput('');
    }
  };

// JSX return block or main return
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="border border-blue-500 rounded p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter command, ${playerName}`}
          className="w-full bg-black text-green-400 border-none focus:outline-none font-mono"
        />
      </div>
    </form>
  );
};

export default CommandInput;
