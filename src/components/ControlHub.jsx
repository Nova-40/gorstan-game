// ControlHub.jsx
import { useState } from "react";

export default function ControlHub({ playerName }) {
  const [message, setMessage] = useState("");

  const handleAction = (action) => {
    if (action === "start") {
      setMessage("Simulated reality engaged. Try not to break it.");
    } else if (action === "logs") {
      setMessage("Access denied. You're not important enough yet.");
    } else if (action === "coffee") {
      setMessage("Mmm. Tastes like disappointment. Achievement unlocked: Caffeinated.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl mb-4">Welcome, {playerName}. Choose your next move:</h2>
      <div className="space-x-4 mb-6">
        <button onClick={() => handleAction("start")} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-800">Start Simulation</button>
        <button onClick={() => handleAction("logs")} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-800">Review Logs</button>
        <button onClick={() => handleAction("coffee")} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-800">Drink More Coffee</button>
      </div>
      {message && <p className="italic mt-4">{message}</p>}
          {message && <p className="italic mt-4">{message}</p>}

      <div className="absolute bottom-4 text-sm text-gray-400">
        ☕ Support the game’s development: <a href="https://buymeacoffee.com/gorstan" target="_blank" className="underline hover:text-white">buymeacoffee.com/gorstan</a>
      </div>
    </div>
  );

}