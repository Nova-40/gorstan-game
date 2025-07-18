// Filename: scoreEffects.ts
// Location: state/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License

import { updateScore, applyScoreBonus, applyScorePenalty } from './scoreManager';

// Master map of events to score deltas
export const eventScoreMap: Record<string, number> = {
  // Intro choices
  'intro.choice.jump': 10,
  'intro.choice.sip': 50,
  'intro.choice.wait': -25,
  
  // Puzzle solving
  'solve.puzzle.simple': 25,
  'solve.puzzle.hard': 75,
  'solve.puzzle.expert': 150,
  
  // Discovery and exploration
  'find.hidden.item': 30,
  'find.secret.room': 60,
  'find.easter.egg': 15,
  'discover.lore': 20,
  
  // NPC interactions
  'npc.dominic.survives': 40,
  'npc.dominic.dead': -50,
  'npc.wendell.polite': 25,
  'npc.wendell.rude': -75,
  'npc.librarian.helpful': 35,
  'conversation.meaningful': 10,
  
  // Game mechanics
  'cheat.mode.used': -100,
  'reset.button.pressed': -10,
  'blue.button.pressed': -20,
  'hint.used': -5,
  'save.game': 5,
  
  // Items and objects
  'coffee.returned': 20,
  'item.stolen': -15,
  'item.shared': 25,
  'goldfish.rescued': 50,
  'item.cursed': -40,
  'memory.recovered': 60,
  'codex.discovery': 15,
  'hint.requested': -5,
  'discover.teleport.system': 100,
  'teleport.successful': 25,
  
  // Gameplay actions
  'trap.disarmed': 15,
  'trap.triggered': -30,
  'door.unlocked': 10,
  'puzzle.skipped': -20,
  
  // Death and resurrection
  'player.killed': -200,
  'player.resurrected': 100,
  'near.death.escape': 75,
  
  // Achievements and milestones
  'achievement.unlocked': 50,
  'zone.completed': 100,
  'perfect.playthrough': 500,
  
  // Special events
  'dream.sequence.completed': 40,
  'reality.hacked': 80,
  'multiverse.explored': 120,
  'constitution.found': 35,
  'ending.reached': 300,
};

/**
 * Apply score for a specific event
 */
export function applyScoreForEvent(eventId: string): void {
  const delta = eventScoreMap[eventId];
  if (delta !== undefined) {
    updateScore(delta);
  } else {
    console.warn(`[ScoreEffects] Unknown event ID: ${eventId}`);
  }
}

/**
 * Apply score with custom reason and amount
 */
export function applyCustomScore(eventId: string, amount: number, reason?: string): void {
  if (amount > 0) {
    applyScoreBonus(reason || eventId, amount);
  } else {
    applyScorePenalty(reason || eventId, Math.abs(amount));
  }
}

/**
 * Get score impact for an event (for preview/UI purposes)
 */
export function getScoreImpact(eventId: string): number {
  return eventScoreMap[eventId] || 0;
}

/**
 * Batch apply multiple events
 */
export function applyScoreForEvents(eventIds: string[]): void {
  eventIds.forEach(eventId => applyScoreForEvent(eventId));
}

/**
 * Score thresholds for different achievements or reactions
 */
export const scoreThresholds: Record<string, number> = {
  // Achievement unlocks
  'rookie': 100,
  'explorer': 300,
  'master': 600,
  'legend': 1000,
  
  // NPC reactions
  'dominic.impressed': 200,
  'wendell.approves': 400,
  'librarian.respects': 350,
  
  // Special unlocks
  'secret.ending': 800,
  'perfect.rating': 1200,
  'cheat.forgiveness': -50, // Negative threshold for redemption
};

/**
 * Check if score meets a threshold
 */
export function meetsThreshold(currentScore: number, thresholdKey: string): boolean {
  const threshold = scoreThresholds[thresholdKey];
  return threshold !== undefined && currentScore >= threshold;
}

/**
 * Get appropriate score-based message or reaction
 */
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

/**
 * Special Dominic score commentary
 */
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
