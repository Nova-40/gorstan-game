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

const anothermazeroom: Room = {
  id: "anothermazeroom",
  zone: "mazeZone",
  title: "Another Maze Room",
  description: [
    "You are in another room in the maze. It looks much like the others.",
    "The walls are featureless and the air is still, making it difficult to tell if you've been here before.",
    "Dim light filters in from unseen sources, casting shifting shadows on the floor.",
  ],
  image: "mazeZone_anothermazeroom.png",
  ambientAudio: "maze_ambience.mp3",

  consoleIntro: [
    ">> MAZE ROOM - STANDARD",
    ">> Orientation: UNCERTAIN",
    ">> Tip: Mark your path or you may become lost.",
  ],

  exits: {
    north: "mazeZone_mazeroom",
    south: "mazeZone_stillamazeroom",
  },

  items: ["chalk_piece", "maze_map_fragment"],

  interactables: {
    wall: {
      description:
        "A blank, cold wall. It might be useful for marking your path.",
      actions: ["examine", "mark", "knock"],
      requires: [],
    },
    floor: {
      description: "The floor is smooth stone, worn by countless footsteps.",
      actions: ["examine", "search", "listen"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showMazeRoomIntro", "checkForTraveler"],
    onExit: ["recordMazeExit"],
    onInteract: {
      wall: ["markWall", "listenForEcho"],
      floor: ["searchFloor", "listenForSteps"],
    },
  },

  flags: {
    wallMarked: false,
    travelerMet: false,
    mapFound: false,
  },

  quests: {
    main: "Find Your Way Through the Maze",
    optional: [
      "Mark the Wall",
      "Meet the Lost Traveler",
      "Find a Maze Map Fragment",
    ],
  },

  environmental: {
    lighting: "dim_and_shifted",
    temperature: "cool_and_stale",
    airQuality: "still_and_dry",
    soundscape: ["distant_echoes", "soft_footsteps"],
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
    estimatedPlayTime: "3-7 minutes",
    keyFeatures: [
      "Maze navigation",
      "Marking system",
      "Lost NPC",
      "Simple interactables",
    ],
  },

  secrets: {
    hidden_passage: {
      description: "A concealed passage revealed by marking the correct wall.",
      requirements: ["mark wall", "listen for echo"],
      rewards: ["shortcut_access", "maze_lore"],
    },
  },

  customActions: {
    mark_wall: {
      description: "Mark the wall to keep track of your path.",
      requirements: ["chalk_piece"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
  },
};

export default anothermazeroom;
