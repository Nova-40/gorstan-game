// src/components/AskAyla.jsx
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// AskAyla component for Gorstan game.
// Provides context-sensitive hints to the player based on room, traits, flags, and inventory.

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * AskAyla
 * Renders a button that, when clicked, provides a hint to the player.
 * The hint is determined by the player's current room, traits, flags, and inventory.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.room - The current room object.
 * @param {Array} props.traits - Array of player traits.
 * @param {Object} props.flags - Object containing player flags.
 * @param {Array} props.inventory - Array of inventory items.
 * @param {Function} props.onHint - Callback to display the generated hint.
 * @returns {JSX.Element}
 */
const AskAyla = ({ room, traits, flags, inventory, onHint }) => {
  // Mood state is reserved for future use (e.g., dynamic hint tone)
  // eslint-disable-next-line no-unused-vars
  const [mood, setMood] = useState('helpful');

  /**
   * generateHint
   * Determines the most relevant hint for the player based on their current state.
   * Calls the onHint callback with the generated hint string.
   */
  const generateHint = () => {
    const { id } = room;

    // Special hint for godmode players
    if (flags?.godmode) {
      return onHint("🛠 You're in godmode. Try /goto or /solve if you're stuck.");
    }

    // Hint for the reset room if the reset button hasn't been pressed
    if (id === 'resetroom' && !flags.resetButtonPressed) {
      return onHint("🔴 Try pressing the big glowing button. Worst case? Multiverse annihilation.");
    }

    // Hint for specific rooms if coffee is missing from inventory
    if (
      ['controlnexus', 'hiddenlab'].includes(id) &&
      !inventory.includes('coffee')
    ) {
      return onHint("☕ You dropped your coffee earlier… maybe try throwing it?");
    }

    // Hint for greasy storeroom if dirty napkin is missing
    if (id === 'greasystoreroom' && !inventory.includes('dirty napkin')) {
      return onHint("🧻 That greasy napkin may be more than it seems.");
    }

    // Hint for intro reset room
    if (id === 'introreset') {
      return onHint("🌀 Strange place, isn’t it? You might need to retrace your steps.");
    }

    // Hint for maze rooms if player is curious
    if (traits.includes('curious') && id.startsWith('maze')) {
      return onHint("🧠 You've been here before. Look closer — something has changed.");
    }

    // Default fallback hint
    return onHint("🤷 Honestly? I'm not sure. But I believe in you, mostly.");
  };

  return (
    <button
      className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 shadow w-full md:w-auto"
      onClick={generateHint}
      title="Click for a hint based on your location, traits, and inventory"
      type="button"
    >
      💬 Ask Ayla
    </button>
  );
};

AskAyla.propTypes = {
  room: PropTypes.object.isRequired,
  traits: PropTypes.array.isRequired,
  flags: PropTypes.object.isRequired,
  inventory: PropTypes.array.isRequired,
  onHint: PropTypes.func.isRequired,
};

// Export the AskAyla component for use in the main application
export default AskAyla;


