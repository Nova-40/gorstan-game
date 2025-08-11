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


