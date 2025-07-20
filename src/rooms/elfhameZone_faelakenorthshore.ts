// elfhameZone_faelakenorthshore.ts — rooms/elfhameZone_faelakenorthshore.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: elfhameZone_faelakenorthshore

import { RoomDefinition } from '../types/RoomTypes';

const faelakenorthshore: RoomDefinition = {
  id: 'faelakenorthshore',
  zone: 'elfhameZone',
  title: 'Northern Shore of the Fae Lake',
  description: [
    'You stand on the northern shore of the Fae Lake, where the crystalline waters lap gently against a beach of pearl-white sand. From this vantage point, you can see the full majesty of the lake stretching southward, its surface reflecting the eternal twilight sky.',
    'To the north, the land rises toward the magnificent Fae Palace, its crystalline spires visible through the silver-leaved trees. A path of smooth white stones leads up from the shore, winding through gardens of impossible beauty.',
    'The air here carries the scent of water lilies and distant spices, mixed with the ozone-like smell of concentrated magic. Butterflies with wings like stained glass flutter between the flowering bushes that line the path.',
    'This feels like a place of transition - between the wild magic of the lake and the more ordered power of the palace above. The very stones seem to hum with anticipation.',
  ],
  image: 'elfhameZone_faelakenorthshore.png',
  ambientAudio: 'fae_shore_ambience.mp3',

  consoleIntro: [
    '>> NORTHERN SHORE - PALACE APPROACH - TRANSITION ZONE ACTIVE',
    '>> Location: LAKE TERMINUS - PALACE ACCESS ROUTE',
    '>> Shore stability: EXCELLENT - Pearl sand formation stable',
    '>> Palace visibility: CLEAR - Spires visible through tree line',
    '>> Path condition: MAINTAINED - White stone pathway active',
    '>> Garden barriers: LOWERED - Peaceful passage permitted',
    '>> Butterfly guardians: PRESENT - Stained glass wing patterns detected',
    '>> WARNING: Approaching palace territory - Formal protocols may apply',
    '>> Magical resonance: MODERATE - Transitioning from wild to ordered magic',
    '>> Exit protocols: MULTIPLE - Lake return or palace approach available',
  ],

  exits: {
    south: 'faelake',
    north: 'faepalacemainhall',
    up: 'faepalacemainhall',
  },

  items: [
    'pearl_sand',
    'white_stone',
    'butterfly_wing',
    'transition_crystal',
  ],

  interactables: {
    'white_stone_path': {
      description: 'A path of smooth white stones that leads up from the shore toward the palace, humming with magic.',
      actions: ['examine', 'follow', 'touch'],
      requires: [],
    },
    'pearl_beach': {
      description: 'A beach of pearl-white sand that sparkles with inner light and feels warm beneath your feet.',
      actions: ['examine', 'walk', 'gather'],
      requires: [],
    },
    'palace_gardens': {
      description: 'Gardens of impossible beauty that line the path to the palace, filled with flowering bushes and magical plants.',
      actions: ['examine', 'smell', 'admire'],
      requires: [],
    },
    'glass_butterflies': {
      description: 'Butterflies with wings like stained glass that flutter between the flowers, their wings catching the light.',
      actions: ['examine', 'watch', 'interact'],
      requires: [],
    },
  },
};

export default faelakenorthshore;
