/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Controls NPC dialogue memory and state.
 */

// dialogueEngine.js – Memory-aware NPC Dialogue
// (c) Geoff Webster – MIT Licensed

const dialogueMemory = {};

export function getDialogue(npcName, state = {}) {
  if (!dialogueMemory[npcName]) {
    dialogueMemory[npcName] = 0;
  }

  dialogueMemory[npcName]++;

  switch (npcName) {
    case 'Morthos':
      if (dialogueMemory[npcName] > 3) {
        return "You again? I’ve already warned you once.";
      }
      return "This place is a memory, Dale.";
    case 'Al':
      return "Careful now, or you’ll trip over your own causality.";
    default:
      return "They look at you, uncertain.";
  }
}
