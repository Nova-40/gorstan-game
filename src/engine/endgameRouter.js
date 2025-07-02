// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: endgameRouter.js
// Path: src/engine/endgameRouter.js

import { checkEndgamePath } from './GameEngine';

export function getEndgameRoom(playerState) {
  const outcome = checkEndgamePath(playerState);
  switch (outcome) {
    case 'glitch':
      return 'glitchStanton';
    case 'bad':
      return 'silentStanton';
    case 'redemption':
      return 'peacefulStanton';
    case 'architect':
    default:
      return 'ascendantStanton';
  }
}