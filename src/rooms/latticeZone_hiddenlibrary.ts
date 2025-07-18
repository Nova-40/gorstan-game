import { RoomDefinition } from '../types/RoomTypes';

const hiddenlibrary: RoomDefinition = {
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
  npcs: [
    {
      id: 'librarian',
      name: 'Ancient Librarian',
      description: 'A spectral figure that guards the knowledge of the library.',
      dialogue: {
        greeting: 'Welcome to the Hidden Library. Knowledge is power.',
        help: 'Seek the wisdom of the ancients, but tread carefully.',
        farewell: 'May your journey be enlightened.',
      },
      spawnable: true,
    },
  ],
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
