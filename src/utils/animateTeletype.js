// src/utils/animateTeletype.js

/**
 * Animate teletype-style text rendering into a DOM element.
 * @param {HTMLElement} targetEl - The DOM element to render into.
 * @param {string} text - The full string to type out.
 * @param {number} [delay=30] - Delay per character in ms.
 */
export function animateTeletype(targetEl, text, delay = 30) {
  if (!targetEl) return;

  let index = 0;
  targetEl.innerText = '';

  function typeNextChar() {
    if (index < text.length) {
      targetEl.innerText += text.charAt(index);
      index++;
      setTimeout(typeNextChar, delay);
    }
  }

  typeNextChar();
}
