import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// latticeZone_latticespire.ts — rooms/latticeZone_latticespire.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: latticeZone_latticespire


const latticespire: Room = {
  id: "latticespire",
  zone: "latticeZone",
  title: "Lattice Spire",
  description: [
    "You stand within the Lattice Spire, a towering crystalline structure that rises above the rest of the lattice.",
    "The walls are composed of interlocking crystal facets, each pulsing with energy and shifting patterns of light.",
    "A spiral ramp winds upward, offering a dizzying view of the lattice network below.",
    "At the summit, a control node glows with immense power, humming with the resonance of the entire zone."
  ],
  image: "latticeZone_hub.png",
  ambientAudio: "spire_resonance.mp3",

  consoleIntro: [
    ">> LATTICE SPIRE - CONTROL NODE",
    ">> Elevation: MAXIMUM",
    ">> Energy flow: PEAK",
    ">> Tip: The control node may unlock new pathways or reveal hidden secrets."
  ],

  exits: {
    down: "latticeZone_lattice",
    south: "latticeZone_latticehub"
  },

  items: [
    "spire_key",
    "crystal_fragment",
    "energy_map",
    "control_rune"
  ],

  interactables: {
    "control_node": {
      description: "A glowing node at the summit, pulsing with the energy of the entire lattice.",
      actions: ["examine", "activate", "synchronize"],
      requires: ["spire_key"],
    },
    "spiral_ramp": {
      description: "A winding ramp that leads up and down the spire, offering panoramic views.",
      actions: ["ascend", "descend", "observe"],
      requires: [],
    },
    "facet_window": {
      description: "A transparent facet offering a breathtaking view of the lattice expanse.",
      actions: ["look", "analyze", "search_for_patterns"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showSpireIntro", "activateControlNode"],
    onExit: ["recordSpireExit"],
    onInteract: {
      control_node: ["activateNode", "synchronizeLattice"],
      spiral_ramp: ["ascendRamp", "descendRamp"],
      facet_window: ["analyzeView", "searchPatterns"],
    }
  },

  flags: {
    nodeActivated: false,
    guardianMet: false,
    patternsFound: false,
    spireKeyUsed: false,
  },

  quests: {
    main: "Unlock the Power of the Lattice Spire",
    optional: [
      "Activate the Control Node",
      "Meet the Spire Guardian",
      "Analyze Patterns from the Facet Window",
      "Ascend to the Summit"
    ]
  },

  environmental: {
    lighting: "brilliant_crystal_light",
    temperature: "cool_and_energized",
    airQuality: "ionized_and_clear",
    soundscape: [
      "deep_resonance",
      "crystal_hum",
      "energy_pulses"
    ],
    hazards: ["energy_surge", "vertigo"]
  },

  security: {
    level: "maximum",
    accessRequirements: ["spire_key"],
    alarmTriggers: ["unauthorized_activation"],
    surveillanceActive: true,
    surveillanceType: "spire_sensors"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "hard",
    estimatedPlayTime: "10-20 minutes",
    keyFeatures: [
      "Vertical exploration",
      "Control node activation",
      "Guardian NPC",
      "Panoramic lattice views"
    ]
  },

  secrets: {
    hidden_chamber: {
      description: "A concealed chamber accessible by synchronizing the control node.",
      requirements: ["activate control_node", "analyze facet_window"],
      rewards: ["rare_artifact", "lattice_secret"],
    },
    guardian_memory: {
      description: "A memory fragment from the Spire Guardian, unlocked by dialogue.",
      requirements: ["talk to spire_guardian", "activate control_node"],
      rewards: ["guardian_story", "unique_item"],
    }
  },

  customActions: {
    "synchronize_lattice": {
      description: "Synchronize the spire's energy with the rest of the lattice.",
      requirements: ["control_rune"],
      effects: ["stabilize_lattice", "reveal_hidden_path"],
    },
    "observe_patterns": {
      description: "Observe and analyze energy patterns from the facet window.",
      requirements: [],
      effects: ["find_secret", "gain_insight"],
    }
  }
};

export default latticespire;
