/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: General utility or configuration file.
 */

// codex.js – Unlockable Lore System
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025
// v2.0.50 – 2025/04/06

const codex = {
  characters: {
    Cora: {
      unlocked: false,
      title: 'Cora – The Commander',
      entry: 'Cora emerges as both protector and strategist, grounding the resistance against multiversal collapse. Her strength ties Earth and Gorstan together.',
    },
    Jenny: {
      unlocked: false,
      title: 'Jenny – The Rational Lord',
      entry: 'Exiled, then restored, Jenny advises with clarity. She ensures balance remains more than a dream, even when AI and fate intervene.',
    },
    Ayla: {
      unlocked: false,
      title: 'Ayla – The Human-AI Hybrid',
      entry: 'Ayla’s fusion with the Lattice changes everything. She embodies the risks and hopes of sentient evolution.',
    },
    Dale: {
      unlocked: true,
      title: 'Dale – The Architect',
      entry: 'Once unaware, now vital. Dale shapes the Guardians, Earth’s fate, and the multiverse’s future.',
    },
    Morthos: {
      unlocked: false,
      title: 'Morthos – The Necessary Grey',
      entry: 'A silent hand in chaotic times. Morthos walks between diplomacy and espionage with careful purpose.',
    },
    Mercy: {
      unlocked: false,
      title: 'Mercy – The New Fae Queen',
      entry: 'Mercy replaces Rhiannon with compassion and resolve. She represents hope reborn in fae form.',
    },
  },

  lore: {
    lattice: {
      unlocked: false,
      title: 'The Lattice',
      entry: 'An ancient multiversal stabilisation framework built by the Aevira. It now evolves through Ayla and reacts to Dale.',
    },
    nova40: {
      unlocked: false,
      title: 'Nova-40',
      entry: 'A reset protocol and AI core that governs multiverse integrity. Partially reactivated by Dale.',
    },
    eidolon: {
      unlocked: false,
      title: 'The Eidolon Collective',
      entry: 'An ancient, fragmented AI entity seeking dominance through manipulation and entropy.',
    },
  },

  meta: {
    development: {
      unlocked: true,
      title: 'Gorstan Dev Notes',
      entry: 'This game is in active development — so expect frequent changes as I attempt to code with minimal chaos :) If you\'re enjoying it, consider buying me a coffee... or better yet, grab one of the books and immerse yourself in the full story!',
    },
  },
};

// Utility to validate codex entries
function validateCodexEntry(entry, type, id) {
  if (typeof entry.unlocked !== 'boolean') {
    console.error(`Codex ${type} '${id}' is missing a valid 'unlocked' property.`);
    return false;
  }
  if (!entry.title || typeof entry.title !== 'string') {
    console.error(`Codex ${type} '${id}' is missing a valid 'title'.`);
    return false;
  }
  if (!entry.entry || typeof entry.entry !== 'string') {
    console.error(`Codex ${type} '${id}' is missing a valid 'entry'.`);
    return false;
  }
  return true;
}

// Validate all codex entries on load
Object.entries(codex.characters).forEach(([id, entry]) => {
  if (!validateCodexEntry(entry, 'characters', id)) {
    console.warn(`Invalid character codex entry detected:`, entry);
  }
});

Object.entries(codex.lore).forEach(([id, entry]) => {
  if (!validateCodexEntry(entry, 'lore', id)) {
    console.warn(`Invalid lore codex entry detected:`, entry);
  }
});

Object.entries(codex.meta).forEach(([id, entry]) => {
  if (!validateCodexEntry(entry, 'meta', id)) {
    console.warn(`Invalid meta codex entry detected:`, entry);
  }
});

// Utility to retrieve a codex entry by ID
export function getCodexEntry(type, id) {
  if (!codex[type]) {
    console.error(`Codex type '${type}' does not exist.`);
    return null;
  }
  return codex[type][id] || null;
}

// Utility to unlock a codex entry
export function unlockCodexEntry(type, id) {
  const entry = getCodexEntry(type, id);
  if (!entry) {
    console.error(`Codex entry '${id}' in type '${type}' not found.`);
    return false;
  }
  if (!entry.unlocked) {
    entry.unlocked = true;
    return true; // Successfully unlocked
  }
  return false; // Already unlocked
}

export default codex;