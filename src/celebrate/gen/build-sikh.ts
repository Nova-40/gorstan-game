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
