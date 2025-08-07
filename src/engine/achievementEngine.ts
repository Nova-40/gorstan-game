// src/engine/achievementEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Achievement tracking and logging system

import { GameAction } from '../types/GameTypes';

/**
 * Dispatch function type for achievement operations
 */
type DispatchFunction = (action: GameAction) => void;

// Global dispatch reference for achievement logging
let globalDispatch: DispatchFunction | null = null;

/**
 * Set the global dispatch function for achievement operations
 */
export function setAchievementDispatch(dispatch: DispatchFunction): void {
  globalDispatch = dispatch;
}

/**
 * Achievement definition interface
 */
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  hidden: boolean;
  requirements: string[];
}

/**
 * Log an achievement for the player
 */
export function logAchievement(achievementId: string, context?: Record<string, any>): void {
  if (globalDispatch) {
    globalDispatch({
      type: 'ACHIEVEMENT_UNLOCKED',
      payload: {
        id: achievementId,
        timestamp: Date.now(),
        context: context || {}
      }
    });
    
    // Also log to console
    globalDispatch({
      type: 'ADD_CONSOLE_LINE',
      payload: `🏆 Achievement Unlocked: ${achievementId}`
    });
  } else {
    console.warn('Achievement dispatch not available:', achievementId);
  }
}

/**
 * Check if an achievement has been unlocked
 */
export function hasAchievement(achievementId: string): boolean {
  const achievements = localStorage.getItem('achievements');
  if (!achievements) return false;
  
  try {
    const parsed = JSON.parse(achievements);
    return Array.isArray(parsed) && parsed.includes(achievementId);
  } catch {
    return false;
  }
}

/**
 * Get all unlocked achievements
 */
export function getUnlockedAchievements(): string[] {
  const achievements = localStorage.getItem('achievements');
  if (!achievements) return [];
  
  try {
    const parsed = JSON.parse(achievements);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save achievement to localStorage
 */
export function saveAchievement(achievementId: string): void {
  const existing = getUnlockedAchievements();
  if (!existing.includes(achievementId)) {
    existing.push(achievementId);
    localStorage.setItem('achievements', JSON.stringify(existing));
  }
}
