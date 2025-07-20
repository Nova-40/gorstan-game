// mazeZone_misleadchamber.ts — rooms/mazeZone_misleadchamber.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: mazeZone_misleadchamber

import { Room } from '../types/RoomTypes';

const misleadchamber: Room = {
  id: "misleadchamber",
  zone: "mazeZone",
  title: "Mislead Chamber",
  description: [
    "You enter the Mislead Chamber, where the walls seem to bend and twist, distorting your sense of direction.",
    "Reflections flicker in the corners of your eyes, and footsteps echo in impossible patterns.",
    "Every exit looks identical, and the air is thick with the feeling that something is not as it seems."
  ],
  image: "mazeZone_misleadchamber.png",
  ambientAudio: "mislead_chamber_ambience.mp3",

  consoleIntro: [
    ">> MISLEAD CHAMBER - ILLUSORY ROOM",
    ">> Orientation: UNRELIABLE",
    ">> Tip: Trust nothing you see—listen for the truth in the echoes."
  ],

  exits: {
    north: "mazeZone_mazeecho",
    south: "mazeZone_mazehub",
    east: "mazeZone_labyrinthbend",
    west: "mazeZone_anothermazeroom"
  },

  items: [
    "distorted_map",
    "mirror_shard"
  ],

  interactables: {
    "mirrored_wall": {
      description: "A wall that reflects your image, but the reflection doesn't always match your movements.",
      actions: ["examine", "touch", "mark"],
      requires: [],
    },
    "echoing_floor": {
      description: "The floor here amplifies every sound, making it hard to tell where noises originate.",
      actions: ["listen", "tap", "search"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showMisleadChamberIntro", "activateIllusions"],
    onExit: ["recordMisleadChamberExit"],
    onInteract: {
      mirrored_wall: ["markWall", "observeReflection"],
      echoing_floor: ["listenToFloor", "searchFloor"],
    }
  },

  flags: {
    wallMarked: false,
    illusionistMet: false,
    mapFound: false,
  },

  quests: {
    main: "Escape the Mislead Chamber",
    optional: [
      "Mark the Mirrored Wall",
      "Meet the Mislead Illusionist",
      "Find the Distorted Map"
    ]
  },

  environmental: {
    lighting: "shifting_reflections",
    temperature: "cool_and_unsettling",
    airQuality: "stale_with_echoes",
    soundscape: [
      "distorted_footsteps",
      "echoing_laughter"
    ],
    hazards: ["disorientation", "illusory_exits"]
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
      "Illusory exits",
      "Reflection puzzles",
      "Trickster NPC",
      "Echo-based clues"
    ]
  },

  secrets: {
    hidden_door: {
      description: "A concealed door revealed by marking the mirrored wall and listening for a unique echo.",
      requirements: ["mark mirrored_wall", "listen echoing_floor"],
      rewards: ["shortcut_access", "mislead_lore"],
    }
  },

  customActions: {
    "mark_mirrored_wall": {
      description: "Mark the mirrored wall to test which reflection is real.",
      requirements: ["mirror_shard"],
      effects: ["set_wallMarked", "reduce_disorientation"],
    },
    "listen_to_floor": {
      description: "Listen carefully to the floor to discern the true exit.",
      requirements: [],
      effects: ["gain_hint", "unlock_secret"],
    }
  }
};

export default misleadchamber;
