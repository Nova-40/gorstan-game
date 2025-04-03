// questsData.js – Gorstan Quest Definitions
// (c) Geoff Webster – Modular Quest Data

const quests = {
  awakenArchitect: {
    id: 'awakenArchitect',
    title: 'Awaken the Architect',
    description: 'Find the Folded Note, speak with Ayla, solve the mirror puzzle, and enter the Control Room.',
    steps: [
      { id: 'foldedNote', description: 'Collect the Folded Note from Central Park', complete: false },
      { id: 'speakAyla', description: 'Speak to Ayla in Findlaters Café', complete: false },
      { id: 'mirrorSolved', description: 'Solve the mirror puzzle in Rhiannon’s Quarters', complete: false },
      { id: 'enterControl', description: 'Enter the Control Room with Premium Token', complete: false }
    ],
    reward: {
      item: 'Lattice Fragment',
      score: 20,
      codexUnlocks: ['Ayla', 'lattice']
    }
  },
  mercyRises: {
    id: 'mercyRises',
    title: 'Mercy Rises',
    description: 'Help Mercy reclaim her place by guiding her through the Fae trials.',
    steps: [
      { id: 'faeHall', description: 'Access Fae Hall via Fae Palace', complete: false },
      { id: 'crownShard', description: 'Retrieve the Fae Crown Shard', complete: false },
      { id: 'teaChoice', description: 'Drink the tea and pass her test', complete: false }
    ],
    reward: {
      item: 'Veil Sigil',
      score: 25,
      codexUnlocks: ['Mercy']
    }
  }
};

export default quests;