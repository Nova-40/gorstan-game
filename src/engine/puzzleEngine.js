// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: puzzleEngine.js
// Path: src/engine/puzzleEngine.js


// src/engine/puzzleEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// puzzleEngine utility for Gorstan game.
// Provides puzzle definitions, retrieval, and solution logic for room-based puzzles.
// Handles trait-based boosts and flagging of solved puzzles.

/**
 * puzzles
 * Object mapping room IDs to puzzle definitions.
 * Each puzzle includes an id, difficulty, hint, solution, and traitBoost array.
 */
const puzzles = {
  aevirawarehouse: {
    id: 'briefcase-combo',
    difficulty: 'medium',
    hint: 'It feels like it wants to be opened by someone who knows a pattern...',
    solution: '51342',
    traitBoost: ['clever']
  },
  hiddenlibrary: {
    id: 'lattice-scroll',
    difficulty: 'hard',
    hint: 'Ayla once spoke of knowledge buried beneath riddles.',
    solution: 'access: KEY ↦ DOOR',
    traitBoost: ['curious', 'scholar']
  },
  glitchroom: {
    id: 'logic-fracture',
    difficulty: 'extreme',
    hint: 'The room glitches when logic loops...',
    solution: 'X = ¬X',
    traitBoost: ['logical', 'glitched']
  }
};

/**
 * getPuzzleForRoom
 * Retrieves a puzzle for a given room, if one exists.
 *
 * @param {string} roomId - The unique ID of the room.
 * @returns {Object|null} - The puzzle object or null if none exists.
 */
export function getPuzzleForRoom(roomId) {
  return puzzles[roomId] || null;
}

/**
 * solvePuzzle
 * Checks if the puzzle is solved based on player input and state.
 * Applies trait-based boosts for narrative flavor and flagging.
 *
 * @param {string} roomId - The unique ID of the room.
 * @param {string} input - The player's solution attempt.
 * @param {Object} playerState - The current player state (should include traits).
 * @returns {Object} - Result object with solved status, message, and flags if solved.
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

// Exported as named exports for use in room, quest, and puzzle logic.
// TODO: Add support for multi-step puzzles, dynamic hints, or adaptive