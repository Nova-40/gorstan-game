import { Room } from '../types/RoomTypes';

const stillamazeroom: Room = {
  id: "stillamazeroom",
  zone: "mazeZone",
  title: "Still a Maze Room",
  description: [
    "You are in yet another room of the maze. The sameness is almost dizzying.",
    "The walls are blank and cold, and the air is heavy with silence.",
    "You wonder if you've been here before, or if this is just another trick of the maze."
  ],
  image: "mazeZone_stillamazeroom.png",
  ambientAudio: "maze_ambience.mp3",

  consoleIntro: [
    ">> MAZE ROOM - REPETITION",
    ">> Orientation: UNCERTAIN",
    ">> Tip: Look for subtle differences to find your way."
  ],

  exits: {
    north: "mazeZone_anothermazeroom",
    south: "mazeZone_mazehub"
  },

  items: [
    "chalk_piece",
    "maze_map_fragment"
  ],

  interactables: {
    "wall": {
      description: "A blank wall, indistinguishable from the others.",
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
    {
      id: "wandering_traveler",
      name: "Wandering Traveler",
      description: "A tired traveler who seems to be searching for a way out.",
      dialogue: {
        greeting: "Is this the same room, or a different one?",
        help: "If you find a way out, let me know.",
        farewell: "I'll keep searching. Good luck.",
      },
      spawnable: true,
      spawnCondition: "player_marks_wall",
    }
  ],

  events: {
    onEnter: ["showStillMazeRoomIntro", "checkForTraveler"],
    onExit: ["recordStillMazeExit"],
    onInteract: {
      wall: ["markWall", "listenForEcho"],
      floor: ["searchFloor", "listenForSteps"],
    }
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
      "Meet the Wandering Traveler",
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

export default stillamazeroom;
