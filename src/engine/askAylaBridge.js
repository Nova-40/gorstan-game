// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: askAylaBridge.js
// Path: src/engine/askAylaBridge.js


// src/engine/askAylaBridge.js
// Version: 4.0.0-preprod
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License

/**
 * AskAylaBridge
 * Provides context-aware hints using Ayla's memory and NPC state.
 * Uses deterministic logic — no LLM.
 */

import { getNPCStatus } from './npcEngine';

/**
 * askAylaHint
 * Generates a helpful hint based on recent memory and player traits.
 *
 * @param {Object} playerState - Traits, flags, and location data.
 * @returns {string} - A contextual hint from Ayla.
 */
export function askAylaHint(playerState) {
  const status = getNPCStatus('ayla');
  const memory = status?.recentTopics || [];

  if (!memory.length) return "I'm listening. Try asking me something specific.";

  const trait = playerState.traits?.[0] || null;
  const flagKeys = Object.keys(playerState.flags || {});

  const recent = memory[memory.length - 1].toLowerCase();

  if (recent.includes('trap') && trait !== 'careful') {
    return "You keep asking about traps. Consider becoming more... careful.";
  }

  if (recent.includes('reset') && !flagKeys.includes('pressed_blue_button')) {
    return "If you're thinking reset — look for something blue, and very tempting.";
  }

  if (recent.includes('polly')) {
    return "Polly knows more than she says. Watch her closely in Stanton Harcourt.";
  }

  if (recent.includes('scroll') && !flagKeys.includes('found_library')) {
    return "You won't find the scroll without unlocking the Librarian first. Look for something greasy.";
  }

  return `You mentioned '${recent}' recently. Maybe explore it more or try using an item related to it.`;
}