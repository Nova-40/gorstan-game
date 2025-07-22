import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// stantonZone_villagegreen.ts — rooms/stantonZone_villagegreen.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: stantonZone_villagegreen


export const villagegreen: Room = {
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

  id: 'villagegreen',
};

export default villagegreen;
