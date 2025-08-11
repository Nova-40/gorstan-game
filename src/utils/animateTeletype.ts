/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

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
