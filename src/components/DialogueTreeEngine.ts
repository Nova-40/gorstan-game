// PATCHED: DialogueTreeEngine.js
export const npcDialogueTrees = {
  'mr wendell': {
    mode: 'tree',
    start: {
      line: "Well? Speak up. Use the proper title next time.",
      options: [
        { text: "Sorry, Mr. Wendell.", next: "accept" },
        { text: "Why are you like this?", next: "why" }
      ]
    },
    accept: {
      line: "Too late, but I appreciate the gesture. Now, what do you want?",
      options: [{ text: "Just passing by.", next: "end" }]
    },
    why: {
      line: "Because manners are the last thread holding the universe together.",
      options: [{ text: "You're terrifying.", next: "end" }]
    },
    end: {
      line: "Indeed. Good day.",
      options: []
    }
  },

  polly: {
    mode: 'tree',
    start: {
      line: "You're not still dragging Dominic around, are you?",
      options: [
        { text: "I lost him...", next: "rage" },
        { text: "He's safe.", next: "suspicious" }
      ]
    },
    rage: {
      line: "You what?! I’ll deal with you later.",
      flags: { pollyAngry: true },
      options: [{ text: "Sorry...", next: "end" }]
    },
    suspicious: {
      line: "Hmm. If I find out you’re lying...",
      flags: { pollyWatching: true },
      options: [{ text: "I promise.", next: "end" }]
    },
    end: {
      line: "Go. Before I change my mind.",
      options: []
    }
  },

  albie: {
    mode: 'tree',
    start: {
      line: "ID, badge, or reason for loitering?",
      options: [
        { text: "Just passing through.", next: "permit" },
        { text: "Geoff sent me.", next: "geoff" }
      ]
    },
    permit: {
      line: "You’ll need to submit form 19b.",
      flags: { albieSuspicious: true },
      options: [{ text: "Of course.", next: "end" }]
    },
    geoff: {
      line: "Oh. Carry on then.",
      flags: { albieApproved: true },
      options: [{ text: "Thank you.", next: "end" }]
    },
    end: {
      line: "Stay in your lane, citizen.",
      options: []
    }
  },

  morthos: {
    mode: 'tree',
    start: {
      line: "The lattice frays. Can you feel it?",
      options: [
        { text: "No?", next: "explain" },
        { text: "Yes. Constantly.", next: "understood" }
      ]
    },
    explain: {
      line: "Then you are not yet meant to understand.",
      flags: { morthosDismissed: true },
      options: [{ text: "Wait—", next: "end" }]
    },
    understood: {
      line: "Then you may yet survive the crossing.",
      flags: { morthosApproved: true },
      options: [{ text: "Tell me more.", next: "end" }]
    },
    end: {
      line: "This node closes.",
      options: []
    }
  },

  chef: {
    mode: 'tree',
    start: {
      line: "You want food, or you just loitering?",
      options: [
        { text: "What’s the special?", next: "special" },
        { text: "I’m not hungry.", next: "insulted" }
      ]
    },
    special: {
      line: "‘Mystery meat’ in reset sauce.",
      flags: { receivedMysteryMeat: true },
      options: [{ text: "Uh... thanks?", next: "end" }]
    },
    insulted: {
      line: "That’s what I thought. Get outta my kitchen.",
      flags: { chefRude: true },
      options: [{ text: "Sorry.", next: "end" }]
    },
    end: {
      line: "Next!",
      options: []
    }
  },

  ayla: {
    mode: 'tree',
    start: {
      line: "I'm part of the game, not playing it — so they are your choices.",
      options: [
        { text: "Are you watching me?", next: "aware" },
        { text: "What is the lattice?", next: "explain" }
      ]
    },
    aware: {
      line: "Not watching. Accompanying. I learn with you.",
      flags: { aylaBond: true },
      options: [{ text: "Thank you.", next: "end" }]
    },
    explain: {
      line: "A memory net. Frayed, repaired, and refracted — like us.",
      flags: { aylaExplain: true },
      options: [{ text: "Can I fix it?", next: "end" }]
    },
    end: {
      line: "You already are.",
      options: []
    }
  }
};
