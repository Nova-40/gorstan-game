// mazeZone_secrettunnel.ts — rooms/mazeZone_secrettunnel.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: mazeZone_secrettunnel

import { Room } from '../types/RoomTypes';

const secrettunnel: Room = {
  id: "secrettunnel",
  zone: "mazeZone",
  title: "Secret Tunnel",
  description: [
    "You step into a narrow tunnel that seems to stretch endlessly.",
    "The walls are damp and covered in glowing moss, casting an eerie green light.",
    "The air is thick and humid, and every sound seems to echo for far too long."
  ],
  image: "mazeZone_secrettunnel.png",
  ambientAudio: "secret_tunnel_ambience.mp3",

  consoleIntro: [
    ">> SECRET TUNNEL - HIDDEN PASSAGE",
    ">> Visibility: LOW",
    ">> Hazards: SLIPPERY FLOOR",
    ">> Tip: Watch your step and look for clues in the moss."
  ],

  exits: {
    west: "mazeZone_secretmazeentry",
    east: "mazeZone_pollysbay"
  },

  items: [
    "glowing_moss",
    "damp_note",
    "rusted_coin"
  ],

  interactables: {
    "moss_patch": {
      description: "A patch of glowing moss, brighter than the rest.",
      actions: ["examine", "collect", "search"],
      requires: [],
    },
    "slippery_floor": {
      description: "The floor here is slick with moisture, making footing treacherous.",
      actions: ["examine", "steady", "clean"],
      requires: [],
    },
    "hidden_crack": {
      description: "A narrow crack in the wall, just wide enough to peer through.",
      actions: ["peer", "listen", "insert_item"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showSecretTunnelIntro", "checkForShadow"],
    onExit: ["recordTunnelExit"],
    onInteract: {
      moss_patch: ["collectMoss", "searchPatch"],
      slippery_floor: ["steadyStep", "cleanFloor"],
      hidden_crack: ["peerThroughCrack", "listenAtCrack"],
    }
  },

  flags: {
    mossCollected: false,
    shadowMet: false,
    crackExamined: false,
  },

  quests: {
    main: "Traverse the Secret Tunnel",
    optional: [
      "Collect Glowing Moss",
      "Meet the Tunnel Shadow",
      "Peer Through the Hidden Crack"
    ]
  },

  environmental: {
    lighting: "eerie_green_glow",
    temperature: "humid_and_cool",
    airQuality: "damp_and_musty",
    soundscape: [
      "dripping_water",
      "distant_echoes"
    ],
    hazards: ["slippery_floor", "low_visibility"]
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
      "Hidden tunnel",
      "Environmental hazards",
      "Collectible moss",
      "Shadowy NPC"
    ]
  },

  secrets: {
    hidden_cache: {
      description: "A small cache behind the moss patch, revealed by searching carefully.",
      requirements: ["search moss_patch"],
      rewards: ["rare_item", "tunnel_lore"],
    }
  },

  customActions: {
    "collect_moss": {
      description: "Carefully collect a sample of the glowing moss.",
      requirements: [],
      effects: ["set_mossCollected", "gain_light_source"],
    },
    "peer_crack": {
      description: "Peer through the hidden crack to spot a secret.",
      requirements: [],
      effects: ["set_crackExamined", "reveal_hint"],
    }
  }
};

export default secrettunnel;
