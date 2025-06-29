
// src/engine/puzzleEngine.js

const puzzles = {
  'aevirawarehouse': {
    id: 'briefcase-combo',
    difficulty: 'medium',
    hint: 'It feels like it wants to be opened by someone who knows a pattern...',
    solution: '51342',
    traitBoost: ['clever']
  },
  'hiddenlibrary': {
    id: 'lattice-scroll',
    difficulty: 'hard',
    hint: 'Ayla once spoke of knowledge buried beneath riddles.',
    solution: 'access: KEY ↦ DOOR',
    traitBoost: ['curious', 'scholar']
  },
  'glitchroom': {
    id: 'logic-fracture',
    difficulty: 'extreme',
    hint: 'The room glitches when logic loops...',
    solution: 'X = ¬X',
    traitBoost: ['logical', 'glitched']
  }
};

/**
 * Retrieves a puzzle for a given room, if one exists.
 */
export function getPuzzleForRoom(roomId) {
  return puzzles[roomId] || null;
}

/**
 * Checks if the puzzle is solved based on player input.
 */
export function solvePuzzle(roomId, input, playerState) {
  const puzzle = puzzles[roomId];
  if (!puzzle) return { solved: false, message: 'No puzzle here.' };

  const boosted = puzzle.traitBoost?.some(trait => playerState.traits?.includes(trait));
  const simplifiedInput = input.trim().toLowerCase();
  const expectedSolution = puzzle.solution.toLowerCase();

  if (simplifiedInput === expectedSolution) {
    return {
      solved: true,
      message: boosted
        ? 'You solved it with surprising ease — your instincts guided you.'
        : 'You solved the puzzle. A mechanism clicks somewhere nearby.',
      flags: { [`puzzle_${puzzle.id}_solved`]: true }
    };
  } else {
    return {
      solved: false,
      message: boosted
        ? 'Close — your instincts are telling you you’re nearly there.'
        : 'That doesn’t seem to be the right solution.'
    };
  }
}
