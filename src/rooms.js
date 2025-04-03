
// rooms.js – Gorstan Game Room Definitions with Images
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

const rooms = {
  'crossing': {
    name: 'The Crossing',
    description: 'You stand at the edge of something vast and unknown. The road forks ahead.',
    exits: { north: 'control room', south: 'trent park london' },
    item: 'Time-Stamped Coffee'
  },
  'control room': {
    name: 'Control Room',
    description: 'Panels blink softly. A screen displays: “RESET READY.”',
    image: '/images/1-control-nexus.png',
    premiumOnly: true,
    exits: { south: 'crossing' }
  },
  'reset room': {
    name: 'Reset Room',
    description: 'A domed chamber with a single reclining chair.',
    image: '/images/2-reset-room.png',
    exits: {}
  },
  'trent park london': {
    name: 'Trent Park London',
    description: 'You’re on Earth. Trees rustle gently. You can feel something watching.',
    image: '/images/3-trent-park-earth.png',
    exits: {
      apartment: 'apartment',
      dock: 'st katherines dock',
      cafe: 'findlaters cafe',
      back: 'crossing'
    },
    item: 'Folded Note'
  },
  'findlaters cafe': {
    name: 'Findlaters Corner Café',
    description: 'You step into a cosy café tucked into a city corner. Ayla looks up from a laptop. “You’re early,” she says. Then flickers. “I’m not here till book three.” Her form glitches again. “There’s something under Central Park... I wasn’t meant to say that.”',
    image: '/images/findlaters-corner-cafe.png',
    exits: { back: 'trent park london' },
    item: 'Time-Stamped Coffee'
  },
  'apartment': {
    name: 'Dale’s Apartment',
    description: 'Dale sits alone, the past catching up.',
    image: '/images/5-dales-apartment.png',
    exits: { back: 'trent park london' },
    item: null
  },
  'st katherines dock': {
    name: 'St Katherine’s Dock',
    description: 'You walk the quiet docks. A swirling portal stands open near the water’s edge, humming faintly. It leads to... Central Park?',
    image: '/images/4-st-katherines-dock.png',
    exits: { portal: 'central park', east: 'trent park london' },
    item: null
  },
  'central park': {
    name: 'Central Park',
    description: 'Grass stretches out toward skyscrapers. A strange folded note lies near a bench.',
    image: '/images/central-park.png',
    exits: { back: 'st katherines dock' },
    item: 'Folded Note'
  },
  'glitch realm': {
    name: 'Glitch Realm',
    description: 'The sky pulses in hexagonal patterns. The ground is unstable. Everything flickers.',
    image: '/images/glitch-realm.png',
    exits: {}
  },
  'pollys interrogation bay': {
    name: 'Polly’s Interrogation Bay',
    description: 'A dim room with one harsh light, a table, and a steaming kettle. Polly is here, watching.',
    image: '/images/pollys-interrogation-bay.png',
    exits: {}
  },
  'library of the nine': {
    name: 'Library of the Nine',
    description: 'An immense archive spanning millennia of memory across multiverses. You feel very small.',
    image: '/images/library-of-the-nine.png',
    exits: {}
  },
  'rhiannons chamber': {
    name: "Rhiannon's Chamber",
    description: 'The chamber is silent. A golden mirror glows faintly in the light that leaks through ancient stone.',
    image: '/images/rhiannons-chamber.png',
    exits: {}
  },
  'observation deck': {
    name: 'Observation Deck (Nova)',
    description: 'Through the curved glass you see stars swirl and universes shimmer. This is where choices are watched.',
    image: '/images/observation-deck.png',
    exits: {}
  },
  'hidden aevira lab': {
    name: 'Hidden Aevira Lab',
    description: 'Ancient metal and Rabbit-tech fuse into the walls. The air is still humming.',
    image: '/images/hidden-aevira-lab.png',
    exits: {}
  },
  'arbiters core': {
    name: "The Arbiter's Core",
    description: 'Deep within the lattice system, you sense the weight of logic itself pressing against you.',
    image: '/images/arbiters-core.png',
    exits: {}
  }
};

export default rooms;
