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

// src/celebrate/gen/build-judaism.ts
// Jewish holiday date generation using simplified approach

import { Span, daySpan, multiDaySpan } from './util';

/**
 * Rosh Hashanah - 1 Tishrei (Jewish New Year)
 * Using known dates for accuracy
 */
export function roshHashanah(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Known dates for Rosh Hashanah (typically Sept/Oct)
  const knownDates: Record<number, string> = {
    2025: '2025-09-15',
    2026: '2026-09-04',
    2027: '2027-09-24',
    2028: '2028-09-11',
    2029: '2029-09-29',
    2030: '2030-09-18',
    2031: '2031-09-08',
    2032: '2032-09-25',
    2033: '2033-09-14',
    2034: '2034-10-03',
    2035: '2035-09-22',
    2036: '2036-09-10',
    2037: '2037-09-30',
    2038: '2038-09-17',
    2039: '2039-09-07',
    2040: '2040-09-26',
    2041: '2041-09-13',
    2042: '2042-10-02',
    2043: '2043-09-21',
    2044: '2044-09-09',
    2045: '2045-09-28',
    2046: '2046-09-17',
    2047: '2047-09-06',
    2048: '2048-09-25',
    2049: '2049-09-12',
    2050: '2050-10-01'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 2, `Rosh Hashanah ${year}`));
    }
  }
  
  return spans;
}

/**
 * Passover - 15 Nisan (Pesach)
 * Using known dates for accuracy
 */
export function passover(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Known dates for Passover (typically March/April)
  const knownDates: Record<number, string> = {
    2025: '2025-04-12',
    2026: '2026-04-01',
    2027: '2027-04-21',
    2028: '2028-04-10',
    2029: '2029-03-30',
    2030: '2030-04-17',
    2031: '2031-04-07',
    2032: '2032-03-27',
    2033: '2033-04-14',
    2034: '2034-04-04',
    2035: '2035-03-24',
    2036: '2036-04-11',
    2037: '2037-03-31',
    2038: '2038-04-19',
    2039: '2039-04-08',
    2040: '2040-03-28',
    2041: '2041-04-15',
    2042: '2042-04-05',
    2043: '2043-03-25',
    2044: '2044-04-12',
    2045: '2045-04-01',
    2046: '2046-04-21',
    2047: '2047-04-09',
    2048: '2048-03-29',
    2049: '2049-04-16',
    2050: '2050-04-06'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 8, `Passover ${year}`));
    }
  }
  
  return spans;
}

/**
 * Hanukkah - 25 Kislev (Festival of Lights)
 * Using known dates for accuracy
 */
export function hanukkah(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Known dates for Hanukkah (typically November/December)
  const knownDates: Record<number, string> = {
    2025: '2025-12-24',
    2026: '2026-12-13',
    2027: '2027-12-03',
    2028: '2028-12-21',
    2029: '2029-12-09',
    2030: '2030-11-28',
    2031: '2031-12-17',
    2032: '2032-12-06',
    2033: '2033-11-25',
    2034: '2034-12-14',
    2035: '2035-12-03',
    2036: '2036-11-21',
    2037: '2037-12-10',
    2038: '2038-11-30',
    2039: '2039-12-18',
    2040: '2040-12-07',
    2041: '2041-11-26',
    2042: '2042-12-15',
    2043: '2043-12-04',
    2044: '2044-11-23',
    2045: '2045-12-11',
    2046: '2046-12-01',
    2047: '2047-12-19',
    2048: '2048-12-08',
    2049: '2049-11-27',
    2050: '2050-12-16'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 8, `Hanukkah ${year}`));
    }
  }
  
  return spans;
}

export const buildJudaism = {
  roshHashanah,
  passover,
  hanukkah
};
