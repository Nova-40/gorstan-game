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

// src/celebrate/gen/build-chinese.ts
// Chinese lunar holiday date generation

import { Span, daySpan, multiDaySpan } from './util';

/**
 * Lunar New Year - 1st day of 1st lunar month
 * Using known dates for Chinese New Year
 */
export function lunarNewYear(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Known dates for Chinese New Year (typically Jan/Feb)
  const knownDates: Record<number, string> = {
    2025: '2025-01-29', // Year of the Snake
    2026: '2026-02-17', // Year of the Horse
    2027: '2027-02-06', // Year of the Goat
    2028: '2028-01-26', // Year of the Monkey
    2029: '2029-02-13', // Year of the Rooster
    2030: '2030-02-03', // Year of the Dog
    2031: '2031-01-23', // Year of the Pig
    2032: '2032-02-11', // Year of the Rat
    2033: '2033-01-31', // Year of the Ox
    2034: '2034-02-19', // Year of the Tiger
    2035: '2035-02-08', // Year of the Rabbit
    2036: '2036-01-28', // Year of the Dragon
    2037: '2037-02-15', // Year of the Snake
    2038: '2038-02-04', // Year of the Horse
    2039: '2039-01-24', // Year of the Goat
    2040: '2040-02-12', // Year of the Monkey
    2041: '2041-02-01', // Year of the Rooster
    2042: '2042-01-22', // Year of the Dog
    2043: '2043-02-10', // Year of the Pig
    2044: '2044-01-30', // Year of the Rat
    2045: '2045-02-17', // Year of the Ox
    2046: '2046-02-06', // Year of the Tiger
    2047: '2047-01-26', // Year of the Rabbit
    2048: '2048-02-14', // Year of the Dragon
    2049: '2049-02-02', // Year of the Snake
    2050: '2050-01-23'  // Year of the Horse
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 3, `Lunar New Year ${year}`));
    }
  }
  
  return spans;
}

/**
 * Mid-Autumn Festival - 15th day of 8th lunar month
 * Traditional celebration with moon cakes and lanterns
 */
export function midAutumn(years: number[]): Span[] {
  const spans: Span[] = [];
  
  // Known dates for Mid-Autumn Festival (typically September/October)
  const knownDates: Record<number, string> = {
    2025: '2025-10-06',
    2026: '2026-09-25',
    2027: '2027-10-15',
    2028: '2028-10-03',
    2029: '2029-09-22',
    2030: '2030-10-12',
    2031: '2031-10-01',
    2032: '2032-09-19',
    2033: '2033-10-08',
    2034: '2034-09-27',
    2035: '2035-10-16',
    2036: '2036-10-05',
    2037: '2037-09-24',
    2038: '2038-10-13',
    2039: '2039-10-02',
    2040: '2040-09-21',
    2041: '2041-10-10',
    2042: '2042-09-29',
    2043: '2043-10-17',
    2044: '2044-10-06',
    2045: '2045-09-25',
    2046: '2046-10-14',
    2047: '2047-10-03',
    2048: '2048-09-22',
    2049: '2049-10-11',
    2050: '2050-09-30'
  };
  
  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(daySpan(date, `Mid-Autumn Festival ${year}`));
    }
  }
  
  return spans;
}

export const buildChinese = {
  lunarNewYear,
  midAutumn
};
