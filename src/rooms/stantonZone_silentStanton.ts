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









export const silentStanton: Room = {
  image: 'stantonZone_silentStanton.png',
  description: [
    'Silent Stanton is a hauntingly quiet part of the village, where the usual sounds of life seem to have been muted.',
    'The streets are empty, and the windows of the cottages are dark, as if the village has been abandoned.',
    'A thick mist hangs in the air, obscuring your vision and muffling your footsteps.',
    'At the center of this eerie silence stands a solitary bell tower, its spire barely visible through the fog.',
    'The atmosphere is oppressive, and the silence feels almost alive, pressing down on you with an intangible weight.',
  ],
  zone: 'stantonZone',
  title: 'Silent Stanton',

  consoleIntro: [
    '>> SILENT STANTON - HAUNTINGLY QUIET AREA - DIMENSIONAL ANCHOR ESTABLISHED',
    '>> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND',
    '>> Magical resonance: HIGH - Proceed with caution',
    '>> Temporal flow: UNSTABLE - Time anomalies detected',
    '>> Bell tower: ACTIVE - Potential for interaction detected',
    '>> WARNING: Prolonged exposure to silence may affect mental state',
  ],

  exits: {
    north: 'stantonharcourt',
    south: 'peacefulStanton',
    east: 'glitchStanton',
    west: 'ascendantStanton',
  },

  items: [
    'mist_shard',
    'bell_fragment',
    'cobblestone_piece',
    'ancient_scroll',
  ],

  interactables: {
    'bell_tower': {
      description: 'A solitary bell tower barely visible through the fog.',
      actions: ['examine', 'ring', 'climb'],
      requires: [],
    },
    'mist': {
      description: 'A thick mist that hangs in the air, obscuring vision and muffling sound.',
      actions: ['examine', 'walk', 'collect'],
      requires: [],
    },
    'dark_cottages': {
      description: 'Darkened cottages with empty windows, adding to the eerie silence.',
      actions: ['examine', 'enter', 'knock'],
      requires: [],
    },
  },

  id: 'silentStanton',
};

export default silentStanton;


