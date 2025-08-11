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

import type { Room } from '../types/Room';

export const villagegreen: Room = {
  id: 'villagegreen',
  image: 'stantonZone_villagegreen.png',
  description: [
    'The Village Green is a serene expanse of lush grass surrounded by towering oak trees. The air is filled with the sound of chirping birds and the occasional rustle of leaves.',
    'A cobblestone path winds through the green, leading to a quaint gazebo at its center. The gazebo is adorned with hanging lanterns that sway gently in the breeze.',
    'To the north, a small pond glimmers under the sunlight, its surface dotted with lily pads. To the south, the path leads back to the heart of Stanton Harcourt.',
    'The atmosphere here is tranquil, yet there is a sense of anticipation, as if the green holds secrets waiting to be uncovered.',
  ],
  zone: 'stantonZone',
  title: 'Village Green',

  consoleIntro: [
    '>> VILLAGE GREEN - TRANQUIL AREA - DIMENSIONAL ANCHOR ESTABLISHED',
    '>> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND',
    '>> Magical resonance: LOW - Proceed with ease',
    '>> Temporal flow: STABLE - Time flows normally here',
    '>> Gazebo: ACTIVE - Potential for interaction detected',
    '>> WARNING: Interaction with the pond may trigger unknown effects',
  ],

  exits: {
    north: 'stantonharcourt',
    south: 'silentStanton',
    east: 'peacefulStanton',
    west: 'glitchStanton',
  },

  items: [
    'lily_pad',
    'oak_leaf',
    'lantern_fragment',
    'pond_stone',
  ],

  interactables: {
    'gazebo': {
      description: 'A quaint gazebo adorned with hanging lanterns.',
      actions: ['examine', 'enter', 'light'],
      requires: [],
    },
    'pond': {
      description: 'A small pond glimmering under the sunlight, dotted with lily pads.',
      actions: ['examine', 'touch', 'collect'],
      requires: [],
    },
    'oak_trees': {
      description: 'Towering oak trees surrounding the green, their leaves rustling gently.',
      actions: ['examine', 'climb', 'listen'],
      requires: [],
    },
  },
};

export default villagegreen;


