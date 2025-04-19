/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Renders and processes the briefcase puzzle interface.
 */


// BriefcasePuzzle.jsx – Logic Challenge from Al, Polly, and Morthos

import React, { useState } from 'react';

export default function BriefcasePuzzle({ onSolve }) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    const normalized = answer.trim().toLowerCase();
    if (normalized === 'not enough information') {
      onSolve();
      setFeedback('Correct. The briefcase dissolves into light. You hold a medallion of impossible weightlessness.');
    } else {
      setFeedback('Incorrect. Morthos cackles in seventeen frequencies. Try again.');
    }
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4 text-yellow-300">Security Directive IX</h2>
      <p className="mb-3 italic text-gray-300">Three agents have spoken. Only one tells the truth. The others deceive — or worse.</p>
      <ul className="mb-4 space-y-2 text-sm text-blue-200 list-disc list-inside">
        <li><strong>Al:</strong> "Polly has never lied about the object in question."</li>
        <li><strong>Polly:</strong> "Morthos always lies, even about lying."</li>
        <li><strong>Morthos:</strong> "I only lie when Al is telling the truth."</li>
      </ul>
      <p className="mb-3">Based on their statements, is the object safe to use?</p>
      <input
        type="text"
        placeholder="Your answer (e.g. Not enough information)"
        className="w-full p-2 mb-2 rounded text-black"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white"
      >
        Submit
      </button>
      {feedback && <p className="mt-3 text-green-300">{feedback}</p>}
    </div>
  );
}
