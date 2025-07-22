

// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: animateTeletype.ts
// Path: src/utils/animateTeletype.ts
//
// animateTeletype utility for Gorstan game.
// Provides a function to animate teletype-style text rendering into a DOM element.

/**
 * animateTeletype
 * Animates text into a DOM element, simulating a teletype or typewriter effect.
 *
 * @param {HTMLElement} targetEl - The DOM element to render into.
 * @param {string} text - The full string to type out.
 * @param {number} [delay=30] - Delay per character in milliseconds.
 * @returns {void}
 */
export function animateTeletype(targetEl: HTMLElement, text: string, delay: number = 30): void {
  if (!targetEl) return;

  let index = 0;
  targetEl.innerText = '';

  /**
   * typeNextChar
   * Appends the next character to the target element and schedules the next call.
   * Stops when the full text has been rendered.
   */
  function typeNextChar() {
    if (index < text.length) {
      targetEl.innerText += text.charAt(index);
      index++;
      setTimeout(typeNextChar, delay);
    }
  }

  typeNextChar();
}

// Exported as a named export for use in UI components.
// TODO: Consider supporting cancellation or promise-based
