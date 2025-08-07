// src/rooms/elfhameZone_faepalacemainhall.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const faepalacemainhall: Room = {
  id: 'faepalacemainhall',
  zone: 'elfhameZone',
  title: 'Fae Palace Main Hall',
  description: [
    'You enter the magnificent main hall of the Fae Palace, a space that defies mortal comprehension. The ceiling soars impossibly high, lost in misty clouds that sparkle with their own inner light. Columns of living crystal twist upward, each one unique in its formation and color.',
    'The floor is a masterwork of inlaid precious stones that form intricate patterns, telling the story of the Fae realm in a language of light and color. Where you step, the stones pulse gently, as if responding to your presence.',
    'At the far end of the hall stands a dais with two magnificent thrones carved from single pieces of starlight-infused crystal. Even empty, they radiate an authority that makes you instinctively bow your head.',
    'The air is filled with the sound of distant music - not quite heard, but felt in your bones. This is the heart of Fae power, where the ancient rulers of this realm hold court and make decisions that ripple across dimensions.',
  ],
  image: 'elfhameZone_faepalacemainhall.png',
  ambientAudio: 'fae_throne_room_ambience.mp3',

  consoleIntro: [
    '>> FAE PALACE MAIN HALL - SEAT OF POWER - MAXIMUM SECURITY',
    '>> Location: PALACE HEART - THRONE ROOM AND COURT',
    '>> Architectural status: IMPOSSIBLE - Structure defies physics',
    '>> Throne presence: DUAL - Twin seats of ultimate authority',
    '>> Crystal resonance: HARMONIC - Living columns in perfect sync',
    '>> Floor matrix: RESPONSIVE - Precious stone network active',
    '>> Court sessions: VARIABLE - Fae nobility may materialize',
    '>> WARNING: Show proper respect - Ancient protocols in effect',
    '>> Musical emanations: CONTINUOUS - Realm\'s heartbeat audible',
    '>> Exit protocols: FORMAL - Proper farewells required',
  ],

  exits: {
    south: 'faelakenorthshore',
    down: 'faepalacedungeons',
    north: 'faepalacerhianonsroom',
  },

  items: [
    'crystal_shard',
    'royal_insignia',
    'starlight_fragment',
    'court_scroll',
  ],

  interactables: {
    'crystal_thrones': {
      description: 'Twin thrones carved from starlight-infused crystal, radiating authority even when empty.',
      actions: ['examine', 'approach', 'bow', 'sit', 'press'],
      requires: [],
    },
    'living_columns': {
      description: 'Columns of living crystal that twist upward, each unique in formation and color.',
      actions: ['examine', 'touch', 'listen'],
      requires: [],
    },
    'story_floor': {
      description: 'A floor of inlaid precious stones that tell the story of the Fae realm in light and color.',
      actions: ['examine', 'walk', 'read'],
      requires: [],
    },
    'dais': {
      description: 'The raised platform where the Fae thrones sit, emanating power and ancient authority.',
      actions: ['examine', 'approach', 'ascend'],
      requires: ['royal_insignia'],
    },
  },
};

export default faepalacemainhall;


