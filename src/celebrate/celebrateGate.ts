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

// src/celebrate/celebrateGate.ts
// Runtime helpers for celebration detection and management

import { Span } from './gen/util';

// Import celebration data directly
import indexData from './data/index.json';
import christianData from './data/christian.json';
import islamicData from './data/islamic.json';
import jewishData from './data/jewish.json';
import chineseData from './data/chinese.json';
import hinduData from './data/hindu.json';
import buddhistData from './data/buddhist.json';
import sikhData from './data/sikh.json';
import shintoData from './data/shinto.json';
import seasonalData from './data/seasonal.json';

// Type definitions for celebration data
export interface CelebrationData {
  [key: string]: Span[];
}

export interface CelebrationIndex {
  generated: string;
  yearRange: { start: number; end: number };
  traditions: Record<string, string[]>;
  totalCelebrations: number;
}

// Cache for loaded celebration data
let celebrationCache: Map<string, CelebrationData> = new Map();
let indexCache: CelebrationIndex | null = null;

// Data mapping
const dataMap: Record<string, CelebrationData> = {
  christian: christianData,
  islamic: islamicData,
  jewish: jewishData,
  chinese: chineseData,
  hindu: hinduData,
  buddhist: buddhistData,
  sikh: sikhData,
  shinto: shintoData,
  seasonal: seasonalData
};

/**
 * Load celebration data for a specific tradition
 */
export async function loadCelebrationData(tradition: string): Promise<CelebrationData> {
  if (celebrationCache.has(tradition)) {
    return celebrationCache.get(tradition)!;
  }
  
  try {
    const data = dataMap[tradition] || {};
    celebrationCache.set(tradition, data);
    return data;
  } catch (error) {
    console.warn(`Could not load celebration data for ${tradition}:`, error);
    return {};
  }
}

/**
 * Load the celebration index
 */
export async function loadCelebrationIndex(): Promise<CelebrationIndex | null> {
  if (indexCache) {
    return indexCache;
  }
  
  try {
    indexCache = indexData as CelebrationIndex;
    return indexCache;
  } catch (error) {
    console.warn('Could not load celebration index:', error);
    return null;
  }
}

/**
 * Check if a date falls within a celebration span
 */
export function isDateInSpan(date: Date, span: Span): boolean {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  return dateStr >= span.start && dateStr <= span.end;
}

/**
 * Find active celebrations for a given date
 */
export async function getActiveCelebrations(date: Date = new Date()): Promise<Span[]> {
  const index = await loadCelebrationIndex();
  if (!index) return [];
  
  const activeCelebrations: Span[] = [];
  
  // Check all traditions
  for (const [traditionName, holidays] of Object.entries(index.traditions)) {
    const traditionData = await loadCelebrationData(traditionName);
    
    // Check each holiday type in the tradition
    for (const holidayType of holidays) {
      const spans = traditionData[holidayType] || [];
      
      // Find active spans for this date
      const activeSpans = spans.filter(span => isDateInSpan(date, span));
      activeCelebrations.push(...activeSpans);
    }
  }
  
  return activeCelebrations;
}

/**
 * Check if any celebrations are active for a given date
 */
export async function hasCelebrations(date: Date = new Date()): Promise<boolean> {
  const celebrations = await getActiveCelebrations(date);
  return celebrations.length > 0;
}

/**
 * Get celebration by ID (for specific lookups)
 */
export async function getCelebrationById(id: string): Promise<Span | null> {
  const index = await loadCelebrationIndex();
  if (!index) return null;
  
  // Search through all traditions for the ID
  for (const [traditionName, holidays] of Object.entries(index.traditions)) {
    const traditionData = await loadCelebrationData(traditionName);
    
    for (const holidayType of holidays) {
      const spans = traditionData[holidayType] || [];
      const found = spans.find(span => span.id === id);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Storage keys for celebration preferences
 */
export const CELEBRATION_STORAGE_KEYS = {
  DISMISSED_CELEBRATIONS: 'gorstan_dismissed_celebrations',
  CELEBRATION_PREFERENCES: 'gorstan_celebration_preferences'
} as const;

/**
 * Check if a celebration has been dismissed this year
 */
export function isCelebrationDismissed(celebrationId: string): boolean {
  try {
    const dismissed = localStorage.getItem(CELEBRATION_STORAGE_KEYS.DISMISSED_CELEBRATIONS);
    const dismissedList = dismissed ? JSON.parse(dismissed) : [];
    return dismissedList.includes(celebrationId);
  } catch {
    return false;
  }
}

/**
 * Mark a celebration as dismissed for this year
 */
export function dismissCelebration(celebrationId: string): void {
  try {
    const dismissed = localStorage.getItem(CELEBRATION_STORAGE_KEYS.DISMISSED_CELEBRATIONS);
    const dismissedList = dismissed ? JSON.parse(dismissed) : [];
    
    if (!dismissedList.includes(celebrationId)) {
      dismissedList.push(celebrationId);
      localStorage.setItem(
        CELEBRATION_STORAGE_KEYS.DISMISSED_CELEBRATIONS,
        JSON.stringify(dismissedList)
      );
    }
  } catch (error) {
    console.warn('Could not save dismissed celebration:', error);
  }
}

/**
 * Clear dismissed celebrations (typically called on New Year)
 */
export function clearDismissedCelebrations(): void {
  try {
    localStorage.removeItem(CELEBRATION_STORAGE_KEYS.DISMISSED_CELEBRATIONS);
  } catch (error) {
    console.warn('Could not clear dismissed celebrations:', error);
  }
}

/**
 * Get celebration preferences (which traditions to show)
 */
export function getCelebrationPreferences(): Record<string, boolean> {
  try {
    const prefs = localStorage.getItem(CELEBRATION_STORAGE_KEYS.CELEBRATION_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {
      // Default to showing all traditions
      christian: true,
      islamic: true,
      jewish: true,
      chinese: true,
      hindu: true,
      buddhist: true,
      sikh: true,
      shinto: true,
      seasonal: true
    };
  } catch {
    return {};
  }
}

/**
 * Save celebration preferences
 */
export function saveCelebrationPreferences(preferences: Record<string, boolean>): void {
  try {
    localStorage.setItem(
      CELEBRATION_STORAGE_KEYS.CELEBRATION_PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.warn('Could not save celebration preferences:', error);
  }
}
