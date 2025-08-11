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

// src/engine/specialDeathEffects.ts
// Handles unique death animations and hidden outcomes

import { triggerDeath } from './deathEngine';
import { playSound } from '../utils/soundUtils';

export function paradoxDeathSequence(): void {
  playSound('paradox_rip');
  const overlay = document.createElement('div');
  overlay.className = 'death-overlay';
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>💀 Temporal Paradox</h1>
      <p>You tried to use an object that shouldn't exist.</p>
      <p>Reality unravels, and you with it.</p>
    </div>
  `;
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    color: 'red',
    fontFamily: 'Courier New, monospace',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  });
  document.body.appendChild(overlay);
  setTimeout(() => triggerDeath('temporal_paradox'), 3000);
}

export function pollyDeathSequence(): void {
  playSound('polly_final_strike');
  const overlay = document.createElement('div');
  overlay.className = 'death-overlay';
  overlay.innerHTML = `
    <div class="overlay-content">
      <h1>💔 Polly's Vengeance</h1>
      <p>She warned you.</p>
      <p>Dominic was her world. Now she ends yours.</p>
    </div>
  `;
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
    color: 'pink',
    fontFamily: 'Courier New, monospace',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  });
  document.body.appendChild(overlay);
  setTimeout(() => triggerDeath('npc'), 3000);
}

export function checkHiddenEnding(): void {
  const diedToPolly = localStorage.getItem('diedToPolly') === 'true';
  const diedToParadox = localStorage.getItem('diedToParadox') === 'true';

  if (diedToPolly && diedToParadox) {
    const overlay = document.createElement('div');
    overlay.className = 'hidden-ending';
    overlay.innerHTML = `
      <div class="overlay-content">
        <h1>⚰️ Hidden Ending Unlocked</h1>
        <p>You died to both love and logic.</p>
        <p>This is the worst timeline.</p>
        <p>...and perhaps the most interesting.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}


export function startPollyCountdown(): void {
  const existing = document.getElementById('polly-timer');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.id = 'polly-timer';
  overlay.style.position = 'fixed';
  overlay.style.bottom = '10px';
  overlay.style.right = '10px';
  overlay.style.padding = '10px 15px';
  overlay.style.backgroundColor = 'black';
  overlay.style.color = 'white';
  overlay.style.fontFamily = 'monospace';
  overlay.style.zIndex = '99999';
  overlay.style.fontSize = '16px';
  overlay.style.border = '1px solid red';
  overlay.innerText = 'Time left: 04:20';

  document.body.appendChild(overlay);

  let remaining = 260;
  const interval = setInterval(() => {
    remaining--;
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');
    overlay.innerText = `Time left: ${mins}:${secs}`;
    if (remaining <= 0) {
      clearInterval(interval);
      overlay.remove();
    }
  }, 1000);
}

export function showResetVisualSuccess(): void {
  const flash = document.createElement('div');
  flash.style.position = 'fixed';
  flash.style.top = '0';
  flash.style.left = '0';
  flash.style.width = '100%';
  flash.style.height = '100%';
  flash.style.backgroundColor = '#00f';
  flash.style.opacity = '0.9';
  flash.style.zIndex = '100000';
  document.body.appendChild(flash);
  setTimeout(() => document.body.removeChild(flash), 1500);
}
