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

import { Room } from "../types/Room";

const findlaterscornercoffeeshop: Room = {
  id: "findlaterscornercoffeeshop",
  zone: "londonZone",
  title: "Findlater's Corner Coffee Shop",
  description: [
    "You step into a cozy corner coffee shop that feels eerily familiar, though you can't quite place when you've been here before. The warm aroma of freshly ground coffee beans fills the air, mixing with the scent of pastries and the gentle hum of conversation.",
    "Mismatched vintage furniture creates intimate seating areas throughout the space. Exposed brick walls are adorned with local artwork and old photographs of the neighborhood. Soft jazz plays in the background, adding to the welcoming atmosphere.",
    "Behind the polished wooden counter, a friendly barista with bright eyes and a warm smile has already begun preparing a coffee before you even approached. She works with practiced efficiency, as if she knew exactly what you wanted.",
    "The morning light streams through large windows, casting golden patterns across the worn wooden floors. This place has the comfortable feel of somewhere you've spent countless hours, even though the specific memories remain frustratingly just out of reach.",
  ],
  image: "londonZone_findlaters.png",
  ambientAudio: "cozy_cafe_ambience.mp3",

  consoleIntro: [
    ">> FINDLATER'S CORNER COFFEE SHOP - NEIGHBORHOOD ESTABLISHMENT",
    ">> Location: CORNER OF FINDLATER STREET AND MEMORY LANE",
    ">> Establishment status: OPERATING - Daily service 6:00 AM to 10:00 PM",
    ">> Customer recognition: RETURNING PATRON DETECTED",
    ">> Barista service: PROACTIVE - Order preparation initiated",
    ">> Atmosphere: NOSTALGIC - Familiar environment confirmed",
    ">> WARNING: Memory inconsistencies detected in customer profile",
    ">> Recommend: Enjoy beverage and allow natural memory retrieval",
    ">> Local network: CONNECTED - Neighborhood hub active",
    ">> Today's special: DIMENSIONAL BLEND - House specialty",
  ],

  exits: {
    north: "cafeoffice",
    south: "dalesapartment",
    east: "trentpark",
  },

  items: [
    "coffee_shop_menu",
    "local_newspaper",
    "receipt_with_date",
    "loyalty_card",
    "business_card_collection",
    "forgotten_notebook",
  ],

  interactables: {
    barista: {
      description:
        "A cheerful barista with knowing eyes who seems to recognize you. She's already preparing your usual order with practiced precision.",
      actions: ["talk", "order_coffee", "ask_about_visits"],
      requires: [],
    },
    coffee_counter: {
      description:
        "A beautifully maintained wooden counter with an impressive espresso machine and display of pastries.",
      actions: ["examine", "lean_on", "order"],
      requires: [],
    },
    vintage_furniture: {
      description:
        "Eclectic mix of comfortable chairs and small tables, each piece with its own character and story.",
      actions: ["examine", "sit", "choose_favorite_spot"],
      requires: [],
    },
    wall_photos: {
      description:
        "Black and white photographs of the neighborhood through the decades. Some faces look vaguely familiar.",
      actions: ["examine", "study_faces", "read_captions"],
      requires: [],
    },
    corner_booth: {
      description:
        'A particularly cozy booth in the corner that feels like it might have been "your spot" at some point.',
      actions: ["examine", "sit", "reminisce"],
      requires: [],
    },
    coffee_machine: {
      description:
        "A professional espresso machine that hisses and steams as the barista works her magic.",
      actions: ["examine", "listen", "watch_preparation"],
      requires: [],
    },
  },

  npcs: ["friendly_barista"],

  events: {
    onEnter: [
      "triggerFamiliarity",
      "activateBarista",
      "checkTimeOfDay",
      "offerCoffeeAutomatically",
    ],
    onExit: ["recordVisit", "updateMemoryFragments", "resetCoffeeOfferFlag"],
    onInteract: {
      barista: ["revealPastVisits", "offerUsualOrder", "shareMemories"],
      corner_booth: ["triggerMemoryFlash", "feelNostalgia"],
      wall_photos: ["recognizeFaces", "recallNeighborhood"],
      coffee_machine: ["appreciateFamiliarity", "inhaleAromas"],
    },
  },

  flags: {
    familiarPlace: true,
    baristaRecognized: false,
    usualOrderOffered: false,
    memoryTriggered: false,
    cornerBoothVisited: false,
    regularRoutineRemembered: false,
    freeCoffeeOffered: false,
    coffeeForPykeCalled: false,
  },

  quests: {
    main: "Rediscover Your Connection to This Place",
    optional: [
      "Talk with the Barista About Past Visits",
      "Examine the Neighborhood Photos",
      "Sit in the Corner Booth",
      "Order Your Usual Coffee",
      "Connect with Other Regular Customers",
    ],
  },

  environmental: {
    lighting: "warm_morning_sunlight",
    temperature: "cozy_and_inviting",
    airQuality: "coffee_scented_perfection",
    soundscape: [
      "gentle_coffee_shop_chatter",
      "espresso_machine_sounds",
      "soft_jazz_background",
      "newspaper_rustling",
      "cups_clinking",
    ],
    hazards: [],
  },

  security: {
    level: "none",
    accessRequirements: [],
    alarmTriggers: [],
    surveillanceActive: false,
  },

  metadata: {
    created: "2025-07-09",
    lastModified: "2025-07-09",
    author: "Geoff",
    version: "2.0",
    playTested: false,
    difficulty: "easy",
    estimatedPlayTime: "8-12 minutes",
    keyFeatures: [
      "Familiar but forgotten location",
      "Proactive barista service",
      "Memory recovery opportunities",
      "Neighborhood connection hub",
      "Nostalgic atmosphere",
    ],
  },

  secrets: {
    forgotten_routine: {
      description:
        "Your old regular routine and what brought you here every week",
      requirements: [
        "talk extensively with barista",
        "sit in corner_booth",
        "examine forgotten_notebook",
      ],
      rewards: ["memory_restoration", "understanding_of_past_life"],
    },
    neighborhood_connections: {
      description: "The web of relationships you had in this community",
      requirements: [
        "study wall_photos",
        "talk with regular_customer",
        "examine business_cards",
      ],
      rewards: ["community_knowledge", "local_network_access"],
    },
    the_usual_order: {
      description:
        "The specific coffee order that defines your connection to this place",
      requirements: [
        "accept barista offer",
        "taste the coffee",
        "remember preferences",
      ],
      rewards: ["comfort_item", "identity_anchor"],
    },
  },

  customActions: {
    order_usual: {
      description: "Accept the barista's offer to make your usual coffee",
      requirements: ["talk with barista"],
      effects: [
        "receive_perfect_coffee",
        "trigger_strong_memories",
        "feel_belonging",
      ],
    },
    accept_free_coffee: {
      description: "Accept the barista's complimentary coffee offer",
      requirements: [],
      effects: ["receive_coffee", "feel_welcomed", "barista_kindness"],
    },
    sit_in_usual_spot: {
      description: "Claim the corner booth that feels like it was always yours",
      requirements: ["examine corner_booth"],
      effects: [
        "access_stored_memories",
        "feel_deep_familiarity",
        "understand_routine",
      ],
    },
    piece_together_past: {
      description: "Use clues in the cafe to reconstruct your history here",
      requirements: [
        "examine wall_photos",
        "talk with multiple npcs",
        "find forgotten_notebook",
      ],
      effects: [
        "restore_memory_fragments",
        "understand_community_role",
        "regain_identity_piece",
      ],
    },
  },
};

export default findlaterscornercoffeeshop;
