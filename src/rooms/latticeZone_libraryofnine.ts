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









const libraryofnine: Room = {
  id: "libraryofnine",
  zone: "latticeZone",
  title: "Library of Nine",
  description: [
    "You enter the Library of Nine, a mysterious annex hidden deep within the lattice. The chamber is circular, lined with nine towering shelves, each filled with tomes bound in shimmering crystal.",
    "A faint glow emanates from the floor, tracing intricate patterns that connect each shelf to a central pedestal.",
    "The air is thick with the weight of forbidden knowledge, and the silence is broken only by the occasional whisper of turning pages.",
    "You sense that each shelf represents a different domain of wisdom, and unlocking their secrets may reveal the library's true purpose."
  ],
  image: "latticeZone_libraryofnine.png",
  ambientAudio: "library_of_nine_ambience.mp3",

  consoleIntro: [
    ">> LIBRARY OF NINE - RESTRICTED ANNEX",
    ">> Access: LIMITED",
    ">> Knowledge domains: 9",
    ">> Tip: Seek the key tomes to unlock the central pedestal."
  ],

  exits: {
    south: "latticeZone_latticelibrary",
    east: "latticeZone_hiddenlibrary"
  },

  items: [
    "key_tome_1",
    "key_tome_2",
    "key_tome_3",
    "key_tome_4",
    "key_tome_5",
    "key_tome_6",
    "key_tome_7",
    "key_tome_8",
    "key_tome_9"
  ],

  interactables: {
    "central_pedestal": {
      description: "A pedestal at the center of the room, covered in runes and awaiting the placement of key tomes.",
      actions: ["examine", "place_tome", "activate"],
      requires: ["key_tome_1", "key_tome_2", "key_tome_3", "key_tome_4", "key_tome_5", "key_tome_6", "key_tome_7", "key_tome_8", "key_tome_9"],
    },
    "shelf_of_origins": {
      description: "The first shelf, filled with tomes about the beginnings of the lattice and its creators.",
      actions: ["read", "search", "decode"],
      requires: [],
    },
    "shelf_of_endings": {
      description: "The ninth shelf, containing prophecies and records of endings.",
      actions: ["read", "search", "interpret"],
      requires: [],
    }
  },

  npcs: ["ninekeeper"],

  events: {
    onEnter: ["showLibraryOfNineIntro", "activateShelves"],
    onExit: ["recordLibraryOfNineExit"],
    onInteract: {
      central_pedestal: ["placeTome", "activatePedestal"],
      shelf_of_origins: ["readOrigins", "decodeOrigins"],
      shelf_of_endings: ["readEndings", "interpretEndings"],
    }
  },

  flags: {
    allTomesPlaced: false,
    pedestalActivated: false,
    ninekeeperMet: false,
    originsDecoded: false,
    endingsInterpreted: false,
  },

  quests: {
    main: "Unlock the Secrets of the Library of Nine",
    optional: [
      "Decode the Shelf of Origins",
      "Interpret the Shelf of Endings",
      "Meet the Ninekeeper",
      "Place All Key Tomes on the Pedestal"
    ]
  },

  environmental: {
    lighting: "soft_radiant_glow",
    temperature: "cool_and_still",
    airQuality: "charged_with_knowledge",
    soundscape: [
      "whispering_pages",
      "soft_chimes",
      "rune_hum"
    ],
    hazards: ["knowledge_overload", "psychic_feedback"]
  },

  security: {
    level: "maximum",
    accessRequirements: [],
    alarmTriggers: ["unauthorized_removal"],
    surveillanceActive: true,
    surveillanceType: "ninekeeper_specter"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "hard",
    estimatedPlayTime: "15-25 minutes",
    keyFeatures: [
      "Nine domains of knowledge",
      "Key tome collection",
      "Spectral librarian NPC",
      "Central puzzle pedestal"
    ]
  },

  secrets: {
    hidden_compartment: {
      description: "A secret compartment beneath the central pedestal, revealed when all tomes are placed.",
      requirements: ["allTomesPlaced", "activatePedestal"],
      rewards: ["ancient_scroll", "unique_lore"],
    },
    ninekeeper_memory: {
      description: "A memory fragment from the Ninekeeper, unlocked by decoding both origins and endings.",
      requirements: ["decodeOrigins", "interpretEndings"],
      rewards: ["ninekeeper_story", "special_access"],
    }
  },

  customActions: {
    "activate_pedestal": {
      description: "Activate the central pedestal once all key tomes are placed.",
      requirements: ["allTomesPlaced"],
      effects: ["reveal_secret", "summon_ninekeeper"],
    },
    "decode_origins": {
      description: "Decode the ancient texts on the Shelf of Origins.",
      requirements: [],
      effects: ["gain_insight", "unlock_secret"],
    }
  }
};

export default libraryofnine;


