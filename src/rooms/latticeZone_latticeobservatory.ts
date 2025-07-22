import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// latticeZone_latticeobservatory.ts — rooms/latticeZone_latticeobservatory.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: latticeZone_latticeobservatory


const latticeobservatory: Room = {
  id: "latticeobservatory",
  zone: "latticeZone",
  title: "Lattice Observatory",
  description: [
    "You enter the Lattice Observatory, a vast chamber with transparent walls offering a panoramic view of the crystalline lattice structure.",
    "Intricate observation equipment hovers in the air, tracking energy flows and shifting patterns within the lattice.",
    "Soft lights pulse in time with the resonance of the structure, and data streams scroll across floating displays.",
    "A sense of awe and discovery fills the space, as if you are witnessing the living heart of the lattice."
  ],
  image: "offmultiverseZone_observationroom.png",
  ambientAudio: "observatory_ambience.mp3",

  consoleIntro: [
    ">> LATTICE OBSERVATORY - PANORAMIC VIEW",
    ">> Observation systems: ONLINE",
    ">> Energy readings: FLUCTUATING",
    ">> Tip: Use the equipment to analyze lattice patterns and discover hidden phenomena."
  ],

  exits: {
    north: "latticeZone_latticeobservationdeck",
    south: "latticeZone_latticehub"
  },

  items: [
    "observation_log",
    "energy_lens",
    "pattern_chart",
    "crystal_sample"
  ],

  interactables: {
    "observation_scope": {
      description: "A floating scope that allows detailed analysis of the lattice structure.",
      actions: ["examine", "analyze", "adjust_focus"],
      requires: [],
    },
    "data_terminal": {
      description: "A terminal displaying real-time data and historical records of lattice phenomena.",
      actions: ["access", "download", "compare_data"],
      requires: [],
    },
    "energy_monitor": {
      description: "A device tracking energy fluctuations within the lattice.",
      actions: ["observe", "record", "stabilize"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showObservatoryIntro", "activateEquipment"],
    onExit: ["recordObservatoryExit"],
    onInteract: {
      observation_scope: ["analyzeLattice", "adjustFocus"],
      data_terminal: ["downloadData", "compareRecords", "summonCurator"],
      energy_monitor: ["recordFluctuations", "attemptStabilize"],
    }
  },

  flags: {
    dataDownloaded: false,
    focusAdjusted: false,
    energyStabilized: false,
    curatorMet: false,
  },

  quests: {
    main: "Uncover the Mysteries of the Lattice Observatory",
    optional: [
      "Analyze the Lattice with the Observation Scope",
      "Download Data from the Terminal",
      "Stabilize Energy Fluctuations",
      "Meet the Observatory Curator"
    ]
  },

  environmental: {
    lighting: "soft_pulsing_glow",
    temperature: "cool_and_stable",
    airQuality: "ionized_and_clear",
    soundscape: [
      "soft_resonance",
      "equipment_hum",
      "data_streams"
    ],
    hazards: ["energy_spikes", "data_overload"]
  },

  security: {
    level: "high",
    accessRequirements: [],
    alarmTriggers: ["unauthorized_data_download"],
    surveillanceActive: true,
    surveillanceType: "observatory_sensors"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "moderate",
    estimatedPlayTime: "10-15 minutes",
    keyFeatures: [
      "Panoramic lattice view",
      "Scientific analysis equipment",
      "Holographic curator NPC",
      "Energy and data puzzles"
    ]
  },

  secrets: {
    hidden_pattern: {
      description: "A concealed pattern in the lattice, revealed by adjusting the observation scope.",
      requirements: ["adjust_focus", "analyzeLattice"],
      rewards: ["pattern_insight", "unique_item"],
    },
    curator_memory: {
      description: "A memory fragment from the curator, unlocked by comparing historical data.",
      requirements: ["compare_data", "talk to observatory_curator"],
      rewards: ["curator_story", "special_access"],
    }
  },

  customActions: {
    "synchronize_observations": {
      description: "Synchronize all observation equipment for a comprehensive analysis.",
      requirements: ["observation_log", "energy_lens"],
      effects: ["reveal_hidden_pattern", "stabilize_energy"],
    },
    "run_simulation": {
      description: "Run a simulation of lattice energy flows.",
      requirements: ["pattern_chart"],
      effects: ["predict_fluctuations", "gain_insight"],
    }
  }
};

export default latticeobservatory;
