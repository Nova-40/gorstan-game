import { NPC } from './NPCTypes';

import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// gorstanZone_torridoninn.ts — rooms/gorstanZone_torridoninn.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: gorstanZone_torridoninn


const torridoninn: Room = {
  id: "torridoninn",
  zone: "gorstanZone",
  title: "Torridon Inn",
  description: [
    "You step into the Torridon Inn, a cozy refuge for travelers and locals alike. The scent of roasting meat and fresh bread fills the air.",
    "A roaring fire crackles in the hearth, and the sound of laughter and clinking mugs echoes through the common room.",
    "Wooden beams overhead are hung with dried herbs, and a friendly innkeeper greets you from behind the bar."
  ],
  image: "gorstanZone_torridoninn.png",
  ambientAudio: "inn_ambience.mp3",

  consoleIntro: [
    ">> TORRIDON INN - REST STOP",
    ">> Hospitality: HIGH",
    ">> Local specialties: Stew, Ale, Fresh Bread",
    ">> Tip: Speak to the innkeeper for news and rumors."
  ],

  exits: {
    north: "gorstanZone_highpass",
    south: "gorstanZone_torridon",
    east: "gorstanZone_gorstanvillage",
    west: "gorstanZone_carronspire"
  },

  items: [
    "mug_of_ale",
    "fresh_stew",
    "soft_bed",
    "travelers_note"
  ],

  traps: [
    {
      id: 'loose_floorboard',
      type: 'damage',
      severity: 'minor',
      description: 'You step on a loose floorboard and it gives way! Your leg plunges through, scraping against the splintered wood!',
      trigger: 'enter',
      effect: {
        damage: 14
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'carpenter_tools',
      hidden: true,
    }
  ],

  interactables: {
    "hearth": {
      description: "A large stone fireplace with a roaring fire, perfect for warming up.",
      actions: ["sit", "warm_up", "listen_to_stories"],
      requires: [],
    },
    "innkeeper_chair": {
      description: "A sturdy wooden chair behind the bar where the innkeeper takes his rare moments of rest. It has an air of authority and connection to the wider world.",
      actions: ["sit", "examine", "press"],
      requires: [],
    },
    "bar": {
      description: "A polished wooden bar where the innkeeper serves drinks and food.",
      actions: ["order_drink", "order_food", "talk_to_innkeeper"],
      requires: [],
    },
    "guestbook": {
      description: "A leather-bound guestbook filled with signatures and notes from travelers.",
      actions: ["read", "sign", "search_for_clues"],
      requires: [],
    }
  },

  npcs: [
{
      id: "innkeeper_bram",
      name: "Innkeeper Bram",
      description: "A burly, cheerful man with a booming laugh and a knack for remembering faces.",
      dialogue: {
        greeting: "Welcome to the Torridon Inn! Warm yourself by the fire and have a drink.",
        help: "Looking for a room, a meal, or just some news? I can help with all three.",
        farewell: "Safe travels, friend. Come back anytime!",
      },
      spawnable: true,
      spawnCondition: "player_approaches_bar",
    }
  ],

  events: {
    onEnter: ["showInnIntro", "spawnGuests"],
    onExit: ["recordDeparture"],
    onInteract: {
      hearth: ["warmUp", "listenToStories"],
      bar: ["orderDrink", "hearRumor"],
      guestbook: ["readGuestbook", "findClue"],
    }
  },

  flags: {
    drinkOrdered: false,
    mealEaten: false,
    bedRented: false,
    rumorHeard: false,
  },

  quests: {
    main: "Rest and Recover at the Torridon Inn",
    optional: [
      "Order a Mug of Ale",
      "Hear a Rumor from Bram",
      "Sign the Guestbook",
      "Warm Up by the Fire"
    ]
  },

  environmental: {
    lighting: "warm_firelight",
    temperature: "cozy_and_warm",
    airQuality: "rich_with_food_and_smoke",
    soundscape: [
      "fire_crackling",
      "mugs_clinking",
      "soft_laughter",
      "bard_playing"
    ],
    hazards: ["overindulgence"]
  },

  security: {
    level: "moderate",
    accessRequirements: [],
    alarmTriggers: ["bar_fight"],
    surveillanceActive: true,
    surveillanceType: "inn_staff"
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
      "Rest and recovery",
      "NPC innkeeper",
      "Rumors and clues",
      "Comfortable environment"
    ]
  },

  secrets: {
    hidden_cellar: {
      description: "A secret cellar beneath the inn, accessible via a hidden latch behind the bar.",
      requirements: ["talk_to_innkeeper_bram", "search_bar"],
      rewards: ["rare_wine", "hidden_lore"],
    },
    guestbook_secret: {
      description: "A cryptic note left by a previous guest, hinting at a hidden quest.",
      requirements: ["read guestbook", "find travelers_note"],
      rewards: ["quest_hook", "unique_item"],
    }
  },

  customActions: {
    "rent_bed": {
      description: "Rent a bed for the night to restore health and energy.",
      requirements: ["soft_bed"],
      effects: ["restore_health", "advance_time"],
    },
    "perform_song": {
      description: "Perform a song for the inn's guests.",
      requirements: [],
      effects: ["earn_tips", "improve_mood"],
    }
  }
};

export default torridoninn;
