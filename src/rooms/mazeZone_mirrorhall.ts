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

const mirrorhall: Room = {
  id: "mirrorhall",
  zone: "mazeZone",
  title: "Mirror Hall",
  description: [
    "You step into a hall of mirrors that stretches endlessly in all directions.",
    "Each reflection seems to show a slightly different version of yourself, some familiar, others unsettlingly alien.",
    "The air is cool and silent, broken only by the faint sound of your own footsteps echoing from every direction.",
  ],
  image: "mazeZone_mirrorhall.png",
  ambientAudio: "mirror_hall_ambience.mp3",

  consoleIntro: [
    ">> MIRROR HALL - REFLECTIVE PASSAGE",
    ">> Orientation: DISTORTED",
    ">> Tip: Not all reflections are what they seem. Look for the one that moves differently.",
  ],

  exits: {
    east: "mazeZone_labyrinthbend",
    west: "mazeZone_pollysbay",
    south: "mazeZone_mazeecho",
  },

  items: ["mirror_fragment", "reflection_note"],

  interactables: {
    main_mirror: {
      description:
        "A large mirror at the end of the hall, its surface rippling as if alive.",
      actions: ["examine", "touch", "step_through"],
      requires: [],
    },
    distorted_reflection: {
      description: "A reflection that doesn't quite match your movements.",
      actions: ["observe", "mimic", "question"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showMirrorHallIntro", "activateReflections"],
    onExit: ["recordMirrorHallExit"],
    onInteract: {
      main_mirror: ["touchMirror", "stepThroughMirror"],
      distorted_reflection: ["observeReflection", "mimicReflection"],
    },
  },

  flags: {
    mirrorTouched: false,
    shadeMet: false,
    reflectionMimicked: false,
  },

  quests: {
    main: "Find the True Path Through the Mirror Hall",
    optional: [
      "Mimic the Distorted Reflection",
      "Meet the Mirror Shade",
      "Step Through the Main Mirror",
    ],
  },

  environmental: {
    lighting: "shifting_reflections",
    temperature: "cool_and_silent",
    airQuality: "crisp_and_clear",
    soundscape: ["echoing_footsteps", "soft_whispers"],
    hazards: ["disorientation", "illusory_paths"],
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
      "Mirror puzzles",
      "Reflection-based clues",
      "Mysterious NPC",
      "Illusory exits",
    ],
  },

  secrets: {
    hidden_passage: {
      description:
        "A hidden passage revealed by stepping through the main mirror after mimicking the distorted reflection.",
      requirements: ["mimic distorted_reflection", "step_through main_mirror"],
      rewards: ["shortcut_access", "mirror_lore"],
    },
  },

  customActions: {
    mimic_reflection: {
      description: "Mimic the movements of the distorted reflection.",
      requirements: [],
      effects: ["set_reflectionMimicked", "reveal_hint"],
    },
    step_through_mirror: {
      description: "Step through the main mirror to discover a hidden path.",
      requirements: [],
      effects: ["set_mirrorTouched", "unlock_secret"],
    },
  },
};

export default mirrorhall;
