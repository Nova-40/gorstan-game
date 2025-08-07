// src/rooms/newyorkZone_greasystoreroom.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const greasystoreroom: Room = {
  id: 'greasystoreroom',
  zone: 'newyorkZone',
  title: 'Burger Joint Storeroom',
  description: [
    'You step into a cramped storeroom behind the burger joint kitchen. The air is thick with the lingering aromas of cooking oil and spices, and everything seems to have a subtle sheen of grease.',
    'Industrial shelving lines the walls, holding restaurant supplies, boxes of napkins, and various kitchen equipment. The concrete floor is stained from years of food service operations.',
    'Despite the greasy atmosphere, Chef Tony clearly keeps this space organized and functional. He\'s made it clear that anything here is yours to take if you need it.',
    'Your eye is drawn to several items scattered on the floor near the back - they seem oddly out of place in a restaurant storage room.',
  ],
  image: 'newyorkZone_storeroom.png',
  ambientAudio: 'storeroom_ambience.mp3',

  consoleIntro: [
    '>> BURGER JOINT STOREROOM - STORAGE AND SUPPLY AREA',
    '>> Access granted: CHEF AUTHORIZATION - Full access privileges',
    '>> Inventory status: AVAILABLE - Take what you need',
    '>> Cleanliness level: FUNCTIONAL - Greasy but organized',
    '>> Valuable items detected: UNUSUAL MATERIALS - Scientific documentation found',
    '>> Currency detected: GOLD COIN - High value item present',
    '>> Power sources: BATTERIES - Electronic equipment compatible',
    '>> Chef policy: GENEROUS - "Help yourself to anything useful"',
    '>> Storage capacity: ADEQUATE - Restaurant supply storage',
    '>> Exit: KITCHEN ACCESS - Return to main restaurant area',
  ],

  exits: {
    north: 'burgerjoint',
  },

  items: [
    'greasy_napkin_with_plans',
    'batteries',
    'gold_coin',
    'restaurant_supplies',
    'cooking_oil_containers',
    'spare_napkins',
    'kitchen_equipment',
  ],

  interactables: {
    'greasy_napkin_with_plans': {
      description: 'A used napkin that looks disgusting at first glance, but when you turn it over, you discover intricate quantum physics diagrams and equations written in precise handwriting.',
      actions: ['examine', 'pick_up', 'study_diagrams', 'clean_carefully'],
      requires: [],
    },
    'batteries': {
      description: 'A pack of high-quality alkaline batteries, still in their packaging. These could power various electronic devices.',
      actions: ['examine', 'pick_up', 'test_power_level'],
      requires: [],
    },
    'gold_coin': {
      description: 'A genuine gold coin that gleams despite the greasy environment. It\'s clearly valuable and completely out of place in a burger joint storeroom.',
      actions: ['examine', 'pick_up', 'assess_value', 'study_markings'],
      requires: [],
    },
    'restaurant_supplies': {
      description: 'Standard restaurant equipment and supplies - nothing extraordinary, but Chef Tony said to help yourself.',
      actions: ['examine', 'browse', 'take_what_needed'],
      requires: [],
    },
    'industrial_shelving': {
      description: 'Heavy-duty metal shelving units holding various restaurant supplies and equipment.',
      actions: ['examine', 'search_shelves', 'organize'],
      requires: [],
    },
    'greasy_surfaces': {
      description: 'Everything in here has that characteristic restaurant kitchen coating of cooking oils and food residue.',
      actions: ['examine', 'clean_hands', 'accept_greasiness'],
      requires: [],
    },
  },

  npcs: ['chef_tony_storeroom'],

  events: {
    onEnter: ['assessAvailableItems', 'activateChefGenerosity', 'spawnChefIfAuthorized'],
    onExit: ['recordItemsTaken', 'thankChef'],
    onInteract: {
      greasy_napkin_with_plans: ['revealQuantumDiagrams', 'recognizeLibrarianValue'],
      gold_coin: ['assessSignificantValue', 'wonderAboutOrigin'],
      batteries: ['confirmPowerSource', 'identifyUsefulness'],
      chef_tony_storeroom: ['receiveEncouragement', 'learnAboutItems', 'appreciateGenerosity'],
    },
  },

  flags: {
    napkinExamined: false,
    quantumPlansRevealed: false,
    batteriesTaken: false,
    goldCoinTaken: false,
    librarianGiftIdentified: false,
    storeRoomExplored: false,
  },

  quests: {
    main: 'Explore What the Chef is Offering',
    optional: [
      'Examine the Mysterious Napkin',
      'Collect the Valuable Items',
      'Understand the Quantum Plans',
      'Appreciate Chef Tony\'s Generosity',
    ],
  },

  environmental: {
    lighting: 'dim_storeroom_fluorescents',
    temperature: 'warm_from_kitchen_heat',
    airQuality: 'greasy_cooking_aromas',
    soundscape: [
      'kitchen_sounds_through_door',
      'ventilation_humming',
      'restaurant_ambience_distant',
      'storage_room_quiet',
      'occasional_shelf_creaking'
    ],
    hazards: ['slippery_greasy_floors'],
  },

  security: {
    level: 'low',
    accessRequirements: ['chef_authorization'],
    alarmTriggers: [],
    surveillanceActive: false,
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'easy',
    estimatedPlayTime: '3-5 minutes',
    keyFeatures: [
      'Valuable disguised napkin',
      'Quantum physics plans',
      'Gold coin treasure',
      'Useful batteries',
      'Chef\'s generous policy',
    ],
  },

  secrets: {
    quantum_plans_significance: {
      description: 'The true value and application of the quantum diagrams on the napkin',
      requirements: ['study quantum diagrams thoroughly', 'understand scientific notation'],
      rewards: ['quantum_physics_knowledge', 'librarian_quest_item'],
    },
    gold_coin_origin: {
      description: 'How a valuable gold coin ended up in a burger joint storeroom',
      requirements: ['examine gold coin thoroughly', 'study markings'],
      rewards: ['coin_history_knowledge', 'value_assessment'],
    },
    chef_connections: {
      description: 'Why Chef Tony has such unusual and valuable items in his storeroom',
      requirements: ['explore thoroughly', 'appreciate generosity'],
      rewards: ['underground_network_understanding', 'chef_background_knowledge'],
    },
  },

  customActions: {
    'study_quantum_napkin': {
      description: 'Carefully examine the quantum physics diagrams despite the napkin\'s greasy condition',
      requirements: ['pick up greasy_napkin_with_plans'],
      effects: ['understand_librarian_value', 'gain_quantum_knowledge', 'identify_scientific_breakthrough'],
    },
    'collect_valuable_items': {
      description: 'Gather the gold coin, batteries, and quantum napkin',
      requirements: ['chef_authorization'],
      effects: ['gain_valuable_resources', 'prepare_for_future_challenges', 'appreciate_chef_generosity'],
    },
    'thank_chef_mentally': {
      description: 'Appreciate Chef Tony\'s incredible generosity in letting you take these valuable items',
      requirements: ['examine all valuable items'],
      effects: ['gain_gratitude', 'understand_network_value', 'strengthen_chef_relationship'],
    },
  },
};

export default greasystoreroom;


