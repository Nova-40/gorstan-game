// codex.js – Unlockable Lore System
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

const codex = {
  characters: {
    Cora: {
      unlocked: false,
      title: 'Cora – The Commander',
      entry: 'Cora emerges as both protector and strategist, grounding the resistance against multiversal collapse. Her strength ties Earth and Gorstan together.'
    },
    Jenny: {
      unlocked: false,
      title: 'Jenny – The Rational Lord',
      entry: 'Exiled, then restored, Jenny advises with clarity. She ensures balance remains more than a dream, even when AI and fate intervene.'
    },
    Ayla: {
      unlocked: false,
      title: 'Ayla – The Human-AI Hybrid',
      entry: 'Ayla’s fusion with the Lattice changes everything. She embodies the risks and hopes of sentient evolution.'
    },
    Dale: {
      unlocked: true,
      title: 'Dale – The Architect',
      entry: 'Once unaware, now vital. Dale shapes the Guardians, Earth’s fate, and the multiverse’s future.'
    },
    Morthos: {
      unlocked: false,
      title: 'Morthos – The Necessary Grey',
      entry: 'A silent hand in chaotic times. Morthos walks between diplomacy and espionage with careful purpose.'
    },
    Mercy: {
      unlocked: false,
      title: 'Mercy – The New Fae Queen',
      entry: 'Mercy replaces Rhiannon with compassion and resolve. She represents hope reborn in fae form.'
    }
  },

  lore: {
    lattice: {
      unlocked: false,
      title: 'The Lattice',
      entry: 'An ancient multiversal stabilisation framework built by the Aevira. It now evolves through Ayla and reacts to Dale.'
    },
    nova40: {
      unlocked: false,
      title: 'Nova-40',
      entry: 'A reset protocol and AI core that governs multiverse integrity. Partially reactivated by Dale.'
    },
    eidolon: {
      unlocked: false,
      title: 'The Eidolon Collective',
      entry: 'An ancient, fragmented AI entity seeking dominance through manipulation and entropy.'
    }
  }
};

export default codex;