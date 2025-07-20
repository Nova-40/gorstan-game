// gorstanZone_torridoninthepast.ts — rooms/gorstanZone_torridoninthepast.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: gorstanZone_torridoninthepast

import { Room } from '../types/RoomTypes';

const torridoninthepast: Room = {
  id: "torridoninthepast",
  zone: "gorstanZone",
  title: "Torridon in the Past",
  description: [
    "You find yourself in Torridon as it once was—before the modern roads and bustling trade. The air is crisp, and the land is wild and untamed.",
    "Primitive stone huts dot the landscape, and villagers move about their daily routines, unaware of the changes the future will bring.",
    "A sense of history permeates everything, from the ancient tools to the unspoiled fields stretching toward the horizon."
  ],
  image: "gorstanZone_torridoninthepast.png",
  ambientAudio: "ancient_wind.mp3",

  consoleIntro: [
    ">> TORRIDON - HISTORICAL ECHO",
    ">> Era: PRE-SETTLEMENT",
    ">> Activity: LOW",
    ">> Notable: Primitive dwellings, untouched landscape",
    ">> Tip: Observe the past to understand the present."
  ],

  exits: {
    north: "gorstanZone_torridoninn",
    south: "gorstanZone_torridon",
    east: "gorstanZone_gorstanvillage",
    west: "gorstanZone_highpass"
  },

  items: [
    "ancient_tool",
    "primitive_artifact",
    "wild_herb",
    "old_map_fragment"
  ],

  interactables: {
    "stone_hut": {
      description: "A simple stone hut, home to a family of early settlers.",
      actions: ["enter", "observe", "search"],
      requires: [],
    },
    "fire_pit": {
      description: "A communal fire pit where villagers gather for warmth and storytelling.",
      actions: ["sit", "listen", "share_story"],
      requires: [],
    },
    "ancient_tree": {
      description: "A towering tree that has stood for centuries, witnessing the passage of time.",
      actions: ["examine", "climb", "collect_herb"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showPastIntro", "spawnVillagers"],
    onExit: ["recordDeparture"],
    onInteract: {
      stone_hut: ["searchHut", "observeFamily"],
      fire_pit: ["listenToStories", "shareStory"],
      ancient_tree: ["climbTree", "collectHerb"],
    }
  },

  flags: {
    storyHeard: false,
    artifactFound: false,
    herbCollected: false,
    elderMet: false,
  },

  quests: {
    main: "Witness the Origins of Torridon",
    optional: [
      "Hear a Story from Elder Iona",
      "Find a Primitive Artifact",
      "Collect a Wild Herb",
      "Climb the Ancient Tree"
    ]
  },

  environmental: {
    lighting: "soft_morning_light",
    temperature: "cool_and_fresh",
    airQuality: "pure_and_untouched",
    soundscape: [
      "birds_chirping",
      "crackling_fire",
      "gentle_breeze"
    ],
    hazards: ["wild_animals", "rough_terrain"]
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
    difficulty: "easy",
    estimatedPlayTime: "5-10 minutes",
    keyFeatures: [
      "Historical exploration",
      "NPC storytelling",
      "Primitive environment",
      "Collectibles and lore"
    ]
  },

  secrets: {
    hidden_cave: {
      description: "A concealed cave behind the ancient tree, containing relics of the past.",
      requirements: ["climb ancient_tree", "search area"],
      rewards: ["ancient_relic", "hidden_lore"],
    },
    ancestor_story: {
      description: "A tale of the village's founders, revealed by Elder Iona.",
      requirements: ["talk to elder_iona", "listen at fire_pit"],
      rewards: ["quest_hook", "unique_item"],
    }
  },

  customActions: {
    "share_story": {
      description: "Share a story with the villagers to gain their trust.",
      requirements: [],
      effects: ["gain_trust", "unlock_quest"],
    },
    "explore_cave": {
      description: "Venture into the hidden cave for secrets of the past.",
      requirements: ["find hidden_cave"],
      effects: ["discover_relic", "gain_lore"],
    }
  }
};

export default torridoninthepast;
