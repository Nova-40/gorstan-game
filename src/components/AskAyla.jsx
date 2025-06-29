// src/components/AskAyla.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AskAyla = ({ room, traits, flags, inventory, onHint }) => {
  const [mood, setMood] = useState('helpful');

  const generateHint = () => {
    const { id } = room;

    if (flags?.godmode)
      return onHint("🛠 You're in godmode. Try /goto or /solve if you're stuck.");

    if (id === 'resetroom' && !flags.resetButtonPressed)
      return onHint("🔴 Try pressing the big glowing button. Worst case? Multiverse annihilation.");

    if (
      ['controlnexus', 'hiddenlab'].includes(id) &&
      !inventory.includes('coffee')
    )
      return onHint("☕ You dropped your coffee earlier… maybe try throwing it?");

    if (id === 'greasystoreroom' && !inventory.includes('dirty napkin'))
      return onHint("🧻 That greasy napkin may be more than it seems.");

    if (id === 'introreset')
      return onHint("🌀 Strange place, isn’t it? You might need to retrace your steps.");

    if (traits.includes('curious') && id.startsWith('maze'))
      return onHint("🧠 You've been here before. Look closer — something has changed.");

    return onHint("🤷 Honestly? I'm not sure. But I believe in you, mostly.");
  };

  return (
    <button
      className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 shadow w-full md:w-auto"
      onClick={generateHint}
      title="Click for a hint based on your location, traits, and inventory"
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

export default AskAyla;


