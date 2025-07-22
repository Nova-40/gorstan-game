import { Puzzle } from './GameTypes';

import { RoomDefinition } from '../types/RoomTypes';



// newyorkZone_aevirawarehouse.ts — rooms/newyorkZone_aevirawarehouse.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: newyorkZone_aevirawarehouse


const aevirawarehouse: RoomDefinition = {
  id: 'aevirawarehouse',
  zone: 'newyorkZone',
  title: 'Aevira Warehouse',
  description: [
    'You stand before an imposing industrial warehouse in a less-traveled part of Manhattan. The building\'s exterior gives nothing away - gray concrete walls, minimal windows, and a single reinforced door marked only with the number "47".',
    'Through the reinforced glass windows, you can glimpse sophisticated equipment inside - high-end printers, laminating machines, and computers that clearly aren\'t being used for legitimate business purposes. This is clearly a sophisticated forgery operation.',
    'A burly security guard named Albie sits behind a desk just inside the entrance, his watchful eyes tracking every movement on the street. He looks like the kind of person who doesn\'t ask questions but demands the right answers.',
    'The air around the building hums with the quiet efficiency of illegal enterprise - a place where any government document or credit card from anywhere in the world can be expertly crafted for the right price and proper authorization.',
  ],
  image: 'aevirawarehouse.png',
  ambientAudio: 'warehouse_security_ambience.mp3',

  consoleIntro: [
    '>> AEVIRA WAREHOUSE - DOCUMENT FORGERY FACILITY',
    '>> Security status: HIGH - Restricted access protocols active',
    '>> Guard on duty: ALBIE - Authorization verification required',
    '>> Access level: CHEF CLEARANCE NEEDED - Burger joint confirmation mandatory',
    '>> Equipment status: OPERATIONAL - Full forgery capabilities online',
    '>> Document types: UNLIMITED - Any government ID or financial card possible',
    '>> WARNING: Unauthorized entry will result in immediate expulsion',
    '>> Current authorization: PENDING - Visit burger joint first',
    '>> Security protocol: "Stay in your lane, stranger"',
    '>> Recommend: Obtain proper clearance before attempting entry',
  ],

  exits: {
    west: 'centralpark',
    // Conditional exits based on access level
  },

  items: [
    // Items only available after gaining access
  ],

  interactables: {
    'security_guard_albie': {
      description: 'A professional security guard who takes his job seriously. Albie looks like he\'s seen everything and trusts nothing without proper verification.',
      actions: ['talk', 'show_credentials', 'request_entry'],
      requires: [],
    },
    'reinforced_door': {
      description: 'A heavy steel door with multiple locks and a small reinforced window. It\'s clearly designed to keep unauthorized people out.',
      actions: ['examine', 'try_to_open', 'knock'],
      requires: [],
    },
    'warehouse_windows': {
      description: 'Reinforced glass windows that offer limited glimpses of the sophisticated forgery equipment inside.',
      actions: ['examine', 'peer_through', 'observe_equipment'],
      requires: [],
    },
    'forgery_equipment': {
      description: 'Visible through the windows: state-of-the-art printers, laminators, computers, and specialized tools for document creation.',
      actions: ['observe', 'assess_capabilities', 'recognize_equipment'],
      requires: [],
    },
    // Additional interactables when access is granted
    'briefcase_puzzle': {
      description: 'A sophisticated briefcase with an intricate locking mechanism. Inside, you can see the outline of something valuable.',
      actions: ['examine', 'attempt_combination', 'solve_puzzle', 'open'],
      requires: ['warehouse_access_granted'],
    },
    'document_printers': {
      description: 'Professional-grade equipment capable of producing any government document with perfect authenticity.',
      actions: ['examine', 'operate', 'test_capabilities'],
      requires: ['warehouse_access_granted'],
    },
    'laminating_station': {
      description: 'High-end laminating equipment for creating authentic-looking ID cards and official documents.',
      actions: ['examine', 'use', 'test_quality'],
      requires: ['warehouse_access_granted'],
    },
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ['checkAuthorization', 'activateAlbieSecurity'],
    onExit: ['logAccess', 'updateSecurityStatus'],
    onInteract: {
      security_guard_albie: ['verifyChefClearance', 'checkBurgerJointVisit'],
      briefcase_puzzle: ['initiatePuzzleSequence', 'checkSolution'],
      reinforced_door: ['denyUnauthorizedAccess', 'allowAuthorizedEntry'],
    },
  },

  flags: {
    chefClearanceReceived: false,
    burgerJointVisited: false,
    albieNotified: false,
    warehouseAccessGranted: false,
    briefcaseOpened: false,
    medallionObtained: false,
    puzzleSolved: false,
  },

  quests: {
    main: 'Gain Access to the Warehouse',
    optional: [
      'Talk to Albie About Entry Requirements',
      'Obtain Chef Clearance from Burger Joint',
      'Solve the Briefcase Puzzle',
      'Retrieve the Medallion',
    ],
  },

  environmental: {
    lighting: 'industrial_warehouse_lighting',
    temperature: 'cool_urban_air',
    airQuality: 'slightly_chemical_scented',
    soundscape: [
      'distant_traffic_sounds',
      'equipment_humming_inside',
      'security_radio_chatter',
      'urban_ambient_noise',
      'warehouse_ventilation'
    ],
    hazards: ['security_expulsion_risk', 'unauthorized_access_consequences'],
  },

  security: {
    level: 'high',
    accessRequirements: ['chef_authorization', 'burger_joint_clearance'],
    alarmTriggers: ['forced_entry_attempt', 'unauthorized_access'],
    surveillanceActive: true,
    surveillanceType: 'professional_security_guard',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Document forgery operation',
      'Security guard Albie',
      'Chef clearance requirement',
      'Briefcase puzzle challenge',
      'Medallion acquisition',
    ],
  },

  secrets: {
    briefcase_combination: {
      description: 'The correct sequence to open the briefcase and obtain the medallion',
      requirements: ['examine briefcase thoroughly', 'solve integrated puzzle'],
      rewards: ['medallion_access', 'manhattan_hub_entry_token'],
    },
    warehouse_operations: {
      description: 'The full scope of the forgery operation and its capabilities',
      requirements: ['gain warehouse access', 'examine all equipment'],
      rewards: ['forgery_knowledge', 'document_creation_understanding'],
    },
    albie_background: {
      description: 'Information about the security guard and his role in the operation',
      requirements: ['establish rapport with albie', 'demonstrate authorization'],
      rewards: ['security_insight', 'operational_knowledge'],
    },
  },

  customActions: {
    'show_chef_authorization': {
      description: 'Present proof that the chef has cleared you for warehouse access',
      requirements: ['chef_clearance_received', 'burger_joint_visited'],
      effects: ['gain_warehouse_access', 'activate_albie_cooperation', 'unlock_interior'],
    },
    'solve_briefcase_puzzle': {
      description: 'Work through the complex locking mechanism to open the briefcase',
      requirements: ['warehouse_access_granted', 'examine briefcase_puzzle'],
      effects: ['obtain_medallion', 'unlock_manhattan_hub_access', 'complete_warehouse_objective'],
    },
    'attempt_unauthorized_entry': {
      description: 'Try to enter without proper clearance',
      requirements: [],
      effects: ['trigger_albie_expulsion', 'return_to_central_park', 'receive_warning'],
    },
  },
};

export default aevirawarehouse;
