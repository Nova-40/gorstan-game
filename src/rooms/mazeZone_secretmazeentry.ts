import { Room } from '../types/RoomTypes';

const secretmazeentry: Room = {
  id: "secretmazeentry",
  zone: "mazeZone",
  title: "Secret Maze Entry",
  description: [
    "You find yourself at the hidden entry to the maze, where ancient carvings on the walls hint at forgotten secrets.",
    "The air is heavy with anticipation, and the stone beneath your feet is worn by countless travelers.",
    "A faint glow from the carvings suggests there may be more to this place than meets the eye."
  ],
  image: "mazeZone_secretmazeentry.png",
  ambientAudio: "secret_entry_ambience.mp3",

  consoleIntro: [
    ">> SECRET MAZE ENTRY - HIDDEN ACCESS",
    ">> Status: UNDISCOVERED BY MOST",
    ">> Tip: Study the carvings for clues to the maze's origins."
  ],

  exits: {
    north: "mazeZone_labyrinthbend",
    east: "mazeZone_secrettunnel"
  },

  items: [
    "carved_stone_fragment",
    "ancient_token"
  ],

  interactables: {
    "ancient_carvings": {
      description: "Intricate carvings on the wall, depicting scenes of the maze's creation.",
      actions: ["examine", "trace", "decode"],
      requires: [],
    },
    "hidden_floor_panel": {
      description: "A section of floor that seems slightly raised, as if it could be moved.",
      actions: ["inspect", "move", "search"],
      requires: [],
    }
  },

  npcs: [
    {
      id: "entry_keeper",
      name: "Entry Keeper",
      description: "A silent guardian who watches over the secret entry, offering cryptic guidance.",
      dialogue: {
        greeting: "Few find this place. Fewer still understand its meaning.",
        help: "The carvings hold the story. Trace them, and you may find your way.",
        farewell: "The maze remembers all who enter.",
      },
      spawnable: true,
      spawnCondition: "player_traces_ancient_carvings",
    }
  ],

  events: {
    onEnter: ["showSecretMazeEntryIntro", "activateCarvings"],
    onExit: ["recordSecretMazeEntryExit"],
    onInteract: {
      ancient_carvings: ["decodeCarvings", "traceCarvings"],
      hidden_floor_panel: ["movePanel", "searchPanel"],
    }
  },

  flags: {
    carvingsDecoded: false,
    panelMoved: false,
    entryKeeperMet: false,
  },

  quests: {
    main: "Unlock the Secrets of the Maze Entry",
    optional: [
      "Decode the Ancient Carvings",
      "Meet the Entry Keeper",
      "Search the Hidden Floor Panel"
    ]
  },

  environmental: {
    lighting: "soft_glow_from_carvings",
    temperature: "cool_and_still",
    airQuality: "ancient_and_dusty",
    soundscape: [
      "soft_whispers",
      "stone_scraping"
    ],
    hazards: ["disorientation", "hidden_traps"]
  },

  security: {
    level: "low",
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
      "Secret maze entry",
      "Ancient carvings puzzle",
      "Guardian NPC",
      "Hidden interactables"
    ]
  },

  secrets: {
    hidden_compartment: {
      description: "A secret compartment beneath the floor panel, revealed by moving it.",
      requirements: ["move hidden_floor_panel"],
      rewards: ["rare_token", "maze_entry_lore"],
    }
  },

  customActions: {
    "trace_carvings": {
      description: "Trace the ancient carvings to reveal hidden patterns.",
      requirements: [],
      effects: ["set_carvingsDecoded", "reveal_hint"],
    },
    "move_panel": {
      description: "Move the hidden floor panel to search for secrets.",
      requirements: [],
      effects: ["set_panelMoved", "unlock_secret"],
    }
  }
};
export default secretmazeentry;