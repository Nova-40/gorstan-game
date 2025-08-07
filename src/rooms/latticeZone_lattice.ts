// src/rooms/latticeZone_lattice.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const lattice: Room = {
  id: "lattice",
  zone: "latticeZone",
  title: "The Lattice",
  description: [
    "You are in the Lattice. It is a strange, crystalline structure that seems to hum with power.",
    "The walls and floor are made of interlocking facets, glowing with shifting colors and patterns.",
    "Energy pulses through the latticework, and the air vibrates with a low, resonant tone.",
    "You sense that this place is both ancient and alive, watching and waiting."
  ],
  image: "latticeZone_lattice.png",
  ambientAudio: "lattice_resonance.mp3",

  consoleIntro: [
    ">> LATTICE CORE - ACTIVE",
    ">> Energy levels: STABLE",
    ">> Structure: INTACT",
    ">> Warning: Unauthorized manipulation may destabilize the lattice.",
    ">> Tip: Observe the patterns for clues."
  ],

  exits: {
    north: "latticeZone_latticespire",
    south: "latticeZone_latticehub"
  },

  items: [
    "crystal_shard",
    "energy_node",
    "pattern_fragment"
  ],

  interactables: {
    "energy_conduit": {
      description: "A glowing conduit pulsing with raw energy.",
      actions: ["examine", "redirect", "absorb"],
      requires: [],
    },
    "facet_panel": {
      description: "A section of the lattice that seems to respond to touch.",
      actions: ["touch", "analyze", "activate"],
      requires: ["pattern_fragment"],
    },
    "resonance_node": {
      description: "A node emitting a deep, harmonic resonance.",
      actions: ["listen", "tune", "synchronize"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showLatticeIntro", "pulseEnergy"],
    onExit: ["recordLatticeExit"],
    onInteract: {
      energy_conduit: ["redirectEnergy", "riskOverload"],
      facet_panel: ["analyzePattern", "activatePanel"],
      resonance_node: ["tuneResonance", "gainInsight"],
    }
  },

  flags: {
    energyRedirected: false,
    panelActivated: false,
    resonanceTuned: false,
    echoMet: false,
  },

  quests: {
    main: "Unlock the Secrets of the Lattice",
    optional: [
      "Activate the Facet Panel",
      "Meet the Lattice Echo",
      "Tune the Resonance Node",
      "Collect a Crystal Shard"
    ]
  },

  environmental: {
    lighting: "prismatic_glow",
    temperature: "cool_and_vibrant",
    airQuality: "charged_with_ions",
    soundscape: [
      "resonant_hum",
      "crystal_chimes",
      "energy_pulses"
    ],
    hazards: ["energy_overload", "pattern_disruption"]
  },

  security: {
    level: "high",
    accessRequirements: [],
    alarmTriggers: ["unauthorized_activation"],
    surveillanceActive: true,
    surveillanceType: "lattice_sensors"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "moderate",
    estimatedPlayTime: "8-15 minutes",
    keyFeatures: [
      "Crystalline environment",
      "Energy manipulation",
      "Pattern-based puzzles",
      "Ancient AI echo"
    ]
  },

  secrets: {
    hidden_chamber: {
      description: "A concealed chamber revealed by synchronizing the resonance node.",
      requirements: ["tune resonance_node", "activate facet_panel"],
      rewards: ["rare_crystal", "lattice_lore"],
    },
    echo_memory: {
      description: "A memory fragment from the Lattice Echo, unlocked by collecting all pattern fragments.",
      requirements: ["collect pattern_fragment", "talk to lattice_echo"],
      rewards: ["echo_story", "unique_item"],
    }
  },

  customActions: {
    "synchronize_patterns": {
      description: "Attempt to synchronize the lattice patterns for a hidden effect.",
      requirements: ["pattern_fragment"],
      effects: ["reveal_secret", "stabilize_energy"],
    },
    "absorb_energy": {
      description: "Absorb energy from the conduit to power a device.",
      requirements: ["energy_node"],
      effects: ["charge_device", "risk_overload"],
    }
  }
};

export default lattice;


