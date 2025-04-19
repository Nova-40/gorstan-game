/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: General utility or configuration file.
 */


// gameUtils.js

// Sample NPC data (this should match what's in your npcs.js)
import npcs from './npcs';

// Find an NPC by ID
export function getNPCById(id) {
  return npcs.find(npc => npc.id === id);
}

// Adjust NPC attitude based on current attitude
export function adjustAttitude(current) {
  switch (current) {
    case 'neutral':
      return 'friendly';
    case 'hostile':
      return 'neutral';
    case 'friendly':
    default:
      return 'friendly';
  }
}
