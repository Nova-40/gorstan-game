import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// latticeZone_latticeobservationentrance.ts — rooms/latticeZone_latticeobservationentrance.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: latticeZone_latticeobservationentrance


const latticeobservationentrance: Room = {
  id: "latticeobservationentrance",
  zone: "latticeZone",
  title: "Lattice Observation Entrance",
  description: [
    "You stand at the entrance to the Lattice Observation Deck, where crystalline corridors stretch ahead, shimmering with refracted light.",
    "The air hums with a quiet energy, and translucent panels display shifting patterns and data streams.",
    "A sense of anticipation fills the space, as if the lattice itself is aware of your presence."
  ],
  image: "offmultiverseZone_controlnexusreturned.png",
  ambientAudio: "lattice_entrance_ambience.mp3",

  consoleIntro: [
    ">> LATTICE OBSERVATION ENTRANCE - ACCESS POINT",
    ">> Observation deck status: SECURE",
    ">> Energy readings: NOMINAL",
    ">> Tip: Proceed to the deck for a panoramic view of the lattice structure."
  ],

  exits: {
    north: "latticeZone_latticeobservationdeck",
    south: "latticeZone_latticehub"
  },

  items: [
    "observation_pass",
    "crystal_badge",
    "data_tablet"
  ],

  interactables: {
    "security_panel": {
      description: "A crystalline panel with access controls for the observation deck.",
      actions: ["examine", "scan_pass", "override"],
      requires: ["observation_pass"],
    },
    "info_display": {
      description: "A floating display showing real-time data about the lattice.",
      actions: ["read", "analyze", "download"],
      requires: [],
    },
    "energy_node": {
      description: "A small node pulsing with lattice energy, powering the entrance systems.",
      actions: ["examine", "stabilize", "absorb"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showEntranceIntro", "activateDisplays"],
    onExit: ["recordExit"],
    onInteract: {
      security_panel: ["scanPass", "attemptOverride"],
      info_display: ["analyzeData", "downloadInfo"],
      energy_node: ["stabilizeNode", "absorbEnergy"],
    }
  },

  flags: {
    passScanned: false,
    attendantMet: false,
    dataDownloaded: false,
    nodeStabilized: false,
  },

  quests: {
    main: "Access the Lattice Observation Deck",
    optional: [
      "Scan Your Observation Pass",
      "Download Data from the Info Display",
      "Stabilize the Entrance Energy Node",
      "Speak with the Observation Attendant"
    ]
  },

  environmental: {
    lighting: "soft_crystalline_glow",
    temperature: "cool_and_even",
    airQuality: "ionized_and_clean",
    soundscape: [
      "soft_hum",
      "data_streams",
      "crystal_resonance"
    ],
    hazards: ["energy_fluctuations"]
  },

  security: {
    level: "high",
    accessRequirements: ["observation_pass"],
    alarmTriggers: ["unauthorized_override"],
    surveillanceActive: true,
    surveillanceType: "lattice_security"
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
      "Observation deck access",
      "Security and data systems",
      "Holographic attendant NPC",
      "Energy node interaction"
    ]
  },

  secrets: {
    hidden_access: {
      description: "A concealed access route to a maintenance corridor.",
      requirements: ["override security_panel", "analyze info_display"],
      rewards: ["maintenance_access", "hidden_lore"],
    },
    attendant_memory: {
      description: "A memory fragment from the attendant, unlocked by repeated interactions.",
      requirements: ["talk to observation_attendant", "download info_display"],
      rewards: ["attendant_story", "unique_item"],
    }
  },

  customActions: {
    "override_security": {
      description: "Attempt to override the security panel for alternate access.",
      requirements: ["data_tablet"],
      effects: ["bypass_security", "trigger_alarm"],
    },
    "analyze_energy": {
      description: "Analyze the energy node for fluctuations.",
      requirements: [],
      effects: ["stabilize_node", "gain_insight"],
    }
  }
};

export default latticeobservationentrance;
