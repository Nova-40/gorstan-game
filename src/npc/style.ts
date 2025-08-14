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

// src/npc/style.ts
// NPC Voice Styling for Inter-NPC Conversations
// Applies personality traits to dialogue text
// Gorstan Game Beta 1

import { Voice } from "../types/dialogue";

export function stylize(text: string, voice: Voice): string {
  let styled = text;

  // Apply formality level
  if (voice.formality === 0) {
    // Casual - add contractions, informal language
    styled = styled
      .replace(/cannot/g, "can't")
      .replace(/will not/g, "won't")
      .replace(/do not/g, "don't");
  } else if (voice.formality === 2) {
    // Formal - expand contractions, formal language
    styled = styled
      .replace(/can't/g, "cannot")
      .replace(/won't/g, "will not")
      .replace(/don't/g, "do not")
      .replace(/it's/g, "it is")
      .replace(/that's/g, "that is");
  }

  // Apply terseness
  if (voice.terseness === 2) {
    // Very terse - remove unnecessary words
    styled = styled
      .replace(/I think that/g, "I think")
      .replace(/It seems to me that/g, "Seems")
      .replace(/In my opinion,?/g, "");
  } else if (voice.terseness === 0) {
    // Verbose - add elaboration markers
    if (!styled.includes("you see") && !styled.includes("actually")) {
      const elaborators = ["you see", "actually", "as it happens", "indeed"];
      const elaborator =
        elaborators[Math.floor(Math.random() * elaborators.length)];
      styled = styled.replace(/\. /, `, ${elaborator}. `);
    }
  }

  // Add characteristic tics occasionally (20% chance)
  if (voice.tics && Math.random() < 0.2) {
    const tic = voice.tics[Math.floor(Math.random() * voice.tics.length)];
    // Add tic at end if it's an action, at beginning if it's a word
    if (tic.startsWith("*")) {
      styled += ` ${tic}`;
    } else {
      styled = `${tic} ${styled}`;
    }
  }

  return styled;
}

// Generate contextual responses based on topic and relationship
export function generateNPCResponse(
  fromNpcId: string,
  toNpcId: string,
  topic?: string,
  context?: string,
): string {
  // Base responses by NPC pairing and topic
  const responses = getNPCPairResponses(fromNpcId, toNpcId, topic);

  if (responses.length === 0) {
    return getGenericResponse(toNpcId, topic);
  }

  return responses[Math.floor(Math.random() * responses.length)];
}

function getNPCPairResponses(
  from: string,
  to: string,
  topic?: string,
): string[] {
  const key = `${from}-${to}`;

  // Specific NPC pair responses
  const pairResponses: Record<string, Record<string, string[]>> = {
    "morthos-al": {
      banter: [
        "Did you reorganize my tools again?",
        "Your efficiency protocols are showing, Al.",
        "That calculation seems off by 0.3%.",
      ],
      hint: [
        "Al, the player seems stuck. Thoughts?",
        "Should we mention the pattern sequence?",
        "Time for a subtle nudge, perhaps?",
      ],
      lore: [
        "Remember when the reset protocols first activated?",
        "Do you think they understand the loop nature?",
        "The control systems weren't always this complex.",
      ],
    },
    "al-morthos": {
      banter: [
        "Correlation does not imply causation, Morthos.",
        "Your tools are exactly where efficiency dictates.",
        "Precision is paramount in all calculations.",
      ],
      hint: [
        "Indeed. A logical progression would be...",
        "The pattern follows a clear sequence.",
        "Observation suggests they need guidance.",
      ],
      lore: [
        "The historical records indicate...",
        "Documentation shows the original parameters...",
        "Logical analysis suggests the purpose was...",
      ],
    },
    "ayla-morthos": {
      hint: [
        "Morthos, the player is circling. Suggest you hint at the pedestal pattern.",
        "They're missing the mechanical aspect. Your expertise?",
        "Time for an engineering perspective, don't you think?",
      ],
      quest: [
        "The next phase requires your technical knowledge.",
        "Your understanding of the systems could help here.",
        "They need to see the mechanical connections.",
      ],
    },
    "ayla-al": {
      hint: [
        "Al, they need precision guidance on the sequence.",
        "Logical analysis might clarify their confusion.",
        "Your systematic approach could illuminate the pattern.",
      ],
      quest: [
        "The documentation suggests a specific order.",
        "Your records might contain the solution.",
        "Systematic analysis is needed here.",
      ],
    },
  };

  return pairResponses[key]?.[topic || "banter"] || [];
}

function getGenericResponse(npcId: string, topic?: string): string {
  const genericsByNPC: Record<string, Record<string, string[]>> = {
    morthos: {
      banter: [
        "*mechanical whirring*",
        "Interesting observation.",
        "Systems nominal.",
      ],
      hint: [
        "Perhaps we should guide them.",
        "The solution involves mechanical precision.",
      ],
      lore: [
        "The old systems were different.",
        "Before the resets, things were simpler.",
      ],
    },
    al: {
      banter: ["Ahem.", "Quite so.", "Logical."],
      hint: ["Systematic approach required.", "The pattern should be evident."],
      lore: ["Historical precedent suggests...", "Documentation indicates..."],
    },
    ayla: {
      banter: ["Indeed.", "The choices matter.", "Patterns emerge."],
      hint: ["Guide them gently.", "Agency is important."],
      lore: ["The story has layers.", "Purpose unfolds with time."],
    },
  };

  const responses = genericsByNPC[npcId]?.[topic || "banter"] || ["..."];
  return responses[Math.floor(Math.random() * responses.length)];
}
