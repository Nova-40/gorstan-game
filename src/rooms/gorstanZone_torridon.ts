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

import { NPC } from "../types/NPCTypes";
import { Room } from "../types/Room";

const torridon: Room = {
  id: "torridon",
  zone: "gorstanZone",
  title: "Torridon Outskirts",
  description: [
    "You stand on the outskirts of Torridon, where rolling hills meet the edge of the wilds. The wind carries the scent of pine and distant rain.",
    "A narrow path leads toward the heart of the settlement, while another winds off into the misty highlands.",
    "Travelers and traders pass by, exchanging news and goods. The area feels both welcoming and full of untold stories.",
  ],
  image: "gorstanZone_torridon.png",
  ambientAudio: "windy_fields.mp3",

  consoleIntro: [
    ">> TORRIDON OUTSKIRTS - BORDERLAND",
    ">> Activity: MODERATE",
    ">> Weather: OVERCAST",
    ">> Tip: Speak to travelers for rumors and directions.",
  ],

  exits: {
    north: "gorstanZone_torridoninn",
    south: "gorstanZone_forgottenroad",
    east: "gorstanZone_gorstanvillage",
    west: "gorstanZone_highpass",
  },

  items: ["pine_cone", "weathered_map", "traveler_note", "wildflower"],

  interactables: {
    signpost: {
      description: "A wooden signpost pointing toward various destinations.",
      actions: ["read", "inspect", "follow_direction"],
      requires: [],
    },
    campfire: {
      description:
        "A small campfire where travelers gather to rest and share stories.",
      actions: ["sit", "listen", "share_story"],
      requires: [],
    },
    trader_cart: {
      description: "A cart loaded with goods from distant lands.",
      actions: ["browse", "trade", "chat"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showTorridonIntro", "spawnTravelers"],
    onExit: ["recordDeparture"],
    onInteract: {
      signpost: ["readSign", "chooseDirection"],
      campfire: ["listenToStories", "restAtFire"],
      trader_cart: ["tradeGoods", "hearRumor"],
    },
  },

  flags: {
    mapFound: false,
    rumorHeard: false,
    itemTraded: false,
    campfireRested: false,
  },

  quests: {
    main: "Journey Through Torridon",
    optional: [
      "Trade with the Wandering Trader",
      "Rest at the Campfire",
      "Find the Weathered Map",
      "Hear a Rumor from a Traveler",
    ],
  },

  environmental: {
    lighting: "overcast_daylight",
    temperature: "cool_and_breezy",
    airQuality: "fresh_with_pine",
    soundscape: ["wind_rustling", "distant_chatter", "crackling_fire"],
    hazards: ["slippery_paths", "sudden_showers"],
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
      "Borderland exploration",
      "Trading and rumors",
      "Dynamic weather",
      "Multiple exits",
    ],
  },

  secrets: {
    hidden_path: {
      description:
        "A secret path leading into the highlands, revealed by a careful search.",
      requirements: ["inspect signpost", "talk to wandering_trader"],
      rewards: ["shortcut_access", "unique_view"],
    },
    trader_secret: {
      description:
        "A rare item offered only to those who share a story at the campfire.",
      requirements: ["share_story", "rest at campfire"],
      rewards: ["rare_supply", "special_discount"],
    },
  },

  customActions: {
    share_story: {
      description:
        "Share a story at the campfire to gain trust and information.",
      requirements: [],
      effects: ["gain_trust", "unlock_secret"],
    },
    explore_highlands: {
      description: "Venture into the misty highlands for adventure.",
      requirements: ["weathered_map"],
      effects: ["discover_new_area", "find_treasure"],
    },
  },
};

export default torridon;
