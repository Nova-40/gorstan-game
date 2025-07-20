// offgorstanZone_arbitercore.ts — rooms/offgorstanZone_arbitercore.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: offgorstanZone_arbitercore

import { Room } from '../types/RoomTypes';

const arbitercore: Room = {
  id: "arbitercore",
  zone: "offgorstanZone",
  title: "Arbiter Core",
  description: [
    "You stand within the Arbiter Core, the enigmatic heart of judgment and balance for all realities.",
    "Pulsing energy conduits arc overhead, casting shifting shadows across the obsidian floor.",
    "Glyphs of law and chaos spiral along the walls, and a central core pulses with the power to rewrite fate.",
    "The air vibrates with the tension of decisions yet to be made."
  ],
  image: "offgorstanZone_arbitercore.png",
  ambientAudio: "arbiter_core_ambience.mp3",

  consoleIntro: [
    ">> ARBITER CORE - JUDGMENT CHAMBER",
    ">> Access: RESTRICTED",
    ">> Tip: The core responds to those who seek balance between order and chaos."
  ],

  exits: {
    north: "offgorstanZone_multiversehub",
    south: "offgorstanZone_voidatrium"
  },

  items: [
    "core_fragment",
    "judgment_token",
    "balance_crystal"
  ],

  traps: [
    {
      id: 'judgment_field',
      type: 'damage',
      severity: 'fatal',
      description: 'The Arbiter Core judges you unworthy! Reality-altering energy tears through your being as the universe itself weighs your soul!',
      trigger: 'enter',
      effect: {
        damage: 90,
        flagsSet: ['judged_by_arbiter']
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'judgment_token',
      hidden: false,
    }
  ],

  interactables: {
    "central_core": {
      description: "A massive, pulsing core at the center of the chamber, radiating both order and chaos.",
      actions: ["examine", "activate", "attune"],
      requires: ["judgment_token"],
    },
    "law_glyphs": {
      description: "Glyphs representing the laws of reality, glowing with a steady blue light.",
      actions: ["study", "trace", "decode"],
      requires: [],
    },
    "chaos_glyphs": {
      description: "Glyphs representing chaos, flickering with unpredictable energy.",
      actions: ["observe", "touch", "interpret"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showArbiterCoreIntro", "activateCoreGlyphs"],
    onExit: ["recordArbiterCoreExit"],
    onInteract: {
      central_core: ["activateCore", "attuneToBalance"],
      law_glyphs: ["decodeLawGlyphs", "traceLawGlyphs"],
      chaos_glyphs: ["interpretChaosGlyphs", "touchChaosGlyphs"],
    }
  },

  flags: {
    coreActivated: false,
    arbiterMet: false,
    lawDecoded: false,
    chaosInterpreted: false,
  },

  quests: {
    main: "Restore Balance at the Arbiter Core",
    optional: [
      "Decode the Law Glyphs",
      "Interpret the Chaos Glyphs",
      "Meet the Arbiter"
    ]
  },

  environmental: {
    lighting: "pulsing_energy",
    temperature: "cool_and_electric",
    airQuality: "charged_with_tension",
    soundscape: [
      "humming_core",
      "crackling_energy",
      "echoing_glyphs"
    ],
    hazards: ["energy_surge", "fate_shift"]
  },

  security: {
    level: "restricted",
    accessRequirements: ["judgment_token"],
    alarmTriggers: ["unauthorized_activation"],
    surveillanceActive: true,
    surveillanceType: "arbiter_entity"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "extreme",
    estimatedPlayTime: "20-40 minutes",
    keyFeatures: [
      "Judgment and balance puzzles",
      "Central core activation",
      "Law and chaos glyphs",
      "Arbiter NPC"
    ]
  },

  secrets: {
    hidden_conduit: {
      description: "A secret conduit revealed by attuning to both law and chaos glyphs.",
      requirements: ["decode law_glyphs", "interpret chaos_glyphs"],
      rewards: ["balance_artifact", "arbiter_lore"],
    }
  },

  customActions: {
    "attune_core": {
      description: "Attune yourself to the Arbiter Core's balance.",
      requirements: ["judgment_token"],
      effects: ["set_coreActivated", "unlock_secret"],
    },
    "decode_law": {
      description: "Decode the law glyphs to understand the rules of reality.",
      requirements: [],
      effects: ["set_lawDecoded", "gain_insight"],
    },
    "interpret_chaos": {
      description: "Interpret the chaos glyphs to glimpse possible futures.",
      requirements: [],
      effects: ["set_chaosInterpreted", "gain_foresight"],
    }
  }
};

export default arbitercore;
