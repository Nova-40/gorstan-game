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

const mazehub: Room = {
  id: "mazehub",
  zone: "mazeZone",
  title: "Maze Hub",
  description: [
    "You stand at the heart of the maze—a central chamber from which many passages branch out.",
    "The walls here are marked with faded symbols, and the floor is worn smooth by countless footsteps.",
    "A faint breeze stirs the air, carrying distant echoes from the maze's winding corridors.",
  ],
  image: "mazeZone_mazehub.png",
  ambientAudio: "maze_hub_ambience.mp3",

  consoleIntro: [
    ">> MAZE HUB - CENTRAL NODE",
    ">> Orientation: MULTIPLE PATHS",
    ">> Tip: Remember your route—every path leads somewhere, but not all lead out.",
  ],

  exits: {
    north: "mazeZone_forgottenchamber",
    south: "mazeZone_mazeroom",
    east: "mazeZone_labyrinthbend",
    west: "mazeZone_anothermazeroom",
  },

  items: ["hub_map_fragment", "worn_compass", "old_lantern"],

  interactables: {
    central_marker: {
      description:
        "A stone marker at the center of the hub, inscribed with cryptic runes.",
      actions: ["examine", "trace", "decode"],
      requires: [],
    },
    directional_signs: {
      description:
        "A set of signs pointing in various directions, though some are missing or faded.",
      actions: ["read", "adjust", "replace"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showMazeHubIntro", "spawnCartographerIfNeeded"],
    onExit: ["recordMazeHubExit"],
    onInteract: {
      central_marker: ["decodeMarker", "traceRunes"],
      directional_signs: ["readSigns", "adjustSigns"],
    },
  },

  flags: {
    markerDecoded: false,
    cartographerMet: false,
    mapTraded: false,
  },

  quests: {
    main: "Navigate the Maze from the Hub",
    optional: [
      "Decode the Central Marker",
      "Trade with the Maze Cartographer",
      "Adjust the Directional Signs",
    ],
  },

  environmental: {
    lighting: "soft_diffuse_light",
    temperature: "cool_and_stable",
    airQuality: "slightly_dusty",
    soundscape: ["distant_footsteps", "soft_echoes"],
    hazards: ["disorientation"],
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
      "Maze navigation hub",
      "NPC cartographer",
      "Multiple exits",
      "Central puzzle marker",
    ],
  },

  secrets: {
    hidden_cache: {
      description:
        "A hidden cache beneath the central marker, revealed by decoding the runes.",
      requirements: ["decode central_marker"],
      rewards: ["rare_map_fragment", "maze_lore"],
    },
  },

  customActions: {
    trace_marker: {
      description:
        "Trace the runes on the central marker to reveal hidden paths.",
      requirements: [],
      effects: ["reveal_hint", "unlock_secret"],
    },
    adjust_signs: {
      description: "Adjust the directional signs to help future explorers.",
      requirements: [],
      effects: ["improve_navigation", "gain_trust"],
    },
  },
};

export default mazehub;
