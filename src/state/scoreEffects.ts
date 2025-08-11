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
// Game module.

import type { Achievement, Puzzle } from '../types/GameTypes';
import type { NPC } from '../types/NPCTypes';

import { updateScore, applyScoreBonus, applyScorePenalty } from './scoreManager';
















export const eventScoreMap: Record<string, number> = {
  // === EXPLORATION & DISCOVERY ===
  'room.new.explored': 5,           // Exploring a new room: +5
  'secret.room.discovered': 15,     // Finding hidden areas: +15
  'puzzle.solved': 15,              // Solving a puzzle: +15
  'puzzle.solved.creative': 20,     // Creative puzzle solution: +20
  'hidden.content.unlocked': 8,     // Unlocking hidden content: +8
  'glitchrealm.secrets.found': 8,   // Finding Glitchrealm secrets: +8
  'teleport.system.discovered': 100, // Discover teleport system: +100
  'codex.discovery': 15,            // Codex entry discovered: +15

  // === ETHICAL DECISIONS & DIPLOMACY ===
  'dominic.spared': 10,             // Ethical decision (sparing Dominic): +10
  'npc.dominic.survives': 40,       // Dominic survives encounter: +40
  'diplomacy.used': 10,             // Using diplomacy instead of violence: +10
  'conversation.meaningful': 10,    // Meaningful conversation: +10
  'npc.wendell.polite': 25,         // Being polite to Wendell: +25
  'npc.librarian.helpful': 35,      // Being helpful to librarian: +35
  'conflict.resolved.peacefully': 15, // Peaceful conflict resolution: +15

  // === RESET & SYSTEM EVENTS ===
  'reset.completed.correctly': 20,  // Completing a reset correctly: +20
  'polly.takeover.prevented': 25,   // Preventing Polly takeover: +25
  'reality.stabilized': 15,         // Stabilizing reality after glitch: +15
  'multiverse.reboot.successful': 30, // Successful multiverse reboot: +30

  // === NEGATIVE EVENTS ===
  'npc.dominic.dead': -15,          // Causing NPC death (Dominic): -15
  'npc.death.caused': -15,          // Causing any NPC death: -15
  'reality.broken.unstabilized': -10, // Breaking reality without stabilizing: -10
  'item.hoarded': -5,               // Hoarding/misuse of items: -5
  'item.misused': -5,               // Misusing items: -5
  'puzzle.skipped.brute.force': -8, // Skipping puzzles via brute force: -8
  'raven.flagged.redacted': -7,     // Being flagged by RAVEN as redacted: -7
  'polly.takeover.failed.to.stop': -20, // Failing to stop Polly takeover: -20
  'npc.wendell.rude': -75,          // Being rude to Wendell: -75

  // === LEGACY EVENTS (preserved for compatibility) ===
  'intro.choice.jump': 10,
  'intro.choice.sip': 50,
  'intro.choice.wait': -25,
  'solve.puzzle.simple': 25,
  'solve.puzzle.hard': 75,
  'solve.puzzle.expert': 150,
  'find.hidden.item': 30,
  'find.secret.room': 60,
  'find.easter.egg': 15,
  'discover.lore': 20,
  'cheat.mode.used': -100,
  'reset.button.pressed': -10,
  'blue.button.pressed': -20,
  'hint.used': -5,
  'save.game': 5,
  'coffee.returned': 20,
  'item.stolen': -15,
  'item.shared': 25,
  'goldfish.rescued': 50,
  'item.cursed': -40,
  'memory.recovered': 60,
  'hint.requested': -5,
  'teleport.successful': 25,
  'trap.disarmed': 15,
  'trap.triggered': -30,
  'door.unlocked': 10,
  'player.killed': -200,
  'player.resurrected': 100,
  'near.death.escape': 75,
  'achievement.unlocked': 50,
  'zone.completed': 100,
  'perfect.playthrough': 500,
  'dream.sequence.completed': 40,
  'reality.hacked': 80,
  'multiverse.explored': 120,
  'constitution.found': 35,
  'ending.reached': 300,
};



// --- Function: applyScoreForEvent ---
export function applyScoreForEvent(eventId: string): void {
// Variable declaration
  const delta = eventScoreMap[eventId];
  if (delta !== undefined) {
    updateScore(delta);
  } else {
    console.warn(`[ScoreEffects] Unknown event ID: ${eventId}`);
  }
}



// --- Function: applyCustomScore ---
export function applyCustomScore(eventId: string, amount: number, reason?: string): void {
  if (amount > 0) {
    applyScoreBonus(reason || eventId, amount);
  } else {
    applyScorePenalty(reason || eventId, Math.abs(amount));
  }
}



// --- Function: getScoreImpact ---
export function getScoreImpact(eventId: string): number {
  return eventScoreMap[eventId] || 0;
}



// --- Function: applyScoreForEvents ---
export function applyScoreForEvents(eventIds: string[]): void {
  eventIds.forEach(eventId => applyScoreForEvent(eventId));
}


export const scoreThresholds: Record<string, number> = {
  
  'rookie': 100,
  'explorer': 300,
  'master': 600,
  'legend': 1000,

  
  'dominic.impressed': 200,
  'wendell.approves': 400,
  'librarian.respects': 350,

  
  'secret.ending': 800,
  'perfect.rating': 1200,
  'cheat.forgiveness': -50, 
};



// --- Function: meetsThreshold ---
export function meetsThreshold(currentScore: number, thresholdKey: string): boolean {
// Variable declaration
  const threshold = scoreThresholds[thresholdKey];
  return threshold !== undefined && currentScore >= threshold;
}



// --- Function: getScoreBasedMessage ---
export function getScoreBasedMessage(currentScore: number): string | null {
  if (currentScore >= scoreThresholds.legend) {
    return "You are a legendary adventurer!";
  } else if (currentScore >= scoreThresholds.master) {
    return "Your skills are truly masterful.";
  } else if (currentScore >= scoreThresholds.explorer) {
    return "You're becoming quite the explorer.";
  } else if (currentScore >= scoreThresholds.rookie) {
    return "You're getting the hang of this!";
  } else if (currentScore <= -100) {
    return "Perhaps a more careful approach would serve you better...";
  } else if (currentScore <= 0) {
    return "Every expert was once a beginner.";
  }

  return null;
}



// --- Function: getDominicScoreComment ---
export function getDominicScoreComment(currentScore: number): string | null {
  if (currentScore >= 500) {
    return "You know, for someone with such a high score, you sure know how to make questionable choices with goldfish.";
  } else if (currentScore >= 200) {
    return "Your score's not bad, though I question your methods involving aquatic creatures.";
  } else if (currentScore <= -50) {
    return "You know, some people earn that score by not stealing fish.";
  } else if (currentScore <= 0) {
    return "Maybe try earning points through less fish-related activities?";
  }

  return null;
}
