/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: General utility or configuration file.
 */

// Vowel Lattice Puzzle Component (Gorstan)
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { sha256 } from "js-sha256";

// Hashed answer: "blent,brick,span,torn,kill"
const correctHash = sha256("blent,brick,span,torn,kill");

export default function VowelLatticePuzzle({ onSolve }) {
  const [attempts, setAttempts] = useState(0);
  const [inputs, setInputs] = useState(["", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);

  const handleChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = () => {
    if (attempts >= 5 || solved) return;

    const cleaned = inputs.map(word => word.trim().toLowerCase()).join(",");
    const hashed = sha256(cleaned);

    if (hashed === correctHash) {
      setSolved(true);
      setMessage("The obsidian pulses with light. You have spoken truly. The Builders would be pleased. [+60 Points]");
      if (typeof onSolve === 'function') onSolve();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setMessage(
        newAttempts >= 5
          ? "The last echo fades. The lattice will not respond again."
          : `The lattice remains still. You may try again. Attempts left: ${5 - newAttempts}.`
      );
    }
  };

  return (
    <Card className="max-w-xl mx-auto p-4">
      <CardContent className="space-y-4">
        <p className="text-lg italic text-gray-300">
          "The Builders etched five forms, raw and formless — A truth hidden not in meaning, but in motion. They are close to what they are not. Speak their unspoken selves, and the lattice may open to you. You may try five times — no more."
        </p>

        {inputs.map((word, i) => (
          <Input
            key={i}
            value={word}
            disabled={solved || attempts >= 5}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`Word ${i + 1}`}
          />
        ))}

        <Button onClick={handleSubmit} disabled={solved || attempts >= 5}>
          Submit Words
        </Button>

        {message && <p className="text-md text-center text-yellow-300 font-semibold">{message}</p>}
      </CardContent>
    </Card>
  );
}
