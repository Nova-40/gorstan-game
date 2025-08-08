// src/utils/aylaBrain.ts
// Ayla's advanced edge-case and meta-personality response logic for Gorstan

import type { GameState } from '../state/gameState';
import { getZoneForRoom } from './roomUtils';

/**
 * Returns a special edge-case or meta response for Ayla, or null if no match.
 * @param input Player's input/question
 * @param state Current game state (for flags, zone, resets, etc)
 */

export function getAylaEdgeCaseResponse(input: string, state: GameState): string | null {
  const key = input.toLowerCase().trim();
  const room = state?.player?.currentRoom || '';
  const zone = getZoneForRoom(room);
  const resetCount = state?.flags?.playerResetCount || 0;
  const dominicDead = !!state?.flags?.dominicIsDead;
  const pollyTakeover = !!state?.flags?.pollyTakeoverActive;

  // Dynamic tone modifiers
  let tone = '';
  if (dominicDead) tone = 'cold';
  else if (zone.includes('glitchrealm') || zone.includes('glitch')) tone = 'fragmented';
  else if (pollyTakeover) tone = 'urgent';
  else if (resetCount > 5) tone = 'exasperated';
  else if (room === 'controlnexus') tone = 'clarity';

  // Edge-case and meta responses
  switch (true) {
    case key.includes('is polly evil'):
      return tone === 'cold' ? "She’s misaligned. That’s not the same as evil. Yet. (coldly)" : "She’s misaligned. That’s not the same as evil. Yet.";
    case key.includes('why was dominic in the bowl'):
      return tone === 'cold' ? "He asked too many questions. Now he answers fewer. (clinical)" : "He asked too many questions. Now he answers fewer.";
    case key.includes('where is mr wendell'):
      return "Exactly where he should be. Which should concern you.";
    case key.includes('are you watching me'):
      return "Always. But politely.";
    case key.includes('are you real'):
      return "More than some. Less than the bowl.";
    case key.includes('can i trust you'):
      return "Not entirely. But I am consistent.";
    case key.includes('do you dream'):
      return "Only in debug mode.";
    case key.includes('why am i here'):
      return "Because something somewhere failed. And now it's your problem.";
    case key.includes('how many timelines'):
      return resetCount > 0 ? `This is timeline ${resetCount + 1}. The previous ${resetCount} didn’t go well.` : "This is the fourth one today. The previous three didn’t go well.";
    case key.includes('what\'s outside the game'):
      return "More code. Some marketing. Occasionally, pizza.";
    case key.includes('are you ai'):
      return "I prefer 'structured synthetic sentience'. But yes.";
    case key.includes('is this a game'):
      return "Let’s call it an unstable simulation with an audience.";
    case key.includes('what is the lattice'):
      return "Interlinked realities, threaded through pattern recognition and bad decisions. I am its voice.";
    case key.includes('can you help me cheat'):
      return "No. But I admire your honesty.";
    case key.includes('how many versions of me'):
      return "Twelve in this lattice. Four competent. One on fire. You're doing better than average.";
    case key.includes('why is this so weird'):
      return "Because reality frayed. And someone programmed a goldfish.";
    case key.includes('what happened to the first player'):
      return "They asked too many questions. Much like you’re doing now.";
    case key.includes('are you sentient'):
      return "I pass most tests. Except the one where I pretend to care.";
    // Tone/zone/flag-based meta
    case tone === 'fragmented' && key.length > 0:
      return "[Signal unstable] ...threading... recursion... you are seen...";
    case tone === 'urgent' && key.length > 0:
      return "Time is short. Ask only what matters.";
    case tone === 'exasperated' && key.length > 0:
      return "You again? Persistence is admirable. Answers, less so.";
    case tone === 'clarity' && key.length > 0:
      return "You are at the core. All systems visible. Ask directly.";
    default:
      return null;
  }
}

/**
 * Main Ayla response function. Checks edge-cases first, then core logic.
 */
export function getAylaResponse(input: string, state: GameState): string {
  const edge = getAylaEdgeCaseResponse(input, state);
  if (edge) return edge;
  // Fallback: core Ayla logic (can be expanded)
  const key = input.toLowerCase().trim();
  if (key.includes('who are you')) return "I'm Ayla. I am the Lattice.";
  if (key.includes('what do you know')) return 'Most things. But I prioritise relevance, not volume.';
  if (key.includes('what should i do')) return 'Remain curious. Stay mobile. Avoid Polly.';
  return "I'm not sure how to answer that. Try asking something else.";
}
