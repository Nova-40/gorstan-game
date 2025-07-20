// stantonZone_stantonharcourt.ts — rooms/stantonZone_stantonharcourt.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: stantonZone_stantonharcourt

import { Room } from '../types/RoomTypes';

// Fixed version of stantonZone_stantonharcourt.ts

export const stantonharcourt: Room = {
  image: 'stantonZone_stantonharcourt.png',
  description: [
    'You find yourself in the heart of Stanton Harcourt, a village steeped in history and mystery. The air is thick with the scent of blooming flowers and the faint aroma of ancient stone.',
    'The cobblestone streets wind through charming cottages, each one adorned with ivy and vibrant window boxes. Yet, there is an unsettling stillness here, as if the village itself is holding its breath.',
    'At the center of the village stands an ancient stone circle, its weathered surfaces etched with runes that seem to pulse faintly in the twilight.',
    'The atmosphere is both welcoming and foreboding, a place where the past and present seem to coexist in uneasy harmony.',
  ],
  zone: 'stantonZone',
  title: 'Stanton Harcourt',

  consoleIntro: [
    '>> STANTON HARCOURT - HISTORIC VILLAGE - DIMENSIONAL ANCHOR ESTABLISHED',
    '>> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND',
    '>> Magical resonance: MODERATE - Proceed with curiosity',
    '>> Temporal flow: STABLE - Time flows normally here',
    '>> Stone circle: ACTIVE - Ancient enchantments detected',
    '>> WARNING: Interaction with runes may trigger unknown effects',
  ],

  exits: {
    north: 'villagegreen',
    south: 'silentStanton',
    east: 'peacefulStanton',
    west: 'glitchStanton',
  },

  items: [
    'ancient_rune',
    'ivy_branch',
    'stone_fragment',
    'dimensional_key',
  ],

  interactables: {
    'stone_circle': {
      description: 'An ancient stone circle etched with faintly glowing runes.',
      actions: ['examine', 'touch', 'interpret'],
      requires: [],
    },
    'cobblestone_streets': {
      description: 'Winding streets lined with charming cottages and blooming flowers.',
      actions: ['examine', 'walk', 'listen'],
      requires: [],
    },
    'village_cottages': {
      description: 'Charming cottages adorned with ivy and vibrant window boxes.',
      actions: ['examine', 'enter', 'knock'],
      requires: [],
    },
  },

id: 'stantonharcourt'
};

export default stantonharcourt;
