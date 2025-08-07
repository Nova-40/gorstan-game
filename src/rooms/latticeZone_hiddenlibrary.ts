// src/rooms/latticeZone_hiddenlibrary.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const hiddenlibrary: Room = {
  id: 'hiddenlibrary',
  zone: 'latticeZone',
  title: 'Hidden Library',
  description: [
    'A dimly lit library filled with ancient tomes and scrolls. The air is thick with the scent of old paper and ink.',
    'Shelves stretch high into the shadows, and the faint sound of whispers can be heard as if the books themselves are alive.',
    'A single desk sits in the center, illuminated by a flickering lantern.',
  ],
  image: 'latticeZone_hiddenlibrary.png',
  exits: {
    north: 'latticehub',
    south: 'latticespire',
  },
  items: ['ancienttome', 'scrollofwisdom'],
  npcs: ['librarian'],
  flags: {
    libraryExplored: false,
  },
  metadata: {
    author: 'Geoff',
    version: '1.0',
    created: '2025-07-10',
    difficulty: 'moderate',
    estimatedPlayTime: '5-10 minutes',
  },
};

export default hiddenlibrary;


