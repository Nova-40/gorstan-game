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

// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import { Dispatch } from "react";
import { GameAction } from "../types/GameTypes";
import { Room } from "../types/Room";

interface AchievementDefinition {
  id: string;
  label: string;
  description?: string;
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "took_dominic",
    label: "Took Dominic the Goldfish",
    description: "You rescued a goldfish from certain doom",
  },
  {
    id: "reached_final_zone",
    label: "Reached Final Zone",
    description: "You made it to the end of your journey",
  },
  {
    id: "reset_count_1",
    label: "You Have Reset At Least Once",
    description: "Sometimes we all need a fresh start",
  },
  {
    id: "found_constitution",
    label: "Discovered the Constitution Scroll",
    description: "Knowledge is power",
  },
  {
    id: "dream_sequence_seen",
    label: "Experienced a Dream Room",
    description: "Reality becomes fluid in dreams",
  },
  {
    id: "first_death",
    label: "First Steps into Darkness",
    description: "Death is just another teacher",
  },
  {
    id: "explorer",
    label: "Explorer",
    description: "Visited 10 different rooms",
  },
  {
    id: "conversationalist",
    label: "Social Butterfly",
    description: "Had meaningful conversations with multiple NPCs",
  },
  {
    id: "puzzle_solver",
    label: "Mind Over Matter",
    description: "Successfully solved a challenging puzzle",
  },
  {
    id: "reality_hacker",
    label: "Reality Hacker",
    description: "Bent the rules of the multiverse to your will",
  },
  {
    id: "wendell_encounter",
    label: "Entity of Consequence",
    description: "Met Mr. Wendell. Politeness is survival.",
  },
  {
    id: "multiverse_rebooter",
    label: "Multiverse Rebooter",
    description: "Used the blue button to reboot reality itself",
  },
  {
    id: "interdimensional_traveler",
    label: "Interdimensional Traveler",
    description: "Discovered and used the remote control teleportation system",
  },
  {
    id: "hub_hopper",
    label: "Hub Hopper",
    description: "Used the remote control to visit multiple hub locations",
  },
];

let globalDispatch: Dispatch<GameAction> | null = null;

// --- Function: initializeAchievementEngine ---
export function initializeAchievementEngine(
  dispatch: Dispatch<GameAction>,
): void {
  globalDispatch = dispatch;
}

// --- Function: unlockAchievement ---
export function unlockAchievement(id: string): void {
  // Variable declaration
  const achievement = achievementDefinitions.find((a) => a.id === id);
  if (!achievement) {
    console.warn(`[AchievementEngine] Unknown achievement ID: ${id}`);
    return;
  }

  if (globalDispatch) {
    globalDispatch({ type: "UNLOCK_ACHIEVEMENT", payload: id });

    globalDispatch({ type: "UPDATE_SCORE", payload: 50 });

    globalDispatch({
      type: "RECORD_MESSAGE",
      payload: {
        id: `achievement-${Date.now()}`,
        text: `🏆 Achievement Unlocked: ${achievement.label}`,
        type: "achievement",
        timestamp: Date.now(),
      },
    });

    globalDispatch({
      type: "RECORD_MESSAGE",
      payload: {
        id: `achievement-score-${Date.now()}`,
        text: "+50 points",
        type: "achievement",
        timestamp: Date.now(),
      },
    });

    if (achievement.description) {
      globalDispatch({
        type: "RECORD_MESSAGE",
        payload: {
          id: `achievement-desc-${Date.now()}`,
          text: achievement.description,
          type: "achievement",
          timestamp: Date.now(),
        },
      });
    }
  }
}

// --- Function: listAchievements ---
export function listAchievements(unlockedIds: string[] = []): string[] {
  const messages: string[] = [];
  messages.push("🏆 Achievements:");

  achievementDefinitions.forEach((achievement) => {
    // Variable declaration
    const isUnlocked = unlockedIds.includes(achievement.id);
    // Variable declaration
    const status = isUnlocked ? "✓" : " ";
    messages.push(`- [${status}] ${achievement.label}`);
    if (isUnlocked && achievement.description) {
      messages.push(`    ${achievement.description}`);
    }
  });

  return messages;
}

// --- Function: displayAchievements ---
export function displayAchievements(unlockedIds: string[] = []): void {
  if (globalDispatch) {
    // Variable declaration
    const messages = listAchievements(unlockedIds);
    messages.forEach((message) => {
      globalDispatch!({
        type: "RECORD_MESSAGE",
        payload: {
          id: `achievements-${Date.now()}-${Math.random()}`,
          text: message,
          type: "system",
          timestamp: Date.now(),
        },
      });
    });
  }
}

// --- Function: getAchievement ---
export function getAchievement(id: string): AchievementDefinition | undefined {
  return achievementDefinitions.find((a) => a.id === id);
}

// --- Function: getAllAchievements ---
export function getAllAchievements(): AchievementDefinition[] {
  return [...achievementDefinitions];
}

// --- Function: hasAchievement ---
export function hasAchievement(id: string, unlockedIds: string[]): boolean {
  return unlockedIds.includes(id);
}

// --- Function: getAchievementStats ---
export function getAchievementStats(unlockedIds: string[] = []): {
  total: number;
  unlocked: number;
  percentage: number;
} {
  // Variable declaration
  const total = achievementDefinitions.length;
  // Variable declaration
  const unlocked = unlockedIds.length;
  // Variable declaration
  const percentage = Math.round((unlocked / total) * 100);

  return { total, unlocked, percentage };
}
