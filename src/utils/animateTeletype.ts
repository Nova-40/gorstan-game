// src/utils/animateTeletype.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.


// --- Function: animateTeletype ---
export function animateTeletype(targetEl: HTMLElement, text: string, delay: number = 30): void {
  if (!targetEl) return;

  let index = 0;
  targetEl.innerText = '';

  

// --- Function: typeNextChar ---
  function typeNextChar() {
    if (index < text.length) {
      targetEl.innerText += text.charAt(index);
      index++;
      setTimeout(typeNextChar, delay);
    }
  }

  typeNextChar();
}
