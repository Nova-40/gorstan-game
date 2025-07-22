import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// stantonZone_ascendantStanton.ts — rooms/stantonZone_ascendantStanton.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: stantonZone_ascendantStanton


export const ascendantStanton: Room = {
  image: 'stantonZone_ascendantStanton.png',
  description: [
    'Ascendant Stanton is a radiant and ethereal version of the village, where the mundane has been transformed into the extraordinary.',
    'The streets are paved with shimmering gold, and the cottages glow with a soft, otherworldly light.',
    'Above, the sky is a kaleidoscope of colors, shifting and swirling in mesmerizing patterns.',
    'At the center of this celestial beauty stands a towering obelisk, its surface inscribed with glowing runes.',
    'The atmosphere is uplifting, yet there is a sense of awe and reverence, as if you are in the presence of something divine.',
  ],
  zone: 'stantonZone',
  title: 'Ascendant Stanton',

  consoleIntro: [
    '>> ASCENDANT STANTON - CELESTIAL AREA - DIMENSIONAL ANCHOR ESTABLISHED',
    '>> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND',
    '>> Magical resonance: EXTREME - Proceed with reverence',
    '>> Temporal flow: STABLE - Time flows normally here',
    '>> Obelisk: ACTIVE - Potential for interaction detected',
    '>> WARNING: Prolonged exposure to celestial energy may alter perception',
  ],

  exits: {
    north: 'stantonharcourt',
    south: 'peacefulStanton',
    east: 'silentStanton',
    west: 'glitchStanton',
  },

  items: [
    'golden_shard',
    'celestial_rune',
    'light_fragment',
    'obelisk_key',
  ],

  interactables: {
    'obelisk': {
      description: 'A towering obelisk inscribed with glowing runes.',
      actions: ['examine', 'touch', 'interpret'],
      requires: [],
    },
    'golden_streets': {
      description: 'Streets paved with shimmering gold, radiating light.',
      actions: ['examine', 'walk', 'collect'],
      requires: [],
    },
    'glowing_cottages': {
      description: 'Cottages glowing with a soft, otherworldly light.',
      actions: ['examine', 'enter', 'knock'],
      requires: [],
    },
  },

  id: 'ascendantStanton',
};

export default ascendantStanton;
