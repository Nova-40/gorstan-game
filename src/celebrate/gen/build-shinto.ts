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

// src/celebrate/gen/build-shinto.ts
// Shinto holiday date generation

import { Span, daySpan, multiDaySpan } from './util';

/**
 * Shōgatsu - Japanese New Year
 * Fixed January 1-3
 */
export function shogatsu(years: number[]): Span[] {
  const spans: Span[] = [];
  
  for (const year of years) {
    const date = new Date(year, 0, 1); // January 1
    spans.push(multiDaySpan(date, 3, `Shōgatsu ${year}`));
  }
  
  return spans;
}

/**
 * Obon - Festival of ancestors
 * Modern dates: August 13-16
 */
export function obon(years: number[]): Span[] {
  const spans: Span[] = [];
  
  for (const year of years) {
    const date = new Date(year, 7, 13); // August 13
    spans.push(multiDaySpan(date, 4, `Obon ${year}`));
  }
  
  return spans;
}

export const buildShinto = {
  shogatsu,
  obon
};
