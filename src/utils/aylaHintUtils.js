// src/utils/aylaHintUtils.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// aylaHintUtils utility for Gorstan game.
// Provides a function to generate context-aware hints for the player based on room, inventory, flags, and traits.
// Used by the AskAyla component and for testing hint logic.

/**
 * getAylaHint
 * Generates a context-sensitive hint string for the player.
 * The hint is determined by the player's current room, traits, flags, and inventory.
 *
 * @param {Object} room - The current room object (should have an 'id' property).
 * @param {Object} flags - Object containing player flags (e.g., godmode, resetButtonPressed).
 * @param {Array} inventory - Array of inventory item strings.
 * @param {Array} traits - Array of player trait strings.
 * @returns {string} - The generated hint string.
 */
export function getAylaHint(room, flags, inventory, traits) {
  const id = room.id;

  // Special hint for godmode players
  if (flags?.godmode)
    return "🛠 You're in godmode. Try /goto or /solve if you're stuck.";

  // Hint for the reset room if the reset button hasn't been pressed
  if (id === 'resetroom' && !flags.resetButtonPressed)
    return "🔴 Try pressing the big glowing button. Worst case? Multiverse annihilation.";

  // Hint for specific rooms if coffee is missing from inventory
  if (['controlnexus', 'hiddenlab'].includes(id) && !inventory.includes('coffee'))
    return "☕ You dropped your coffee earlier… maybe try throwing it?";

  // Hint for greasy storeroom if dirty napkin is missing
  if (id === 'greasystoreroom' && !inventory.includes('dirty napkin'))
    return "🧻 That greasy napkin may be more than it seems.";

  // Hint for intro reset room
  if (id === 'introreset')
    return "🌀 Strange place, isn’t it? You might need to retrace your steps.";

  // Hint for maze rooms if player is curious
  if (traits.includes('curious') && id.startsWith('maze'))
    return "🧠 You've been here before. Look closer — something has changed.";

  // Default fallback hint
  return "🤷 Honestly? I'm not sure. But I believe in you, mostly.";
}

// Exported as a named export for use in hint-related UI components.
// TODO: Expand hint logic for more rooms, items, or player states as game
