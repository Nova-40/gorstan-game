export function resetGameState() {
  // logic to reset flags, score, traits, etc.
}

export function incrementResetCount() {
  // update persistent or session count
}

export function getResetCount() {
  // return count from localStorage/session
  return parseInt(localStorage.getItem('resetCount') || '0', 10);
}


// Set soft reset entry point
export const resetEntryPoint = 'introstart';