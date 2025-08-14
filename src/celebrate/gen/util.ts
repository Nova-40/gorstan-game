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

// src/celebrate/gen/util.ts
// Utility functions for date generation

export function rangeYears(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type Span = {
  id: string;
  start: string;
  end: string;
  label?: string;
};

export function span(d: Date, days = 1): Span {
  const start = formatISODate(d);
  const endDate = new Date(d);
  endDate.setDate(endDate.getDate() + (days - 1));
  const end = formatISODate(endDate);
  const id = `${start}_${end}_span`;
  return { id, start, end };
}

export function daySpan(d: Date, label?: string): Span {
  const start = formatISODate(d);
  const id = `${start}_${label?.toLowerCase().replace(/\s+/g, "_") || "day"}`;
  return { id, start, end: start, label };
}

export function multiDaySpan(d: Date, days: number, label?: string): Span {
  const start = formatISODate(d);
  const endDate = new Date(d);
  endDate.setDate(endDate.getDate() + (days - 1));
  const end = formatISODate(endDate);
  const id = `${start}_${end}_${label?.toLowerCase().replace(/\s+/g, "_") || "multiday"}`;
  return { id, start, end, label };
}

/**
 * Convert date to London timezone
 */
export function toLondonDate(d: Date): Date {
  const utc = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  const londonOffset = -0; // London is UTC+0 in winter, +1 in summer - simplified to UTC for calculations
  return new Date(utc.getTime() + londonOffset * 3600000);
}
