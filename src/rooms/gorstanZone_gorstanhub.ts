// src/rooms/gorstanZone_gorstanhub.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';
import { Room } from '../types/Room';









const gorstanhub: Room = {
  id: "gorstanhub",
  zone: "gorstanZone",
  title: "Gorstan Hub",
  description: [
    "You arrive at the heart of Gorstan, a bustling hub where ancient stone meets new technology. The plaza is alive with travelers, merchants, and mysterious figures from distant lands.",
    "Stalls line the square, offering everything from enchanted trinkets to steaming mugs of spiced tea. At the center stands a grand fountain, its waters shimmering with faint magical energy.",
    "Paths branch out in all directions, each promising adventure, secrets, or perhaps a way home."
  ],
  image: "gorstanZone_gorstanhub.png",
  ambientAudio: "market_square.mp3",

  consoleIntro: [
    ">> GORSTAN HUB - CENTRAL PLAZA",
    ">> Activity: HIGH",
    ">> Security: MODERATE",
    ">> Local time: DUSK",
    ">> Tip: Speak to the locals for rumors and quests."
  ],

  exits: {
    north: "gorstanZone_carronspire",
    south: "gorstanZone_gorstanvillage",
    east: "gorstanZone_torridoninn",
    west: "gorstanZone_forgottenroad"
  },

  items: [
    "market_token",
    "enchanted_trinket",
    "spiced_tea",
    "mysterious_note"
  ],

  interactables: {
    "fountain": {
      description: "A grand fountain at the center of the plaza, its waters shimmering with faint magical energy.",
      actions: ["examine", "toss_coin", "listen"],
      requires: [],
    },
    "merchant_stall": {
      description: "A colorful stall run by a friendly merchant, offering a variety of goods.",
      actions: ["browse", "buy", "chat"],
      requires: ["market_token"],
    },
    "notice_board": {
      description: "A wooden board covered in notes, job postings, and cryptic messages.",
      actions: ["read", "post", "search"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showHubIntro", "spawnCrowd"],
    onExit: ["recordDeparture"],
    onInteract: {
      fountain: ["tossCoin", "makeWish"],
      merchant_stall: ["buyItem", "hearRumor"],
      notice_board: ["readNotes", "findQuest"],
    }
  },

  flags: {
    coinTossed: false,
    rumorHeard: false,
    questFound: false,
    merchantVisited: false,
  },

  quests: {
    main: "Discover the Secrets of Gorstan Hub",
    optional: [
      "Buy an Enchanted Trinket",
      "Hear a Local Rumor",
      "Find a Quest on the Notice Board",
      "Toss a Coin into the Fountain"
    ]
  },

  environmental: {
    lighting: "warm_evening_glow",
    temperature: "cool_and_comfortable",
    airQuality: "fresh_with_spices",
    soundscape: [
      "market_chatter",
      "fountain_splash",
      "distant_music"
    ],
    hazards: ["pickpockets", "crowd_confusion"]
  },

  security: {
    level: "moderate",
    accessRequirements: [],
    alarmTriggers: ["attempt_theft"],
    surveillanceActive: true,
    surveillanceType: "town_guards"
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
      "Central hub for exploration",
      "NPC merchant interactions",
      "Multiple exits and quests",
      "Dynamic environment"
    ]
  },

  secrets: {
    hidden_passage: {
      description: "A concealed passage behind the fountain, leading to a forgotten part of Gorstan.",
      requirements: ["examine fountain", "find mysterious_note"],
      rewards: ["secret_area_access", "bonus_loot"],
    },
    merchant_secret: {
      description: "A rare item only offered to those who help the merchant.",
      requirements: ["help hub_merchant"],
      rewards: ["rare_trinket", "special_discount"],
    }
  },

  customActions: {
    "make_wish": {
      description: "Toss a coin into the fountain and make a wish.",
      requirements: ["market_token"],
      effects: ["gain_luck", "unlock_secret"],
    },
    "start_performance": {
      description: "Start a musical performance to entertain the crowd.",
      requirements: [],
      effects: ["attract_attention", "earn_tips"],
    }
  }
};

export default gorstanhub;


