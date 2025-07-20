// newyorkZone_burgerjoint.ts — rooms/newyorkZone_burgerjoint.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: newyorkZone_burgerjoint

import { RoomDefinition } from '../types/RoomTypes';

const burgerjoint: RoomDefinition = {
  id: 'burgerjoint',
  zone: 'newyorkZone',
  title: '233 Bleecker Street Burger Joint',
  description: [
    'You step into a classic New York burger joint that looks like it\'s been serving the neighborhood for decades. Red vinyl booths line the walls, and the black-and-white checkered floor shows years of faithful service.',
    'The smell of grilling beef and fresh fries fills the air, making your mouth water despite everything else going on. A large grill dominates the open kitchen, where a burly chef works with practiced efficiency.',
    'Behind the counter, menu boards display simple offerings - burgers, fries, sodas, and not much else. This is the kind of place that does one thing and does it perfectly.',
    'The chef looks up as you enter, wiping his hands on his apron. He has the weathered look of someone who\'s seen it all, but his eyes hold a sharpness that suggests there\'s more to this place than meets the eye.',
  ],
  image: 'newyorkZone_burgerjoint.png',
  ambientAudio: 'burger_joint_ambience.mp3',

  consoleIntro: [
    '>> 233 BLEECKER STREET - NEIGHBORHOOD BURGER JOINT',
    '>> Establishment status: OPERATIONAL - Full kitchen service active',
    '>> Chef on duty: EXPERIENCED - Password authentication available',
    '>> Menu: SIMPLE - Burgers, fries, beverages',
    '>> Order requirement: BURGER, FRIES, COKE - Sequence mandatory',
    '>> Password protocol: ACTIVE - "aevira" authentication ready',
    '>> Storeroom access: CONDITIONAL - Chef authorization required',
    '>> Food quality: EXCELLENT - Genuine neighborhood establishment',
    '>> Security level: LOW - Public dining facility',
    '>> Special services: AVAILABLE - Proper authorization needed',
  ],

  exits: {
    east: 'centralpark',
    // Conditional access to storeroom
    storeroom: 'burgerjoint_storeroom',
  },

  items: [
    'burger_menu',
    'napkin_dispenser',
    'salt_and_pepper',
    'hot_sauce_bottles',
  ],

  traps: [
    {
      id: 'kitchen_accident',
      type: 'damage',
      severity: 'minor',
      description: 'You accidentally brush against the hot grill while exploring! The searing metal burns your arm!',
      trigger: 'enter',
      effect: {
        damage: 8
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'kitchen_awareness',
      hidden: false,
    }
  ],

  interactables: {
    'burger_chef': {
      description: 'A experienced chef who takes pride in his burgers. His eyes suggest he knows more than he lets on about certain... arrangements.',
      actions: ['talk', 'place_order', 'give_password'],
      requires: [],
    },
    'kitchen_grill': {
      description: 'A well-maintained commercial grill where the magic happens. The chef works it like a master craftsman.',
      actions: ['examine', 'watch_cooking', 'appreciate_skill'],
      requires: [],
    },
    'menu_board': {
      description: 'Simple black board with white letters: Burgers, Fries, Coke, Coffee. Prices are reasonable and the quality is legendary.',
      actions: ['read', 'study_options', 'decide_order'],
      requires: [],
    },
    'vinyl_booths': {
      description: 'Classic red vinyl booths that have probably heard a thousand conversations over the years.',
      actions: ['sit', 'examine', 'enjoy_atmosphere'],
      requires: [],
    },
    'portal_booth': {
      description: 'One particular booth in the back corner that seems to shimmer slightly. The vinyl looks newer, and sitting here feels different from the other booths.',
      actions: ['sit', 'examine', 'press'],
      requires: [],
    },
    'storeroom_door': {
      description: 'A plain door behind the counter marked "Storage". The chef has offered to let you take a look inside.',
      actions: ['examine', 'request_access', 'enter'],
      requires: ['chef_authorization_received'],
    },
  },

  npcs: [
{
      id: 'burger_chef',
      name: 'Chef Tony',
      description: 'A skilled chef who makes incredible burgers and apparently has connections in interesting places',
      dialogue: {
        greeting: 'Welcome to the best burger joint in the Village. What\'s your order, bud?',
        help: 'You want the works - burger, fries, and a coke. That\'s how we do it here.',
        farewell: 'Come back anytime. And hey, thanks for the... business arrangement.',
        unauthorized: 'What\'s your order, bud? I don\'t know what you\'re talking about.',
        authorized: 'Welcome back! Feel free to check out the storeroom - help yourself to anything useful.',
      },
      spawnable: false,
    }
  ],

  events: {
    onEnter: ['activateChefDialogue', 'displayMenu'],
    onExit: ['recordVisit', 'updateChefStatus'],
    onInteract: {
      burger_chef: ['checkOrderAndPassword', 'processAuthorization'],
      storeroom_door: ['verifyChefPermission', 'grantAccess'],
      menu_board: ['showOrderOptions', 'highlightCorrectOrder'],
    },
  },

  flags: {
    correctOrderPlaced: false,
    passwordGiven: false,
    chefAuthorized: false,
    storeRoomAccess: false,
    albieNotified: false,
    burgersEaten: false,
  },

  quests: {
    main: 'Get Authorization from the Chef',
    optional: [
      'Order Burger, Fries, and Coke',
      'Give the Password "aevira"',
      'Explore the Storeroom',
      'Enjoy the Legendary Burgers',
    ],
  },

  environmental: {
    lighting: 'warm_diner_lighting',
    temperature: 'cozy_kitchen_warmth',
    airQuality: 'delicious_food_aromas',
    soundscape: [
      'grill_sizzling',
      'kitchen_activity',
      'casual_conversation',
      'coffee_brewing',
      'cash_register_sounds'
    ],
    hazards: [],
  },

  security: {
    level: 'low',
    accessRequirements: [],
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
    estimatedPlayTime: '8-12 minutes',
    keyFeatures: [
      'Order and password sequence',
      'Chef Tony authorization',
      'Storeroom access',
      'Excellent burger experience',
      'Warehouse clearance setup',
    ],
  },

  secrets: {
    chef_connections: {
      description: 'The chef\'s relationship with the warehouse operation and other underground services',
      requirements: ['complete authorization sequence', 'gain chef trust'],
      rewards: ['underground_network_knowledge', 'additional_contacts'],
    },
    storeroom_contents: {
      description: 'Useful items the chef allows authorized visitors to take',
      requirements: ['gain storeroom access', 'explore thoroughly'],
      rewards: ['useful_equipment', 'travel_supplies'],
    },
    burger_recipe: {
      description: 'The secret to making the legendary burgers (seriously, they\'re that good)',
      requirements: ['establish rapport with chef', 'watch cooking process'],
      rewards: ['culinary_knowledge', 'chef_respect'],
    },
  },

  customActions: {
    'place_correct_order': {
      description: 'Order burger, fries, and coke as instructed in the note',
      requirements: ['read menu_board'],
      effects: ['satisfy_order_requirement', 'prepare_for_password', 'receive_excellent_food'],
    },
    'give_password_aevira': {
      description: 'Provide the password "aevira" to the chef',
      requirements: ['place_correct_order'],
      effects: ['gain_chef_authorization', 'unlock_storeroom', 'notify_albie_at_warehouse'],
    },
    'explore_storeroom': {
      description: 'Check out what the chef is offering from his storage area',
      requirements: ['chef_authorization_received'],
      effects: ['access_useful_items', 'gain_travel_supplies', 'complete_burger_joint_mission'],
    },
  },
};

export default burgerjoint;
