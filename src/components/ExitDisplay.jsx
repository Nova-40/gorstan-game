/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Displays the exit logic and user prompts.
 */

// ExitDisplay.jsx – Modular component for rendering room exits with dynamic labels
import React, { useEffect, useState } from 'react';

export default function ExitDisplay({ currentRoom, rooms, secretExits, inventory, secretDoorRevealed }) {
  const [revealedSecretKeys, setRevealedSecretKeys] = useState([]);

  useEffect(() => {
    const revealed = Object.keys(rooms[currentRoom]?.exits || {})
      .filter(key => key.startsWith('secret:'))
      .filter(key => {
        const code = key.split(':')[1];
        return secretExits[code] || inventory.includes('briefcase') || secretDoorRevealed;
      });
    setRevealedSecretKeys(revealed);
  }, [currentRoom, secretExits, inventory, secretDoorRevealed, rooms]);

  const visibleExits = [...Object.entries(rooms[currentRoom]?.exits || {})]
    .filter(([key]) => {
      if (key.startsWith('secret:')) {
        const code = key.split(':')[1];
        return secretExits[code] || inventory.includes('briefcase') || secretDoorRevealed;
      }
      return true;
    })
    .map(([key]) => {
      const isNew = revealedSecretKeys.includes(key);
      if (key.startsWith('secret:')) {
        const code = key.split(':')[1];
        let label = 'secret passage';
        let color = 'text-yellow-400';
        if (inventory.includes('briefcase')) {
          label = 'glowing archway';
          color = 'text-purple-400';
        } else if (secretDoorRevealed) {
          label = 'hidden panel';
          color = 'text-amber-400';
        }
        return (
          <strong key={key} className={`${color} ${isNew ? 'animate-pulse' : ''}`}>{label}</strong>
        );
      }
      return <span key={key}>{key}</span>;
    })
    .reduce((acc, elem, idx, arr) => {
      acc.push(elem);
      if (idx < arr.length - 1) acc.push(', ');
      return acc;
    }, []);

    // Patch for ExitDisplay.jsx – adds 'enter hidden panel' to the helper text

// ExitDisplay.jsx – dynamic helper text with context-sensitive secret door prompt

return (
  <div className="mb-2 text-gray-400 text-sm">
    <span>Exits are: {visibleExits}.</span>
    <br />
    Use the input box to move — e.g., type <em>go north</em>, <em>go down</em>
    {secretDoorRevealed && (
      <>
        , or <em className="text-amber-400 font-semibold">enter hidden panel</em>
      </>
    )}.
  </div>
);


}
