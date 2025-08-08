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
