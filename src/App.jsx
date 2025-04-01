// App.jsx - Gorstan Protocols Interactive Prototype
import { useState } from "react";
import GorstanIntro from "./components/GorstanIntro";
import NameEntry from "./components/NameEntry";
import BootScreen from "./components/BootScreen";
import ControlHub from "./components/ControlHub";

export default function App() {
  const [stage, setStage] = useState("intro");
  const [playerName, setPlayerName] = useState("");

  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      {stage === "intro" && <GorstanIntro onComplete={() => setStage("name")} />}
      {stage === "name" && <NameEntry onSubmit={(name) => { setPlayerName(name); setStage("boot"); }} />}
      {stage === "boot" && <BootScreen onComplete={() => setStage("hub")} playerName={playerName} />}
      {stage === "hub" && <ControlHub playerName={playerName} />}
    </div>
  );
}
