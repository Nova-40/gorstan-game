// src/seasonal/__tests__/seasonalGate.spec.ts
// Tests for seasonal date logic - Gorstan Game Beta 1

import { isChristmasDay, isMay13, isEasterWindow, easterSunday } from "../seasonalGate";

describe('Seasonal Date Logic', () => {
  test("christmas day detection", () => {
    expect(isChristmasDay(new Date(2025, 11, 25))).toBe(true);
    expect(isChristmasDay(new Date(2025, 11, 24))).toBe(false);
    expect(isChristmasDay(new Date(2025, 11, 26))).toBe(false);
    
    // Test different years
    expect(isChristmasDay(new Date(2024, 11, 25))).toBe(true);
    expect(isChristmasDay(new Date(2026, 11, 25))).toBe(true);
  });

  test("may 13 detection", () => {
    expect(isMay13(new Date(2025, 4, 13))).toBe(true);
    expect(isMay13(new Date(2025, 4, 12))).toBe(false);
    expect(isMay13(new Date(2025, 4, 14))).toBe(false);
    
    // Test different years
    expect(isMay13(new Date(2024, 4, 13))).toBe(true);
    expect(isMay13(new Date(2026, 4, 13))).toBe(true);
    
    // Test wrong month
    expect(isMay13(new Date(2025, 3, 13))).toBe(false);
    expect(isMay13(new Date(2025, 5, 13))).toBe(false);
  });

  test("easter window around easter Sunday", () => {
    const y = 2025;
    const easter = easterSunday(y); // 2025-04-20
    
    expect(easter.getFullYear()).toBe(2025);
    expect(easter.getMonth()).toBe(3); // April = 3
    expect(easter.getDate()).toBe(20);
    
    // Test the window (Good Friday to Easter Monday)
    const goodFri = new Date(y, easter.getMonth(), easter.getDate() - 2); // April 18
    const easterSat = new Date(y, easter.getMonth(), easter.getDate() - 1); // April 19
    const easterMon = new Date(y, easter.getMonth(), easter.getDate() + 1); // April 21
    const afterEaster = new Date(y, easter.getMonth(), easter.getDate() + 2); // April 22
    
    expect(isEasterWindow(goodFri)).toBe(true);
    expect(isEasterWindow(easterSat)).toBe(true);
    expect(isEasterWindow(easter)).toBe(true);
    expect(isEasterWindow(easterMon)).toBe(true);
    expect(isEasterWindow(afterEaster)).toBe(false);
    
    // Test day before Good Friday
    const beforeWindow = new Date(y, easter.getMonth(), easter.getDate() - 3);
    expect(isEasterWindow(beforeWindow)).toBe(false);
  });

  test("easter calculation for different years", () => {
    // Test known Easter dates
    expect(easterSunday(2024)).toEqual(new Date(2024, 2, 31)); // March 31, 2024
    expect(easterSunday(2025)).toEqual(new Date(2025, 3, 20)); // April 20, 2025
    expect(easterSunday(2026)).toEqual(new Date(2026, 3, 5));  // April 5, 2026
  });

  test("edge cases for date boundaries", () => {
    // Test year boundaries
    expect(isChristmasDay(new Date(2024, 11, 25, 23, 59, 59))).toBe(true);
    expect(isChristmasDay(new Date(2025, 0, 1))).toBe(false);
    
    // Test month boundaries for May 13
    expect(isMay13(new Date(2025, 3, 30))).toBe(false); // April 30
    expect(isMay13(new Date(2025, 4, 1))).toBe(false);  // May 1
    expect(isMay13(new Date(2025, 4, 13))).toBe(true);  // May 13
    expect(isMay13(new Date(2025, 5, 1))).toBe(false);  // June 1
  });
});
