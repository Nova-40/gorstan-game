// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: soundUtils.js
// Path: src/utils/soundUtils.js


// src/utils/soundUtils.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// soundUtils utility for Gorstan game.
// Provides functions for playing click, ambient, and contextual sound effects.
// Handles browser autoplay restrictions and smooth fading of ambient audio.

let ambientAudio = null;

/**
 * playClick
 * Plays a click sound effect.
 */
export const playClick = () => {
  const audio = new Audio('/sounds/click.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => {
    console.warn('Click sound blocked:', err);
  });
};

/**
 * playAmbient
 * Plays ambient looping audio, respecting autoplay restrictions.
 * @param {boolean} enabled - Whether ambient audio is allowed.
 */
export const playAmbient = (enabled = true) => {
  if (!enabled) return;

  if (!ambientAudio) {
    ambientAudio = new Audio('/sounds/ambient.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0.3;
    ambientAudio.muted = true;

    ambientAudio.play().then(() => {
      ambientAudio.muted = false;
    }).catch((err) => {
      console.warn('Ambient play blocked by browser:', err);
    });
  } else {
    ambientAudio.play().catch((err) => {
      console.warn('Ambient resume blocked:', err);
    });
  }
};

/**
 * fadeAmbient
 * Smoothly fades ambient audio in or out.
 * @param {boolean} enabled - Whether ambient should be audible.
 */
export const fadeAmbient = (enabled) => {
  if (!ambientAudio) return;

  if (enabled) {
    ambientAudio.volume = 0.3;
    ambientAudio.play().catch(err => {
      console.warn('Fade-in blocked:', err);
    });
  } else {
    const fade = setInterval(() => {
      if (ambientAudio.volume > 0.05) {
        ambientAudio.volume -= 0.05;
      } else {
        ambientAudio.volume = 0;
        ambientAudio.pause();
        clearInterval(fade);
      }
    }, 100);
  }
};

/**
 * playSound
 * Plays a contextual sound effect if known.
 * @param {string} type - e.g., "trap", "vanish", "talk", "teleport".
 */
export const playSound = (type) => {
  const map = {
    trap: '/sounds/trap.mp3',
    vanish: '/sounds/vanish.mp3',
    talk: '/sounds/talk.mp3',
    teleport: '/sounds/teleport.mp3',
  };

  const src = map[type];
  if (!src) return;

  const audio = new Audio(src);
  audio.volume = 0.5;
  audio.play().catch(err => {
    console.warn(`Sound (${type}) blocked:`, err);
  });
};

// All functions are exported as named exports for use in UI and game logic.
// TODO: Add support for user volume preferences or additional sound types as needed.


