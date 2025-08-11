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

// src/celebrate/gen/build-sikh.ts
// Sikh holiday date generation

import { Span, daySpan } from './util';

/**
 * Vaisakhi - Sikh New Year and harvest festival
 * Usually April 13, occasionally April 14
 */
export function vaisakhi(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Corrections for years when Vaisakhi falls on April 14
  const corrections: Record<number, string> = {
    2044: '2044-04-14',
    2048: '2048-04-14'
  };
  
  for (const year of years) {
    const dateStr = corrections[year] || `${year}-04-13`;
    const date = new Date(dateStr);
    spans.push(daySpan(date, `Vaisakhi ${year}`));
  }
  
  return spans;
}

export const buildSikh = {
  vaisakhi
};
