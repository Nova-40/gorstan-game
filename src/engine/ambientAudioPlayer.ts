


// ambientAudioPlayer.ts
// Ambient audio handler for Gorstan
// (c) 2025 Geoffrey Alan Webster. MIT Licence

const audioCache: Record<string, HTMLAudioElement> = {};
let currentAudio: HTMLAudioElement | null = null;

export function playAmbientForZone(zone: string): void {
  const audioFile = `/audio/ambient/${zone}.mp3`;
  if (currentAudio && currentAudio.src.includes(zone)) return;

  stopAmbient();

  const audio = new Audio(audioFile);
  audio.loop = true;
  audio.volume = 0;
  audio.play().catch(() => {});
  currentAudio = audio;

  // Smooth fade-in
  let vol = 0;
  const fade = setInterval(() => {
    if (audio.volume < 0.95) {
      vol += 0.05;
      audio.volume = Math.min(vol, 1);
    } else {
      clearInterval(fade);
    }
  }, 100);
}

export function stopAmbient(): void {
  if (!currentAudio) return;
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
