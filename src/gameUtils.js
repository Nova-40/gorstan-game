// gameUtils.js – Save/Load/Score Utilities
export function saveGame(data) {
  localStorage.setItem('gorstanGameSave', JSON.stringify(data));
}

export function loadGame() {
  const data = localStorage.getItem('gorstanGameSave');
  return data ? JSON.parse(data) : null;
}

export function clearGame() {
  localStorage.removeItem('gorstanGameSave');
}

export function getHighScore() {
  return parseInt(localStorage.getItem('gorstanHighScore') || '0', 10);
}

export function updateHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem('gorstanHighScore', score.toString());
  }
}
