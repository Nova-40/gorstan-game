// src/utils/soundUtils.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module - Sound utilities for audio playback

let ambientAudio: HTMLAudioElement | null = null;

/**
 * Play a sound file from the audio directory
 */
export function playSound(filename: string): void {
  try {
    const audio = new Audio(`/audio/${filename}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn(`Sound ${filename} could not be played:`, err);
    });
  } catch (error) {
    console.warn(`Error creating audio for ${filename}:`, error);
  }
}

/**
 * Play click sound effect
 */
export function playClickSound(): void {
  try {
    const audio = new Audio('/audio/click.wav');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.warn('Click sound blocked:', err);
    });
  } catch (error) {
    console.warn('Error playing click sound:', error);
  }
}

/**
 * Start ambient audio loop
 */
export function playAmbientAudio(enabled: boolean = true): void {
  if (!ambientAudio) {
    ambientAudio = new Audio('/audio/ambient.mp3');
    ambientAudio.loop = true;
  }
  
  if (enabled && ambientAudio) {
    ambientAudio.volume = 0.3;
    ambientAudio.play().catch((err: any) => {
      console.warn('Ambient audio blocked:', err);
    });
  }
}

/**
 * Stop ambient audio with fade out
 */
export function stopAmbientAudio(): void {
  if (ambientAudio) {
    const fade = setInterval(() => {
      if (ambientAudio && ambientAudio.volume > 0.05) {
        ambientAudio.volume = Math.max(ambientAudio.volume - 0.05, 0);
      } else {
        if (ambientAudio) {
          ambientAudio.volume = 0;
          ambientAudio.pause();
        }
        clearInterval(fade);
      }
    }, 100);
  }
}

/**
 * Play zone-specific audio
 */
export function playZoneAudio(src: string): void {
  if (!src) return;
  try {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch((err: any) => {
      console.warn('Zone audio blocked:', err);
    });
  } catch (error) {
    console.warn('Error playing zone audio:', error);
  }
}

/**
 * Set global audio volume
 */
export function setAudioVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  if (ambientAudio) {
    ambientAudio.volume = clampedVolume * 0.3; // Ambient is quieter
  }
}

/**
 * Check if audio is supported
 */
export function isAudioSupported(): boolean {
  return typeof Audio !== 'undefined';
}

export default {
  playSound,
  playClickSound,
  playAmbientAudio,
  stopAmbientAudio,
  playZoneAudio,
  setAudioVolume,
  isAudioSupported
};
