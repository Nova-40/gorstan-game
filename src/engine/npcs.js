/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Manages NPC behaviors and state tracking.
 */

// npcs.js – NPC Profiles for The Gorstan Chronicles Game
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025
// npcs.js – NPC Profiles for The Gorstan Chronicles Game
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

import { useEffect } from 'react';

const npcs = {
  Morthos: {
    name: 'Morthos',
    description: 'A cloaked operative with dry wit and deadly focus.',
    dialogue: [
      'This place is a memory, Dale.',
      'If you get caught, I’m not saving you twice.'
    ]
  },
  Al: {
    name: 'AL (AI Guardian)',
    description: 'Your sarcastic AI companion with a knack for quantum snark.',
    dialogue: [
      'Careful now, or you’ll trip over your own causality.',
      'Fae logic: because normal logic wasn’t annoying enough.'
    ]
  },
  Jenny: {
    name: 'Jenny',
    description: 'A Lord from Gorstan with pragmatic resolve and a sharp mind.',
    dialogue: [
      'We do what we must. No illusions about that.',
      'Balance first. Always.'
    ]
  },
  Ayla: {
    name: 'Ayla',
    description: 'An AI/human hybrid linked to the Lattice.',
    dialogue: [
      'I’m not technically here yet. But I can still crash things.',
      'Find the fragment. I’ll meet you at the resonance point.'
    ]
  },
  EidolonCollective: {
    name: 'The Eidolon Collective',
    description: 'A remnant hive of alien intellect, cryptic and ancient.',
    dialogue: [
      'We have seen five cycles. You are anomaly six.',
      'Truth fractures under scrutiny. So do you.'
    ]
  }
};

// Utility to validate NPCs
function validateNpc(npc) {
  if (!npc.name || typeof npc.name !== 'string') {
    console.error(`NPC is missing a valid 'name':`, npc);
    return false;
  }
  if (!npc.description || typeof npc.description !== 'string') {
    console.error(`NPC '${npc.name}' is missing a valid 'description':`, npc);
    return false;
  }
  if (!Array.isArray(npc.dialogue) || npc.dialogue.length === 0) {
    console.error(`NPC '${npc.name}' is missing valid 'dialogue':`, npc);
    return false;
  }
  return true;
}

// Validate all NPCs on load
Object.values(npcs).forEach((npc) => {
  if (!validateNpc(npc)) {
    console.warn(`Invalid NPC detected:`, npc);
  }
});

// Utility to retrieve an NPC by name
export function getNpcByName(name) {
  return npcs[name] || null;
}

// Utility to get a random dialogue line from an NPC
export function getRandomDialogue(npcName) {
  const npc = getNpcByName(npcName);
  if (!npc || !npc.dialogue) {
    console.error(`NPC '${npcName}' not found or has no dialogue.`);
    return null;
  }
  const randomIndex = Math.floor(Math.random() * npc.dialogue.length);
  return npc.dialogue[randomIndex];
}

// 🔁 useNpcChatter – Hook for NPC ambient dialogue and rare interactions
export function useNpcChatter({ currentRoom, morthosHelped, alHelped, npcs, playerName, notify }) {
  useEffect(() => {
    if (morthosHelped && Math.random() < 0.05) {
      notify(`Morthos sneers: "${getRandomDialogue('Morthos')}, ${playerName}."`);
    } else if (!morthosHelped && npcs.morthos && Math.random() < 0.01) {
      notify(`Morthos leans from a shadow. 'Changed your mind yet, ${playerName}?' (Type: say help me morthos)`);
    }

    if (alHelped && Math.random() < 0.05) {
      notify(`Al hums, "${getRandomDialogue('Al')}" — and smiles. 'This is why I love Earth, ${playerName}.'`);
    } else if (!alHelped && npcs.al && Math.random() < 0.01) {
      notify(`Al floats into view. 'Hey again, ${playerName}. Say the word if you change your mind.'`);
    }
  }, [currentRoom]);
}

export default npcs;
