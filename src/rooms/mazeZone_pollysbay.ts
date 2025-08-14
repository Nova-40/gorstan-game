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

const pollysbay: Room = {
  id: "pollysbay",
  zone: "mazeZone",
  title: "Polly's Bay",
  description: [
    "You arrive at Polly's Bay, a tranquil cove within the labyrinth.",
    "The water glows faintly under the moonlight, and the air carries the scent of salt and mystery.",
    "Gentle waves lap at the shore, and the labyrinth's stone walls rise around the bay, enclosing it in quiet solitude.",
  ],
  image: "mazeZone_pollysbay.png",
  ambientAudio: "pollys_bay_ambience.mp3",

  consoleIntro: [
    ">> POLLY'S BAY - SECRET COVE",
    ">> Status: TRANQUIL",
    ">> Tip: Search the shoreline for hidden treasures.",
  ],

  exits: {
    north: "mazeZone_mirrorhall",
    south: "mazeZone_secrettunnel",
  },

  items: ["glowing_shell", "message_bottle", "smooth_pebble"],

  interactables: {
    shoreline: {
      description: "A sandy shoreline dotted with shells and pebbles.",
      actions: ["search", "collect", "listen"],
      requires: [],
    },
    moonlit_water: {
      description:
        "The water glows with an ethereal light, reflecting the moon above.",
      actions: ["observe", "wade", "fill_bottle"],
      requires: [],
    },
    hidden_cove: {
      description:
        "A shadowy alcove at the edge of the bay, partially concealed by rocks.",
      actions: ["explore", "search", "rest"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showPollysBayIntro", "activateShoreline"],
    onExit: ["recordPollysBayExit"],
    onInteract: {
      shoreline: ["searchShoreline", "collectShells"],
      moonlit_water: ["observeWater", "fillBottle"],
      hidden_cove: ["exploreCove", "restInCove"],
    },
  },

  flags: {
    shellCollected: false,
    bottleFound: false,
    pollyMet: false,
    coveExplored: false,
  },

  quests: {
    main: "Discover the Secrets of Polly's Bay",
    optional: [
      "Collect a Glowing Shell",
      "Meet Polly the Hermit",
      "Explore the Hidden Cove",
      "Fill a Bottle with Moonlit Water",
    ],
  },

  environmental: {
    lighting: "moonlit_glow",
    temperature: "cool_and_breezy",
    airQuality: "fresh_with_salt",
    soundscape: ["gentle_waves", "distant_gulls", "soft_breeze"],
    hazards: ["slippery_rocks", "deep_water"],
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
      "Tranquil bay setting",
      "Hidden cove",
      "Hermit NPC",
      "Collectible items",
    ],
  },

  secrets: {
    hidden_cache: {
      description:
        "A cache of treasures buried in the sand, revealed by searching the shoreline.",
      requirements: ["search shoreline"],
      rewards: ["rare_pearl", "bay_lore"],
    },
  },

  customActions: {
    collect_shell: {
      description: "Collect a glowing shell from the shoreline.",
      requirements: [],
      effects: ["set_shellCollected", "gain_light_source"],
    },
    explore_cove: {
      description: "Explore the hidden cove for secrets or a place to rest.",
      requirements: [],
      effects: ["set_coveExplored", "restore_energy"],
    },
  },
};

export default pollysbay;
