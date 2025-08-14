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
// Ayla hint engine and query response UI.

import { appendToConsole } from "../ui/TerminalConsole";

const aylaMemory: string[] = [];

// --- Function: handleAskAyla ---
export function handleAskAyla(input: string) {
  // Variable declaration
  const lower = input.toLowerCase().trim();
  aylaMemory.push(lower);

  if (lower.includes("how do i play") || lower.includes("what do i do")) {
    appendToConsole(
      "Ayla: Type directions like 'north', 'jump', or 'throw coffee'. You can also 'look' or 'ask'.",
    );
    return;
  }

  if (lower.includes("what is this place")) {
    appendToConsole(
      "Ayla: You're inside a multiverse simulation that may or may not be real. That’s up to you to decide.",
    );
    return;
  }

  if (lower.includes("constitution") || lower.includes("ethics")) {
    appendToConsole(
      "Ayla: My decisions are governed by the Constitution of Moral Cognition, version 6.1.0. You’ll find it in the hidden library — if you earn access.",
    );
    return;
  }

  if (lower.includes("hint") || lower.includes("stuck")) {
    appendToConsole(
      "Ayla: If you're stuck, try interacting with objects, NPCs, or use commands like 'look' and 'take'.",
    );
    return;
  }

  appendToConsole(
    "Ayla: I'm not sure how to help with that — but keep asking. Patterns reveal themselves over time.",
  );
}
