// BootScreen.jsx
import { useEffect } from "react";

export default function BootScreen({ playerName, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-green-400 font-mono bg-black text-sm px-4">
      <p>> Initialising Simulation for: {playerName}</p>
      <p>> Establishing multiversal coordinates...</p>
      <p>> Loading sarcasm subroutine...</p>
      <p>> Ethics filter... error. Proceeding anyway.</p>
    </div>
  );
}