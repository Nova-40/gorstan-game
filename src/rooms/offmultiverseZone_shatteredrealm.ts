import { Room } from '../types/RoomTypes';

const shatteredrealm: Room = {
  id: "shatteredrealm",
  zone: "offmultiverseZone",
  title: "Shattered Realm",
  description: [
    "You stand in the Shattered Realm, a fractured expanse where reality itself is broken into floating shards.",
    "Fragments of worlds drift in a void, connected by unstable bridges of light and memory.",
    "Gravity shifts unpredictably, and echoes of lost universes flicker at the edges of perception.",
    "The air hums with the energy of creation and destruction, and nothing feels entirely real."
  ],
  image: "offmultiverseZone_shatteredrealm.png",
  ambientAudio: "shattered_realm_ambience.mp3",

  consoleIntro: [
    ">> SHATTERED REALM - FRACTURED PLANE",
    ">> Stability: LOW",
    ">> Tip: Trust only what you can hold. The rest may vanish at any moment."
  ],

  exits: {
    north: "offmultiverseZone_voidbridge",
    east: "offmultiverseZone_fracturedbastion",
    south: "offmultiverseZone_memoryrift"
  },

  items: [
    "shard_of_reality",
    "memory_fragment",
    "unstable_compass"
  ],

  interactables: {
    "floating_bridge": {
      description: "A bridge of light and memory, flickering in and out of existence.",
      actions: ["cross", "examine", "stabilize"],
      requires: ["unstable_compass"],
    },
    "fractured_obelisk": {
      description: "An obelisk split into several pieces, each inscribed with shifting runes.",
      actions: ["study", "touch", "reassemble"],
      requires: [],
    }
  },

  npcs: [
    {
      id: "lost_wanderer",
      name: "Lost Wanderer",
      description: "A traveler from a forgotten world, searching for a way to restore what was lost.",
      dialogue: {
        greeting: "Have you seen my home? It was here, once, before the shattering.",
        help: "The bridges are unstable. Only memory can guide you safely.",
        farewell: "If you find a memory fragment, bring it to me. I may remember the way.",
      },
      spawnable: true,
      spawnCondition: "player_collects_memory_fragment",
    }
  ],

  events: {
    onEnter: ["showShatteredRealmIntro", "checkForWanderer"],
    onExit: ["recordShatteredRealmExit"],
    onInteract: {
      floating_bridge: ["crossBridge", "stabilizeBridge"],
      fractured_obelisk: ["studyObelisk", "reassembleObelisk"],
    }
  },

  flags: {
    bridgeStabilized: false,
    wandererMet: false,
    obeliskReassembled: false,
  },

  quests: {
    main: "Navigate the Shattered Realm",
    optional: [
      "Stabilize the Floating Bridge",
      "Meet the Lost Wanderer",
      "Reassemble the Fractured Obelisk"
    ]
  },

  environmental: {
    lighting: "fractured_glow",
    temperature: "variable_and_unstable",
    airQuality: "charged_with_energy",
    soundscape: [
      "crackling_void",
      "echoes_of_worlds"
    ],
    hazards: ["falling", "reality_shift"]
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
    difficulty: "hard",
    estimatedPlayTime: "15-30 minutes",
    keyFeatures: [
      "Fractured reality navigation",
      "Unstable bridges",
      "Lost Wanderer NPC",
      "Obelisk puzzle"
    ]
  },

  secrets: {
    hidden_path: {
      description: "A hidden path revealed by stabilizing the floating bridge and reassembling the obelisk.",
      requirements: ["stabilize floating_bridge", "reassemble fractured_obelisk"],
      rewards: ["shortcut_access", "shattered_lore"],
    }
  },

  customActions: {
    "stabilize_bridge": {
      description: "Stabilize the floating bridge using the unstable compass.",
      requirements: ["unstable_compass"],
      effects: ["set_bridgeStabilized", "unlock_secret"],
    },
    "reassemble_obelisk": {
      description: "Reassemble the fractured obelisk to reveal hidden knowledge.",
      requirements: [],
      effects: ["set_obeliskReassembled", "gain_insight"],
    }
  }
};

export default shatteredrealm;
