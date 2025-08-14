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

import { NPC } from "../types/NPCTypes";

import { Room } from "../types/Room";

const echochamber: Room = {
  id: "echochamber",
  zone: "offgorstanZone",
  title: "Echo Chamber",
  description: [
    "You enter the Echo Chamber, a vast domed space where every sound is magnified and repeated endlessly.",
    "The walls are smooth and curved, designed to reflect even the faintest whisper.",
    "A strange resonance fills the air, making it difficult to distinguish your own thoughts from the echoes.",
  ],
  image: "offgorstanZone_echochamber.png",
  ambientAudio: "echo_chamber_ambience.mp3",

  consoleIntro: [
    ">> ECHO CHAMBER - RESONANCE NODE",
    ">> Acoustics: EXTREME",
    ">> Tip: Listen carefully—some echoes may reveal hidden messages.",
  ],

  exits: {
    north: "offgorstanZone_memoryvault",
    south: "offgorstanZone_voidatrium",
  },

  items: ["resonant_crystal", "echo_scroll"],

  interactables: {
    resonance_wall: {
      description:
        "A section of wall that vibrates with every sound, amplifying echoes.",
      actions: ["listen", "touch", "mark"],
      requires: [],
    },
    central_dais: {
      description:
        "A raised platform at the center, where echoes converge and intensify.",
      actions: ["stand", "speak", "observe"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showEchoChamberIntro", "activateResonance"],
    onExit: ["recordEchoChamberExit"],
    onInteract: {
      resonance_wall: ["listenToWall", "markWall"],
      central_dais: ["standOnDais", "speakOnDais"],
    },
  },

  flags: {
    wallMarked: false,
    savantMet: false,
    messageHeard: false,
  },

  quests: {
    main: "Unravel the Secrets of the Echo Chamber",
    optional: [
      "Mark the Resonance Wall",
      "Meet the Echo Savant",
      "Stand on the Central Dais",
    ],
  },

  environmental: {
    lighting: "soft_reflected_glow",
    temperature: "cool_and_resonant",
    airQuality: "vibrant_with_sound",
    soundscape: ["endless_echoes", "whispered_words"],
    hazards: ["disorientation", "auditory_overload"],
  },

  security: {
    level: "none",
    accessRequirements: [],
    alarmTriggers: [],
    surveillanceActive: false,
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "moderate",
    estimatedPlayTime: "5-10 minutes",
    keyFeatures: [
      "Echo-based puzzles",
      "Acoustic illusions",
      "Echo Savant NPC",
      "Central dais",
    ],
  },

  secrets: {
    hidden_message: {
      description:
        "A secret message revealed by standing on the dais and speaking the correct phrase.",
      requirements: ["stand central_dais", "speak phrase"],
      rewards: ["echo_lore", "resonant_hint"],
    },
  },

  customActions: {
    mark_resonance_wall: {
      description: "Mark the resonance wall to track your presence.",
      requirements: [],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
    stand_on_dais: {
      description: "Stand on the central dais to focus the echoes.",
      requirements: [],
      effects: ["gain_hint", "unlock_secret"],
    },
  },
};

export default echochamber;
