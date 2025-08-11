/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';
import { Room } from '../types/Room';









const gorstanvillage: Room = {
  id: "gorstanvillage",
  zone: "gorstanZone",
  title: "Gorstan Village",
  description: [
    "You are in the village of Gorstan. It is a quaint, peaceful village, nestled in a valley. The villagers are friendly and welcoming.",
    "Stone cottages with mossy roofs line the winding paths, and the scent of fresh bread drifts from the bakery.",
    "Children play near a bubbling stream, and elders gather around a communal fire, sharing stories of old Gorstan legends."
  ],
  image: "gorstanZone_gorstanvillage.png",
  ambientAudio: "village_ambience.mp3",

  consoleIntro: [
    ">> GORSTAN VILLAGE - SAFE ZONE",
    ">> Population: STABLE",
    ">> Local economy: FLOURISHING",
    ">> Notable: Bakery, Blacksmith, Village Green",
    ">> Tip: Speak to villagers for quests and lore."
  ],

  exits: {
    north: "gorstanZone_torridoninn",
    south: "gorstanZone_gorstanhub",
    east: "gorstanZone_forgottenroad",
    west: "gorstanZone_carronspire"
  },

  items: [
    "fresh_bread",
    "village_token",
    "old_map",
    "herbal_poultice"
  ],

  interactables: {
    "bakery": {
      description: "A warm, inviting bakery with the scent of fresh bread wafting out.",
      actions: ["enter", "buy_bread", "talk_to_baker"],
      requires: [],
    },
    "village_green": {
      description: "A grassy area where villagers gather for festivals and meetings.",
      actions: ["rest", "listen", "join_gathering"],
      requires: [],
    },
    "blacksmith": {
      description: "A sturdy stone building where the village blacksmith works.",
      actions: ["enter", "commission_item", "talk_to_blacksmith"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showVillageIntro", "spawnVillagers"],
    onExit: ["recordDeparture"],
    onInteract: {
      bakery: ["buyBread", "hearGossip"],
      village_green: ["joinGathering", "listenToStories"],
      blacksmith: ["commissionItem", "learnCraft"],
    }
  },

  flags: {
    breadBought: false,
    storyHeard: false,
    itemCommissioned: false,
    elderMet: false,
  },

  quests: {
    main: "Discover the Heart of Gorstan Village",
    optional: [
      "Buy Fresh Bread",
      "Hear a Story from Elder Mira",
      "Commission an Item from the Blacksmith",
      "Join a Gathering on the Village Green"
    ]
  },

  environmental: {
    lighting: "soft_daylight",
    temperature: "mild_and_fresh",
    airQuality: "clean_with_bread_scent",
    soundscape: [
      "children_laughing",
      "stream_babbling",
      "fire_crackling",
      "distant_hammering"
    ],
    hazards: ["none"]
  },

  security: {
    level: "low",
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
      "Village life simulation",
      "NPC interactions",
      "Peaceful exploration",
      "Quest and lore opportunities"
    ]
  },

  secrets: {
    hidden_garden: {
      description: "A secret garden behind the bakery, known only to a few villagers.",
      requirements: ["talk_to_baker", "explore_bakery"],
      rewards: ["rare_herbs", "hidden_lore"],
    },
    ancient_token: {
      description: "An old token with mysterious engravings, found by the stream.",
      requirements: ["search_stream", "talk_to_children"],
      rewards: ["quest_hook", "unique_item"],
    }
  },

  customActions: {
    "share_story": {
      description: "Share a story with the villagers to gain their trust.",
      requirements: [],
      effects: ["gain_trust", "unlock_quest"],
    },
    "help_villager": {
      description: "Assist a villager with a small task.",
      requirements: [],
      effects: ["earn_reward", "improve_reputation"],
    }
  }
};

export default gorstanvillage;


