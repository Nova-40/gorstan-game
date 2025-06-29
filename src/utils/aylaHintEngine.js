// src/utils/aylaHintEngine.js
// Gorstan v3.9.8 – Hint logic extracted from AskAyla
// (c) 2025 Geoffrey Webster. MIT License

/**
 * Generates context-aware hints for the player based on room, inventory, flags, and traits.
 * @param {Object} room
 * @param {Object} flags
 * @param {Array} inventory
 * @param {Array} traits
 * @returns {string}
 */
export function generateHint(room, flags, inventory, traits) {
  const id = room?.id;

  if (flags?.godmode)
    return "🛠 You're in godmode. Try /goto or /solve if you're stuck.";

  if (id === 'resetroom' && !flags.resetButtonPressed)
    return "🔴 Try pressing the big glowing button. Worst case? Multiverse annihilation.";

  if (['controlnexus', 'hiddenlab'].includes(id) && !inventory.includes('coffee'))
    return "☕ You dropped your coffee earlier… maybe try throwing it?";

  if (id === 'greasystoreroom' && !inventory.includes('dirty napkin'))
    return "🧻 That greasy napkin may be more than it seems.";

  if (id === 'introreset')
    return "🌀 Strange place, isn’t it? You might need to retrace your steps.";

  if (traits.includes('curious') && id.startsWith('maze'))
    return "🧠 You've been here before. Look closer — something has changed.";

  return "🤷 Honestly? I'm not sure. But I believe in you, mostly.";
}
