// src/audio/audioMap.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

// --- Function: playNpcAudio ---
export function playNpcAudio(npcName: string): void {
  const audioFile = `/audio/npcs/${npcName}.mp3`;
  const audio = new Audio(audioFile);
  if (audioFile) {
    audio.volume = 0.4;
    audio.play();
  }
}
