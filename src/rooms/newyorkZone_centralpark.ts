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

const centralpark: Room = {
  id: "centralpark",
  zone: "newyorkZone",
  title: "Central Park - New York City",
  description: [
    "You emerge from the portal into the heart of Central Park, New York City. The transition from London's Thames-side dock to Manhattan's green oasis is jarring but somehow feels natural.",
    "Tall skyscrapers frame the park on all sides, their glass and steel facades a stark contrast to the ancient trees and winding paths. Joggers, dog walkers, and tourists move through the space with typical New York energy.",
    "That persistent feeling of being watched has followed you across the Atlantic - perhaps even intensified. Eyes seem to track your every movement from the shadows between trees and from behind park benches.",
    "A piece of paper on the ground catches your attention, held down by a smooth stone to prevent it from blowing away in the Manhattan breeze. Even from here, you can see a single word written on it in bold letters - your name.",
  ],
  image: "newyorkZone_centralpark.png",
  ambientAudio: "nyc_park_ambience.mp3",

  consoleIntro: [
    ">> CENTRAL PARK - MANHATTAN, NEW YORK CITY",
    ">> Location status: PUBLIC PARKLAND - High pedestrian traffic",
    ">> Portal arrival: CONFIRMED - Transpacific transit successful",
    ">> Surveillance level: ELEVATED - Multiple unknown observers detected",
    ">> Message detected: PERSONAL COMMUNICATION - Name recognition confirmed",
    ">> Security rating: MODERATE - Urban environment protocols",
    ">> Local time: EST - Standard New York timezone",
    ">> WARNING: Continued observation by unknown entities",
    ">> Note: Personalized message requires immediate attention",
    ">> Recommend: Exercise caution, investigate communication",
  ],

  exits: {
    west: "burgerjoint",
    east: "aevirawarehouse",
    south: "manhattenhub",

    portal: "stkatherinesdock",
  },

  items: [
    "personal_note",
    "message_stone",
    "park_map_nyc",
    "fallen_autumn_leaves",
    "street_musician_coin",
    "dimensional_residue",
  ],

  interactables: {
    personal_note: {
      description:
        "A folded piece of paper with your name clearly visible on the outside. The handwriting looks familiar but you can't place it.",
      actions: ["examine", "read", "pick_up", "study_handwriting"],
      requires: [],
    },
    message_stone: {
      description:
        "A smooth, dark stone that was holding down the note. It feels warm to the touch and seems to pulse with subtle energy.",
      actions: ["examine", "pick_up", "feel_warmth", "sense_energy"],
      requires: [],
    },
    watching_shadows: {
      description:
        "Dark shapes that seem to move independently between the trees and benches. The watchers from London have followed you here.",
      actions: ["observe", "try_to_spot", "acknowledge_presence", "call_out"],
      requires: [],
    },
    manhattan_skyline: {
      description:
        "The iconic New York City skyline surrounds the park, a testament to human ambition reaching toward the sky.",
      actions: ["examine", "admire", "orient_yourself", "identify_buildings"],
      requires: [],
    },
    park_benches: {
      description:
        "Typical New York park benches where people sit to rest, read, or watch the world go by. Some seem to have watchers lingering nearby.",
      actions: ["examine", "sit", "check_for_observers", "rest"],
      requires: [],
    },
    busy_pathways: {
      description:
        "Central Park's paths are filled with the constant flow of New Yorkers and tourists going about their daily routines.",
      actions: ["observe", "join_flow", "people_watch", "blend_in"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: [
      "confirmPortalArrival",
      "activateNYCWatchers",
      "revealPersonalNote",
    ],
    onExit: ["recordDestination", "updateWatcherStatus"],
    onInteract: {
      personal_note: [
        "revealFullMessage",
        "provideBurgerJointInstructions",
        "showPassword",
      ],
      message_stone: ["detectEnergySource", "establishConnection"],
      watching_shadows: [
        "confirmContinuedSurveillance",
        "acknowledgeFollowers",
      ],
    },
  },

  flags: {
    portalUsed: true,
    noteRead: false,
    passwordRevealed: false,
    watchersActive: true,
    instructionsReceived: false,
    stoneExamined: false,
  },

  quests: {
    main: "Read the Personal Message",
    optional: [
      "Investigate the Message Stone",
      "Acknowledge the Watching Entities",
      "Follow the Burger Joint Instructions",
      "Understand Why You're Being Watched",
    ],
  },

  environmental: {
    lighting: "new_york_daylight",
    temperature: "crisp_autumn_air",
    airQuality: "urban_park_freshness",
    soundscape: [
      "manhattan_traffic_distant",
      "park_visitors_chatter",
      "city_birds_calls",
      "footsteps_on_paths",
      "watchful_silence",
    ],
    hazards: ["continued_surveillance_risk", "urban_environment_challenges"],
  },

  security: {
    level: "moderate",
    accessRequirements: [],
    alarmTriggers: ["suspicious_behavior", "watcher_confrontation"],
    surveillanceActive: true,
    surveillanceType: "multidimensional_observation",
  },

  metadata: {
    created: "2025-07-09",
    lastModified: "2025-07-09",
    author: "Geoff",
    version: "2.0",
    playTested: false,
    difficulty: "easy",
    estimatedPlayTime: "5-8 minutes",
    keyFeatures: [
      "Portal arrival from London",
      "Personal message with player name",
      "Burger joint mission instructions",
      "Continued surveillance theme",
      "Manhattan urban park setting",
    ],
  },

  secrets: {
    note_author: {
      description:
        "Who wrote the personal note and how they knew you'd arrive here",
      requirements: ["study handwriting thoroughly", "examine message_stone"],
      rewards: ["author_identity_clue", "connection_understanding"],
    },
    watcher_purpose: {
      description: "Why the entities continue to follow you across dimensions",
      requirements: [
        "acknowledge watching_shadows",
        "observe pattern of surveillance",
      ],
      rewards: ["surveillance_reason", "protection_vs_threat_knowledge"],
    },
    stone_significance: {
      description:
        "The true purpose and origin of the stone holding down the note",
      requirements: ["examine stone thoroughly", "sense energy patterns"],
      rewards: ["dimensional_anchor_knowledge", "energy_source_understanding"],
    },
  },

  customActions: {
    read_full_note: {
      description:
        "Read the complete message and instructions for the burger joint",
      requirements: ["pick up personal_note"],
      effects: [
        "reveal_burger_joint_mission",
        "gain_password_aevira",
        "understand_next_step",
      ],
    },
    acknowledge_watchers: {
      description:
        "Directly acknowledge the entities that have followed you to New York",
      requirements: ["observe watching_shadows"],
      effects: [
        "establish_watcher_communication",
        "understand_surveillance_reason",
        "gain_protection_or_warning",
      ],
    },
    prepare_for_burger_joint: {
      description: "Mentally prepare for the mission at 233 Bleecker Street",
      requirements: ["read_full_note", "understand_instructions"],
      effects: ["mission_clarity", "password_memorized", "direction_confirmed"],
    },
  },
};

export default centralpark;
