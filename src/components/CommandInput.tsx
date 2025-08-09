// src/components/CommandInput.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Parses and processes player commands.

import React, { useState, useCallback, useMemo } from 'react';

type CommandInputProps = {
  onCommand: (command: string) => void;
  playerName: string;
};

const CommandInput: React.FC<CommandInputProps> = ({ onCommand, playerName }) => {
  const [input, setInput] = useState('');

  // Optimized submit handler with useCallback
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setInput('');
    }
  }, [input, onCommand]);

  // Optimized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  // Memoized placeholder text
  const placeholderText = useMemo(() => 
    `Enter command, ${playerName}`, 
    [playerName]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="border border-blue-500 rounded p-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholderText}
          className="w-full bg-black text-green-400 border-none focus:outline-none font-mono"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </form>
  );
};

export default React.memo(CommandInput);
