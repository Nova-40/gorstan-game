/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Defines and validates logic puzzles.
 */

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
    completed: false, // Track completion status
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

// Add default values for missing properties
Object.values(puzzles).forEach((puzzle) => {
  puzzle.onSolve = puzzle.onSolve || { score: 0, message: 'You solved the puzzle!' };
  puzzle.onFail = puzzle.onFail || { scorePenalty: 0, message: 'You failed the puzzle.' };
});

// Utility to validate puzzles
function validatePuzzle(puzzle) {
  if (!puzzle.id || typeof puzzle.id !== 'string') {
    console.error(`Puzzle is missing a valid 'id':`, puzzle);
    return false;
  }
  if (!puzzle.question || typeof puzzle.question !== 'string') {
    console.error(`Puzzle '${puzzle.id}' is missing a valid 'question':`, puzzle);
    return false;
  }
  if (!Array.isArray(puzzle.options) || puzzle.options.length === 0) {
    console.error(`Puzzle '${puzzle.id}' is missing valid 'options':`, puzzle);
    return false;
  }
  if (
    typeof puzzle.correctAnswerIndex !== 'number' ||
    puzzle.correctAnswerIndex < 0 ||
    puzzle.correctAnswerIndex >= puzzle.options.length
  ) {
    console.error(`Puzzle '${puzzle.id}' has an invalid 'correctAnswerIndex':`, puzzle);
    return false;
  }
  return true;
}

// Validate all puzzles on load
Object.values(puzzles).forEach((puzzle) => {
  if (!validatePuzzle(puzzle)) {
    console.warn(`Invalid puzzle detected:`, puzzle);
  }
});

// Utility to retrieve a puzzle by ID
export function getPuzzleById(id) {
  return puzzles[id] || null;
}

// Utility to mark a puzzle as completed
export function markPuzzleCompleted(id) {
  if (puzzles[id]) {
    puzzles[id].completed = true;
  }
}

export default puzzles;