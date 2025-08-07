// src/rooms/mazeZone_storagechamber.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const storagechamber: Room = {
  id: "storagechamber",
  zone: "mazeZone",
  title: "Storage Chamber",
  description: [
    "You enter an abandoned storage chamber deep within the maze. The air is stale and thick with dust, suggesting this place has been forgotten for years.",
    "Broken crates and barrels are scattered throughout the room, their contents long since looted or rotted away. Rusty shelving units lean precariously against the damp stone walls.",
    "In one corner sits a once-elegant chair, now broken and decrepit. One of its legs is cracked, the upholstery is torn and faded, and it looks like it might collapse if sat upon.",
    "Despite its deteriorated state, there's something oddly compelling about the broken chair—as if it once served a purpose far more important than mere seating."
  ],
  image: "mazeZone_storagechamber.png",
  ambientAudio: "storage_chamber_ambience.mp3",

  consoleIntro: [
    ">> STORAGE CHAMBER - ABANDONED STOREROOM",
    ">> Status: LONG ABANDONED",
    ">> Structural integrity: COMPROMISED",
    ">> Hazards: UNSTABLE FURNITURE, DUST INHALATION",
    ">> Tip: Even broken things can still have power—use caution."
  ],

  exits: {
    north: "mazeZone_mazehub",
    west: "mazeZone_windingpath"
  },

  items: [
    "broken_crate_splinter",
    "rusty_nail",
    "torn_fabric_scrap",
    "moldy_grain"
  ],

  interactables: {
    "broken_chair": {
      description: "A once-elegant chair that has seen better days. One leg is cracked, the upholstery is torn, but something about it suggests it might still be functional despite its appearance.",
      actions: ["examine", "sit", "press", "repair"],
      requires: [],
    },
    "broken_crates": {
      description: "Wooden crates that have been smashed open, their contents long since scattered or stolen.",
      actions: ["examine", "search", "move"],
      requires: [],
    },
    "rusty_shelving": {
      description: "Metal shelving units that lean dangerously against the walls, empty and corroded with age.",
      actions: ["examine", "stabilize", "search"],
      requires: [],
    },
    "storage_debris": {
      description: "Scattered remains of whatever was once stored here—rotted rope, moldy grain, broken pottery.",
      actions: ["examine", "clear", "sift"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showStorageChamberIntro", "assessDamage"],
    onExit: ["recordStorageChamberExit"],
    onInteract: {
      broken_chair: ["testStability", "activateChair"],
      broken_crates: ["searchDebris", "findUsableItems"],
      rusty_shelving: ["checkStability", "searchShelves"],
    }
  },

  flags: {
    chairTested: false,
    echoMet: false,
    debrisSearched: false,
  },

  quests: {
    main: "Investigate the Abandoned Storage Chamber",
    optional: [
      "Test the Broken Chair",
      "Search Through the Debris",
      "Meet the Storage Echo",
      "Find Usable Items"
    ]
  },

  environmental: {
    lighting: "dim_and_dusty",
    temperature: "cool_and_damp",
    airQuality: "stale_with_mold",
    soundscape: [
      "creaking_wood",
      "dripping_water",
      "settling_debris",
      "distant_echoes"
    ],
    hazards: ["structural_instability", "mold_spores", "sharp_debris"]
  },

  security: {
    level: "none",
    accessRequirements: [],
    alarmTriggers: [],
    surveillanceActive: false,
  },

  metadata: {
    created: "2025-01-28",
    lastModified: "2025-01-28",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "easy",
    estimatedPlayTime: "5-8 minutes",
    keyFeatures: [
      "Broken chair portal system",
      "Abandoned storage atmosphere",
      "Storage Echo NPC",
      "Debris exploration"
    ]
  },

  secrets: {
    hidden_cache: {
      description: "A small cache hidden beneath the broken chair, revealed by careful examination.",
      requirements: ["sit broken_chair", "examine storage_debris"],
      rewards: ["old_key", "storage_manifest"],
    }
  },

  customActions: {
    "repair_chair": {
      description: "Attempt to repair the broken chair using available materials.",
      requirements: ["broken_crate_splinter", "torn_fabric_scrap"],
      effects: ["improve_chair_stability", "unlock_better_travel"],
    },
    "organize_debris": {
      description: "Sort through the debris to find useful items.",
      requirements: [],
      effects: ["find_hidden_items", "spawn_storage_echo"],
    }
  }
};

export default storagechamber;


