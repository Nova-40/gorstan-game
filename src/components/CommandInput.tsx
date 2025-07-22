import React, { useState } from 'react';



// CommandInput.tsx
// Gorstan Game Engine – Command Input Component
// Version: 6.2.1
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License


type CommandInputProps = {
  onCommand: (command: string) => void;
  playerName: string;
};

const CommandInput: React.FC<CommandInputProps> = ({ onCommand, playerName }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setInput('');
    }
  };

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


