// NameEntry.jsx
import { useState } from "react";

export default function NameEntry({ onSubmit }) {
  const [name, setName] = useState("");

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl mb-4">Let’s pretend you matter. What’s your name?</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 text-black rounded"
        placeholder="Enter your name"
      />
      <button
        onClick={() => onSubmit(name)}
        className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-800"
        disabled={!name.trim()}
      >
        Continue
      </button>
    </div>
  );
}