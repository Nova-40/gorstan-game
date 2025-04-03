// puzzles.js – Gorstan Puzzle Logic
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

const puzzles = {
  mirrorPuzzle: {
    id: 'mirrorPuzzle',
    question: 'What is the superposition of truth when observed from two disconnected quantum states?',
    options: [
      'It collapses into falsehood.',
      'It remains undefined until measured.',
      'Truth becomes a wave function of belief.',
      'It splits the observer across universes.'
    ],
    correctAnswerIndex: 1,
    onSolve: {
      score: 15,
      message: 'The mirror hums in approval. The Eidolon fades. You feel clarity returning.'
    },
    onFail: {
      scorePenalty: -10,
      message: 'The mirror cracks slightly. You feel your understanding fracture.'
    }
  }
};

export default puzzles;