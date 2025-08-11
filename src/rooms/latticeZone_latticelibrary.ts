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

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const latticelibrary: Room = {
  id: "latticelibrary",
  zone: "latticeZone",
  title: "The Lattice Library",
  description: [
    "You are in the Lattice Library. It is a vast library, filled with books on every conceivable subject.",
    "Shelves stretch into the distance, their contents glowing faintly with encoded knowledge.",
    "The air is thick with the hum of information, and crystalline terminals float between the aisles.",
    "You sense that some of the books are more than they appear—some whisper, some shimmer, and some seem to rearrange themselves when you aren't looking."
  ],
  image: "latticeZone_latticelibrary.png",
  ambientAudio: "library_resonance.mp3",

  consoleIntro: [
    ">> LATTICE LIBRARY - KNOWLEDGE CORE",
    ">> Information density: EXTREME",
    ">> Access: PARTIAL",
    ">> Tip: Seek out rare tomes and hidden terminals for secrets."
  ],

  exits: {
    north: "latticeZone_hiddenlibrary",
    south: "latticeZone_latticehub"
  },

  items: [
    "encrypted_tome",
    "floating_scroll",
    "crystal_index",
    "ancient_codex"
  ],

  traps: [
    {
      id: 'knowledge_overload',
      type: 'damage',
      severity: 'major',
      description: 'Accessing the forbidden archives overloads your mind! Ancient knowledge floods your consciousness causing severe mental strain!',
      trigger: 'enter',
      effect: {
        damage: 35,
        flagsSet: ['mind_overloaded']
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'mental_shield',
      hidden: false,
    }
  ],

  interactables: {
    "crystal_terminal": {
      description: "A floating terminal that provides access to the library's digital archives.",
      actions: ["access", "search", "download"],
      requires: [],
    },
    "shifting_shelf": {
      description: "A shelf that seems to rearrange its books when not observed directly.",
      actions: ["observe", "search", "stabilize"],
      requires: [],
    },
    "whispering_book": {
      description: "A book that whispers secrets when held close.",
      actions: ["listen", "read", "decode"],
      requires: ["encrypted_tome"],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showLibraryIntro", "activateTerminals"],
    onExit: ["recordLibraryExit"],
    onInteract: {
      crystal_terminal: ["searchArchives", "downloadData"],
      shifting_shelf: ["stabilizeShelf", "findHiddenBook"],
      whispering_book: ["decodeWhisper", "revealSecret"],
    }
  },

  flags: {
    terminalAccessed: false,
    shelfStabilized: false,
    secretDecoded: false,
    librarianMet: false,
  },

  quests: {
    main: "Unlock the Secrets of the Lattice Library",
    optional: [
      "Access the Crystal Terminal",
      "Decode the Whispering Book",
      "Stabilize the Shifting Shelf",
      "Meet the Librarian Echo"
    ]
  },

  environmental: {
    lighting: "soft_glow_from_shelves",
    temperature: "cool_and_still",
    airQuality: "charged_with_knowledge",
    soundscape: [
      "pages_turning",
      "soft_whispers",
      "crystal_chimes"
    ],
    hazards: ["information_overload", "shifting_shelves"]
  },

  security: {
    level: "moderate",
    accessRequirements: [],
    alarmTriggers: ["unauthorized_download"],
    surveillanceActive: true,
    surveillanceType: "library_sentinels"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "moderate",
    estimatedPlayTime: "10-20 minutes",
    keyFeatures: [
      "Vast knowledge repository",
      "Interactive shelves and books",
      "Spectral librarian NPC",
      "Hidden secrets"
    ]
  },

  secrets: {
    hidden_archive: {
      description: "A concealed archive containing forbidden knowledge.",
      requirements: ["stabilize shifting_shelf", "decode whispering_book"],
      rewards: ["forbidden_tome", "library_lore"],
    },
    librarian_memory: {
      description: "A memory fragment from the Librarian Echo, unlocked by accessing the crystal terminal.",
      requirements: ["access crystal_terminal", "talk to librarian_echo"],
      rewards: ["echo_story", "unique_item"],
    }
  },

  customActions: {
    "decode_knowledge": {
      description: "Attempt to decode encrypted knowledge from a tome.",
      requirements: ["encrypted_tome"],
      effects: ["gain_insight", "unlock_secret"],
    },
    "stabilize_shelves": {
      description: "Stabilize the shifting shelves to reveal hidden books.",
      requirements: [],
      effects: ["find_hidden_book", "reduce_hazards"],
    }
  }
};

export default latticelibrary;


