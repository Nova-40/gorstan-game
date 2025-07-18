import { Room } from '../types/RoomTypes';

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
    {
      id: "elder_mira",
      name: "Elder Mira",
      description: "The wise village elder, keeper of Gorstan's stories and traditions.",
      dialogue: {
        greeting: "Welcome, traveler. Gorstan is always open to new friends.",
        help: "If you seek knowledge or guidance, I am here to help.",
        farewell: "May your journey be safe and your heart light.",
      },
      spawnable: true,
      spawnCondition: "player_enters_village_green",
    }
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
