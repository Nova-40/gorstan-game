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

const mazeecho: Room = {
  id: "mazeecho",
  zone: "mazeZone",
  title: "Maze Echo",
  description: [
    "You step into a chamber where every sound is amplified and distorted, echoing endlessly through the twisting corridors.",
    "The walls shimmer with faint reflections, and your own footsteps seem to come from every direction at once.",
    "A sense of déjà vu lingers, as if you have been here before—or will be again.",
  ],
  image: "mazeZone_mazeecho.png",
  ambientAudio: "maze_echo_ambience.mp3",

  consoleIntro: [
    ">> MAZE ECHO - RESONANT CHAMBER",
    ">> Acoustics: UNSTABLE",
    ">> Tip: Listen carefully—some echoes may reveal hidden truths.",
  ],

  exits: {
    north: "mazeZone_labyrinthbend",
    south: "mazeZone_mazeroom",
  },

  items: ["echo_stone", "fragmented_note"],

  traps: [
    {
      id: "echo_displacement",
      type: "teleport",
      severity: "major",
      description:
        "The echoes become overwhelming and reality shifts around you! You find yourself transported elsewhere in the maze!",
      trigger: "enter",
      effect: {
        teleportTo: "mazeZone_misleadchamber",
      },
      triggered: false,
      disarmable: false,
      hidden: true,
    },
  ],

  interactables: {
    echo_wall: {
      description:
        "A wall that seems to repeat every sound you make, sometimes with a delay.",
      actions: ["listen", "knock", "mark"],
      requires: [],
    },
    reflection_pool: {
      description: "A shallow pool that distorts both sound and sight.",
      actions: ["observe", "drop_item", "listen"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showMazeEchoIntro", "spawnEchoWandererIfNeeded"],
    onExit: ["recordMazeEchoExit"],
    onInteract: {
      echo_wall: ["listenToEchoes", "markWall"],
      reflection_pool: ["observePool", "dropItemInPool"],
    },
  },

  flags: {
    wallMarked: false,
    echoHeard: false,
    wandererMet: false,
  },

  quests: {
    main: "Unravel the Mystery of the Maze Echo",
    optional: [
      "Mark the Echo Wall",
      "Meet the Echo Wanderer",
      "Listen to the Reflection Pool",
    ],
  },

  environmental: {
    lighting: "flickering_reflections",
    temperature: "cool_and_resonant",
    airQuality: "still_with_echoes",
    soundscape: ["echoing_steps", "distant_voices"],
    hazards: ["disorientation", "auditory_hallucinations"],
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
    estimatedPlayTime: "4-8 minutes",
    keyFeatures: [
      "Echo-based puzzles",
      "Auditory illusions",
      "Wandering NPC",
      "Reflection pool",
    ],
  },

  secrets: {
    hidden_passage: {
      description:
        "A secret passage revealed by listening to the correct echo and marking the wall.",
      requirements: ["listen echo_wall", "mark echo_wall"],
      rewards: ["maze_shortcut", "echo_lore"],
    },
  },

  customActions: {
    mark_echo_wall: {
      description: "Mark the echo wall to track your presence.",
      requirements: ["echo_stone"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
    listen_to_pool: {
      description: "Listen to the reflection pool for hidden messages.",
      requirements: [],
      effects: ["gain_hint", "unlock_secret"],
    },
  },
};
export default mazeecho;
