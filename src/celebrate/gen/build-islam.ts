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

// src/celebrate/gen/build-islam.ts
// Islamic holiday date generation using simplified calculations

import { Span, multiDaySpan } from './util';

/**
 * Eid al-Fitr - 1 Shawwal (end of Ramadan)
 * Using approximate calculations based on lunar calendar
 */
export async function eidAlFitr(years: number[]): Promise<Span[]> {
  const spans: Span[] = [];
  
  // Known/calculated dates for Eid al-Fitr (1 Shawwal)
  const knownDates: Record<number, string> = {
    2025: '2025-03-30',
    2026: '2026-03-20',
    2027: '2027-03-09',
    2028: '2028-02-26',
    2029: '2029-02-14',
    2030: '2030-02-03',
    2031: '2031-01-23',
    2032: '2032-01-12',
    2033: '2033-01-01',
    2034: '2033-12-21',
    2035: '2035-12-10',
    2036: '2036-11-29',
    2037: '2037-11-18',
    2038: '2038-11-07',
    2039: '2039-10-27',
    2040: '2040-10-16',
    2041: '2041-10-05',
    2042: '2042-09-24',
    2043: '2043-09-13',
    2044: '2044-09-02',
    2045: '2045-08-22',
    2046: '2046-08-11',
    2047: '2047-07-31',
    2048: '2048-07-20',
    2049: '2049-07-09',
    2050: '2050-06-28'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 3, `Eid al-Fitr ${year}`));
    }
  }
  
  return spans;
}

/**
 * Eid al-Adha - 10 Dhu al-Hijjah (Festival of Sacrifice)
 * Approximately 2 months and 10 days after Eid al-Fitr
 */
export async function eidAlAdha(years: number[]): Promise<Span[]> {
  const spans: Span[] = [];
  
  // Known/calculated dates for Eid al-Adha (10 Dhu al-Hijjah)
  const knownDates: Record<number, string> = {
    2025: '2025-06-06',
    2026: '2026-05-27',
    2027: '2027-05-16',
    2028: '2028-05-04',
    2029: '2029-04-23',
    2030: '2030-04-12',
    2031: '2031-04-01',
    2032: '2032-03-21',
    2033: '2033-03-10',
    2034: '2034-02-27',
    2035: '2035-02-16',
    2036: '2036-02-05',
    2037: '2037-01-25',
    2038: '2038-01-14',
    2039: '2039-01-03',
    2040: '2039-12-23',
    2041: '2041-12-12',
    2042: '2042-12-01',
    2043: '2043-11-20',
    2044: '2044-11-09',
    2045: '2045-10-29',
    2046: '2046-10-18',
    2047: '2047-10-07',
    2048: '2048-09-26',
    2049: '2049-09-15',
    2050: '2050-09-04'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 4, `Eid al-Adha ${year}`));
    }
  }
  
  return spans;
}

export const buildIslam = {
  eidAlFitr,
  eidAlAdha
};
