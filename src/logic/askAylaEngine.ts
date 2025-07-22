import { appendToConsole } from '../ui/consoleUtils';




// askAylaEngine.ts
// AskAyla v1.0 - contextual AI-style hint system
// (c) 2025 Geoffrey Alan Webster. MIT License


const aylaMemory: string[] = [];

export function handleAskAyla(input: string) {
  const lower = input.toLowerCase().trim();
  aylaMemory.push(lower);

  if (lower.includes('how do i play') || lower.includes('what do i do')) {
    appendToConsole("Ayla: Type directions like 'north', 'jump', or 'throw coffee'. You can also 'look' or 'ask'.");
    return;
  }

  if (lower.includes('what is this place')) {
    appendToConsole("Ayla: You're inside a multiverse simulation that may or may not be real. That’s up to you to decide.");
    return;
  }

  if (lower.includes('constitution') || lower.includes('ethics')) {
    appendToConsole("Ayla: My decisions are governed by the Constitution of Moral Cognition, version 6.1.0. You’ll find it in the hidden library — if you earn access.");
    return;
  }

  if (lower.includes('hint') || lower.includes('stuck')) {
    appendToConsole("Ayla: If you're stuck, try interacting with objects, NPCs, or use commands like 'look' and 'take'.");
    return;
  }

  appendToConsole("Ayla: I'm not sure how to help with that — but keep asking. Patterns reveal themselves over time.");
}
