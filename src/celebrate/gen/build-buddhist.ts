// src/celebrate/gen/build-buddhist.ts
// Buddhist holiday date generation

import { Span, daySpan } from './util';

/**
 * Vesak - Buddha's Birthday
 * Full moon day in May (varies by tradition)
 */
export async function vesak(years: number[]): Promise<Span[]> {
  const spans: Span[] = [];
  
  // Known dates for Vesak (typically May full moon)
  const knownDates: Record<number, string> = {
    2025: '2025-05-12',
    2026: '2026-05-31',
    2027: '2027-05-20',
    2028: '2028-05-09',
    2029: '2029-05-28',
    2030: '2030-05-17',
    2031: '2031-05-06',
    2032: '2032-05-24',
    2033: '2033-05-13',
    2034: '2034-05-02',
    2035: '2035-05-22',
    2036: '2036-05-10',
    2037: '2037-05-30',
    2038: '2038-05-19',
    2039: '2039-05-08',
    2040: '2040-05-26',
    2041: '2041-05-15',
    2042: '2042-05-05',
    2043: '2043-05-23',
    2044: '2044-05-12',
    2045: '2045-05-01',
    2046: '2046-05-21',
    2047: '2047-05-10',
    2048: '2048-05-28',
    2049: '2049-05-17',
    2050: '2050-05-06'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(daySpan(date, `Vesak ${year}`));
    }
  }
  
  return spans;
}

export const buildBuddhist = {
  vesak
};
