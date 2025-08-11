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
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









export const glitchStanton: Room = {
  image: 'stantonZone_glitchStanton.png',
  description: [
    'Glitch Stanton is a fractured version of the village, where reality itself seems to be unraveling.',
    'The streets flicker and shift, alternating between cobblestone paths and jagged voids.',
    'Cottages appear and disappear, their forms distorted and unstable.',
    'A strange hum fills the air, resonating with the glitches that ripple through the environment.',
    'At the center of this chaos stands a shimmering portal, its edges crackling with energy.',
  ],
  zone: 'stantonZone',
  title: 'Glitch Stanton',

  consoleIntro: [
    '>> GLITCH STANTON - FRACTURED AREA - DIMENSIONAL ANCHOR UNSTABLE',
    '>> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND',
    '>> Magical resonance: EXTREME - Proceed with caution',
    '>> Temporal flow: UNSTABLE - Time anomalies detected',
    '>> Portal: ACTIVE - Potential for interaction detected',
    '>> WARNING: Prolonged exposure to glitches may affect physical form',
  ],

  exits: {
    north: 'stantonharcourt',
    south: 'peacefulStanton',
    east: 'silentStanton',
    west: 'ascendantStanton',
  },

  items: [
    'glitch_fragment',
    'portal_shard',
    'unstable_rune',
    'dimensional_anchor',
  ],

  interactables: {
    'portal': {
      description: 'A shimmering portal crackling with unstable energy.',
      actions: ['examine', 'enter', 'stabilize'],
      requires: [],
    },
    'glitching_streets': {
      description: 'Streets flickering and shifting between cobblestone paths and voids.',
      actions: ['examine', 'walk', 'repair'],
      requires: [],
    },
    'unstable_cottages': {
      description: 'Cottages appearing and disappearing, their forms distorted.',
      actions: ['examine', 'enter', 'stabilize'],
      requires: [],
    },
  },

  id: 'glitchStanton',
};

export default glitchStanton;


