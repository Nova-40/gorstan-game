// src/rooms/mazeZone_labyrinthbend.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const labyrinthbend: Room = {
  id: "labyrinthbend",
  zone: "mazeZone",
  title: "Labyrinth Bend",
  description: [
    "You find yourself at a sharp bend in the labyrinth, where the walls seem to shift and shimmer as if alive.",
    "The air is thick with mystery, and faint whispers echo from unseen corners.",
    "Shadows twist along the floor, and the sense of direction is easily lost here."
  ],
  image: "mazeZone_labyrinthbend.png",
  ambientAudio: "labyrinth_whispers.mp3",

  consoleIntro: [
    ">> LABYRINTH BEND - DANGEROUS TURN",
    ">> Orientation: SHIFTING",
    ">> Tip: Listen to the whispers—they may guide or mislead you."
  ],

  exits: {
    north: "mazeZone_mirrorhall",
    south: "mazeZone_secretmazeentry"
  },

  items: [
    "shimmering_stone",
    "whisper_note"
  ],

  interactables: {
    "shifting_wall": {
      description: "A section of wall that appears to move when not directly observed.",
      actions: ["examine", "touch", "mark"],
      requires: [],
    },
    "echo_corner": {
      description: "A shadowy corner where whispers seem loudest.",
      actions: ["listen", "search", "speak"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showLabyrinthBendIntro", "spawnWhispererIfNeeded"],
    onExit: ["recordLabyrinthBendExit"],
    onInteract: {
      shifting_wall: ["markWall", "observeShift"],
      echo_corner: ["listenToWhispers", "searchCorner"],
    }
  },

  flags: {
    wallMarked: false,
    whispersHeard: false,
    whispererMet: false,
  },

  quests: {
    main: "Navigate the Labyrinth Bend",
    optional: [
      "Mark the Shifting Wall",
      "Listen to the Echo Corner",
      "Meet the Maze Whisperer"
    ]
  },

  environmental: {
    lighting: "dim_and_shifting",
    temperature: "cool_and_unsettling",
    airQuality: "thick_with_mystery",
    soundscape: [
      "soft_whispers",
      "shifting_stones"
    ],
    hazards: ["disorientation", "illusory_paths"]
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
      "Shifting labyrinth walls",
      "Whispering NPC",
      "Disorientation hazards",
      "Environmental storytelling"
    ]
  },

  secrets: {
    hidden_passage: {
      description: "A secret passage revealed by marking the shifting wall and listening to the correct whisper.",
      requirements: ["mark shifting_wall", "listen echo_corner"],
      rewards: ["shortcut_access", "labyrinth_lore"],
    }
  },

  customActions: {
    "mark_shifting_wall": {
      description: "Mark the shifting wall to track its movement.",
      requirements: ["shimmering_stone"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
    "listen_to_whispers": {
      description: "Focus on the whispers to discern a hidden message.",
      requirements: [],
      effects: ["gain_hint", "unlock_secret"],
    }
  }
};

export default labyrinthbend;


