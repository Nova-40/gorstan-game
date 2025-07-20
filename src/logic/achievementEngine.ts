// achievementEngine.ts — logic/achievementEngine.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: Initialize the achievement engine with dispatch function


// Filename: achievementEngine.ts
// Location: logic/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import { GameAction } from '../types/GameTypes';
import { Dispatch } from 'react';

interface Achievement {
  id: string;
  label: string;
  description?: string;
}

// Master list of all possible achievements
const achievementDefinitions: Achievement[] = [
  { id: 'took_dominic', label: 'Took Dominic the Goldfish', description: 'You rescued a goldfish from certain doom' },
  { id: 'reached_final_zone', label: 'Reached Final Zone', description: 'You made it to the end of your journey' },
  { id: 'reset_count_1', label: 'You Have Reset At Least Once', description: 'Sometimes we all need a fresh start' },
  { id: 'found_constitution', label: 'Discovered the Constitution Scroll', description: 'Knowledge is power' },
  { id: 'dream_sequence_seen', label: 'Experienced a Dream Room', description: 'Reality becomes fluid in dreams' },
  { id: 'first_death', label: 'First Steps into Darkness', description: 'Death is just another teacher' },
  { id: 'explorer', label: 'Explorer', description: 'Visited 10 different rooms' },
  { id: 'conversationalist', label: 'Social Butterfly', description: 'Had meaningful conversations with multiple NPCs' },
  { id: 'puzzle_solver', label: 'Mind Over Matter', description: 'Successfully solved a challenging puzzle' },
  { id: 'reality_hacker', label: 'Reality Hacker', description: 'Bent the rules of the multiverse to your will' },
  { id: 'wendell_encounter', label: 'Entity of Consequence', description: 'Met Mr. Wendell. Politeness is survival.' },
  { id: 'multiverse_rebooter', label: 'Multiverse Rebooter', description: 'Used the blue button to reboot reality itself' },
  { id: 'interdimensional_traveler', label: 'Interdimensional Traveler', description: 'Discovered and used the remote control teleportation system' },
  { id: 'hub_hopper', label: 'Hub Hopper', description: 'Used the remote control to visit multiple hub locations' },
];

// Global dispatch function reference
let globalDispatch: Dispatch<GameAction> | null = null;

/**
 * Initialize the achievement engine with dispatch function
 */
export function initializeAchievementEngine(dispatch: Dispatch<GameAction>): void {
  globalDispatch = dispatch;
}

/**
 * Unlock an achievement - now properly integrated with game state
 */
export function unlockAchievement(id: string): void {
  const achievement = achievementDefinitions.find(a => a.id === id);
  if (!achievement) {
    console.warn(`[AchievementEngine] Unknown achievement ID: ${id}`);
    return;
  }

  // Dispatch to game state for persistent storage
  if (globalDispatch) {
    globalDispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id });
    
    // Apply achievement score bonus
    globalDispatch({ type: 'UPDATE_SCORE', payload: 50 });
    
    // Also record the achievement message in the game history
    globalDispatch({ 
      type: 'RECORD_MESSAGE', 
      payload: {
        id: `achievement-${Date.now()}`,
        text: `🏆 Achievement Unlocked: ${achievement.label}`,
        type: 'achievement',
        timestamp: Date.now(),
      }
    });
    
    // Score bonus message
    globalDispatch({ 
      type: 'RECORD_MESSAGE', 
      payload: {
        id: `achievement-score-${Date.now()}`,
        text: '+50 points',
        type: 'achievement',
        timestamp: Date.now(),
      }
    });
    
    if (achievement.description) {
      globalDispatch({ 
        type: 'RECORD_MESSAGE', 
        payload: {
          id: `achievement-desc-${Date.now()}`,
          text: achievement.description,
          type: 'achievement',
          timestamp: Date.now(),
        }
      });
    }
  }
}

/**
 * List all achievements with current unlock status
 */
export function listAchievements(unlockedIds: string[] = []): string[] {
  const messages: string[] = [];
  messages.push("🏆 Achievements:");
  
  achievementDefinitions.forEach(achievement => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    const status = isUnlocked ? "✓" : " ";
    messages.push(`- [${status}] ${achievement.label}`);
    if (isUnlocked && achievement.description) {
      messages.push(`    ${achievement.description}`);
    }
  });
  
  return messages;
}

/**
 * Display achievements in the game console
 */
export function displayAchievements(unlockedIds: string[] = []): void {
  if (globalDispatch) {
    const messages = listAchievements(unlockedIds);
    messages.forEach(message => {
      globalDispatch!({ 
        type: 'RECORD_MESSAGE', 
        payload: {
          id: `achievements-${Date.now()}-${Math.random()}`,
          text: message,
          type: 'system',
          timestamp: Date.now(),
        }
      });
    });
  }
}

/**
 * Get achievement definition by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return achievementDefinitions.find(a => a.id === id);
}

/**
 * Get all achievement definitions
 */
export function getAllAchievements(): Achievement[] {
  return [...achievementDefinitions];
}

/**
 * Check if player has specific achievement
 */
export function hasAchievement(id: string, unlockedIds: string[]): boolean {
  return unlockedIds.includes(id);
}

/**
 * Get achievement progress stats
 */
export function getAchievementStats(unlockedIds: string[] = []): { total: number; unlocked: number; percentage: number } {
  const total = achievementDefinitions.length;
  const unlocked = unlockedIds.length;
  const percentage = Math.round((unlocked / total) * 100);
  
  return { total, unlocked, percentage };
}
