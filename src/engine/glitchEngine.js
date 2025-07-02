// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: glitchEngine.js
// Path: src/engine/glitchEngine.js


// src/engine/glitchEngine.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// glitchEngine utility for Gorstan game.
// Provides random glitch messages for simulating reality breakdowns or anomalies.

/**
 * Array of possible glitch messages to display during game anomalies.
 * These are selected at random to enhance the narrative atmosphere.
 */
const glitches = [
  "Reality distortion detected...",
  "Signal degradation escalating...",
  "Error: Entity duplication suspected...",
];

/**
 * getGlitchMessage
 * Returns a random glitch message from the glitches array.
 *
 * @returns {string} - A randomly selected glitch message.
 */
export function getGlitchMessage() {
  return glitches[Math.floor(Math.random() * glitches.length)];
}

// Exported as a named export for use in UI and event logic.
// TODO: Expand with more glitch messages or context-aware glitches as