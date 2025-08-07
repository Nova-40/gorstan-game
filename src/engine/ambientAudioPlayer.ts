// src/engine/ambientAudioPlayer.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

const audioCache: Record<string, HTMLAudioElement> = {};
let currentAudio: HTMLAudioElement | null = null;


// --- Function: playAmbientForZone ---
export function playAmbientForZone(zone: string): void {
// Variable declaration
  const audioFile = `/audio/ambient/${zone}.mp3`;
  if (currentAudio && currentAudio.src.includes(zone)) return;

  stopAmbient();

// Variable declaration
  const audio = new Audio(audioFile);
  audio.loop = true;
  audio.volume = 0;
  audio.play().catch(() => {});
  currentAudio = audio;

  
  let vol = 0;
// Variable declaration
  const fade = setInterval(() => {
    if (audio.volume < 0.95) {
      vol += 0.05;
      audio.volume = Math.min(vol, 1);
    } else {
      clearInterval(fade);
    }
  }, 100);
}


// --- Function: stopAmbient ---
export function stopAmbient(): void {
  if (!currentAudio) return;
// Variable declaration
  const fadeOut = setInterval(() => {
    if (currentAudio!.volume > 0.05) {
      currentAudio!.volume -= 0.05;
    } else {
      currentAudio!.pause();
      currentAudio = null;
      clearInterval(fadeOut);
    }
  }, 100);
}
