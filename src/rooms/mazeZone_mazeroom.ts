import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// mazeZone_mazeroom.ts — rooms/mazeZone_mazeroom.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: mazeZone_mazeroom


const mazeroom: Room = {
  id: "mazeroom",
  zone: "mazeZone",
  title: "Maze Room",
  description: [
    "You are in a nondescript room within the maze. The walls are plain and the air is still.",
    "There are faint scuff marks on the floor, evidence of many travelers passing through.",
    "Every direction looks much the same, making it easy to lose your sense of direction."
  ],
  image: "mazeZone_mazeroom.png",
  ambientAudio: "maze_ambience.mp3",

  consoleIntro: [
    ">> MAZE ROOM - STANDARD",
    ">> Orientation: UNCERTAIN",
    ">> Tip: Mark your path or you may become lost."
  ],

  exits: {
    north: "mazeZone_mazeecho",
    south: "mazeZone_mazehub",
    east: "mazeZone_stillamazeroom",
    west: "mazeZone_anothermazeroom"
  },

  items: [
    "chalk_piece",
    "maze_map_fragment"
  ],

  interactables: {
    "wall": {
      description: "A blank wall, cold to the touch. It might be useful for marking your path.",
      actions: ["examine", "mark", "knock"],
      requires: [],
    },
    "floor": {
      description: "Smooth stone, worn by many footsteps.",
      actions: ["examine", "search", "listen"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showMazeRoomIntro", "checkForWanderer"],
    onExit: ["recordMazeRoomExit"],
    onInteract: {
      wall: ["markWall", "listenForEcho"],
      floor: ["searchFloor", "listenForSteps"],
    }
  },

  flags: {
    wallMarked: false,
    wandererMet: false,
    mapFound: false,
  },

  quests: {
    main: "Find Your Way Through the Maze",
    optional: [
      "Mark the Wall",
      "Meet the Wandering Lost",
      "Find a Maze Map Fragment"
    ]
  },

  environmental: {
    lighting: "dim_and_flat",
    temperature: "cool_and_stale",
    airQuality: "still_and_dry",
    soundscape: [
      "distant_echoes",
      "soft_footsteps"
    ],
    hazards: ["disorientation"]
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
      "Wandering NPC",
      "Simple interactables"
    ]
  },

  secrets: {
    hidden_passage: {
      description: "A hidden passage revealed by marking the correct wall and listening for echoes.",
      requirements: ["mark wall", "listen for echo"],
      rewards: ["shortcut_access", "maze_lore"],
    }
  },

  customActions: {
    "mark_wall": {
      description: "Mark the wall to keep track of your path.",
      requirements: ["chalk_piece"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    }
  }
};

export default mazeroom;
