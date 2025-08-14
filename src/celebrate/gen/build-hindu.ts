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

// src/celebrate/gen/build-hindu.ts
// Hindu holiday date generation

import { Span, daySpan, multiDaySpan } from "./util";

/**
 * Diwali - Festival of Lights
 * Using known dates for accuracy
 */
export async function diwali(years: number[]): Promise<Span[]> {
  const spans: Span[] = [];

  // Known dates for Diwali (typically October/November)
  const knownDates: Record<number, string> = {
    2025: "2025-10-20",
    2026: "2026-11-08",
    2027: "2027-10-29",
    2028: "2028-10-17",
    2029: "2029-11-05",
    2030: "2030-10-26",
    2031: "2031-10-14",
    2032: "2032-11-02",
    2033: "2033-10-23",
    2034: "2034-10-12",
    2035: "2035-10-31",
    2036: "2036-10-19",
    2037: "2037-11-07",
    2038: "2038-10-28",
    2039: "2039-10-17",
    2040: "2040-11-04",
    2041: "2041-10-24",
    2042: "2042-10-13",
    2043: "2043-11-01",
    2044: "2044-10-20",
    2045: "2045-11-08",
    2046: "2046-10-29",
    2047: "2047-10-18",
    2048: "2048-11-05",
    2049: "2049-10-25",
    2050: "2050-10-14",
  };

  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 5, `Diwali ${year}`));
    }
  }

  return spans;
}

/**
 * Holi - Festival of Colors
 * Using known dates for accuracy
 */
export async function holi(years: number[]): Promise<Span[]> {
  const spans: Span[] = [];

  // Known dates for Holi (typically February/March)
  const knownDates: Record<number, string> = {
    2025: "2025-03-13",
    2026: "2026-03-03",
    2027: "2027-03-22",
    2028: "2028-03-11",
    2029: "2029-02-28",
    2030: "2030-03-19",
    2031: "2031-03-08",
    2032: "2032-02-26",
    2033: "2033-03-16",
    2034: "2034-03-06",
    2035: "2035-02-23",
    2036: "2036-03-13",
    2037: "2037-03-02",
    2038: "2038-03-22",
    2039: "2039-03-10",
    2040: "2040-02-28",
    2041: "2041-03-17",
    2042: "2042-03-07",
    2043: "2043-02-24",
    2044: "2044-03-14",
    2045: "2045-03-04",
    2046: "2046-03-23",
    2047: "2047-03-11",
    2048: "2048-02-29",
    2049: "2049-03-18",
    2050: "2050-03-08",
  };

  for (const year of years) {
    if (knownDates[year]) {
      const date = new Date(knownDates[year]);
      spans.push(multiDaySpan(date, 2, `Holi ${year}`));
    }
  }

  return spans;
}

export const buildHindu = {
  diwali,
  holi,
};
