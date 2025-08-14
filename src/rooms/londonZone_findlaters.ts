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

import type { Room } from "../types/Room";

const findlaters: Room = {
  id: "findlaters",
  zone: "londonZone",
  title: "Findlater's Cafe - Special Instance",
  description: [
    "You find yourself in a version of Findlater's cafe that feels subtly different from the one you remember. The layout is familiar, but the atmosphere carries an otherworldly quality that makes your skin prickle with recognition.",
    "The same warm lighting illuminates the space, but the shadows seem deeper, more meaningful. The coffee machine hisses with the same rhythm, yet each sound feels loaded with significance you can't quite grasp.",
    "Other patrons sit at their tables, but they move with a dreamlike quality, their conversations creating a gentle murmur that sounds almost like distant whispers. Time itself seems to flow differently here.",
    "This is clearly the same cafe, but existing in a moment suspended between realities - a special instance where the ordinary rules don't quite apply and profound encounters become possible.",
  ].join("\n"),
  image: "londonZone_findlaters.png",

  consoleIntro: [
    ">> FINDLATER'S CAFE - SPECIAL DIMENSIONAL INSTANCE",
    ">> Reality layer: ALTERED - Temporal displacement active",
    ">> Patron behavior: SEMI-LUCID - Awareness levels variable",
    ">> Significance detector: MAXIMUM - Important events likely",
    ">> Time flow: NON-LINEAR - Causal relationships flexible",
    ">> Memory integration: ENHANCED - Past/present convergence possible",
    ">> WARNING: High probability of life-changing encounters",
    ">> Recommend: Remain open to unusual interactions",
    ">> Exit protocols: VARIABLE - Departure conditions uncertain",
    ">> Status: READY FOR PROFOUND NARRATIVE MOMENTS",
  ],

  exits: {
    south: "dalesapartment",
    east: "trentpark",
    north: "cafeoffice",

    dimensional_door: "crossing",
  },

  items: [
    { id: "meaningful_receipt", name: "Meaningful Receipt" },
    { id: "prophetic_newspaper", name: "Prophetic Newspaper" },
    { id: "dimensional_coffee_cup", name: "Dimensional Coffee Cup" },
    { id: "memory_triggering_photo", name: "Memory Triggering Photo" },
    { id: "fate_altering_note", name: "Fate Altering Note" },
    { id: "special_menu", name: "Special Menu" },
  ],

  interactables: {
    special_barista: {
      description:
        "The barista here has an knowing look in her eyes, as if she understands the true nature of this place and your role in larger events.",
      actions: ["talk", "ask_about_reality", "request_special_order"],
      requires: [],
    },
    significant_table: {
      description:
        "One particular table seems to pulse with importance - this is where crucial conversations happen and destinies are decided.",
      actions: ["examine", "sit", "wait_for_encounter"],
      requires: [],
    },
    dimensional_chair: {
      description:
        "A single chair in the corner that seems to exist slightly outside normal space-time. Sitting here might connect you to other realities.",
      actions: ["examine", "sit", "press"],
      requires: [],
    },
    reality_mirror: {
      description:
        "A mirror on the wall that doesn't quite reflect what you expect - sometimes showing other versions of events.",
      actions: ["examine", "look_into", "question_reflection"],
      requires: [],
    },
    temporal_menu_board: {
      description:
        "The menu board displays options that seem to shift between normal cafe items and metaphysical concepts.",
      actions: ["read", "order_from", "interpret_meanings"],
      requires: [],
    },
    whisper_corners: {
      description:
        "Certain corners of the cafe where conversations carry extra weight and secrets reveal themselves.",
      actions: ["listen", "approach", "eavesdrop_carefully"],
      requires: [],
    },
    probability_window: {
      description:
        "A window that looks out onto multiple potential futures simultaneously.",
      actions: ["look_through", "focus_on_futures", "choose_timeline"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: [
      "activateSpecialInstance",
      "heightenAwareness",
      "prepareForEncounter",
    ],
    onExit: ["recordChoices", "stabilizeReality", "updateTimeline"],
    onInteract: {
      significant_table: ["triggerImportantMeeting", "activateStoryEvent"],
      reality_mirror: ["showAlternateRealities", "questionChoices"],
      special_barista: ["receiveGuidance", "gainInsight"],
      probability_window: ["viewPossibleFutures", "influenceOutcomes"],
    },
  },

  flags: {
    specialInstance: true,
    realityAwareness: false,
    choicesMade: false,
    futuresSeen: false,
    guidanceReceived: false,
  },

  quests: {
    main: "Navigate the Crucial Encounter",
    optional: [
      "Understand the Special Nature of This Place",
      "Receive Guidance from the Oracle Barista",
      "View Possible Futures",
      "Make the Important Choice",
      "Complete the Significant Meeting",
    ],
  },

  environmental: {
    lighting: "ethereal_golden_glow",
    temperature: "perfect_comfort",
    airQuality: "charged_with_possibility",
    soundscape: [
      "meaningful_cafe_ambience",
      "reality_harmonics",
      "whispered_destinies",
      "temporal_echoes",
      "profound_silence_moments",
    ],
    hazards: ["reality_displacement_risk", "timeline_alteration_possibility"],
  },

  security: {
    level: "transcendent",
    accessRequirements: ["narrative_significance"],
    lastModified: "2025-07-09",
    author: "Geoff",
    version: "2.0",
    playTested: false,
    difficulty: "challenging",
    estimatedPlayTime: "15-30 minutes",
    keyFeatures: [
      "Special dimensional instance",
      "Crucial story encounters",
      "Reality-altering conversations",
      "Multiple timeline viewing",
      "Fate-determining choices",
    ],
  },

  secrets: {
    true_purpose: {
      description:
        "The real reason this special instance exists and your role in cosmic events",
      requirements: [
        "complete important meeting",
        "receive all guidance",
        "view multiple futures",
      ],
      rewards: ["cosmic_understanding", "reality_manipulation_knowledge"],
    },
    alternate_endings: {
      description:
        "Different possible outcomes based on choices made in this instance",
      requirements: [
        "examine probability_window thoroughly",
        "make critical decisions",
      ],
      rewards: ["timeline_branching_access", "multiple_reality_navigation"],
    },
    oracle_wisdom: {
      description:
        "Deep knowledge from the barista about the nature of reality and choice",
      requirements: ["establish deep connection with oracle_barista"],
      rewards: ["prophetic_insight", "destiny_guidance"],
    },
  },

  customActions: {
    accept_destiny: {
      description:
        "Embrace whatever role you're meant to play in larger events",
      requirements: ["understand special instance", "receive guidance"],
      effects: ["unlock_true_path", "gain_cosmic_purpose", "alter_timeline"],
    },
    question_reality: {
      description: "Challenge the nature of what you're experiencing",
      requirements: ["examine reality_mirror", "view probability_window"],
      effects: [
        "gain_meta_awareness",
        "unlock_hidden_options",
        "transcend_limitations",
      ],
    },
    make_crucial_choice: {
      description: "Decide on the action that will determine your path forward",
      requirements: ["complete all encounters", "understand consequences"],
      effects: ["determine_ending", "lock_timeline", "achieve_resolution"],
    },
  },
};

export default findlaters;
