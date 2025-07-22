import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// mazeZone_forgottenchamber.ts — rooms/mazeZone_forgottenchamber.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: mazeZone_forgottenchamber


const forgottenchamber: Room = {
  id: "forgottenchamber",
  zone: "mazeZone",
  title: "Forgotten Chamber",
  description: [
    "You have found a forgotten chamber in the maze. It is dusty and filled with cobwebs.",
    "Ancient stone walls are covered in faded markings, and the air is thick with the scent of neglect.",
    "A faint draft hints at hidden passages, and the silence is broken only by the occasional drip of water."
  ],
  image: "mazeZone_forgottenchamber.png",
  ambientAudio: "forgotten_chamber_ambience.mp3",

  consoleIntro: [
    ">> FORGOTTEN CHAMBER - SECRET ROOM",
    ">> Status: ABANDONED",
    ">> Hazards: LOW VISIBILITY, DUST",
    ">> Tip: Search carefully—secrets may be hidden in the dust."
  ],

  exits: {
    east: "mazeZone_mazehub"
  },

  items: [
    "ancient_coin",
    "dusty_scroll",
    "rusted_key"
  ],

  interactables: {
    "cobwebbed_corner": {
      description: "A shadowy corner thick with cobwebs. Something glints beneath the webs.",
      actions: ["search", "clear", "inspect"],
      requires: [],
    },
    "stone_markings": {
      description: "Faded markings on the wall, possibly a code or map.",
      actions: ["examine", "trace", "decode"],
      requires: [],
    },
    "loose_stone": {
      description: "A stone in the floor that seems slightly out of place.",
      actions: ["lift", "inspect", "move"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showForgottenChamberIntro", "spawnShadeIfNeeded"],
    onExit: ["recordChamberExit"],
    onInteract: {
      cobwebbed_corner: ["searchCobwebs", "findCoin"],
      stone_markings: ["decodeMarkings", "revealHint"],
      loose_stone: ["moveStone", "findKey"],
    }
  },

  flags: {
    coinFound: false,
    markingsDecoded: false,
    keyFound: false,
    shadeMet: false,
  },

  quests: {
    main: "Uncover the Secrets of the Forgotten Chamber",
    optional: [
      "Decode the Stone Markings",
      "Find the Rusted Key",
      "Meet the Chamber Shade",
      "Search the Cobwebbed Corner"
    ]
  },

  environmental: {
    lighting: "dim_and_dusty",
    temperature: "cool_and_damp",
    airQuality: "stale_with_dust",
    soundscape: [
      "dripping_water",
      "soft_echoes",
      "rustling_cobwebs"
    ],
    hazards: ["low_visibility", "dust_inhalation"]
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
      "Secret chamber discovery",
      "Environmental storytelling",
      "Hidden items and clues",
      "Ghostly NPC"
    ]
  },

  secrets: {
    hidden_passage: {
      description: "A concealed passage revealed by decoding the stone markings and moving the loose stone.",
      requirements: ["decode stone_markings", "move loose_stone"],
      rewards: ["maze_shortcut", "ancient_lore"],
    }
  },

  customActions: {
    "clear_cobwebs": {
      description: "Clear away the cobwebs to reveal what is hidden beneath.",
      requirements: [],
      effects: ["find_item", "reduce_hazards"],
    },
    "decode_markings": {
      description: "Attempt to decode the faded markings on the wall.",
      requirements: [],
      effects: ["reveal_hint", "unlock_secret"],
    }
  }
};

export default forgottenchamber;
