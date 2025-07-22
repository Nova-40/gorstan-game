

// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: soundUtils.ts
// Path: src/utils/soundUtils.ts
//
// soundUtils utility for Gorstan game.
// Provides functions for playing click, ambient, and contextual sound effects.
// Handles browser autoplay restrictions and smooth fading of ambient audio.

let ambientAudio: HTMLAudioElement | null = null;

/**
 * playClick
 * Plays a click sound effect.
 */
export   audio.volume = 0.5;
  audio.play().catch(err => {
    console.warn('Click sound blocked:', err);
  });
};

/**
 * playAmbient
 * Plays ambient looping audio, respecting autoplay restrictions.
 * @param {boolean} enabled - Whether ambient audio is allowed.
 */
export
  if (!ambientAudio) {
    ambientAudio = new Audio('/sounds/ambient.mp3');
    ambientAudio.loop = true;
    ambientAudio.volume = 0.3;
    ambientAudio.muted = true;

    ambientAudio.play().then(() => {
      if (ambientAudio) ambientAudio.muted = false;
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
export
  if (enabled) {
    ambientAudio.volume = 0.3;
    ambientAudio.play().catch(err => {
      console.warn('Fade-in blocked:', err);
    });
  } else {
            return;
      }
      if (ambientAudio.volume > 0.05) {
        ambientAudio.volume = Math.max(ambientAudio.volume - 0.05, 0);
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
export
    if (!src) return;

    audio.volume = 0.5;
  audio.play().catch(err => {
    console.warn(`Sound (${type}) blocked:`, err);
  });
};

// All functions are exported as named exports for use in UI and game logic.
// TODO: Add support for user volume preferences or additional sound types as needed.
