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

// src/seasonal/seasonalGate.ts
// Date logic and seasonal event gating - Gorstan Game Beta 1

// Keep London semantics simple; your app runs in local time anyway.
export function inLondonNow(): Date {
  return new Date();
}

export function isChristmasDay(d: Date): boolean {
  return d.getMonth() === 11 && d.getDate() === 25;
}

export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(d: Date, n: number): Date {
  const z = new Date(d);
  z.setDate(z.getDate() + n);
  return z;
}

export function isEasterWindow(d: Date): boolean {
  const y = d.getFullYear();
  const easter = easterSunday(y);
  const start = addDays(easter, -2); // Good Friday
  const end = addDays(easter, 1);    // Easter Monday
  return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate())
      && d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
}

export function isMay13(d: Date): boolean {
  return d.getMonth() === 4 && d.getDate() === 13; // May=4
}

// Reuse your eggFlags store for once-per-year gating.
import { getFlag, setFlag } from "./seasonalFlags";

export function shouldShowOncePerYear(key: string): boolean {
  return !getFlag(key);
}

export function markShown(key: string): void {
  setFlag(key, true);
}
