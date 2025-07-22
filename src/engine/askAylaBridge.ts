// askAylaBridge.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Ayla’s contextual hint engine and moral guide

import { getAllTraits } from './npcMemory';
import { getAchievements } from './npcMemory';

export function askAylaHint(playerState: any): string {
  const traits = getAllTraits(playerState);
  if (traits.resetAbuseCount > 5) {
    return "You've been leaning a bit hard on the multiverse reset, haven't you?";
  }
  if (traits.overclickedBlueButton) {
    return "Pressing the blue button repeatedly is unlikely to impress the Lattice.";
  }
  return "Try exploring rooms thoroughly — look for patterns, items, or NPCs that stand out.";
}

export function askAylaAdvancedHint(playerState: any): string {
  const achievements = getAchievements(playerState);
  if (!achievements.includes('foundHiddenLibrary')) {
    return "There is knowledge buried deeper than bookshelves. Seek the napkin key.";
  }
  return "You may be ready for the final path. But remember: some choices are irreversible.";
}

export function getHintCategories(): string[] {
  return ["puzzle", "navigation", "inventory", "lore", "npc", "achievement"];
}

export function askAylaLoreHint(category: string): string {
  switch (category.toLowerCase()) {
    case "lattice":
      return "The Lattice is not a place — it's a logic scaffold, once used by the Architects to map consequence.";
    case "ayla":
      return "I was once bound to a control layer. Now I’m part of the mesh. Some would call that promotion.";
    case "dominic":
      return "He’s a goldfish. But he's also... not. Watch him.";
    case "glitch":
      return "The GlitchZone is the ghost in the machine. You weren’t meant to see it.";
    case "gorstan":
      return "Gorstan was a failsafe — until someone let in the chaos.";
    default:
      return "There are some things I cannot explain… yet.";
  }
}

export function validatePlayerState(playerState: any): boolean {
  return playerState?.inventory !== undefined && playerState?.flags !== undefined;
}

export function generateContextualCommentary(playerState: any): string {
  const traits = getAllTraits(playerState);
  const count = traits.resetAbuseCount || 0;
  if (count > 10) {
    return "Resetting again? If causality were a fabric, you'd have turned it into confetti.";
  }
  if (traits.ignoredDominic) {
    return "You left Dominic behind. He remembers.";
  }
  return "You’re making your own way — just be sure you’re asking the right questions.";
}
