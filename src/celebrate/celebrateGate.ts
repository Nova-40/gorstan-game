// src/celebrate/celebrateGate.ts
// Runtime helpers for celebration detection and management

import { Span } from './gen/util';

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

/**
 * Load celebration data for a specific tradition
 */
export async function loadCelebrationData(tradition: string): Promise<CelebrationData> {
  if (celebrationCache.has(tradition)) {
    return celebrationCache.get(tradition)!;
  }
  
  try {
    const response = await fetch(`/src/celebrate/data/${tradition}.json`);
    const data = await response.json();
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
    const response = await fetch('/src/celebrate/data/index.json');
    const data = await response.json();
    indexCache = data;
    return data;
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
