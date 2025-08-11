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

// src/utils/npcUtils.ts
// Utility for intelligent NPC responses in Gorstan
import type { NPC } from '../types/NPCTypes';

export function getNPCResponse(npc: NPC, input: string): string {
  const key = input.toLowerCase().trim();

  // Direct match to custom responses
  if (npc.customResponses && npc.customResponses[key]) {
    return npc.customResponses[key];
  }

  // Fallback logic for common questions
  if (key.includes('who are you')) {
    return npc.id === 'ayla'
      ? "I'm Ayla. I am the Lattice."
      : `I'm ${npc.name}. I mostly keep to myself.`;
  }

  if (key.includes('what do you know')) {
    return npc.id === 'ayla'
      ? 'Most things. But I prioritise relevance, not volume.'
      : 'Enough to stay alive. Want to ask about something specific?';
  }

  if (key.includes('what should i do')) {
    return npc.id === 'ayla'
      ? 'Remain curious. Stay mobile. Avoid Polly.'
      : 'Depends what you\'re trying to survive. Or break.';
  }

  return "I'm not sure how to answer that. Try asking something else.";
}
