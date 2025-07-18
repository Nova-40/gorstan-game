import { Room } from '../types/RoomTypes';

const windingpath: Room = {
  id: "windingpath",
  zone: "mazeZone",
  title: "Winding Path",
  description: [
    "You find yourself on a winding path that twists and turns unpredictably.",
    "The ground is uneven, and the air is filled with the sound of distant footsteps.",
    "Shadows flicker along the walls, and every turn looks much like the last."
  ],
  image: "mazeZone_windingpath.png",
  ambientAudio: "winding_path_ambience.mp3",

  consoleIntro: [
    ">> WINDING PATH - MAZE SEGMENT",
    ">> Orientation: UNCERTAIN",
    ">> Tip: Pay attention to subtle changes in the path."
  ],

  exits: {
    north: "mazeZone_secrettunnel",
    south: "mazeZone_labyrinthbend"
  },

  items: [
    "worn_shoe",
    "path_marker"
  ],

  interactables: {
    "uneven_ground": {
      description: "The ground here is rough and uneven, making each step uncertain.",
      actions: ["examine", "steady", "search"],
      requires: [],
    },
    "shadow_wall": {
      description: "A wall where shadows seem to move independently of any light source.",
      actions: ["observe", "touch", "mark"],
      requires: [],
    }
  },

  npcs: [
    {
      id: "wandering_guide",
      name: "Wandering Guide",
      description: "A mysterious figure who offers cryptic advice to travelers on the path.",
      dialogue: {
        greeting: "The path winds for a reason. Trust your feet, not your eyes.",
        help: "Sometimes, the shortest route is not the safest.",
        farewell: "Keep moving. The maze rewards persistence.",
      },
      spawnable: true,
      spawnCondition: "player_marks_shadow_wall",
    }
  ],

  events: {
    onEnter: ["showWindingPathIntro", "checkForGuide"],
    onExit: ["recordWindingPathExit"],
    onInteract: {
      uneven_ground: ["steadyStep", "searchGround"],
      shadow_wall: ["observeShadows", "markWall"],
    }
  },

  flags: {
    groundSearched: false,
    wallMarked: false,
    guideMet: false,
  },

  quests: {
    main: "Navigate the Winding Path",
    optional: [
      "Mark the Shadow Wall",
      "Meet the Wandering Guide",
      "Search the Uneven Ground"
    ]
  },

  environmental: {
    lighting: "flickering_shadows",
    temperature: "cool_and_drafty",
    airQuality: "musty_and_stale",
    soundscape: [
      "distant_footsteps",
      "soft_breezes"
    ],
    hazards: ["tripping", "disorientation"]
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
      "Winding maze path",
      "Environmental hazards",
      "Cryptic NPC",
      "Shadow-based clues"
    ]
  },

  secrets: {
    hidden_niche: {
      description: "A small niche in the shadow wall, revealed by marking it.",
      requirements: ["mark shadow_wall"],
      rewards: ["hidden_item", "maze_lore"],
    }
  },

  customActions: {
    "mark_shadow_wall": {
      description: "Mark the shadow wall to track your progress.",
      requirements: ["path_marker"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
    "steady_on_ground": {
      description: "Steady yourself on the uneven ground.",
      requirements: [],
      effects: ["reduce_tripping", "gain_confidence"],
    }
  }
};

export default windingpath;
